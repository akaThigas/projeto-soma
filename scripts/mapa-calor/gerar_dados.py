"""
Gera os dados do mapa de calor (feminicídios por município de SP, 2019-2023).

Uso:
    python3 gerar_dados.py MALHA.json sysdata.rda popBR2000-2025.long.csv saida.json

Entradas (ver README.md desta pasta):
    MALHA      malha municipal de SP já simplificada (GeoJSON)
    SINESP     R/sysdata.rda do pacote BrazilCrime 0.2.1 (Sinesp VDE)
    POPULACAO  popBR2000-2025.long.csv (github.com/lsbastos/popBR_mun)

A saída (JSON) é convertida nos arquivos src/data/mapaCalor/*.ts.
Dependências: pip install pyreadr pandas
"""
import sys
MALHA, SINESP, POPULACAO, SAIDA = sys.argv[1:5]
import json, math, unicodedata, pyreadr, pandas as pd
def norm(s): return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().upper().replace("'"," ").replace('-',' ').replace('  ',' ').strip()
g=json.load(open(MALHA))
def polys_of(geo):
    return geo['coordinates'] if geo['type']=='MultiPolygon' else [geo['coordinates']]
pts=[p for f in g['features'] for poly in polys_of(f['geometry']) for r in poly for p in r]
minLon=min(p[0] for p in pts);maxLon=max(p[0] for p in pts);minLat=min(p[1] for p in pts);maxLat=max(p[1] for p in pts)
k=math.cos(math.radians((minLat+maxLat)/2)); W=1000; s=W/((maxLon-minLon)*k); H=round((maxLat-minLat)*s,1)
def P(pt): return ((pt[0]-minLon)*k*s, (maxLat-pt[1])*s)
def ring(r):
    out=[];prev=None
    for x,y in map(P,r):
        t=(round(x,1),round(y,1))
        if t!=prev: out.append(t);prev=t
    if len(out)<3: return ''
    return 'M'+'L'.join(f'{x:g} {y:g}' for x,y in out)+'Z'
feats=[]
for f in g['features']:
    rs=[r for poly in polys_of(f['geometry']) for r in poly]
    d=''.join(ring(r) for r in rs); assert d, f['properties']
    xy=[P(p) for r in rs for p in r]
    feats.append(dict(id=f['properties']['id'],nome=f['properties']['name'],d=d,
        bbox=[round(min(a for a,b in xy),1),round(min(b for a,b in xy),1),round(max(a for a,b in xy),1),round(max(b for a,b in xy),1)]))
alias={'EMBU DAS ARTES':'EMBU','FLORINEA':'FLORINIA','MOGI MIRIM':'MOJI MIRIM','SAO LUIZ DO PARAITINGA':'SAO LUIS DO PARAITINGA'}
d=pyreadr.read_r(SINESP)['sinesp_vde_data']
sp=d[(d.uf=='SP')&(d.evento.isin(['Feminicídio','Estupro']))].copy()
sp['n']=sp.municipio.map(lambda m: alias.get(norm(m),norm(m)))
est=sp[(sp.evento=='Estupro')&(sp.ano==2023)]
fem=sp[(sp.evento=='Feminicídio')&(sp.ano.between(2019,2023))]
estM=est.groupby('n').feminino.sum(); femM=fem.groupby('n').total_vitimas.sum()
names={norm(x['nome']) for x in feats}
assert set(estM.index)-names=={'NAO INFORMADO'}, set(estM.index)-names
p=pd.read_csv(POPULACAO); p=p[p.MUNCOD//10000==35]
pop23=p[p.Ano==2023].set_index('MUNCOD').POP; pop5=p[p.Ano.between(2019,2023)].groupby('MUNCOD').POP.sum()
rows=[]
for x in feats:
    nn=norm(x['nome']); c6=int(x['id'][:6])
    e=int(estM.get(nn,0)); fm=int(femM.get(nn,0)); pp=int(pop23[c6]); p5=int(pop5[c6])
    rows.append(dict(id=x['id'],nome=x['nome'],populacao=pp,estupro=e,taxaEstupro=round(e/pp*1e5,1),feminicidio=fm,taxaFeminicidio=round(fm/p5*1e5,2)))
meta=dict(W=W,H=H,
  estuproTotal=int(est.feminino.sum()), estuproSemMunicipio=int(est[est.n=='NAO INFORMADO'].feminino.sum()),
  feminicidioTotal=int(fem.total_vitimas.sum()), feminicidioSemMunicipio=int(fem[fem.n=='NAO INFORMADO'].total_vitimas.sum()),
  feminicidioPorAno={int(k):int(v) for k,v in fem.groupby('ano').total_vitimas.sum().items()})
json.dump(dict(meta=meta,feats=feats,rows=rows),open(SAIDA,'w'),ensure_ascii=False)
df=pd.DataFrame(rows); print(meta); print('soma mapa', df.estupro.sum(), df.feminicidio.sum())
print('zeros', (df.estupro==0).sum(), (df.feminicidio==0).sum(), 'path chars', sum(len(x['d']) for x in feats))
print(df.sort_values('taxaEstupro',ascending=False).head(6)[['nome','populacao','estupro','taxaEstupro']].to_string())
print(df[df.nome.isin(['São Paulo','Campinas','Santos','Ribeirão Preto'])].to_string())
