/* ============================================================
   CONFIG DA MARCA (WHITE-LABEL) — ALFAMA CURSOS TÉCNICOS
   ------------------------------------------------------------
   Edite APENAS este arquivo para a marca do cliente.
   O motor da Copa (data.js/app.js) não muda.
   ============================================================ */

const BRAND = {
  nome: "ALFAMA",
  slogan: "Cursos Técnicos",
  registro: "",

  /* Azul como base + amarelo/âmbar de destaque (tons da logo Alfama). */
  cores: {
    principal: "#15347e",  // azul
    escura:    "#0e2459",  // azul escuro
    destaque:  "#ffc107",  // amarelo/âmbar
  },

  /* Logo oficial (PDF convertido para PNG, em img/). */
  logo: `<img src="img/alfama-logo.png" alt="ALFAMA — Cursos Técnicos">`,
};

/* ---------- POSTS LATERAIS: BANNERS (artes prontas) ----------
   Cada card mostra a arte inteira (campo "banner") + botão de WhatsApp.
   Salve as 4 imagens em img/ com EXATAMENTE estes nomes.
   phone: número com DDI+DDD (só dígitos). waText: msg que abre no WhatsApp. */
const ADS = [
  {
    banner: "img/banner-enfermagem.jpeg",
    title: "Técnico em Enfermagem",
    cta: "Faça sua matrícula",
    phone: "5579988637617",
    waText: "Olá! Tenho interesse no curso Técnico em Enfermagem da Alfama.",
  },
  {
    banner: "img/banner-transacoes-imobiliarias.jpeg",
    title: "Técnico em Transações Imobiliárias",
    cta: "Faça sua matrícula",
    phone: "5579988637617",
    waText: "Olá! Tenho interesse no curso Técnico em Transações Imobiliárias da Alfama.",
  },
  {
    banner: "img/banner-workshop-mercado.jpeg",
    title: "5º Workshop — Mercado Imobiliário",
    cta: "Quero participar",
    phone: "5579988637617",
    waText: "Olá! Quero informações sobre o 5º Workshop do Mercado Imobiliário.",
  },
  {
    banner: "img/banner-avaliador-imoveis.jpeg",
    title: "Curso de Avaliador de Imóveis",
    cta: "Quero me inscrever",
    phone: "5579988637617",
    waText: "Olá! Quero informações sobre o Curso de Avaliador de Imóveis (9, 10 e 11/07).",
  },
];

/* ---------- POSTS LATERAIS: NOTÍCIAS (feed) ----------
   Feed da Copa como engajamento; troque por avisos da escola se preferir. */
const NEWS = [
  {
    source: "Alfama Cursos", handle: "@alfamacursos", time: "há 1h", tag: "Bolsas",
    text: "🎓 Torcendo pelo Brasil e investindo no seu futuro! Durante a Copa, a Alfama está com condições especiais de matrícula nos cursos técnicos. Garanta sua vaga.",
  },
  {
    source: "Central da Copa", handle: "@centralcopa", time: "há 2h", tag: "Análise",
    text: "🇧🇷 Brasil empata em 1 a 1 com o Marrocos na estreia. Vini Jr. marcou um golaço. Próximo jogo: Brasil x Haiti, sexta (19/06), 21h30 (Brasília).",
  },
  {
    source: "Carlo Ancelotti", handle: "@ancelotti", time: "há 3h", tag: "Coletiva",
    text: "\"Copa não se ganha no primeiro jogo.\" Ancelotti minimizou o empate e prometeu uma Seleção mais forte e agressiva no próximo duelo.",
  },
];
