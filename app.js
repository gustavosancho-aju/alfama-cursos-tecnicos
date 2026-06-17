/* ============================================================
   COPA DO MUNDO 2026 — Lógica do painel
   ============================================================ */

/* ---- Índices auxiliares ---- */
const TEAM_BY_CODE = Object.fromEntries(TEAMS.map(t => [t.code, t]));
const GROUPS = [...new Set(TEAMS.map(t => t.group))].sort();
const teamsOf = g => TEAMS.filter(t => t.group === g);

/* ---- Bandeiras como IMAGEM (emoji de bandeira não renderiza no Windows) ----
   Mapa code -> código ISO usado pelo flagcdn. */
const FLAG_ISO = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct", USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec", NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no", ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COD: "cd", UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};
/* Retorna <img> da bandeira. size: largura em px (usa flagcdn 2x para nitidez). */
function flagImg(code, size = 22) {
  const iso = FLAG_ISO[code];
  const w = size <= 22 ? 40 : 80;
  return `<img class="flag" width="${size}" src="https://flagcdn.com/w${w}/${iso}.png" alt="${code}" loading="lazy">`;
}

/* Resultados editados manualmente pelo usuário no Simulador.
   chave = id do confronto, valor = { hs, as } */
let userSims = {};
let simAffectsProb = false;
/* Mata-mata montado pelo usuário: chave "<jogo>-<0|1>" ou "champion" -> code */
let userBracket = {};

function fixtureId(a, b) {
  return [a, b].sort().join("-");
}

/* Mapa de resultados já realizados por confronto (id -> result) */
function resultsIndex() {
  const idx = {};
  for (const r of RESULTS) idx[fixtureId(r.home, r.away)] = r;
  return idx;
}

/* Rodada deduzida da data (fase de grupos) */
function matchdayFromDate(d) {
  if (d <= "2026-06-17") return 1;
  if (d <= "2026-06-23") return 2;
  return 3;
}

/* Converte horário GMT/UTC para Brasília (America/Sao_Paulo, UTC-3 fixo).
   Retorna { date: 'YYYY-MM-DD', time: 'HH:MM' } já no fuso de Brasília. */
function brtParts(gmt) {
  if (!gmt) return { date: null, time: null };
  const d = new Date(gmt);
  const date = d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const time = d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

/* Lista completa de confrontos a partir da TABELA OFICIAL (SCHEDULE),
   já com o placar quando o jogo foi realizado. O placar é orientado
   para o mando de campo oficial, independe da ordem em RESULTS. */
function buildAllFixtures() {
  const idx = resultsIndex();
  return SCHEDULE.map(m => {
    const id = fixtureId(m.home, m.away);
    const r = idx[id];
    let hs = null, as = null;
    if (r) {
      const sameOrder = r.home === m.home;
      hs = sameOrder ? r.hs : r.as;
      as = sameOrder ? r.as : r.hs;
    }
    const bp = brtParts(m.gmt);
    return {
      id, group: m.group, matchday: matchdayFromDate(m.date),
      home: m.home, away: m.away, hs, as, date: m.date, played: !!r,
      gmt: m.gmt, brtDate: bp.date || m.date, time: bp.time,
    };
  });
}

const ALL_FIXTURES = buildAllFixtures();

/* Retorna placar efetivo de um confronto considerando simulações do usuário */
function effectiveScore(fx) {
  if (fx.played) return { hs: fx.hs, as: fx.as, sim: false };
  const u = userSims[fx.id];
  if (u && u.hs !== null && u.as !== null && u.hs !== "" && u.as !== "")
    return { hs: Number(u.hs), as: Number(u.as), sim: true };
  return null;
}

/* ---- Cálculo da classificação de um grupo ---- */
function computeStandings(group, { includeSims = true } = {}) {
  const stats = {};
  for (const t of teamsOf(group))
    stats[t.code] = { code: t.code, P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0, Pts: 0 };

  for (const fx of ALL_FIXTURES.filter(f => f.group === group)) {
    let sc = null;
    if (fx.played) sc = { hs: fx.hs, as: fx.as };
    else if (includeSims) { const e = effectiveScore(fx); if (e) sc = e; }
    if (!sc) continue;

    const h = stats[fx.home], a = stats[fx.away];
    h.J++; a.J++;
    h.GP += sc.hs; h.GC += sc.as; a.GP += sc.as; a.GC += sc.hs;
    if (sc.hs > sc.as) { h.V++; a.D++; h.Pts += 3; }
    else if (sc.hs < sc.as) { a.V++; h.D++; a.Pts += 3; }
    else { h.E++; a.E++; h.Pts++; a.Pts++; }
  }
  const arr = Object.values(stats);
  arr.forEach(s => s.SG = s.GP - s.GC);
  arr.sort(sortTeams);
  return arr;
}

function sortTeams(x, y) {
  if (y.Pts !== x.Pts) return y.Pts - x.Pts;
  if (y.SG !== x.SG) return y.SG - x.SG;
  if (y.GP !== x.GP) return y.GP - x.GP;
  return TEAM_BY_CODE[x.code].name.localeCompare(TEAM_BY_CODE[y.code].name);
}

/* ============================================================
   SIMULAÇÃO MONTE CARLO — probabilidade de classificação
   ============================================================ */
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

/* Gols esperados a partir da diferença de rating (estilo Elo) */
function expectedGoals(rTeam, rOpp) {
  const e = 1 / (1 + Math.pow(10, (rOpp - rTeam) / 400)); // 0..1
  return 0.35 + 2.4 * e; // média de gols
}

function simulateMatch(homeCode, awayCode) {
  const rh = TEAM_BY_CODE[homeCode].rating + 35; // leve fator casa
  const ra = TEAM_BY_CODE[awayCode].rating;
  return { hs: poisson(expectedGoals(rh, ra)), as: poisson(expectedGoals(ra, rh)) };
}

function runMonteCarlo(numSims = 3000) {
  const qualDirect = {}, qualTotal = {}, winGroup = {};
  TEAMS.forEach(t => { qualDirect[t.code] = 0; qualTotal[t.code] = 0; winGroup[t.code] = 0; });

  // pré-separa confrontos por grupo
  const byGroup = {};
  GROUPS.forEach(g => byGroup[g] = ALL_FIXTURES.filter(f => f.group === g));

  for (let s = 0; s < numSims; s++) {
    const thirds = [];
    for (const g of GROUPS) {
      const stats = {};
      teamsOf(g).forEach(t => stats[t.code] = { code: t.code, Pts: 0, SG: 0, GP: 0 });

      for (const fx of byGroup[g]) {
        let sc;
        if (fx.played) sc = { hs: fx.hs, as: fx.as };
        else {
          const fixed = simAffectsProb ? effectiveScore(fx) : null;
          sc = fixed || simulateMatch(fx.home, fx.away);
        }
        const h = stats[fx.home], a = stats[fx.away];
        h.GP += sc.hs; a.GP += sc.as; h.SG += sc.hs - sc.as; a.SG += sc.as - sc.hs;
        if (sc.hs > sc.as) h.Pts += 3;
        else if (sc.hs < sc.as) a.Pts += 3;
        else { h.Pts++; a.Pts++; }
      }
      const ranked = Object.values(stats).sort(sortTeams);
      qualDirect[ranked[0].code]++; qualTotal[ranked[0].code]++;
      qualDirect[ranked[1].code]++; qualTotal[ranked[1].code]++;
      winGroup[ranked[0].code]++;
      thirds.push(ranked[2]);
    }
    // 8 melhores terceiros avançam
    thirds.sort(sortTeams);
    for (let i = 0; i < 8; i++) qualTotal[thirds[i].code]++;
  }

  const out = {};
  TEAMS.forEach(t => out[t.code] = {
    direct: qualDirect[t.code] / numSims,
    total: qualTotal[t.code] / numSims,
    win: winGroup[t.code] / numSims,
  });
  return out;
}

/* ============================================================
   DIFICULDADE DE JOGO (1 fácil ... 5 muito difícil)
   Baseada na probabilidade de o adversário vencer.
   ============================================================ */
function matchDifficulty(teamCode, oppCode) {
  const rt = TEAM_BY_CODE[teamCode].rating;
  const ro = TEAM_BY_CODE[oppCode].rating;
  const pOppWin = 1 / (1 + Math.pow(10, (rt - ro) / 400));
  let level;
  if (pOppWin < 0.28) level = 1;
  else if (pOppWin < 0.40) level = 2;
  else if (pOppWin < 0.52) level = 3;
  else if (pOppWin < 0.64) level = 4;
  else level = 5;
  const labels = { 1: "Fácil", 2: "Tranquilo", 3: "Equilibrado", 4: "Difícil", 5: "Muito difícil" };
  return { level, label: labels[level], pOppWin };
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */
const $ = sel => document.querySelector(sel);
const fmtDate = d => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" });
};
const teamChip = (code, side = "") =>
  `<span class="team ${side}">${flagImg(code, 24)}<span>${TEAM_BY_CODE[code].name}</span></span>`;

const CAL_WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/* Monta a grade mensal de dias clicáveis a partir de um mapa {data:[jogos]}.
   onclickFn = nome da função global chamada ao clicar (recebe a data YYYY-MM-DD). */
function monthsGridHTML(byDate, selected, onclickFn, today) {
  const dates = Object.keys(byDate).sort();
  const months = [...new Set(dates.map(d => d.slice(0, 7)))].sort();
  let html = `<div class="cal-wrap">`;
  for (const ym of months) {
    const [y, m] = ym.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const monthName = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const daysInMonth = new Date(y, m, 0).getDate();
    const lead = first.getDay(); // 0=dom
    html += `<div class="cal-month">
      <div class="cal-month-title">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
      <div class="cal-grid">
        ${CAL_WD.map(w => `<div class="cal-wd">${w}</div>`).join("")}`;
    for (let i = 0; i < lead; i++) html += `<div class="cal-cell blank"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${ym}-${String(day).padStart(2, "0")}`;
      const games = byDate[ds];
      if (!games) { html += `<div class="cal-cell empty">${day}</div>`; continue; }
      const cls = ["cal-cell", "has-games"];
      if (ds === selected) cls.push("sel");
      if (ds === today) cls.push("today");
      html += `<button class="${cls.join(" ")}" onclick="${onclickFn}('${ds}')">
        <span class="cal-d">${day}</span><span class="cal-dot">${games.length}</span>
      </button>`;
    }
    html += `</div></div>`;
  }
  return html + `</div>`;
}

/* ---- 1. RESULTADOS ---- */
let resSelectedDate = null;
let resShowFull = false;
function setResDate(d) { resSelectedDate = d; resShowFull = false; renderResults(); }
function toggleResFull() { resShowFull = !resShowFull; renderResults(); }

function renderResults() {
  const played = ALL_FIXTURES.filter(f => f.played).sort((a, b) => (a.gmt || a.date).localeCompare(b.gmt || b.date));
  const el = $("#view-results");
  if (!played.length) { el.innerHTML = `<div class="empty">Nenhum jogo realizado ainda. Peça ao agente para buscar os resultados! ⚽</div>`; return; }

  const byDate = {};
  for (const fx of played) (byDate[fx.brtDate] = byDate[fx.brtDate] || []).push(fx);
  const dates = Object.keys(byDate).sort();

  let html = `<h2 class="section-title">Resultados dos jogos</h2>
    <p class="sim-note">Clique num dia para ver os resultados — ou use a <b>Lista completa</b>.</p>
    <div class="prob-controls">
      <button class="${resShowFull ? "" : "ghost"}" onclick="toggleResFull()">📋 Lista completa</button>
    </div>`;

  /* ----- modo LISTA COMPLETA ----- */
  if (resShowFull) {
    html += `<div class="panel">`;
    let lastDate = "";
    for (const fx of played) {
      if (fx.brtDate !== lastDate) { html += `<div class="cal-day-head">📅 ${fmtDate(fx.brtDate)}</div>`; lastDate = fx.brtDate; }
      html += matchCardHTML(fx, { hs: fx.hs, as: fx.as });
    }
    html += `</div>`;
    el.innerHTML = html; return;
  }

  /* ----- modo CALENDÁRIO (grade) ----- */
  // padrão: dia mais recente com resultado
  if (!resSelectedDate || !byDate[resSelectedDate]) resSelectedDate = dates[dates.length - 1];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  html += monthsGridHTML(byDate, resSelectedDate, "setResDate", today);

  const dayGames = byDate[resSelectedDate] || [];
  html += `<div class="cal-day-selected">
    <div class="cal-day-head">📅 ${fmtDate(resSelectedDate)} · ${dayGames.length} jogo${dayGames.length > 1 ? "s" : ""}</div>
    <div class="panel">`;
  for (const fx of dayGames) html += matchCardHTML(fx, { hs: fx.hs, as: fx.as });
  html += `</div></div>`;
  el.innerHTML = html;
}

function matchCardHTML(fx, sc, simBadge = false) {
  const scoreHTML = sc
    ? `<div class="score">${sc.hs} <span style="opacity:.5">-</span> ${sc.as}${simBadge ? '<span class="badge-sim">SIM</span>' : ''}</div>`
    : `<div class="score pending">${fx.time || "--:--"}<br><span style="font-size:10px">a disputar</span></div>`;
  const hora = fx.time ? ` · ⏰ ${fx.time}` : "";
  return `<div class="match-card">
    ${teamChip(fx.home, "home")}${scoreHTML}${teamChip(fx.away, "away")}
    <div class="meta">Grupo ${fx.group} · ${fx.matchday}ª rodada${hora} (Brasília)</div>
  </div>`;
}

/* ---- 2. GRUPOS ---- */
function renderGroups() {
  let html = `<h2 class="section-title">Tabela dos grupos</h2>
    <div class="legend">
      <span><i class="dot" style="background:var(--grass-2)"></i> Classificado (1º/2º)</span>
      <span><i class="dot" style="background:var(--gold)"></i> 3º (disputa repescagem)</span>
      <span><i class="dot" style="background:#3a4a40"></i> Eliminado</span>
    </div>
    <div class="groups-grid">`;
  for (const g of GROUPS) {
    const st = computeStandings(g);
    html += `<div class="panel group-card">
      <div class="group-head">🏟️ Grupo ${g}</div>
      <table class="standings">
        <thead><tr>
          <th style="width:34px">#</th><th class="team-col">Seleção</th>
          <th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th>
        </tr></thead><tbody>`;
    st.forEach((s, i) => {
      const cls = i < 2 ? "qual" : i === 2 ? "third" : "out";
      const t = TEAM_BY_CODE[s.code];
      html += `<tr class="${cls}">
        <td><span class="pos">${i + 1}</span></td>
        <td class="team-col tname">${flagImg(t.code)} ${t.name}</td>
        <td class="pts">${s.Pts}</td><td>${s.J}</td><td>${s.V}</td><td>${s.E}</td><td>${s.D}</td>
        <td>${s.SG > 0 ? "+" + s.SG : s.SG}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }
  html += `</div>`;
  $("#view-groups").innerHTML = html;
}

/* ---- 3. CALENDÁRIO ---- */
let calendarFilter = "ALL";
let calSelectedDate = null;      // dia selecionado (YYYY-MM-DD, fuso Brasília)
let calShowFull = false;         // modo "Lista completa"

function setCalFilter(v) { calendarFilter = v; calSelectedDate = null; renderCalendar(); }
function setCalDate(d) { calSelectedDate = d; calShowFull = false; renderCalendar(); }
function toggleCalFull() { calShowFull = !calShowFull; renderCalendar(); }

/* fixtures já filtrados pela seleção escolhida */
function calFilteredFixtures() {
  let fx = [...ALL_FIXTURES].sort((a, b) => (a.gmt || a.date).localeCompare(b.gmt || b.date));
  if (calendarFilter !== "ALL") fx = fx.filter(f => f.home === calendarFilter || f.away === calendarFilter);
  return fx;
}

function renderCalendar() {
  const fixtures = calFilteredFixtures();

  // jogos por dia (fuso Brasília)
  const byDate = {};
  for (const fx of fixtures) (byDate[fx.brtDate] = byDate[fx.brtDate] || []).push(fx);
  const gameDates = Object.keys(byDate).sort();

  const opts = TEAMS.slice().sort((a, b) => a.name.localeCompare(b.name))
    .map(t => `<option value="${t.code}" ${t.code === calendarFilter ? "selected" : ""}>${t.name}</option>`).join("");

  let html = `<h2 class="section-title">Calendário de jogos</h2>
    <p class="sim-note">Horários no fuso de <b>Brasília</b>. Clique num dia para ver os jogos — ou use a <b>Lista completa</b>.</p>
    <div class="prob-controls">
      <span style="font-size:13px;color:var(--muted)">Filtrar por seleção:</span>
      <select id="cal-filter" onchange="setCalFilter(this.value)">
        <option value="ALL" ${calendarFilter === "ALL" ? "selected" : ""}>🌎 Todas as seleções</option>
        ${opts}
      </select>
      ${calendarFilter !== "ALL" ? `<button class="ghost" onclick="setCalFilter('ALL')">✕ limpar filtro</button>` : ""}
      <button class="${calShowFull ? "" : "ghost"}" onclick="toggleCalFull()">📋 Lista completa</button>
    </div>`;

  if (!gameDates.length) {
    html += `<div class="panel"><div class="empty">Nenhum jogo encontrado para este filtro.</div></div>`;
    $("#view-calendar").innerHTML = html; return;
  }

  /* ----- modo LISTA COMPLETA ----- */
  if (calShowFull) {
    html += `<div class="panel">`;
    let lastDate = "";
    for (const fx of fixtures) {
      if (fx.brtDate !== lastDate) { html += `<div class="cal-day-head">${fmtDate(fx.brtDate)}</div>`; lastDate = fx.brtDate; }
      const e = effectiveScore(fx);
      html += matchCardHTML(fx, fx.played ? { hs: fx.hs, as: fx.as } : (e || null), e && e.sim);
    }
    html += `</div>`;
    $("#view-calendar").innerHTML = html;
    return;
  }

  /* ----- modo CALENDÁRIO (grade) ----- */
  // dia selecionado padrão: hoje (se tiver jogo) → próximo dia com jogo → 1º dia com jogo
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  if (!calSelectedDate || !byDate[calSelectedDate]) {
    calSelectedDate = byDate[today] ? today
      : (gameDates.find(d => d >= today) || gameDates[gameDates.length - 1]);
  }

  html += monthsGridHTML(byDate, calSelectedDate, "setCalDate", today);

  // jogos do dia selecionado
  const dayGames = byDate[calSelectedDate] || [];
  html += `<div class="cal-day-selected">
    <div class="cal-day-head">📅 ${fmtDate(calSelectedDate)} · ${dayGames.length} jogo${dayGames.length > 1 ? "s" : ""}</div>
    <div class="panel">`;
  for (const fx of dayGames) {
    const e = effectiveScore(fx);
    html += matchCardHTML(fx, fx.played ? { hs: fx.hs, as: fx.as } : (e || null), e && e.sim);
  }
  html += `</div></div>`;

  $("#view-calendar").innerHTML = html;
}

/* ---- 4. SIMULADOR ---- */
function renderSimulator() {
  const sel = $("#sim-group-select");
  const group = sel ? sel.value : GROUPS[0];
  const pending = ALL_FIXTURES.filter(f => f.group === group && !f.played);

  let html = `<h2 class="section-title">Simulador de resultados</h2>
    <p class="sim-note">Escolha um grupo, preencha placares hipotéticos dos jogos que ainda não aconteceram e veja a tabela se atualizar na hora.
    Marque a opção abaixo para que esses palpites também entrem no cálculo de probabilidades.</p>
    <div class="sim-controls">
      <select id="sim-group-select" onchange="renderSimulator()">
        ${GROUPS.map(g => `<option value="${g}" ${g === group ? "selected" : ""}>Grupo ${g}</option>`).join("")}
      </select>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)">
        <input type="checkbox" id="sim-affect" ${simAffectsProb ? "checked" : ""} onchange="toggleSimAffect(this.checked)">
        usar palpites nas probabilidades
      </label>
      <button class="ghost" onclick="clearSims('${group}')">🧹 limpar palpites do grupo</button>
    </div>
    <div class="panel">`;

  if (!pending.length) {
    html += `<div class="empty">Todos os jogos deste grupo já foram realizados. ✅</div>`;
  } else {
    for (const fx of pending) {
      const u = userSims[fx.id] || {};
      html += `<div class="sim-match">
        ${teamChip(fx.home, "home")}
        <div class="scorebox">
          <input type="number" min="0" max="20" value="${u.hs ?? ""}" onchange="setSim('${fx.id}','hs',this.value)">
          <span class="vs">x</span>
          <input type="number" min="0" max="20" value="${u.as ?? ""}" onchange="setSim('${fx.id}','as',this.value)">
        </div>
        ${teamChip(fx.away, "away")}
      </div>`;
    }
  }
  html += `</div>`;

  // tabela ao vivo com palpites
  html += `<h2 class="section-title">Como ficaria o Grupo ${group}</h2><div class="panel"><table class="standings">
    <thead><tr><th style="width:34px">#</th><th class="team-col">Seleção</th><th>J</th><th>SG</th><th>Pts</th></tr></thead><tbody>`;
  computeStandings(group).forEach((s, i) => {
    const cls = i < 2 ? "qual" : i === 2 ? "third" : "out";
    const t = TEAM_BY_CODE[s.code];
    html += `<tr class="${cls}"><td><span class="pos">${i + 1}</span></td>
      <td class="team-col tname">${flagImg(t.code)} ${t.name}</td>
      <td>${s.J}</td><td>${s.SG > 0 ? "+" + s.SG : s.SG}</td><td class="pts">${s.Pts}</td></tr>`;
  });
  html += `</tbody></table></div>`;
  $("#view-simulator").innerHTML = html;
}

function setSim(id, field, val) {
  userSims[id] = userSims[id] || { hs: "", as: "" };
  userSims[id][field] = val;
  saveState();
  renderSimulator();
}
function clearSims(group) {
  ALL_FIXTURES.filter(f => f.group === group && !f.played).forEach(f => delete userSims[f.id]);
  saveState(); renderSimulator();
}
function toggleSimAffect(v) { simAffectsProb = v; saveState(); }

/* ---- 5. PROBABILIDADES + DIFICULDADE ---- */
function renderProbabilities() {
  const el = $("#view-probabilities");
  el.innerHTML = `<h2 class="section-title">Probabilidade de classificação</h2>
    <div class="spinner">🎲 Rodando 3.000 simulações da Copa...</div>`;

  setTimeout(() => {
    const probs = runMonteCarlo(3000);
    let html = `<h2 class="section-title">Probabilidade de classificação</h2>
      <p class="sim-note">Probabilidade de avançar às oitavas (1º/2º direto + melhores terceiros), com base em 3.000 simulações que consideram a força das seleções e os jogos já realizados.
      ${simAffectsProb ? "<b>Seus palpites do simulador estão sendo considerados.</b>" : ""}</p>`;

    for (const g of GROUPS) {
      const rows = teamsOf(g).map(t => ({ t, p: probs[t.code] }))
        .sort((a, b) => b.p.total - a.p.total);
      html += `<div class="panel"><div style="font-weight:800;color:var(--gold-2);margin-bottom:10px">🏟️ Grupo ${g}</div>
        <table class="prob-table"><thead><tr>
          <th>Seleção</th><th style="width:46%">Classificação</th><th>Vencer grupo</th>
        </tr></thead><tbody>`;
      for (const { t, p } of rows) {
        const pct = Math.round(p.total * 100);
        html += `<tr>
          <td class="team-col">${flagImg(t.code)} ${t.name}</td>
          <td><div class="bar-wrap"><div class="bar" style="width:${Math.max(pct, 6)}%">${pct}%</div></div></td>
          <td><div class="bar-wrap"><div class="bar win" style="width:${Math.max(Math.round(p.win * 100), 6)}%">${Math.round(p.win * 100)}%</div></div></td>
        </tr>`;
      }
      html += `</tbody></table></div>`;
    }

    // Próximos jogos com nível de dificuldade
    html += `<h2 class="section-title">Próximos jogos & dificuldade</h2>
      <div class="prob-controls">
        <select id="diff-team-select" onchange="renderDifficulty(this.value)">
          ${TEAMS.slice().sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.code}">${t.name}</option>`).join("")}
        </select>
      </div>
      <div class="panel" id="diff-list"></div>`;
    el.innerHTML = html;
    renderDifficulty($("#diff-team-select").value);
  }, 30);
}

function renderDifficulty(teamCode) {
  const upcoming = ALL_FIXTURES.filter(f =>
    (f.home === teamCode || f.away === teamCode) && !f.played
  ).sort((a, b) => a.matchday - b.matchday);
  const list = $("#diff-list");
  if (!upcoming.length) { list.innerHTML = `<div class="empty">Sem jogos pendentes na fase de grupos.</div>`; return; }
  list.innerHTML = upcoming.map(fx => {
    const opp = fx.home === teamCode ? fx.away : fx.home;
    const d = matchDifficulty(teamCode, opp);
    const ot = TEAM_BY_CODE[opp];
    return `<div class="next-match-card">
      ${flagImg(opp, 34)}
      <div><b>${ot.name}</b><br><span style="font-size:12px;color:var(--muted)">${fx.matchday}ª rodada · ${fmtDate(fx.date)} · chance do adversário vencer: ${Math.round(d.pOppWin * 100)}%</span></div>
      <span class="diff-pill diff-${d.level}">${d.label}</span>
    </div>`;
  }).join("");
}

/* ============================================================
   MATA-MATA — chaveamento oficial (jogos 73–104)
   Classificados provisórios pelas tabelas atuais; vencedores
   projetados pelo modelo (favorito por rating).
   ============================================================ */
/* p: posição no grupo (1/2). c: grupos candidatos a 3º colocado. */
const R32 = [
  { m: 73, a: { p: 2, g: "A" }, b: { p: 2, g: "B" } },
  { m: 74, a: { p: 1, g: "E" }, b: { p: 3, c: ["A", "B", "C", "D", "F"] } },
  { m: 75, a: { p: 1, g: "F" }, b: { p: 2, g: "C" } },
  { m: 76, a: { p: 1, g: "C" }, b: { p: 2, g: "F" } },
  { m: 77, a: { p: 1, g: "I" }, b: { p: 3, c: ["C", "D", "F", "G", "H"] } },
  { m: 78, a: { p: 2, g: "E" }, b: { p: 2, g: "I" } },
  { m: 79, a: { p: 1, g: "A" }, b: { p: 3, c: ["C", "E", "F", "H", "I"] } },
  { m: 80, a: { p: 1, g: "L" }, b: { p: 3, c: ["E", "H", "I", "J", "K"] } },
  { m: 81, a: { p: 1, g: "D" }, b: { p: 3, c: ["B", "E", "F", "I", "J"] } },
  { m: 82, a: { p: 1, g: "G" }, b: { p: 3, c: ["A", "E", "H", "I", "J"] } },
  { m: 83, a: { p: 2, g: "K" }, b: { p: 2, g: "L" } },
  { m: 84, a: { p: 1, g: "H" }, b: { p: 2, g: "J" } },
  { m: 85, a: { p: 1, g: "B" }, b: { p: 3, c: ["E", "F", "G", "I", "J"] } },
  { m: 86, a: { p: 1, g: "J" }, b: { p: 2, g: "H" } },
  { m: 87, a: { p: 1, g: "K" }, b: { p: 3, c: ["D", "E", "I", "J", "L"] } },
  { m: 88, a: { p: 2, g: "D" }, b: { p: 2, g: "G" } },
];
const R16 = [[89, 74, 77], [90, 73, 75], [91, 76, 78], [92, 79, 80], [93, 83, 84], [94, 81, 82], [95, 86, 88], [96, 85, 87]];
const QF  = [[97, 89, 90], [98, 93, 94], [99, 91, 92], [100, 95, 96]];
const SF  = [[101, 97, 98], [102, 99, 100]];
const FINAL = [104, 101, 102];

/* Classificados provisórios: 1º/2º de cada grupo + 8 melhores 3º */
function getQualifiers() {
  const first = {}, second = {}, thirds = [];
  for (const g of GROUPS) {
    const st = computeStandings(g);
    first[g] = st[0].code; second[g] = st[1].code;
    thirds.push({ ...st[2], group: g });
  }
  thirds.sort(sortTeams);
  return { first, second, bestThirds: thirds.slice(0, 8) };
}

/* Distribui os 8 melhores 3º nos confrontos válidos (aproximação do Anexo C) */
function assignThirds(q) {
  const avail = q.bestThirds.slice();
  const res = {};
  for (const slot of R32.filter(x => x.b.p === 3)) {
    let i = avail.findIndex(t => slot.b.c.includes(t.group));
    if (i < 0) i = 0; // fallback
    const pick = avail.splice(i, 1)[0];
    if (pick) res[slot.m] = pick.code;
  }
  return res;
}

function favorite(a, b) {
  if (!a || !b) return a || b || null;
  return TEAM_BY_CODE[a].rating >= TEAM_BY_CODE[b].rating ? a : b;
}

/* R32 vem do sistema (classificados provisórios pelas tabelas) */
function systemR32() {
  const q = getQualifiers();
  const thirdMap = assignThirds(q);
  const pairs = {};
  for (const mt of R32) {
    const a = mt.a.p === 3 ? thirdMap[mt.m] : (mt.a.p === 1 ? q.first[mt.a.g] : q.second[mt.a.g]);
    const b = mt.b.p === 3 ? thirdMap[mt.m] : (mt.b.p === 1 ? q.first[mt.b.g] : q.second[mt.b.g]);
    pairs[mt.m] = [a, b];
  }
  return pairs;
}

/* FEEDERS[m] = os dois jogos que alimentam o jogo m */
const FEEDERS = {};
[...R16, ...QF, ...SF].forEach(([m, x, y]) => (FEEDERS[m] = [x, y]));
FEEDERS[FINAL[0]] = [FINAL[1], FINAL[2]];
const R32SET = new Set(R32.map(x => x.m));

function teamsInMatch(m, r32) {
  if (R32SET.has(m)) return r32[m] || [null, null];
  return [userBracket[m + "-0"] || null, userBracket[m + "-1"] || null];
}
/* seleções que PODEM entrar no jogo m (vêm dos dois jogos que o alimentam) */
function candidates(m, r32) {
  const [x, y] = FEEDERS[m] || [];
  return [...teamsInMatch(x, r32), ...teamsInMatch(y, r32)].filter(Boolean);
}
/* limpa escolhas que deixaram de ser válidas (em cascata) */
function validateBracket(r32) {
  const order = [...R16, ...QF, ...SF].map(a => a[0]).concat(FINAL[0]);
  for (const m of order) {
    const cand = candidates(m, r32);
    for (const idx of [0, 1]) {
      const k = m + "-" + idx;
      if (userBracket[k] && !cand.includes(userBracket[k])) delete userBracket[k];
    }
    if (userBracket[m + "-0"] && userBracket[m + "-0"] === userBracket[m + "-1"]) delete userBracket[m + "-1"];
  }
  if (userBracket.champion && !teamsInMatch(FINAL[0], r32).includes(userBracket.champion)) delete userBracket.champion;
}

/* ----- arrastar e soltar ----- */
function koDrag(ev, code) { ev.dataTransfer.setData("text", code); ev.dataTransfer.effectAllowed = "move"; }
function koAllow(ev) { ev.preventDefault(); }
function koDrop(ev, slotKey) {
  ev.preventDefault();
  const code = ev.dataTransfer.getData("text");
  if (!code) return;
  const r32 = systemR32();
  if (slotKey === "champion") {
    if (!teamsInMatch(FINAL[0], r32).includes(code)) return;
    userBracket.champion = code;
  } else {
    const m = parseInt(slotKey, 10);
    if (!candidates(m, r32).includes(code)) return;          // só aceita seleção válida
    const other = slotKey.endsWith("-0") ? m + "-1" : m + "-0";
    if (userBracket[other] === code) delete userBracket[other]; // evita time duplicado no jogo
    userBracket[slotKey] = code;
  }
  saveState(); renderKnockout();
}
function resetBracket() { userBracket = {}; saveState(); renderKnockout(); }
/* atalho: preenche tudo pelo favorito (rating) como ponto de partida */
function autoFill() {
  const r32 = systemR32(), W = {};
  R32.forEach(mt => (W[mt.m] = favorite(r32[mt.m][0], r32[mt.m][1])));
  for (const [m, x, y] of [...R16, ...QF, ...SF]) {
    userBracket[m + "-0"] = W[x]; userBracket[m + "-1"] = W[y]; W[m] = favorite(W[x], W[y]);
  }
  userBracket[FINAL[0] + "-0"] = W[FINAL[1]];
  userBracket[FINAL[0] + "-1"] = W[FINAL[2]];
  userBracket.champion = favorite(W[FINAL[1]], W[FINAL[2]]);
  saveState(); renderKnockout();
}

/* célula de origem (32 avos): só arrastável */
function koCellSrc(code) {
  if (!code) return `<div class="ko-slot empty"><span class="undecided">—</span></div>`;
  const t = TEAM_BY_CODE[code];
  return `<div class="ko-slot filled" draggable="true" ondragstart="koDrag(event,'${code}')">${flagImg(code)} <span>${t.name}</span></div>`;
}
/* célula das fases seguintes: arrastável (se preenchida) e alvo de drop */
function koCellSlot(m, idx) {
  const key = m + "-" + idx, code = userBracket[key];
  const dz = `ondragover="koAllow(event)" ondragenter="this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="this.classList.remove('dragover');koDrop(event,'${key}')"`;
  if (code) {
    const t = TEAM_BY_CODE[code];
    return `<div class="ko-slot filled" draggable="true" ondragstart="koDrag(event,'${code}')" ${dz}>${flagImg(code)} <span>${t.name}</span></div>`;
  }
  return `<div class="ko-slot empty" ${dz}><span class="undecided">arraste aqui</span></div>`;
}

/* Ordem dos confrontos seguindo o fluxo do bracket (cada par alimenta
   o jogo da fase seguinte na posição correspondente). */
const BRACKET_ORDER = {
  R32: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
  R16: [89, 90, 93, 94, 91, 92, 95, 96],
  QF:  [97, 98, 99, 100],
  SF:  [101, 102],
  FN:  [104],
};

function koRound(title, dateLbl, matchNums, { finalCol = false, isR32 = false, r32 = null } = {}) {
  let games = "";
  for (const m of matchNums) {
    let cells;
    if (isR32) { const [a, b] = r32[m] || [null, null]; cells = koCellSrc(a) + koCellSrc(b); }
    else cells = koCellSlot(m, 0) + koCellSlot(m, 1);
    games += `<div class="match"><div class="ko-match game">${cells}</div></div>`;
  }
  return `<div class="round ${finalCol ? "ko-final" : ""}">
    <div class="round-title"><b>${title}</b><span>${dateLbl}</span></div>
    <div class="matches">${games}</div>
  </div>`;
}

function renderKnockout() {
  const r32 = systemR32();
  validateBracket(r32);
  const champ = userBracket.champion;
  let html = `<h2 class="section-title">Mata-mata — monte o seu</h2>
    <p class="sim-note">Os <b>32 avos</b> vêm do sistema (classificados provisórios). Daí em diante, <b>arraste a seleção</b>
    vencedora de cada confronto para a vaga da fase seguinte e monte o chaveamento até o campeão. 🖱️</p>
    <div class="ko-tools">
      <button class="ghost" onclick="autoFill()">⚡ preencher pelo favorito</button>
      <button class="ghost" onclick="resetBracket()">↺ recomeçar</button>
    </div>
    <div class="panel"><div class="bracket">
      ${koRound("32 avos", "28/6–3/7", BRACKET_ORDER.R32, { isR32: true, r32 })}
      ${koRound("Oitavas", "4–7/7", BRACKET_ORDER.R16)}
      ${koRound("Quartas", "9–11/7", BRACKET_ORDER.QF)}
      ${koRound("Semis", "14–15/7", BRACKET_ORDER.SF)}
      ${koRound("Final", "19/7", BRACKET_ORDER.FN, { finalCol: true })}
    </div></div>
    <div class="champion-card"><div class="lbl">🏆 Campeão</div>
      <div class="champion-drop" ondragover="koAllow(event)" ondragenter="this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="this.classList.remove('dragover');koDrop(event,'champion')">
        ${champ ? `<div class="name">${flagImg(champ, 28)} ${TEAM_BY_CODE[champ].name}</div>` : `<span class="undecided">arraste o campeão aqui</span>`}
      </div>
    </div>`;
  $("#view-knockout").innerHTML = html;
}

/* ============================================================
   ARTILHARIA
   ============================================================ */
function renderScorers() {
  const list = (typeof SCORERS !== "undefined" ? SCORERS : []).slice()
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  let html = `<h2 class="section-title">Artilharia 👟</h2>`;
  if (!list.length) {
    html += `<div class="empty">Nenhum gol registrado ainda.</div>`;
    $("#view-scorers").innerHTML = html; return;
  }
  html += `<div class="panel"><table class="prob-table"><thead><tr>
    <th style="width:40px">#</th><th>Jogador</th><th>Seleção</th><th style="text-align:center">Gols</th>
  </tr></thead><tbody>`;
  let rank = 0, lastGoals = null, shown = 0;
  for (const s of list) {
    shown++;
    if (s.goals !== lastGoals) { rank = shown; lastGoals = s.goals; }
    const t = TEAM_BY_CODE[s.code];
    html += `<tr>
      <td><span class="pos" style="background:${rank === 1 ? "var(--gold)" : "#3a4a40"};color:${rank === 1 ? "#2a1d00" : "#fff"}">${rank}</span></td>
      <td class="team-col">${s.name}</td>
      <td>${flagImg(s.code)} ${t ? t.name : s.code}</td>
      <td style="text-align:center"><b style="color:var(--gold-2);font-size:15px">${"⚽".repeat(Math.min(s.goals, 3))} ${s.goals}</b></td>
    </tr>`;
  }
  html += `</tbody></table></div>`;
  $("#view-scorers").innerHTML = html;
}

/* ============================================================
   TEMA CLARO / ESCURO
   ============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("#theme-toggle");
  if (btn) btn.textContent = theme === "light" ? "🌙" : "☀️";
  localStorage.setItem("cw2026_theme", theme);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
}

/* ============================================================
   BOTÃO "ATUALIZAR TUDO" — gera o pedido pronto p/ o agente
   ============================================================ */
function openUpdatePrompt() {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const prompt = `Morgan, busca na web os resultados, placares, gols e notícias da Copa do Mundo 2026 de hoje (${hoje}) e atualiza: no data.js, os novos placares no array RESULTS ({ home, away, hs, as }) e os gols no array SCORERS ({ name, code, goals }); no config.js, as notícias no array NEWS ({ source, handle, time, text, tag }). Atualize também TOURNAMENT.lastUpdate.`;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal">
    <h3>🔄 Atualizar tudo via agente de IA</h3>
    <p class="sim-note">Copie o pedido abaixo e cole aqui no Claude Code (Morgan). Ele busca na web e atualiza os dados.</p>
    <textarea readonly id="update-text">${prompt}</textarea>
    <div class="modal-actions">
      <button class="primary" onclick="copyUpdatePrompt()">📋 Copiar pedido</button>
      <button class="ghost" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
    </div>
  </div>`;
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
function copyUpdatePrompt() {
  const ta = $("#update-text");
  ta.select();
  navigator.clipboard.writeText(ta.value).then(() => {
    const btn = document.querySelector(".modal-actions .primary");
    if (btn) { btn.textContent = "✅ Copiado!"; setTimeout(() => btn.textContent = "📋 Copiar pedido", 1500); }
  }).catch(() => {});
}

/* ============================================================
   MARCA (white-label) — aplica cores/logo/textos do config.js
   ============================================================ */
function applyBrand(b) {
  if (!b) return;
  const r = document.documentElement.style;
  if (b.cores) {
    if (b.cores.principal) r.setProperty("--brand", b.cores.principal);
    if (b.cores.escura) r.setProperty("--brand-dark", b.cores.escura);
    if (b.cores.destaque) r.setProperty("--brand-accent", b.cores.destaque);
  }
  const logo = $("#brand-logo"); if (logo && b.logo) logo.innerHTML = b.logo;
  const nm = $(".brand-name"); if (nm && b.nome) nm.textContent = b.nome;
  const tg = $(".brand-tag"); if (tg && b.slogan) tg.textContent = b.slogan;
  const cr = $(".brand-creci"); if (cr && b.registro) cr.textContent = b.registro;
  const ft = $("#site-footer");
  if (ft) ft.innerHTML = `<b>${b.nome}</b> — ${b.slogan}${b.registro ? " · " + b.registro : ""}<br>⚽ Painel da Copa 2026 · dados atualizados via agente de IA`;
  if (b.nome) document.title = `${b.nome} · Copa do Mundo 2026`;
}

/* ============================================================
   PAINEL LATERAL DE NOTÍCIAS (estilo Twitter/X)
   ============================================================ */
function renderNews() {
  const list = typeof NEWS !== "undefined" ? NEWS : [];
  const el = $("#news-list");
  if (!el) return;
  if (!list.length) { el.innerHTML = `<div class="empty">Sem notícias no momento.</div>`; return; }
  el.innerHTML = list.map(n => `
    <article class="news-card">
      <div class="news-card-top">
        <span class="news-avatar">🇧🇷</span>
        <div class="news-meta">
          <b>${n.source}</b>
          <span>${n.handle} · ${n.time}</span>
        </div>
        ${n.tag ? `<span class="news-tag">${n.tag}</span>` : ""}
      </div>
      <p class="news-text">${n.text}</p>
    </article>`).join("");
}
function toggleNews(force) {
  const d = $("#news-drawer"), b = $("#news-backdrop");
  const open = force !== undefined ? force : !d.classList.contains("open");
  d.classList.toggle("open", open);
  b.classList.toggle("show", open);
}

/* ============================================================
   BARRA LATERAL FIXA DE ANÚNCIOS (cards imobiliários)
   ============================================================ */
function renderAds() {
  const list = typeof ADS !== "undefined" ? ADS : [];
  const el = $("#ads-list");
  if (!el) return;
  if (!list.length) { el.innerHTML = `<div class="empty">Sem anúncios no momento.</div>`; return; }
  el.innerHTML = list.map(a => {
    // Formato BANNER: arte pronta (imagem inteira) + botão de WhatsApp.
    if (a.banner) {
      const href = a.phone ? `https://wa.me/${a.phone}${a.waText ? "?text=" + encodeURIComponent(a.waText) : ""}` : (a.link || "#");
      return `
      <article class="ad-card ad-banner">
        <a class="ad-banner-img" href="${href}" target="_blank" rel="noopener">
          <img src="${a.banner}" alt="${a.title || "Anúncio"}" loading="lazy">
        </a>
        ${a.cta ? `<a class="ad-contact" href="${href}" target="_blank" rel="noopener">
          <span class="ad-wa">📲</span> ${a.cta}
        </a>` : ""}
      </article>`;
    }
    // Formato CARD montado (campos).
    return `
    <article class="ad-card">
      <div class="ad-top"><span class="ad-type">${a.type}</span><span class="ad-code">Cód. ${a.code}</span></div>
      <div class="ad-body">
        <div class="ad-loc">📍 ${a.neighborhood}</div>
        <div class="ad-photo" style="background-image:url('${a.img}')">
          ${a.badge ? `<span class="ad-badge">${a.badge}</span>` : ""}
        </div>
        <div class="ad-title">${a.title}</div>
        <div class="ad-features">
          ${a.features.map(f => `<div class="ad-feat"><span class="ad-feat-ic">${f.icon}</span><span>${f.label}</span></div>`).join("")}
        </div>
      </div>
      <div class="ad-price">${a.price}</div>
      <div class="ad-condo">${a.condoLabel || "Condomínio"}: ${a.condo}</div>
      <a class="ad-contact" href="https://wa.me/${a.phone}" target="_blank" rel="noopener">
        <span class="ad-wa">📞</span> ${a.phoneFmt}
      </a>
    </article>`;
  }).join("");
}

/* ---- Persistência local ---- */
function saveState() {
  localStorage.setItem("cw2026_sims", JSON.stringify({ userSims, simAffectsProb, userBracket }));
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem("cw2026_sims"));
    if (s) { userSims = s.userSims || {}; simAffectsProb = !!s.simAffectsProb; userBracket = s.userBracket || {}; }
  } catch (e) {}
}

/* ---- Navegação ---- */
const RENDERERS = {
  results: renderResults, groups: renderGroups, calendar: renderCalendar,
  simulator: renderSimulator, probabilities: renderProbabilities, knockout: renderKnockout,
  scorers: renderScorers,
};
function showTab(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  $("#view-" + name).classList.add("active");
  RENDERERS[name]();
}

/* ---- Init ---- */
function init() {
  loadState();
  applyBrand(typeof BRAND !== "undefined" ? BRAND : null);
  applyTheme(localStorage.getItem("cw2026_theme") || "light");
  const tt = $("#theme-toggle"); if (tt) tt.addEventListener("click", toggleTheme);
  const ub = $("#update-all-btn"); if (ub) ub.addEventListener("click", openUpdatePrompt);
  renderNews();
  const nt = $("#news-toggle"); if (nt) nt.addEventListener("click", () => toggleNews());
  const nc = $("#news-close"); if (nc) nc.addEventListener("click", () => toggleNews(false));
  const nb = $("#news-backdrop"); if (nb) nb.addEventListener("click", () => toggleNews(false));
  renderAds();
  $("#update-badge").textContent = "Atualizado em " + new Date(TOURNAMENT.lastUpdate + "T00:00:00").toLocaleDateString("pt-BR");
  $("#hosts").textContent = TOURNAMENT.hosts;
  document.querySelectorAll("nav.tabs button").forEach(b =>
    b.addEventListener("click", () => showTab(b.dataset.tab)));
  showTab("results");
}
document.addEventListener("DOMContentLoaded", init);
