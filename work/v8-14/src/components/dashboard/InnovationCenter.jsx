import { useMemo, useState } from "react";
import { Accessibility, Activity, BadgeCheck, BookOpenCheck, BrainCircuit, CheckCircle2, ChevronRight, Component, Gauge, GraduationCap, Layers3, Mic, Palette, Presentation, QrCode, ScanSearch, Sparkles, Users, WandSparkles, Workflow } from "lucide-react";
import SolidSelect from "../ui/SolidSelect";

const ideas = [
  ["doctor", ScanSearch, "JP Design Doctor", "Periksa teks, kontras, posisi, dan konsistensi desain.", "aktif"],
  ["teaching", GraduationCap, "JP Teaching Engine", "Buat paket slide, kuis, tugas, remedial, dan pengayaan.", "aktif"],
  ["live", Presentation, "Kelas Langsung", "Presentasi, kuis, dan tanggapan siswa melalui kode materi.", "tersedia"],
  ["attention", Activity, "Analisis Perhatian", "Ukur slide yang dilihat, dilewati, dan sulit dipahami.", "server"],
  ["revision", BrainCircuit, "AI Revisi Hasil", "Perbaiki penjelasan berdasarkan jawaban siswa.", "server"],
  ["layout", WandSparkles, "Smart Layout", "Susunan otomatis yang tetap bisa diedit bebas.", "fondasi"],
  ["responsive", Gauge, "Slide Responsif", "Sesuaikan desain ke desktop, HP, A4, dan media sosial.", "fondasi"],
  ["voice", Mic, "Perintah Suara", "Mengatur elemen dan slide menggunakan suara.", "eksperimen"],
  ["semantic", Sparkles, "Pencarian Elemen Pintar", "Cari elemen berdasarkan konteks kalimat.", "server"],
  ["component", Component, "Komponen Pintar", "Logo, nomor halaman, dan identitas berubah serentak.", "fondasi"],
  ["layer", Layers3, "Peta Lapisan Visual", "Lihat, kunci, sembunyikan, dan pindahkan urutan objek.", "tersedia"],
  ["ruler", Workflow, "Penggaris Jarak", "Ukur posisi, tepi, pusat, dan jarak antarobjek.", "tersedia"],
  ["history", Workflow, "Riwayat Visual", "Kembalikan materi ke versi yang tersimpan otomatis.", "tersedia"],
  ["adaptive", BrainCircuit, "Belajar Adaptif", "Berikan remedial atau pengayaan sesuai nilai.", "fondasi"],
  ["bloom", BookOpenCheck, "Soal Taksonomi Bloom", "Susun soal berdasarkan tingkat kemampuan berpikir.", "aktif"],
  ["quiz", BadgeCheck, "Pemeriksa Kualitas Soal", "Temukan soal kosong, jawaban ganda, dan opsi lemah.", "aktif"],
  ["certificate", QrCode, "Sertifikat Terverifikasi", "Berikan kode unik untuk pemeriksaan sertifikat.", "aktif"],
  ["accessibility", Accessibility, "Pemeriksa Aksesibilitas", "Periksa ukuran huruf, kontras, dan keterbacaan.", "aktif"],
  ["collaboration", Users, "Ruang Kolaborasi", "Komentar elemen dan penyuntingan bersama.", "server"],
  ["market", Palette, "Marketplace Berkualitas", "Nilai karya berdasarkan mutu dan hasil belajar.", "tersedia"],
];

function audit(material) {
  const issues = [];
  (material?.slides || []).forEach((slide, index) => {
    if (!slide.title?.trim()) issues.push(`Slide ${index + 1}: judul masih kosong.`);
    if ((slide.title || "").length > 90) issues.push(`Slide ${index + 1}: judul terlalu panjang.`);
    if ((slide.body || "").length > 650) issues.push(`Slide ${index + 1}: isi berisiko terpotong.`);
    if ((slide.titleStyle?.fontSize || 62) < 24) issues.push(`Slide ${index + 1}: ukuran judul terlalu kecil.`);
    if ((slide.bodyStyle?.fontSize || 30) < 16) issues.push(`Slide ${index + 1}: ukuran isi terlalu kecil.`);
    (slide.elements || []).forEach((item) => {
      if (item.x < 0 || item.y < 0 || item.x + item.w > 100 || item.y + item.h > 100) issues.push(`Slide ${index + 1}: ada elemen keluar kanvas.`);
      if (item.type === "image" && !item.src) issues.push(`Slide ${index + 1}: gambar tidak memiliki sumber.`);
    });
  });
  return issues;
}

function quizAudit(material) {
  const issues = [];
  (material?.questions || []).forEach((question, index) => {
    if (!question.question?.trim()) issues.push(`Soal ${index + 1} belum memiliki pertanyaan.`);
    if (question.type === "pg") {
      const options = (question.options || []).map((item) => item.trim()).filter(Boolean);
      if (options.length < 4) issues.push(`Soal ${index + 1} belum memiliki empat pilihan lengkap.`);
      if (new Set(options.map((item) => item.toLowerCase())).size !== options.length) issues.push(`Soal ${index + 1} memiliki pilihan jawaban ganda.`);
      if (question.answer < 0 || question.answer >= options.length) issues.push(`Soal ${index + 1} belum memiliki jawaban benar yang valid.`);
    }
  });
  return issues;
}

export default function InnovationCenter({ materials, updateMaterial, notify, onNavigate }) {
  const [materialId, setMaterialId] = useState(materials[0]?.id || "");
  const [report, setReport] = useState([]);
  const [filter, setFilter] = useState("semua");
  const material = materials.find((item) => item.id === materialId);
  const visible = useMemo(() => ideas.filter((idea) => filter === "semua" || idea[4] === filter), [filter]);
  const runDesignAudit = () => setReport(audit(material));
  const fixDesign = () => {
    if (!material) return;
    updateMaterial(material.id, { slides: (material.slides || []).map((slide) => ({ ...slide, titleBox: { ...(slide.titleBox || { x:8,y:12,w:84,h:20 }), x:Math.max(0,Math.min(84,slide.titleBox?.x ?? 8)), y:Math.max(0,Math.min(80,slide.titleBox?.y ?? 12)) }, bodyBox: { ...(slide.bodyBox || { x:8,y:36,w:84,h:42 }), x:Math.max(0,Math.min(84,slide.bodyBox?.x ?? 8)), y:Math.max(0,Math.min(82,slide.bodyBox?.y ?? 36)) }, titleStyle: { ...(slide.titleStyle || {}), fontSize: Math.max(28, slide.titleStyle?.fontSize || 62) }, bodyStyle: { ...(slide.bodyStyle || {}), fontSize: Math.max(18, slide.bodyStyle?.fontSize || 30), lineHeight: slide.bodyStyle?.lineHeight || 1.35 } })) });
    notify("Perbaikan dasar desain diterapkan."); runDesignAudit();
  };
  const generateTeachingKit = () => {
    if (!material) return;
    updateMaterial(material.id, { teachingKit: { worksheet: `Lembar kerja: ${material.title}`, assignment: `Tugas penerapan ${material.title}`, remedial: `Remedial ${material.title}`, enrichment: `Pengayaan ${material.title}`, createdAt: new Date().toISOString() } });
    notify("Paket mengajar berhasil dibuat dan disimpan pada materi.");
  };
  const createCertificateCode = () => {
    if (!material) return;
    const code = `JPC-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    updateMaterial(material.id, { certificateVerificationCode: code });
    notify(`Kode sertifikat ${code} berhasil dibuat.`);
  };
  return <section className="page innovation-center">
    <div className="page-head"><span className="eyebrow">JP INOVASI</span><h1>20 keunggulan JeniusPPT</h1><p>Pusat pemeriksaan, otomasi pembelajaran, dan pengembangan fitur generasi berikutnya.</p></div>
    <section className="innovation-console">
      <div><label>Materi yang diperiksa</label><SolidSelect value={materialId} onChange={(event) => { setMaterialId(event.target.value); setReport([]); }}>{materials.length ? materials.map((item) => <option key={item.id} value={item.id}>{item.title}</option>) : <option value="">Belum ada materi</option>}</SolidSelect></div>
      <div className="innovation-actions"><button onClick={runDesignAudit}><ScanSearch size={17}/>Periksa desain</button><button onClick={() => setReport(quizAudit(material))}><BookOpenCheck size={17}/>Periksa soal</button><button onClick={fixDesign}><WandSparkles size={17}/>Perbaiki dasar</button><button onClick={generateTeachingKit}><GraduationCap size={17}/>Buat paket mengajar</button><button onClick={createCertificateCode}><QrCode size={17}/>Kode sertifikat</button></div>
      {report.length > 0 ? <div className="innovation-report"><b>{report.length} hal perlu diperiksa</b>{report.map((item) => <p key={item}>{item}</p>)}</div> : <div className="innovation-clear"><CheckCircle2 size={20}/><span>Jalankan pemeriksaan untuk melihat laporan.</span></div>}
    </section>
    <div className="innovation-filters">{["semua","aktif","tersedia","fondasi","eksperimen","server"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="innovation-grid">{visible.map(([key,Icon,title,description,status], index) => <article key={key}><header><span>{String(ideas.findIndex((idea) => idea[0] === key) + 1).padStart(2,"0")}</span><Icon size={20}/><small className={`status ${status}`}>{status === "server" ? "perlu server" : status}</small></header><h2>{title}</h2><p>{description}</p><button onClick={() => key === "live" ? onNavigate("materials") : key === "layer" || key === "ruler" || key === "layout" ? onNavigate("materials") : key === "history" ? onNavigate("productivity") : key === "market" ? onNavigate("creator_market") : key === "quiz" ? setReport(quizAudit(material)) : key === "doctor" || key === "accessibility" ? runDesignAudit() : undefined}>Buka fitur <ChevronRight size={15}/></button></article>)}</div>
  </section>;
}
