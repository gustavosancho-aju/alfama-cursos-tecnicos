/* ============================================================
   BASE DE DADOS — COPA DO MUNDO 2026 (EUA / México / Canadá)
   ------------------------------------------------------------
   Atualizado pelo agente de IA (Claude Code) via busca na web.
   Para atualizar: peça "busca os resultados de hoje e atualiza".

   - TOURNAMENT : metadados
   - TEAMS      : 48 seleções. rating = pontos do Ranking FIFA
                  (jun/2026, aproximado p/ quem está fora do top).
                  Alimenta probabilidades e dificuldade.
   - SCHEDULE   : tabela OFICIAL dos 72 jogos da fase de grupos,
                  com a data real de cada confronto.
   - RESULTS    : placares dos jogos já realizados.
   ============================================================ */

const TOURNAMENT = {
  name: "Copa do Mundo FIFA 2026",
  hosts: "Estados Unidos · México · Canadá",
  start: "2026-06-11",
  end: "2026-07-19",
  lastUpdate: "2026-06-25",
};

/* rating ≈ pontos do Ranking FIFA (jun/2026) */
const TEAMS = [
  // GRUPO A
  { code: "MEX", name: "México",          group: "A", rating: 1656 },
  { code: "RSA", name: "África do Sul",    group: "A", rating: 1430 },
  { code: "KOR", name: "Coreia do Sul",    group: "A", rating: 1575 },
  { code: "CZE", name: "Czéquia",          group: "A", rating: 1500 },
  // GRUPO B
  { code: "CAN", name: "Canadá",           group: "B", rating: 1530 },
  { code: "BIH", name: "Bósnia",           group: "B", rating: 1450 },
  { code: "QAT", name: "Catar",            group: "B", rating: 1450 },
  { code: "SUI", name: "Suíça",            group: "B", rating: 1648 },
  // GRUPO C
  { code: "BRA", name: "Brasil",           group: "C", rating: 1761 },
  { code: "MAR", name: "Marrocos",         group: "C", rating: 1756 },
  { code: "HAI", name: "Haiti",            group: "C", rating: 1320 },
  { code: "SCO", name: "Escócia",          group: "C", rating: 1500 },
  // GRUPO D
  { code: "USA", name: "Estados Unidos",   group: "D", rating: 1648 },
  { code: "PAR", name: "Paraguai",         group: "D", rating: 1480 },
  { code: "AUS", name: "Austrália",        group: "D", rating: 1530 },
  { code: "TUR", name: "Türkiye",          group: "D", rating: 1560 },
  // GRUPO E
  { code: "GER", name: "Alemanha",         group: "E", rating: 1730 },
  { code: "CUW", name: "Curaçao",          group: "E", rating: 1370 },
  { code: "CIV", name: "Costa do Marfim",  group: "E", rating: 1530 },
  { code: "ECU", name: "Equador",          group: "E", rating: 1570 },
  // GRUPO F
  { code: "NED", name: "Holanda",          group: "F", rating: 1758 },
  { code: "JPN", name: "Japão",            group: "F", rating: 1652 },
  { code: "SWE", name: "Suécia",           group: "F", rating: 1560 },
  { code: "TUN", name: "Tunísia",          group: "F", rating: 1500 },
  // GRUPO G
  { code: "BEL", name: "Bélgica",          group: "G", rating: 1735 },
  { code: "EGY", name: "Egito",            group: "G", rating: 1530 },
  { code: "IRN", name: "Irã",              group: "G", rating: 1633 },
  { code: "NZL", name: "Nova Zelândia",    group: "G", rating: 1320 },
  // GRUPO H
  { code: "ESP", name: "Espanha",          group: "H", rating: 1876 },
  { code: "CPV", name: "Cabo Verde",       group: "H", rating: 1390 },
  { code: "KSA", name: "Arábia Saudita",   group: "H", rating: 1430 },
  { code: "URU", name: "Uruguai",          group: "H", rating: 1693 },
  // GRUPO I
  { code: "FRA", name: "França",           group: "I", rating: 1877 },
  { code: "SEN", name: "Senegal",          group: "I", rating: 1700 },
  { code: "IRQ", name: "Iraque",           group: "I", rating: 1430 },
  { code: "NOR", name: "Noruega",          group: "I", rating: 1580 },
  // GRUPO J
  { code: "ARG", name: "Argentina",        group: "J", rating: 1875 },
  { code: "ALG", name: "Argélia",          group: "J", rating: 1507 },
  { code: "AUT", name: "Áustria",          group: "J", rating: 1620 },
  { code: "JOR", name: "Jordânia",         group: "J", rating: 1389 },
  // GRUPO K
  { code: "POR", name: "Portugal",         group: "K", rating: 1764 },
  { code: "COD", name: "RD Congo",         group: "K", rating: 1490 },
  { code: "UZB", name: "Uzbequistão",      group: "K", rating: 1437 },
  { code: "COL", name: "Colômbia",         group: "K", rating: 1700 },
  // GRUPO L
  { code: "ENG", name: "Inglaterra",       group: "L", rating: 1826 },
  { code: "CRO", name: "Croácia",          group: "L", rating: 1716 },
  { code: "GHA", name: "Gana",             group: "L", rating: 1480 },
  { code: "PAN", name: "Panamá",           group: "L", rating: 1530 },
];

/* TABELA OFICIAL — 72 jogos da fase de grupos.
   { date (data local oficial), group, home, away, gmt (início em UTC) }
   O horário de Brasília é calculado a partir de 'gmt' no app.js. */
const SCHEDULE = [
  // ---- Rodada 1 (11–17 jun) ----
  { date: "2026-06-11", group: "A", home: "MEX", away: "RSA", gmt: "2026-06-11T19:00:00Z" },
  { date: "2026-06-11", group: "A", home: "KOR", away: "CZE", gmt: "2026-06-12T02:00:00Z" },
  { date: "2026-06-12", group: "B", home: "CAN", away: "BIH", gmt: "2026-06-12T19:00:00Z" },
  { date: "2026-06-12", group: "D", home: "USA", away: "PAR", gmt: "2026-06-13T01:00:00Z" },
  { date: "2026-06-13", group: "B", home: "QAT", away: "SUI", gmt: "2026-06-13T19:00:00Z" },
  { date: "2026-06-13", group: "C", home: "BRA", away: "MAR", gmt: "2026-06-13T22:00:00Z" },
  { date: "2026-06-13", group: "C", home: "HAI", away: "SCO", gmt: "2026-06-14T01:00:00Z" },
  { date: "2026-06-13", group: "D", home: "AUS", away: "TUR", gmt: "2026-06-14T04:00:00Z" },
  { date: "2026-06-14", group: "E", home: "GER", away: "CUW", gmt: "2026-06-14T17:00:00Z" },
  { date: "2026-06-14", group: "F", home: "NED", away: "JPN", gmt: "2026-06-14T20:00:00Z" },
  { date: "2026-06-14", group: "E", home: "CIV", away: "ECU", gmt: "2026-06-14T23:00:00Z" },
  { date: "2026-06-14", group: "F", home: "SWE", away: "TUN", gmt: "2026-06-15T02:00:00Z" },
  { date: "2026-06-15", group: "H", home: "ESP", away: "CPV", gmt: "2026-06-15T16:00:00Z" },
  { date: "2026-06-15", group: "G", home: "BEL", away: "EGY", gmt: "2026-06-15T19:00:00Z" },
  { date: "2026-06-15", group: "H", home: "KSA", away: "URU", gmt: "2026-06-15T22:00:00Z" },
  { date: "2026-06-15", group: "G", home: "IRN", away: "NZL", gmt: "2026-06-16T01:00:00Z" },
  { date: "2026-06-16", group: "I", home: "FRA", away: "SEN", gmt: "2026-06-16T19:00:00Z" },
  { date: "2026-06-16", group: "I", home: "IRQ", away: "NOR", gmt: "2026-06-16T22:00:00Z" },
  { date: "2026-06-16", group: "J", home: "ARG", away: "ALG", gmt: "2026-06-17T01:00:00Z" },
  { date: "2026-06-16", group: "J", home: "AUT", away: "JOR", gmt: "2026-06-17T04:00:00Z" },
  { date: "2026-06-17", group: "K", home: "POR", away: "COD", gmt: "2026-06-17T17:00:00Z" },
  { date: "2026-06-17", group: "L", home: "ENG", away: "CRO", gmt: "2026-06-17T20:00:00Z" },
  { date: "2026-06-17", group: "L", home: "GHA", away: "PAN", gmt: "2026-06-17T23:00:00Z" },
  { date: "2026-06-17", group: "K", home: "UZB", away: "COL", gmt: "2026-06-18T02:00:00Z" },
  // ---- Rodada 2 (18–23 jun) ----
  { date: "2026-06-18", group: "A", home: "CZE", away: "RSA", gmt: "2026-06-18T16:00:00Z" },
  { date: "2026-06-18", group: "B", home: "SUI", away: "BIH", gmt: "2026-06-18T19:00:00Z" },
  { date: "2026-06-18", group: "B", home: "CAN", away: "QAT", gmt: "2026-06-18T22:00:00Z" },
  { date: "2026-06-18", group: "A", home: "MEX", away: "KOR", gmt: "2026-06-19T01:00:00Z" },
  { date: "2026-06-19", group: "D", home: "USA", away: "AUS", gmt: "2026-06-19T19:00:00Z" },
  { date: "2026-06-19", group: "C", home: "SCO", away: "MAR", gmt: "2026-06-19T22:00:00Z" },
  { date: "2026-06-19", group: "C", home: "BRA", away: "HAI", gmt: "2026-06-20T00:30:00Z" },
  { date: "2026-06-19", group: "D", home: "TUR", away: "PAR", gmt: "2026-06-20T03:00:00Z" },
  { date: "2026-06-20", group: "F", home: "NED", away: "SWE", gmt: "2026-06-20T17:00:00Z" },
  { date: "2026-06-20", group: "E", home: "GER", away: "CIV", gmt: "2026-06-20T20:00:00Z" },
  { date: "2026-06-20", group: "E", home: "ECU", away: "CUW", gmt: "2026-06-21T03:00:00Z" },
  { date: "2026-06-20", group: "F", home: "TUN", away: "JPN", gmt: "2026-06-21T04:00:00Z" },
  { date: "2026-06-21", group: "H", home: "ESP", away: "KSA", gmt: "2026-06-21T16:00:00Z" },
  { date: "2026-06-21", group: "G", home: "BEL", away: "IRN", gmt: "2026-06-21T19:00:00Z" },
  { date: "2026-06-21", group: "H", home: "URU", away: "CPV", gmt: "2026-06-21T22:00:00Z" },
  { date: "2026-06-21", group: "G", home: "NZL", away: "EGY", gmt: "2026-06-22T01:00:00Z" },
  { date: "2026-06-22", group: "J", home: "ARG", away: "AUT", gmt: "2026-06-22T17:00:00Z" },
  { date: "2026-06-22", group: "I", home: "FRA", away: "IRQ", gmt: "2026-06-22T21:00:00Z" },
  { date: "2026-06-22", group: "I", home: "NOR", away: "SEN", gmt: "2026-06-23T00:00:00Z" },
  { date: "2026-06-22", group: "J", home: "JOR", away: "ALG", gmt: "2026-06-23T03:00:00Z" },
  { date: "2026-06-23", group: "K", home: "POR", away: "UZB", gmt: "2026-06-23T17:00:00Z" },
  { date: "2026-06-23", group: "L", home: "ENG", away: "GHA", gmt: "2026-06-23T20:00:00Z" },
  { date: "2026-06-23", group: "L", home: "PAN", away: "CRO", gmt: "2026-06-23T23:00:00Z" },
  { date: "2026-06-23", group: "K", home: "COL", away: "COD", gmt: "2026-06-24T02:00:00Z" },
  // ---- Rodada 3 (24–27 jun) ----
  { date: "2026-06-24", group: "B", home: "SUI", away: "CAN", gmt: "2026-06-24T19:00:00Z" },
  { date: "2026-06-24", group: "B", home: "BIH", away: "QAT", gmt: "2026-06-24T19:00:00Z" },
  { date: "2026-06-24", group: "C", home: "SCO", away: "BRA", gmt: "2026-06-24T22:00:00Z" },
  { date: "2026-06-24", group: "C", home: "MAR", away: "HAI", gmt: "2026-06-24T22:00:00Z" },
  { date: "2026-06-24", group: "A", home: "CZE", away: "MEX", gmt: "2026-06-25T01:00:00Z" },
  { date: "2026-06-24", group: "A", home: "RSA", away: "KOR", gmt: "2026-06-25T01:00:00Z" },
  { date: "2026-06-25", group: "E", home: "ECU", away: "GER", gmt: "2026-06-25T20:00:00Z" },
  { date: "2026-06-25", group: "E", home: "CUW", away: "CIV", gmt: "2026-06-25T20:00:00Z" },
  { date: "2026-06-25", group: "F", home: "JPN", away: "SWE", gmt: "2026-06-25T23:00:00Z" },
  { date: "2026-06-25", group: "F", home: "TUN", away: "NED", gmt: "2026-06-25T23:00:00Z" },
  { date: "2026-06-25", group: "D", home: "TUR", away: "USA", gmt: "2026-06-26T02:00:00Z" },
  { date: "2026-06-25", group: "D", home: "PAR", away: "AUS", gmt: "2026-06-26T02:00:00Z" },
  { date: "2026-06-26", group: "I", home: "NOR", away: "FRA", gmt: "2026-06-26T19:00:00Z" },
  { date: "2026-06-26", group: "I", home: "SEN", away: "IRQ", gmt: "2026-06-26T19:00:00Z" },
  { date: "2026-06-26", group: "H", home: "CPV", away: "KSA", gmt: "2026-06-27T00:00:00Z" },
  { date: "2026-06-26", group: "H", home: "URU", away: "ESP", gmt: "2026-06-27T00:00:00Z" },
  { date: "2026-06-26", group: "G", home: "EGY", away: "IRN", gmt: "2026-06-27T03:00:00Z" },
  { date: "2026-06-26", group: "G", home: "NZL", away: "BEL", gmt: "2026-06-27T03:00:00Z" },
  { date: "2026-06-27", group: "L", home: "PAN", away: "ENG", gmt: "2026-06-27T21:00:00Z" },
  { date: "2026-06-27", group: "L", home: "CRO", away: "GHA", gmt: "2026-06-27T21:00:00Z" },
  { date: "2026-06-27", group: "K", home: "COL", away: "POR", gmt: "2026-06-27T23:30:00Z" },
  { date: "2026-06-27", group: "K", home: "COD", away: "UZB", gmt: "2026-06-27T23:30:00Z" },
  { date: "2026-06-27", group: "J", home: "ALG", away: "AUT", gmt: "2026-06-28T02:00:00Z" },
  { date: "2026-06-27", group: "J", home: "JOR", away: "ARG", gmt: "2026-06-28T02:00:00Z" },
];

/* Anúncios (ADS) e Notícias (NEWS) agora ficam em config.js (white-label). */

/* Artilharia — { name, code (seleção), goals }.
   Atualize junto com os resultados. */
const SCORERS = [
  { name: "Folarin Balogun", code: "USA", goals: 2 },
  { name: "Julián Quiñones", code: "MEX", goals: 1 },
  { name: "Raúl Jiménez",    code: "MEX", goals: 1 },
  { name: "Ladislav Krejčí", code: "CZE", goals: 1 },
  { name: "Hwang In-beom",   code: "KOR", goals: 1 },
  { name: "Oh Hyun-gyu",     code: "KOR", goals: 1 },
  { name: "Jovo Lukić",      code: "BIH", goals: 1 },
  { name: "Cyle Larin",      code: "CAN", goals: 2 },
  { name: "Maurício",        code: "PAR", goals: 1 },
  { name: "Gio Reyna",       code: "USA", goals: 1 },
  { name: "Breel Embolo",    code: "SUI", goals: 1 },
  { name: "Nestory Irankunda", code: "AUS", goals: 1 },
  { name: "Connor Metcalfe", code: "AUS", goals: 1 },
  { name: "Kai Havertz",      code: "GER", goals: 2 },
  { name: "Yasin Ayari",      code: "SWE", goals: 2 },
  { name: "Vinícius Júnior",  code: "BRA", goals: 2 },
  { name: "Virgil van Dijk",  code: "NED", goals: 1 },
  { name: "Amad Diallo",      code: "CIV", goals: 1 },
  // Rodada 1 — Grupos G, H, I, J (15-16/06)
  { name: "Lionel Messi",     code: "ARG", goals: 5 },
  { name: "Kylian Mbappé",    code: "FRA", goals: 3 },
  { name: "Erling Haaland",   code: "NOR", goals: 4 },
  { name: "Elijah Just",      code: "NZL", goals: 2 },
  { name: "Bradley Barcola",  code: "FRA", goals: 1 },
  { name: "Mbaye Niang",      code: "SEN", goals: 1 },
  { name: "Leo Østigård",     code: "NOR", goals: 1 },
  { name: "Aymen Hussein",    code: "IRQ", goals: 1 },
  { name: "Ramin Rezaeian",   code: "IRN", goals: 1 },
  { name: "Mohammad Mohebbi", code: "IRN", goals: 1 },
  { name: "Maxi Araújo",      code: "URU", goals: 2 },
  { name: "Abdulelah Al-Amri", code: "KSA", goals: 1 },
  { name: "Emam Ashour",      code: "EGY", goals: 1 },
  { name: "Romano Schmid",    code: "AUT", goals: 1 },
  { name: "Marko Arnautović", code: "AUT", goals: 1 },
  { name: "Ali Olwan",        code: "JOR", goals: 1 },
  // Rodada 1 — Grupos K, L (17/06)
  { name: "Harry Kane",       code: "ENG", goals: 2 },
  { name: "Jude Bellingham",  code: "ENG", goals: 1 },
  { name: "Marcus Rashford",  code: "ENG", goals: 1 },
  { name: "Martin Baturina",  code: "CRO", goals: 1 },
  { name: "Petar Musa",       code: "CRO", goals: 1 },
  { name: "Luis Díaz",        code: "COL", goals: 1 },
  { name: "Daniel Muñoz",     code: "COL", goals: 2 },
  { name: "Jáminton Campaz",  code: "COL", goals: 1 },
  { name: "Abbosbek Fayzullaev", code: "UZB", goals: 1 },
  { name: "João Neves",       code: "POR", goals: 1 },
  { name: "Yoane Wissa",      code: "COD", goals: 1 },
  { name: "Caleb Yirenkyi",   code: "GHA", goals: 1 },
  // Rodada 2 (18-19/06)
  { name: "Michal Sadílek",   code: "CZE", goals: 1 },
  { name: "Teboho Mokoena",   code: "RSA", goals: 1 },
  { name: "Johan Manzambi",   code: "SUI", goals: 2 },
  { name: "Rubén Vargas",     code: "SUI", goals: 1 },
  { name: "Granit Xhaka",     code: "SUI", goals: 1 },
  { name: "Ermin Mahmić",     code: "BIH", goals: 1 },
  { name: "Jonathan David",   code: "CAN", goals: 3 },
  { name: "Saliba",           code: "CAN", goals: 1 },
  { name: "Luis Romo",        code: "MEX", goals: 1 },
  // Rodada 2 (19-21/06)
  { name: "Matheus Cunha",    code: "BRA", goals: 2 },
  { name: "Tim Weah",         code: "USA", goals: 1 },
  { name: "Ismael Saibari",   code: "MAR", goals: 1 },
  { name: "Matías Galarza",   code: "PAR", goals: 1 },
  { name: "Brian Brobbey",    code: "NED", goals: 2 },
  { name: "Cody Gakpo",       code: "NED", goals: 2 },
  { name: "Crysencio Summerville", code: "NED", goals: 1 },
  { name: "Anthony Elanga",   code: "SWE", goals: 1 },
  { name: "Deniz Undav",      code: "GER", goals: 2 },
  { name: "Franck Kessié",    code: "CIV", goals: 1 },
  { name: "Ayase Ueda",       code: "JPN", goals: 2 },
  { name: "Daichi Kamada",    code: "JPN", goals: 1 },
  { name: "Junya Ito",        code: "JPN", goals: 1 },
  { name: "Mikel Oyarzabal",  code: "ESP", goals: 2 },
  { name: "Lamine Yamal",     code: "ESP", goals: 1 },
  { name: "Agustín Canobbio", code: "URU", goals: 1 },
  { name: "Kevin Pina",       code: "CPV", goals: 1 },
  { name: "Hélio Varela",     code: "CPV", goals: 1 },
  { name: "Zizo",             code: "EGY", goals: 1 },
  { name: "Mohamed Salah",    code: "EGY", goals: 1 },
  { name: "Trezeguet",        code: "EGY", goals: 1 },
  { name: "Mohamed Surman",   code: "NZL", goals: 1 },
  // Rodada 2 (22/06)
  { name: "Marcus Pedersen",  code: "NOR", goals: 1 },
  { name: "Ismaïla Sarr",     code: "SEN", goals: 2 },
  { name: "Nizar Al-Rashdan", code: "JOR", goals: 1 },
  { name: "Nadhir Benbouali", code: "ALG", goals: 1 },
  { name: "Amine Gouiri",     code: "ALG", goals: 1 },
  // Rodada 2 (23/06)
  { name: "Cristiano Ronaldo", code: "POR", goals: 2 },
  { name: "Nuno Mendes",      code: "POR", goals: 1 },
  { name: "Rafael Leão",      code: "POR", goals: 1 },
  { name: "Ante Budimir",     code: "CRO", goals: 1 },
];

/* Resultados já realizados.
   { home, away, hs, as }  — use os CODES; a data vem do SCHEDULE. */
const RESULTS = [
  // Rodada 1
  { home: "MEX", away: "RSA", hs: 2, as: 0 },
  { home: "KOR", away: "CZE", hs: 2, as: 1 },
  { home: "CAN", away: "BIH", hs: 1, as: 1 },
  { home: "USA", away: "PAR", hs: 4, as: 1 },
  { home: "QAT", away: "SUI", hs: 1, as: 1 },
  { home: "BRA", away: "MAR", hs: 1, as: 1 },
  { home: "HAI", away: "SCO", hs: 0, as: 1 },
  { home: "AUS", away: "TUR", hs: 2, as: 0 },
  { home: "GER", away: "CUW", hs: 7, as: 1 },
  { home: "NED", away: "JPN", hs: 2, as: 2 },
  { home: "CIV", away: "ECU", hs: 1, as: 0 },
  { home: "SWE", away: "TUN", hs: 5, as: 1 },
  { home: "ESP", away: "CPV", hs: 0, as: 0 },
  { home: "BEL", away: "EGY", hs: 1, as: 1 },
  { home: "KSA", away: "URU", hs: 1, as: 1 },
  { home: "IRN", away: "NZL", hs: 2, as: 2 },
  // Rodada 1 (cont.) — 16/06
  { home: "FRA", away: "SEN", hs: 3, as: 1 },
  { home: "IRQ", away: "NOR", hs: 1, as: 4 },
  { home: "ARG", away: "ALG", hs: 3, as: 0 },
  { home: "AUT", away: "JOR", hs: 3, as: 1 },
  // Rodada 1 (cont.) — 17/06
  { home: "POR", away: "COD", hs: 1, as: 1 },
  { home: "ENG", away: "CRO", hs: 4, as: 2 },
  { home: "GHA", away: "PAN", hs: 1, as: 0 },
  { home: "UZB", away: "COL", hs: 1, as: 3 },
  // Rodada 2 — 18-19/06
  { home: "CZE", away: "RSA", hs: 1, as: 1 },
  { home: "SUI", away: "BIH", hs: 4, as: 1 },
  { home: "CAN", away: "QAT", hs: 6, as: 0 },
  { home: "MEX", away: "KOR", hs: 1, as: 0 },
  // Rodada 2 — 19/06
  { home: "USA", away: "AUS", hs: 2, as: 0 },
  { home: "SCO", away: "MAR", hs: 0, as: 1 },
  { home: "BRA", away: "HAI", hs: 3, as: 0 },
  { home: "TUR", away: "PAR", hs: 0, as: 1 },
  // Rodada 2 — 20/06
  { home: "NED", away: "SWE", hs: 5, as: 1 },
  { home: "GER", away: "CIV", hs: 2, as: 1 },
  { home: "ECU", away: "CUW", hs: 0, as: 0 },
  { home: "TUN", away: "JPN", hs: 0, as: 4 },
  // Rodada 2 — 21/06
  { home: "ESP", away: "KSA", hs: 4, as: 0 },
  { home: "BEL", away: "IRN", hs: 0, as: 0 },
  { home: "URU", away: "CPV", hs: 2, as: 2 },
  { home: "NZL", away: "EGY", hs: 1, as: 3 },
  // Rodada 2 — 22/06
  { home: "ARG", away: "AUT", hs: 2, as: 0 },
  { home: "FRA", away: "IRQ", hs: 1, as: 0 },
  { home: "NOR", away: "SEN", hs: 3, as: 2 },
  { home: "JOR", away: "ALG", hs: 1, as: 2 },
  // Rodada 2 — 23/06
  { home: "POR", away: "UZB", hs: 5, as: 0 },
  { home: "ENG", away: "GHA", hs: 0, as: 0 },
  { home: "PAN", away: "CRO", hs: 0, as: 1 },
  { home: "COL", away: "COD", hs: 1, as: 0 },
  // ---- Rodada 3 (24-25/06) ----
  { home: "SUI", away: "CAN", hs: 2, as: 1 },
  { home: "BIH", away: "QAT", hs: 3, as: 1 },
  { home: "SCO", away: "BRA", hs: 0, as: 3 },
  { home: "MAR", away: "HAI", hs: 4, as: 2 },
  { home: "CZE", away: "MEX", hs: 0, as: 3 },
  { home: "RSA", away: "KOR", hs: 1, as: 0 },
  { home: "ECU", away: "GER", hs: 2, as: 1 },
  { home: "CUW", away: "CIV", hs: 0, as: 2 },
  { home: "JPN", away: "SWE", hs: 1, as: 1 },
  { home: "TUN", away: "NED", hs: 1, as: 3 },
];
