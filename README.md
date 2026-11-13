# 🏨 Agranusa KPI Tracker

Sistem pelacakan KPI karyawan dan Quality Control untuk manajemen operasional villa mewah Agranusa.

---

## Bagian 1: Gambaran Umum

### Apa itu Agranusa KPI Tracker?

Agranusa KPI Tracker adalah aplikasi web yang dibangun di atas **Google Apps Script** untuk membantu leader shift dalam mengelola operasional 14 unit private pool villa Agranusa secara efisien. Aplikasi ini memungkinkan leader untuk:

- Membagi tugas kepada karyawan (STAFF & Daily Worker) per shift
- Memantau progress pekerjaan secara real-time
- Mencatat dan menindaklanjuti temuan Quality Control
- Melihat leaderboard KPI karyawan per shift maupun kumulatif
- Mengirim ringkasan shift ke grup WhatsApp tim

Sistem bekerja berbasis **shift 3 ronde**:
| Shift | Jam |
|-------|-----|
| Pagi  | 07.00 – 15.00 WITA |
| Sore  | 15.00 – 23.00 WITA |
| Malam | 23.00 – 07.00 WITA |

**Sistem Poin KPI:**
| Status Tugas | Poin |
|---|---|
| ✅ Selesai | +10 pts (atau sesuai SOP) |
| 🔄 Lanjut (dilanjut shift berikutnya) | +8 pts |
| ❌ Batal / Tidak Dikerjakan | −10 pts |

---

### Fitur Utama (5 Halaman)

| Halaman | Fungsi |
|---|---|
| 📊 **Dashboard** | Ringkasan shift aktif, statistik cepat, status tugas, dan tombol Kunci Shift |
| 📋 **Penugasan** | Buat dan kelola penugasan tugas untuk karyawan berdasarkan SOP |
| 🔍 **Monitoring** | Pantau dan nilai setiap tugas yang sedang berjalan |
| 🏠 **Quality Control** | Catat temuan inspeksi villa, kelola status perbaikan |
| 🏆 **KPI** | Leaderboard poin karyawan, grafik performa, rekap per shift |

---

### Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Backend / Server | Google Apps Script (GAS) |
| Database | Google Sheets |
| Frontend | HTML + Tailwind CSS CDN + Vanilla JS |
| Font | Plus Jakarta Sans, Inter (Google Fonts) |
| Icons | Material Symbols (Google) |
| Hosting | Google Apps Script Web App |
| Deployment | Zero-cost, tidak perlu server eksternal |

---

## Bagian 2: Struktur File

```
agranusa-kpi-tracker/
├── Code.gs               # Backend GAS - semua logic server & fungsi spreadsheet
├── appsscript.json       # Manifest GAS (timezone, permissions, webapp config)
├── Index.html            # SPA shell, router, shared header/nav
├── SharedComponents.html # Komponen HTML reusable (modal, toast, spinner)
├── Dashboard.html        # Halaman Dashboard Leader
├── Monitoring.html       # Halaman Monitoring Pekerjaan
├── Penugasan.html        # Halaman Pembagian Tugas
├── QualityControl.html   # Halaman Quality Control
├── KPI.html              # Halaman KPI & Leaderboard
└── README.md             # Dokumentasi ini
```

### Deskripsi Tiap File

| File | Deskripsi |
|---|---|
| `Code.gs` | Semua logic backend: koneksi spreadsheet, CRUD data, deploy handler `doGet()`, dan seed data `initializeSheets()` |
| `appsscript.json` | Konfigurasi project GAS: timezone Asia/Makassar, akses web app, dan dependency |
| `Index.html` | Entry point SPA; memuat semua stylesheet, font, dan JavaScript router; meng-inject halaman aktif |
| `SharedComponents.html` | Komponen UI yang dipakai di semua halaman: modal konfirmasi, toast notifikasi, loading spinner |
| `Dashboard.html` | Tampilan ringkasan shift: total tugas, poin, status, tombol kunci shift & kirim WhatsApp |
| `Monitoring.html` | Daftar tugas shift aktif, tombol nilai setiap tugas (Selesai / Lanjut / Batal) |
| `Penugasan.html` | Form buat penugasan baru: pilih karyawan, pilih SOP, pilih villa & area |
| `QualityControl.html` | Form temuan QC per villa, daftar temuan aktif, update status perbaikan |
| `KPI.html` | Leaderboard poin, grafik performa, filter per shift / tanggal / karyawan |

---

## Bagian 3: Cara Deploy ke Google Apps Script

> **Catatan:** Ikuti langkah berikut secara urut. Proses pertama kali membutuhkan sekitar 10–15 menit.

---

### A. Persiapan Google Spreadsheet

1. Buka [drive.google.com](https://drive.google.com) dan login dengan akun Google kamu
2. Klik **"+ Baru"** → **"Google Spreadsheet"**
3. Beri nama spreadsheet: **`Agranusa KPI Tracker Data`**
4. Lihat URL di browser — akan terlihat seperti ini:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
   ```
5. **Salin Spreadsheet ID** — yaitu bagian panjang di antara `/d/` dan `/edit`:
   ```
   1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
   ```
   Simpan ID ini, akan digunakan di langkah B.4.

---

### B. Setup Google Apps Script

1. Buka [script.google.com](https://script.google.com) di tab baru
2. Klik **"New project"** (pojok kiri atas)
3. Klik nama project default **"Untitled project"** di atas → ubah menjadi **`Agranusa KPI Tracker`** → klik **OK**
4. Di panel kiri, klik file **`Code.gs`**
5. **Hapus semua** isi default (`function myFunction() {}`)
6. **Paste** seluruh isi dari file `Code.gs` yang ada di folder ini
7. Cari baris paling atas:
   ```javascript
   const SPREADSHEET_ID = '';
   ```
   Ubah menjadi (ganti dengan ID spreadsheet kamu dari langkah A.5):
   ```javascript
   const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
   ```
8. Tekan **Ctrl+S** untuk menyimpan

**Membuat file HTML:**

Untuk setiap file HTML berikut, lakukan langkah yang sama:
- Klik tombol **"+"** di panel kiri → pilih **"HTML file"**
- Beri nama **persis seperti di bawah** (tanpa ekstensi `.html`)
- Hapus isi default, paste isi dari file yang sesuai
- Tekan Ctrl+S

| Nama File di GAS | Isi dari file |
|---|---|
| `Index` | `Index.html` |
| `SharedComponents` | `SharedComponents.html` |
| `Dashboard` | `Dashboard.html` |
| `Monitoring` | `Monitoring.html` |
| `Penugasan` | `Penugasan.html` |
| `QualityControl` | `QualityControl.html` |
| `KPI` | `KPI.html` |

**Mengatur appsscript.json:**

1. Klik ikon **⚙️ (gear/roda gigi)** di panel kiri → pilih **"Project Settings"**
2. Scroll ke bawah, centang: **"Show 'appsscript.json' manifest file in editor"**
3. Tutup panel Settings, kembali ke editor
4. Di panel kiri akan muncul file **`appsscript.json`** — klik file tersebut
5. Hapus isi yang ada, paste seluruh isi dari file `appsscript.json` di folder ini
6. Tekan Ctrl+S

---

### C. Inisialisasi Data Awal

Langkah ini membuat semua sheet yang diperlukan dan mengisi data contoh secara otomatis.

1. Di Apps Script editor, cari **dropdown fungsi** di toolbar (biasanya bertuliskan "myFunction" atau nama fungsi terakhir)
2. Klik dropdown tersebut → pilih **`initializeSheets`**
3. Klik tombol **▶ Run**
4. Akan muncul popup **"Authorization required"** → klik **"Review permissions"**
5. Pilih akun Google kamu
6. Klik **"Advanced"** → klik **"Go to Agranusa KPI Tracker (unsafe)"**

   > ⚠️ Pesan "unsafe" muncul karena app belum diverifikasi Google — ini normal untuk app internal. Klik "Allow" untuk melanjutkan.

7. Klik **"Allow"**
8. Kembali ke editor — lihat panel **Execution Log** di bawah. Tunggu hingga muncul pesan sukses.
9. Buka spreadsheet kamu — akan ada sheet-sheet baru: `Karyawan`, `Tugas_Shift`, `QC_Reports`, `Shift_Log`, `SOP_Templates` beserta data contoh.

---

### D. Deploy sebagai Web App

1. Di Apps Script editor, klik tombol **"Deploy"** (pojok kanan atas) → pilih **"New deployment"**
2. Di dialog yang muncul, klik ikon **⚙️** di sebelah "Select type" → pilih **"Web app"**
3. Isi form deployment:
   | Field | Nilai |
   |---|---|
   | Description | `Agranusa KPI Tracker v1.0` |
   | Execute as | `Me (email kamu)` |
   | Who has access | `Anyone` *(atau "Anyone within [nama organisasi]" jika pakai Google Workspace)* |
4. Klik **"Deploy"**
5. Jika muncul permintaan izin lagi, klik **"Authorize access"** dan ikuti prosesnya
6. Setelah berhasil, akan muncul **URL Web App** — contoh:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
7. **Salin URL ini** — ini adalah link resmi aplikasi yang akan dibagikan ke tim

> 💡 **Tip:** Simpan URL web app di catatan atau grup WhatsApp tim agar mudah diakses.

---

### E. Akses di Mobile (Rekomendasi)

Aplikasi ini dioptimalkan untuk penggunaan di smartphone selama operasional villa.

**Cara mengakses via Chrome di Android/iPhone:**

1. Buka **Google Chrome** di smartphone
2. Paste URL Web App ke address bar → buka
3. Tunggu aplikasi dimuat (pertama kali mungkin 3–5 detik)

**Tambahkan ke Home Screen (seperti app native):**

*Android (Chrome):*
1. Tap ikon **⋮** (menu tiga titik) di pojok kanan atas Chrome
2. Pilih **"Add to Home screen"**
3. Beri nama: `Agranusa KPI` → tap **"Add"**
4. Ikon aplikasi akan muncul di home screen

*iPhone (Safari):*
1. Buka URL di Safari (bukan Chrome)
2. Tap ikon **Share** (kotak dengan panah ke atas) di bagian bawah
3. Scroll dan pilih **"Add to Home Screen"**
4. Beri nama: `Agranusa KPI` → tap **"Add"**

**Bagikan ke tim:**
- Kirim URL Web App via **WhatsApp** ke seluruh leader shift
- Minta setiap leader menyimpan ke Home Screen masing-masing

---

## Bagian 4: Struktur Google Sheets

Setelah `initializeSheets` dijalankan, akan terbentuk 5 sheet berikut:

---

### Sheet: `Karyawan`

Daftar karyawan aktif yang bisa ditugaskan.

| Kolom | Deskripsi | Contoh Nilai |
|---|---|---|
| ID | ID unik karyawan | `KRY001` |
| Nama | Nama lengkap karyawan | `Wayan Suastika` |
| Tipe | Tipe kontrak karyawan | `STAFF` atau `DW` |
| Departemen | Bagian tugas utama | `Housekeeping`, `Engineering`, `Butler`, `Garden` |
| Status | Status aktif/tidak | `aktif` atau `nonaktif` |
| Inisial | Singkatan nama untuk tampilan | `WS` |

---

### Sheet: `Tugas_Shift`

Semua penugasan tugas yang dibuat per shift.

| Kolom | Deskripsi | Contoh Nilai |
|---|---|---|
| ID | ID unik tugas | `TSK20241113001` |
| Tanggal | Tanggal shift | `2024-11-13` |
| Shift | Nama shift | `Pagi`, `Sore`, `Malam` |
| Karyawan_ID | Referensi ke sheet Karyawan | `KRY001` |
| Nama_Karyawan | Nama karyawan (denormalized) | `Wayan Suastika` |
| Tipe_Karyawan | Tipe kontrak saat tugas dibuat | `STAFF` |
| Departemen | Departemen karyawan | `Housekeeping` |
| Nama_Tugas | Nama / deskripsi tugas | `Kamar mandi villa 03` |
| Villa | Lokasi villa | `Villa 03` |
| SOP_ID | Referensi ke sheet SOP_Templates | `SOP001` |
| Estimasi_Mnt | Estimasi durasi (menit) | `45` |
| Poin_SOP | Poin maksimal tugas ini | `10` |
| Status | Status terkini tugas | `Belum`, `Selesai`, `Lanjut`, `Batal` |
| Poin_Diperoleh | Poin aktual setelah dinilai | `10` |
| Alasan | Catatan jika Lanjut/Batal | `Tamu late checkout` |
| Waktu_Mulai | Waktu mulai pengerjaan | `08:30` |
| Waktu_Selesai | Waktu selesai pengerjaan | `09:15` |
| Validator | Nama leader yang menilai | `Made Artana` |
| Timestamp_Buat | Waktu penugasan dibuat | `2024-11-13 07:05:22` |

---

### Sheet: `QC_Reports`

Laporan temuan inspeksi Quality Control per villa.

| Kolom | Deskripsi | Contoh Nilai |
|---|---|---|
| ID | ID unik laporan QC | `QC20241113001` |
| Tanggal | Tanggal inspeksi | `2024-11-13` |
| Shift | Shift saat inspeksi | `Pagi` |
| Villa | Nomor villa | `Villa 05` |
| Tipe_Villa | Tipe villa | `Pool Villa`, `Suite` |
| Area | Area dalam villa | `Kamar Mandi`, `Kolam Renang`, `Taman` |
| Kategori | Kategori temuan | `Kebersihan`, `Fasilitas`, `Kerusakan` |
| Deskripsi | Deskripsi lengkap temuan | `Shower head bocor di kamar utama` |
| Status | Status penanganan | `Open`, `In Progress`, `Done` |
| PIC_ID | ID karyawan penanggung jawab | `KRY003` |
| PIC_Nama | Nama PIC (denormalized) | `Ketut Purnama` |
| Foto_URLs | URL foto (dipisah koma) | *(kosong atau URL Drive)* |
| Verifikator | Leader yang verifikasi selesai | `Made Artana` |
| Waktu_Inspeksi | Waktu ditemukannya temuan | `2024-11-13 09:45:00` |
| Waktu_Selesai | Waktu selesai ditangani | `2024-11-13 11:30:00` |
| Timestamp_Buat | Waktu laporan dibuat di sistem | `2024-11-13 09:46:12` |

---

### Sheet: `Shift_Log`

Log ringkasan setiap shift yang sudah dikunci.

| Kolom | Deskripsi | Contoh Nilai |
|---|---|---|
| ID | ID unik log | `LOG20241113P` |
| Tanggal | Tanggal shift | `2024-11-13` |
| Shift | Nama shift | `Pagi` |
| Leader | Nama leader shift | `Made Artana` |
| Total_Tugas | Jumlah total tugas | `15` |
| Selesai | Jumlah tugas selesai | `12` |
| Lanjut | Jumlah tugas dilanjut | `2` |
| Batal | Jumlah tugas dibatalkan | `1` |
| Belum_Dinilai | Jumlah belum dinilai | `0` |
| Total_Poin | Total poin seluruh karyawan | `118` |
| Status | Status shift | `aktif` atau `terkunci` |
| Waktu_Kunci | Waktu shift dikunci | `2024-11-13 15:02:33` |

---

### Sheet: `SOP_Templates`

Daftar template SOP standar yang bisa dipilih saat membuat penugasan.

| Kolom | Deskripsi | Contoh Nilai |
|---|---|---|
| ID | ID unik SOP | `SOP001` |
| Nama | Nama tugas SOP | `Turndown Service Kamar` |
| Kategori | Kategori SOP | `Housekeeping`, `Pool`, `Engineering`, `Butler`, `Garden` |
| Deskripsi | Deskripsi singkat tugas | `Merapikan kamar, mengganti linen, dsb` |
| Estimasi_Mnt | Estimasi waktu (menit) | `60` |
| Poin | Poin KPI jika selesai | `10` |
| Icon | Nama Material Symbol icon | `bed` |
| Checklist_Items | Item checklist (dipisah `\|`) | `Ganti linen\|Susun bantal\|Taruh amenities` |

---

## Bagian 5: Panduan Penggunaan

### Workflow Harian Leader Shift

```
Mulai Shift
    ↓
1. Buka Agranusa KPI Tracker
    ↓
2. Cek Dashboard → Lihat ringkasan shift aktif
    ↓
3. Tab Penugasan → Buat penugasan untuk seluruh karyawan
   (pilih karyawan + SOP + villa + area)
    ↓
4. Tab Monitoring → Pantau & nilai setiap tugas
   saat karyawan melapor selesai
    ↓
5. Tab QC → Lakukan inspeksi villa
   Catat temuan, assign PIC, pantau perbaikan
    ↓
6. Tab KPI → Lihat leaderboard poin real-time
    ↓
7. Akhir shift:
   • Dashboard → Klik "Kunci Shift"
   • Klik "Kirim Ringkasan WA"
   • Paste teks ke grup WhatsApp tim
    ↓
Selesai
```

---

### Langkah Detail Per Fitur

**📊 Dashboard**
- Menampilkan tanggal dan shift aktif secara otomatis
- Kartu statistik: total tugas, poin hari ini, karyawan aktif, temuan QC
- Tombol **"Kunci Shift"**: mengunci shift dan mencatat ringkasan ke Shift_Log
- Tombol **"Kirim Ringkasan WA"**: menghasilkan teks siap-paste ke WhatsApp

**📋 Penugasan**
- Pilih karyawan dari daftar aktif
- Pilih SOP (template tugas) — estimasi waktu dan poin terisi otomatis
- Tentukan villa dan area pengerjaan
- Klik **"Tambah Tugas"** → tugas masuk ke Tugas_Shift

**🔍 Monitoring**
- Daftar semua tugas shift aktif dengan status terkini
- Klik **"Nilai Tugas"** → pilih status: Selesai / Lanjut / Batal
- Jika Lanjut atau Batal, isi alasan (opsional)
- Poin otomatis dihitung dan dicatat ke sheet

**🏠 Quality Control**
- Form temuan: pilih villa, area, kategori, isi deskripsi
- Assign PIC (karyawan penanggung jawab perbaikan)
- Daftar temuan aktif: tombol **"Update Status"** → Open / In Progress / Done
- Temuan QC tidak mempengaruhi KPI secara langsung

**🏆 KPI**
- Leaderboard sorted by poin tertinggi
- Filter per tanggal, shift, departemen
- Grafik tren poin per karyawan

---

## Bagian 6: Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| "Script is running" tapi tidak ada data | `initializeSheets` belum dijalankan | Jalankan fungsi `initializeSheets` dari editor GAS |
| Error "You do not have permission" | Setting akses web app salah | Re-deploy: set "Who has access" ke "Anyone" |
| Data tidak tersimpan / hilang | `SPREADSHEET_ID` salah atau kosong | Periksa dan isi ulang `SPREADSHEET_ID` di baris pertama `Code.gs` |
| Halaman kosong/putih setelah deploy | Error JavaScript di salah satu file HTML | Buka DevTools browser (F12) → tab Console → lihat pesan error merah |
| Aplikasi lama muncul setelah update | Cache browser masih menyimpan versi lama | Hard refresh: Ctrl+Shift+R (Android: kosongkan cache Chrome) |
| "Exception: Service invoked too many times" | Terlalu banyak request ke GAS dalam waktu singkat | Tunggu 1–2 menit, coba lagi |
| Fungsi `initializeSheets` error "Access denied" | Belum memberi izin OAuth | Ikuti ulang langkah C (klik "Advanced" → "Allow") |
| Sheet tidak muncul di Spreadsheet | Fungsi `initializeSheets` tidak selesai | Cek Execution Log di GAS editor, jalankan ulang jika perlu |

---

## Bagian 7: Kustomisasi

### Menambah Karyawan Baru

1. Buka Google Spreadsheet `Agranusa KPI Tracker Data`
2. Klik sheet tab **`Karyawan`**
3. Tambah baris baru di bawah data terakhir
4. Isi kolom: `ID` (format `KRYxxx`), `Nama`, `Tipe` (`STAFF` atau `DW`), `Departemen`, `Status` (`aktif`), `Inisial`
5. Simpan — karyawan baru langsung muncul di dropdown Penugasan

### Menambah Template SOP Baru

1. Buka sheet **`SOP_Templates`**
2. Tambah baris baru
3. Isi kolom: `ID` (format `SOPxxx`), `Nama`, `Kategori`, `Deskripsi`, `Estimasi_Mnt`, `Poin`, `Icon` (nama Material Symbol), `Checklist_Items` (pisah dengan `|`)
4. SOP baru langsung tersedia di form Penugasan

### Mengubah Nama Villa

Jika nama/jumlah villa berubah, cari string `"Villa 0"` di file `QualityControl.html` dan perbarui daftar villa di dropdown yang ada.

### Mengubah Jadwal Shift

Jadwal shift dikonfigurasi di `Code.gs` di fungsi `getCurrentShift()`. Edit nilai jam untuk menyesuaikan jadwal operasional.

### Mengubah Nilai Poin Default

Nilai poin per status (Selesai/Lanjut/Batal) ada di konstanta `POIN` di bagian atas `Code.gs`.

---

## Lisensi & Penggunaan

Dibuat khusus untuk operasional internal **Agranusa Luxury Villa**. Tidak untuk didistribusikan ke pihak luar tanpa izin.

---

*Dokumentasi ini dihasilkan bersama dengan proyek Agranusa KPI Tracker v1.0*
