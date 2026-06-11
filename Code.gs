// ============================================================
// Copa Mundial Contactvox 2026 - Google Apps Script API v5
// ============================================================
// SETUP:
//   1. Abre script.google.com -> tu proyecto
//   2. Reemplaza TODO el codigo con este archivo
//   3. Ejecuta initSheets() una vez (menu Ejecutar)
//   4. Implementar -> Gestionar implementaciones -> Nueva version
//      (IMPORTANTE! Siempre crear NUEVA version al editar)
// ============================================================

const SPREADSHEET_ID = '19ml_9AHzIo4Eu3vARpPoBZMQHXOZdjtl7Tzgz9dUHm4';

// -- Whitelist de participantes (validacion server-side) ------
const ALLOWED_NAMES = [
  'Alexander Conde','Bryan Cortez','Christian Freire','Daniel Tapia',
  'David Chicaiza','Elizabeth Carrillo','Evelyn Achig','Fabian Olmedo',
  'Fanny Mayorga','Henry Tito','Isak Gomez','Jair Delgado',
  'Jhon Tanicuchi','Jhonny Andrade','Jimmy Pardo','Joan Martinez',
  'Leyla Berrones','Luis Aguirre','Luis Bastidas','Luis Machado',
  'Mario Vela','Mariela Garzon','Naymar Sanchez','Paul Cabrera',
  'Richard Suarez','Thalia Ortega','Veronica Bermudez',
];
const ALLOWED_SET = new Set(ALLOWED_NAMES.map(n => n.toLowerCase().trim()));

function isAllowedUser(name) {
  if (!name) return false;
  var n = name.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (var i = 0; i < ALLOWED_NAMES.length; i++) {
    var allowed = ALLOWED_NAMES[i].toLowerCase().trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (n === allowed) return true;
  }
  return false;
}

const HEADERS = {
  usuarios:    ['id', 'name', 'dept', 'createdAt'],
  pronosticos: ['userId', 'matchId', 'local', 'visita', 'fase', 'clasifica', 'savedAt'],
  resultados:  ['matchId', 'local', 'visita', 'clasifica', 'updatedAt'],
  especiales:  ['userId', 'campeon', 'sub', 'goleador', 'revelacion'],
  fases:       ['fase', 'habilitada', 'cerrada', 'habilitadaEn', 'cerradaEn'],
  equiposElim: ['matchId', 'local', 'visit'],
};

// -- Helpers --------------------------------------------------

function ss() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  var spreadsheet = ss();
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    if (HEADERS[name]) sheet.appendRow(HEADERS[name]);
  }
  return sheet;
}

function sheetToObjects(name) {
  var sheet = getSheet(name);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var v = values[i][j];
      obj[String(headers[j])] = (v !== null && v !== undefined) ? String(v) : '';
    }
    result.push(obj);
  }
  return result;
}

function findRow(sheetName, colIdx, value) {
  var values = getSheet(sheetName).getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][colIdx]) === String(value)) return i + 1;
  }
  return -1;
}

function findRow2(sheetName, c1, v1, c2, v2) {
  var values = getSheet(sheetName).getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][c1]) === String(v1) &&
        String(values[i][c2]) === String(v2)) return i + 1;
  }
  return -1;
}

// -- GET handler ----------------------------------------------

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'getAll';
    if (action === 'getAll') return respond(getAllData());
    if (action === 'ping')   return respond({ ok: true, ts: Date.now() });
    if (action === 'debug')  return respond(debugSheets());
    return respond({ ok: false, error: 'Unknown GET action: ' + action });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// -- POST handler ---------------------------------------------

function doPost(e) {
  try {
    var params;
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

// -- getAll ---------------------------------------------------

function getAllData() {
  var usuariosRaw   = sheetToObjects('usuarios');
  var pronosRaw     = sheetToObjects('pronosticos');
  var resultadosRaw = sheetToObjects('resultados');
  var especialesRaw = sheetToObjects('especiales');
  var fasesRaw      = sheetToObjects('fases');
  var elimRaw       = sheetToObjects('equiposElim');

  var usuarios = usuariosRaw.map(function(u) { return { id: u.id, name: u.name, dept: u.dept }; });

  var pronosticos = {};
  pronosRaw.forEach(function(p) {
    if (!p.userId || !p.matchId) return;
    if (!pronosticos[p.userId]) pronosticos[p.userId] = {};
    pronosticos[p.userId][p.matchId] = {
      l: p.local  || p.l || '',
      v: p.visita || p.v || '',
      fase: p.fase || '',
      clasifica: p.clasifica || '',
    };
  });

  var resultados = {};
  resultadosRaw.forEach(function(r) {
    if (!r.matchId) return;
    resultados[r.matchId] = {
      l: r.local  || r.l || '',
      v: r.visita || r.v || '',
      visita: r.visita || r.v || '',
      clasifica: r.clasifica || '',
    };
  });

  var especiales = {};
  especialesRaw.forEach(function(e) {
    if (!e.userId) return;
    especiales[e.userId] = {
      campeon: e.campeon || '', sub: e.sub || '',
      goleador: e.goleador || '', revelacion: e.revelacion || '',
    };
  });

  // Fases
  var fasesDefault = ['grupo','octavos','cuartos','semis','tercero','final','especiales'];
  var fases = {};
  fasesDefault.forEach(function(f) {
    fases[f] = { habilitada: false, cerrada: false, habilitadaEn: '', cerradaEn: '' };
  });
  fasesRaw.forEach(function(f) {
    if (!f.fase) return;
    fases[f.fase] = {
      habilitada:  f.habilitada === 'true' || f.habilitada === true,
      cerrada:     f.cerrada    === 'true' || f.cerrada    === true,
      habilitadaEn: f.habilitadaEn || '',
      cerradaEn:    f.cerradaEn    || '',
    };
  });

  // Equipos eliminatorios
  var equiposElim = {};
  elimRaw.forEach(function(e) {
    if (!e.matchId) return;
    equiposElim[e.matchId] = { local: e.local || '', visit: e.visit || '' };
  });

  return { ok: true, usuarios: usuarios, pronosticos: pronosticos, resultados: resultados, especiales: especiales, fases: fases, equiposElim: equiposElim, premiosSemanales: [] };
}

// -- saveUsuario ----------------------------------------------

function saveUsuario(p) {
  if (!p.id || !p.name) throw new Error('Missing id or name');
  if (!isAllowedUser(p.name)) throw new Error('Usuario no autorizado');
  var name = String(p.name).trim().substring(0, 60);
  var dept = String(p.dept || 'General').trim().substring(0, 40);
  var id   = String(p.id).trim().substring(0, 80);
  var sheet = getSheet('usuarios');
  var row   = findRow('usuarios', 0, id);
  if (row > 0) {
    sheet.getRange(row, 2).setValue(name);
    sheet.getRange(row, 3).setValue(dept);
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([id, name, dept, new Date().toISOString()]);
  return { ok: true, action: 'created' };
}

// -- savePronostico -------------------------------------------

function savePronostico(p) {
  if (!p.userId || !p.matchId) throw new Error('Missing userId or matchId');
  if (findRow('usuarios', 0, p.userId) < 0) throw new Error('Usuario no registrado');
  var local = String(p.local || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  var visita = String(p.visita || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  var matchId = String(p.matchId).trim().substring(0, 10);
  var userId  = String(p.userId).trim().substring(0, 80);
  var fase = String(p.fase || '').trim().substring(0, 20).replace(/[^a-z]/g, '');
  var clasifica = String(p.clasifica || '').trim().replace(/[^a-z]/g, '');
  var sheet = getSheet('pronosticos');
  var row   = findRow2('pronosticos', 0, userId, 1, matchId);
  var now   = new Date().toString();
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

// -- saveResultado --------------------------------------------

function saveResultado(p) {
  if (!p.matchId) throw new Error('Missing matchId');
  var matchId = String(p.matchId).trim().substring(0, 10);
  var local = String(p.local || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  var visita = String(p.visita || '').trim().substring(0, 3).replace(/[^0-9]/g, '');
  var clasifica = String(p.clasifica || '').trim().replace(/[^a-z]/g, '');
  var sheet = getSheet('resultados');
  var row   = findRow('resultados', 0, matchId);
  var now   = new Date().toString();
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

// -- saveEspecial ---------------------------------------------

function saveEspecial(p) {
  if (!p.userId) throw new Error('Missing userId');
  var sheet = getSheet('especiales');
  var row   = findRow('especiales', 0, p.userId);
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

// -- habilitarFase --------------------------------------------

function habilitarFase(p) {
  if (!p.fase) throw new Error('Missing fase');
  var sheet = getSheet('fases');
  var row = findRow('fases', 0, p.fase);
  var now = new Date().toString();
  if (row > 0) {
    sheet.getRange(row, 2).setValue('true');
    sheet.getRange(row, 4).setValue(now);
    return { ok: true };
  }
  sheet.appendRow([p.fase, 'true', 'false', now, '']);
  return { ok: true };
}

// -- cerrarFase -----------------------------------------------

function cerrarFase(p) {
  if (!p.fase) throw new Error('Missing fase');
  var sheet = getSheet('fases');
  var row = findRow('fases', 0, p.fase);
  var now = new Date().toString();
  if (row > 0) {
    sheet.getRange(row, 3).setValue('true');
    sheet.getRange(row, 5).setValue(now);
    return { ok: true };
  }
  sheet.appendRow([p.fase, 'true', 'true', '', now]);
  return { ok: true };
}

// -- saveEquiposElim ------------------------------------------

function saveEquiposElim(p) {
  if (!p.matchId) throw new Error('Missing matchId');
  var sheet = getSheet('equiposElim');
  var row = findRow('equiposElim', 0, p.matchId);
  if (row > 0) {
    sheet.getRange(row, 2).setValue(p.local || '');
    sheet.getRange(row, 3).setValue(p.visit || '');
    return { ok: true, action: 'updated' };
  }
  sheet.appendRow([p.matchId, p.local || '', p.visit || '']);
  return { ok: true, action: 'created' };
}

// -- Debug ----------------------------------------------------

function debugSheets() {
  var spreadsheet = ss();
  var sheets = spreadsheet.getSheets().map(function(s) { return s.getName(); });
  var info = {};
  ['pronosticos', 'resultados', 'usuarios'].forEach(function(name) {
    var sheet = spreadsheet.getSheetByName(name);
    if (!sheet) { info[name] = 'NOT FOUND'; return; }
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
    var sampleRows = lastRow > 1 ? sheet.getRange(2, 1, Math.min(lastRow - 1, 5), lastCol).getValues() : [];
    info[name] = {
      lastRow: lastRow,
      lastCol: lastCol,
      headers: headers,
      sampleRows: sampleRows.map(function(r) { return r.map(String); }),
      expectedHeaders: HEADERS[name]
    };
  });
  return { ok: true, allSheets: sheets, info: info };
}

// -- Setup inicial --------------------------------------------

function initSheets() {
  var names = Object.keys(HEADERS);
  names.forEach(function(name) {
    var sheet = getSheet(name);
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      sheet.appendRow(HEADERS[name]);
      return;
    }
    var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
    var expected = HEADERS[name];
    // Check if headers match - compare each one
    var needsFix = existing.length < expected.length;
    if (!needsFix) {
      for (var i = 0; i < expected.length; i++) {
        if (existing[i] !== expected[i]) { needsFix = true; break; }
      }
    }
    if (needsFix) {
      // Backup data rows before clearing
      var lastRow = sheet.getLastRow();
      var dataRows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];
      sheet.clear();
      sheet.appendRow(expected);
      // Re-insert data rows (best effort - column order might differ)
      dataRows.forEach(function(row) { sheet.appendRow(row); });
      Logger.log('Fixed headers for: ' + name + ' (old: ' + existing.join(',') + ')');
    }
  });
  Logger.log('Sheets verified: ' + names.join(', '));
}

// -- Test -----------------------------------------------------

function testGetAll() {
  var result = getAllData();
  Logger.log(JSON.stringify(result, null, 2));
}
