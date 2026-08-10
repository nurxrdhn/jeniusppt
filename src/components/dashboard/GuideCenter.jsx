import { BookOpen, Compass, Download, FileText, MonitorPlay, PlayCircle } from "lucide-react";

const chapters = [
  ["1", "Mulai dan masuk", "Login guru, pilihan tema, bahasa, serta pengenalan dashboard."],
  ["2", "Membuat materi", "Info materi, ukuran slide, teks, font, elemen, media, desain, dan transisi."],
  ["3", "Kuis dan Bank Soal", "Membuat soal, menyimpan ke folder, impor, ekspor, dan memakai kembali."],
  ["4", "Publikasi", "Pratinjau, QR, tautan siswa, nilai, komentar, dan sertifikat."],
  ["5", "Peserta dan laporan", "Filter, pilihan baris, penghapusan riwayat, Excel, serta PDF."],
  ["6", "Fitur lanjutan", "Workspace, tempat sampah, keamanan, pemulihan, dan pengelolaan berkas."],
];

export default function GuideCenter({ onStartTour }) {
  return <div className="guide-center">
    <div className="guide-options">
      <article className="guide-option web-guide">
        <span><Compass size={27}/></span>
        <small>PANDUAN VERSI WEB</small>
        <h3>Tour Interaktif dengan Panah</h3>
        <p>Ikuti penjelasan langsung pada halaman. Sorotan dan panah akan menunjuk menu satu per satu.</p>
        <button className="primary-button" onClick={onStartTour}><PlayCircle size={17}/> Mulai Tour Web</button>
      </article>
      <article className="guide-option pdf-guide">
        <span><FileText size={27}/></span>
        <small>BUKU DIGITAL</small>
        <h3>Panduan Lengkap JeniusPPT</h3>
        <p>Petunjuk bergambar dari login sampai membaca hasil peserta, dilengkapi keterangan setiap tombol.</p>
        <a className="primary-button" href="/downloads/panduan-lengkap-jeniusppt.pdf" download><Download size={17}/> Unduh PDF</a>
      </article>
      <article className="guide-option video-guide">
        <span><MonitorPlay size={27}/></span>
        <small>VIDEO TUTORIAL</small>
        <h3>Belajar JeniusPPT Langkah demi Langkah</h3>
        <p>Video tutorial visual yang dapat diputar langsung atau diunduh untuk ditonton tanpa internet.</p>
        <video controls preload="metadata" poster="/brand/jeniusppt-logo-solid.png"><source src="/downloads/video-tutorial-jeniusppt.mp4" type="video/mp4"/>Browser tidak mendukung video.</video>
        <div className="guide-video-actions"><a href="/downloads/video-tutorial-jeniusppt.mp4"><PlayCircle size={17}/> Putar</a><a href="/downloads/video-tutorial-jeniusppt.mp4" download><Download size={17}/> Unduh</a></div>
      </article>
    </div>
    <section className="guide-chapters"><header><BookOpen size={22}/><div><h3>Isi panduan</h3><p>Seluruh alur utama dijelaskan secara berurutan.</p></div></header>{chapters.map(([n,title,text])=><article key={n}><b>{n}</b><div><h4>{title}</h4><p>{text}</p></div></article>)}</section>
  </div>;
}
