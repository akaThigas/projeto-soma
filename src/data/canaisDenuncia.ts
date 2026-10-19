import { Ionicons } from '@expo/vector-icons';

export type CanalDenuncia = {
  id: string;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  tipoAcao: 'telefone' | 'url' | 'rota';
  destino: string;
};

export const canaisDenuncia: CanalDenuncia[] = [
  {
    id: '180',
    titulo: 'Ligue 180',
    descricao: 'Central de Atendimento à Mulher — 24 horas e gratuito.',
    icone: 'call-outline',
    cor: '#3D1E45',
    tipoAcao: 'telefone',
    destino: '180',
  },
  {
    id: '190',
    titulo: 'Disque 190',
    descricao: 'Emergência e situações de risco iminente.',
    icone: 'warning-outline',
    cor: '#3C6978',
    tipoAcao: 'telefone',
    destino: '190',
  },
  {
    id: 'delegacia',
    titulo: 'Mapa de São Paulo',
    descricao: 'Encontre delegacias, casas da mulher, hospitais e defensorias.',
    icone: 'location-outline',
    cor: '#C9829C',
    tipoAcao: 'rota',
    destino: '/mapa',
  },
  {
    id: 'web-denuncia',
    titulo: 'Web Denúncia',
    descricao: 'Canal online para denúncia anônima no Estado de São Paulo.',
    icone: 'globe-outline',
    cor: '#BBA8CC',
    tipoAcao: 'url',
    destino: 'https://www.webdenuncia.sp.gov.br/',
  },
];