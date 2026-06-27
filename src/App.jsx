import PPTManualEditor from "./components/editor/PPTManualEditor";
import { useState } from "react";
import {
  BarChart3, Bell, BookOpen, CheckCircle2, ClipboardList, Code2, Copy, Download,
  Eye, FilePlus2, Gauge, LayoutDashboard, Link2, LogOut, Menu, Plus, QrCode,
  Search, Settings, Share2, Sparkles, Trash2, Users, Wand2, X
} from "lucide-react";

const seedMaterials = [];

const seedParticipants = [];

const sampleCode = `{
  "title": "Inflasi dan Deflasi",
  "subject": "Ekonomi",
  "className": "XI IPS",
  "slides": [
    {"title": "Pengertian Inflasi", "content": "Inflasi adalah kenaikan harga barang dan jasa secara umum."},
    {"title": "Penyebab Inflasi", "content": "Inflasi disebabkan permintaan tinggi, biaya produksi, dan jumlah uang beredar."}
  ],
  "quizzes": [
    {"question": "Apa yang dimaksud inflasi?", "options": ["Harga naik umum", "Harga turun", "Produksi naik", "Uang hilang"], "answer": 0, "reason": "Inflasi adalah kenaikan harga secara umum."}
  ]
}`;

const menu = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "materials", label: "Semua Materi", icon: BookOpen },
  { key: "manual", label: "Buat PPT Manual", icon: FilePlus2 },
  { key: "code", label: "Buat dari Kode", icon: Code2 },
  { key: "participants", label: "Peserta Masuk", icon: Users },
  { key: "reports", label: "Nilai & Laporan", icon: BarChart3 },
  { key: "share", label: "Link Bagikan", icon: Link2 },
  { key: "settings", label: "Pengaturan", icon: Settings },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState(seedMaterials);
  const [participants, setParticipants] = useState(seedParticipants);
  const [toast, setToast] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [studentView, setStudentView] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(""), 2400);
  }

  if (previewMaterial) {
    return <PPTPreview material={previewMaterial} onClose={() => setPreviewMaterial(null)} />;
  }

  if (studentView) {
    return <StudentEntry material={selectedMaterial} onBack={() => setStudentView(false)} onSubmit={(data) => {
      setParticipants([{ id: Date.now(), ...data, material: selectedMaterial.title, progress: 0, score: "-", time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), status: "Masuk" }, ...participants]);
      showToast("Peserta baru berhasil masuk ke materi.");
      setStudentView(false);
    }} />;
  }

  if (!user) return <LoginPage setUser={setUser} setStudentView={setStudentView} />;

  const totalSlides = materials.reduce((a, m) => a + m.slides, 0);
  const totalQuizzes = materials.reduce((a, m) => a + m.quizzes, 0);
  const totalParticipants = participants.length + materials.reduce((a, m) => a + m.participants, 0);
  const avgScore = Math.round(participants.filter(p => typeof p.score === "number").reduce((a, p) => a + p.score, 0) / Math.max(1, participants.filter(p => typeof p.score === "number").length));

  function duplicateMaterial(item) {
    setMaterials([{ ...item, id: Date.now(), title: `${item.title} - Copy`, status: "Draft", participants: 0, createdAt: "Hari ini" }, ...materials]);
    showToast("Materi berhasil dicopy.");
  }

  function deleteMaterial(id) {
    setMaterials(materials.filter(m => m.id !== id));
    showToast("Materi berhasil dihapus.");
  }

  function publishMaterial(id) {
    setMaterials(materials.map(m => m.id === id ? { ...m, status: "Published" } : m));
    showToast("Materi berhasil dipublish.");
  }

  function createManual(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const item = { id: Date.now(), title: form.get("title"), subject: form.get("subject"), className: form.get("className"), status: "Draft", slides: Number(form.get("slides") || 1), quizzes: Number(form.get("quizzes") || 0), participants: 0, score: "-", createdAt: "Hari ini", shareCode: `MTR-${Date.now().toString().slice(-4)}` };
    setMaterials([item, ...materials]);
    setSelectedMaterial(item);
    showToast("Draft materi manual berhasil dibuat.");
    setPage("materials");
  }

  function createFromCode(codeText) {
    try {
      const parsed = JSON.parse(codeText);
      const item = { id: Date.now(), title: parsed.title || "Materi dari Kode", subject: parsed.subject || "Umum", className: parsed.className || parsed.class || "Kelas", status: "Draft", slides: parsed.slides?.length || 0, quizzes: parsed.quizzes?.length || parsed.quiz?.length || 0, participants: 0, score: "-", createdAt: "Hari ini", shareCode: `CODE-${Date.now().toString().slice(-4)}` };
      setMaterials([item, ...materials]);
      setSelectedMaterial(item);
      showToast("Kode JSON berhasil digenerate menjadi materi.");
      setPage("materials");
    } catch {
      showToast("Format JSON belum valid.");
    }
  }

  return (
    <div className="app">
      {toast && <div className="toast"><Sparkles size={18} /> {toast}</div>}
      <Sidebar page={page} setPage={(key) => { setPage(key); setSidebarOpen(false); }} open={sidebarOpen} setOpen={setSidebarOpen} setUser={setUser} />
      <main className="main">
        <Topbar page={page} user={user} setSidebarOpen={setSidebarOpen} onLogout={() => setUser(null)} />
        {page === "dashboard" && <Dashboard setPage={setPage} materials={materials} participants={participants} stats={{ totalMaterials: materials.length, totalSlides, totalQuizzes, totalParticipants, avgScore }} />}
        {page === "materials" && <Materials materials={materials} setPage={setPage} duplicateMaterial={duplicateMaterial} deleteMaterial={deleteMaterial} publishMaterial={publishMaterial} setSelectedMaterial={setSelectedMaterial}
            setPreviewMaterial={setPreviewMaterial} />}
        {page === "manual" && <ManualCreate createManual={createManual} />}
        {page === "code" && <CodeCreate createFromCode={createFromCode} />}
        {page === "participants" && <Participants participants={participants} />}
        {page === "reports" && <Reports participants={participants} materials={materials} />}
        {page === "share" && <SharePage materials={materials} selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial}
            setPreviewMaterial={setPreviewMaterial} setStudentView={setStudentView} showToast={showToast} />}
        {page === "settings" && <SettingsPage user={user} showToast={showToast} />}
      </main>
    </div>
  );
}

function LoginPage({ setUser, setStudentView }) {
  return (
    <div className="login-screen">
      <div className="login-left">
        <div className="login-brand"><div className="brand-mark">J</div><div><h1>JeniusPPT</h1><p>Platform PPT interaktif dan kuis untuk guru.</p></div></div>
        <h2>Buat materi, bagikan link, dan pantau peserta tanpa akun siswa.</h2>
        <div className="login-preview"><div></div><div></div><div></div></div>
      </div>
      <div className="login-card">
        <span className="eyebrow">Masuk Guru</span>
        <h2>Dashboard Guru</h2>
        <p>Guru masuk dengan Google. Siswa cukup membuka link lalu mengisi nama, jenis kelamin, dan kelas.</p>
        <button className="btn dark" onClick={() => setUser({ name: "Guru Ekonomi", email: "guru@jeniusppt.online", role: "teacher" })}>Login Guru dengan Google</button>
        <button className="btn ghost" onClick={() => setStudentView(true)}>Preview Halaman Siswa</button>
      </div>
    </div>
  );
}

function StudentEntry({ material, onBack, onSubmit }) {
  return (
    <div className="student-entry"><div className="student-card">
      <button className="back-btn" onClick={onBack}>← Kembali</button>
      <span className="eyebrow">Link Materi</span>
      <h1>{material.title}</h1><p>{material.subject} • {material.className} • {material.slides} slide • {material.quizzes} kuis</p>
      <form onSubmit={(e) => { e.preventDefault(); const form = new FormData(e.currentTarget); onSubmit({ name: form.get("name"), gender: form.get("gender"), className: form.get("className") }); }}>
        <input name="name" placeholder="Nama lengkap" required />
        <select name="gender" required><option value="">Pilih jenis kelamin</option><option>Laki-laki</option><option>Perempuan</option></select>
        <input name="className" placeholder="Kelas, contoh XI IPS 1" required />
        <button className="btn primary full">Masuk & Mulai Belajar</button>
      </form>
    </div></div>
  );
}

function Sidebar({ page, setPage, open, setOpen, setUser }) {
  return (
    <>
      <div className={open ? "overlay show" : "overlay"} onClick={() => setOpen(false)} />
      <aside className={open ? "sidebar show" : "sidebar"}>
        <div className="sidebar-head"><div className="brand-mark">J</div><div><h2>JeniusPPT</h2><p>Teacher Workspace</p></div><button className="close-menu" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <nav className="nav-menu">{menu.map(item => { const Icon = item.icon; return <button key={item.key} className={page === item.key ? "active" : ""} onClick={() => setPage(item.key)}><Icon size={19} /><span>{item.label}</span></button>; })}</nav>
        <div className="pro-box"><Sparkles size={22} /><h3>JeniusPPT Pro</h3><p>Kelola PPT, kuis, peserta, nilai, dan laporan dalam satu dashboard.</p><button>Upgrade Sekarang</button></div>
        <button className="logout" onClick={() => setUser(null)}><LogOut size={18} />Keluar</button>
      </aside>
    </>
  );
}

function Topbar({ page, user, setSidebarOpen, onLogout }) {
  const title = menu.find(m => m.key === page)?.label || "Dashboard";
  return <header className="topbar"><button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button><div className="top-title"><span>JeniusPPT</span><h2>{title}</h2></div><div className="search-box"><Search size={18} /><input placeholder="Cari materi, peserta, kuis..." /></div><button className="icon-btn"><Bell size={19} /><i>3</i></button><div className="teacher-profile"><div className="avatar">G</div><div><b>{user.name}</b><p>Guru</p></div></div><button className="top-logout" onClick={onLogout}>Keluar</button></header>;
}

function Dashboard({ setPage, materials, participants, stats }) {
  return (
    <section className="page">
      <div className="hero-panel"><div><span className="eyebrow">Dashboard Guru</span><h1>Selamat datang, Guru Ekonomi! 👋</h1><p>Kelola PPT, kuis, link belajar, peserta masuk, dan nilai siswa dalam satu tempat yang rapi.</p></div><div className="hero-actions"><button className="btn light" onClick={() => setPage("reports")}><Download size={18} /> Export Laporan</button><button className="btn primary" onClick={() => setPage("manual")}><Plus size={18} /> Buat Materi</button></div></div>
      <div className="stats-grid"><Stat icon={BookOpen} label="Total Materi" value={stats.totalMaterials} note="+4 minggu ini" /><Stat icon={ClipboardList} label="Total Slide" value={stats.totalSlides} note="+38 slide" /><Stat icon={Gauge} label="Kuis Dibuat" value={stats.totalQuizzes} note="+7 kuis" /><Stat icon={Users} label="Peserta Masuk" value={stats.totalParticipants} note="+82 hari ini" /></div>
      <div className="quick-panel"><SectionTitle title="Aksi Cepat" desc="Pilih fitur utama untuk membuat dan membagikan materi." /><div className="quick-grid"><QuickCard tone="purple" icon={FilePlus2} title="Buat Manual" desc="CRUD slide, copy, preview, publish." onClick={() => setPage("manual")} /><QuickCard tone="blue" icon={Code2} title="Buat dari Kode" desc="Tempel JSON menjadi slide dan kuis." onClick={() => setPage("code")} /><QuickCard tone="green" icon={Users} title="Peserta Masuk" desc="Lihat siswa yang membuka link." onClick={() => setPage("participants")} /><QuickCard tone="orange" icon={Share2} title="Bagikan Link" desc="Siswa isi nama, gender, kelas." onClick={() => setPage("share")} /></div></div>
      <div className="dash-grid"><div className="panel chart-panel"><SectionTitle title="Aktivitas Peserta" desc="Perkembangan peserta selama 7 hari terakhir." action="7 Hari" /><div className="chart-bars">{[62,54,76,64,43,55,74].map((h,i)=><span key={i} style={{height:`${h}%`}} />)}</div><div className="chart-days"><span>18 Jun</span><span>19 Jun</span><span>20 Jun</span><span>21 Jun</span><span>22 Jun</span><span>23 Jun</span><span>24 Jun</span></div></div><div className="panel"><SectionTitle title="Materi Terbaru" desc="PPT dan kuis yang baru dibuat." action="Lihat Semua" /><div className="compact-list">{materials.slice(0,4).map(m=><div className="material-card mini-card" key={m.id}><div className="thumb">{m.subject[0]}</div><div><h3>{m.title}</h3><p>{m.className} • {m.slides} slide • {m.quizzes} kuis</p></div><Badge status={m.status} /></div>)}</div></div></div>
      <div className="dash-grid bottom"><div className="panel"><SectionTitle title="Progress Peserta" desc="Status penyelesaian materi." /><Progress label="Sudah selesai" value={63} tone="green" /><Progress label="Sedang belajar" value={24} tone="blue" /><Progress label="Belum selesai" value={13} tone="orange" /></div><div className="panel"><SectionTitle title="Peserta Masuk Terbaru" desc="Data dari siswa yang membuka link materi." /><ParticipantsTable participants={participants.slice(0,4)} /></div></div>
    </section>
  );
}

function Materials({ materials, setPage, duplicateMaterial, deleteMaterial, publishMaterial, setSelectedMaterial, setPreviewMaterial }) {
  return <section className="page"><PageHead title="Semua Materi" desc="Kelola materi, edit, copy, hapus, publish, dan share link." actions={<><button className="btn light" onClick={()=>setPage("code")}><Code2 size={18} /> Buat dari Kode</button><button className="btn primary" onClick={()=>setPage("manual")}><Plus size={18} /> Buat Manual</button></>} /><div className="materials-grid">{materials.map(m=><div className="material-card large" key={m.id}><div className="card-top"><div className="thumb big">{m.subject[0]}</div><Badge status={m.status} /></div><h3>{m.title}</h3><p>{m.subject} • {m.className}</p><div className="meta-grid"><span>{m.slides} Slide</span><span>{m.quizzes} Kuis</span><span>{m.participants} Peserta</span><span>Nilai {m.score}</span></div><div className="card-actions"><button onClick={()=>publishMaterial(m.id)}><CheckCircle2 size={16}/> Publish</button><button onClick={()=>duplicateMaterial(m)}><Copy size={16}/> Copy</button><button onClick={()=>{setSelectedMaterial(m);setPage("share")}}><Share2 size={16}/> Share</button><button onClick={()=>deleteMaterial(m.id)} className="danger"><Trash2 size={16}/> Hapus</button></div></div>)}</div></section>;
}

function ManualCreate({ createManual }) {
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: "Judul Materi",
      content: "Tulis isi materi di sini...",
      layout: "Title",
      bg: "gradient",
    },
  ]);
  const [active, setActive] = useState(0);

  const current = slides[active];

  function updateSlide(field, value) {
    setSlides(slides.map((s, i) => i === active ? { ...s, [field]: value } : s));
  }

  function addSlide() {
    const next = {
      id: Date.now(),
      title: "Slide Baru",
      content: "Isi materi slide baru...",
      layout: "Content",
      bg: "gradient",
    };
    setSlides([...slides, next]);
    setActive(slides.length);
  }

  function duplicateSlide() {
    const copy = {
      ...current,
      id: Date.now(),
      title: current.title + " - Copy",
    };
    const nextSlides = [...slides];
    nextSlides.splice(active + 1, 0, copy);
    setSlides(nextSlides);
    setActive(active + 1);
  }

  function deleteSlide() {
    if (slides.length === 1) return;
    const nextSlides = slides.filter((_, i) => i !== active);
    setSlides(nextSlides);
    setActive(Math.max(0, active - 1));
  }

  return (
    <section className="page manual-builder-page">
      <PageHead
        title="Buat PPT Manual"
        desc="Editor manual untuk membuat slide, mengedit isi, copy slide, hapus slide, preview, dan simpan draft."
        actions={
          <>
            <button className="btn light" type="button">Preview</button>
            <button className="btn primary" form="manual-material-form">
              <SaveIcon /> Simpan Draft
            </button>
          </>
        }
      />

      <div className="manual-editor">
        <aside className="slide-list-panel">
          <div className="slide-list-head">
            <h3>Slide</h3>
            <button onClick={addSlide}>+ Slide</button>
          </div>

          <div className="slide-list">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={active === index ? "slide-thumb active" : "slide-thumb"}
                onClick={() => setActive(index)}
              >
                <span>{index + 1}</span>
                <div>
                  <b>{slide.title}</b>
                  <small>{slide.layout}</small>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="canvas-area">
          <div className={`ppt-canvas ${current.bg}`}>
            <span className="slide-label">Slide {active + 1}</span>
            <h1>{current.title}</h1>
            <p>{current.content}</p>
          </div>

          <div className="canvas-actions">
            <button onClick={addSlide}>Tambah Slide</button>
            <button onClick={duplicateSlide}>Copy Slide</button>
            <button onClick={deleteSlide}>Hapus Slide</button>
          </div>
        </main>

        <aside className="property-panel">
          <form id="manual-material-form" onSubmit={createManual}>
            <h3>Properti Materi</h3>

            <label>Judul Materi</label>
            <input name="title" value={current.title} onChange={(e) => updateSlide("title", e.target.value)} required />

            <label>Mata Pelajaran</label>
            <input name="subject" defaultValue="Ekonomi" required />

            <label>Kelas</label>
            <input name="className" defaultValue="XI IPS" required />

            <input type="hidden" name="slides" value={slides.length} />
            <input type="hidden" name="quizzes" value="0" />

            <h3 className="mt">Properti Slide</h3>

            <label>Judul Slide</label>
            <input value={current.title} onChange={(e) => updateSlide("title", e.target.value)} />

            <label>Isi Slide</label>
            <textarea value={current.content} onChange={(e) => updateSlide("content", e.target.value)} />

            <label>Layout</label>
            <select value={current.layout} onChange={(e) => updateSlide("layout", e.target.value)}>
              <option>Title</option>
              <option>Content</option>
              <option>Image</option>
              <option>Quiz</option>
            </select>

            <label>Background</label>
            <select value={current.bg} onChange={(e) => updateSlide("bg", e.target.value)}>
              <option value="gradient">Gradient</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="green">Green</option>
            </select>

            <div className="insert-tools">
              <button type="button">Text</button>
              <button type="button">Image</button>
              <button type="button">Video</button>
              <button type="button">Quiz</button>
            </div>

            <button className="btn primary full">
              <SaveIcon /> Simpan Draft
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}

function SaveIcon() {
  return <span style={{ fontWeight: 900 }}>＋</span>;
}


function CodeCreate({ createFromCode }) {
  const [code, setCode] = useState(sampleCode);
  return <section className="page"><PageHead title="Buat dari Kode" desc="Tempel JSON untuk menghasilkan slide, kuis, esai, dan alasan jawaban." /><div className="editor-grid"><div className="panel code-panel"><SectionTitle title="Kode JSON" desc="Pastikan format JSON valid." /><textarea value={code} onChange={(e)=>setCode(e.target.value)} /><button className="btn primary full" onClick={()=>createFromCode(code)}><Wand2 size={18}/> Generate Materi</button></div><div className="panel output-panel"><SectionTitle title="Output Otomatis" desc="Data yang akan dibuat dari kode." /><div className="output-list"><span><CheckCircle2/> Slide materi</span><span><CheckCircle2/> Kuis A–D</span><span><CheckCircle2/> Benar/Salah</span><span><CheckCircle2/> Esai</span><span><CheckCircle2/> Alasan jawaban</span></div></div></div></section>;
}

function Participants({ participants }) { return <section className="page"><PageHead title="Peserta Masuk" desc="Siswa yang membuka link materi tanpa membuat akun." /><div className="panel"><ParticipantsTable participants={participants} /></div></section>; }

function Reports({ participants, materials }) {
  return <section className="page"><PageHead title="Nilai & Laporan" desc="Pantau nilai, progress, dan export laporan belajar." actions={<button className="btn primary"><Download size={18}/> Export Excel</button>} /><div className="stats-grid"><Stat icon={BarChart3} label="Rata-rata Nilai" value="86.4" note="+5.2 meningkat" /><Stat icon={Users} label="Peserta Selesai" value={participants.filter(p=>p.status==="Selesai").length} note="Hari ini" /><Stat icon={BookOpen} label="Materi Aktif" value={materials.filter(m=>m.status==="Published").length} note="Published" /><Stat icon={Gauge} label="Progress Rata-rata" value="72%" note="Semua peserta" /></div><div className="panel"><ParticipantsTable participants={participants} /></div></section>;
}

function SharePage({ materials, selectedMaterial, setSelectedMaterial, setStudentView, showToast, setPage }) {
  const shareUrl = selectedMaterial ? `https://jeniusppt.online/m/${selectedMaterial.shareCode}` : "";
  return <section className="page"><PageHead title="Link Bagikan" desc="Bagikan link materi kepada siswa. Siswa cukup isi nama, jenis kelamin, dan kelas." /><div className="share-layout"><div className="panel form-card"><SectionTitle title="Pilih Materi" desc="Link akan mengikuti materi yang dipilih." /><select value={selectedMaterial.id} onChange={(e)=>setSelectedMaterial(materials.find(m=>m.id===Number(e.target.value)))}>{materials.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select><label>Link Materi</label><div className="copy-box"><input value={shareUrl || "Belum ada link. Pilih atau buat materi dulu."} readOnly /><button onClick={()=>showToast("Link berhasil dicopy.")}><Copy size={18}/></button></div><div className="share-actions"><button className="btn primary" onClick={()=>setStudentView(true)}><Eye size={18}/> Preview Link Siswa</button><button className="btn light" onClick={()=>showToast("QR Code siap dibuat.")}><QrCode size={18}/> QR Code</button></div></div><div className="panel share-card"><div className="qr-box"><QrCode size={86}/></div><h2>{selectedMaterial.title}</h2><p>{selectedMaterial.className} • {selectedMaterial.slides} slide • {selectedMaterial.quizzes} kuis</p><span className="share-code">{selectedMaterial.shareCode}</span></div></div></section>;
}

function SettingsPage({ user, showToast }) {
  return <section className="page"><PageHead title="Pengaturan" desc="Atur profil guru, sekolah, dan preferensi dashboard." /><div className="editor-grid"><div className="panel form-card"><SectionTitle title="Profil Guru" desc="Data profil yang muncul di dashboard." /><label>Nama Guru</label><input defaultValue={user.name} /><label>Email</label><input defaultValue={user.email} /><label>Nama Sekolah</label><input defaultValue="SMA Budi Luhur" /><button className="btn primary full" onClick={()=>showToast("Pengaturan berhasil disimpan.")}>Simpan Pengaturan</button></div><div className="panel"><SectionTitle title="Preferensi" desc="Tampilan dan fitur aplikasi." /><div className="setting-row"><span>Mode siswa tanpa akun</span><b>Aktif</b></div><div className="setting-row"><span>Link publik materi</span><b>Aktif</b></div><div className="setting-row"><span>Auto-save draft</span><b>Aktif</b></div></div></div></section>;
}


function PPTPreview({ material, onClose }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: material.title,
      subtitle: `${material.subject} • ${material.className}`,
      content: "Materi pembelajaran interaktif yang dapat dipelajari siswa melalui link yang dibagikan guru.",
    },
    {
      title: "Tujuan Pembelajaran",
      subtitle: "Slide 2",
      content: "Siswa mampu memahami konsep utama, menjawab kuis, dan melihat pembahasan jawaban.",
    },
    {
      title: "Kuis Interaktif",
      subtitle: "Slide 3",
      content: `Materi ini memiliki ${material.quizzes} kuis dan ${material.slides} slide pembelajaran.`,
    },
  ];

  const current = slides[slide];

  function nextSlide() {
    setSlide((slide + 1) % slides.length);
  }

  function prevSlide() {
    setSlide(slide === 0 ? slides.length - 1 : slide - 1);
  }

  return (
    <div className="preview-page">
      <header className="preview-topbar">
        <div>
          <h2>Preview PPT</h2>
          <p>{material.title}</p>
        </div>
        <div className="preview-actions">
          <button onClick={prevSlide}>← Sebelumnya</button>
          <button onClick={nextSlide}>Berikutnya →</button>
          <button className="close-preview" onClick={onClose}>Tutup</button>
        </div>
      </header>

      <main className="preview-stage">
        <aside className="preview-thumbs">
          {slides.map((s, index) => (
            <button
              key={s.title}
              className={slide === index ? "active" : ""}
              onClick={() => setSlide(index)}
            >
              <span>{index + 1}</span>
              <b>{s.title}</b>
            </button>
          ))}
        </aside>

        <section className="preview-slide">
          <span>{current.subtitle}</span>
          <h1>{current.title}</h1>
          <p>{current.content}</p>

          <div className="preview-footer">
            <small>Slide {slide + 1} dari {slides.length}</small>
            <small>JeniusPPT Preview Mode</small>
          </div>
        </section>
      </main>
    </div>
  );
}


function Stat({ icon: Icon, label, value, note }) { return <div className="stat"><div className="stat-icon"><Icon size={24}/></div><p>{label}</p><h2>{value}</h2><span>{note}</span></div>; }
function QuickCard({ tone, icon: Icon, title, desc, onClick }) { return <button className={`quick-card ${tone}`} onClick={onClick}><Icon size={34}/><h3>{title}</h3><p>{desc}</p><span>Mulai →</span></button>; }
function SectionTitle({ title, desc, action }) { return <div className="section-title"><div><h2>{title}</h2>{desc && <p>{desc}</p>}</div>{action && <button className="small-pill">{action}</button>}</div>; }
function PageHead({ title, desc, actions }) { return <div className="page-head"><div><span className="eyebrow">JeniusPPT</span><h1>{title}</h1><p>{desc}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>; }
function Progress({ label, value, tone }) { return <div className="progress-block"><div><span>{label}</span><b>{value}%</b></div><div className="progress-line"><i className={tone} style={{width:`${value}%`}} /></div></div>; }
function Badge({ status }) { return <span className={status==="Published" ? "badge published" : "badge draft"}>{status}</span>; }
function ParticipantsTable({ participants }) { return <div className="table-wrap"><table><thead><tr><th>Nama</th><th>Jenis Kelamin</th><th>Kelas</th><th>Materi</th><th>Waktu</th><th>Progress</th><th>Nilai</th><th>Status</th></tr></thead><tbody>{participants.map(p=><tr key={p.id}><td><b>{p.name}</b></td><td>{p.gender}</td><td>{p.className}</td><td>{p.material}</td><td>{p.time}</td><td>{p.progress}%</td><td>{p.score}</td><td><span className={p.status==="Selesai" ? "badge published" : "badge progress"}>{p.status}</span></td></tr>)}</tbody></table></div>; }
