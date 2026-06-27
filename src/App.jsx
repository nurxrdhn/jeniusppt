import { useEffect, useMemo, useState } from "react";
import { Archive, BookOpen, Check, Copy, Eye, FolderOpen, Share2, Trash2, Users } from "lucide-react";
import OpeningLogin from "./components/auth/OpeningLogin";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import StudentPlayer from "./components/student/StudentPlayer";

const STORAGE_KEY = "jeniusppt-v3";

const defaultState = {
  materials: [],
  participants: [],
};

const blankMaterial = () => ({
  id: crypto.randomUUID(),
  title: "Materi Baru",
  subject: "Ekonomi",
  className: "XI IPS",
  status: "Draft",
  shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  slides: [
    { title: "Judul Materi", body: "Tulis isi materi di sini." },
  ],
  questions: [
    { type: "pg", question: "Contoh pertanyaan pilihan ganda?", options: ["A", "B", "C", "D"], answer: 0 },
    { type: "truefalse", question: "Contoh soal benar atau salah.", answer: true },
  ],
});

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState;
  } catch {
    return defaultState;
  }
}

export default function App() {
  if (window.location.pathname.startsWith("/play/")) return <StudentPlayer />;

  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function notify(text) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function createMaterial() {
    const item = blankMaterial();
    setState((old) => ({ ...old, materials: [item, ...old.materials] }));
    setPage("materials");
    notify("Materi baru dibuat.");
  }

  function publishMaterial(material) {
    localStorage.setItem(`jeniusppt_package_${material.shareCode}`, JSON.stringify(material));
    setState((old) => ({
      ...old,
      materials: old.materials.map((m) => m.id === material.id ? { ...m, status: "Published" } : m),
    }));
    notify("Materi berhasil dipublish dan siap dibagikan.");
  }

  function duplicateMaterial(material) {
    setState((old) => ({ ...old, materials: [{ ...material, id: crypto.randomUUID(), title: material.title + " Copy", status: "Draft", shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}` }, ...old.materials] }));
    notify("Materi berhasil dicopy.");
  }

  function deleteMaterial(material) {
    setState((old) => ({ ...old, materials: old.materials.filter((m) => m.id !== material.id) }));
    notify("Materi dihapus.");
  }

  if (!user) return <OpeningLogin onLogin={setUser} />;

  const title = page === "dashboard" ? "Dashboard" : page === "materials" ? "Materi" : page === "participants" ? "Peserta" : "JeniusPPT";

  return (
    <div className="app-shell">
      {toast && <div className="toast"><Check size={18} />{toast}</div>}
      <Sidebar user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} />
      <main className="main-area">
        <Topbar title={title} user={user} onCreate={createMaterial} />
        {page === "dashboard" && <Dashboard state={state} onCreate={createMaterial} />}
        {page === "materials" && <Materials materials={state.materials} publishMaterial={publishMaterial} duplicateMaterial={duplicateMaterial} deleteMaterial={deleteMaterial} />}
        {page === "participants" && <Participants participants={state.participants} />}
        {!["dashboard", "materials", "participants"].includes(page) && <ComingSoon title={title} />}
      </main>
    </div>
  );
}

function Dashboard({ state, onCreate }) {
  const published = state.materials.filter((m) => m.status === "Published").length;
  return (
    <section className="page">
      <div className="welcome-card">
        <div>
          <span className="eyebrow">JeniusPPT v3</span>
          <h1>Kelola materi, slide, kuis, dan peserta dari satu tempat.</h1>
          <p>Mulai dengan membuat materi, lalu publish untuk mendapatkan link siswa.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>Buat Materi</button>
      </div>
      <div className="stats-grid">
        <Stat icon={<BookOpen />} label="Total Materi" value={state.materials.length} />
        <Stat icon={<Archive />} label="Published" value={published} />
        <Stat icon={<Users />} label="Peserta" value={state.participants.length} />
        <Stat icon={<FolderOpen />} label="Workspace" value="2" />
      </div>
      <div className="feature-grid">
        <Feature title="Buat PPT" desc="Editor slide 16:9 dengan alur materi yang jelas." />
        <Feature title="Quiz Interaktif" desc="Pilihan ganda dan benar/salah dengan nilai akumulasi." />
        <Feature title="Share Link" desc="Siswa cukup isi nama, jenis kelamin, dan kelas." />
        <Feature title="Analitik Guru" desc="Siapkan data peserta, progress, benar/salah, dan nilai." />
      </div>
    </section>
  );
}

function Materials({ materials, publishMaterial, duplicateMaterial, deleteMaterial }) {
  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Materi</span>
          <h1>Semua Materi</h1>
          <p>Kelola draft, publish, copy, hapus, dan link share.</p>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <h2>Belum ada materi</h2>
          <p>Klik tombol Buat Materi di kanan atas untuk mulai.</p>
        </div>
      ) : (
        <div className="material-grid">
          {materials.map((m) => (
            <article className="material-card" key={m.id}>
              <span className={m.status === "Published" ? "badge success" : "badge"}>{m.status}</span>
              <h2>{m.title}</h2>
              <p>{m.subject} • {m.className}</p>
              <div className="material-meta">
                <span>{m.slides.length} Slide</span>
                <span>{m.questions.length} Soal</span>
                <span>{m.shareCode}</span>
              </div>
              <div className="card-actions">
                <button onClick={() => publishMaterial(m)}><Share2 size={16} /> Publish</button>
                <a href={`/play/${m.shareCode}`} target="_blank"><Eye size={16} /> Preview</a>
                <button onClick={() => duplicateMaterial(m)}><Copy size={16} /> Copy</button>
                <button className="danger" onClick={() => deleteMaterial(m)}><Trash2 size={16} /> Hapus</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Participants({ participants }) {
  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Peserta</span>
          <h1>Peserta Masuk</h1>
          <p>Data ini akan tersambung ke Firestore di sprint berikutnya.</p>
        </div>
      </div>
      <div className="empty-state">
        <h2>Belum ada peserta realtime</h2>
        <p>Modul peserta Firestore dibuat di Part 2.</p>
      </div>
    </section>
  );
}

function ComingSoon({ title }) {
  return (
    <section className="page">
      <div className="empty-state">
        <h2>{title} sedang disiapkan</h2>
        <p>Modul ini masuk ke part berikutnya agar fondasi tetap bersih.</p>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div>{icon}</div>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
