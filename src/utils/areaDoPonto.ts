import {
  delegaciasSP,
  PROJECAO_CAPITAL,
} from '../data/mapaCalor/delegaciasSP';

/**
 * Descobre em qual área de delegacia fica um ponto (latitude/longitude).
 *
 * Tudo é calculado no próprio aparelho, com os contornos que já vêm no app:
 * a coordenada não é enviada a nenhum serviço nem guardada.
 */

type Anel = [number, number][];

type AreaPreparada = {
  id: string;
  bbox: [number, number, number, number];
  aneis: Anel[];
};

let preparadas: AreaPreparada[] | null = null;

/** Converte o caminho SVG ("M x y L x y ... Z") em anéis de pontos. */
function aneisDoCaminho(d: string): Anel[] {
  const aneis: Anel[] = [];
  for (const parte of d.split('M')) {
    const texto = parte.replace('Z', '').trim();
    if (!texto) continue;
    const anel: Anel = texto.split('L').map((par) => {
      const [x, y] = par.trim().split(/\s+/).map(Number);
      return [x, y];
    });
    if (anel.length >= 3) aneis.push(anel);
  }
  return aneis;
}

function preparar(): AreaPreparada[] {
  if (!preparadas) {
    preparadas = delegaciasSP.map((area) => ({
      id: area.id,
      bbox: area.bbox,
      aneis: aneisDoCaminho(area.d),
    }));
  }
  return preparadas;
}

/** Regra par-ímpar: considera os buracos dos contornos. */
function dentro(x: number, y: number, aneis: Anel[]) {
  let resultado = false;
  for (const anel of aneis) {
    for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
      const [xi, yi] = anel[i];
      const [xj, yj] = anel[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        resultado = !resultado;
      }
    }
  }
  return resultado;
}

export function projetar(lat: number, lon: number) {
  const { lon0, lat1, kx, ky } = PROJECAO_CAPITAL;
  return { x: (lon - lon0) * kx, y: (lat1 - lat) * ky };
}

/** Número da área de delegacia que contém o ponto, ou null se estiver fora da cidade. */
export function areaDoPonto(lat: number, lon: number): string | null {
  const { x, y } = projetar(lat, lon);
  for (const area of preparar()) {
    const [x0, y0, x1, y1] = area.bbox;
    // a caixa vem arredondada em 0,1: folga para não perder pontos na borda
    if (x < x0 - 0.2 || x > x1 + 0.2 || y < y0 - 0.2 || y > y1 + 0.2) continue;
    if (dentro(x, y, area.aneis)) return area.id;
  }
  return null;
}
