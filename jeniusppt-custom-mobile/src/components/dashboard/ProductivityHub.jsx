import { useMemo, useState } from "react";
import {
  Accessibility,
  ArchiveRestore,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileQuestion,
  HelpCircle,
  History,
  LayoutTemplate,
  MessageSquareHeart,
  MonitorPlay,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  WandSparkles,
} from "lucide-react";

const FEATURES = [
  ["versions", History, "Versi"],
  ["feedback", MessageSquareHeart, "Masukan"],
  ["templates", LayoutTemplate, "Template"],
  ["design", WandSparkles, "Pemeriksa"],
  ["collaboration", Users, "Kolaborasi"],
  ["questions", FileQuestion, "Bank Soal"],
  ["presenter", MonitorPlay, "Presenter"],
  ["accessibility", Accessibility, "Aksesibilitas"],
  ["help", HelpCircle, "Bantuan"],
  ["security", ShieldCheck, "Keamanan"],
];

const readLocal = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export default function ProductivityHub({
  state,
  setState,
  user,
  notify,
  onNavigate,
}) {
  const [active, setActive] = useState("versions");
  const [versions, setVersions] = useState(() =>
    readLocal("jeniusppt-version-history"),
  );
  const [feedbacks, setFeedbacks] = useState(() =>
    readLocal("jeniusppt-feedback-history"),
  );
  const [invites, setInvites] = useState(() =>
    readLocal("jeniusppt-collaborators"),
  );
  const [questions, setQuestions] = useState(() =>
    readLocal("jeniusppt-question-bank"),
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [permission, setPermission] = useState("Editor");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [helpQuery, setHelpQuery] = useState("");
  const [timerStart, setTimerStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const materials = state.materials || [];
  const slides = materials.flatMap((material) => material.slides || []);
  const designIssues = useMemo(() => {
    const issues = [];
    materials.forEach((material) =>
      (material.slides || []).forEach((slide, index) => {
        if ((slide.title || "").length > 70)
          issues.push(`${material.title}, slide ${index + 1}: judul terlalu panjang.`);
        if ((slide.body || "").length > 650)
          issues.push(`${material.title}, slide ${index + 1}: isi terlalu padat.`);
        if ((slide.bodyStyle?.fontSize || 30) < 18)
          issues.push(`${material.title}, slide ${index + 1}: teks kurang dari 18 px.`);
        (slide.elements || []).forEach((item) => {
          if ((item.x || 0) + (item.w || 0) > 100 || (item.y || 0) + (item.h || 0) > 100)
            issues.push(`${material.title}, slide ${index + 1}: ada elemen keluar kanvas.`);
        });
      }),
    );
    return issues;
  }, [materials]);

  const accessibilityIssues = useMemo(() => {
    const issues = [];
    slides.forEach((slide, index) => {
      if ((slide.elements || []).some((item) => item.type === "image" && !item.alt))
        issues.push(`Slide ${index + 1}: gambar belum memiliki teks alternatif.`);
      if ((slide.elements || []).some((item) => item.type === "video" && !item.caption))
        issues.push(`Slide ${index + 1}: video belum memiliki takarir.`);
      if ((slide.bodyStyle?.fontSize || 30) < 18)
        issues.push(`Slide ${index + 1}: ukuran isi terlalu kecil.`);
    });
    return issues;
  }, [slides]);

  function saveList(key, value, setter) {
    localStorage.setItem(key, JSON.stringify(value));
    setter(value);
  }

  function makeSnapshot() {
    const snapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      label: `Versi manual ${versions.length + 1}`,
      data: state,
    };
    const next = [snapshot, ...versions].slice(0, 12);
    saveList("jeniusppt-version-history", next, setVersions);
    notify("Versi materi berhasil disimpan.");
  }

  function restoreSnapshot(version) {
    setState(version.data);
    notify(`Data dikembalikan ke ${version.label}.`);
  }

  function addInvite(event) {
    event.preventDefault();
    if (!inviteEmail.includes("@")) {
      notify("Masukkan alamat email yang benar.", "warning");
      return;
    }
    const next = [
      {
        id: crypto.randomUUID(),
        email: inviteEmail.trim(),
        permission,
        status: "Diundang",
        createdAt: new Date().toISOString(),
      },
      ...invites,
    ];
    saveList("jeniusppt-collaborators", next, setInvites);
    setInviteEmail("");
    notify("Undangan kolaborator disiapkan.");
  }

  function addQuestion(event) {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) {
      notify("Pertanyaan dan jawaban harus diisi.", "warning");
      return;
    }
    const next = [
      {
        id: crypto.randomUUID(),
        question: question.trim(),
        answer: answer.trim(),
        subject: "Umum",
      },
      ...questions,
    ];
    saveList("jeniusppt-question-bank", next, setQuestions);
    setQuestion("");
    setAnswer("");
    notify("Soal ditambahkan ke bank soal.");
  }

  function downloadJson(data, name) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  function startPresenter() {
    if (timerStart) {
      setElapsed(Math.round((Date.now() - timerStart) / 1000));
      setTimerStart(null);
    } else {
      setElapsed(0);
      setTimerStart(Date.now());
      notify("Timer presenter dimulai.");
    }
  }

  const helpItems = [
    ["Membuat materi", "Buka Materi, pilih Buat Materi, lalu isi slide dan kuis."],
    ["Mempublikasikan", "Buka materi, tekan Publish, lalu bagikan tautan atau QR."],
    ["Memakai AI", "Buka menu AI, isi topik, tingkat kelas, dan jumlah slide."],
    ["Mengelola peserta", "Buka Peserta untuk melihat progres, nilai, dan laporan."],
    ["Merekam suara", "Buka Media pada editor dan izinkan akses mikrofon."],
  ].filter(([title, text]) =>
    `${title} ${text}`.toLowerCase().includes(helpQuery.toLowerCase()),
  );

  return (
    <section className="page productivity-page">
      <div className="page-head">
        <span className="eyebrow">Jenius Workspace</span>
        <h1>Pusat Produktivitas</h1>
        <p>Sepuluh alat untuk menjaga materi, desain, kolaborasi, dan keamanan.</p>
      </div>
      <div className="productivity-tabs">
        {FEATURES.map(([key, Icon, label], index) => (
          <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}>
            <span>{index + 1}</span><Icon size={18}/><b>{label}</b>
          </button>
        ))}
      </div>

      <div className="productivity-panel">
        {active === "versions" && <FeatureShell icon={History} title="Penyimpanan & Riwayat Versi" desc="Perubahan tersimpan otomatis. Buat titik pemulihan sebelum melakukan perubahan besar." action={<button onClick={makeSnapshot}><Save size={17}/> Simpan Versi</button>}>
          <div className="hub-list">{versions.length ? versions.map((item) => <article key={item.id}><div><b>{item.label}</b><small>{new Date(item.createdAt).toLocaleString("id-ID")}</small></div><button onClick={() => restoreSnapshot(item)}><ArchiveRestore size={16}/> Pulihkan</button></article>) : <Empty text="Belum ada versi tersimpan."/>}</div>
        </FeatureShell>}

        {active === "feedback" && <FeatureShell icon={MessageSquareHeart} title="Pusat Masukan" desc="Pantau penilaian dan komentar yang pernah dikirim melalui perangkat ini." action={<button onClick={() => onNavigate("feedback")}>Buka Formulir</button>}>
          <div className="hub-metrics"><Metric label="Jumlah masukan" value={feedbacks.length}/><Metric label="Nilai rata-rata" value={feedbacks.length ? `${(feedbacks.reduce((n, x) => n + x.rating, 0) / feedbacks.length).toFixed(1)}/5` : "–"}/></div>
          <div className="hub-list">{feedbacks.length ? feedbacks.map((item) => <article key={item.id}><div><b>{item.category} • {item.rating}/5</b><p>{item.comment}</p><small>{new Date(item.createdAt).toLocaleString("id-ID")}</small></div><button onClick={() => saveList("jeniusppt-feedback-history", feedbacks.filter((x) => x.id !== item.id), setFeedbacks)}><Trash2 size={16}/></button></article>) : <Empty text="Belum ada masukan tersimpan."/>}</div>
        </FeatureShell>}

        {active === "templates" && <FeatureShell icon={LayoutTemplate} title="Template Profesional" desc="Mulai dari desain pendidikan, bisnis, proposal, seminar, atau skripsi." action={<button onClick={() => onNavigate("dashboard")}>Lihat Template</button>}>
          <div className="hub-card-grid">{["Pendidikan", "Bisnis", "Laporan", "Proposal", "Seminar", "Skripsi"].map((name) => <button key={name} onClick={() => onNavigate("dashboard")}><LayoutTemplate size={22}/><b>{name}</b><small>Gunakan desain</small></button>)}</div>
        </FeatureShell>}

        {active === "design" && <FeatureShell icon={WandSparkles} title="Pemeriksa Desain" desc="Mendeteksi teks padat, ukuran terlalu kecil, dan elemen yang keluar dari kanvas." action={<button onClick={() => onNavigate("materials")}>Buka Materi</button>}>
          <IssueList issues={designIssues} success="Semua materi lolos pemeriksaan dasar."/>
        </FeatureShell>}

        {active === "collaboration" && <FeatureShell icon={Users} title="Kolaborasi Guru" desc="Siapkan daftar editor dan peninjau untuk materi bersama.">
          <form className="hub-inline-form" onSubmit={addInvite}><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@sekolah.sch.id"/><select value={permission} onChange={(e) => setPermission(e.target.value)}><option>Editor</option><option>Peninjau</option><option>Hanya lihat</option></select><button><UserPlus size={17}/> Undang</button></form>
          <div className="hub-list">{invites.length ? invites.map((item) => <article key={item.id}><div><b>{item.email}</b><small>{item.permission} • {item.status}</small></div><button onClick={() => saveList("jeniusppt-collaborators", invites.filter((x) => x.id !== item.id), setInvites)}><Trash2 size={16}/></button></article>) : <Empty text="Belum ada kolaborator."/>}</div>
          <p className="hub-note">Daftar dan hak akses sudah tersimpan. Sinkronisasi penyuntingan langsung memerlukan basis data kolaborasi daring.</p>
        </FeatureShell>}

        {active === "questions" && <FeatureShell icon={FileQuestion} title="Bank Soal" desc="Simpan pertanyaan agar dapat digunakan kembali pada materi berikutnya." action={<button onClick={() => downloadJson(questions, "bank-soal-jeniusppt.json")}><Download size={17}/> Ekspor</button>}>
          <form className="hub-question-form" onSubmit={addQuestion}><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Tulis pertanyaan..."/><input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Jawaban benar"/><button><Plus size={17}/> Tambah Soal</button></form>
          <div className="hub-list">{questions.length ? questions.map((item) => <article key={item.id}><div><b>{item.question}</b><p>Jawaban: {item.answer}</p></div><button onClick={() => saveList("jeniusppt-question-bank", questions.filter((x) => x.id !== item.id), setQuestions)}><Trash2 size={16}/></button></article>) : <Empty text="Bank soal masih kosong."/>}</div>
        </FeatureShell>}

        {active === "presenter" && <FeatureShell icon={MonitorPlay} title="Mode Presenter Guru" desc="Gunakan timer saat menyampaikan materi dan buka presentasi dari daftar materi." action={<button onClick={() => onNavigate("materials")}><MonitorPlay size={17}/> Pilih Materi</button>}>
          <div className="presenter-clock"><Clock3 size={34}/><b>{timerStart ? "Timer sedang berjalan" : elapsed ? `${elapsed} detik` : "00:00"}</b><button onClick={startPresenter}>{timerStart ? "Hentikan Timer" : "Mulai Timer"}</button></div>
          <p className="hub-note">Catatan pembicara dapat ditambahkan pada setiap slide melalui pengaturan materi berikutnya.</p>
        </FeatureShell>}

        {active === "accessibility" && <FeatureShell icon={Accessibility} title="Pemeriksa Aksesibilitas" desc="Memeriksa ukuran teks, teks alternatif gambar, dan takarir video.">
          <IssueList issues={accessibilityIssues} success="Tidak ditemukan masalah aksesibilitas dasar."/>
        </FeatureShell>}

        {active === "help" && <FeatureShell icon={HelpCircle} title="Pusat Bantuan" desc="Cari panduan singkat penggunaan fitur utama JeniusPPT.">
          <input className="hub-search" value={helpQuery} onChange={(e) => setHelpQuery(e.target.value)} placeholder="Cari panduan..."/>
          <div className="hub-help">{helpItems.map(([title, text]) => <details key={title}><summary>{title}</summary><p>{text}</p></details>)}</div>
        </FeatureShell>}

        {active === "security" && <FeatureShell icon={ShieldCheck} title="Keamanan & Cadangan" desc="Unduh cadangan akun dan periksa sesi yang sedang digunakan." action={<button onClick={() => downloadJson(state, `cadangan-jeniusppt-${new Date().toISOString().slice(0, 10)}.json`)}><Download size={17}/> Unduh Cadangan</button>}>
          <div className="security-session"><CheckCircle2 size={21}/><div><b>Perangkat ini aktif</b><small>{user?.email || "Akun JeniusPPT"} • sesi browser saat ini</small></div></div>
          <div className="hub-metrics"><Metric label="Materi dicadangkan" value={materials.length}/><Metric label="Peserta" value={(state.participants || []).length}/><Metric label="Data sampah" value={(state.trash || []).length}/></div>
        </FeatureShell>}
      </div>
    </section>
  );
}

function FeatureShell({ icon: Icon, title, desc, action, children }) {
  return <section className="hub-feature"><header><div className="hub-feature-icon"><Icon size={24}/></div><div><h2>{title}</h2><p>{desc}</p></div>{action && <div className="hub-action">{action}</div>}</header>{children}</section>;
}
function Empty({ text }) { return <div className="hub-empty"><BookOpenCheck size={22}/><span>{text}</span></div>; }
function Metric({ label, value }) { return <div><small>{label}</small><b>{value}</b></div>; }
function IssueList({ issues, success }) { return issues.length ? <div className="hub-issues">{issues.map((issue, index) => <div key={`${issue}-${index}`}><span>!</span><p>{issue}</p></div>)}</div> : <div className="hub-success"><CheckCircle2 size={22}/><span>{success}</span></div>; }
