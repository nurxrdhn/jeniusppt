#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "[1/4] Memasang dependency..."
npm install
echo "[2/4] Memeriksa build produksi..."
npm run build
echo "[3/4] Menyimpan perubahan ke Git..."
git add .
if git diff --cached --quiet; then
  echo "Tidak ada perubahan baru untuk dikirim."
else
  git commit -m "Upgrade JeniusPPT: logo, tema orange, impor ekspor dan Android"
fi
echo "[4/4] Mengirim ke GitHub agar Vercel memperbarui website..."
git push
echo "Selesai. Tunggu deployment Vercel berstatus Ready."
