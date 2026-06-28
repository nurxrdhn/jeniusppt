import { useEffect, useState } from "react";

import {
  Archive,
  BookOpen,
  Check,
  Copy,
  Edit3,
  Eye,
  FolderOpen,
  Share2,
  Trash2,
  Users,
} from "lucide-react";

import OpeningLogin from "./components/auth/OpeningLogin";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import StudentPlayer from "./components/student/StudentPlayer";
import MaterialBuilder from "./components/materials/MaterialBuilder";
import CodeImportModal from "./components/materials/CodeImportModal";
import ShareModal from "./components/share/ShareModal";

import { SLIDE_SIZES } from "./utils/slideSizes";
import { publishMaterialToFirestore } from "./services/materialService";

const STORAGE_KEY = "jeniusppt-v4";

const blankMaterial = () => ({
  id: crypto.randomUUID(),
  title: "Materi Baru",
  subject: "Ekonomi",
  className: "XI IPS",
  status: "Draft",
  shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  slideSize: SLIDE_SIZES.wide,
  activeSlide: 0,
  activeQuestion: 0,
  slides: [
    {
      title: "Judul Materi",
      body: "Mulai mengetik...",
      background: {
        type: "css",
        value: "linear-gradient(135deg,#0b1f46,#1d4ed8)",
      },
    },
  ],
  questions: [
    {
      type: "pg",
      question: "Pertanyaan pilihan ganda.",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      answer: 0,
      timer: 15,
      points: 1000,
    },
    {
      type: "truefalse",
      question: "Pernyataan benar atau salah.",
      answer: true,
      timer: 15,
      points: 1000,
    },
  ],
});

function loadState() {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        materials: [],
        participants: [],
      }
    );
  } catch {
    return {
      materials: [],
      participants: [],
    };
  }
}

export default function App() {
  if (window.location.pathname.startsWith("/play/")) {
    return <StudentPlayer />;
  }

  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [shareMaterial, setShareMaterial] = useState(null);
  const [showCodeImport, setShowCodeImport] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const editingMaterial = state.materials.find((m) => m.id === editingId);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function updateMaterial(id, patch) {
    setState((old) => ({
      ...old,
      materials: old.materials.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    }));
  }

  function createMaterial() {
    const item = blankMaterial();

    setState((old) => ({
      ...old,
      materials: [item, ...old.materials],
    }));

    setEditingId(item.id);
    notify("Materi dibuat.");
  }

  function createMaterialFromCode(payload) {
    const item = {
      ...blankMaterial(),
      ...payload,
      id: crypto.randomUUID(),
      status: "Draft",
      shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      activeSlide: 0,
      activeQuestion: 0,
    };

    setState((old) => ({
      ...old,
      materials: [item, ...old.materials],
    }));

    setEditingId(item.id);
  }

  async function publishMaterial(material) {
    const updated = {
      ...material,
      status: "Published",
    };

    localStorage.setItem(
      `jeniusppt_package_${updated.shareCode}`,
      JSON.stringify(updated)
    );

    await publishMaterialToFirestore(updated);

    updateMaterial(updated.id, {
      status: "Published",
    });

    notify("Published.");
    return updated;
  }

  async function openShare(material) {
    const updated = await publishMaterial(material);
    setShareMaterial(updated);
  }

  function duplicateMaterial(material) {
    const copied = {
      ...material,
      id: crypto.randomUUID(),
      title: `${material.title} Copy`,
      status: "Draft",
      shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    };

    setState((old) => ({
      ...old,
      materials: [copied, ...old.materials],
    }));

    notify("Disalin.");
  }

  function deleteMaterial(material) {
    setState((old) => ({
      ...old,
      materials: old.materials.filter((m) => m.id !== material.id),
    }));

    notify("Dihapus.");
  }

  if (!user) {
    return <OpeningLogin onLogin={setUser} />;
  }

  if (editingMaterial) {
    return (
      <div className="app-shell">
        <Sidebar
          user={user}
          page="materials"
          setPage={setPage}
          onLogout={() => setUser(null)}
        />

        <main className="main-area">
          {toast && (
            <div className="toast">
              <Check size={18} />
              {toast}
            </div>
          )}

          <MaterialBuilder
            material={editingMaterial}
            updateMaterial={updateMaterial}
            publishMaterial={publishMaterial}
            openShare={openShare}
            onBack={() => setEditingId(null)}
          />

          {shareMaterial && (
            <ShareModal
              material={shareMaterial}
              onClose={() => setShareMaterial(null)}
              notify={notify}
            />
          )}
        </main>
      </div>
    );
  }

  const title =
    page === "dashboard"
      ? "Dashboard"
      : page === "materials"
      ? "Materi"
      : page === "participants"
      ? "Peserta"
      : "JeniusPPT";

  return (
    <div className="app-shell">
      {toast && (
        <div className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}

      <Sidebar
        user={user}
        page={page}
        setPage={setPage}
        onLogout={() => setUser(null)}
      />

      <main className="main-area">
        <Topbar
          title={title}
          user={user}
          onCreate={createMaterial}
          onImportCode={() => setShowCodeImport(true)}
          notify={notify}
        />

        {page === "dashboard" && (
          <Dashboard state={state} onCreate={createMaterial} onImportCode={() => setShowCodeImport(true)} user={user} />
        )}

        {page === "materials" && (
          <Materials
            materials={state.materials}
            editMaterial={(m) => setEditingId(m.id)}
            duplicateMaterial={duplicateMaterial}
            deleteMaterial={deleteMaterial}
            openShare={openShare}
            onCreate={createMaterial}
            onImportCode={() => setShowCodeImport(true)}
          />
        )}

        {page === "participants" && <Participants />}

        {!["dashboard", "materials", "participants"].includes(page) && (
          <ComingSoon title={title} />
        )}
      </main>

      {shareMaterial && (
        <ShareModal
          material={shareMaterial}
          onClose={() => setShareMaterial(null)}
          notify={notify}
        />
      )}

      {showCodeImport && (
        <CodeImportModal
          onClose={() => setShowCodeImport(false)}
          onImport={createMaterialFromCode}
          notify={notify}
        />
      )}
    </div>
  );
}

function Dashboard({ state, onCreate, onImportCode, user }) {
  const published = state.materials.filter(
    (m) => m.status === "Published"
  ).length;

  return (
    <section className="page">
      <div className="welcome-card">
        <div>
          <span className="eyebrow">V4 Core</span>
          <h1>Halo, {user?.name?.split(" ")[0] || "Guru"} 👋</h1>
          <p>Slide. Quiz. Share. Analyze.</p>
        </div>

        <div className="welcome-actions">
          <button className="primary-button" onClick={onCreate}>
            + Materi
          </button>
          <button className="secondary-button" onClick={onImportCode}>
            &lt;/&gt; Code
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={<BookOpen />} label="Materi" value={state.materials.length} />
        <Stat icon={<Archive />} label="Published" value={published} />
        <Stat icon={<Users />} label="Peserta" value={state.participants.length} />
        <Stat icon={<FolderOpen />} label="Workspace" value="2" />
      </div>

      <div className="feature-grid">
        <Feature title="PPT Size" desc="16:9, 4:3, A4, Portrait." />
        <Feature title="Preview" desc="Slide → Soal → Hasil." />
        <Feature title="QR Share" desc="QR bersih + link." />
        <Feature title="Quiz" desc="PG dan B/S." />
      </div>
    </section>
  );
}

function Materials({
  materials,
  editMaterial,
  duplicateMaterial,
  deleteMaterial,
  openShare,
  onCreate,
  onImportCode,
}) {
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Materi</span>
        <h1>Semua Materi</h1>
        <div className="welcome-actions">
          <button className="primary-button" onClick={onCreate}>+ Buat Materi</button>
          <button className="secondary-button" onClick={onImportCode}>&lt;/&gt; Buat dari Kode</button>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <h2>Belum ada materi</h2>
          <p>Buat manual atau generate dari kode.</p>
          <button className="primary-button" onClick={onCreate}>+ Buat Materi</button>
          <button className="secondary-button" onClick={onImportCode}>&lt;/&gt; Buat dari Kode</button>
        </div>
      ) : (
        <div className="material-grid">
          {materials.map((m) => (
            <article className="material-card" key={m.id}>
              <span className={m.status === "Published" ? "badge success" : "badge"}>
                {m.status}
              </span>

              <h2>{m.title}</h2>
              <p>
                {m.subject} • {m.className}
              </p>

              <div className="material-meta">
                <span>{m.slides.length} Slide</span>
                <span>{m.questions.length} Soal</span>
                <span>{m.shareCode}</span>
              </div>

              <div className="card-actions">
                <button onClick={() => editMaterial(m)}>
                  <Edit3 size={16} />
                  Edit
                </button>

                <button onClick={() => openShare(m)}>
                  <Share2 size={16} />
                  Share
                </button>

                <a href={`/play/${m.shareCode}`} target="_blank">
                  <Eye size={16} />
                  Preview
                </a>

                <button onClick={() => duplicateMaterial(m)}>
                  <Copy size={16} />
                  Copy
                </button>

                <button className="danger" onClick={() => deleteMaterial(m)}>
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Participants() {
  return (
    <section className="page">
      <div className="empty-state">
        <h2>Realtime Part 2</h2>
        <p>Nama • Slide • Benar • Salah • Nilai</p>
      </div>
    </section>
  );
}

function ComingSoon({ title }) {
  const texts = {
    Workspace: "Tempat ringkasan materi, draft, dan publish.",
    Analitik: "Ringkasan jumlah materi, slide, soal, dan publish.",
    AI: "Gunakan tombol Buat dari Kode untuk generate PPT dan kuis otomatis.",
    Setting: "Pengaturan akun dan workspace."
  };

  return (
    <section className="page">
      <div className="empty-state">
        <h2>{title}</h2>
        <p>{texts[title] || "Halaman aktif."}</p>
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
