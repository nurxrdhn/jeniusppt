# JeniusPPT Modern Orange

Versi baru menggunakan logo resmi JP, tema oranye responsif, pusat impor dan ekspor PPTX/DOCX/PDF, workspace, peserta, analitik, generator kode, pengaturan, dan jalur unduhan Android.

Fitur:
- Opening 3 slide otomatis
- Login Google Firebase
- Dashboard guru
- Builder: Info → Slide → Quiz → Preview → Publish
- Ukuran slide: 16:9 1920x1080, 4:3, A4, Portrait
- PPT editor dasar + background upload/URL/template
- Quiz PG + Benar/Salah
- Preview berurutan semua slide lalu semua soal
- Share modal QR code + link bawah
- Student Player `/play/:code`
- Nilai akumulasi dinamis

```bash
npm install
npm run dev
```

Untuk memeriksa build sekaligus mengirim pembaruan ke GitHub agar Vercel melakukan deployment, jalankan satu perintah berikut dari Git Bash:

```bash
bash deploy-vercel.sh
```

Masukkan hasil build Android bernama `jeniusppt.apk` ke folder `public/downloads/`. Setelah dikirim ke GitHub, tombol Download APK pada website otomatis mengunduh berkas tersebut.
