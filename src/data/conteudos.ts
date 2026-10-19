import { Ionicons } from '@expo/vector-icons';

/**
 * Conteúdos educativos do SOMA.
 *
 * Os textos sobre direitos e procedimentos foram escritos a partir de fontes
 * oficiais (veja `fontes` de cada conteúdo), consultadas em outubro de 2026.
 * Os procedimentos podem variar conforme a localidade; antes de publicar uma
 * mudança, confira de novo a fonte e peça a validação do orientador.
 */

export type BlocoConteudo =
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'lista'; itens: string[] };

export type FonteConteudo = {
  rotulo: string;
  url: string;
};

export type ConteudoEducativo = {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  icone: keyof typeof Ionicons.glyphMap;
  blocos: BlocoConteudo[];
  fontes: FonteConteudo[];
};

const FONTE_FAQ_MARIA_DA_PENHA: FonteConteudo = {
  rotulo:
    'Agência Gov (Ministério das Mulheres) — FAQ Lei Maria da Penha: 25 respostas às perguntas mais frequentes, 02/09/2026',
  url: 'https://agenciagov.ebc.com.br/noticias/202609/faq-lei-maria-da-penha-25-perguntas-e-respostas-para-as-duvidas-mais-frequentes',
};

const FONTE_ONDE_BUSCAR_AJUDA: FonteConteudo = {
  rotulo:
    'Agência Gov (Ministério das Mulheres) — Saiba onde buscar ajuda em casos de violência doméstica e familiar, 07/08/2026',
  url: 'https://agenciagov.ebc.com.br/noticias/202608/especial-lei-maria-da-penha-saiba-onde-buscar-ajuda-em-casos-de-violencia-domestica-e-familiar-contra-mulheres',
};

const FONTE_LIGUE_180: FonteConteudo = {
  rotulo:
    'Agência Gov — Como funciona a Central de Atendimento à Mulher (Ligue 180), 06/08/2026',
  url: 'https://agenciagov.ebc.com.br/noticias/202608/lei-maria-da-penha-como-funciona-a-central-de-atendimento-a-mulher-ligue-180',
};

const FONTE_LEI_MARIA_DA_PENHA: FonteConteudo = {
  rotulo: 'Planalto — Lei nº 11.340/2006 (Lei Maria da Penha)',
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm',
};

const FONTE_LEI_14550: FonteConteudo = {
  rotulo:
    'Planalto — Lei nº 14.550/2023 (medidas protetivas de urgência)',
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14550.htm',
};

export const conteudos: ConteudoEducativo[] = [
  {
    id: 'reconheca-sinais',
    titulo: 'Reconheça os sinais',
    resumo:
      'Entenda as formas de violência que a lei reconhece, inclusive as que não deixam marcas.',
    categoria: 'Orientação',
    icone: 'eye-outline',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'A violência doméstica nem sempre começa com agressões físicas e não precisa deixar marcas no corpo. A Lei Maria da Penha reconhece seis formas de violência, e uma mesma situação pode misturar várias delas.',
      },
      { tipo: 'subtitulo', texto: 'As seis formas de violência' },
      {
        tipo: 'lista',
        itens: [
          'Física: qualquer conduta que ofenda a integridade ou a saúde do corpo.',
          'Psicológica: ameaças, humilhações, controle das suas decisões, isolamento e outras condutas que causam dano emocional.',
          'Sexual: ser forçada a ter relação sexual que não deseja ou ser impedida de usar método contraceptivo.',
          'Patrimonial: reter, esconder ou destruir dinheiro, documentos ou bens.',
          'Moral: calúnia, difamação e injúria.',
          'Vicária: usar filhos, familiares ou pessoas próximas para atingir a mulher. Foi incluída expressamente na lei em 2026.',
        ],
      },
      { tipo: 'subtitulo', texto: 'Situações que merecem atenção' },
      {
        tipo: 'lista',
        itens: [
          'Alguém decide por você com quem fala, aonde vai ou como usa o seu dinheiro.',
          'Você é humilhada, xingada ou ameaçada, ou sente medo da reação da pessoa.',
          'Seus documentos, seu dinheiro ou seus bens são tomados, escondidos ou destruídos.',
          'Seus filhos ou familiares são usados para pressionar ou ameaçar você.',
        ],
      },
      {
        tipo: 'paragrafo',
        texto:
          'Você não precisa de provas, de testemunhas ou de marcas no corpo para buscar ajuda, e não precisa saber o nome jurídico do que está vivendo. Se houver risco imediato, ligue 190.',
      },
    ],
    fontes: [
      FONTE_FAQ_MARIA_DA_PENHA,
      FONTE_LEI_MARIA_DA_PENHA,
    ],
  },

  {
    id: 'medida-protetiva',
    titulo: 'Medida protetiva',
    resumo:
      'Onde pedir, quem decide, em quanto tempo e por quanto tempo vale.',
    categoria: 'Direitos',
    icone: 'shield-checkmark-outline',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'A medida protetiva de urgência é uma decisão da Justiça para interromper a violência e reduzir o risco para a mulher e seus dependentes.',
      },
      { tipo: 'subtitulo', texto: 'Onde pedir' },
      {
        tipo: 'lista',
        itens: [
          'Em uma delegacia. Qualquer delegacia pode receber o pedido; onde houver Delegacia da Mulher, o atendimento é especializado.',
          'Diretamente ao Poder Judiciário.',
          'O Ministério Público e a Defensoria Pública podem orientar o pedido. O Ministério Público também pode requerer a medida.',
        ],
      },
      { tipo: 'subtitulo', texto: 'O que você precisa ter' },
      {
        tipo: 'paragrafo',
        texto:
          'Não é preciso ter advogado. A concessão não depende de boletim de ocorrência, de inquérito, de processo criminal ou de ação cível, e pode se basear no seu relato à autoridade policial ou em alegações escritas.',
      },
      { tipo: 'subtitulo', texto: 'Quem decide e em quanto tempo' },
      {
        tipo: 'paragrafo',
        texto:
          'Quem decide é o juiz. Quando o pedido é feito na polícia, ele deve ser enviado ao juiz em até 48 horas, e o juiz tem até 48 horas para decidir. A decisão pode sair de imediato, sem ouvir antes o agressor.',
      },
      {
        tipo: 'paragrafo',
        texto:
          'Se houver risco atual ou iminente, o agressor pode ser afastado do lar de imediato. Onde o município não é sede de comarca, ou quando não há delegado no momento do registro, a medida pode ser determinada pela polícia, e o juiz é comunicado em até 24 horas para decidir se a mantém.',
      },
      { tipo: 'subtitulo', texto: 'O que a medida pode determinar' },
      {
        tipo: 'lista',
        itens: [
          'Afastamento do agressor do lar e proibição de se aproximar de você, de familiares e de testemunhas, e de entrar em contato por qualquer meio.',
          'Suspensão da posse ou restrição do porte de armas.',
          'Restrição ou suspensão de visitas aos filhos menores.',
          'Pensão alimentícia provisória.',
          'Monitoração eletrônica do agressor, com alerta para a vítima quando ele se aproximar.',
          'Para a mulher: encaminhamento a programa de proteção, separação de corpos, matrícula dos filhos na escola mais próxima e auxílio-aluguel por até 6 meses.',
        ],
      },
      { tipo: 'subtitulo', texto: 'Por quanto tempo vale e se for descumprida' },
      {
        tipo: 'paragrafo',
        texto:
          'A medida vale enquanto o risco persistir. Descumprir medida protetiva é crime, com pena de dois a cinco anos de reclusão e multa. Em emergência, ligue 190 e comunique o fato à polícia, ao Ministério Público, à Defensoria ou ao juízo.',
      },
      {
        tipo: 'paragrafo',
        texto:
          'No mapa do SOMA você encontra as Delegacias da Mulher e as unidades da Defensoria Pública da cidade de São Paulo. Na Defensoria, o atendimento é com agendamento.',
      },
    ],
    fontes: [
      FONTE_FAQ_MARIA_DA_PENHA,
      FONTE_LEI_14550,
      FONTE_LEI_MARIA_DA_PENHA,
      FONTE_ONDE_BUSCAR_AJUDA,
    ],
  },

  {
    id: 'ajudar-outra-pessoa',
    titulo: 'Quero ajudar alguém',
    resumo:
      'Como apoiar uma amiga, familiar ou vizinha e como você mesma pode denunciar.',
    categoria: 'Rede de apoio',
    icone: 'people-outline',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Ouvir sem julgar pode ser o primeiro passo. Acredite no que ela conta e respeite o tempo dela: evite pressioná-la a tomar decisões para as quais ainda não se sente preparada.',
      },
      { tipo: 'subtitulo', texto: 'O que você pode fazer' },
      {
        tipo: 'lista',
        itens: [
          'Se a violência está acontecendo ou há risco imediato, ligue 190. A própria mulher ou qualquer pessoa que saiba da situação pode acionar.',
          'Ligue 180 para pedir orientação ou denunciar. A denúncia pode ser anônima e é encaminhada aos órgãos competentes, mas não tem caráter de emergência.',
          'Familiares, vizinhos, amigos e colegas de trabalho podem denunciar. Não é preciso ter provas, testemunhas ou marcas.',
          'Mostre a ela os serviços da Rede de apoio e do mapa do SOMA e ofereça acompanhá-la, se ela quiser.',
        ],
      },
      { tipo: 'subtitulo', texto: 'Cuidados' },
      {
        tipo: 'paragrafo',
        texto:
          'Evite confrontar o agressor, porque isso pode aumentar o risco para ela e para você. Se ela estiver em perigo, o 190 vem antes de qualquer outra providência.',
      },
    ],
    fontes: [
      FONTE_FAQ_MARIA_DA_PENHA,
      FONTE_ONDE_BUSCAR_AJUDA,
      {
        rotulo:
          'Câmara dos Deputados — Lei fácil: violência contra a mulher (2020)',
        url: 'https://www2.camara.leg.br/a-camara/estruturaadm/secretarias/secretaria-da-mulher/arquivo-1/como-obter-ajuda-em-caso-de-violencia-contra-a-mulher',
      },
    ],
  },

  {
    id: 'seguranca-digital',
    titulo: 'Segurança digital',
    resumo:
      'Cuidados ao buscar ajuda usando celular, computador ou contas compartilhadas.',
    categoria: 'Segurança',
    icone: 'lock-closed-outline',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Em algumas situações, outra pessoa pode ter acesso ao seu celular, às suas contas ou à sua localização. Dados como localização, mensagens, fotos, câmera, microfone e informações financeiras podem ser usados para vigiar e controlar.',
      },
      { tipo: 'subtitulo', texto: 'Antes de buscar ajuda online' },
      {
        tipo: 'lista',
        itens: [
          'Se você suspeita que está sendo monitorada, prefira buscar ajuda em um aparelho de confiança, que o agressor não use, como o de uma amiga ou o do trabalho.',
          'Pense no risco antes de guardar relatos, fotos ou prints em aparelhos e contas que outra pessoa possa acessar.',
          'Uma ligação pode aparecer no histórico de chamadas e na conta do telefone.',
          'Desconfie de aplicativos que você não instalou e de contas ou localização compartilhadas com o agressor.',
        ],
      },
      { tipo: 'subtitulo', texto: 'O que o SOMA faz' },
      {
        tipo: 'lista',
        itens: [
          'O SOMA não pede nome, cadastro nem login, e não guarda relatos nem denúncias.',
          'Se você permitir o uso da localização, ela serve só para mostrar serviços e dados da região no seu aparelho. Ela não é salva nem enviada.',
          'Na web, o botão Sair e a tecla Esc trocam a tela por uma página neutra de previsão do tempo, sem nada do SOMA.',
          'No Android e no iOS, o botão Sair volta o app para a Home e abre uma busca de previsão do tempo no navegador. Essa busca pode ficar no histórico do navegador.',
        ],
      },
      {
        tipo: 'paragrafo',
        texto:
          'Estas orientações são gerais. Para ajuda especializada, ligue 180.',
      },
    ],
    fontes: [
      {
        rotulo:
          'IRIS — Vaza Stalker! Violência de gênero em ambientes digitais (2025)',
        url: 'https://irisbh.com.br/wp-content/uploads/2025/05/Vaza-Stalker-Violencia-de-genero-em-ambientes-digitais.pdf',
      },
    ],
  },

  {
    id: 'canais-oficiais',
    titulo: 'Qual canal procurar?',
    resumo:
      'Entenda a diferença entre emergência, denúncia, boletim de ocorrência e orientação.',
    categoria: 'Orientação',
    icone: 'navigate-outline',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Cada situação pede um caminho diferente. Se você não sabe por onde começar, ligue 180: o atendimento orienta e informa os serviços mais próximos.',
      },
      { tipo: 'subtitulo', texto: 'Perigo agora: 190' },
      {
        tipo: 'paragrafo',
        texto:
          'Polícia Militar. Use quando a violência está acontecendo ou há risco imediato à vida ou à integridade. A própria mulher ou qualquer pessoa pode ligar.',
      },
      { tipo: 'subtitulo', texto: 'Ferida ou passando mal: 192' },
      {
        tipo: 'paragrafo',
        texto:
          'SAMU, atendimento médico de urgência. A ligação é gratuita.',
      },
      { tipo: 'subtitulo', texto: 'Orientação e denúncia: 180' },
      {
        tipo: 'paragrafo',
        texto:
          'Central de Atendimento à Mulher. Oferece acolhimento, orientação sobre direitos, registro de denúncias e informação sobre os serviços mais próximos. A ligação é gratuita e o atendimento funciona 24 horas, todos os dias. Também atende por WhatsApp, no (61) 9610-0180, e em Libras. A denúncia pode ser anônima. O 180 não é canal de emergência.',
      },
      {
        tipo: 'subtitulo',
        texto: 'Registrar ocorrência e pedir medida protetiva: delegacia',
      },
      {
        tipo: 'paragrafo',
        texto:
          'Qualquer delegacia pode registrar a ocorrência e receber o pedido de medida protetiva. Onde houver Delegacia da Mulher, o atendimento é especializado. A falta de testemunhas ou de lesões aparentes não impede o registro.',
      },
      {
        tipo: 'subtitulo',
        texto: 'Orientação jurídica gratuita: Defensoria Pública',
      },
      {
        tipo: 'paragrafo',
        texto:
          'A Defensoria orienta e presta assistência jurídica gratuita a quem não pode pagar advogado, inclusive para pedir medidas na Justiça. Na cidade de São Paulo, o atendimento é com agendamento.',
      },
      { tipo: 'subtitulo', texto: 'Saúde e acolhimento' },
      {
        tipo: 'paragrafo',
        texto:
          'Hospitais, UBS e UPAs do SUS atendem mulheres em situação de violência. Na violência sexual, procure atendimento o quanto antes. A mulher não precisa apresentar boletim de ocorrência para receber atendimento de saúde. A Casa da Mulher Brasileira reúne, em um só lugar, acolhimento, orientação jurídica e delegacia especializada.',
      },
      {
        tipo: 'paragrafo',
        texto:
          'No mapa do SOMA você encontra delegacias, casas da mulher, hospitais de referência e defensorias da cidade de São Paulo.',
      },
    ],
    fontes: [
      FONTE_ONDE_BUSCAR_AJUDA,
      FONTE_LIGUE_180,
      FONTE_FAQ_MARIA_DA_PENHA,
      {
        rotulo:
          'Governo de Goiás (Saúde) — SAMU 192: o que é e como acionar',
        url: 'https://goias.gov.br/saude/wp-content/uploads/sites/34/2017/10/panfleto-samu-suprass-1da.pdf',
      },
    ],
  },
];
