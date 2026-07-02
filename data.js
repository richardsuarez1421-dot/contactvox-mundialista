// ================================================================
// Copa Mundial Contactvox 2026 - Data Layer v5 (Firebase RTDB)
// ================================================================
// Conectado a Firebase Realtime Database via REST API.
// El diseno de index.html y admin.html no cambia en absoluto.
//
// SISTEMA DE PUNTOS v6:
// -- FASE DE GRUPOS -----------------------------------------------
//   Marcador exacto                                        -> 5 pts
//   Ganador o empate correcto                              -> 2 pts
//   Ningun acierto                                         -> 0 pts
//
// -- 16AVOS DE FINAL ----------------------------------------------
//   Marcador exacto + clasificado correcto                 -> 6 pts
//   Solo clasificado correcto                              -> 3 pts
//
// -- OCTAVOS DE FINAL ---------------------------------------------
//   Marcador exacto + clasificado correcto                 -> 7 pts
//   Solo clasificado correcto                              -> 3 pts
//
// -- CUARTOS DE FINAL ---------------------------------------------
//   Marcador exacto + clasificado correcto                 -> 8 pts
//   Solo clasificado correcto                              -> 4 pts
//
// -- SEMIFINALES --------------------------------------------------
//   Marcador exacto + clasificado correcto                 -> 9 pts
//   Solo clasificado correcto                              -> 4 pts
//
// -- TERCER PUESTO ------------------------------------------------
//   Marcador exacto + clasificado correcto                 -> 8 pts
//   Solo clasificado correcto                              -> 4 pts
//
// -- GRAN FINAL ---------------------------------------------------
//   Marcador exacto + clasificado correcto                 -> 12 pts
//   Solo clasificado correcto (campeon)                    -> 6 pts
//
// -- PREDICCIONES ESPECIALES --------------------------------------
//   Campeon del mundo -> 10 pts  |  Subcampeon      -> 6 pts
//   Goleador          -> 8 pts   |  Revelacion       -> 5 pts
// ================================================================

const CVX = (() => {

  // -- FIREBASE REALTIME DATABASE URL -----------------------------
  const FB_URL = 'https://mundialista-cvx-default-rtdb.firebaseio.com';

  function normalizeNameKey(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  function buildUserIdFromName(name) {
    const normalized = normalizeNameKey(name);
    return normalized ? `u_${normalized.replace(/\s+/g, '_')}` : '';
  }

  // -- WHITELIST DE PARTICIPANTES ---------------------------------
  const ALLOWED_NAMES = [
    'Alexander Conde','Bryan Cortez','Christian Freire','Daniel Tapia',
    'David Chicaiza','Elizabeth Carrillo','Evelyn Achig','Fabian Olmedo',
    'Fanny Mayorga','Henry Tito','Isak Gomez','Jair Delgado',
    'Jhon Tanicuchi','Jhonny Andrade','Jimmy Pardo','Joan Martinez',
    'Leyla Berrones','Luis Aguirre','Luis Bastidas','Luis Machado',
    'Mario Vela','Mariela Garzon','Naymar Sanchez','Paul Cabrera',
    'Richard Suarez','Thalia Ortega','Veronica Bermudez',
  ];
  const ALLOWED_NORM2 = new Set(ALLOWED_NAMES.map(normalizeNameKey));
  const ALLOWED_USER_IDS = new Set(ALLOWED_NAMES.map(buildUserIdFromName).filter(Boolean));
  const ALLOWED_NORM = new Set(ALLOWED_NAMES.map(n =>
    n.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  ));

  function isAllowedUser(name) {
    return !!name && ALLOWED_NORM2.has(normalizeNameKey(name));
    if (!name) return false;
    const n = name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return ALLOWED_NORM.has(n);
  }

  // -- TABLA DE PUNTOS POR FASE -----------------------------------
  const PUNTOS = {
    grupo:      { exacto: 5,  ganador: 2,    fallo: 0 },
    dieciseis:  { exacto: 6,  clasificado: 3, fallo: 0 },
    octavos:    { exacto: 7,  clasificado: 3, fallo: 0 },
    cuartos:    { exacto: 8,  clasificado: 4, fallo: 0 },
    semis:      { exacto: 9,  clasificado: 4, fallo: 0 },
    tercero:    { exacto: 8,  clasificado: 4, fallo: 0 },
    final:      { exacto: 12, clasificado: 6, fallo: 0 },
  };

  // -- SEMANAS DEL TORNEO -----------------------------------------
  const SEMANAS = [
    { id:1, label:'Semana 1', inicio:'2026-06-11', fin:'2026-06-17' },
    { id:2, label:'Semana 2', inicio:'2026-06-18', fin:'2026-06-24' },
    { id:3, label:'Semana 3', inicio:'2026-06-25', fin:'2026-07-01' },
    { id:4, label:'Semana 4', inicio:'2026-07-02', fin:'2026-07-08' },
    { id:5, label:'Semana 5', inicio:'2026-07-09', fin:'2026-07-15' },
    { id:6, label:'Semana 6', inicio:'2026-07-16', fin:'2026-07-19' },
  ];

  // -- AREAS DE LA EMPRESA ----------------------------------------
  const AREAS = [
    'Soporte','Seguridades','Desarrollo','Diseno','QA',
    'Proyectos','Gerencia','Comercial','Recursos Humanos',
    'Innovacion','Coordinacion'
  ];

  // -- PARTIDOS FASE DE GRUPOS (72 partidos) ----------------------
  // kickoff: UTC ISO datetime — auto-lock triggers when Date.now() >= new Date(kickoff)
  const MATCHES_GRUPOS = [
    { id:'A1', phase:'grupo', group:'A', local:'México',         visit:'Sudáfrica',            date:'Jue 11 Jun', sede:'Ciudad de México',            kickoff:'2026-06-11T19:00:00Z' },
    { id:'A2', phase:'grupo', group:'A', local:'Corea del Sur',  visit:'Chequia',              date:'Jue 11 Jun', sede:'Guadalajara',                  kickoff:'2026-06-12T02:00:00Z' },
    { id:'A3', phase:'grupo', group:'A', local:'Chequia',        visit:'Sudáfrica',            date:'Jue 18 Jun', sede:'Atlanta',                      kickoff:'2026-06-18T16:00:00Z' },
    { id:'A4', phase:'grupo', group:'A', local:'México',         visit:'Corea del Sur',        date:'Jue 18 Jun', sede:'Guadalajara',                  kickoff:'2026-06-19T01:00:00Z' },
    { id:'A5', phase:'grupo', group:'A', local:'Chequia',        visit:'México',               date:'Mié 24 Jun', sede:'Ciudad de México',            kickoff:'2026-06-25T01:00:00Z' },
    { id:'A6', phase:'grupo', group:'A', local:'Sudáfrica',      visit:'Corea del Sur',        date:'Mié 24 Jun', sede:'Monterrey',                    kickoff:'2026-06-25T01:00:00Z' },
    { id:'B1', phase:'grupo', group:'B', local:'Canadá',         visit:'Bosnia y Herzegovina', date:'Vie 12 Jun', sede:'Toronto',                      kickoff:'2026-06-12T19:00:00Z' },
    { id:'B2', phase:'grupo', group:'B', local:'Catar',          visit:'Suiza',                date:'Sáb 13 Jun', sede:'San Francisco Bay Area',       kickoff:'2026-06-13T19:00:00Z' },
    { id:'B3', phase:'grupo', group:'B', local:'Suiza',          visit:'Bosnia y Herzegovina', date:'Jue 18 Jun', sede:'Los Ángeles',                  kickoff:'2026-06-18T19:00:00Z' },
    { id:'B4', phase:'grupo', group:'B', local:'Canadá',         visit:'Catar',                date:'Jue 18 Jun', sede:'Vancouver',                    kickoff:'2026-06-18T22:00:00Z' },
    { id:'B5', phase:'grupo', group:'B', local:'Suiza',          visit:'Canadá',               date:'Mié 24 Jun', sede:'Vancouver',                    kickoff:'2026-06-24T19:00:00Z' },
    { id:'B6', phase:'grupo', group:'B', local:'Bosnia y Herz.', visit:'Catar',                date:'Mié 24 Jun', sede:'Seattle',                      kickoff:'2026-06-24T19:00:00Z' },
    { id:'C1', phase:'grupo', group:'C', local:'Haití',          visit:'Escocia',              date:'Sáb 13 Jun', sede:'Boston',                       kickoff:'2026-06-14T01:00:00Z' },
    { id:'C2', phase:'grupo', group:'C', local:'Brasil',         visit:'Marruecos',            date:'Sáb 13 Jun', sede:'Nueva York/Nueva Jersey',      kickoff:'2026-06-13T22:00:00Z' },
    { id:'C3', phase:'grupo', group:'C', local:'Brasil',         visit:'Haití',                date:'Vie 19 Jun', sede:'Filadelfia',                   kickoff:'2026-06-20T00:30:00Z' },
    { id:'C4', phase:'grupo', group:'C', local:'Escocia',        visit:'Marruecos',            date:'Vie 19 Jun', sede:'Boston',                       kickoff:'2026-06-19T22:00:00Z' },
    { id:'C5', phase:'grupo', group:'C', local:'Escocia',        visit:'Brasil',               date:'Mié 24 Jun', sede:'Miami',                        kickoff:'2026-06-24T22:00:00Z' },
    { id:'C6', phase:'grupo', group:'C', local:'Marruecos',      visit:'Haití',                date:'Mié 24 Jun', sede:'Atlanta',                      kickoff:'2026-06-24T22:00:00Z' },
    { id:'D1', phase:'grupo', group:'D', local:'Estados Unidos', visit:'Paraguay',             date:'Vie 12 Jun', sede:'Los Ángeles',                  kickoff:'2026-06-13T01:00:00Z' },
    { id:'D2', phase:'grupo', group:'D', local:'Australia',      visit:'Türkiye',              date:'Sáb 13 Jun', sede:'Vancouver',                    kickoff:'2026-06-14T04:00:00Z' },
    { id:'D3', phase:'grupo', group:'D', local:'Türkiye',        visit:'Paraguay',             date:'Vie 19 Jun', sede:'San Francisco Bay Area',       kickoff:'2026-06-20T03:00:00Z' },
    { id:'D4', phase:'grupo', group:'D', local:'Estados Unidos', visit:'Australia',            date:'Vie 19 Jun', sede:'Seattle',                      kickoff:'2026-06-19T19:00:00Z' },
    { id:'D5', phase:'grupo', group:'D', local:'Türkiye',        visit:'Estados Unidos',       date:'Jue 25 Jun', sede:'Los Ángeles',                  kickoff:'2026-06-26T02:00:00Z' },
    { id:'D6', phase:'grupo', group:'D', local:'Paraguay',       visit:'Australia',            date:'Jue 25 Jun', sede:'San Francisco Bay Area',       kickoff:'2026-06-26T02:00:00Z' },
    { id:'E1', phase:'grupo', group:'E', local:'Costa de Marfil',visit:'Ecuador',              date:'Dom 14 Jun', sede:'Filadelfia',                   kickoff:'2026-06-14T23:00:00Z' },
    { id:'E2', phase:'grupo', group:'E', local:'Alemania',       visit:'Curazao',              date:'Dom 14 Jun', sede:'Houston',                      kickoff:'2026-06-14T17:00:00Z' },
    { id:'E3', phase:'grupo', group:'E', local:'Alemania',       visit:'Costa de Marfil',      date:'Sáb 20 Jun', sede:'Toronto',                      kickoff:'2026-06-20T20:00:00Z' },
    { id:'E4', phase:'grupo', group:'E', local:'Ecuador',        visit:'Curazao',              date:'Sáb 20 Jun', sede:'Kansas City',                  kickoff:'2026-06-21T00:00:00Z' },
    { id:'E5', phase:'grupo', group:'E', local:'Curazao',        visit:'Costa de Marfil',      date:'Jue 25 Jun', sede:'Filadelfia',                   kickoff:'2026-06-25T20:00:00Z' },
    { id:'E6', phase:'grupo', group:'E', local:'Ecuador',        visit:'Alemania',             date:'Jue 25 Jun', sede:'Nueva York/Nueva Jersey',      kickoff:'2026-06-25T20:00:00Z' },
    { id:'F1', phase:'grupo', group:'F', local:'Países Bajos',   visit:'Japón',                date:'Dom 14 Jun', sede:'Dallas',                       kickoff:'2026-06-14T20:00:00Z' },
    { id:'F2', phase:'grupo', group:'F', local:'Suecia',         visit:'Túnez',                date:'Dom 14 Jun', sede:'Monterrey',                    kickoff:'2026-06-15T02:00:00Z' },
    { id:'F3', phase:'grupo', group:'F', local:'Países Bajos',   visit:'Suecia',               date:'Sáb 20 Jun', sede:'Houston',                      kickoff:'2026-06-20T17:00:00Z' },
    { id:'F4', phase:'grupo', group:'F', local:'Túnez',          visit:'Japón',                date:'Sáb 20 Jun', sede:'Monterrey',                    kickoff:'2026-06-21T04:00:00Z' },
    { id:'F5', phase:'grupo', group:'F', local:'Japón',          visit:'Suecia',               date:'Jue 25 Jun', sede:'Dallas',                       kickoff:'2026-06-25T23:00:00Z' },
    { id:'F6', phase:'grupo', group:'F', local:'Túnez',          visit:'Países Bajos',         date:'Jue 25 Jun', sede:'Kansas City',                  kickoff:'2026-06-25T23:00:00Z' },
    { id:'G1', phase:'grupo', group:'G', local:'Irán',           visit:'Nueva Zelanda',        date:'Lun 15 Jun', sede:'Los Ángeles',                  kickoff:'2026-06-16T01:00:00Z' },
    { id:'G2', phase:'grupo', group:'G', local:'Bélgica',        visit:'Egipto',               date:'Lun 15 Jun', sede:'Seattle',                      kickoff:'2026-06-15T19:00:00Z' },
    { id:'G3', phase:'grupo', group:'G', local:'Bélgica',        visit:'Irán',                 date:'Dom 21 Jun', sede:'Los Ángeles',                  kickoff:'2026-06-21T19:00:00Z' },
    { id:'G4', phase:'grupo', group:'G', local:'Nueva Zelanda',  visit:'Egipto',               date:'Dom 21 Jun', sede:'Vancouver',                    kickoff:'2026-06-22T01:00:00Z' },
    { id:'G5', phase:'grupo', group:'G', local:'Egipto',         visit:'Irán',                 date:'Vie 26 Jun', sede:'Seattle',                      kickoff:'2026-06-27T03:00:00Z' },
    { id:'G6', phase:'grupo', group:'G', local:'Nueva Zelanda',  visit:'Bélgica',              date:'Vie 26 Jun', sede:'Vancouver',                    kickoff:'2026-06-27T03:00:00Z' },
    { id:'H1', phase:'grupo', group:'H', local:'Arabia Saudita', visit:'Uruguay',              date:'Lun 15 Jun', sede:'Miami',                        kickoff:'2026-06-15T22:00:00Z' },
    { id:'H2', phase:'grupo', group:'H', local:'España',         visit:'Cabo Verde',           date:'Lun 15 Jun', sede:'Atlanta',                      kickoff:'2026-06-15T16:00:00Z' },
    { id:'H3', phase:'grupo', group:'H', local:'Uruguay',        visit:'Cabo Verde',           date:'Dom 21 Jun', sede:'Miami',                        kickoff:'2026-06-21T22:00:00Z' },
    { id:'H4', phase:'grupo', group:'H', local:'España',         visit:'Arabia Saudita',       date:'Dom 21 Jun', sede:'Atlanta',                      kickoff:'2026-06-21T16:00:00Z' },
    { id:'H5', phase:'grupo', group:'H', local:'Cabo Verde',     visit:'Arabia Saudita',       date:'Vie 26 Jun', sede:'Houston',                      kickoff:'2026-06-27T00:00:00Z' },
    { id:'H6', phase:'grupo', group:'H', local:'Uruguay',        visit:'España',               date:'Vie 26 Jun', sede:'Guadalajara',                  kickoff:'2026-06-27T00:00:00Z' },
    { id:'I1', phase:'grupo', group:'I', local:'Francia',        visit:'Senegal',              date:'Mar 16 Jun', sede:'Nueva York/Nueva Jersey',      kickoff:'2026-06-16T19:00:00Z' },
    { id:'I2', phase:'grupo', group:'I', local:'Irak',           visit:'Noruega',              date:'Mar 16 Jun', sede:'Boston',                       kickoff:'2026-06-16T22:00:00Z' },
    { id:'I3', phase:'grupo', group:'I', local:'Noruega',        visit:'Senegal',              date:'Lun 22 Jun', sede:'Nueva York/Nueva Jersey',      kickoff:'2026-06-23T00:00:00Z' },
    { id:'I4', phase:'grupo', group:'I', local:'Francia',        visit:'Irak',                 date:'Lun 22 Jun', sede:'Filadelfia',                   kickoff:'2026-06-22T21:00:00Z' },
    { id:'I5', phase:'grupo', group:'I', local:'Noruega',        visit:'Francia',              date:'Vie 26 Jun', sede:'Boston',                       kickoff:'2026-06-26T19:00:00Z' },
    { id:'I6', phase:'grupo', group:'I', local:'Senegal',        visit:'Irak',                 date:'Vie 26 Jun', sede:'Toronto',                      kickoff:'2026-06-26T19:00:00Z' },
    { id:'J1', phase:'grupo', group:'J', local:'Argentina',      visit:'Argelia',              date:'Mar 16 Jun', sede:'Kansas City',                  kickoff:'2026-06-17T01:00:00Z' },
    { id:'J2', phase:'grupo', group:'J', local:'Austria',        visit:'Jordania',             date:'Mar 16 Jun', sede:'San Francisco Bay Area',       kickoff:'2026-06-17T04:00:00Z' },
    { id:'J3', phase:'grupo', group:'J', local:'Argentina',      visit:'Austria',              date:'Lun 22 Jun', sede:'Dallas',                       kickoff:'2026-06-22T17:00:00Z' },
    { id:'J4', phase:'grupo', group:'J', local:'Jordania',       visit:'Argelia',              date:'Lun 22 Jun', sede:'San Francisco Bay Area',       kickoff:'2026-06-23T03:00:00Z' },
    { id:'J5', phase:'grupo', group:'J', local:'Argelia',        visit:'Austria',              date:'Sáb 27 Jun', sede:'Kansas City',                  kickoff:'2026-06-28T02:00:00Z' },
    { id:'J6', phase:'grupo', group:'J', local:'Jordania',       visit:'Argentina',            date:'Sáb 27 Jun', sede:'Dallas',                       kickoff:'2026-06-28T02:00:00Z' },
    { id:'K1', phase:'grupo', group:'K', local:'Portugal',       visit:'Congo DR',             date:'Mié 17 Jun', sede:'Houston',                      kickoff:'2026-06-17T17:00:00Z' },
    { id:'K2', phase:'grupo', group:'K', local:'Uzbekistán',     visit:'Colombia',             date:'Mié 17 Jun', sede:'Ciudad de México',            kickoff:'2026-06-18T02:00:00Z' },
    { id:'K3', phase:'grupo', group:'K', local:'Portugal',       visit:'Uzbekistán',           date:'Mar 23 Jun', sede:'Houston',                      kickoff:'2026-06-23T17:00:00Z' },
    { id:'K4', phase:'grupo', group:'K', local:'Colombia',       visit:'Congo DR',             date:'Mar 23 Jun', sede:'Guadalajara',                  kickoff:'2026-06-24T02:00:00Z' },
    { id:'K5', phase:'grupo', group:'K', local:'Colombia',       visit:'Portugal',             date:'Sáb 27 Jun', sede:'Miami',                        kickoff:'2026-06-27T23:30:00Z' },
    { id:'K6', phase:'grupo', group:'K', local:'Congo DR',       visit:'Uzbekistán',           date:'Sáb 27 Jun', sede:'Atlanta',                      kickoff:'2026-06-27T23:30:00Z' },
    { id:'L1', phase:'grupo', group:'L', local:'Ghana',          visit:'Panamá',               date:'Mié 17 Jun', sede:'Toronto',                      kickoff:'2026-06-17T23:00:00Z' },
    { id:'L2', phase:'grupo', group:'L', local:'Inglaterra',     visit:'Croacia',              date:'Mié 17 Jun', sede:'Dallas',                       kickoff:'2026-06-17T20:00:00Z' },
    { id:'L3', phase:'grupo', group:'L', local:'Inglaterra',     visit:'Ghana',                date:'Mar 23 Jun', sede:'Boston',                       kickoff:'2026-06-23T20:00:00Z' },
    { id:'L4', phase:'grupo', group:'L', local:'Panamá',         visit:'Croacia',              date:'Mar 23 Jun', sede:'Toronto',                      kickoff:'2026-06-23T23:00:00Z' },
    { id:'L5', phase:'grupo', group:'L', local:'Panamá',         visit:'Inglaterra',           date:'Sáb 27 Jun', sede:'Nueva York/Nueva Jersey',      kickoff:'2026-06-27T21:00:00Z' },
    { id:'L6', phase:'grupo', group:'L', local:'Croacia',        visit:'Ghana',                date:'Sáb 27 Jun', sede:'Filadelfia',                   kickoff:'2026-06-27T21:00:00Z' },
  ];

  // -- PARTIDOS ELIMINATORIOS -------------------------------------
  const MATCHES_ELIM = [
    { id:'R1',  phase:'dieciseis', group:null, local:'Sudáfrica',              visit:'Canadá',                  date:'Dom 28 Jun', sede:'SoFi Stadium, Los Ángeles',         kickoff:'2026-06-28T21:00:00Z' },
    { id:'R2',  phase:'dieciseis', group:null, local:'Brasil',                visit:'Japón',                   date:'Lun 29 Jun', sede:'NRG Stadium, Houston',              kickoff:'2026-06-29T17:00:00Z' },
    { id:'R3',  phase:'dieciseis', group:null, local:'Alemania',              visit:'Paraguay',                date:'Lun 29 Jun', sede:'Gillette Stadium, Boston',           kickoff:'2026-06-29T19:30:00Z' },
    { id:'R4',  phase:'dieciseis', group:null, local:'Países Bajos',          visit:'Marruecos',               date:'Lun 29 Jun', sede:'Estadio BBVA, Monterrey',            kickoff:'2026-06-30T01:00:00Z' },
    { id:'R5',  phase:'dieciseis', group:null, local:'Costa de Marfil',       visit:'Noruega',                 date:'Mar 30 Jun', sede:'AT&T Stadium, Dallas',               kickoff:'2026-06-30T17:00:00Z' },
    { id:'R6',  phase:'dieciseis', group:null, local:'Francia',               visit:'Suecia',                  date:'Mar 30 Jun', sede:'MetLife Stadium, Nueva York',        kickoff:'2026-06-30T20:00:00Z' },
    { id:'R7',  phase:'dieciseis', group:null, local:'México',                visit:'Ecuador',                 date:'Mar 30 Jun', sede:'Estadio Azteca, Ciudad de México',   kickoff:'2026-07-01T01:00:00Z' },
    { id:'R8',  phase:'dieciseis', group:null, local:'Inglaterra',            visit:'RD Congo',                date:'Mié 1 Jul',  sede:'Mercedes-Benz Stadium, Atlanta',     kickoff:'2026-07-01T15:00:00Z' },
    { id:'R9',  phase:'dieciseis', group:null, local:'Bélgica',               visit:'Senegal',                 date:'Mié 1 Jul',  sede:'Lumen Field, Seattle',               kickoff:'2026-07-01T22:00:00Z' },
    { id:'R10', phase:'dieciseis', group:null, local:'Estados Unidos',        visit:'Bosnia y Herzegovina',    date:'Mié 1 Jul',  sede:"Levi's Stadium, San José",           kickoff:'2026-07-02T02:00:00Z' },
    { id:'R11', phase:'dieciseis', group:null, local:'España',                visit:'Austria',                 date:'Jue 2 Jul',  sede:'SoFi Stadium, Los Ángeles',         kickoff:'2026-07-02T19:00:00Z' },
    { id:'R12', phase:'dieciseis', group:null, local:'Portugal',              visit:'Croacia',                 date:'Jue 2 Jul',  sede:'BMO Field, Toronto',                 kickoff:'2026-07-02T23:00:00Z' },
    { id:'R13', phase:'dieciseis', group:null, local:'Suiza',                 visit:'Argelia',                 date:'Jue 2 Jul',  sede:'BC Place, Vancouver',                kickoff:'2026-07-03T03:00:00Z' },
    { id:'R14', phase:'dieciseis', group:null, local:'Australia',             visit:'Egipto',                  date:'Vie 3 Jul',  sede:'AT&T Stadium, Dallas',               kickoff:'2026-07-03T18:00:00Z' },
    { id:'R15', phase:'dieciseis', group:null, local:'Argentina',             visit:'Cabo Verde',              date:'Vie 3 Jul',  sede:'Hard Rock Stadium, Miami',           kickoff:'2026-07-03T22:00:00Z' },
    { id:'R16', phase:'dieciseis', group:null, local:'Colombia',              visit:'Ghana',                   date:'Vie 3 Jul',  sede:'Arrowhead Stadium, Kansas City',     kickoff:'2026-07-04T01:30:00Z' },
    { id:'QF1', phase:'octavos',  group:null, local:'Gan. R1',  visit:'Gan. R2',  date:'Mar 7 Jul',  sede:'Por confirmar', kickoff:'2026-07-07T20:00:00Z' },
    { id:'QF2', phase:'octavos',  group:null, local:'Gan. R3',  visit:'Gan. R4',  date:'Mar 7 Jul',  sede:'Por confirmar', kickoff:'2026-07-07T23:00:00Z' },
    { id:'QF3', phase:'octavos',  group:null, local:'Gan. R5',  visit:'Gan. R6',  date:'Mié 8 Jul',  sede:'Por confirmar', kickoff:'2026-07-08T20:00:00Z' },
    { id:'QF4', phase:'octavos',  group:null, local:'Gan. R7',  visit:'Gan. R8',  date:'Mié 8 Jul',  sede:'Por confirmar', kickoff:'2026-07-08T23:00:00Z' },
    { id:'QF5', phase:'octavos',  group:null, local:'Gan. R9',  visit:'Gan. R10', date:'Jue 9 Jul',  sede:'Por confirmar', kickoff:'2026-07-09T20:00:00Z' },
    { id:'QF6', phase:'octavos',  group:null, local:'Gan. R11', visit:'Gan. R12', date:'Jue 9 Jul',  sede:'Por confirmar', kickoff:'2026-07-09T23:00:00Z' },
    { id:'QF7', phase:'octavos',  group:null, local:'Gan. R13', visit:'Gan. R14', date:'Vie 10 Jul', sede:'Por confirmar', kickoff:'2026-07-10T20:00:00Z' },
    { id:'QF8', phase:'octavos',  group:null, local:'Gan. R15', visit:'Gan. R16', date:'Vie 10 Jul', sede:'Por confirmar', kickoff:'2026-07-10T23:00:00Z' },
    { id:'SF1', phase:'cuartos',  group:null, local:'Gan. QF1', visit:'Gan. QF2', date:'Sáb 11 Jul', sede:'Por confirmar', kickoff:'2026-07-11T20:00:00Z' },
    { id:'SF2', phase:'cuartos',  group:null, local:'Gan. QF3', visit:'Gan. QF4', date:'Sáb 11 Jul', sede:'Por confirmar', kickoff:'2026-07-11T23:00:00Z' },
    { id:'SF3', phase:'cuartos',  group:null, local:'Gan. QF5', visit:'Gan. QF6', date:'Dom 12 Jul', sede:'Por confirmar', kickoff:'2026-07-12T20:00:00Z' },
    { id:'SF4', phase:'cuartos',  group:null, local:'Gan. QF7', visit:'Gan. QF8', date:'Dom 12 Jul', sede:'Por confirmar', kickoff:'2026-07-12T23:00:00Z' },
    { id:'NF1', phase:'semis',    group:null, local:'Gan. SF1', visit:'Gan. SF2', date:'Mié 15 Jul', sede:'Por confirmar', kickoff:'2026-07-15T20:00:00Z' },
    { id:'NF2', phase:'semis',    group:null, local:'Gan. SF3', visit:'Gan. SF4', date:'Jue 16 Jul', sede:'Por confirmar', kickoff:'2026-07-16T20:00:00Z' },
    { id:'3P1', phase:'tercero',  group:null, local:'Per. NF1', visit:'Per. NF2', date:'Dom 19 Jul', sede:'Por confirmar', kickoff:'2026-07-19T19:00:00Z' },
    { id:'FIN', phase:'final',    group:null, local:'Gan. NF1', visit:'Gan. NF2', date:'Dom 19 Jul', sede:'MetLife Stadium, NJ', kickoff:'2026-07-19T22:00:00Z' },
  ];

  const MATCHES = [...MATCHES_GRUPOS, ...MATCHES_ELIM];
  const GROUPS  = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  const PHASES  = [
    { id:'grupo',      label:'Fase de Grupos',   icon:'⚽', unlocked: true  },
    { id:'dieciseis',  label:'16avos de Final',  icon:'🔟', unlocked: false },
    { id:'octavos',    label:'Octavos de Final', icon:'⚡', unlocked: false },
    { id:'cuartos',    label:'Cuartos de Final', icon:'🏅', unlocked: false },
    { id:'semis',      label:'Semifinales',      icon:'🌟', unlocked: false },
    { id:'tercero',    label:'Tercer Puesto',    icon:'🥉', unlocked: false },
    { id:'final',      label:'Gran Final',       icon:'🏆', unlocked: false },
  ];

  // -- FLAGS ------------------------------------------------------
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
    'Austria':'🇦🇹','Jordania':'🇯🇴','Portugal':'🇵🇹','Congo DR':'🇨🇩','RD Congo':'🇨🇩',
    'Uzbekistán':'🇺🇿','Colombia':'🇨🇴','Ghana':'🇬🇭','Panamá':'🇵🇦',
    'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croacia':'🇭🇷',
  };

  // -- CACHE LOCAL ------------------------------------------------
  let _cache    = null;
  let _cacheTs  = 0;
  let _inflight = null;
  const CACHE_TTL = 30000; // 30s — Firebase es rapido, podemos refrescar mas seguido
  const VALID_MATCH_IDS = new Set(MATCHES.map(m => m.id));

  function hasText(value) {
    return value !== null && value !== undefined && String(value).trim() !== '' && String(value) !== 'undefined';
  }
  function cleanText(value) {
    return hasText(value) ? String(value).trim() : '';
  }

  function normalizeLikelyParticipantId(userId) {
    const uid = cleanText(userId);
    if (!uid) return '';
    if (ALLOWED_USER_IDS.has(uid)) return uid;
    for (const baseId of ALLOWED_USER_IDS) {
      if (uid.startsWith(baseId + '_')) return baseId;
    }
    return uid;
  }

  function getCanonicalUserId(rawId, name) {
    const uid = normalizeLikelyParticipantId(rawId);
    const baseId = buildUserIdFromName(name);
    if (baseId && (uid === baseId || uid.startsWith(baseId + '_'))) return baseId;
    return uid || baseId;
  }

  function normalizeStoredUser(user) {
    if (!user) return null;
    const name = cleanText(user.name);
    const dept = cleanText(user.dept) || 'General';
    let id = cleanText(user.id);
    if (!name) return null;
    const baseId = buildUserIdFromName(name);
    if (baseId && (!id || id === baseId || id.startsWith(baseId + '_'))) {
      id = baseId;
    }
    if (!id) return null;
    return { id, name, dept };
  }

  function createUserIdResolver(usuarios) {
    const exactIds = new Set();
    const aliases = [];

    (usuarios || []).forEach(u => {
      const canonicalId = cleanText(u?.id);
      const baseId = buildUserIdFromName(u?.name);
      if (!canonicalId) return;
      exactIds.add(canonicalId);
      if (baseId) aliases.push([baseId, canonicalId]);
      aliases.push([canonicalId, canonicalId]);
    });

    aliases.sort((a, b) => b[0].length - a[0].length);

    return function resolveUserId(rawId) {
      const uid = normalizeLikelyParticipantId(rawId);
      if (!uid) return '';
      if (exactIds.has(uid)) return uid;
      for (const [aliasId, canonicalId] of aliases) {
        if (uid === aliasId || uid.startsWith(aliasId + '_')) return canonicalId;
      }
      return uid;
    };
  }

  // -- FIREBASE REST API ------------------------------------------

  // Token Firebase Auth para llamadas REST (se actualiza desde HTML)
  let _restToken = null;
  function setRestToken(t) { _restToken = t; }
  function clearRestToken()  { _restToken = null; }
  function _q() { return _restToken ? `?auth=${_restToken}` : ''; }

  // Registra uid→userId en /usuariosPorUID (cada usuario solo escribe su propio)
  async function fbRegisterUID(uid, userId) {
    const res = await fetch(`${FB_URL}/usuariosPorUID/${uid}.json${_q()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId),
    });
    // Silencioso — no lanzar error si falla (puede que ya exista)
  }

  async function fbGet(path) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      // Lecturas públicas: no requieren token (Firebase rules: .read: true en raíz)
      const res = await fetch(`${FB_URL}/${path}.json`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`Firebase GET error: ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function fbSet(path, data) {
    const res = await fetch(`${FB_URL}/${path}.json${_q()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Firebase PUT error: ${res.status}`);
    return await res.json();
  }

  async function fbUpdate(path, data) {
    const res = await fetch(`${FB_URL}/${path}.json${_q()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Firebase PATCH error: ${res.status}`);
    return await res.json();
  }

  async function fbDelete(path) {
    const res = await fetch(`${FB_URL}/${path}.json${_q()}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Firebase DELETE error: ${res.status}`);
    return await res.json();
  }

  // -- AUTENTICACION (Google Sign-In) ----------------------------
  // Email corporativo → nombre mostrado en el torneo
  const USER_EMAIL_TO_NAME = {
    'jchicaiza@contactvox.com':  'David Chicaiza',
    'aconde@contactvox.com':     'Alexander Conde',
    'bcortez@contactvox.com':    'Bryan Cortez',
    'cfreire@contactvox.com':    'Christian Freire',
    'dtapia@contactvox.com':     'Daniel Tapia',
    'ecarrillo@contactvox.com':  'Elizabeth Carrillo',
    'eachig@contactvox.com':     'Evelyn Achig',
    'folmedo@contactvox.com':    'Fabian Olmedo',
    'fmayorga@contactvox.com':   'Fanny Mayorga',
    'htito@contactvox.com':      'Henry Tito',
    'igomez@contactvox.com':     'Isak Gomez',
    'jdelgado@contactvox.com':   'Jair Delgado',
    'jtanicuchi@contactvox.com': 'Jhon Tanicuchi',
    'jpardo@contactvox.com':     'Jimmy Pardo',
    'jmartinez@contactvox.com':  'Joan Martinez',
    'lberrones@contactvox.com':  'Leyla Berrones',
    'laguirre@contactvox.com':   'Luis Aguirre',
    'lbastidas@contactvox.com':  'Luis Bastidas',
    'lmachado@contactvox.com':   'Luis Machado',
    'mvela@contactvox.com':      'Mario Vela',
    'nsanchez@contactvox.com':   'Naymar Sanchez',
    'pcabrera@contactvox.com':   'Paul Cabrera',
    'rsuarez@contactvox.com':    'Richard Suarez',
    'tortega@contactvox.com':    'Thalia Ortega',
    'vbermudez@contactvox.com':  'Veronica Bermudez',
    'iandrade@contactvox.com':   'Jhonny Andrade',
    'marydddn71@gmail.com':      'Mariela Garzon',
  };

  function getNameFromEmail(email) {
    if (!email) return null;
    return USER_EMAIL_TO_NAME[email.toLowerCase()] ?? null;
  }

  function clearLocalUser() {
    try { localStorage.removeItem('cvx2026_current_user'); } catch {}
  }

  // -- NORMALIZACION DE DATOS DE FIREBASE -------------------------

  function normalizeFirebaseData(raw) {
    if (!raw) raw = {};

    // Usuarios: Firebase guarda {userId: {name, dept}} -> convertir a array
    const usuariosObj = raw.usuarios || {};
    const usuariosMap = {};
    Object.entries(usuariosObj).forEach(([id, u]) => {
      const name = cleanText(u?.name);
      const canonicalId = getCanonicalUserId(id, name);
      if (!canonicalId || !name) return;
      const prev = usuariosMap[canonicalId] || {};
      usuariosMap[canonicalId] = {
        id: canonicalId,
        name: prev.name || name,
        dept: prev.dept || cleanText(u?.dept) || 'General',
      };
    });
    const usuarios = Object.values(usuariosMap);
    const resolveUserId = createUserIdResolver(usuarios);

    // Pronosticos: {userId: {matchId: {l, v, fase, clasifica}}}
    const pronosticos = {};
    Object.entries(raw.pronosticos || {}).forEach(([userId, matches]) => {
      const uid = resolveUserId(userId);
      if (!uid || !matches || typeof matches !== 'object') return;
      Object.entries(matches).forEach(([matchId, p]) => {
        const mid = cleanText(matchId);
        if (!mid || !VALID_MATCH_IDS.has(mid) || !p) return;
        const l = cleanText(p.l);
        const v = cleanText(p.v);
        const savedAt = cleanText(p.savedAt);
        if (l === '' || v === '') return;
        if (!pronosticos[uid]) pronosticos[uid] = {};
        const prev = pronosticos[uid][mid];
        if (prev && prev.savedAt && savedAt && prev.savedAt > savedAt) return;
        pronosticos[uid][mid] = {
          l,
          v,
          clasifica: cleanText(p.clasifica) || '',
          fase: cleanText(p.fase) || '',
          savedAt,
        };
      });
    });

    // Resultados: {matchId: {l, v, clasifica}}
    const resultados = {};
    Object.entries(raw.resultados || {}).forEach(([matchId, r]) => {
      const mid = cleanText(matchId);
      if (!mid || (!VALID_MATCH_IDS.has(mid) && !mid.startsWith('ESP_')) || !r) return;
      const l = cleanText(r.l);
      const v = cleanText(r.v);
      if (l === '' && v === '') return;
      resultados[mid] = { l, v, visita: v, clasifica: cleanText(r.clasifica) || '' };
    });

    // Especiales: {userId: {campeon, sub, goleador, revelacion}}
    const especiales = {};
    Object.entries(raw.especiales || {}).forEach(([userId, e]) => {
      const uid = resolveUserId(userId);
      if (!uid || !e || typeof e !== 'object') return;
      const prev = especiales[uid] || {};
      especiales[uid] = {
        campeon: cleanText(e.campeon) || prev.campeon || '',
        sub: cleanText(e.sub) || prev.sub || '',
        goleador: cleanText(e.goleador) || prev.goleador || '',
        revelacion: cleanText(e.revelacion) || prev.revelacion || '',
      };
    });

    // Fases
    const fasesDefault = { grupo:{}, octavos:{}, cuartos:{}, semis:{}, tercero:{}, final:{}, especiales:{} };
    const fases = { ...fasesDefault, ...(raw.fases || {}) };

    // Equipos eliminatorios
    const equiposElim = raw.equiposElim || {};

    // Bloqueos manuales por partido: {matchId: true|false}
    // true = forzar bloqueo, false = forzar desbloqueo (override de auto-lock), undefined = auto
    const bloqueados = {};
    Object.entries(raw.bloqueados || {}).forEach(([matchId, val]) => {
      const mid = cleanText(matchId);
      if (mid && VALID_MATCH_IDS.has(mid)) bloqueados[mid] = !!val;
    });

    return { ok: true, usuarios, pronosticos, resultados, especiales, fases, equiposElim, bloqueados, premiosSemanales: [] };
  }

  // -- LLAMADAS AL API --------------------------------------------

  async function apiGet() {
    try {
      const raw = await fbGet('');
      return normalizeFirebaseData(raw);
    } catch (err) {
      console.error('CVX apiGet error:', err);
      return null;
    }
  }

  // -- CACHE ------------------------------------------------------

  const _emptyCache = () => ({
    usuarios: [], pronosticos: {}, resultados: {}, especiales: {},
    fases: { grupo:{}, octavos:{}, cuartos:{}, semis:{}, tercero:{}, final:{} },
    equiposElim: {}, bloqueados: {}, premiosSemanales: [],
  });

  async function getCache(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && _cache && (now - _cacheTs) < CACHE_TTL) return _cache;
    if (_inflight) return _inflight;
    _inflight = apiGet()
      .then(fresh => {
        _inflight = null;
        if (fresh) {
          _cache = fresh;
          _cacheTs = Date.now();
        } else if (!_cache) {
          _cache = { ..._emptyCache(), ok: false };
          _cacheTs = Date.now();
        }
        return _cache;
      })
      .catch(() => {
        _inflight = null;
        if (!_cache) {
          _cache = { ..._emptyCache(), ok: false };
          _cacheTs = Date.now();
        }
        return _cache;
      });
    return _inflight;
  }

  function invalidateCache() { _cache = null; _cacheTs = 0; }

  // -- GETTERS ----------------------------------------------------

  async function getUsuarios()    { return (await getCache()).usuarios    || []; }
  async function getPronosticos() { return (await getCache()).pronosticos || {}; }
  async function getResultados()  { return (await getCache()).resultados  || {}; }
  async function getEspeciales()  { return (await getCache()).especiales  || {}; }
  async function getBloqueados()  { return (await getCache()).bloqueados  || {}; }

  function getCurrentUser() {
    try {
      const user = normalizeStoredUser(JSON.parse(localStorage.getItem('cvx2026_current_user')) || null);
      if (!user || !hasText(user.id) || !hasText(user.name)) {
        try { localStorage.removeItem('cvx2026_current_user'); } catch {}
        return null;
      }
      try { localStorage.setItem('cvx2026_current_user', JSON.stringify(user)); } catch {}
      return user;
    } catch {
      try { localStorage.removeItem('cvx2026_current_user'); } catch {}
      return null;
    }
  }
  function setCurrentUser(user) {
    try {
      const normalizedUser = normalizeStoredUser(user);
      if (!normalizedUser || !hasText(normalizedUser.id) || !hasText(normalizedUser.name)) return;
      localStorage.setItem('cvx2026_current_user', JSON.stringify(normalizedUser));
    } catch (e) {
      console.warn('localStorage is disabled or unavailable', e);
    }
  }

  // -- SETTERS (Firebase) -----------------------------------------

  async function saveUsuario(user) {
    const normalizedUser = normalizeStoredUser(user);
    if (!normalizedUser?.id || !normalizedUser?.name) return null;
    if (!isAllowedUser(normalizedUser.name)) { console.error('Usuario no autorizado'); return null; }
    try {
      await fbSet(`usuarios/${normalizedUser.id}`, {
        name: normalizedUser.name,
        dept: normalizedUser.dept || 'General',
        createdAt: new Date().toISOString(),
      });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('saveUsuario error:', err);
      return null;
    }
  }

  async function savePronostico(userId, matchId, l, v, fase, clasifica) {
    const normalizedUserId = normalizeLikelyParticipantId(userId);
    if (!hasText(normalizedUserId) || !hasText(matchId) || normalizedUserId === 'undefined' || !VALID_MATCH_IDS.has(String(matchId))) return null;
    try {
      await fbSet(`pronosticos/${normalizedUserId}/${matchId}`, {
        l: String(l),
        v: String(v),
        fase: String(fase || ''),
        clasifica: String(clasifica || ''),
        savedAt: new Date().toISOString(),
      });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('savePronostico error:', err);
      return null;
    }
  }

  async function saveResultado(matchId, l, v, clasifica) {
    if (!hasText(matchId)) return null;
    try {
      await fbSet(`resultados/${matchId}`, {
        l: String(l),
        v: String(v),
        clasifica: String(clasifica || ''),
        updatedAt: new Date().toISOString(),
      });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('saveResultado error:', err);
      return null;
    }
  }

  async function bloquearPartido(matchId, forzar) {
    // forzar: true = bloquear manualmente, false = desbloquear (override), null = eliminar (volver a auto)
    if (!hasText(matchId)) return null;
    try {
      if (forzar === null) {
        await fbDelete(`bloqueados/${matchId}`);
      } else {
        await fbSet(`bloqueados/${matchId}`, forzar ? true : false);
      }
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('bloquearPartido error:', err);
      return null;
    }
  }

  async function deleteResultado(matchId) {
    if (!hasText(matchId)) return null;
    try {
      await fbDelete(`resultados/${matchId}`);
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('deleteResultado error:', err);
      return null;
    }
  }

  async function saveEspecial(userId, data) {
    const normalizedUserId = normalizeLikelyParticipantId(userId);
    if (!hasText(normalizedUserId) || normalizedUserId === 'undefined') return null;
    try {
      await fbSet(`especiales/${normalizedUserId}`, {
        campeon: data.campeon || '',
        sub: data.sub || '',
        goleador: data.goleador || '',
        revelacion: data.revelacion || '',
      });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('saveEspecial error:', err);
      return null;
    }
  }

  async function saveEquiposElim(body) {
    if (!body.matchId) return null;
    try {
      await fbSet(`equiposElim/${body.matchId}`, {
        local: body.local || '',
        visit: body.visit || '',
      });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('saveEquiposElim error:', err);
      return null;
    }
  }

  // -- LOGICA DE PUNTOS -------------------------------------------

  function calcPoints(pron, res, phase, matchId) {
    if (!res || res.l === '' || res.l === null || res.l === undefined)
      return { pts: 0, label: 'pendiente', detalle: 'Partido no jugado todavía' };
    if (!pron || pron.l === '' || pron.l === null || pron.l === undefined)
      return { pts: 0, label: 'sin_pronostico', detalle: 'No registraste pronóstico' };

    const pl = parseInt(pron.l), pv = parseInt(pron.v);
    const rl = parseInt(res.l),  rv = parseInt(res.v);
    const P  = PUNTOS[phase] || PUNTOS.grupo;

    if (phase === 'grupo') {
      const pronWin = pl > pv ? 'L' : pl < pv ? 'V' : 'E';
      const realWin = rl > rv ? 'L' : rl < rv ? 'V' : 'E';
      // Bono x2: partido E6 Ecuador vs Alemania — si apostaste Ecuador (local) gana y ganó
      const bonusEcu = matchId === 'E6' && pronWin === 'L' && realWin === 'L';
      if (pl === rl && pv === rv) {
        const pts = P.exacto * (bonusEcu ? 2 : 1);
        return { pts, label: 'exacto',
          detalle: `⚡ Marcador exacto ${rl}-${rv}${bonusEcu ? ' 🇪🇨 Bono x2' : ''} → +${pts} pts` };
      }
      if (pronWin === realWin) {
        const pts = P.ganador * (bonusEcu ? 2 : 1);
        return { pts, label: 'ganador',
          detalle: `✓ Ganador correcto (${rl}-${rv})${bonusEcu ? ' 🇪🇨 Bono x2' : ''} → +${pts} pts` };
      }
      return { pts: 0, label: 'fallo',
        detalle: `✗ Incorrecto (salió ${rl}-${rv}) → 0 pts` };
    }

    // ELIMINATORIA
    let realClasifica;
    if (rl !== rv) {
      realClasifica = rl > rv ? 'local' : 'visit';
    } else {
      realClasifica = res.clasifica || 'local';
    }

    let pronClasifica;
    if (pl !== pv) {
      pronClasifica = pl > pv ? 'local' : 'visit';
    } else {
      pronClasifica = pron.clasifica || 'local';
    }

    const exactoMarcador  = (pl === rl && pv === rv);
    const aciertaClasifica = (pronClasifica === realClasifica);

    if (exactoMarcador && aciertaClasifica)
      return { pts: P.exacto, label: 'exacto',
        detalle: `⚡ Marcador exacto ${rl}-${rv} + clasificado correcto → +${P.exacto} pts` };
    if (aciertaClasifica)
      return { pts: P.clasificado, label: 'clasificado',
        detalle: `✓ Clasificado correcto (${rl}-${rv}) → +${P.clasificado} pts` };
    return { pts: 0, label: 'fallo',
      detalle: `✗ Clasificado incorrecto (salió ${rl}-${rv}) → 0 pts` };
  }

  // -- ESPECIALES -------------------------------------------------
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

  // -- RANKING ----------------------------------------------------
  async function buildRanking() {
    const data = await getCache();
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
        const r = calcPoints(pron, res, m.phase, m.id);
        pts += r.pts;
        porFase[m.phase] = (porFase[m.phase] || 0) + r.pts;
        if (r.label === 'exacto')                                        exactos++;
        if (['clasificado','ganador'].includes(r.label))                 clasificados++;
        if (r.label === 'fallo')                                         fallos++;
      });

      const espPts = calcEspeciales((especiales || {})[u.id], resultados);
      pts += espPts;

      return { ...u, pts, exactos, clasificados, fallos, jugados, porFase, espPts };
    }).sort((a, b) => b.pts - a.pts || b.exactos - a.exactos || b.clasificados - a.clasificados);
  }

  // -- FASES ------------------------------------------------------
  async function getFases() {
    const data = await getCache();
    return data.fases || { grupo:{}, octavos:{}, cuartos:{}, semis:{}, tercero:{}, final:{} };
  }

  async function habilitarFase(fase) {
    try {
      await fbUpdate(`fases/${fase}`, { habilitada: true, cerrada: false, habilitadaEn: new Date().toISOString() });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('habilitarFase error:', err);
      return null;
    }
  }

  async function cerrarFase(fase) {
    try {
      await fbUpdate(`fases/${fase}`, { cerrada: true, cerradaEn: new Date().toISOString() });
      invalidateCache();
      return { ok: true };
    } catch (err) {
      console.error('cerrarFase error:', err);
      return null;
    }
  }

  async function getFaseUsuario(userId) {
    const prons = await getPronosticos();
    const userProns = (prons || {})[normalizeLikelyParticipantId(userId)] || {};
    const out = { grupo: false, octavos: false, cuartos: false, semis: false, tercero: false, final: false };
    const fasesPronosticadas = new Set();
    Object.entries(userProns).forEach(([mid, p]) => {
      let fase = p.fase;
      if (!fase) { const m = MATCHES.find(x => x.id === mid); fase = m ? m.phase : ''; }
      if (fase) fasesPronosticadas.add(fase);
    });
    PHASES.forEach(ph => { out[ph.id] = fasesPronosticadas.has(ph.id); });
    return out;
  }

  // -- BUSQUEDA DE USUARIOS ---------------------------------------
  async function buscarUsuario(nombre) {
    if (!nombre || !nombre.trim()) return [];
    const q = nombre.trim().toLowerCase();
    const usuarios = await getUsuarios();
    return usuarios
      .filter(u => (u.name || '').toLowerCase().indexOf(q) !== -1)
      .slice(0, 5);
  }

  // -- CUADRO ELIMINATORIO AUTOMATICO -----------------------------
  const TEAM_ALIAS = { 'Bosnia y Herz.': 'Bosnia y Herzegovina' };
  function normTeam(t) { const s = cleanText(t); return TEAM_ALIAS[s] || s; }

  function groupStandings(groupLetter, resultados) {
    const ms = MATCHES_GRUPOS.filter(m => m.group === groupLetter);
    const table = {};
    const ensure = t => { if (!table[t]) table[t] = { team: t, pts: 0, gf: 0, ga: 0, gd: 0, pj: 0 }; return table[t]; };
    ms.forEach(m => { ensure(normTeam(m.local)); ensure(normTeam(m.visit)); });
    let jugados = 0;
    ms.forEach(m => {
      const r = (resultados || {})[m.id];
      if (!r || r.l === '' || r.l === undefined || r.l === null) return;
      const l = parseInt(r.l), v = parseInt(r.v);
      if (isNaN(l) || isNaN(v)) return;
      jugados++;
      const A = ensure(normTeam(m.local)), B = ensure(normTeam(m.visit));
      A.pj++; B.pj++; A.gf += l; A.ga += v; B.gf += v; B.ga += l;
      if (l > v) A.pts += 3; else if (v > l) B.pts += 3; else { A.pts++; B.pts++; }
    });
    Object.values(table).forEach(t => t.gd = t.gf - t.ga);
    const sorted = Object.values(table).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
    return { allPlayed: jugados === ms.length, jugados, sorted };
  }

  function elimWinner(localName, visitName, res) {
    if (!res || res.l === '' || res.l === undefined || res.l === null) return null;
    const l = parseInt(res.l), v = parseInt(res.v);
    if (isNaN(l) || isNaN(v)) return null;
    if (l > v) return { win: localName, lose: visitName };
    if (v > l) return { win: visitName, lose: localName };
    if (res.clasifica === 'local') return { win: localName, lose: visitName };
    if (res.clasifica === 'visit') return { win: visitName, lose: localName };
    return null;
  }

  function computeBracket(resultados) {
    const out = {};
    const resolved = {};
    const standings = {};
    const terceros = [];
    GROUPS.forEach(g => {
      const st = groupStandings(g, resultados);
      standings[g] = st;
      if (st.jugados > 0 && st.sorted[2]) {
        terceros.push({ group: g, ...st.sorted[2] });
      }
    });
    const mejoresTerceros = terceros.sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));

    function resolveGroupLabel(label) {
      let mm = label.match(/^1° Grupo ([A-L])$/);
      if (mm) { const st = standings[mm[1]]; return (st && st.jugados > 0 && st.sorted[0]) ? st.sorted[0].team : null; }
      mm = label.match(/^2° Grupo ([A-L])$/);
      if (mm) { const st = standings[mm[1]]; return (st && st.jugados > 0 && st.sorted[1]) ? st.sorted[1].team : null; }
      mm = label.match(/^3° mejor (\d)$/);
      if (mm) { const idx = parseInt(mm[1]) - 1; return mejoresTerceros[idx] ? mejoresTerceros[idx].team : null; }
      return null;
    }

    function resolveElimRef(label) {
      let mm = label.match(/^Gan\. ([A-Z0-9]+)$/);
      if (mm) {
        const ref = mm[1]; const nm = resolved[ref];
        if (!nm || !nm.local || !nm.visit) return null;
        const w = elimWinner(nm.local, nm.visit, (resultados || {})[ref]);
        return w ? w.win : null;
      }
      mm = label.match(/^Per\. ([A-Z0-9]+)$/);
      if (mm) {
        const ref = mm[1]; const nm = resolved[ref];
        if (!nm || !nm.local || !nm.visit) return null;
        const w = elimWinner(nm.local, nm.visit, (resultados || {})[ref]);
        return w ? w.lose : null;
      }
      return null;
    }

    const phaseOrder = ['dieciseis', 'octavos', 'cuartos', 'semis', 'tercero', 'final'];
    phaseOrder.forEach(phase => {
      MATCHES_ELIM.filter(m => m.phase === phase).forEach(m => {
        const localReal = resolveGroupLabel(m.local) || resolveElimRef(m.local);
        const visitReal = resolveGroupLabel(m.visit) || resolveElimRef(m.visit);
        resolved[m.id] = { local: localReal || m.local, visit: visitReal || m.visit };
        if (localReal || visitReal) {
          out[m.id] = { local: localReal || '', visit: visitReal || '' };
        }
      });
    });

    return out;
  }

  // -- API PUBLICA ------------------------------------------------
  return {
    MATCHES, MATCHES_GRUPOS, MATCHES_ELIM,
    GROUPS, PHASES, FLAGS, PUNTOS, SEMANAS, AREAS,
    ALLOWED_NAMES,
    calcPoints, calcEspeciales,
    getUsuarios, getPronosticos, getResultados, getEspeciales,
    getFases, getFaseUsuario, buscarUsuario,
    getCurrentUser, setCurrentUser,
    saveUsuario, savePronostico, saveResultado, deleteResultado, saveEspecial, saveEquiposElim, bloquearPartido,
    getBloqueados,
    habilitarFase, cerrarFase,
    buildRanking, computeBracket, groupStandings,
    getCache, invalidateCache,
    get cache() { return _cache; },
    // Auth (Google Sign-In via Firebase SDK en HTML)
    getNameFromEmail, clearLocalUser,
    setRestToken, clearRestToken, fbRegisterUID,
  };

})();
