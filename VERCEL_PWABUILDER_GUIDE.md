# 🚀 Panduan Lengkap: GitHub ➔ Vercel ➔ PWA Builder (Agranusa KPI Tracker)

Aplikasi **Agranusa KPI Tracker** telah dikonfigurasi secara lengkap untuk arsitektur dual-deployment:
1. **Google Apps Script Web App** (menggunakan backend `Code.gs` dan Google Sheets).
2. **Vercel Static PWA** (hosting frontend modern dengan SSL otomatis dan performa tinggi).
3. **PWA Builder** (package menjadi APK Android, iOS, atau aplikasi desktop).

---

## 📌 LANGKAH 1: Push ke GitHub Repository

Repository git lokal telah diinisialisasi di:
`C:\Users\USER\.gemini\antigravity\scratch\agranusa-kpi-tracker`

1. Buka [github.com/new](https://github.com/new) dan buat repository baru:
   - Repository name: `agranusa-kpi-tracker`
   - Visibility: **Public** atau **Private**
   - *Jangan* centang "Add a README file" (karena sudah ada).
   - Klik **Create repository**.

2. Buka terminal (PowerShell atau Command Prompt) di komputer Anda, lalu jalankan perintah berikut:
   ```bash
   cd "C:\Users\USER\.gemini\antigravity\scratch\agranusa-kpi-tracker"
   git remote add origin https://github.com/USERNAME_ANDA/agranusa-kpi-tracker.git
   git branch -M main
   git push -u origin main
   ```
   *(Ganti `USERNAME_ANDA` dengan username GitHub Anda).*

---

## 📌 LANGKAH 2: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > pilih **Project**.
3. Cari repository `agranusa-kpi-tracker` dari daftar, lalu klik **Import**.
4. Pada halaman konfigurasi project:
   - **Framework Preset**: Biarkan `Other` (otomatis mendeteksi file statis `index.html`).
   - **Root Directory**: `./` (default).
   - **Build & Development Settings**: Kosongkan (tidak perlu build script khusus).
5. Klik tombol **Deploy**.
6. Dalam waktu ~15 detik, project Anda aktif dan memiliki URL HTTPS resmi, misalnya:  
   👉 `https://agranusa-kpi-tracker.vercel.app`

---

## 📌 LANGKAH 3: Hubungkan Vercel PWA ke Google Sheets (Opsional / Live Mode)

Aplikasi di Vercel sudah memiliki mode demo bawaan. Untuk menghubungkannya langsung ke database Google Sheets Anda:
1. Deploy `Code.gs` di Google Apps Script sebagai Web App (Who has access: `Anyone`).
2. Salin URL Web App dari Google Apps Script (berakhiran `/exec`).
3. Buka aplikasi Anda di Vercel:
   - Klik ikon **Settings** (⚙️) di pojok kanan atas header.
   - Tempel URL Web App Google Apps Script Anda.
   - Klik **Tes Koneksi** > jika sukses, klik **Simpan Pengaturan**.
4. Sekarang aplikasi di Vercel langsung membaca dan menulis data ke Google Sheets Anda secara real-time!

---

## 📌 LANGKAH 4: Konversi ke Aplikasi menggunakan PWA Builder

Aplikasi ini telah memenuhi seluruh standar kualifikasi PWA Builder:
- ✅ `manifest.json` lengkap (nama, tema `#131b2e`, orientasi portrait, display standalone).
- ✅ `sw.js` (Service Worker aktif dengan caching offline).
- ✅ Ikon PWA lengkap: `192x192`, `512x512`, dan `512x512 maskable`.
- ✅ SSL / HTTPS otomatis via Vercel.

**Cara Package di PWA Builder:**
1. Buka [pwabuilder.com](https://www.pwabuilder.com/).
2. Masukkan URL Vercel Anda (misal: `https://agranusa-kpi-tracker.vercel.app`) pada kolom input.
3. Klik **Start**.
4. PWABuilder akan memverifikasi manifest, service worker, dan keamanan (skor akan hijau / lulus 100%).
5. Klik **Package for Stores**:
   - 🤖 **Android**: Download file `.aab` / `.apk` untuk dipasang langsung di HP Android atau diupload ke Google Play Console.
   - 🍎 **iOS**: Generate source project untuk Xcode / Apple App Store.
   - 💻 **Windows**: Generate package MSIX untuk Microsoft Store.
6. Anda juga bisa langsung membuka URL Vercel di browser HP dan memilih **"Add to Home Screen"** untuk instalasi langsung tanpa lewat toko aplikasi.
