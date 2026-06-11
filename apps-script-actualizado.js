// ================================================================
// Copa Mundial Contactvox 2026 — Apps Script v5
// ================================================================
// INSTRUCCIONES:
// 1. Abre tu proyecto de Apps Script (Extensiones → Apps Script
//    desde tu Google Sheet).
// 2. Borra TODO el código anterior y pega este completo.
// 3. Ejecuta una vez la función `initSheets` desde el editor
//    (selecciónala arriba y pulsa ▶ Ejecutar). Esto crea/repara
//    todas las pestañas y headers, e inserta las fases iniciales.
//    -> Si ya tienes datos, NO se borran: initSheets solo crea lo
//       que falte y deja intactas las filas existentes.
// 4. Implementar → Gestionar implementaciones → editar la
//    implementación activa → Versión: Nueva versión → Implementar.
//    (Mantén la MISMA URL /exec; no cambia.)
//
// HOJAS / PESTAÑAS:
//   usuarios:       id | name | dept
//   pronosticos:    userId | matchId | local | visita | fase | clasifica | savedAt
//   resultados:     matchId | local | visita | clasifica | updatedAt
//   especiales:     userId | campeon | sub | goleador | revelacion
//   fases:          fase | habilitada | cerrada | habilitadaEn | cerradaEn
//   equipos_elim:   matchId | local | visit
//   premios:        semana | titulo | ganador | detalle   (opcional)
// ================================================================

// ── Definición de hojas y headers ────────────────────────────────
const SHEETS = {
  usuarios:     ['id', 'name', 'dept'],
  pronosticos:  ['userId', 'matchId', 'local', 'visita', 'fase', 'clasifica', 'savedAt'],
  resultados:   ['matchId', 'local', 'visita', 'clasifica', 'updatedAt'],
  especiales:   ['userId', 'campeon', 'sub', 'goleador', 'revelacion'],
  fases:        ['fase', 'habilitada', 'cerrada', 'habilitadaEn', 'cerradaEn'],
  equipos_elim: ['matchId', 'local', 'visit'],
  premios:      ['semana', 'titulo', 'ganador', 'detalle'],
};

// Fases iniciales (solo se insertan si la hoja 'fases' está vacía)
const FASES_INICIALES = [
  ['grupo',      true,  false, '2026-06-01', ''],
  ['octavos',    false, false, '', ''],
  ['cuartos',    false, false, '', ''],
  ['semis',      false, false, '', ''],
  ['tercero',    false, false, '', ''],
  ['final',      false, false, '', ''],
  ['especiales', false, false, '', ''],
];

const FASE_IDS = ['grupo', 'octavos', 'cuartos', 'semis', 'tercero', 'final', 'especiales'];

// ================================================================
// ENRUTAMIENTO
// ================================================================
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getAll';
  try {
    if (action === 'getAll')        return jsonResponse(getAllData());
    if (action === 'getFases')      return jsonResponse({ ok: true, fases: getFasesData() });
    if (action === 'buscarUsuario') return jsonResponse({ ok: true, usuarios: buscarUsuarioPorNombre(e.parameter.nombre || '') });
    return jsonResponse({ ok: false, error: 'Acción GET no reconocida: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    if (action === 'saveUsuario')    return jsonResponse(saveUsuario(body));
    if (action === 'savePronostico') return jsonResponse(savePronostico(body));
    if (action === 'saveResultado')  return jsonResponse(saveResultado(body));
    if (action === 'saveEspecial')   return jsonResponse(saveEspecial(body));
    if (action === 'habilitarFase')  return jsonResponse(habilitarFase(body));
    if (action === 'cerrarFase')     return jsonResponse(cerrarFase(body));
    if (action === 'saveEquiposElim')return jsonResponse(saveEquiposElim(body));
    return jsonResponse({ ok: false, error: 'Acción POST no reconocida: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
// INICIALIZACIÓN DE HOJAS (ejecutar manualmente una vez)
// ================================================================
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name => getOrCreateSheet(ss, name, SHEETS[name]));

  // Sembrar fases iniciales solo si está vacía (sin contar el header)
  const fasesSheet = ss.getSheetByName('fases');
  if (fasesSheet.getLastRow() < 2) {
    fasesSheet.getRange(2, 1, FASES_INICIALES.length, FASES_INICIALES[0].length)
              .setValues(FASES_INICIALES);
  }
  return 'initSheets OK';
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    return sheet;
  }
  // Asegurar que existan los headers (si la hoja existe pero está vacía)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

// ================================================================
// getAll — TODO en una sola respuesta
// ================================================================
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── usuarios ──
  const usuarios = [];
  readRows(ss, 'usuarios').forEach(r => {
    if (r.id && r.name) usuarios.push({ id: String(r.id), name: String(r.name), dept: String(r.dept || 'General') });
  });

  // ── pronosticos ──
  const pronosticos = {};
  readRows(ss, 'pronosticos').forEach(r => {
    if (!r.userId || !r.matchId) return;
    const uid = String(r.userId), mid = String(r.matchId);
    if (!pronosticos[uid]) pronosticos[uid] = {};
    pronosticos[uid][mid] = {
      l: toStr(r.local),
      v: toStr(r.visita),
      fase: String(r.fase || ''),
      clasifica: String(r.clasifica || ''),
      savedAt: String(r.savedAt || ''),
    };
  });

  // ── resultados ──
  const resultados = {};
  readRows(ss, 'resultados').forEach(r => {
    if (!r.matchId) return;
    const mid = String(r.matchId);
    resultados[mid] = {
      l: toStr(r.local),
      v: toStr(r.visita),
      visita: toStr(r.visita),
      clasifica: String(r.clasifica || ''),
      updatedAt: String(r.updatedAt || ''),
    };
  });

  // ── especiales ──
  const especiales = {};
  readRows(ss, 'especiales').forEach(r => {
    if (!r.userId) return;
    especiales[String(r.userId)] = {
      campeon: String(r.campeon || ''),
      sub: String(r.sub || ''),
      goleador: String(r.goleador || ''),
      revelacion: String(r.revelacion || ''),
    };
  });

  // ── fases ──
  const fases = getFasesData();

  // ── equipos_elim ──
  const equiposElim = {};
  readRows(ss, 'equipos_elim').forEach(r => {
    if (!r.matchId) return;
    equiposElim[String(r.matchId)] = { local: String(r.local || ''), visit: String(r.visit || '') };
  });

  // ── premios (opcional) ──
  const premiosSemanales = readRows(ss, 'premios').map(r => ({
    semana: String(r.semana || ''),
    titulo: String(r.titulo || ''),
    ganador: String(r.ganador || ''),
    detalle: String(r.detalle || ''),
  })).filter(p => p.titulo || p.ganador);

  return { ok: true, usuarios, pronosticos, resultados, especiales, fases, equiposElim, premiosSemanales };
}

// ================================================================
// FASES
// ================================================================
function getFasesData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = {};
  FASE_IDS.forEach(f => { out[f] = { habilitada: false, cerrada: false, habilitadaEn: '', cerradaEn: '' }; });
  readRows(ss, 'fases').forEach(r => {
    const f = String(r.fase || '');
    if (!f) return;
    out[f] = {
      habilitada: parseBool(r.habilitada),
      cerrada: parseBool(r.cerrada),
      habilitadaEn: String(r.habilitadaEn || ''),
      cerradaEn: String(r.cerradaEn || ''),
    };
  });
  return out;
}

function habilitarFase(body) {
  const fase = String(body.fase || '');
  if (FASE_IDS.indexOf(fase) === -1) return { ok: false, error: 'Fase inválida: ' + fase };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'fases', SHEETS.fases);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === fase) {
      // habilitada=true, habilitadaEn=ahora (no toca cerrada)
      sheet.getRange(i + 1, 2).setValue(true);
      sheet.getRange(i + 1, 4).setValue(nowISO());
      return { ok: true, fases: getFasesData() };
    }
  }
  // No existía la fila: la creamos
  sheet.appendRow([fase, true, false, nowISO(), '']);
  return { ok: true, fases: getFasesData() };
}

function cerrarFase(body) {
  const fase = String(body.fase || '');
  if (FASE_IDS.indexOf(fase) === -1) return { ok: false, error: 'Fase inválida: ' + fase };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'fases', SHEETS.fases);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === fase) {
      sheet.getRange(i + 1, 3).setValue(true);      // cerrada
      sheet.getRange(i + 1, 5).setValue(nowISO());  // cerradaEn
      return { ok: true, fases: getFasesData() };
    }
  }
  sheet.appendRow([fase, true, true, '', nowISO()]);
  return { ok: true, fases: getFasesData() };
}

// ================================================================
// USUARIOS
// ================================================================
function saveUsuario(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'usuarios', SHEETS.usuarios);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) {
      sheet.getRange(i + 1, 1, 1, 3).setValues([[body.id, body.name, body.dept || 'General']]);
      return { ok: true };
    }
  }
  sheet.appendRow([body.id, body.name, body.dept || 'General']);
  return { ok: true };
}

// Búsqueda parcial, case-insensitive, sin espacios extra. Máx 5.
function buscarUsuarioPorNombre(nombre) {
  const q = normalizar(nombre);
  if (!q) return [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = [];
  readRows(ss, 'usuarios').forEach(r => {
    if (!r.id || !r.name) return;
    if (normalizar(r.name).indexOf(q) !== -1) {
      out.push({ id: String(r.id), name: String(r.name), dept: String(r.dept || 'General') });
    }
  });
  return out.slice(0, 5);
}

// ================================================================
// PRONÓSTICOS
// ================================================================
// Columnas: userId | matchId | local | visita | fase | clasifica | savedAt
function savePronostico(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'pronosticos', SHEETS.pronosticos);
  const data = sheet.getDataRange().getValues();
  const row = [
    body.userId,
    body.matchId,
    toStr(body.local),
    toStr(body.visita),
    String(body.fase || ''),
    String(body.clasifica || ''),
    nowISO(),
  ];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.userId) && String(data[i][1]) === String(body.matchId)) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { ok: true };
    }
  }
  sheet.appendRow(row);
  return { ok: true };
}

// ================================================================
// RESULTADOS
// ================================================================
// Columnas: matchId | local | visita | clasifica | updatedAt
function saveResultado(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'resultados', SHEETS.resultados);
  const data = sheet.getDataRange().getValues();
  const row = [
    body.matchId,
    toStr(body.local),
    toStr(body.visita),
    String(body.clasifica || ''),
    nowISO(),
  ];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.matchId)) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { ok: true };
    }
  }
  sheet.appendRow(row);
  return { ok: true };
}

// ================================================================
// EQUIPOS ELIMINATORIOS (nombres editables por el admin)
// ================================================================
// body.equipos: [ { matchId, local, visit }, ... ]
function saveEquiposElim(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'equipos_elim', SHEETS.equipos_elim);
  const lista = Array.isArray(body.equipos) ? body.equipos : [];
  const data = sheet.getDataRange().getValues();

  lista.forEach(eq => {
    if (!eq || !eq.matchId) return;
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(eq.matchId)) {
        sheet.getRange(i + 1, 1, 1, 3).setValues([[eq.matchId, eq.local || '', eq.visit || '']]);
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([eq.matchId, eq.local || '', eq.visit || '']);
  });
  return { ok: true };
}

// ================================================================
// ESPECIALES
// ================================================================
function saveEspecial(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'especiales', SHEETS.especiales);
  const data = sheet.getDataRange().getValues();
  const row = [body.userId, body.campeon || '', body.sub || '', body.goleador || '', body.revelacion || ''];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.userId)) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { ok: true };
    }
  }
  sheet.appendRow(row);
  return { ok: true };
}

// ================================================================
// UTILIDADES
// ================================================================
// Lee una hoja y devuelve array de objetos {header: valor}
function readRows(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    headers.forEach((h, c) => { obj[h] = values[i][c]; });
    out.push(obj);
  }
  return out;
}

function parseBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'verdadero' || s === 'sí' || s === 'si' || s === '1' || s === 'x';
}

function toStr(v) {
  return (v === undefined || v === null) ? '' : String(v);
}

function normalizar(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function nowISO() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
}
