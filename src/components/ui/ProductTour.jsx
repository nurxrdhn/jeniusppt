import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";

const steps = [
  { target: '[data-tour="menu-dashboard"]', title: "Dashboard", text: "Mulai dari sini untuk melihat ringkasan materi, peserta, dan aktivitas terbaru." },
  { target: '[data-tour="menu-ai"]', title: "Jenius AI", text: "Tuliskan topik, jenjang, dan jumlah slide. AI akan membuat rancangan yang tetap dapat diedit." },
  { target: '[data-tour="menu-workspace"]', title: "Workspace", text: "Kelola folder, file, materi, dan pekerjaan yang sedang berjalan dalam satu tempat." },
  { target: '[data-tour="menu-materials"]', title: "Materi dan editor", text: "Buat presentasi, atur font, sisipkan media, tambah kuis, pratinjau, lalu publikasikan." },
  { target: '[data-tour="menu-participants"]', title: "Peserta", text: "Pantau progres dan nilai, gunakan filter, lalu ekspor laporan atau hapus riwayat yang dipilih." },
  { target: '[data-tour="menu-question_bank"]', title: "Bank Soal", text: "Simpan soal dalam folder, cari, pilih, duplikasi, pindahkan, impor, atau ekspor untuk dipakai kembali." },
  { target: '[data-tour="menu-productivity"]', title: "Panduan penggunaan", text: "Buka Pusat Produktivitas untuk mengunduh buku PDF dan menonton video tutorial JeniusPPT." },
];

export default function ProductTour({ onDone }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[index];
  const last = index === steps.length - 1;

  useLayoutEffect(() => {
    const target = document.querySelector(step.target);
    if (!target) return setRect(null);
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => {
      const box = target.getBoundingClientRect();
      setRect({ left: box.left, top: box.top, width: box.width, height: box.height });
    };
    const timer = setTimeout(update, 220);
    update();
    window.addEventListener("resize", update);
    return () => { clearTimeout(timer); window.removeEventListener("resize", update); };
  }, [step.target]);

  useEffect(() => {
    const key = (event) => {
      if (event.key === "Escape") onDone();
      if (event.key === "ArrowRight") last ? onDone() : setIndex((value) => value + 1);
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [last, onDone]);

  const cardStyle = rect
    ? { left: Math.min(window.innerWidth - 390, rect.left + rect.width + 24), top: Math.max(16, Math.min(window.innerHeight - 310, rect.top - 18)) }
    : {};

  return (
    <div className="tour-backdrop tour-game">
      {rect && <div className="tour-spotlight" style={{ left: rect.left - 7, top: rect.top - 7, width: rect.width + 14, height: rect.height + 14 }} />}
      {rect && <div className="tour-arrow" style={{ left: rect.left + rect.width + 7, top: rect.top + rect.height / 2 - 13 }}>➜</div>}
      <section className={`tour-card ${rect ? "anchored" : ""}`} style={cardStyle}>
        <button className="tour-close" onClick={onDone} aria-label="Tutup tur"><X size={18} /></button>
        <span className="tour-count">LANGKAH {index + 1} DARI {steps.length}</span>
        <h2>{step.title}</h2>
        <p>{step.text}</p>
        <div className="tour-progress">{steps.map((_, i) => <i key={i} className={i <= index ? "active" : ""} />)}</div>
        <div className="tour-actions">
          <button disabled={!index} onClick={() => setIndex((value) => value - 1)}><ArrowLeft size={16}/> Kembali</button>
          <button className="primary-button" onClick={() => last ? onDone() : setIndex((value) => value + 1)}>
            {last ? <><Check size={17}/> Selesai</> : <>Berikutnya <ArrowRight size={17}/></>}
          </button>
        </div>
      </section>
    </div>
  );
}
