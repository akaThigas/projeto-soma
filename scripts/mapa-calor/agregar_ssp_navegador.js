/*
 * Agregação da base "Violência Contra a Mulher" da SSP-SP para o relatório por área.
 *
 * O arquivo da SSP tem ~309 MB (xlsx) e ~2,3 GB de planilha descompactada,
 * com uma linha por vítima e natureza criminal, incluindo endereço, coordenadas
 * e dados pessoais. Para não baixar nem guardar esses dados, este script roda
 * no console do navegador, na página
 *   https://www.ssp.sp.gov.br/estatistica/violencia-contra-a-mulher
 * lê o xlsx em partes (HTTP Range), descompacta em fluxo e guarda apenas
 * contagens. No fim, baixa um JSON só com os números agregados
 * (scripts/mapa-calor/dados/ssp_violencia_mulher_capital_agregado.json).
 *
 * Regra (a mesma do painel da SSP, conferida mês a mês):
 *   - capital = NOME_MUNICIPIO_CIRC === 'S.PAULO' (município do local do fato);
 *   - casos   = linhas por NATUREZA_APURADA;
 *   - vítimas = pessoas únicas (ID_DELEGACIA + ANO_BO + NUM_BO + CONT_PESSOA) por ano;
 *   - ano/mês = ANO_ESTATISTICA / MES_ESTATISTICA;
 *   - área    = número do DP em NOME_DELEGACIA_CIRC ("47º D.P. ..."); delegacias
 *               especializadas sem área própria (DDM, online etc.) ficam em semArea.
 */
(async () => {
  const U =
    'https://www.ssp.sp.gov.br/assets/estatistica/vitimas-violencia-domestica/Base_Viol%C3%AAncia%20contra%20mulher.xlsx';

  const head = await fetch(U, { method: 'HEAD' });
  const size = Number(head.headers.get('content-length'));

  // 1. Diretório do zip (fim do arquivo)
  const tail = new Uint8Array(
    await (await fetch(U, { headers: { Range: `bytes=${size - 65536}-${size - 1}` } })).arrayBuffer()
  );
  let e = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (tail[i] === 0x50 && tail[i + 1] === 0x4b && tail[i + 2] === 5 && tail[i + 3] === 6) { e = i; break; }
  }
  const tv = new DataView(tail.buffer);
  const cdSize = tv.getUint32(e + 12, true);
  const cdOff = tv.getUint32(e + 16, true);
  const c = new Uint8Array(
    await (await fetch(U, { headers: { Range: `bytes=${cdOff}-${cdOff + cdSize - 1}` } })).arrayBuffer()
  );
  const cv = new DataView(c.buffer);
  const ents = [];
  for (let p = 0; p < c.length; ) {
    const nl = cv.getUint16(p + 28, true), xl = cv.getUint16(p + 30, true), cl = cv.getUint16(p + 32, true);
    ents.push({ name: new TextDecoder().decode(c.slice(p + 46, p + 46 + nl)), comp: cv.getUint32(p + 20, true), off: cv.getUint32(p + 42, true) });
    p += 46 + nl + xl + cl;
  }
  async function stream(name) {
    const en = ents.find((x) => x.name === name);
    const h = new Uint8Array(await (await fetch(U, { headers: { Range: `bytes=${en.off}-${en.off + 29}` } })).arrayBuffer());
    const hv = new DataView(h.buffer);
    const start = en.off + 30 + hv.getUint16(26, true) + hv.getUint16(28, true);
    const resp = await fetch(U, { headers: { Range: `bytes=${start}-${start + en.comp - 1}` } });
    return resp.body.pipeThrough(new DecompressionStream('deflate-raw')).pipeThrough(new TextDecoderStream()).getReader();
  }

  // 2. Textos compartilhados
  let s = '';
  const r1 = await stream('xl/sharedStrings.xml');
  for (;;) { const { value, done } = await r1.read(); if (done) break; s += value; }
  const sis = [...new DOMParser().parseFromString(s, 'application/xml').getElementsByTagName('si')].map((x) => x.textContent);

  // 3. Planilha BASE_VD (sheet2), linha a linha
  const cellRe = /<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>(?:<v>([^<]*)<\/v>|<is><t[^>]*>([^<]*)<\/t><\/is>)?<\/c>)/g;
  const parse = (rx) => {
    const out = {};
    cellRe.lastIndex = 0;
    let m;
    while ((m = cellRe.exec(rx))) {
      let v = m[3] ?? m[4];
      if (v === undefined) continue;
      if (/t="s"/.test(m[2])) v = sis[+v];
      out[m[1]] = v;
    }
    return out;
  };
  const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const sub = (o, k) => o[k] || (o[k] = {});

  let col = null, linhas = 0, linhasCapital = 0;
  const cidadeMesNat = {}, cidadeAnoVitimas = {}, dp = {}, semArea = {}, sexo = {};
  const pCid = new Set(), pDp = new Set();

  function processa(rx) {
    const r = parse(rx);
    if (!col) { col = {}; for (const [k, v] of Object.entries(r)) col[v] = k; return; }
    linhas++;
    const g = (f) => r[col[f]];
    if (g('NOME_MUNICIPIO_CIRC') !== 'S.PAULO') return;
    linhasCapital++;
    inc(sexo, g('SEXO_PESSOA'));
    const nat = g('NATUREZA_APURADA');
    const ano = g('ANO_ESTATISTICA');
    const am = ano + '-' + String(g('MES_ESTATISTICA')).padStart(2, '0');
    inc(sub(cidadeMesNat, am), nat);
    const pessoa = g('ID_DELEGACIA') + '|' + g('ANO_BO') + '|' + g('NUM_BO') + '|' + g('CONT_PESSOA');
    if (!pCid.has(pessoa + '|' + ano)) { pCid.add(pessoa + '|' + ano); inc(cidadeAnoVitimas, ano); }
    const nome = g('NOME_DELEGACIA_CIRC');
    const m = /^(\d+)º\s*(D\.P\.|DP)/.exec(nome);
    if (!m) { inc(sub(semArea, nome), ano); return; }
    const n = String(parseInt(m[1], 10));
    const d = dp[n] || (dp[n] = { nome, anoNat: {}, anoVitimas: {} });
    inc(sub(d.anoNat, ano), nat);
    if (!pDp.has(pessoa + '|' + ano + '|' + n)) { pDp.add(pessoa + '|' + ano + '|' + n); inc(d.anoVitimas, ano); }
  }

  const rd = await stream('xl/worksheets/sheet2.xml');
  let buf = '';
  for (;;) {
    const { value, done } = await rd.read();
    if (done) break;
    buf += value;
    let i, start = 0;
    while ((i = buf.indexOf('</row>', start)) !== -1) {
      const a = buf.indexOf('<row ', start);
      if (a !== -1 && a < i) processa(buf.slice(a, i));
      start = i + 6;
    }
    buf = buf.slice(start);
  }

  const saida = {
    fonte: 'SSP-SP, Base de dados Violência Contra a Mulher (dados a partir de 2024), aba BASE_VD',
    url: U,
    arquivoModificado: head.headers.get('last-modified'),
    processadoEm: new Date().toISOString(),
    linhasBase: linhas,
    linhasCapital,
    cidadeMesNat,
    cidadeAnoVitimas,
    sexo,
    dp,
    semArea,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(saida)], { type: 'application/json' }));
  a.download = 'ssp_violencia_mulher_capital_agregado.json';
  document.body.appendChild(a);
  a.click();
  console.log('pronto', linhas, linhasCapital);
})();
