// ============================================================
//  AGRANUSA KPI TRACKER — Google Apps Script Backend
//  Timezone: Asia/Makassar (WITA, UTC+8)
// ============================================================

// ── Konfigurasi ─────────────────────────────────────────────
const SPREADSHEET_ID = ''; // Isi dengan ID spreadsheet kamu

const SHEETS = {
  KARYAWAN:  'Karyawan',
  TUGAS:     'Tugas_Shift',
  QC:        'QC_Reports',
  SHIFT_LOG: 'Shift_Log',
  SOP:       'SOP_Templates',
};

const SHIFT_HOURS = {
  Pagi:  { start: 7,  end: 15 },
  Sore:  { start: 15, end: 23 },
  Malam: { start: 23, end: 7  },
};

const STATUS = {
  SELESAI:          'Selesai',
  LANJUT:           'Lanjut',
  BATAL:            'Batal',
  TIDAK_DIKERJAKAN: 'Tidak Dikerjakan',
  PENDING:          'Pending',
};

const POIN = {
  SELESAI:          10,
  LANJUT:           8,
  BATAL:           -10,
  TIDAK_DIKERJAKAN:-10,
  PENDING:          0,
};

// ── Entry Point (Web App & JSON API) ──────────────────────────
function doGet(e) {
  // If JSON API request with action parameter
  if (e && e.parameter && e.parameter.action) {
    let data = Object.assign({}, e.parameter);
    if (data.payload && typeof data.payload === 'string') {
      try {
        const parsed = JSON.parse(data.payload);
        data = Object.assign({}, data, parsed);
      } catch (_) {}
    }
    return _handleApiAction(e.parameter.action, data);
  }

  const page = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'index';
  const templateMap = {
    index:      'Index',
    dashboard:  'Dashboard',
    tasks:      'Tasks',
    qc:         'QC',
    leaderboard:'Leaderboard',
  };
  const template = templateMap[page] || 'Index';
  try {
    return HtmlService.createTemplateFromFile(template)
      .evaluate()
      .setTitle('Agranusa Engineering KPI Tracker')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (_) {
    // Fallback: single-page template
    return HtmlService.createHtmlOutput('<h2>Agranusa Engineering KPI Tracker</h2><p>Setup backend berhasil.</p>')
      .setTitle('Agranusa Engineering KPI Tracker');
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (_) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    let args     = payload.args || payload;
    if (typeof args === 'string') {
      try { args = JSON.parse(args); } catch (_) {}
    }
    return _handleApiAction(action, args);
  } catch (err) {
    return _jsonResponse({ success: false, error: err.message });
  }
}

function _handleApiAction(action, data) {
  let res = { success: false, error: 'Unknown action: ' + action };

  // Parse nested payload/tugas if passed as string
  if (data && typeof data === 'object') {
    if (data.payload && typeof data.payload === 'string') {
      try {
        const parsed = JSON.parse(data.payload);
        data = Object.assign({}, data, parsed);
      } catch (_) {}
    }
    if (typeof data.tugas === 'string') {
      try { data.tugas = JSON.parse(data.tugas); } catch (_) {}
    }
  }

  switch (action) {
    case 'getDashboardData':
      res = getDashboardData(data.tanggal, data.shift);
      break;
    case 'getShiftTasks':
      res = getShiftTasks(data.tanggal, data.shift);
      break;
    case 'getKaryawan':
      res = getKaryawan();
      break;
    case 'getSOPTemplates':
      res = getSOPTemplates();
      break;
    case 'createTugasShift':
      res = createTugasShift(data);
      break;
    case 'updateTugasStatus':
      res = updateTugasStatus(data.tugasId, data.status, data.poinDiperoleh, data.alasan, data.validator);
      break;
    case 'getQCReports':
      res = getQCReports(data.tanggal, data.shift);
      break;
    case 'createQCReport':
      res = createQCReport(data);
      break;
    case 'updateQCStatus':
      res = updateQCStatus(data.qcId, data.newStatus, data.verifikator);
      break;
    case 'getKPILeaderboard':
      res = getKPILeaderboard(data.tanggal, data.shift);
      break;
    case 'lockShift':
      res = lockShift(data.tanggal, data.shift, data.leader);
      break;
    case 'getShiftSummaryText':
      res = getShiftSummaryText(data.tanggal, data.shift);
      break;
    case 'initializeSheets':
    case 'resetEngineeringData':
      res = initializeSheets(true);
      break;
    default:
      res = { success: false, error: 'Action not supported: ' + action };
  }

  return _jsonResponse(res);
}

function _jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helper: Spreadsheet ──────────────────────────────────────
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet tidak ditemukan: ' + name);
  return sheet;
}

// ── Helper: ID & Format ──────────────────────────────────────
function generateId(prefix) {
  prefix = prefix || 'ID';
  const ts  = new Date().getTime().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + '-' + ts + '-' + rnd;
}

function formatDate(date) {
  date = date || new Date();
  const tz   = 'Asia/Makassar';
  const opts  = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' };
  // Returns YYYY-MM-DD
  const parts = new Intl.DateTimeFormat('en-CA', opts).format(date);
  return parts; // en-CA gives YYYY-MM-DD natively
}

function formatDateTime(date) {
  date = date || new Date();
  return Utilities.formatDate(date, 'Asia/Makassar', 'yyyy-MM-dd HH:mm:ss');
}

function getCurrentShift() {
  const now  = new Date();
  const hour = parseInt(Utilities.formatDate(now, 'Asia/Makassar', 'HH'), 10);
  if (hour >= 7  && hour < 15) return 'Pagi';
  if (hour >= 15 && hour < 23) return 'Sore';
  return 'Malam';
}

function getTodayString() {
  return formatDate(new Date());
}

// ── Helper: Poin Scoring ─────────────────────────────────────
function hitungPoin(status) {
  return POIN[status.replace(' ', '_').toUpperCase()] || 0;
}

// ── Helper: Sheet to Array of Objects ───────────────────────
function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

// ── Dashboard ────────────────────────────────────────────────
function getDashboardData(tanggal, shift) {
  try {
    tanggal = tanggal || getTodayString();
    shift   = shift   || getCurrentShift();

    const tugasSheet = getSheet(SHEETS.TUGAS);
    const tugasData  = sheetToObjects(tugasSheet);

    const tugasHariIni = tugasData.filter(t =>
      String(t['Tanggal']).substring(0, 10) === tanggal && t['Shift'] === shift
    );

    const totalTugas        = tugasHariIni.length;
    const selesai           = tugasHariIni.filter(t => t['Status'] === STATUS.SELESAI).length;
    const lanjut            = tugasHariIni.filter(t => t['Status'] === STATUS.LANJUT).length;
    const batal             = tugasHariIni.filter(t =>
      t['Status'] === STATUS.BATAL || t['Status'] === STATUS.TIDAK_DIKERJAKAN).length;
    const belumDinilai      = tugasHariIni.filter(t => t['Status'] === STATUS.PENDING).length;
    const totalPoin         = tugasHariIni.reduce((s, t) => s + (Number(t['Poin_Diperoleh']) || 0), 0);
    const completionRate    = totalTugas > 0 ? Math.round((selesai / totalTugas) * 100) : 0;

    const totalStaff = tugasHariIni.filter(t => String(t['Tipe_Karyawan']).toUpperCase() === 'STAFF').length;
    const totalDW    = tugasHariIni.filter(t => String(t['Tipe_Karyawan']).toUpperCase() === 'DW').length;

    // QC summary
    const qcSheet = getSheet(SHEETS.QC);
    const qcData  = sheetToObjects(qcSheet);
    const qcHariIni = qcData.filter(q =>
      String(q['Tanggal']).substring(0, 10) === tanggal && q['Shift'] === shift
    );
    const qcOpen   = qcHariIni.filter(q => q['Status'] !== 'Selesai Diperbaiki' && q['Status'] !== 'Closed').length;
    const qcClosed = qcHariIni.filter(q => q['Status'] === 'Selesai Diperbaiki' || q['Status'] === 'Closed').length;

    // Perhatian (tugas berstatus Lanjut atau Batal/Tidak Dikerjakan)
    const perhatian = tugasHariIni
      .filter(t => t['Status'] === STATUS.LANJUT || t['Status'] === STATUS.BATAL || t['Status'] === STATUS.TIDAK_DIKERJAKAN)
      .map(t => ({
        id: t['ID'],
        nama: t['Nama_Tugas'],
        karyawan: t['Nama_Karyawan'],
        tipeKaryawan: t['Tipe_Karyawan'],
        status: t['Status'],
        alasan: t['Alasan'] || 'Menunggu tindakan',
        villa: t['Villa'],
        departemen: t['Departemen']
      }));

    // Top Performer
    const karyawanMap = {};
    tugasHariIni.forEach(t => {
      const kid = t['Karyawan_ID'] || t['Nama_Karyawan'];
      if (!karyawanMap[kid]) {
        karyawanMap[kid] = {
          nama: t['Nama_Karyawan'],
          tipe: t['Tipe_Karyawan'],
          poin: 0,
          selesai: 0,
          total: 0
        };
      }
      karyawanMap[kid].total++;
      if (t['Status'] === STATUS.SELESAI) karyawanMap[kid].selesai++;
      karyawanMap[kid].poin += Number(t['Poin_Diperoleh']) || 0;
    });

    const topPerformer = Object.values(karyawanMap)
      .sort((a, b) => b.poin - a.poin)
      .slice(0, 3)
      .map((k, idx) => ({
        rank: idx + 1,
        nama: k.nama,
        inisial: (k.nama || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
        poin: k.poin,
        tipe: k.tipe,
        selesai: k.selesai,
        total: k.total,
        onTimePct: k.total > 0 ? Math.round((k.selesai / k.total) * 100) : 100
      }));

    // Shift log status
    const logSheet = getSheet(SHEETS.SHIFT_LOG);
    const logData  = sheetToObjects(logSheet);
    const shiftLog = logData.find(l =>
      String(l['Tanggal']).substring(0, 10) === tanggal && l['Shift'] === shift
    );
    const shiftStatus = shiftLog ? shiftLog['Status'] : 'aktif';
    const leaderName  = (shiftLog && shiftLog['Leader']) ? shiftLog['Leader'] : 'Pak Wayan';

    return {
      success: true,
      data: {
        tanggal, shift,
        leader: { nama: leaderName, inisial: 'PW' },
        shift: { nama: shift, tanggal, jamMulai: '07:00', jamSelesai: '15:00' },
        progress: { qcSelesai: qcClosed, qcTotal: qcHariIni.length || 28, pctQC: completionRate },
        kpiMatrix: {
          totalTugas,
          totalStaff,
          totalDW,
          selesai,
          lanjut,
          tertunda: batal,
          belumDinilai
        },
        poin: {
          total: totalPoin,
          breakdown: [
            { label: 'Dasar', nilai: totalPoin >= 20 ? totalPoin - 20 : totalPoin },
            { label: 'Penyesuaian', nilai: totalPoin >= 20 ? 20 : 0 }
          ]
        },
        perhatian,
        topPerformer,
        qcTerbaru: qcHariIni.slice(0, 2).map(q => ({
          id: q['ID'],
          villa: q['Villa'],
          area: q['Area'],
          kategori: q['Kategori'],
          deskripsi: q['Deskripsi'],
          status: q['Status'],
          waktu: q['Waktu_Inspeksi'] || 'Shift Ini'
        })),
        totalTugas, selesai, lanjut, batal, belumDinilai,
        totalPoin, completionRate,
        qcOpen, qcClosed, totalQC: qcHariIni.length,
        shiftStatus,
        currentShift: getCurrentShift(),
        today: getTodayString()
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Tugas Shift ──────────────────────────────────────────────
function getShiftTasks(tanggal, shift) {
  try {
    tanggal = tanggal || getTodayString();
    shift   = shift   || getCurrentShift();

    const sheet = getSheet(SHEETS.TUGAS);
    const data  = sheetToObjects(sheet);

    const filtered = data.filter(t =>
      String(t['Tanggal']).substring(0, 10) === tanggal && t['Shift'] === shift
    );

    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function createTugasShift(payload) {
  try {
    // payload: { tanggal, shift, tugas: [ { karyawanId, namaTugas, villa, sopId, estimasiMnt, poinSOP } ] }
    const sheet    = getSheet(SHEETS.TUGAS);
    const tanggal  = payload.tanggal || getTodayString();
    const shift    = payload.shift   || getCurrentShift();
    const now      = formatDateTime(new Date());

    // Ambil data karyawan untuk lookup
    const karyawanSheet = getSheet(SHEETS.KARYAWAN);
    const karyawanData  = sheetToObjects(karyawanSheet);
    const karyawanMap   = {};
    karyawanData.forEach(k => { karyawanMap[k['ID']] = k; });

    const inserted = [];
    (payload.tugas || []).forEach(t => {
      const kar   = karyawanMap[t.karyawanId] || {};
      const id    = generateId('TGS');
      const row   = [
        id,
        tanggal,
        shift,
        t.karyawanId        || '',
        kar['Nama']         || t.namaKaryawan || '',
        kar['Tipe']         || '',
        kar['Departemen']   || '',
        t.namaTugas         || '',
        t.villa             || '',
        t.sopId             || '',
        t.estimasiMnt       || 0,
        t.poinSOP           || 10,
        STATUS.PENDING,
        0,       // Poin_Diperoleh
        '',      // Alasan
        '',      // Waktu_Mulai
        '',      // Waktu_Selesai
        '',      // Validator
        now,
      ];
      sheet.appendRow(row);
      inserted.push(id);
    });

    // Pastikan shift log ada
    _ensureShiftLog(tanggal, shift);

    return { success: true, data: { inserted } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateTugasStatus(tugasId, status, poinDiperoleh, alasan, validator) {
  try {
    const sheet   = getSheet(SHEETS.TUGAS);
    const data    = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim());
    const idCol   = headers.indexOf('ID');

    const colStatus     = headers.indexOf('Status')         + 1;
    const colPoin       = headers.indexOf('Poin_Diperoleh') + 1;
    const colAlasan     = headers.indexOf('Alasan')         + 1;
    const colValidator  = headers.indexOf('Validator')      + 1;
    const colSelesai    = headers.indexOf('Waktu_Selesai')  + 1;

    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(tugasId)) {
        const row = i + 1;
        // Kalau poinDiperoleh tidak di-pass, hitung otomatis
        const poin = (poinDiperoleh !== undefined && poinDiperoleh !== null)
          ? poinDiperoleh
          : hitungPoin(status);

        sheet.getRange(row, colStatus).setValue(status);
        sheet.getRange(row, colPoin).setValue(poin);
        if (alasan !== undefined)    sheet.getRange(row, colAlasan).setValue(alasan);
        if (validator !== undefined) sheet.getRange(row, colValidator).setValue(validator);
        sheet.getRange(row, colSelesai).setValue(formatDateTime(new Date()));
        found = true;
        break;
      }
    }
    if (!found) return { success: false, error: 'Tugas tidak ditemukan: ' + tugasId };
    return { success: true, data: { tugasId, status } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Karyawan ─────────────────────────────────────────────────
function getKaryawan(hanyaAktif) {
  try {
    hanyaAktif = hanyaAktif !== false; // default true
    const sheet = getSheet(SHEETS.KARYAWAN);
    let data    = sheetToObjects(sheet);
    if (hanyaAktif) data = data.filter(k => k['Status'] === 'aktif');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── SOP Templates ────────────────────────────────────────────
function getSOPTemplates(kategori) {
  try {
    const sheet = getSheet(SHEETS.SOP);
    let data    = sheetToObjects(sheet);
    if (kategori) data = data.filter(s => s['Kategori'] === kategori);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── QC Reports ───────────────────────────────────────────────
function getQCReports(tanggal, shift) {
  try {
    tanggal = tanggal || getTodayString();
    const sheet = getSheet(SHEETS.QC);
    let data    = sheetToObjects(sheet);

    if (tanggal) data = data.filter(q => String(q['Tanggal']).substring(0, 10) === tanggal);
    if (shift)   data = data.filter(q => q['Shift'] === shift);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function createQCReport(payload) {
  try {
    // payload: { tanggal, shift, villa, tipeVilla, area, kategori, deskripsi, picId, picNama, fotoUrls, waktuInspeksi }
    const sheet = getSheet(SHEETS.QC);
    const id    = generateId('QC');
    const now   = formatDateTime(new Date());

    const row = [
      id,
      payload.tanggal       || getTodayString(),
      payload.shift         || getCurrentShift(),
      payload.villa         || '',
      payload.tipeVilla     || '',
      payload.area          || '',
      payload.kategori      || '',
      payload.deskripsi     || '',
      'Open',
      payload.picId         || '',
      payload.picNama       || '',
      Array.isArray(payload.fotoUrls) ? payload.fotoUrls.join(',') : (payload.fotoUrls || ''),
      '',      // Verifikator
      payload.waktuInspeksi || now,
      '',      // Waktu_Selesai
      now,
    ];
    sheet.appendRow(row);
    return { success: true, data: { id } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateQCStatus(qcId, newStatus, verifikator) {
  try {
    const sheet   = getSheet(SHEETS.QC);
    const data    = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim());
    const idCol   = headers.indexOf('ID');

    const colStatus     = headers.indexOf('Status')       + 1;
    const colVerif      = headers.indexOf('Verifikator')  + 1;
    const colSelesai    = headers.indexOf('Waktu_Selesai')+ 1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(qcId)) {
        const row = i + 1;
        sheet.getRange(row, colStatus).setValue(newStatus);
        if (verifikator) sheet.getRange(row, colVerif).setValue(verifikator);
        if (newStatus === 'Closed') {
          sheet.getRange(row, colSelesai).setValue(formatDateTime(new Date()));
        }
        return { success: true, data: { qcId, newStatus } };
      }
    }
    return { success: false, error: 'QC report tidak ditemukan: ' + qcId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── KPI Leaderboard ──────────────────────────────────────────
function getKPILeaderboard(tanggal, shift) {
  try {
    tanggal = tanggal || getTodayString();

    const tugasSheet = getSheet(SHEETS.TUGAS);
    const tugasData  = sheetToObjects(tugasSheet);

    // Filter per tanggal (dan opsional shift)
    let filtered = tugasData.filter(t =>
      String(t['Tanggal']).substring(0, 10) === tanggal
    );
    if (shift) filtered = filtered.filter(t => t['Shift'] === shift);

    // Agregasi per karyawan
    const karyawanMap = {};
    filtered.forEach(t => {
      const kid  = t['Karyawan_ID'];
      const nama = t['Nama_Karyawan'];
      const tipe = t['Tipe_Karyawan'];
      const dept = t['Departemen'];
      if (!karyawanMap[kid]) {
        karyawanMap[kid] = {
          karyawanId: kid, nama, tipe, departemen: dept,
          totalTugas: 0, selesai: 0, lanjut: 0,
          batal: 0, belumDinilai: 0, totalPoin: 0,
        };
      }
      const entry = karyawanMap[kid];
      entry.totalTugas++;
      const st = t['Status'];
      if (st === STATUS.SELESAI)                                                   entry.selesai++;
      else if (st === STATUS.LANJUT)                                               entry.lanjut++;
      else if (st === STATUS.BATAL || st === STATUS.TIDAK_DIKERJAKAN)              entry.batal++;
      else                                                                         entry.belumDinilai++;
      entry.totalPoin += Number(t['Poin_Diperoleh']) || 0;
      entry.inisial = (entry.nama || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      entry.poin = entry.totalPoin;
      entry.ontime_pct = entry.totalTugas > 0 ? Math.round((entry.selesai / entry.totalTugas) * 100) : 100;
      entry.qc_flawless = entry.selesai > 5 ? 1 : 0;
    });

    const leaderboard = Object.values(karyawanMap)
      .sort((a, b) => b.totalPoin - a.totalPoin)
      .map((e, i) => ({ rank: i + 1, ...e }));

    const totalTeamPoin = leaderboard.reduce((s, k) => s + k.totalPoin, 0);
    const totalSelesai  = leaderboard.reduce((s, k) => s + k.selesai, 0);
    const avgPoin       = leaderboard.length > 0 ? Math.round(totalTeamPoin / leaderboard.length) : 0;

    const teamStats = {
      totalPoin: totalTeamPoin,
      avgPoin: avgPoin,
      totalSelesai: totalSelesai,
      totalQCFlawless: leaderboard.filter(k => k.qc_flawless > 0).length
    };

    const shiftInfo = {
      tanggal,
      shift: shift || 'Semua',
      leader: 'Pak Wayan',
      status: 'aktif'
    };

    return { 
      success: true, 
      data: { 
        tanggal, 
        shift: shift || 'Semua', 
        leaderboard, 
        teamStats, 
        shiftInfo 
      } 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Shift Log ────────────────────────────────────────────────
function _ensureShiftLog(tanggal, shift) {
  const sheet   = getSheet(SHEETS.SHIFT_LOG);
  const data    = sheetToObjects(sheet);
  const existing = data.find(l =>
    String(l['Tanggal']).substring(0, 10) === tanggal && l['Shift'] === shift
  );
  if (!existing) {
    const id  = generateId('SL');
    const now = formatDateTime(new Date());
    sheet.appendRow([id, tanggal, shift, '', 0, 0, 0, 0, 0, 0, 'aktif', '']);
  }
}

function lockShift(tanggal, shift, leader) {
  try {
    tanggal = tanggal || getTodayString();
    shift   = shift   || getCurrentShift();

    // Hitung statistik tugas
    const tugasSheet = getSheet(SHEETS.TUGAS);
    const tugasData  = sheetToObjects(tugasSheet);
    const tugasShift = tugasData.filter(t =>
      String(t['Tanggal']).substring(0, 10) === tanggal && t['Shift'] === shift
    );

    const totalTugas   = tugasShift.length;
    const selesai      = tugasShift.filter(t => t['Status'] === STATUS.SELESAI).length;
    const lanjut       = tugasShift.filter(t => t['Status'] === STATUS.LANJUT).length;
    const batal        = tugasShift.filter(t =>
      t['Status'] === STATUS.BATAL || t['Status'] === STATUS.TIDAK_DIKERJAKAN).length;
    const belumDinilai = tugasShift.filter(t => t['Status'] === STATUS.PENDING).length;
    const totalPoin    = tugasShift.reduce((s, t) => s + (Number(t['Poin_Diperoleh']) || 0), 0);

    const logSheet = getSheet(SHEETS.SHIFT_LOG);
    const logData  = logSheet.getDataRange().getValues();
    const headers  = logData[0].map(h => String(h).trim());
    const idCol    = headers.indexOf('ID');

    const now = formatDateTime(new Date());
    let rowFound = -1;

    for (let i = 1; i < logData.length; i++) {
      const rowTanggal = String(logData[i][headers.indexOf('Tanggal')]).substring(0, 10);
      const rowShift   = logData[i][headers.indexOf('Shift')];
      if (rowTanggal === tanggal && rowShift === shift) {
        rowFound = i + 1;
        break;
      }
    }

    if (rowFound > 0) {
      const colMap = {};
      headers.forEach((h, i) => { colMap[h] = i + 1; });
      logSheet.getRange(rowFound, colMap['Leader']).setValue(leader || '');
      logSheet.getRange(rowFound, colMap['Total_Tugas']).setValue(totalTugas);
      logSheet.getRange(rowFound, colMap['Selesai']).setValue(selesai);
      logSheet.getRange(rowFound, colMap['Lanjut']).setValue(lanjut);
      logSheet.getRange(rowFound, colMap['Batal']).setValue(batal);
      logSheet.getRange(rowFound, colMap['Belum_Dinilai']).setValue(belumDinilai);
      logSheet.getRange(rowFound, colMap['Total_Poin']).setValue(totalPoin);
      logSheet.getRange(rowFound, colMap['Status']).setValue('terkunci');
      logSheet.getRange(rowFound, colMap['Waktu_Kunci']).setValue(now);
    } else {
      const id = generateId('SL');
      logSheet.appendRow([id, tanggal, shift, leader || '', totalTugas, selesai, lanjut, batal, belumDinilai, totalPoin, 'terkunci', now]);
    }

    return {
      success: true,
      data: { tanggal, shift, leader, totalTugas, selesai, lanjut, batal, belumDinilai, totalPoin, status: 'terkunci', waktuKunci: now }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── WhatsApp Summary ─────────────────────────────────────────
function getShiftSummaryText(tanggal, shift) {
  try {
    tanggal = tanggal || getTodayString();
    shift   = shift   || getCurrentShift();

    const dash = getDashboardData(tanggal, shift);
    if (!dash.success) throw new Error(dash.error);
    const d = dash.data;

    const lb = getKPILeaderboard(tanggal, shift);
    const topKaryawan = lb.success && lb.data.leaderboard.length > 0
      ? lb.data.leaderboard.slice(0, 3).map((k, i) =>
          `  ${['🥇','🥈','🥉'][i]} ${k.nama} — ${k.totalPoin} poin (${k.selesai}✔ ${k.lanjut}↗ ${k.batal}✘)`
        ).join('\n')
      : '  (Belum ada data)';

    const shiftEmoji = { Pagi: '🌅', Sore: '🌆', Malam: '🌙' }[shift] || '📋';

    const text = [
      `${shiftEmoji} *LAPORAN SHIFT ${shift.toUpperCase()} — ${tanggal}*`,
      `🏨 Agranusa Luxury Villa`,
      ``,
      `📊 *Ringkasan Tugas*`,
      `• Total Tugas   : ${d.totalTugas}`,
      `• ✅ Selesai     : ${d.selesai}`,
      `• ↗ Lanjut      : ${d.lanjut}`,
      `• ❌ Batal/Skip  : ${d.batal}`,
      `• ⏳ Belum Dinilai: ${d.belumDinilai}`,
      `• 📈 Completion  : ${d.completionRate}%`,
      `• 💰 Total Poin  : ${d.totalPoin}`,
      ``,
      `🔎 *Quality Control*`,
      `• Open    : ${d.qcOpen}`,
      `• Closed  : ${d.qcClosed}`,
      `• Total QC: ${d.totalQC}`,
      ``,
      `🏆 *Top Performer Shift*`,
      topKaryawan,
      ``,
      `Status Shift: ${d.shiftStatus === 'terkunci' ? '🔒 Terkunci' : '🟢 Aktif'}`,
      ``,
      `_Dikirim otomatis via Agranusa KPI Tracker_`,
    ].join('\n');

    return { success: true, data: { text } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Initialize Sheets (Khusus Department Engineering) ─────────
function initializeSheets(forceReset) {
  try {
    const ss = getSpreadsheet();

    // ── 1. Sheet Karyawan Engineering ──────────────────────
    _createSheetIfNotExists(ss, SHEETS.KARYAWAN, [
      'ID','Nama','Tipe','Departemen','Status','Inisial'
    ], [
      ['KAR-ENG-001', 'I Putu Widana',     'STAFF', 'Engineering AC & Chiller',   'aktif', 'IPW'],
      ['KAR-ENG-002', 'Ketut Arya',        'STAFF', 'Engineering Listrik & Genset','aktif', 'KTA'],
      ['KAR-ENG-003', 'I Nyoman Bagiarta', 'STAFF', 'Engineering Plumbing & Pump', 'aktif', 'INB'],
      ['KAR-ENG-004', 'Gede Rai',          'STAFF', 'Engineering Kolam & Filter',  'aktif', 'GDR'],
      ['KAR-ENG-005', 'I Made Sujana',     'STAFF', 'Engineering Civil & Finishing','aktif', 'IMS'],
      ['KAR-ENG-006', 'I Komang Wirajaya', 'DW',    'Engineering Asisten AC',      'aktif', 'IKW'],
      ['KAR-ENG-007', 'I Wayan Sudarsana', 'DW',    'Engineering Asisten Listrik', 'aktif', 'IWS'],
      ['KAR-ENG-008', 'Kadek Agus',        'STAFF', 'Duty Leader Engineering',     'aktif', 'KDA'],
    ], forceReset);

    // ── 2. Sheet SOP Templates Engineering ──────────────────
    _createSheetIfNotExists(ss, SHEETS.SOP, [
      'ID','Nama','Kategori','Deskripsi','Estimasi_Mnt','Poin','Icon','Checklist_Items'
    ], [
      ['SOP-ENG-001', 'Inspeksi & Cuci Filter AC Villa Suite', 'AC & HVAC',
        'Pembersihan evaporator, cuci filter, cek suhu hembusan & tekanan freon', 45, 10, 'ac_unit',
        'Cuci filter indoor|Cek remote & display|Ukur temperatur hembusan (18-22°C)|Cek pipa drainase|Catat kondisi unit'],
      ['SOP-ENG-002', 'Pengecekan Panel Listrik & Beban MCB', 'Kelistrikan',
        'Pemeriksaan temperatur panel MCB, isolasi kabel & stop kontak villa', 30, 10, 'bolt',
        'Scan suhu MCB dengan thermal gun|Test testpen ground & netral|Cek switch lampu taman|Pastikan tidak ada bau terbakar|Catat voltase'],
      ['SOP-ENG-003', 'Perawatan Pompa Kolam & Backwash Sand Filter', 'Pool System',
        'Backwash dan rinse sand filter, pembersihan strainer basket pompa kolam', 45, 10, 'pool',
        'Matikan pompa|Putar valve ke Backwash (2 menit)|Putar ke Rinse (1 menit)|Bersihkan strainer basket|Kembalikan ke Filter & cek pressure gauge'],
      ['SOP-ENG-004', 'Inspeksi Solar Water Heater & Tekanan Air', 'Plumbing',
        'Pengecekan suhu output air panas, valve pengaman & booster pump', 35, 10, 'hot_tub',
        'Ukur suhu air panas (min 45°C)|Periksa safety relief valve|Cek booster pump pressure|Cek sambungan pipa dari kebocoran|Catat level tangki'],
      ['SOP-ENG-005', 'Preventive Maintenance Genset & Level Solar', 'Genset & Power',
        'Uji coba pemanasan genset mingguan, cek aki, oli, dan cadangan bahan bakar solar', 40, 10, 'power',
        'Cek level solar (min 80%)|Cek level oli mesin|Cek tegangan aki stater (12.4V)|Running test tanpa beban 10 menit|Pastikan exhaust lancar'],
      ['SOP-ENG-006', 'Pengujian Kualitas Air Kolam (pH & Klorin)', 'Pool System',
        'Testing kadar pH air kolam dan kandungan klorin dengan test kit', 30, 8, 'science',
        'Ambil sampel air 30cm dari permukaan|Beri reagen Phenol Red (target pH 7.2-7.6)|Beri reagen OTO (klorin 1.5-3.0 ppm)|Catat hasil logbook kolam'],
      ['SOP-ENG-007', 'Pengecekan Lampu Underwater & Garden Spot', 'Kelistrikan',
        'Pemeriksaan lampu sorot kolam renang trafo 12V dan penerangan taman villa', 35, 8, 'lightbulb',
        'Cek lampu underwater trafo 12V|Pastikan water seal kedap air|Cek lampu spot pathway taman|Ganti bohlam redup/mati|Bersihkan cover mika lampu'],
      ['SOP-ENG-008', 'Perbaikan Kunci Smartlock, Engsel & Pintu Villa', 'Civil & Hardware',
        'Pelumasan engsel pintu kaca sliding, kalibrasi smart digital doorlock', 40, 8, 'lock',
        'Cek baterai smartlock pintu masuk|Lumasi rel pintu geser kaca dengan silicone spray|Cek grendel jendela|Pastikan pintu menutup rapat'],
      ['SOP-ENG-009', 'Pembersihan Grease Trap & Saluran Drainase', 'Plumbing',
        'Pengurasan lemak kitchen sink dan pembersihan saringan floor drain villa', 50, 10, 'plumbing',
        'Buka penutup grease trap kitchen|Angkat kerak lemak ke kantong sampah|Bersihkan keranjang saringan|Siram air panas|Cek kelancaran drainase'],
      ['SOP-ENG-010', 'Inspeksi Audio-Visual & Smart TV Villa VIP', 'Audio Visual',
        'Pemeriksaan koneksi HDMI soundbar, Netflix/YouTube Smart TV, & Wi-Fi router', 30, 8, 'tv',
        'Nyalakan Smart TV & cek sinyal Wi-Fi|Test audio bluetooth soundbar|Pastikan akun streaming siap pakai|Rapikan kabel di balik credenza'],
    ], forceReset);

    // ── 3. Sheet Tugas_Shift Engineering ────────────────────
    const tugasHeaders = [
      'ID','Tanggal','Shift','Karyawan_ID','Nama_Karyawan','Tipe_Karyawan',
      'Departemen','Nama_Tugas','Villa','SOP_ID','Estimasi_Mnt','Poin_SOP',
      'Status','Poin_Diperoleh','Alasan','Waktu_Mulai','Waktu_Selesai','Validator','Timestamp_Buat'
    ];
    const today        = getTodayString();
    const nowStr       = formatDateTime(new Date());
    const shiftAktif   = getCurrentShift();
    const tugasSeed    = [
      ['TGS-ENG-001', today, shiftAktif, 'KAR-ENG-001', 'I Putu Widana',     'STAFF', 'Engineering AC & Chiller',   'Inspeksi & Cuci Filter AC Villa Suite',      'Villa 02',           'SOP-ENG-001', 45, 10, 'Pending', 0,  '', '', '', '', nowStr],
      ['TGS-ENG-002', today, shiftAktif, 'KAR-ENG-002', 'Ketut Arya',        'STAFF', 'Engineering Listrik & Genset','Pengecekan Panel Listrik & Beban MCB',       'Villa 05',           'SOP-ENG-002', 30, 10, 'Selesai', 10, '', '', nowStr, 'Kadek Agus', nowStr],
      ['TGS-ENG-003', today, shiftAktif, 'KAR-ENG-004', 'Gede Rai',          'STAFF', 'Engineering Kolam & Filter',  'Perawatan Pompa Kolam & Backwash Sand Filter','Villa Suite 01',     'SOP-ENG-003', 45, 10, 'Selesai', 10, '', '', nowStr, 'Kadek Agus', nowStr],
      ['TGS-ENG-004', today, shiftAktif, 'KAR-ENG-003', 'I Nyoman Bagiarta', 'STAFF', 'Engineering Plumbing & Pump', 'Inspeksi Solar Water Heater & Tekanan Air', 'Villa 04',           'SOP-ENG-004', 35, 10, 'Pending', 0,  '', '', '', '', nowStr],
      ['TGS-ENG-005', today, shiftAktif, 'KAR-ENG-007', 'I Wayan Sudarsana', 'DW',    'Engineering Asisten Listrik', 'Pengecekan Lampu Underwater & Garden Spot',   'Villa 07',           'SOP-ENG-007', 35, 8,  'Lanjut',  8,  'Menunggu bohlam cadangan dari store', '', '', 'Kadek Agus', nowStr],
    ];
    _createSheetIfNotExists(ss, SHEETS.TUGAS, tugasHeaders, tugasSeed, forceReset);

    // ── 4. Sheet QC_Reports Engineering ────────────────────
    _createSheetIfNotExists(ss, SHEETS.QC, [
      'ID','Tanggal','Shift','Villa','Tipe_Villa','Area','Kategori','Deskripsi',
      'Status','PIC_ID','PIC_Nama','Foto_URLs','Verifikator',
      'Waktu_Inspeksi','Waktu_Selesai','Timestamp_Buat'
    ], [
      ['QC-ENG-001', today, shiftAktif, 'Villa 04', 'Pool Villa', 'Living Pavilion', 'AC & HVAC',
        'Suhu AC kamar utama drop (26°C tidak dingin), tekanan freon perlu dicek', 'Menunggu Perbaikan',
        'KAR-ENG-001', 'I Putu Widana', '', '', nowStr, '', nowStr],
      ['QC-ENG-002', today, shiftAktif, 'Villa 06', 'Family 3-Bedroom', 'Pump Room', 'Plumbing',
        'Booster pump air bergetar keras dan timbul suara bising getaran pipa', 'Dalam Perbaikan',
        'KAR-ENG-003', 'I Nyoman Bagiarta', '', '', nowStr, '', nowStr],
      ['QC-ENG-003', today, shiftAktif, 'Villa Suite 02', 'VIP Honeymoon', 'Pool Area', 'Kelistrikan',
        'Lampu sorot kolam renang bawah air mati di sisi utara', 'Selesai Diperbaiki',
        'KAR-ENG-002', 'Ketut Arya', '', 'Kadek Agus (Duty Lead)', nowStr, nowStr, nowStr],
    ], forceReset);

    // ── 5. Sheet Shift_Log Engineering ─────────────────────
    _createSheetIfNotExists(ss, SHEETS.SHIFT_LOG, [
      'ID','Tanggal','Shift','Leader','Total_Tugas','Selesai','Lanjut',
      'Batal','Belum_Dinilai','Total_Poin','Status','Waktu_Kunci'
    ], [
      ['SL-ENG-001', today, shiftAktif, 'Kadek Agus', 5, 2, 1, 0, 2, 28, 'aktif', ''],
    ], forceReset);

    return {
      success: true,
      data: {
        message: 'Semua sheet Engineering berhasil diinisialisasi.',
        sheets: Object.values(SHEETS),
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function _createSheetIfNotExists(ss, name, headers, seedRows, forceReset) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  } else if (forceReset) {
    sheet.clear();
  } else {
    // If sheet exists and not forceReset, do nothing
    return sheet;
  }

  sheet.appendRow(headers);

  // Style header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#131b2e');
  headerRange.setFontColor('#feb63c');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  if (seedRows && seedRows.length > 0) {
    seedRows.forEach(row => sheet.appendRow(row));
  }
  // Auto-resize columns
  try {
    sheet.autoResizeColumns(1, headers.length);
  } catch (_) {}

  return sheet;
}

// ── Utility: include HTML partials ───────────────────────────
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
