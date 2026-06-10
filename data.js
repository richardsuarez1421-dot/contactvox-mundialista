// ================================================================
// Copa Mundial Contactvox 2026 — Data Layer v3 (Google Sheets)
// ================================================================
// Conectado a Google Sheets via Apps Script Web App.
// El diseño de index.html y admin.html no cambia en absoluto.
//
// SISTEMA DE PUNTOS:
// ── FASE DE GRUPOS ──────────────────────────────────────────────
//   Marcador exacto                                        → 5 pts
//   Ganador correcto + diferencia de goles exacta          → 4 pts
//   Solo ganador o empate correcto                         → 2 pts
//   Ningún acierto                                         → 0 pts
//
// ── OCTAVOS ─────────────────────────────────────────────────────
//   Marcador exacto en 90 min                              → 8 pts
//   Clasificado correcto                                   → 4 pts
//
// ── CUARTOS ─────────────────────────────────────────────────────
//   Marcador exacto en 90 min                              → 10 pts
//   Clasificado correcto                                   → 5 pts
//
// ── SEMIFINALES ─────────────────────────────────────────────────
//   Marcador exacto en 90 min                              → 12 pts
//   Clasificado correcto                                   → 6 pts
//
// ── TERCER PUESTO ───────────────────────────────────────────────
//   Marcador exacto                                        → 8 pts
//   Ganador correcto                                       → 4 pts
//
// ── GRAN FINAL ──────────────────────────────────────────────────
//   Marcador exacto en 90 min                              → 15 pts
//   Campeón correcto                                       → 8 pts
//
// ── PREDICCIONES ESPECIALES ─────────────────────────────────────
//   Campeón del mundo → 10 pts  |  Subcampeón      → 6 pts
//   Goleador          → 8 pts   |  Revelación       → 5 pts
// ================================================================

const CVX = (() => {

  // ── URL DEL WEB APP ───────────────────────────────────────────
  const API_URL = 'https://script.google.com/macros/s/AKfycbyGJhn8dALyik8ITGXuJwJEsNJh3WJsQvwdfF_ysaMDvSGwXtR1ADUwBoWnEKBmNgsX2Q/exec';

  // ── TABLA DE PUNTOS POR FASE ──────────────────────────────────
  const PUNTOS = {
    grupo:   { exacto: 5, ganadorDiff: 4, ganador: 2, fallo: 0 },
    octavos: { exacto: 8, clasificado: 4, fallo: 0 },
    cuartos: { exacto: 10, clasificado: 5, fallo: 0 },
    semis:   { exacto: 12, clasificado: 6, fallo: 0 },
    tercero: { exacto: 8,  ganador: 4,  fallo: 0 },
    final:   { exacto: 15, ganador: 8,  fallo: 0 },
  };

  // ── PARTIDOS FASE DE GRUPOS (72 partidos) ─────────────────────
  const MATCHES_GRUPOS = [
    { id:'A1', phase:'grupo', group:'A', local:'México',         visit:'Sudáfrica',            date:'Jue 11 Jun', sede:'Mexico City Stadium' },
    { id:'A2', phase:'grupo', group:'A', local:'Corea del Sur',  visit:'Chequia',              date:'Jue 11 Jun', sede:'Estadio Guadalajara' },
    { id:'A3', phase:'grupo', group:'A', local:'Chequia',        visit:'Sudáfrica',            date:'Jue 18 Jun', sede:'Atlanta Stadium' },
    { id:'A4', phase:'grupo', group:'A', local:'México',         visit:'Corea del Sur',        date:'Jue 18 Jun', sede:'Estadio Guadalajara' },
    { id:'A5', phase:'grupo', group:'A', local:'Chequia',        visit:'México',               date:'Mié 24 Jun', sede:'Mexico City Stadium' },
    { id:'A6', phase:'grupo', group:'A', local:'Sudáfrica',      visit:'Corea del Sur',        date:'Mié 24 Jun', sede:'Estadio Monterrey' },
    { id:'B1', phase:'grupo', group:'B', local:'Canadá',         visit:'Bosnia y Herzegovina', date:'Vie 12 Jun', sede:'Toronto Stadium' },
    { id:'B2', phase:'grupo', group:'B', local:'Catar',          visit:'Suiza',                date:'Sáb 13 Jun', sede:'San Francisco Bay Area' },
    { id:'B3', phase:'grupo', group:'B', local:'Suiza',          visit:'Bosnia y Herzegovina', date:'Jue 18 Jun', sede:'Los Angeles Stadium' },
    { id:'B4', phase:'grupo', group:'B', local:'Canadá',         visit:'Catar',                date:'Jue 18 Jun', sede:'BC Place Vancouver' },
    { id:'B5', phase:'grupo', group:'B', local:'Suiza',          visit:'Canadá',               date:'Mié 24 Jun', sede:'BC Place Vancouver' },
    { id:'B6', phase:'grupo', group:'B', local:'Bosnia y Herz.', visit:'Catar',                date:'Mié 24 Jun', sede:'Seattle Stadium' },
    { id:'C1', phase:'grupo', group:'C', local:'Haití',          visit:'Escocia',              date:'Sáb 13 Jun', sede:'Boston Stadium' },
    { id:'C2', phase:'grupo', group:'C', local:'Brasil',         visit:'Marruecos',            date:'Sáb 13 Jun', sede:'New York/New Jersey' },
    { id:'C3', phase:'grupo', group:'C', local:'Brasil',         visit:'Haití',                date:'Vie 19 Jun', sede:'Philadelphia Stadium' },
    { id:'C4', phase:'grupo', group:'C', local:'Escocia',        visit:'Marruecos',            date:'Vie 19 Jun', sede:'Boston Stadium' },
    { id:'C5', phase:'grupo', group:'C', local:'Escocia',        visit:'Brasil',               date:'Mié 24 Jun', sede:'Miami Stadium' },
    { id:'C6', phase:'grupo', group:'C', local:'Marruecos',      visit:'Haití',                date:'Mié 24 Jun', sede:'Atlanta Stadium' },
    { id:'D1', phase:'grupo', group:'D', local:'Estados Unidos', visit:'Paraguay',             date:'Vie 12 Jun', sede:'Los Angeles Stadium' },
    { id:'D2', phase:'grupo', group:'D', local:'Australia',      visit:'Türkiye',              date:'Sáb 13 Jun', sede:'BC Place Vancouver' },
    { id:'D3', phase:'grupo', group:'D', local:'Türkiye',        visit:'Paraguay',             date:'Vie 19 Jun', sede:'San Francisco Bay Area' },
    { id:'D4', phase:'grupo', group:'D', local:'Estados Unidos', visit:'Australia',            date:'Vie 19 Jun', sede:'Seattle Stadium' },
    { id:'D5', phase:'grupo', group:'D', local:'Türkiye',        visit:'Estados Unidos',       date:'Jue 25 Jun', sede:'Los Angeles Stadium' },
    { id:'D6', phase:'grupo', group:'D', local:'Paraguay',       visit:'Australia',            date:'Jue 25 Jun', sede:'San Francisco Bay Area' },
    { id:'E1', phase:'grupo', group:'E', local:'Costa de Marfil',visit:'Ecuador',              date:'Dom 14 Jun', sede:'Philadelphia Stadium' },
    { id:'E2', phase:'grupo', group:'E', local:'Alemania',       visit:'Curazao',              date:'Dom 14 Jun', sede:'Houston Stadium' },
    { id:'E3', phase:'grupo', group:'E', local:'Alemania',       visit:'Costa de Marfil',      date:'Sáb 20 Jun', sede:'Toronto Stadium' },
    { id:'E4', phase:'grupo', group:'E', local:'Ecuador',        visit:'Curazao',              date:'Sáb 20 Jun', sede:'Kansas City Stadium' },
    { id:'E5', phase:'grupo', group:'E', local:'Curazao',        visit:'Costa de Marfil',      date:'Jue 25 Jun', sede:'Philadelphia Stadium' },
    { id:'E6', phase:'grupo', group:'E', local:'Ecuador',        visit:'Alemania',             date:'Jue 25 Jun', sede:'New York/New Jersey' },
    { id:'F1', phase:'grupo', group:'F', local:'Países Bajos',   visit:'Japón',                date:'Dom 14 Jun', sede:'Dallas Stadium' },
    { id:'F2', phase:'grupo', group:'F', local:'Suecia',         visit:'Túnez',                date:'Dom 14 Jun', sede:'Estadio Monterrey' },
    { id:'F3', phase:'grupo', group:'F', local:'Países Bajos',   visit:'Suecia',               date:'Sáb 20 Jun', sede:'Houston Stadium' },
    { id:'F4', phase:'grupo', group:'F', local:'Túnez',          visit:'Japón',                date:'Sáb 20 Jun', sede:'Estadio Monterrey' },
    { id:'F5', phase:'grupo', group:'F', local:'Japón',          visit:'Suecia',               date:'Jue 25 Jun', sede:'Dallas Stadium' },
    { id:'F6', phase:'grupo', group:'F', local:'Túnez',          visit:'Países Bajos',         date:'Jue 25 Jun', sede:'Kansas City Stadium' },
    { id:'G1', phase:'grupo', group:'G', local:'Irán',           visit:'Nueva Zelanda',        date:'Lun 15 Jun', sede:'Los Angeles Stadium' },
    { id:'G2', phase:'grupo', group:'G', local:'Bélgica',        visit:'Egipto',               date:'Lun 15 Jun', sede:'Seattle Stadium' },
    { id:'G3', phase:'grupo', group:'G', local:'Bélgica',        visit:'Irán',                 date:'Dom 21 Jun', sede:'Los Angeles Stadium' },
    { id:'G4', phase:'grupo', group:'G', local:'Nueva Zelanda',  visit:'Egipto',               date:'Dom 21 Jun', sede:'BC Place Vancouver' },
    { id:'G5', phase:'grupo', group:'G', local:'Egipto',         visit:'Irán',                 date:'Vie 26 Jun', sede:'Seattle Stadium' },
    { id:'G6', phase:'grupo', group:'G', local:'Nueva Zelanda',  visit:'Bélgica',              date:'Vie 26 Jun', sede:'BC Place Vancouver' },
    { id:'H1', phase:'grupo', group:'H', local:'Arabia Saudita', visit:'Uruguay',              date:'Lun 15 Jun', sede:'Miami Stadium' },
    { id:'H2', phase:'grupo', group:'H', local:'España',         visit:'Cabo Verde',           date:'Lun 15 Jun', sede:'Atlanta Stadium' },
    { id:'H3', phase:'grupo', group:'H', local:'Uruguay',        visit:'Cabo Verde',           date:'Dom 21 Jun', sede:'Miami Stadium' },
    { id:'H4', phase:'grupo', group:'H', local:'España',         visit:'Arabia Saudita',       date:'Dom 21 Jun', sede:'Atlanta Stadium' },
    { id:'H5', phase:'grupo', group:'H', local:'Cabo Verde',     visit:'Arabia Saudita',       date:'Vie 26 Jun', sede:'Houston Stadium' },
    { id:'H6', phase:'grupo', group:'H', local:'Uruguay',        visit:'España',               date:'Vie 26 Jun', sede:'Estadio Guadalajara' },
    { id:'I1', phase:'grupo', group:'I', local:'Francia',        visit:'Senegal',              date:'Mar 16 Jun', sede:'New York/New Jersey' },
    { id:'I2', phase:'grupo', group:'I', local:'Irak',           visit:'Noruega',              date:'Mar 16 Jun', sede:'Boston Stadium' },
    { id:'I3', phase:'grupo', group:'I', local:'Noruega',        visit:'Senegal',              date:'Lun 22 Jun', sede:'New York/New Jersey' },
    { id:'I4', phase:'grupo', group:'I', local:'Francia',        visit:'Irak',                 date:'Lun 22 Jun', sede:'Philadelphia Stadium' },
    { id:'I5', phase:'grupo', group:'I', local:'Noruega',        visit:'Francia',              date:'Vie 26 Jun', sede:'Boston Stadium' },
    { id:'I6', phase:'grupo', group:'I', local:'Senegal',        visit:'Irak',                 date:'Vie 26 Jun', sede:'Toronto Stadium' },
    { id:'J1', phase:'grupo', group:'J', local:'Argentina',      visit:'Argelia',              date:'Mar 16 Jun', sede:'Kansas City Stadium' },
    { id:'J2', phase:'grupo', group:'J', local:'Austria',        visit:'Jordania',             date:'Mar 16 Jun', sede:'San Francisco Bay Area' },
    { id:'J3', phase:'grupo', group:'J', local:'Argentina',      visit:'Austria',              date:'Lun 22 Jun', sede:'Dallas Stadium' },
    { id:'J4', phase:'grupo', group:'J', local:'Jordania',       visit:'Argelia',              date:'Lun 22 Jun', sede:'San Francisco Bay Area' },
    { id:'J5', phase:'grupo', group:'J', local:'Argelia',        visit:'Austria',              date:'Sáb 27 Jun', sede:'Kansas City Stadium' },
    { id:'J6', phase:'grupo', group:'J', local:'Jordania',       visit:'Argentina',            date:'Sáb 27 Jun', sede:'Dallas Stadium' },
    { id:'K1', phase:'grupo', group:'K', local:'Portugal',       visit:'Congo DR',             date:'Mié 17 Jun', sede:'Houston Stadium' },
    { id:'K2', phase:'grupo', group:'K', local:'Uzbekistán',     visit:'Colombia',             date:'Mié 17 Jun', sede:'Mexico City Stadium' },
    { id:'K3', phase:'grupo', group:'K', local:'Portugal',       visit:'Uzbekistán',           date:'Mar 23 Jun', sede:'Houston Stadium' },
    { id:'K4', phase:'grupo', group:'K', local:'Colombia',       visit:'Congo DR',             date:'Mar 23 Jun', sede:'Estadio Guadalajara' },
    { id:'K5', phase:'grupo', group:'K', local:'Colombia',       visit:'Portugal',             date:'Sáb 27 Jun', sede:'Miami Stadium' },
    { id:'K6', phase:'grupo', group:'K', local:'Congo DR',       visit:'Uzbekistán',           date:'Sáb 27 Jun', sede:'Atlanta Stadium' },
    { id:'L1', phase:'grupo', group:'L', local:'Ghana',          visit:'Panamá',               date:'Mié 17 Jun', sede:'Toronto Stadium' },
    { id:'L2', phase:'grupo', group:'L', local:'Inglaterra',     visit:'Croacia',              date:'Mié 17 Jun', sede:'Dallas Stadium' },
    { id:'L3', phase:'grupo', group:'L', local:'Inglaterra',     visit:'Ghana',                date:'Mar 23 Jun', sede:'Boston Stadium' },
    { id:'L4', phase:'grupo', group:'L', local:'Panamá',         visit:'Croacia',              date:'Mar 23 Jun', sede:'Toronto Stadium' },
    { id:'L5', phase:'grupo', group:'L', local:'Panamá',         visit:'Inglaterra',           date:'Sáb 27 Jun', sede:'New York/New Jersey' },
    { id:'L6', phase:'grupo', group:'L', local:'Croacia',        visit:'Ghana',                date:'Sáb 27 Jun', sede:'Philadelphia Stadium' },
  ];

  // ── PARTIDOS ELIMINATORIOS ─────────────────────────────────────
  const MATCHES_ELIM = [
    { id:'R1',  phase:'octavos', group:null, local:'1° Grupo A', visit:'2° Grupo B', date:'Dom 28 Jun', sede:'Por confirmar' },
    { id:'R2',  phase:'octavos', group:null, local:'1° Grupo C', visit:'2° Grupo D', date:'Dom 28 Jun', sede:'Por confirmar' },
    { id:'R3',  phase:'octavos', group:null, local:'1° Grupo E', visit:'2° Grupo F', date:'Lun 29 Jun', sede:'Por confirmar' },
    { id:'R4',  phase:'octavos', group:null, local:'1° Grupo G', visit:'2° Grupo H', date:'Lun 29 Jun', sede:'Por confirmar' },
    { id:'R5',  phase:'octavos', group:null, local:'1° Grupo I', visit:'2° Grupo J', date:'Mar 30 Jun', sede:'Por confirmar' },
    { id:'R6',  phase:'octavos', group:null, local:'1° Grupo K', visit:'2° Grupo L', date:'Mar 30 Jun', sede:'Por confirmar' },
    { id:'R7',  phase:'octavos', group:null, local:'1° Grupo B', visit:'2° Grupo A', date:'Mié 1 Jul',  sede:'Por confirmar' },
    { id:'R8',  phase:'octavos', group:null, local:'1° Grupo D', visit:'2° Grupo C', date:'Mié 1 Jul',  sede:'Por confirmar' },
    { id:'R9',  phase:'octavos', group:null, local:'1° Grupo F', visit:'2° Grupo E', date:'Jue 2 Jul',  sede:'Por confirmar' },
    { id:'R10', phase:'octavos', group:null, local:'1° Grupo H', visit:'2° Grupo G', date:'Jue 2 Jul',  sede:'Por confirmar' },
    { id:'R11', phase:'octavos', group:null, local:'1° Grupo J', visit:'2° Grupo I', date:'Vie 3 Jul',  sede:'Por confirmar' },
    { id:'R12', phase:'octavos', group:null, local:'1° Grupo L', visit:'2° Grupo K', date:'Vie 3 Jul',  sede:'Por confirmar' },
    { id:'R13', phase:'octavos', group:null, local:'3° mejor 1', visit:'3° mejor 2', date:'Sáb 4 Jul',  sede:'Por confirmar' },
    { id:'R14', phase:'octavos', group:null, local:'3° mejor 3', visit:'3° mejor 4', date:'Sáb 4 Jul',  sede:'Por confirmar' },
    { id:'R15', phase:'octavos', group:null, local:'3° mejor 5', visit:'3° mejor 6', date:'Dom 5 Jul',  sede:'Por confirmar' },
    { id:'R16', phase:'octavos', group:null, local:'3° mejor 7', visit:'3° mejor 8', date:'Dom 5 Jul',  sede:'Por confirmar' },
    { id:'QF1', phase:'cuartos', group:null, local:'Gan. R1',  visit:'Gan. R2',  date:'Mar 7 Jul',  sede:'Por confirmar' },
    { id:'QF2', phase:'cuartos', group:null, local:'Gan. R3',  visit:'Gan. R4',  date:'Mar 7 Jul',  sede:'Por confirmar' },
    { id:'QF3', phase:'cuartos', group:null, local:'Gan. R5',  visit:'Gan. R6',  date:'Mié 8 Jul',  sede:'Por confirmar' },
    { id:'QF4', phase:'cuartos', group:null, local:'Gan. R7',  visit:'Gan. R8',  date:'Mié 8 Jul',  sede:'Por confirmar' },
    { id:'QF5', phase:'cuartos', group:null, local:'Gan. R9',  visit:'Gan. R10', date:'Jue 9 Jul',  sede:'Por confirmar' },
    { id:'QF6', phase:'cuartos', group:null, local:'Gan. R11', visit:'Gan. R12', date:'Jue 9 Jul',  sede:'Por confirmar' },
    { id:'QF7', phase:'cuartos', group:null, local:'Gan. R13', visit:'Gan. R14', date:'Vie 10 Jul', sede:'Por confirmar' },
    { id:'QF8', phase:'cuartos', group:null, local:'Gan. R15', visit:'Gan. R16', date:'Vie 10 Jul', sede:'Por confirmar' },
    { id:'SF1', phase:'semis',   group:null, local:'Gan. QF1', visit:'Gan. QF2', date:'Lun 14 Jul', sede:'Por confirmar' },
    { id:'SF2', phase:'semis',   group:null, local:'Gan. QF3', visit:'Gan. QF4', date:'Lun 14 Jul', sede:'Por confirmar' },
    { id:'SF3', phase:'semis',   group:null, local:'Gan. QF5', visit:'Gan. QF6', date:'Mar 15 Jul', sede:'Por confirmar' },
    { id:'SF4', phase:'semis',   group:null, local:'Gan. QF7', visit:'Gan. QF8', date:'Mar 15 Jul', sede:'Por confirmar' },
    { id:'3P1', phase:'tercero', group:null, local:'Per. SF1', visit:'Per. SF2', date:'Sáb 18 Jul', sede:'Por confirmar' },
    { id:'3P2', phase:'tercero', group:null, local:'Per. SF3', visit:'Per. SF4', date:'Sáb 18 Jul', sede:'Por confirmar' },
    { id:'FIN', phase:'final',   group:null, local:'Gan. SF1/SF2', visit:'Gan. SF3/SF4', date:'Dom 19 Jul', sede:'MetLife Stadium, NJ' },
  ];

  const MATCHES = [...MATCHES_GRUPOS, ...MATCHES_ELIM];
  const GROUPS  = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  const PHASES  = [
    { id:'grupo',   label:'Fase de Grupos',   icon:'⚽', unlocked: true  },
    { id:'octavos', label:'Octavos de Final', icon:'🔟', unlocked: false },
    { id:'cuartos', label:'Cuartos de Final', icon:'🏅', unlocked: false },
    { id:'semis',   label:'Semifinales',       icon:'🌟', unlocked: false },
    { id:'tercero', label:'Tercer Puesto',    icon:'🥉', unlocked: false },
    { id:'final',   label:'Gran Final',       icon:'🏆', unlocked: false },
  ];

  // ── FLAGS ──────────────────────────────────────────────────────
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

  // ── CACHÉ LOCAL (evita llamadas repetidas al API) ──────────────
  // Se refresca cada vez que la página carga o el usuario guarda algo.
  let _cache = null;
  let _cacheTs = 0;
  const CACHE_TTL = 30000; // 30 segundos
  const VALID_MATCH_IDS = new Set(MATCHES.map(m => m.id));

  function hasText(value) {
    return value !== null && value !== undefined && String(value).trim() !== '' && String(value) !== 'undefined';
  }

  function cleanText(value) {
    return hasText(value) ? String(value).trim() : '';
  }

  function normalizeApiData(data) {
    const usuarios = Array.isArray(data?.usuarios)
      ? data.usuarios
          .map(u => ({
            id: cleanText(u?.id),
            name: cleanText(u?.name),
            dept: cleanText(u?.dept) || 'General',
          }))
          .filter(u => u.id && u.name)
      : [];

    const pronosticos = {};
    Object.entries(data?.pronosticos || {}).forEach(([userId, matches]) => {
      const uid = cleanText(userId);
      if (!uid || !matches || typeof matches !== 'object') return;
      Object.entries(matches).forEach(([matchId, p]) => {
        const mid = cleanText(matchId);
        if (!mid || !VALID_MATCH_IDS.has(mid) || !p) return;
        const l = cleanText(p.l);
        const v = cleanText(p.v);
        if (l === '' || v === '') return;
        if (!pronosticos[uid]) pronosticos[uid] = {};
        pronosticos[uid][mid] = { l, v };
      });
    });

    const resultados = {};
    Object.entries(data?.resultados || {}).forEach(([matchId, r]) => {
      const mid = cleanText(matchId);
      if (!mid || (!VALID_MATCH_IDS.has(mid) && !mid.startsWith('ESP_')) || !r) return;
      const l = cleanText(r.l);
      const v = cleanText(r.v);
      if (l === '' && v === '') return;
      resultados[mid] = { l, v, visita: cleanText(r.visita) || v };
    });

    const especiales = {};
    Object.entries(data?.especiales || {}).forEach(([userId, e]) => {
      const uid = cleanText(userId);
      if (!uid || !e || typeof e !== 'object') return;
      especiales[uid] = {
        campeon: cleanText(e.campeon),
        sub: cleanText(e.sub),
        goleador: cleanText(e.goleador),
        revelacion: cleanText(e.revelacion),
      };
    });

    return { ok: true, usuarios, pronosticos, resultados, especiales };
  }

  // ── LLAMADAS AL API ────────────────────────────────────────────

  // GET — trae todos los datos de una vez (usuarios, pronósticos, resultados, especiales)
  async function apiGet() {
    try {
      const res = await fetch(`${API_URL}?action=getAll&t=${Date.now()}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error en getAll');
      return normalizeApiData(data);
    } catch (err) {
      console.error('CVX apiGet error:', err);
      return null;
    }
  }

  // POST — guarda un registro
  // Apps Script recibe Content-Type: text/plain con body JSON
  // para evitar el preflight CORS de application/json
  async function apiPost(payload) {
    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'text/plain' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error en POST');
      return data;
    } catch (err) {
      console.error('CVX apiPost error:', err);
      return null;
    }
  }

  // ── CACHÉ ──────────────────────────────────────────────────────

  async function getCache(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && _cache && (now - _cacheTs) < CACHE_TTL) return _cache;
    const fresh = await apiGet();
    if (fresh) { _cache = fresh; _cacheTs = now; }
    return _cache || { usuarios: [], pronosticos: {}, resultados: {}, especiales: {} };
  }

  function invalidateCache() { _cache = null; _cacheTs = 0; }

  // ── GETTERS (usan caché, devuelven Promises) ───────────────────

  async function getUsuarios()    { return (await getCache()).usuarios    || []; }
  async function getPronosticos() { return (await getCache()).pronosticos || {}; }
  async function getResultados()  { return (await getCache()).resultados  || {}; }
  async function getEspeciales()  { return (await getCache()).especiales  || {}; }

  // currentUser sigue en localStorage (es solo la sesión local)
  function getCurrentUser() {
    try {
      const user = JSON.parse(localStorage.getItem('cvx2026_current_user')) || null;
      if (!user || !hasText(user.id) || !hasText(user.name)) {
        localStorage.removeItem('cvx2026_current_user');
        return null;
      }
      return { id: cleanText(user.id), name: cleanText(user.name), dept: cleanText(user.dept) || 'General' };
    } catch {
      localStorage.removeItem('cvx2026_current_user');
      return null;
    }
  }
  function setCurrentUser(user) {
    if (!user || !hasText(user.id) || !hasText(user.name)) return;
    localStorage.setItem('cvx2026_current_user', JSON.stringify(user));
  }

  // ── SETTERS (escriben en Sheets y refrescan caché) ─────────────

  async function saveUsuario(user) {
    if (!user.id || !user.name) return null;
    const r = await apiPost({ action: 'saveUsuario', id: user.id, name: user.name, dept: user.dept || 'General' });
    if (r) invalidateCache();
    return r;
  }

  async function savePronostico(userId, matchId, l, v) {
    if (!hasText(userId) || !hasText(matchId) || userId === 'undefined' || !VALID_MATCH_IDS.has(String(matchId))) return null;
    const r = await apiPost({ action: 'savePronostico', userId, matchId, local: String(l), visita: String(v) });
    if (r) invalidateCache();
    return r;
  }

  async function saveResultado(matchId, l, v) {
    const r = await apiPost({ action: 'saveResultado', matchId, local: String(l), visita: String(v) });
    if (r) invalidateCache();
    return r;
  }

  async function saveEspecial(userId, data) {
    if (!hasText(userId) || userId === 'undefined') return null;
    const r = await apiPost({ action: 'saveEspecial', userId,
      campeon: data.campeon || '', sub: data.sub || '',
      goleador: data.goleador || '', revelacion: data.revelacion || '' });
    if (r) invalidateCache();
    return r;
  }

  // ── LÓGICA DE PUNTOS ───────────────────────────────────────────

  function calcPoints(pron, res, phase) {
    if (!res || res.l === '' || res.l === null || res.l === undefined)
      return { pts: 0, label: 'pendiente', detalle: 'Partido no jugado todavía' };
    if (!pron || pron.l === '' || pron.l === null || pron.l === undefined)
      return { pts: 0, label: 'sin_pronostico', detalle: 'No registraste pronóstico' };

    const pl = parseInt(pron.l), pv = parseInt(pron.v);
    const rl = parseInt(res.l),  rv = parseInt(res.v);
    const P  = PUNTOS[phase] || PUNTOS.grupo;

    // ── Grupos: empate posible ──
    if (phase === 'grupo') {
      if (pl === rl && pv === rv)
        return { pts: P.exacto, label: 'exacto',
          detalle: `⚡ Marcador exacto ${rl}-${rv} → +${P.exacto} pts` };
      const pronWin = pl > pv ? 'L' : pl < pv ? 'V' : 'E';
      const realWin = rl > rv ? 'L' : rl < rv ? 'V' : 'E';
      if (pronWin === realWin) {
        if ((pl - pv) === (rl - rv))
          return { pts: P.ganadorDiff, label: 'ganador_diff',
            detalle: `✓ Ganador + diferencia (${rl}-${rv}) → +${P.ganadorDiff} pts` };
        return { pts: P.ganador, label: 'ganador',
          detalle: `✓ Ganador correcto (${rl}-${rv}) → +${P.ganador} pts` };
      }
      return { pts: 0, label: 'fallo',
        detalle: `✗ Incorrecto (salió ${rl}-${rv}) → 0 pts` };
    }

    // ── Eliminatorias ──
    if (pl === rl && pv === rv)
      return { pts: P.exacto, label: 'exacto',
        detalle: `⚡ Marcador exacto ${rl}-${rv} → +${P.exacto} pts` };
    const pronWin = pl >= pv ? 'L' : 'V';
    const realWin = rl >= rv ? 'L' : 'V';
    const ptsParcial = P.clasificado || P.ganador || 0;
    if (pronWin === realWin)
      return { pts: ptsParcial, label: 'clasificado',
        detalle: `✓ Clasificado correcto (${rl}-${rv}) → +${ptsParcial} pts` };
    return { pts: 0, label: 'fallo',
      detalle: `✗ Clasificado incorrecto (salió ${rl}-${rv}) → 0 pts` };
  }

  // ── ESPECIALES ─────────────────────────────────────────────────
  function calcEspeciales(esp, resultados) {
    if (!esp) return 0;
    let pts = 0;
    const norm = s => (s || '').toLowerCase().trim();
    const r = resultados || {};
    if (esp.campeon    && r['ESP_campeon']    && norm(esp.campeon)    === norm(r['ESP_campeon']?.visita))    pts += 10;
    if (esp.sub        && r['ESP_sub']        && norm(esp.sub)        === norm(r['ESP_sub']?.visita))        pts += 6;
    if (esp.goleador   && r['ESP_goleador']   && norm(esp.goleador)   === norm(r['ESP_goleador']?.visita))   pts += 8;
    if (esp.revelacion && r['ESP_revelacion'] && norm(esp.revelacion) === norm(r['ESP_revelacion']?.visita)) pts += 5;
    return pts;
  }

  // ── RANKING (async porque lee de Sheets) ──────────────────────
  async function buildRanking() {
    const data = await getCache(true); // siempre fresco para el ranking
    const { usuarios, pronosticos, resultados, especiales } = data;

    return (usuarios || []).map(u => {
      let pts = 0, exactos = 0, clasificados = 0, fallos = 0, jugados = 0;
      const porFase = { grupo:0, octavos:0, cuartos:0, semis:0, tercero:0, final:0 };

      MATCHES.forEach(m => {
        const res  = (resultados || {})[m.id];
        const pron = ((pronosticos || {})[u.id] || {})[m.id];
        if (!res || res.l === '' || res.l === undefined) return;
        jugados++;
        if (!pron) return;
        const r = calcPoints(pron, res, m.phase);
        pts += r.pts;
        porFase[m.phase] = (porFase[m.phase] || 0) + r.pts;
        if (r.label === 'exacto')                                           exactos++;
        if (['clasificado','ganador','ganador_diff'].includes(r.label))     clasificados++;
        if (r.label === 'fallo')                                            fallos++;
      });

      const espPts = calcEspeciales((especiales || {})[u.id], resultados);
      pts += espPts;

      return { ...u, pts, exactos, clasificados, fallos, jugados, porFase, espPts };
    }).sort((a, b) => b.pts - a.pts || b.exactos - a.exactos || b.clasificados - a.clasificados);
  }

  // ── API PÚBLICA ────────────────────────────────────────────────
  return {
    MATCHES, MATCHES_GRUPOS, MATCHES_ELIM,
    GROUPS, PHASES, FLAGS, PUNTOS,
    calcPoints, calcEspeciales,
    getUsuarios, getPronosticos, getResultados, getEspeciales,
    getCurrentUser, setCurrentUser,
    saveUsuario, savePronostico, saveResultado, saveEspecial,
    buildRanking,
    getCache, invalidateCache,
  };

})();
