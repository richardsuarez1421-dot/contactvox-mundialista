// ============================================================
// Copa Mundial Contactvox 2026 — Shared Data Layer
// Persists via localStorage. Both pages read/write this file.
// ============================================================

const CVX = (() => {

  // ── STORAGE KEYS ────────────────────────────────────────
  const KEY_PRONOSTICOS  = 'cvx2026_pronosticos';   // { [userId]: { [matchId]: {l,v} } }
  const KEY_RESULTADOS   = 'cvx2026_resultados';    // { [matchId]: {l,v} }
  const KEY_USUARIOS     = 'cvx2026_usuarios';      // [{ id, name, dept }]
  const KEY_ESPECIALES   = 'cvx2026_especiales';    // { [userId]: { campeon, sub, goleador, revelacion } }
  const KEY_CURRENT_USER = 'cvx2026_current_user';  // userId string

  // ── MATCHES DATA ─────────────────────────────────────────
  const MATCHES = [
    // ── GRUPO A ──
    { id:'A1', group:'A', local:'México',        visit:'Sudáfrica',           date:'Jue 11 Jun', sede:'Mexico City Stadium' },
    { id:'A2', group:'A', local:'Corea del Sur', visit:'Chequia',             date:'Jue 11 Jun', sede:'Estadio Guadalajara' },
    { id:'A3', group:'A', local:'Chequia',       visit:'Sudáfrica',           date:'Jue 18 Jun', sede:'Atlanta Stadium' },
    { id:'A4', group:'A', local:'México',        visit:'Corea del Sur',       date:'Jue 18 Jun', sede:'Estadio Guadalajara' },
    { id:'A5', group:'A', local:'Chequia',       visit:'México',              date:'Mié 24 Jun', sede:'Mexico City Stadium' },
    { id:'A6', group:'A', local:'Sudáfrica',     visit:'Corea del Sur',       date:'Mié 24 Jun', sede:'Estadio Monterrey' },
    // ── GRUPO B ──
    { id:'B1', group:'B', local:'Canadá',        visit:'Bosnia y Herzegovina',date:'Vie 12 Jun', sede:'Toronto Stadium' },
    { id:'B2', group:'B', local:'Catar',         visit:'Suiza',               date:'Sáb 13 Jun', sede:'San Francisco Bay Area' },
    { id:'B3', group:'B', local:'Suiza',         visit:'Bosnia y Herzegovina',date:'Jue 18 Jun', sede:'Los Angeles Stadium' },
    { id:'B4', group:'B', local:'Canadá',        visit:'Catar',               date:'Jue 18 Jun', sede:'BC Place Vancouver' },
    { id:'B5', group:'B', local:'Suiza',         visit:'Canadá',              date:'Mié 24 Jun', sede:'BC Place Vancouver' },
    { id:'B6', group:'B', local:'Bosnia y Herz.',visit:'Catar',               date:'Mié 24 Jun', sede:'Seattle Stadium' },
    // ── GRUPO C ──
    { id:'C1', group:'C', local:'Haití',         visit:'Escocia',             date:'Sáb 13 Jun', sede:'Boston Stadium' },
    { id:'C2', group:'C', local:'Brasil',        visit:'Marruecos',           date:'Sáb 13 Jun', sede:'New York/New Jersey' },
    { id:'C3', group:'C', local:'Brasil',        visit:'Haití',               date:'Vie 19 Jun', sede:'Philadelphia Stadium' },
    { id:'C4', group:'C', local:'Escocia',       visit:'Marruecos',           date:'Vie 19 Jun', sede:'Boston Stadium' },
    { id:'C5', group:'C', local:'Escocia',       visit:'Brasil',              date:'Mié 24 Jun', sede:'Miami Stadium' },
    { id:'C6', group:'C', local:'Marruecos',     visit:'Haití',               date:'Mié 24 Jun', sede:'Atlanta Stadium' },
    // ── GRUPO D ──
    { id:'D1', group:'D', local:'Estados Unidos',visit:'Paraguay',            date:'Vie 12 Jun', sede:'Los Angeles Stadium' },
    { id:'D2', group:'D', local:'Australia',     visit:'Türkiye',             date:'Sáb 13 Jun', sede:'BC Place Vancouver' },
    { id:'D3', group:'D', local:'Türkiye',       visit:'Paraguay',            date:'Vie 19 Jun', sede:'San Francisco Bay Area' },
    { id:'D4', group:'D', local:'Estados Unidos',visit:'Australia',           date:'Vie 19 Jun', sede:'Seattle Stadium' },
    { id:'D5', group:'D', local:'Türkiye',       visit:'Estados Unidos',      date:'Jue 25 Jun', sede:'Los Angeles Stadium' },
    { id:'D6', group:'D', local:'Paraguay',      visit:'Australia',           date:'Jue 25 Jun', sede:'San Francisco Bay Area' },
    // ── GRUPO E ──
    { id:'E1', group:'E', local:'Costa de Marfil',visit:'Ecuador',            date:'Dom 14 Jun', sede:'Philadelphia Stadium' },
    { id:'E2', group:'E', local:'Alemania',      visit:'Curazao',             date:'Dom 14 Jun', sede:'Houston Stadium' },
    { id:'E3', group:'E', local:'Alemania',      visit:'Costa de Marfil',     date:'Sáb 20 Jun', sede:'Toronto Stadium' },
    { id:'E4', group:'E', local:'Ecuador',       visit:'Curazao',             date:'Sáb 20 Jun', sede:'Kansas City Stadium' },
    { id:'E5', group:'E', local:'Curazao',       visit:'Costa de Marfil',     date:'Jue 25 Jun', sede:'Philadelphia Stadium' },
    { id:'E6', group:'E', local:'Ecuador',       visit:'Alemania',            date:'Jue 25 Jun', sede:'New York/New Jersey' },
    // ── GRUPO F ──
    { id:'F1', group:'F', local:'Países Bajos',  visit:'Japón',               date:'Dom 14 Jun', sede:'Dallas Stadium' },
    { id:'F2', group:'F', local:'Suecia',        visit:'Túnez',               date:'Dom 14 Jun', sede:'Estadio Monterrey' },
    { id:'F3', group:'F', local:'Países Bajos',  visit:'Suecia',              date:'Sáb 20 Jun', sede:'Houston Stadium' },
    { id:'F4', group:'F', local:'Túnez',         visit:'Japón',               date:'Sáb 20 Jun', sede:'Estadio Monterrey' },
    { id:'F5', group:'F', local:'Japón',         visit:'Suecia',              date:'Jue 25 Jun', sede:'Dallas Stadium' },
    { id:'F6', group:'F', local:'Túnez',         visit:'Países Bajos',        date:'Jue 25 Jun', sede:'Kansas City Stadium' },
    // ── GRUPO G ──
    { id:'G1', group:'G', local:'Irán',          visit:'Nueva Zelanda',       date:'Lun 15 Jun', sede:'Los Angeles Stadium' },
    { id:'G2', group:'G', local:'Bélgica',       visit:'Egipto',              date:'Lun 15 Jun', sede:'Seattle Stadium' },
    { id:'G3', group:'G', local:'Bélgica',       visit:'Irán',                date:'Dom 21 Jun', sede:'Los Angeles Stadium' },
    { id:'G4', group:'G', local:'Nueva Zelanda', visit:'Egipto',              date:'Dom 21 Jun', sede:'BC Place Vancouver' },
    { id:'G5', group:'G', local:'Egipto',        visit:'Irán',                date:'Vie 26 Jun', sede:'Seattle Stadium' },
    { id:'G6', group:'G', local:'Nueva Zelanda', visit:'Bélgica',             date:'Vie 26 Jun', sede:'BC Place Vancouver' },
    // ── GRUPO H ──
    { id:'H1', group:'H', local:'Arabia Saudita',visit:'Uruguay',             date:'Lun 15 Jun', sede:'Miami Stadium' },
    { id:'H2', group:'H', local:'España',        visit:'Cabo Verde',          date:'Lun 15 Jun', sede:'Atlanta Stadium' },
    { id:'H3', group:'H', local:'Uruguay',       visit:'Cabo Verde',          date:'Dom 21 Jun', sede:'Miami Stadium' },
    { id:'H4', group:'H', local:'España',        visit:'Arabia Saudita',      date:'Dom 21 Jun', sede:'Atlanta Stadium' },
    { id:'H5', group:'H', local:'Cabo Verde',    visit:'Arabia Saudita',      date:'Vie 26 Jun', sede:'Houston Stadium' },
    { id:'H6', group:'H', local:'Uruguay',       visit:'España',              date:'Vie 26 Jun', sede:'Estadio Guadalajara' },
    // ── GRUPO I ──
    { id:'I1', group:'I', local:'Francia',       visit:'Senegal',             date:'Mar 16 Jun', sede:'New York/New Jersey' },
    { id:'I2', group:'I', local:'Irak',          visit:'Noruega',             date:'Mar 16 Jun', sede:'Boston Stadium' },
    { id:'I3', group:'I', local:'Noruega',       visit:'Senegal',             date:'Lun 22 Jun', sede:'New York/New Jersey' },
    { id:'I4', group:'I', local:'Francia',       visit:'Irak',                date:'Lun 22 Jun', sede:'Philadelphia Stadium' },
    { id:'I5', group:'I', local:'Noruega',       visit:'Francia',             date:'Vie 26 Jun', sede:'Boston Stadium' },
    { id:'I6', group:'I', local:'Senegal',       visit:'Irak',                date:'Vie 26 Jun', sede:'Toronto Stadium' },
    // ── GRUPO J ──
    { id:'J1', group:'J', local:'Argentina',     visit:'Argelia',             date:'Mar 16 Jun', sede:'Kansas City Stadium' },
    { id:'J2', group:'J', local:'Austria',       visit:'Jordania',            date:'Mar 16 Jun', sede:'San Francisco Bay Area' },
    { id:'J3', group:'J', local:'Argentina',     visit:'Austria',             date:'Lun 22 Jun', sede:'Dallas Stadium' },
    { id:'J4', group:'J', local:'Jordania',      visit:'Argelia',             date:'Lun 22 Jun', sede:'San Francisco Bay Area' },
    { id:'J5', group:'J', local:'Argelia',       visit:'Austria',             date:'Sáb 27 Jun', sede:'Kansas City Stadium' },
    { id:'J6', group:'J', local:'Jordania',      visit:'Argentina',           date:'Sáb 27 Jun', sede:'Dallas Stadium' },
    // ── GRUPO K ──
    { id:'K1', group:'K', local:'Portugal',      visit:'Congo DR',            date:'Mié 17 Jun', sede:'Houston Stadium' },
    { id:'K2', group:'K', local:'Uzbekistán',    visit:'Colombia',            date:'Mié 17 Jun', sede:'Mexico City Stadium' },
    { id:'K3', group:'K', local:'Portugal',      visit:'Uzbekistán',          date:'Mar 23 Jun', sede:'Houston Stadium' },
    { id:'K4', group:'K', local:'Colombia',      visit:'Congo DR',            date:'Mar 23 Jun', sede:'Estadio Guadalajara' },
    { id:'K5', group:'K', local:'Colombia',      visit:'Portugal',            date:'Sáb 27 Jun', sede:'Miami Stadium' },
    { id:'K6', group:'K', local:'Congo DR',      visit:'Uzbekistán',          date:'Sáb 27 Jun', sede:'Atlanta Stadium' },
    // ── GRUPO L ──
    { id:'L1', group:'L', local:'Ghana',         visit:'Panamá',              date:'Mié 17 Jun', sede:'Toronto Stadium' },
    { id:'L2', group:'L', local:'Inglaterra',    visit:'Croacia',             date:'Mié 17 Jun', sede:'Dallas Stadium' },
    { id:'L3', group:'L', local:'Inglaterra',    visit:'Ghana',               date:'Mar 23 Jun', sede:'Boston Stadium' },
    { id:'L4', group:'L', local:'Panamá',        visit:'Croacia',             date:'Mar 23 Jun', sede:'Toronto Stadium' },
    { id:'L5', group:'L', local:'Panamá',        visit:'Inglaterra',          date:'Sáb 27 Jun', sede:'New York/New Jersey' },
    { id:'L6', group:'L', local:'Croacia',       visit:'Ghana',               date:'Sáb 27 Jun', sede:'Philadelphia Stadium' },
  ];

  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  // ── FLAGS MAP ────────────────────────────────────────────
  const FLAGS = {
    'México':'🇲🇽','Sudáfrica':'🇿🇦','Corea del Sur':'🇰🇷','Chequia':'🇨🇿',
    'Canadá':'🇨🇦','Bosnia y Herzegovina':'🇧🇦','Bosnia y Herz.':'🇧🇦',
    'Catar':'🇶🇦','Suiza':'🇨🇭','Haití':'🇭🇹','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Brasil':'🇧🇷','Marruecos':'🇲🇦','Estados Unidos':'🇺🇸','Paraguay':'🇵🇾',
    'Australia':'🇦🇺','Türkiye':'🇹🇷','Costa de Marfil':'🇨🇮','Ecuador':'🇪🇨',
    'Alemania':'🇩🇪','Curazao':'🇨🇼','Países Bajos':'🇳🇱','Japón':'🇯🇵',
    'Suecia':'🇸🇪','Túnez':'🇹🇳','Irán':'🇮🇷','Nueva Zelanda':'🇳🇿',
    'Bélgica':'🇧🇪','Egipto':'🇪🇬','Arabia Saudita':'🇸🇦','Uruguay':'🇺🇾',
    'España':'🇪🇸','Cabo Verde':'🇨🇻','Francia':'🇫🇷','Senegal':'🇸🇳',
    'Irak':'🇮🇶','Noruega':'🇳🇴','Argentina':'🇦🇷','Argelia':'🇩🇿',
    'Austria':'🇦🇹','Jordania':'🇯🇴','Portugal':'🇵🇹','Congo DR':'🇨🇩',
    'Uzbekistán':'🇺🇿','Colombia':'🇨🇴','Ghana':'🇬🇭','Panamá':'🇵🇦',
    'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croacia':'🇭🇷',
  };

  // ── SCORING LOGIC ────────────────────────────────────────
  // Returns { pts, label } for a given pronostico vs resultado
  function calcPoints(pron, res, phase='grupo') {
    if (res.l === '' || res.l === null || res.l === undefined) return { pts: 0, label: 'pendiente' };
    if (pron.l === '' || pron.l === null || pron.l === undefined) return { pts: 0, label: 'sin pronostico' };

    const pl = parseInt(pron.l), pv = parseInt(pron.v);
    const rl = parseInt(res.l),  rv = parseInt(res.v);
    const isElim = phase === 'elim';

    // resultado exacto
    if (pl === rl && pv === rv) {
      const base = isElim ? 8 : 5;
      const diff = (pl - pv) === (rl - rv) ? 1 : 0; // siempre aplica en exacto
      return { pts: base, label: 'exacto' };
    }

    // ganador / empate correcto
    const pronResult = pl > pv ? 'L' : pl < pv ? 'V' : 'E';
    const realResult = rl > rv ? 'L' : rl < rv ? 'V' : 'E';

    let pts = 0;
    let label = 'fallo';

    if (pronResult === realResult) {
      pts += isElim ? 3 : 3;  // ganador correcto
      label = 'ganador';
      // bonus diferencia de goles (solo grupos)
      if (!isElim && (pl - pv) === (rl - rv)) {
        pts += 1;
        label = 'ganador+diff';
      }
      // equipo clasificado fase elim
      if (isElim) {
        pts = 5; label = 'clasificado';
      }
    }

    return { pts, label };
  }

  // ── STORAGE HELPERS ──────────────────────────────────────
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function getPronosticos()  { return load(KEY_PRONOSTICOS) || {}; }
  function getResultados()   { return load(KEY_RESULTADOS)  || {}; }
  function getUsuarios()     { return load(KEY_USUARIOS)    || []; }
  function getEspeciales()   { return load(KEY_ESPECIALES)  || {}; }
  function getCurrentUser()  { return load(KEY_CURRENT_USER); }

  function savePronostico(userId, matchId, l, v) {
    const all = getPronosticos();
    if (!all[userId]) all[userId] = {};
    all[userId][matchId] = { l: String(l), v: String(v) };
    save(KEY_PRONOSTICOS, all);
  }

  function saveResultado(matchId, l, v) {
    const all = getResultados();
    all[matchId] = { l: String(l), v: String(v) };
    save(KEY_RESULTADOS, all);
  }

  function saveUsuario(user) {
    const all = getUsuarios();
    const idx = all.findIndex(u => u.id === user.id);
    if (idx >= 0) all[idx] = user; else all.push(user);
    save(KEY_USUARIOS, all);
  }

  function setCurrentUser(userId) { save(KEY_CURRENT_USER, userId); }

  function saveEspecial(userId, data) {
    const all = getEspeciales();
    all[userId] = data;
    save(KEY_ESPECIALES, all);
  }

  // ── RANKING CALCULATOR ───────────────────────────────────
  function buildRanking() {
    const usuarios   = getUsuarios();
    const pronosticos = getPronosticos();
    const resultados  = getResultados();

    return usuarios.map(u => {
      let pts = 0, exactos = 0, ganadores = 0, conDiff = 0, jugados = 0;
      MATCHES.forEach(m => {
        const res  = resultados[m.id];
        const pron = (pronosticos[u.id] || {})[m.id];
        if (!res || res.l === '' || res.l === undefined) return;
        jugados++;
        if (!pron) return;
        const phase = 'grupo'; // all current are group stage
        const r = calcPoints(pron, res, phase);
        pts += r.pts;
        if (r.label === 'exacto')        exactos++;
        if (r.label === 'ganador' || r.label === 'ganador+diff' || r.label === 'clasificado') ganadores++;
        if (r.label === 'ganador+diff')  conDiff++;
      });
      return { ...u, pts, exactos, ganadores, conDiff, jugados };
    }).sort((a, b) => b.pts - a.pts || b.exactos - a.exactos);
  }

  return {
    MATCHES, GROUPS, FLAGS,
    calcPoints,
    getPronosticos, getResultados, getUsuarios, getEspeciales, getCurrentUser,
    savePronostico, saveResultado, saveUsuario, setCurrentUser, saveEspecial,
    buildRanking,
  };
})();
