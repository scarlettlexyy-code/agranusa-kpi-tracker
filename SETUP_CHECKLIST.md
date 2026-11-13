# ✅ Setup Checklist — Agranusa KPI Tracker (Google Apps Script)

Panduan checklist ringkas untuk mendeploy aplikasi ke Google Apps Script dari awal sampai selesai dalam waktu < 10 menit.

---

### Phase 1: Persiapan Google Sheets
- [ ] Buka [Google Drive](https://drive.google.com/)
- [ ] Buat Spreadsheet baru, beri nama: `Agranusa KPI Tracker Data`
- [ ] Salin **Spreadsheet ID** dari URL browser:
  - Format URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_KAMU/edit`
  - Simpan string ID tersebut untuk Phase 2

---

### Phase 2: Setup Project Google Apps Script
- [ ] Buka [Google Apps Script](https://script.google.com/)
- [ ] Klik **New Project**, beri nama: `Agranusa KPI Tracker`
- [ ] Buka file `Code.gs` di editor Apps Script:
  - Hapus kode bawaan
  - Salin seluruh isi dari file `Code.gs` lokal
  - Pada baris ke-7, tempel Spreadsheet ID kamu:
    ```javascript
    const SPREADSHEET_ID = 'TEMPEL_SPREADSHEET_ID_DISINI';
    ```
- [ ] Tampilkan `appsscript.json`:
  - Klik ikon ⚙️ **Project Settings** di menu sebelah kiri
  - Centang opsi **Show "appsscript.json" manifest file in editor**
  - Kembali ke Editor (ikon `<>`), buka `appsscript.json`
  - Ganti isinya dengan seluruh isi file `appsscript.json` lokal
- [ ] Buat file HTML satu per satu (Klik tanda **+** disamping Files > pilih **HTML**):
  - [ ] Buat file `Index` (paste isi `Index.html`)
  - [ ] Buat file `SharedComponents` (paste isi `SharedComponents.html`)
  - [ ] Buat file `Dashboard` (paste isi `Dashboard.html`)
  - [ ] Buat file `Monitoring` (paste isi `Monitoring.html`)
  - [ ] Buat file `Penugasan` (paste isi `Penugasan.html`)
  - [ ] Buat file `QualityControl` (paste isi `QualityControl.html`)
  - [ ] Buat file `KPI` (paste isi `KPI.html`)
- [ ] Simpan seluruh file (ikon 💾 atau `Ctrl + S`)

---

### Phase 3: Inisialisasi Database (Auto-Seed)
- [ ] Di bagian atas Apps Script editor, pilih fungsi `initializeSheets` dari dropdown run
- [ ] Klik tombol **Run (▶)**
- [ ] Klik **Review Permissions** pada pop-up otorisasi
- [ ] Pilih akun Google kamu > Klik **Advanced** > Klik **Go to Agranusa KPI Tracker (unsafe)** > Klik **Allow**
- [ ] Tunggu log eksekusi selesai (`Execution completed`)
- [ ] Buka Google Spreadsheet kamu dan periksa sheet berikut otomatis terbuat:
  - `Karyawan` (8 staf terdaftar)
  - `Tugas_Shift` (tugas contoh shift hari ini)
  - `QC_Reports` (laporan inspeksi mutu)
  - `Shift_Log` (log operasional)
  - `SOP_Templates` (10 SOP villa bintang lima)

---

### Phase 4: Deploy sebagai Web App
- [ ] Di pojok kanan atas, klik tombol **Deploy** > **New deployment**
- [ ] Klik ikon gerigi ⚙️ (Select type) > pilih **Web app**
- [ ] Isi konfigurasi berikut:
  - **Description**: `Agranusa KPI Tracker v1.0 Production`
  - **Execute as**: `Me (email kamu)`
  - **Who has access**: `Anyone` (atau `Anyone within [Domain]` bila Google Workspace)
- [ ] Klik **Deploy**
- [ ] Salin **Web App URL** (misal: `https://script.google.com/macros/s/.../exec`)

---

### Phase 5: Uji Coba & Instalasi di HP (PWA Experience)
- [ ] Buka URL Web App di browser Chrome / Safari di smartphone
- [ ] Verifikasi tampilan 5 tab navigasi bawah:
  - 🏠 **Dashboard**: Ringkasan beban, poin operasional, top performers
  - 📋 **Penugasan**: Wizard pembagian tugas shift & salin pesan WhatsApp
  - 👁 **Monitoring**: Input hasil penilaian Selesai (+10), Lanjut (+8), Batal (-10)
  - ✅ **QC**: Dokumentasi inspeksi villa non-penalti
  - 📊 **KPI**: Klasemen poin & produktivitas tim
- [ ] Di Chrome Android: Tap menu titik tiga ⋮ > **Tambahkan ke Layar Utama (Add to Home screen)**
- [ ] Di Safari iOS: Tap ikon Share 📤 > **Add to Home Screen**
- [ ] Bagikan URL atau QR code kepada Duty Leader Agranusa Villa!
