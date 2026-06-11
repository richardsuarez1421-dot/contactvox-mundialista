// ============================================================
// Copa Mundial Contactvox 2026 — Google Apps Script API v4
// ============================================================
// SETUP:
//   1. Abre script.google.com → tu proyecto
//   2. Reemplaza TODO el código con este archivo
//   3. Ejecuta initSheets() una vez (menú Ejecutar)
//   4. Implementar → Gestionar implementaciones → Nueva versión
//      (¡IMPORTANTE! Siempre crear NUEVA versión al editar)
// ============================================================

const SPREADSHEET_ID = '19ml_9AHzIo4Eu3vARpPoBZMQHXOZdjtl7Tzgz9dUHm4';

// ── Whitelist de participantes (validación server-side) ──────
const ALLOWED_NAMES = [
  'Alexander Conde','Bryan Cortez','Christian Freire','Daniel Tapia',
  'David Chicaiza','Elizabeth Carrillo','Evelyn Achig','Fabian Olmedo',
  'Fanny Mayorga','Henry Tito','Isak Gomez','Jair Delgado',
  'Jhon Tanicuchi','Jhonny Andrade','Jimmy Pardo','Joan Martinez',
  'Leyla Berrones','Luis Aguirre','Luis Bastidas','Luis Machado',
  'Mario Vela','Mariela Garzon','Naymar Sanchez','Paul Cabrera',
  'Richard Suárez','Thalia Ortega','Verónica Bermúdez',
];
const ALLOWED_SET = new Set(ALLOWED_NAMES.map(n => n.toLowerCase().trim()));

function isAllowedUser(name) {
  return ALLOWED_SET.has((name || '').toLowerCase().trim());
}

const HEADERS = {
  usuarios:    ['id', 'name', 'dept', 'createdAt'],
  pronosticos: ['userId', 'matchId', 'local', 'visita', 'fase', 'clasifica', 'savedAt'],
  resultados:  ['matchId', 'local', 'visita', 'clasifica', 'updatedAt'],
  especiales:  ['userId', 'campeon', 'sub', 'goleador', 'revelacion'],
  fases:       ['fase', 'habilitada', 'cerrada', 'habilitadaEn', 'cerradaEn'],
  equiposElim: ['matchId', 'local', 'visit'],
};

// ── Helpers ──────────────────────────────────────────────────

function ss() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const spreadsheet = ss();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    if (HEADERS[name]) sheet.appendRow(HEADERS[name]);
  }
  return sheet;
}

function sheetToObjects(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const [headers, ...rows] = values;
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const v = row[i];
      obj[h] = (v !== null && v !== undefined) ? String(v) : '';
    });
    return obj;
  });
}

function findRow(sheetName, colIdx, value) {
  const values = getSheet(sheetName).getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][colIdx]) === String(value)) return i + 1;
  }
  return -1;
}

function findRow2(sheetName, c1, v1, c2, v2) {
  const values = getSheet(sheetName).getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][c1]) === String(v1) &&
        String(values[i][c2]) === String(v2)) return i + 1;
  }
  return -1;
}

// ── GET handler ──────────────────────────────────────────────

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    if (action === 'getAll') return respond(getAllData());
    if (action === 'ping')   return respond({ ok: true, ts: Date.now() });
    return respond({ ok: false, error: 'Unknown GET action: ' + action });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── POST handler ─────────────────────────────────────────────

function doPost(e) {
  try {
    let params;
    try { params = JSON.parse(e.postData.contents); }
    catch (_) { params = e.parameter || {}; }

    switch (params.action) {
      case 'saveUsuario':     return respond(saveUsuario(params));
      case 'savePronostico':  return respond(savePronostico(params));
      case 'saveResultado':   return respond(saveResultado(params));
      case 'saveEspecial':    return respond(saveEspecial(params));
      case 'habilitarFase':   return respond(habilitarFase(params));
      case 'cerrarFase':      return respond(cerrarFase(params));
      case 'saveEquiposElim': return respond(saveEquiposElim(params));
      default:
        return respond({ ok: false, error: 'Unknown action: ' + (params.action || '(none)') });
    }
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── getAll ───────────────────────────────────────────────────

function getAllData() {
  const usuariosRaw   = sheetToObjects('usuarios');
  const pronosRaw     = sheetToObjects('pronosticos');
  const resultadosRaw = sheetToObjects('resultados');
  const especialesRaw = sheetToObjects('especiales');
  const fasesRaw      = sheetToObjects('fases');
  const elimRaw       = sheetToObjects('equiposElim');

  const usuarios = usuariosRaw.map(u => ({ id: u.id, name: u.name, dept: u.dept }));

  const pronosticos = {};
  pronosRaw.forEach(p => {
    if (!p.userId || !p.matchId) return;
    if (!pronosticos[p.userId]) pronosticos[p.userId] = {};
    pronosticos[p.userId][p.matchId] = {
      l: p.local  || p.l || '',
      v: p.visita || p.v || '',
      fase: p.fase || '',
      clasifica: p.clasifica || '',
    };
  });

  const resultados = {};
  resultadosRaw.forEach(r => {
    if (!r.matchId) return;
    resultados[r.matchId] = {
      l: r.local  || r.l || '',
      v: r.visita || r.v || '',
      visita: r.visita || r.v || '',
      clasifica: r.clasifica || '',
    };
  });

  const especiales = {};
  especialesRaw.forEach(e => {
    if (!e.userId) return;
    especiales[e.userId] = {
      campeon: e.campeon || '', sub: e.sub || '',
      goleador: e.goleador || '', revelacion: e.revelacion || '',
    };
  });

  // Fases
  const fasesDefault = ['grupo','octavos','cuartos','semis','tercero','final','especiales'];
  const fases = {};
  fasesDefault.forEach(f => {
    fases[f] = { habilitada: false, cerrada: false, habilitadaEn: '', cerradaEn: '' };
  });
  fasesRaw.forEach(f => {
    if (!f.fase) return;
    fases[f.fase] = {
      habilitada:  f.habilitada === 'true' || f.habilitada === true,
      cerrada:     f.cerrada    === 'true' || f.cerrada    === true,
      habilitadaEn: f.habilitadaEn || '',
      cerradaEn:    f.cerradaEn    || '',
    };
  });

  // Equipos eliminatorios
  const equiposElim = {};
  elimRaw.forEach(e => {
    if (!e.matchId) return;
    equiposElim[e.matchId] = { local: e.local || '', visit: e.visit || '' };
  });

  return { ok: true, usuarios, pronosticos, resultados, especiales, fases, equiposElim, premiosSemanales: [] };
}

// ── saveUsuario ──────────────────────────────────────────────

function saveUsuario(p) {
  if (!p.id || !p.name) throw new Error('Missing id or name');
  if (!isAllowedUser(p.name)) throw new Error('Usuario no autorizado');
  const name = String(p.name).trim().substring(0, 60);
  const dept = String(p.dept || 'General').trim().substring(0, 40);
  const id   = String(p.id).trim().substring(0, 80);
  const sheet = getSheet('usuarios');
  const row   = findRow('usuarios', 0, id);
  if (row > 0) {
    sheet.getRange(row, 2).setValue(name);
    sheet.getRange(row, 3).setValue(dept);
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([id, name, dept, new Date().toISOString()]);
  return { ok: true, action: 'created' };
}

// ── savePronostico ───────────────────────────────────────────

function savePronostico(p) {
  if (!p.userId || !p.matchId) throw new Error('Missing userId or matchId');
  // Verificar que el usuario exista en la hoja de usuarios registrados
  if (findRow('usuarios', 0, p.userId) < 0) throw new Error('Usuario no registrado');
  // Sanitizar: solo aceptar valores numéricos cortos para scores
  const local = String(p.local || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  const visita = String(p.visita || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  const matchId = String(p.matchId).trim().substring(0, 10);
  const userId  = String(p.userId).trim().substring(0, 80);
  const fase = String(p.fase || '').trim().substring(0, 20).replace(/[^a-z]/g, '');
  const clasifica = String(p.clasifica || '').trim().replace(/[^a-z]/g, '');
  const sheet = getSheet('pronosticos');
  const row   = findRow2('pronosticos', 0, userId, 1, matchId);
  const now   = new Date().toString();
  if (row > 0) {
    sheet.getRange(row, 3).setValue(local);
    sheet.getRange(row, 4).setValue(visita);
    sheet.getRange(row, 5).setValue(fase);
    sheet.getRange(row, 6).setValue(clasifica);
    sheet.getRange(row, 7).setValue(now);
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([userId, matchId, local, visita, fase, clasifica, now]);
  return { ok: true, action: 'created' };
}

// ── saveResultado ────────────────────────────────────────────

function saveResultado(p) {
  if (!p.matchId) throw new Error('Missing matchId');
  const matchId = String(p.matchId).trim().substring(0, 10);
  const local = String(p.local || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  const visita = String(p.visita || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  const clasifica = String(p.clasifica || '').trim().replace(/[^a-z]/g, '');
  const sheet = getSheet('resultados');
  const row   = findRow('resultados', 0, matchId);
  const now   = new Date().toString();
  if (row > 0) {
    sheet.getRange(row, 2).setValue(local);
    sheet.getRange(row, 3).setValue(visita);
    sheet.getRange(row, 4).setValue(clasifica);
    sheet.getRange(row, 5).setValue(now);
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([matchId, local, visita, clasifica, now]);
  return { ok: true, action: 'created' };
}

// ── saveEspecial ─────────────────────────────────────────────

function saveEspecial(p) {
  if (!p.userId) throw new Error('Missing userId');
  const sheet = getSheet('especiales');
  const row   = findRow('especiales', 0, p.userId);
  if (row > 0) {
    sheet.getRange(row, 2).setValue(p.campeon    || '');
    sheet.getRange(row, 3).setValue(p.sub        || '');
    sheet.getRange(row, 4).setValue(p.goleador   || '');
    sheet.getRange(row, 5).setValue(p.revelacion || '');
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([p.userId, p.campeon || '', p.sub || '', p.goleador || '', p.revelacion || '']);
  return { ok: true, action: 'created' };
}

// ── habilitarFase ────────────────────────────────────────────

function habilitarFase(p) {
  if (!p.fase) throw new Error('Missing fase');
  const sheet = getSheet('fases');
  const row = findRow('fases', 0, p.fase);
  const now = new Date().toString();
  if (row > 0) {
    sheet.getRange(row, 2).setValue('true');
    sheet.getRange(row, 4).setValue(now);
    return { ok: true };
  }
  sheet.appendRow([p.fase, 'true', 'false', now, '']);
  return { ok: true };
}

// ── cerrarFase ───────────────────────────────────────────────

function cerrarFase(p) {
  if (!p.fase) throw new Error('Missing fase');
  const sheet = getSheet('fases');
  const row = findRow('fases', 0, p.fase);
  const now = new Date().toString();
  if (row > 0) {
    sheet.getRange(row, 3).setValue('true');
    sheet.getRange(row, 5).setValue(now);
    return { ok: true };
  }
  sheet.appendRow([p.fase, 'true', 'true', '', now]);
  return { ok: true };
}

// ── saveEquiposElim ──────────────────────────────────────────

function saveEquiposElim(p) {
  if (!p.matchId) throw new Error('Missing matchId');
  const sheet = getSheet('equiposElim');
  const row = findRow('equiposElim', 0, p.matchId);
  if (row > 0) {
    sheet.getRange(row, 2).setValue(p.local || '');
    sheet.getRange(row, 3).setValue(p.visit || '');
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([p.matchId, p.local || '', p.visit || '']);
  return { ok: true, action: 'created' };
}

// ── Setup inicial ────────────────────────────────────────────

function initSheets() {
  Object.keys(HEADERS).forEach(name => {
    const sheet = getSheet(name);
    // Si la hoja ya existía pero con headers viejos, verificar
    const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    const expected = HEADERS[name];
    if (existing.length < expected.length || String(existing[0]) !== expected[0]) {
      // Limpiar y poner headers correctos
      sheet.clear();
      sheet.appendRow(expected);
    }
  });
  Logger.log('Pestañas verificadas: ' + Object.keys(HEADERS).join(', '));
}

// ── Test ─────────────────────────────────────────────────────

function testGetAll() {
  const result = getAllData();
  Logger.log(JSON.stringify(result, null, 2));
}
