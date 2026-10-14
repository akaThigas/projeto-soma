import { useCallback, useMemo } from 'react';

import {
  delegaciasSP,
  MAPA_DELEGACIAS_ALTURA,
  MAPA_DELEGACIAS_LARGURA,
} from '../data/mapaCalor/delegaciasSP';
import { distritoParaDelegacia } from '../data/mapaCalor/distritoParaDelegacia';
import { distritosSP } from '../data/mapaCalor/distritosSP';
import { servicosMulherSP } from '../data/mapaCalor/servicosMulherSP';
import {
  AnoDados,
  FONTE_DELEGACIAS,
  IndicadorDelegacia,
  violenciaDelegacias,
} from '../data/mapaCalor/violenciaDelegacias';
import { CORES_MAPA, FaixaLegenda } from './MapaCalorSP';
import { MapaInterativo, vistaDaForma, vistaInteira } from './MapaInterativo';

/**
 * Mapa das 93 áreas de delegacia (DP) da cidade de São Paulo,
 * colorido pelo número de mulheres vítimas no último ano completo.
 */

const ANO_MAPA: AnoDados = FONTE_DELEGACIAS.anoCompleto;
const MEDIA = FONTE_DELEGACIAS.mediaVitimas2025;

/** Faixas de vítimas por ano; o terceiro limite é a média das áreas. */
const LIMITES = [250, 400, MEDIA, 800];

const numero = (valor: number, casas = 0) =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

export function faixaDaDelegacia(vitimas: number): number {
  const posicao = LIMITES.findIndex((limite) => vitimas <= limite);
  return posicao === -1 ? LIMITES.length : posicao;
}

export function legendaDelegacias(): FaixaLegenda[] {
  const [a, b, media, d] = LIMITES;
  return [
    { cor: CORES_MAPA[0], rotulo: `Até ${numero(a)}` },
    { cor: CORES_MAPA[1], rotulo: `${numero(a)} a ${numero(b)}` },
    {
      cor: CORES_MAPA[2],
      rotulo: `${numero(b)} a ${numero(media, 1)} (média das áreas)`,
    },
    { cor: CORES_MAPA[3], rotulo: `${numero(media, 1)} a ${numero(d)}` },
    { cor: CORES_MAPA[4], rotulo: `Acima de ${numero(d)}` },
  ];
}

const indicadorPorId = new Map(violenciaDelegacias.map((d) => [d.id, d]));
const formaPorId = new Map(delegaciasSP.map((d) => [d.id, d]));

const posicaoPorId = new Map(
  [...violenciaDelegacias]
    .sort((a, b) => b.vitimas[ANO_MAPA] - a.vitimas[ANO_MAPA])
    .map((d, indice) => [d.id, indice + 1])
);

export function dadosDaDelegacia(id: string) {
  const forma = formaPorId.get(id);
  const indicador = indicadorPorId.get(id);
  if (!forma || !indicador) return undefined;
  return {
    forma,
    indicador: indicador as IndicadorDelegacia,
    posicao: posicaoPorId.get(id) ?? 0,
  };
}

/* ---------------- busca ---------------- */

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export type ResultadoBusca = {
  chave: string;
  dp: string;
  titulo: string;
  detalhe: string;
};

/**
 * Busca por nome da área de delegacia, número do DP ou nome do distrito.
 * Um distrito aponta para a área de delegacia que cobre a maior parte dele.
 */
export function buscarArea(busca: string): ResultadoBusca[] {
  const termo = semAcento(busca.trim());
  if (termo.length < 2) return [];

  const resultados: (ResultadoBusca & { ordem: number })[] = [];
  const numeroBuscado = termo.replace(/[^0-9]/g, '');

  for (const dp of delegaciasSP) {
    const nome = semAcento(dp.bairro);
    const casaNumero = numeroBuscado !== '' && numeroBuscado === dp.id;
    if (nome.includes(termo) || casaNumero) {
      resultados.push({
        chave: `dp-${dp.id}`,
        dp: dp.id,
        titulo: dp.nome,
        detalhe: 'Área de delegacia',
        ordem: nome.startsWith(termo) || casaNumero ? 0 : 1,
      });
    }
  }

  for (const distrito of distritosSP) {
    const nome = semAcento(distrito.nome);
    if (!nome.includes(termo)) continue;
    const areas = distritoParaDelegacia[distrito.id] ?? [];
    const principal = areas[0];
    if (!principal) continue;
    const forma = formaPorId.get(principal.dp);
    const outras = areas.length - 1;
    resultados.push({
      chave: `distrito-${distrito.id}`,
      dp: principal.dp,
      titulo: `Distrito ${distrito.nome}`,
      detalhe:
        `${Math.round(principal.parte * 100)}% na área do ${forma?.nome ?? principal.dp + 'º DP'}` +
        (outras > 0 ? ` (e mais ${outras} área${outras > 1 ? 's' : ''})` : ''),
      ordem: nome.startsWith(termo) ? 0 : 1,
    });
  }

  return resultados
    .sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo))
    .slice(0, 8);
}

/** Distritos que têm parte do território numa área de delegacia. */
export function distritosDaArea(dp: string) {
  return distritosSP
    .map((d) => ({
      nome: d.nome,
      parte: (distritoParaDelegacia[d.id] ?? []).find((p) => p.dp === dp)?.parte ?? 0,
    }))
    .filter((d) => d.parte > 0)
    .sort((a, b) => b.parte - a.parte);
}

/* ---------------- serviços ---------------- */

function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

/** Serviços ordenados pela distância (em linha reta) ao centro da área. */
export function servicosProximos(dp: string, quantidade = 3) {
  const forma = formaPorId.get(dp);
  if (!forma) return [];
  return servicosMulherSP
    .filter((s) => s.lat !== null && s.lon !== null)
    // a Casa da Mulher Brasileira e a 1ª DDM ficam no mesmo endereço
    .filter((s) => s.id !== 'ddm1')
    .map((s) => ({
      ...s,
      km: distanciaKm(forma.lat, forma.lon, s.lat as number, s.lon as number),
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, quantidade);
}

/* ---------------- componente ---------------- */

export type EnquadramentoDelegacias =
  | { tipo: 'cidade' }
  | { tipo: 'area'; id: string };

type Props = {
  enquadramento: EnquadramentoDelegacias;
  selecionadoId?: string;
  onSelect: (id: string) => void;
};

export function MapaCalorDelegacias({
  enquadramento,
  selecionadoId,
  onSelect,
}: Props) {
  const vista = useMemo(() => {
    if (enquadramento.tipo === 'cidade') {
      return vistaInteira(MAPA_DELEGACIAS_LARGURA);
    }
    const alvo = formaPorId.get(enquadramento.id);
    if (!alvo) return vistaInteira(MAPA_DELEGACIAS_LARGURA);
    return vistaDaForma(
      alvo,
      MAPA_DELEGACIAS_LARGURA,
      MAPA_DELEGACIAS_ALTURA,
      2.6,
      90
    );
  }, [enquadramento]);

  const corDe = useCallback((id: string) => {
    const indicador = indicadorPorId.get(id);
    return CORES_MAPA[
      indicador ? faixaDaDelegacia(indicador.vitimas[ANO_MAPA]) : 0
    ];
  }, []);

  const valorDe = useCallback((id: string) => {
    const indicador = indicadorPorId.get(id);
    if (!indicador) return 'Sem dado';
    return `${numero(indicador.vitimas[ANO_MAPA])} vítimas em ${ANO_MAPA}`;
  }, []);

  return (
    <MapaInterativo
      formas={delegaciasSP}
      larguraMapa={MAPA_DELEGACIAS_LARGURA}
      alturaMapa={MAPA_DELEGACIAS_ALTURA}
      corDe={corDe}
      chaveCores="delegacias"
      valorDe={valorDe}
      vista={vista}
      selecionadoId={selecionadoId}
      onSelect={onSelect}
      descricao="Mapa das áreas de delegacia da cidade de São Paulo. Use a busca para consultar um bairro, distrito ou delegacia."
      zoomMaximo={8}
    />
  );
}
