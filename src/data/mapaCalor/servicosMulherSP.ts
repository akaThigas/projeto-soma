// Gerado por scripts/mapa-calor/gerar_delegacias.py. Não edite à mão.
// Fonte: Prefeitura de São Paulo (SMDHC). Localização aproximada (OpenStreetMap).

export type TipoServico = 'ddm' | 'casa-brasileira' | 'casa' | 'cdcm';

export type ServicoMulher = {
  id: string;
  tipo: TipoServico;
  nome: string;
  endereco: string;
  telefone: string;
  horario: string;
  lat: number | null;
  lon: number | null;
  precisao: string;
  fonte: string;
  nota?: string;
};

export const FONTES_SERVICOS = {"ddm":"Prefeitura de São Paulo, Secretaria Municipal de Direitos Humanos e Cidadania — Delegacias de Defesa da Mulher (página de 29/09/2026): https://prefeitura.sp.gov.br/web/direitos_humanos/w/mulheres/rede_de_protecao/seguranca_e_justica/357715","casas":"Prefeitura de São Paulo, SMDHC — Equipamentos de Atendimento às Mulheres (Casa da Mulher e CDCM), páginas por região de 25/09/2026 e 01/10/2026: https://prefeitura.sp.gov.br/web/direitos_humanos/mulheres/rede_de_protecao/casas_da_mulher/","defensoria":"Prefeitura de São Paulo, SMDHC — Defensoria Pública / NUDEM (29/09/2026): https://prefeitura.sp.gov.br/web/direitos_humanos/w/mulheres/rede_de_protecao/359280","localizacao":"Coordenadas aproximadas obtidas no OpenStreetMap (Nominatim) a partir dos endereços oficiais, em 14/10/2026. 'endereco' = número da rua encontrado; 'rua' = ponto da rua (o número não foi encontrado); 'bairro' = ponto de referência no bairro."};

export const servicosMulherSP: ServicoMulher[] = [
  {"id":"cmb","tipo":"casa-brasileira","nome":"Casa da Mulher Brasileira","endereco":"Rua Vieira Ravasco, 26 – Cambuci","telefone":"(11) 3275-8000","horario":"24 horas","lat":-23.55729,"lon":-46.62276,"precisao":"endereco","fonte":"casas"},
  {"id":"ddm1","tipo":"ddm","nome":"1ª DDM – Centro","endereco":"Rua Vieira Ravasco, 26 – Cambuci (dentro da Casa da Mulher Brasileira)","telefone":"(11) 3275-8000","horario":"24 horas","lat":-23.55729,"lon":-46.62276,"precisao":"endereco","fonte":"ddm"},
  {"id":"ddm2","tipo":"ddm","nome":"2ª DDM – Sul","endereco":"Avenida Onze de Junho, 89 – Saúde","telefone":"(11) 5084-2579","horario":"9h às 18h","lat":-23.6019,"lon":-46.63765,"precisao":"endereco","fonte":"ddm","nota":"A página da Prefeitura escreve 'Avenida Onze de julho'; o endereço no OpenStreetMap, no mesmo prédio do 16º DP, é Avenida Onze de Junho, 89."},
  {"id":"ddm3","tipo":"ddm","nome":"3ª DDM – Oeste","endereco":"Avenida Corifeu de Azevedo Marques, 4300, 2º andar – Jaguaré","telefone":"(11) 3768-4664","horario":"9h às 18h","lat":-23.55537,"lon":-46.75394,"precisao":"rua","fonte":"ddm"},
  {"id":"ddm4","tipo":"ddm","nome":"4ª DDM – Norte","endereco":"Avenida Itaberaba, 731, 1º andar – Freguesia do Ó","telefone":"(11) 3976-2908","horario":"9h às 18h","lat":-23.49472,"lon":-46.69764,"precisao":"endereco","fonte":"ddm"},
  {"id":"ddm5","tipo":"ddm","nome":"5ª DDM – Leste","endereco":"Rua Dr. Corinto Baldoíno Costa, 400, 2º andar – Tatuapé","telefone":"(11) 2293-3816","horario":"9h às 18h","lat":-23.54994,"lon":-46.56772,"precisao":"bairro","fonte":"ddm"},
  {"id":"ddm6","tipo":"ddm","nome":"6ª DDM – Sul","endereco":"Rua Sargento Manoel Barbosa da Silva, 115, 2º andar – Campo Grande","telefone":"(11) 5521-6068 / 5686-8567","horario":"9h às 18h","lat":-23.66197,"lon":-46.68695,"precisao":"endereco","fonte":"ddm"},
  {"id":"ddm7","tipo":"ddm","nome":"7ª DDM – Leste","endereco":"Rua Sabbado D'Angelo, 46 – Itaquera","telefone":"(11) 2071-3488 / 2071-4707","horario":"24 horas","lat":-23.53727,"lon":-46.44941,"precisao":"rua","fonte":"ddm"},
  {"id":"ddm8","tipo":"ddm","nome":"8ª DDM – Leste","endereco":"Avenida Osvaldo do Valle Cordeiro, 190, 2º andar – Jd. Marília","telefone":"(11) 2742-1701","horario":"24 horas","lat":-23.55407,"lon":-46.49219,"precisao":"endereco","fonte":"ddm"},
  {"id":"ddm9","tipo":"ddm","nome":"9ª DDM – Oeste","endereco":"Avenida Menotti Laudisio, 286, 2º andar – Pirituba","telefone":"(11) 3974-8890","horario":"9h às 18h","lat":-23.48201,"lon":-46.72517,"precisao":"endereco","fonte":"ddm"},
  {"id":"cdcm-francisca","tipo":"cdcm","nome":"CDCM Francisca Franco","endereco":"Rua Conselheiro Ramalho, 93 – Bela Vista","telefone":"(11) 3106-1013","horario":"9h às 17h","lat":-23.55257,"lon":-46.64492,"precisao":"endereco","fonte":"casas"},
  {"id":"crcm-itaquera","tipo":"casa","nome":"Casa da Mulher – CRCM Itaquera","endereco":"Rua Ibiajara, 495 – Parada XV de Novembro","telefone":"(11) 2073-4863","horario":"8h às 18h, segunda a sexta","lat":-23.53335,"lon":-46.4335,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-saomiguel","tipo":"casa","nome":"Casa da Mulher – CRCM Onóris Ferreira Dias (São Miguel)","endereco":"Rua Pedro Soares de Andrade, 34 – Vila Rosaria","telefone":"(11) 2058-2800","horario":"8h às 18h, segunda a sexta","lat":-23.50125,"lon":-46.43583,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-anastacia","tipo":"cdcm","nome":"CDCM Casa Anastácia","endereco":"Rua Ricardo da Costa, 335 – Conj. Hab. Barro Branco II","telefone":"(11) 2282-4706","horario":"9h às 17h","lat":-23.58626,"lon":-46.39347,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-cidinha","tipo":"cdcm","nome":"CDCM Casa Cidinha Kopcak","endereco":"Rua Margarida Cardoso dos Santos, 500 – São Mateus","telefone":"(11) 2015-5722","horario":"9h às 17h","lat":-23.60054,"lon":-46.48099,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-nana","tipo":"cdcm","nome":"CDCM Casa Naná Serafim","endereco":"Rua Prof. Zeferino Ferraz, 396 – Itaim Paulista","telefone":"(11) 2562-2719","horario":"9h às 17h","lat":-23.5004,"lon":-46.39525,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-viviane","tipo":"cdcm","nome":"CDCM Casa Viviane dos Santos","endereco":"Rua Planície dos Goitacases, 456 – Vila Iolanda","telefone":"(11) 2553-2424","horario":"9h às 17h","lat":-23.537,"lon":-46.40005,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-marielle","tipo":"cdcm","nome":"CDCM Marielle Franco","endereco":"Rua Serra do Mar, 100 – Guaianazes","telefone":"(11) 5050-1437","horario":"9h às 17h","lat":-23.54575,"lon":-46.41695,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-margarida","tipo":"cdcm","nome":"CDCM Margarida Maria Alves","endereco":"Rua Sabbado d'Ângelo, 2085, 2º andar – Vila Brasil","telefone":"(11) 2935-7324","horario":"9h às 17h","lat":-23.53424,"lon":-46.45161,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-zizi","tipo":"cdcm","nome":"CDCM Casa Zizi","endereco":"Rua Teotônio de Oliveira, 101 – Vila Santa Virgínia","telefone":"(11) 2216-7346","horario":"9h às 17h","lat":-23.58664,"lon":-46.54374,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-brasilandia","tipo":"casa","nome":"Casa da Mulher da Brasilândia","endereco":"Rua Sílvio Bueno Peruche, 538 – Jardim Ondina","telefone":"(11) 2476-0170","horario":"8h às 18h, segunda a sexta","lat":-23.46428,"lon":-46.67907,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-cachoeirinha","tipo":"casa","nome":"Casa da Mulher Cachoeirinha","endereco":"Av. Dep. Emílio Carlos, 3460 – Limão","telefone":"(11) 2361-5551","horario":"8h às 18h, segunda a sexta","lat":-23.48589,"lon":-46.67501,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-perus","tipo":"casa","nome":"Casa da Mulher de Perus","endereco":"Rua Aurora Boreal, 43 – Vila Perus","telefone":"(11) 3917-5955","horario":"8h às 18h, segunda a sexta","lat":-23.41507,"lon":-46.75376,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-marias","tipo":"cdcm","nome":"CDCM Casa Mariás","endereco":"Rua Sd. Cesário Aguiar, 119 – Parque Novo Mundo","telefone":"(11) 3294-0066","horario":"9h às 17h, segunda a sexta","lat":-23.50975,"lon":-46.56631,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-cism","tipo":"cdcm","nome":"CDCM Centro de Integração Social da Mulher – CISM II","endereco":"Rua Ferreira de Almeida, 23 – Casa Verde","telefone":"(11) 3858-8279","horario":"9h às 17h, segunda a sexta","lat":-23.50792,"lon":-46.66717,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-25marco","tipo":"casa","nome":"Casa da Mulher 25 de Março","endereco":"Rua Melo Palheta, 32 – Água Branca","telefone":"(11) 3106-1100","horario":"8h às 18h","lat":-23.52981,"lon":-46.67273,"precisao":"endereco","fonte":"casas"},
  {"id":"cdcm-marcia","tipo":"cdcm","nome":"CDCM Casa Marcia Martins","endereco":"Rua Cânio Rizzo, 285 – Jardim Trussardi","telefone":"(11) 3507-5856","horario":"9h às 17h","lat":-23.58867,"lon":-46.7313,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-socorro","tipo":"casa","nome":"Casa da Mulher – CRCM da Capela do Socorro","endereco":"Rua Prof. Oscar Barreto Filho, 350 – Parque América","telefone":"(11) 2941-4158","horario":"8h às 18h","lat":-23.73506,"lon":-46.69088,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-eliane","tipo":"casa","nome":"Casa da Mulher Eliane de Grammont","endereco":"Rua Dr. Bacelar, 20 – Vila Clementino","telefone":"(11) 5549-9339","horario":"8h às 18h","lat":-23.59605,"lon":-46.6478,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-mlr","tipo":"casa","nome":"Casa da Mulher Maria de Lourdes Rodrigues","endereco":"Rua Raphaela Miraglia Scoppetta, 50 – Jardim Nova Germania","telefone":"(11) 5524-4782","horario":"8h às 18h","lat":null,"lon":null,"precisao":"sem-localizacao","fonte":"casas"},
  {"id":"crcm-parelheiros","tipo":"casa","nome":"Casa da Mulher – CRCM de Parelheiros","endereco":"Rua Terezinha do Prado Oliveira, 119 – Jardim Novo Parelheiros","telefone":"(11) 5921-3665","horario":"8h às 18h","lat":-23.82617,"lon":-46.72075,"precisao":"rua","fonte":"casas"},
  {"id":"crcm-santoamaro","tipo":"casa","nome":"Casa da Mulher – CRCM de Santo Amaro","endereco":"Praça Salim Farah Maluf – Santo Amaro","telefone":"(11) 5521-6626","horario":"8h às 18h","lat":-23.65021,"lon":-46.70791,"precisao":"endereco","fonte":"casas"},
  {"id":"cdcm-sofia","tipo":"cdcm","nome":"CDCM Casa Sofia","endereco":"Rua Dr. Luiz Fernando Ferreira, 06 – Jardim Dionísio","telefone":"(11) 5834-6487","horario":"9h às 17h","lat":-23.68356,"lon":-46.76792,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-vivas","tipo":"cdcm","nome":"CDCM Mulheres Vivas","endereco":"Rua Domingos Bicudo, 56 – Vila Pirajussara","telefone":"(11) 4113-2105","horario":"9h às 17h","lat":-23.63572,"lon":-46.77362,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-creser","tipo":"cdcm","nome":"CDCM Casa da Mulher Crê-Ser","endereco":"Rua Salvador Rodrigues Negrão, 351 – Vila Marari","telefone":"(11) 3539-8163","horario":"9h às 17h","lat":-23.67053,"lon":-46.66337,"precisao":"rua","fonte":"casas"},
  {"id":"cdcm-sonia","tipo":"cdcm","nome":"CDCM Sonia Maria Batista","endereco":"Av. Dr. Gentil de Moura, 598 – Ipiranga","telefone":"(11) 3473-5569","horario":"9h às 17h","lat":-23.60228,"lon":-46.60907,"precisao":"endereco","fonte":"casas"}
];
