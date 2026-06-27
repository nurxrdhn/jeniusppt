import StudentPlayer from "./components/student/StudentPlayer";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Code2,
  Copy,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  Folder,
  Home,
  Image,
  Layers,
  Link2,
  LogOut,
  Menu,
  MonitorPlay,
  MoreHorizontal,
  Plus,
  QrCode,
  Save,
  Search,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wand2,
  X,
} from "lucide-react";

const STORAGE_KEY = "jeniusppt-v1-state";

const blankSlide = (title = "Judul Slide") => ({
  id: crypto.randomUUID(),
  title,
  subtitle: "Tulis subjudul slide di sini",
  body: "Tulis isi materi di sini. Gunakan toolbar untuk mengatur tampilan slide.",
  theme: "gradient",
  align: "center",
  size: "normal",
  imageUrl: "",
});

const blankQuestion = () => ({
  id: crypto.randomUUID(),
  question: "Apa pertanyaan kuisnya?",
  options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
  answer: 0,
  timer: 15,
  points: 1000,
  explanation: "Tulis pembahasan singkat jawaban.",
});

const initialState = {
  materials: [],
  participants: [],
  workspaces: [
    { id: "default", name: "Semester Ganjil", folder: "Ekonomi" },
    { id: "bank", name: "Bank Materi", folder: "Template" },
  ],
  activity: [],
};

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState;
  } catch {
    return initialState;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function nowTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  if (window.location.pathname.startsWith("/play/")) {
    return <StudentPlayer />;
  }
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMaterialId, setActiveMaterialId] = useState(null);
  const [joinMaterialId, setJoinMaterialId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => saveState(state), [state]);

  const activeMaterial = state.materials.find((m) => m.id === activeMaterialId) || null;

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  }

  function log(message) {
    setState((old) => ({
      ...old,
      activity: [{ id: crypto.randomUUID(), message, time: nowTime() }, ...old.activity].slice(0, 20),
    }));
  }

  function createMaterial(payload) {
    const item = {
      id: crypto.randomUUID(),
      title: payload.title,
      subject: payload.subject || "Umum",
      className: payload.className || "Kelas",
      semester: payload.semester || "Semester Ganjil",
      description: payload.description || "",
      status: "Draft",
      archived: false,
      slides: [blankSlide(payload.title)],
      questions: [],
      shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((old) => ({ ...old, materials: [item, ...old.materials] }));
    setActiveMaterialId(item.id);
    setPage("builder");
    notify("Materi berhasil dibuat.");
    log(`Materi baru dibuat: ${item.title}`);
  }

  function updateMaterial(id, patch) {
    setState((old) => ({
      ...old,
      materials: old.materials.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
      ),
    }));
  }

  function duplicateMaterial(material) {
    const copyItem = {
      ...material,
      id: crypto.randomUUID(),
      title: `${material.title} - Copy`,
      status: "Draft",
      shareCode: `JP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((old) => ({ ...old, materials: [copyItem, ...old.materials] }));
    notify("Materi berhasil dicopy.");
    log(`Materi dicopy: ${material.title}`);
  }

  function archiveMaterial(material) {
    updateMaterial(material.id, { archived: true, status: "Archived" });
    notify("Materi masuk arsip.");
    log(`Materi diarsipkan: ${material.title}`);
  }

  function restoreMaterial(material) {
    updateMaterial(material.id, { archived: false, status: "Draft" });
    notify("Materi dipulihkan dari arsip.");
  }

  function deleteMaterial(material) {
    setState((old) => ({ ...old, materials: old.materials.filter((m) => m.id !== material.id) }));
    setConfirmDelete(null);
    notify("Materi dihapus permanen.");
  }

  function publishMaterial(material) {
    updateMaterial(material.id, { status: "Published", archived: false });
    notify("Materi berhasil dipublish.");
    log(`Materi dipublish: ${material.title}`);
  }

  function addParticipant(material, payload) {
    const participant = {
      id: crypto.randomUUID(),
      materialId: material.id,
      materialTitle: material.title,
      name: payload.name,
      gender: payload.gender,
      className: payload.className,
      progress: 0,
      score: "-",
      status: "Masuk",
      time: nowTime(),
    };
    setState((old) => ({ ...old, participants: [participant, ...old.participants] }));
    notify("Peserta baru masuk.");
    log(`${participant.name} masuk ke materi ${material.title}`);
    setJoinMaterialId(null);
  }

  function exportCSV() {
    const rows = [
      ["Nama", "Jenis Kelamin", "Kelas", "Materi", "Progress", "Nilai", "Status", "Waktu"],
      ...state.participants.map((p) => [p.name, p.gender, p.className, p.materialTitle, p.progress, p.score, p.status, p.time]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jeniusppt-laporan.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Laporan CSV berhasil diunduh.");
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  if (joinMaterialId) {
    const material = state.materials.find((m) => m.id === joinMaterialId);
    return <StudentJoin material={material} onBack={() => setJoinMaterialId(null)} onJoin={addParticipant} />;
  }

  return (
    <div className="app-shell">
      {toast && <div className="toast"><Check size={18} />{toast}</div>}

      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        onLogout={() => setUser(null)}
      />

      <main className="app-main">
        <Topbar user={user} page={page} onMenu={() => setSidebarOpen(true)} onExport={exportCSV} />

        {page === "dashboard" && (
          <Dashboard
            state={state}
            setPage={setPage}
            setActiveMaterialId={setActiveMaterialId}
            createMaterial={createMaterial}
          />
        )}

        {page === "workspace" && <Workspace state={state} setState={setState} notify={notify} />}

        {page === "materials" && (
          <MaterialsPage
            materials={state.materials}
            onCreate={createMaterial}
            onEdit={(m) => { setActiveMaterialId(m.id); setPage("builder"); }}
            onDuplicate={duplicateMaterial}
            onArchive={archiveMaterial}
            onRestore={restoreMaterial}
            onDelete={(m) => setConfirmDelete(m)}
            onPublish={publishMaterial}
            onShare={(m) => { setActiveMaterialId(m.id); setPage("share"); }}
          />
        )}

        {page === "builder" && (
          <MaterialBuilder
            material={activeMaterial}
            updateMaterial={updateMaterial}
            publishMaterial={publishMaterial}
            setPage={setPage}
            notify={notify}
          />
        )}

        {page === "participants" && <ParticipantsPage participants={state.participants} />}
        {page === "analytics" && <AnalyticsPage materials={state.materials} participants={state.participants} exportCSV={exportCSV} />}
        {page === "share" && (
          <SharePage
            materials={state.materials}
            material={activeMaterial}
            setActiveMaterialId={setActiveMaterialId}
            setPage={setPage}
            setJoinMaterialId={setJoinMaterialId}
            notify={notify}
          />
        )}
        {page === "ai" && <AIPage materials={state.materials} updateMaterial={updateMaterial} notify={notify} />}
        {page === "settings" && <SettingsPage user={user} notify={notify} />}
      </main>

      {confirmDelete && (
        <Modal title="Hapus permanen?" onClose={() => setConfirmDelete(null)}>
          <p>Materi <b>{confirmDelete.title}</b> akan dihapus permanen.</p>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setConfirmDelete(null)}>Batal</button>
            <button className="btn danger" onClick={() => deleteMaterial(confirmDelete)}><Trash2 size={18} /> Hapus</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoginPage({ onLogin }) {
  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="brand-row"><div className="brand-logo">J</div><div><h1>JeniusPPT</h1><p>Create. Teach. Quiz. Analyze.</p></div></div>
        <h2>Platform presentasi pembelajaran dengan editor PPT, kuis interaktif, share link, dan analitik.</h2>
        <div className="login-preview"><span /><span /><span /></div>
      </div>
      <div className="login-card">
        <span className="eyebrow">Masuk Guru</span>
        <h2>Dashboard Guru</h2>
        <p>Untuk demo lokal, tombol ini langsung masuk sebagai guru. Nanti bisa diganti Google Auth Firebase.</p>
        <button className="btn dark full" onClick={() => onLogin({ name: "Guru Ekonomi", email: "guru@jeniusppt.online" })}>
          <Sparkles size={18} /> Login Guru dengan Google
        </button>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, open, setOpen, onLogout }) {
  const menu = [
    ["dashboard", "Dashboard", Home],
    ["workspace", "Workspace", Folder],
    ["materials", "Materi", BookOpen],
    ["builder", "Editor", MonitorPlay],
    ["participants", "Peserta", Users],
    ["analytics", "Analytics", BarChart3],
    ["share", "Share", Link2],
    ["ai", "AI Studio", Wand2],
    ["settings", "Settings", Settings],
  ];
  return (
    <>
      <div className={open ? "overlay show" : "overlay"} onClick={() => setOpen(false)} />
      <aside className={open ? "sidebar show" : "sidebar"}>
        <div className="side-head">
          <div className="brand-logo">J</div>
          <div><h2>JeniusPPT</h2><p>Teacher Workspace</p></div>
          <button className="close-btn" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="side-menu">
          {menu.map(([key, label, Icon]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => { setPage(key); setOpen(false); }}>
              <Icon size={19} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="pro-card"><Sparkles size={22} /><h3>JeniusPPT Pro</h3><p>Live teaching, AI, analytics, dan template premium.</p><button>Upgrade</button></div>
        <button className="logout" onClick={onLogout}><LogOut size={18} /> Keluar</button>
      </aside>
    </>
  );
}

function Topbar({ user, page, onMenu, onExport }) {
  return (
    <header className="topbar">
      <button className="icon-btn menu-toggle" onClick={onMenu}><Menu size={22} /></button>
      <div className="top-title"><span>JeniusPPT</span><h2>{pageLabel(page)}</h2></div>
      <div className="search"><Search size={18} /><input placeholder="Cari materi, siswa, kuis..." /></div>
      <button className="icon-btn"><Bell size={19} /></button>
      <button className="btn ghost export-top" onClick={onExport}><Download size={18} /> Export</button>
      <div className="profile"><div className="avatar">G</div><div><b>{user.name}</b><p>Guru</p></div></div>
    </header>
  );
}

function pageLabel(page) {
  const map = { dashboard: "Dashboard", workspace: "Workspace", materials: "Materi", builder: "Editor Materi", participants: "Peserta", analytics: "Analytics", share: "Share", ai: "AI Studio", settings: "Settings" };
  return map[page] || "Dashboard";
}

function Dashboard({ state, setPage, setActiveMaterialId, createMaterial }) {
  const published = state.materials.filter((m) => m.status === "Published").length;
  const avg = calculateAvg(state.participants);
  return (
    <section className="page">
      <div className="hero-panel">
        <div><span className="eyebrow">Dashboard Guru</span><h1>Selamat datang, Guru 👋</h1><p>Kelola materi, PPT, kuis, peserta, nilai, dan link belajar dalam satu tempat.</p></div>
        <div className="hero-actions"><CreateMaterialButton onCreate={createMaterial} /><button className="btn light" onClick={() => setPage("share")}><Share2 size={18} /> Bagikan</button></div>
      </div>
      <div className="stats-grid">
        <Stat icon={BookOpen} label="Total Materi" value={state.materials.length} note={`${published} published`} />
        <Stat icon={ClipboardList} label="Total Kuis" value={state.materials.reduce((a, m) => a + m.questions.length, 0)} note="Semua materi" />
        <Stat icon={Users} label="Peserta" value={state.participants.length} note="Masuk via link" />
        <Stat icon={BarChart3} label="Rata-rata" value={avg || "-"} note="Nilai peserta" />
      </div>
      <div className="quick-panel">
        <SectionTitle title="Aksi Cepat" desc="Semua tombol di sini sudah terhubung ke fitur." />
        <div className="quick-grid">
          <Quick tone="purple" icon={FilePlus2} title="Buat Materi" desc="Informasi → PPT → Quiz → Publish" onClick={() => document.querySelector("[data-create-material]")?.click()} />
          <Quick tone="blue" icon={MonitorPlay} title="Editor PPT" desc="Buat dan preview slide 16:9" onClick={() => setPage("builder")} />
          <Quick tone="green" icon={Users} title="Peserta" desc="Lihat siswa yang masuk link" onClick={() => setPage("participants")} />
          <Quick tone="orange" icon={Wand2} title="AI Studio" desc="Generate slide dan kuis demo" onClick={() => setPage("ai")} />
        </div>
      </div>
      <div className="dash-grid">
        <div className="panel">
          <SectionTitle title="Materi Terbaru" desc="Draft dan published terbaru." action={<button className="small-pill" onClick={() => setPage("materials")}>Lihat Semua</button>} />
          {state.materials.length === 0 ? <EmptyState icon="📚" title="Belum ada materi" desc="Buat materi pertama untuk mulai." action={<CreateMaterialButton onCreate={createMaterial} />} /> : <div className="compact-list">{state.materials.slice(0, 5).map((m) => <MaterialRow key={m.id} material={m} onOpen={() => { setActiveMaterialId(m.id); setPage("builder"); }} />)}</div>}
        </div>
        <div className="panel">
          <SectionTitle title="Aktivitas" desc="Aktivitas terbaru." />
          {state.activity.length === 0 ? <EmptyState icon="✨" title="Belum ada aktivitas" desc="Aktivitas muncul setelah ada aksi." /> : <div className="activity-list">{state.activity.map((a) => <div className="activity" key={a.id}><div className="avatar small">A</div><div><b>{a.message}</b><p>{a.time}</p></div></div>)}</div>}
        </div>
      </div>
    </section>
  );
}

function Workspace({ state, setState, notify }) {
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  function addWorkspace(e) {
    e.preventDefault();
    setState((old) => ({ ...old, workspaces: [{ id: crypto.randomUUID(), name, folder }, ...old.workspaces] }));
    setName(""); setFolder(""); notify("Workspace berhasil ditambah.");
  }
  return (
    <section className="page">
      <PageHead title="Workspace" desc="Kelompokkan materi berdasarkan semester, mapel, bank soal, atau template." />
      <div className="workspace-grid">
        <form className="panel form-card" onSubmit={addWorkspace}><SectionTitle title="Tambah Workspace" /><label>Nama</label><input value={name} onChange={(e) => setName(e.target.value)} required /><label>Folder</label><input value={folder} onChange={(e) => setFolder(e.target.value)} required /><button className="btn primary full"><Plus size={18} /> Tambah</button></form>
        <div className="panel"><SectionTitle title="Daftar Workspace" />{state.workspaces.map((w) => <div className="workspace-item" key={w.id}><Folder size={22} /><div><b>{w.name}</b><p>{w.folder}</p></div></div>)}</div>
      </div>
    </section>
  );
}

function MaterialsPage({ materials, onCreate, onEdit, onDuplicate, onArchive, onRestore, onDelete, onPublish, onShare }) {
  const activeMaterials = materials.filter((m) => !m.archived);
  const archived = materials.filter((m) => m.archived);
  return (
    <section className="page">
      <PageHead title="Materi" desc="CRUD lengkap: buat, edit, copy, publish, arsip, hapus." actions={<CreateMaterialButton onCreate={onCreate} />} />
      {activeMaterials.length === 0 ? <EmptyState icon="📚" title="Belum ada materi" desc="Buat materi dulu, lalu lanjutkan ke PPT dan Quiz." action={<CreateMaterialButton onCreate={onCreate} />} /> : <div className="materials-grid">{activeMaterials.map((m) => <MaterialCard key={m.id} material={m} onEdit={() => onEdit(m)} onDuplicate={() => onDuplicate(m)} onArchive={() => onArchive(m)} onDelete={() => onDelete(m)} onPublish={() => onPublish(m)} onShare={() => onShare(m)} />)}</div>}
      {archived.length > 0 && <div className="panel mt"><SectionTitle title="Arsip" desc="Materi yang diarsipkan." />{archived.map((m) => <MaterialRow key={m.id} material={m} onOpen={() => onRestore(m)} actionLabel="Pulihkan" />)}</div>}
    </section>
  );
}

function MaterialBuilder({ material, updateMaterial, publishMaterial, setPage, notify }) {
  const [step, setStep] = useState("info");
  if (!material) return <section className="page"><EmptyState icon="📄" title="Belum memilih materi" desc="Pilih atau buat materi terlebih dahulu." /></section>;
  return (
    <section className="page editor-page">
      <div className="builder-head"><div><span className="eyebrow">Material Builder</span><h1>{material.title}</h1><p>{material.subject} • {material.className} • {material.status}</p></div><div className="hero-actions"><button className="btn light" onClick={() => setPage("materials")}>Kembali</button><button className="btn primary" onClick={() => { publishMaterial(material); setStep("publish"); }}><Upload size={18} /> Publish</button></div></div>
      <div className="stepper">{["info", "ppt", "quiz", "preview", "publish"].map((s, i) => <button key={s} className={step === s ? "active" : ""} onClick={() => setStep(s)}><span>{i + 1}</span>{s.toUpperCase()}</button>)}</div>
      {step === "info" && <InfoStep material={material} updateMaterial={updateMaterial} notify={notify} />}
      {step === "ppt" && <PPTEditor material={material} updateMaterial={updateMaterial} notify={notify} />}
      {step === "quiz" && <QuizEditor material={material} updateMaterial={updateMaterial} notify={notify} />}
      {step === "preview" && <PreviewMaterial material={material} />}
      {step === "publish" && <PublishStep material={material} publishMaterial={publishMaterial} setPage={setPage} />}
    </section>
  );
}

function InfoStep({ material, updateMaterial, notify }) {
  const [form, setForm] = useState(material);
  function save(e) { e.preventDefault(); updateMaterial(material.id, form); notify("Informasi materi disimpan."); }
  return <form className="panel form-card max-form" onSubmit={save}><SectionTitle title="Informasi Materi" desc="Data dasar sebelum membuat PPT dan quiz." /><div className="two-cols"><div><label>Judul</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div><label>Mata Pelajaran</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div><div><label>Kelas</label><input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></div><div><label>Semester</label><input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div></div><label>Deskripsi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><button className="btn primary"><Save size={18} /> Simpan Informasi</button></form>;
}

function PPTEditor({ material, updateMaterial, notify }) {
  const [active, setActive] = useState(0);
  const slide = material.slides[active] || material.slides[0];
  function updateSlide(patch) {
    const slides = material.slides.map((s, i) => (i === active ? { ...s, ...patch } : s));
    updateMaterial(material.id, { slides });
  }
  function addSlide() { updateMaterial(material.id, { slides: [...material.slides, blankSlide(`Slide ${material.slides.length + 1}`)] }); setActive(material.slides.length); notify("Slide ditambah."); }
  function copySlide() { const copy = { ...slide, id: crypto.randomUUID(), title: `${slide.title} Copy` }; const slides = [...material.slides]; slides.splice(active + 1, 0, copy); updateMaterial(material.id, { slides }); setActive(active + 1); notify("Slide dicopy."); }
  function deleteSlide() { if (material.slides.length === 1) return notify("Minimal harus ada satu slide."); const slides = material.slides.filter((_, i) => i !== active); updateMaterial(material.id, { slides }); setActive(Math.max(0, active - 1)); notify("Slide dihapus."); }
  function insertImage() { const url = prompt("Masukkan URL gambar"); if (url) updateSlide({ imageUrl: url }); }
  return (
    <div className="ppt-editor-shell">
      <aside className="slide-list"><div className="list-head"><h3>Slide</h3><button onClick={addSlide}><Plus size={16} /> Slide</button></div>{material.slides.map((s, i) => <button key={s.id} className={active === i ? "active" : ""} onClick={() => setActive(i)}><span>{i + 1}</span><b>{s.title}</b></button>)}</aside>
      <main className="ppt-main">
        <div className="editor-toolbar"><button onClick={addSlide}>Tambah</button><button onClick={copySlide}>Copy</button><button onClick={deleteSlide}>Hapus</button><button onClick={() => updateSlide({ size: slide.size === "large" ? "normal" : "large" })}>Size</button><button onClick={() => updateSlide({ align: slide.align === "center" ? "left" : "center" })}>Align</button><button onClick={insertImage}><Image size={16} /> Image</button></div>
        <div className={`ppt-canvas ${slide.theme} ${slide.align} ${slide.size}`}><span>Slide {active + 1}</span><input value={slide.title} onChange={(e) => updateSlide({ title: e.target.value })} /><input value={slide.subtitle} onChange={(e) => updateSlide({ subtitle: e.target.value })} /><textarea value={slide.body} onChange={(e) => updateSlide({ body: e.target.value })} />{slide.imageUrl && <img src={slide.imageUrl} alt="slide" />}</div>
      </main>
      <aside className="property-panel"><h3>Properties</h3><label>Theme</label><select value={slide.theme} onChange={(e) => updateSlide({ theme: e.target.value })}><option>gradient</option><option>light</option><option>dark</option><option>green</option></select><button onClick={() => notify("Preview tersedia di step Preview.")}><Eye size={16} /> Preview</button><button onClick={() => notify("Draft otomatis tersimpan.")}><Save size={16} /> Save</button></aside>
    </div>
  );
}

function QuizEditor({ material, updateMaterial, notify }) {
  const questions = material.questions.length ? material.questions : [blankQuestion()];
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState(null);
  const q = questions[active] || questions[0];
  useEffect(() => { if (!material.questions.length) updateMaterial(material.id, { questions }); }, []); // eslint-disable-line
  function saveQuestions(next) { updateMaterial(material.id, { questions: next }); }
  function updateQ(patch) { saveQuestions(questions.map((item, i) => (i === active ? { ...item, ...patch } : item))); }
  function updateOption(index, value) { const options = [...q.options]; options[index] = value; updateQ({ options }); }
  function addQ() { saveQuestions([...questions, blankQuestion()]); setActive(questions.length); setSelected(null); notify("Soal ditambah."); }
  function deleteQ() { if (questions.length === 1) return notify("Minimal harus ada satu soal."); const next = questions.filter((_, i) => i !== active); saveQuestions(next); setActive(Math.max(0, active - 1)); setSelected(null); }
  return (
    <div className="quiz-builder-shell">
      <aside className="slide-list"><div className="list-head"><h3>Soal</h3><button onClick={addQ}><Plus size={16} /> Soal</button></div>{questions.map((item, i) => <button key={item.id} className={active === i ? "active" : ""} onClick={() => { setActive(i); setSelected(null); }}><span>{i + 1}</span><b>Soal {i + 1}</b></button>)}<button className="danger-link" onClick={deleteQ}><Trash2 size={16} /> Hapus</button></aside>
      <main className="quiz-main"><div className="editor-toolbar"><button onClick={() => setPreview(!preview)}>{preview ? "Edit" : "Preview"}</button>{[5, 10, 15, 20, 30, 60].map((t) => <button key={t} className={q.timer === t ? "active" : ""} onClick={() => updateQ({ timer: t })}>{t}s</button>)}{[0, 500, 1000, 2000].map((p) => <button key={p} className={q.points === p ? "active" : ""} onClick={() => updateQ({ points: p })}>{p}</button>)}</div><div className="quiz-canvas"><div className="quiz-meta"><span>{q.timer}s</span><span>{q.points} poin</span></div><textarea disabled={preview} className="quiz-question" value={q.question} onChange={(e) => updateQ({ question: e.target.value })} /><div className="answer-grid">{q.options.map((opt, i) => <button key={i} className={`answer-card c${i} ${q.answer === i && !preview ? "correct" : ""} ${preview && selected === i && selected === q.answer ? "right" : ""} ${preview && selected === i && selected !== q.answer ? "wrong" : ""} ${preview && selected !== null && q.answer === i ? "right" : ""}`} onClick={() => preview ? setSelected(i) : updateQ({ answer: i })}><b>{["A", "B", "C", "D"][i]}</b>{preview ? <span>{opt}</span> : <input value={opt} onClick={(e) => e.stopPropagation()} onChange={(e) => updateOption(i, e.target.value)} />}{q.answer === i && !preview && <em>✓ Jawaban Benar</em>}</button>)}</div>{preview && selected !== null && <div className="result-box">{selected === q.answer ? "✅ Benar" : `❌ Salah. Jawaban benar ${["A", "B", "C", "D"][q.answer]}`}</div>}</div></main>
      <aside className="property-panel"><h3>Quiz Tools</h3><button onClick={addQ}><Plus size={16} /> Soal Baru</button><button onClick={() => notify("Quiz otomatis tersimpan.")}><Save size={16} /> Simpan Quiz</button><button onClick={() => notify("Preview aktif di canvas.")}><Eye size={16} /> Preview</button></aside>
    </div>
  );
}

function PreviewMaterial({ material }) {
  const [slide, setSlide] = useState(0);
  const s = material.slides[slide] || material.slides[0];
  return <div className="preview-layout"><aside className="slide-list">{material.slides.map((item, i) => <button key={item.id} className={slide === i ? "active" : ""} onClick={() => setSlide(i)}><span>{i + 1}</span><b>{item.title}</b></button>)}</aside><main className="preview-stage"><div className={`ppt-canvas ${s.theme} ${s.align} ${s.size}`}><span>{material.title}</span><h1>{s.title}</h1><h3>{s.subtitle}</h3><p>{s.body}</p>{s.imageUrl && <img src={s.imageUrl} alt="preview" />}</div><div className="preview-controls"><button className="btn light" onClick={() => setSlide(Math.max(0, slide - 1))}>Sebelumnya</button><button className="btn primary" onClick={() => setSlide(Math.min(material.slides.length - 1, slide + 1))}>Berikutnya</button></div></main></div>;
}

function PublishStep({ material, publishMaterial, setPage }) {
  return <div className="share-layout"><div className="panel"><SectionTitle title="Publish" desc="Pilih apa yang ingin dibagikan." /><button className="btn primary full" onClick={() => publishMaterial(material)}><Upload size={18} /> Publish Materi</button><button className="btn light full" onClick={() => setPage("share")}><Share2 size={18} /> Buka Share</button></div><ShareCard material={material} /></div>;
}

function SharePage({ materials, material, setActiveMaterialId, setPage, setJoinMaterialId, notify }) {
  const selected = material || materials[0] || null;
  if (!selected) return <section className="page"><EmptyState icon="🔗" title="Belum ada link" desc="Buat materi dulu sebelum membagikan link." action={<button className="btn primary" onClick={() => setPage("materials")}><Plus size={18} /> Buat Materi</button>} /></section>;
  return <section className="page"><PageHead title="Share Link" desc="Siswa hanya mengisi nama, jenis kelamin, dan kelas." /><div className="share-layout"><div className="panel form-card"><SectionTitle title="Pilih Materi" /> <select value={selected.id} onChange={(e) => setActiveMaterialId(e.target.value)}>{materials.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select><label>Link</label><div className="copy-box"><input readOnly value={`https://jeniusppt.online/play/${selected.shareCode}`} /><button onClick={() => { navigator.clipboard?.writeText(`https://jeniusppt.online/play/${selected.shareCode}`); notify("Link berhasil dicopy."); }}><Copy size={18} /></button></div><div className="share-actions"><button className="btn primary" onClick={() => setJoinMaterialId(selected.id)}><Eye size={18} /> Preview Siswa</button><button className="btn light" onClick={() => notify("QR Code siap dibagikan.")}><QrCode size={18} /> QR Code</button></div></div><ShareCard material={selected} /></div></section>;
}

function ShareCard({ material }) { return <div className="panel share-card"><div className="qr-box"><QrCode size={80} /></div><h2>{material.title}</h2><p>{material.className} • {material.slides.length} slide • {material.questions.length} soal</p><span className="share-code">{material.shareCode}</span></div>; }

function StudentJoin({ material, onBack, onJoin }) {
  if (!material) return null;
  function submit(e) { e.preventDefault(); const fd = new FormData(e.currentTarget); onJoin(material, { name: fd.get("name"), gender: fd.get("gender"), className: fd.get("className") }); }
  return <div className="student-screen"><form className="student-card" onSubmit={submit}><button type="button" className="back-btn" onClick={onBack}>← Kembali</button><span className="eyebrow">Link Materi</span><h1>{material.title}</h1><p>{material.subject} • {material.className}</p><input name="name" placeholder="Nama lengkap" required /><select name="gender" required><option value="">Jenis kelamin</option><option>Laki-laki</option><option>Perempuan</option></select><input name="className" placeholder="Kelas" required /><button className="btn primary full">Masuk & Mulai Belajar</button></form></div>;
}

function ParticipantsPage({ participants }) { return <section className="page"><PageHead title="Peserta Masuk" desc="Siswa yang membuka link materi." />{participants.length === 0 ? <EmptyState icon="👥" title="Belum ada peserta" desc="Bagikan link materi agar siswa masuk." /> : <div className="panel"><ParticipantsTable participants={participants} /></div>}</section>; }
function AnalyticsPage({ materials, participants, exportCSV }) { return <section className="page"><PageHead title="Analytics" desc="Ringkasan nilai, peserta, dan progres." actions={<button className="btn primary" onClick={exportCSV}><Download size={18} /> Export CSV</button>} /><div className="stats-grid"><Stat icon={BookOpen} label="Materi" value={materials.length} note="Total" /><Stat icon={Users} label="Peserta" value={participants.length} note="Total" /><Stat icon={BarChart3} label="Rata-rata" value={calculateAvg(participants) || "-"} note="Nilai" /><Stat icon={Check} label="Selesai" value={participants.filter((p) => p.status === "Selesai").length} note="Peserta" /></div><div className="panel"><ParticipantsTable participants={participants} /></div></section>; }
function AIPage({ materials, updateMaterial, notify }) { function generateDemo() { if (!materials[0]) return notify("Buat materi dulu sebelum memakai AI."); updateMaterial(materials[0].id, { slides: [blankSlide("Pengertian"), blankSlide("Contoh"), blankSlide("Kesimpulan")], questions: [blankQuestion(), blankQuestion()] }); notify("AI demo berhasil membuat 3 slide dan 2 soal."); } return <section className="page"><PageHead title="AI Studio" desc="Demo generate PPT dan quiz otomatis." /><div className="quick-grid"><Quick tone="purple" icon={Wand2} title="Generate PPT + Quiz" desc="Isi otomatis materi pertama." onClick={generateDemo} /><Quick tone="blue" icon={Code2} title="Buat dari Kode" desc="Gunakan JSON materi." onClick={generateDemo} /></div></section>; }
function SettingsPage({ user, notify }) { return <section className="page"><PageHead title="Settings" desc="Pengaturan profil dan preferensi." /><div className="panel form-card max-form"><label>Nama Guru</label><input defaultValue={user.name} /><label>Email</label><input defaultValue={user.email} /><label>Sekolah</label><input defaultValue="SMA Budi Luhur" /><button className="btn primary" onClick={() => notify("Pengaturan disimpan.")}><Save size={18} /> Simpan</button></div></section>; }

function CreateMaterialButton({ onCreate }) {
  const [open, setOpen] = useState(false);
  function submit(e) { e.preventDefault(); const fd = new FormData(e.currentTarget); onCreate(Object.fromEntries(fd.entries())); setOpen(false); }
  return <><button data-create-material className="btn primary" onClick={() => setOpen(true)}><Plus size={18} /> Buat Materi</button>{open && <Modal title="Buat Materi" onClose={() => setOpen(false)}><form className="form-card" onSubmit={submit}><label>Judul</label><input name="title" placeholder="Contoh: Inflasi dan Deflasi" required /><label>Mata Pelajaran</label><input name="subject" defaultValue="Ekonomi" /><label>Kelas</label><input name="className" defaultValue="XI IPS" /><label>Semester</label><input name="semester" defaultValue="Semester Ganjil" /><label>Deskripsi</label><textarea name="description" placeholder="Deskripsi singkat materi" /><div className="modal-actions"><button type="button" className="btn ghost" onClick={() => setOpen(false)}>Batal</button><button className="btn primary"><Save size={18} /> Simpan & Lanjut</button></div></form></Modal>}</>;
}

function MaterialCard({ material, onEdit, onDuplicate, onArchive, onDelete, onPublish, onShare }) { return <div className="material-card"><div className="card-top"><div className="thumb">{material.subject[0]}</div><Badge status={material.status} /></div><h3>{material.title}</h3><p>{material.subject} • {material.className}</p><div className="meta-grid"><span>{material.slides.length} Slide</span><span>{material.questions.length} Soal</span><span>{material.shareCode}</span><span>{new Date(material.createdAt).toLocaleDateString("id-ID")}</span></div><div className="card-actions"><button onClick={onEdit}><Edit3 size={16} /> Edit</button><button onClick={onPublish}><Upload size={16} /> Publish</button><button onClick={onShare}><Share2 size={16} /> Share</button><button onClick={onDuplicate}><Copy size={16} /> Copy</button><button onClick={onArchive}><Archive size={16} /> Arsip</button><button className="danger" onClick={onDelete}><Trash2 size={16} /> Hapus</button></div></div>; }
function MaterialRow({ material, onOpen, actionLabel = "Buka" }) { return <div className="material-row"><div className="thumb">{material.subject[0]}</div><div><b>{material.title}</b><p>{material.subject} • {material.className} • {material.status}</p></div><button className="small-pill" onClick={onOpen}>{actionLabel}<ChevronRight size={16} /></button></div>; }
function ParticipantsTable({ participants }) { return <div className="table-wrap"><table><thead><tr><th>Nama</th><th>Jenis Kelamin</th><th>Kelas</th><th>Materi</th><th>Waktu</th><th>Progress</th><th>Nilai</th><th>Status</th></tr></thead><tbody>{participants.length === 0 ? <tr><td colSpan="8" className="empty-table">Belum ada peserta.</td></tr> : participants.map((p) => <tr key={p.id}><td><b>{p.name}</b></td><td>{p.gender}</td><td>{p.className}</td><td>{p.materialTitle}</td><td>{p.time}</td><td>{p.progress}%</td><td>{p.score}</td><td><span className="badge progress">{p.status}</span></td></tr>)}</tbody></table></div>; }
function Stat({ icon: Icon, label, value, note }) { return <div className="stat"><div className="stat-icon"><Icon size={24} /></div><p>{label}</p><h2>{value}</h2><span>{note}</span></div>; }
function Quick({ tone, icon: Icon, title, desc, onClick }) { return <button className={`quick-card ${tone}`} onClick={onClick}><Icon size={34} /><h3>{title}</h3><p>{desc}</p><b>Mulai →</b></button>; }
function SectionTitle({ title, desc, action }) { return <div className="section-title"><div><h2>{title}</h2>{desc && <p>{desc}</p>}</div>{action}</div>; }
function PageHead({ title, desc, actions }) { return <div className="page-head"><div><span className="eyebrow">JeniusPPT</span><h1>{title}</h1><p>{desc}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>; }
function EmptyState({ icon, title, desc, action }) { return <div className="empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{desc}</p>{action}</div>; }
function Badge({ status }) { return <span className={`badge ${status === "Published" ? "published" : status === "Archived" ? "archived" : "draft"}`}>{status}</span>; }
function Modal({ title, children, onClose }) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={20} /></button></div>{children}</div></div>; }
function calculateAvg(participants) { const scores = participants.map((p) => p.score).filter((n) => typeof n === "number"); if (!scores.length) return 0; return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length); }
