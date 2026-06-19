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
    source: "Central da Copa", handle: "@centralcopa", time: "há 2h", tag: "Histórico",
    text: "🐐 MESSI NA HISTÓRIA! Hat-trick no 3 a 0 da Argentina sobre a Argélia e o craque IGUALA Klose como maior artilheiro de Copas (16 gols) — o 1º hat-trick dele em Mundiais.",
  },
  {
    source: "Agenda Seleção", handle: "@agendaselecao", time: "há 3h", tag: "Próximo jogo",
    text: "📅 BRASIL x HAITI, sexta (19/06), 21h30 (Brasília), na Filadélfia. Projeção: 83% de vitória brasileira. Chance de embalar no Grupo C após o empate na estreia.",
  },
  {
    source: "Premier Watch", handle: "@premierwatch", time: "há 4h", tag: "Destaque",
    text: "🏴 SHOW DE KANE! Inglaterra 4 a 2 na Croácia no melhor jogo da Copa até aqui (2 de Kane). 1ª rodada completa: CR7 frustrado no 1x1 de Portugal com a estreante RD Congo.",
  },
];
