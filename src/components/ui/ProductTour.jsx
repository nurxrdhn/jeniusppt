import { ArrowRight, Check, X } from "lucide-react";
import { useState } from "react";

const steps = [
  [
    "Selamat datang di JeniusPPT",
    "Buat materi, kuis, media, sertifikat, dan laporan dalam satu ruang kerja.",
  ],
  [
    "Dashboard",
    "Klik setiap kartu data untuk langsung membuka Materi, Peserta, Workspace, atau publikasi.",
  ],
  [
    "Editor presentasi",
    "Susun teks bebas, gambar, stiker, video, audio, animasi, dan soal interaktif.",
  ],
  [
    "Jenius AI",
    "Masukkan topik dan jenjang. AI menyiapkan susunan slide dan kuis yang masih dapat diedit.",
  ],
  [
    "Publikasi dan hasil",
    "Bagikan melalui tautan atau QR, lalu pantau peserta dan unduh laporannya.",
  ],
];

export default function ProductTour({ onDone }) {
  const [index, setIndex] = useState(0);
  const last = index === steps.length - 1;
  return (
    <div className="tour-backdrop">
      <section className="tour-card">
        <button className="tour-close" onClick={onDone}>
          <X size={18} />
        </button>
        <span className="tour-count">
          {index + 1} / {steps.length}
        </span>
        <div className="tour-visual">
          <img src="/jeniusppt-mark-orange.svg" alt="JP" />
        </div>
        <h2>{steps[index][0]}</h2>
        <p>{steps[index][1]}</p>
        <div className="tour-progress">
          {steps.map((_, i) => (
            <i key={i} className={i <= index ? "active" : ""} />
          ))}
        </div>
        <div className="tour-actions">
          <button onClick={onDone}>Lewati</button>
          <button
            className="primary-button"
            onClick={() => (last ? onDone() : setIndex(index + 1))}
          >
            {last ? (
              <>
                <Check size={17} />
                Mulai
              </>
            ) : (
              <>
                Lanjut
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
