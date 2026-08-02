import { useEffect, useState } from "react";

import {
  Archive,
  BookOpen,
  Check,
  Copy,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
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
import FileCenter from "./components/files/FileCenter";
import { SubscriptionPage, TemplateRecommendations, TrashPage } from "./components/dashboard/FeaturePages";

import { SLIDE_SIZES } from "./utils/slideSizes";
import { publishMaterialToFirestore } from "./services/materialService";
import { subscribeParticipants } from "./services/studentService";
import { exportParticipantsExcel, exportParticipantsPdf } from "./utils/participantReport";

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
        value: "linear-gradient(135deg,#7c2d12,#f97316)",
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
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      materials: saved?.materials || [],
      participants: saved?.participants || [],
      trash: saved?.trash || [],
      notifications: saved?.notifications || [],
      activePlan: saved?.activePlan || "Free",
    };
  } catch {
    return {
      materials: [],
      participants: [],
      trash: [],
      notifications: [],
      activePlan: "Free",
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
  const [participantMaterialFilter, setParticipantMaterialFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const expired=(state.trash||[]).filter((item)=>Date.now()-new Date(item.deletedAt).getTime()>=30*86400000);
    const warning=(state.trash||[]).filter((item)=>{const age=Date.now()-new Date(item.deletedAt).getTime();return age>=29*86400000&&age<30*86400000});
    if(expired.length)setState((old)=>({...old,trash:old.trash.filter((item)=>!expired.some((expiredItem)=>expiredItem.id===item.id))}));
    warning.forEach((item)=>addNotification("Materi akan dihapus besok",`${item.title} akan dihapus permanen dalam 1 hari.`,"⚠️",`trash-warning-${item.id}`));
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeParticipants(
      (participants) => setState((old) => ({ ...old, participants })),
      (error) => {
        console.error("Gagal membaca peserta:", error);
        notify("Data peserta belum dapat dibaca dari Firebase.");
      }
    );
  }, [user]);

  const editingMaterial = state.materials.find((m) => m.id === editingId);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function addNotification(title,message,icon="🔔",uniqueKey){setState((old)=>{if(uniqueKey&&old.notifications?.some((item)=>item.uniqueKey===uniqueKey))return old;return{...old,notifications:[{id:crypto.randomUUID(),title,message,icon,read:false,createdAt:new Date().toISOString(),uniqueKey},...(old.notifications||[])].slice(0,100)}})}

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
    addNotification("Materi baru dibuat",`${item.title} siap diedit.`,"📝");
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
    addNotification("Materi berhasil diimpor",`${item.title} dibuat dari kode atau dokumen.`,"📥");
  }

  async function publishMaterial(material) {
    const updated = {
      ...material,
      status: "Published",
      publishedAtLocal: new Date().toISOString(),
    };

    localStorage.setItem(
      `jeniusppt_package_${updated.shareCode}`,
      JSON.stringify(updated)
    );

    updateMaterial(updated.id, {
      status: "Published",
      publishedAtLocal: updated.publishedAtLocal,
    });

    try {
      await publishMaterialToFirestore(updated);
      notify("Materi berhasil dipublish.");
      addNotification("Materi dipublikasikan",`${updated.title} sudah dapat diakses siswa.`,"🚀");
    } catch (err) {
      console.error(err);
      notify("Link lokal siap. Firebase gagal, cek koneksi/config.");
    }

    return updated;
  }

  async function openShare(material) {
    const instant = {
      ...material,
      status: "Published",
      publishedAtLocal: new Date().toISOString(),
    };

    try {
      await publishMaterialToFirestore(instant);
      localStorage.setItem(
        `jeniusppt_package_${instant.shareCode}`,
        JSON.stringify(instant)
      );
      updateMaterial(instant.id, {
        status: "Published",
        publishedAtLocal: instant.publishedAtLocal,
      });
      setShareMaterial(instant);
      notify("QR dan link siswa siap dibuka di HP.");
      addNotification("Tautan dibagikan",`QR dan tautan ${instant.title} siap digunakan.`,"🔗");
      return instant;
    } catch (err) {
      console.error(err);
      notify("Publikasi daring gagal. Link belum dapat dibuka di HP.");
      return null;
    }
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
    addNotification("Materi diduplikasi",`${copied.title} berhasil dibuat.`,"📑");
  }

  function deleteMaterial(material) {const permanent=window.confirm("Klik OK untuk hapus permanen. Klik Batal untuk memindahkan ke Tempat Sampah selama 30 hari.");setState((old)=>({...old,materials:old.materials.filter((m)=>m.id!==material.id),trash:permanent?old.trash:[{...material,deletedAt:new Date().toISOString()},...(old.trash||[])]}));notify(permanent?"Materi dihapus permanen.":"Materi dipindahkan ke Tempat Sampah.");addNotification(permanent?"Materi dihapus permanen":"Materi masuk Tempat Sampah",material.title,permanent?"🗑️":"♻️")}
  function restoreMaterial(material){if(!window.confirm(`Pulihkan materi “${material.title}”?`))return;const{deletedAt,...restored}=material;setState((old)=>({...old,trash:old.trash.filter((item)=>item.id!==material.id),materials:[restored,...old.materials]}));notify("Materi berhasil dipulihkan.");addNotification("Materi dipulihkan",material.title,"✅")}
  function permanentDelete(material){if(!window.confirm(`Hapus permanen “${material.title}”? Data tidak dapat dipulihkan.`))return;setState((old)=>({...old,trash:old.trash.filter((item)=>item.id!==material.id)}));notify("Materi dihapus permanen.");addNotification("Materi dihapus permanen",material.title,"🗑️")}
  function useEducationTemplate(template){const background=`linear-gradient(135deg,${template.colors[0]},${template.colors[1]})`;const item={...blankMaterial(),title:template.title,subject:template.subject,className:template.level,status:"Draft",slides:[{title:template.title,body:template.desc,background:{type:"css",value:background},titleColor:"#ffffff",bodyColor:"#f8fafc",transition:"morph",duration:900},{title:"Tujuan Pembelajaran",body:"Tuliskan tujuan pembelajaran yang ingin dicapai.",background:{type:"css",value:background},titleColor:"#ffffff",bodyColor:"#f8fafc",transition:"morph",duration:900},{title:"Materi Utama",body:"Kembangkan isi materi sesuai kebutuhan kelas.",background:{type:"css",value:background},titleColor:"#ffffff",bodyColor:"#f8fafc",transition:"morph",duration:900}]};setState((old)=>({...old,materials:[item,...old.materials]}));setEditingId(item.id);addNotification("Template digunakan",`${template.title} ditambahkan ke materi.`,"🎨")}

  if (!user) {
    return <OpeningLogin onLogin={setUser} />;
  }

  if (editingMaterial) {
    return (
      <div className="app-shell">
        <Sidebar
          user={user}
          page="materials"
          setPage={(nextPage) => {
            setEditingId(null);
            setPage(nextPage);
          }}
          onLogout={() => setUser(null)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
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
      : page === "files"
      ? "Impor & Ekspor"
      : page === "subscription"
      ? "Langganan"
      : page === "trash"
      ? "Tempat Sampah"
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
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-area">
        <Topbar
          title={title}
          user={user}
          onCreate={createMaterial}
          onImportCode={() => setShowCodeImport(true)}
          onMenu={() => setSidebarOpen((open) => !open)}
          notifications={state.notifications || []}
          markAllRead={() => setState((old) => ({...old,notifications:(old.notifications||[]).map((item)=>({...item,read:true}))}))}
        />

        {page === "dashboard" && (
          <Dashboard state={state} onCreate={createMaterial} onImportCode={() => setShowCodeImport(true)} user={user} onUseTemplate={useEducationTemplate} />
        )}

        {page === "materials" && (
          <Materials
            materials={state.materials}
            participants={state.participants}
            editMaterial={(m) => setEditingId(m.id)}
            duplicateMaterial={duplicateMaterial}
            deleteMaterial={deleteMaterial}
            openShare={openShare}
            onCreate={createMaterial}
            onImportCode={() => setShowCodeImport(true)}
            openParticipants={(material) => {
              setParticipantMaterialFilter(material.id || material.shareCode);
              setPage("participants");
            }}
          />
        )}

        {page === "participants" && <Participants state={state} initialMaterial={participantMaterialFilter} clearInitialMaterial={() => setParticipantMaterialFilter("")} />}

        {page === "files" && <FileCenter materials={state.materials} onImport={createMaterialFromCode} notify={notify} />}

        {page === "workspace" && <Workspace state={state} editMaterial={(m) => setEditingId(m.id)} />}

        {page === "analytics" && <Analytics state={state} />}

        {page === "ai" && <AIAssistant onImportCode={() => setShowCodeImport(true)} />}

        {page === "settings" && <SettingsPage user={user} notify={notify} />}

        {page === "subscription" && <SubscriptionPage activePlan={state.activePlan} onChoose={(plan)=>{setState((old)=>({...old,activePlan:plan.name}));notify(`Paket ${plan.name} dipilih.`);addNotification("Paket langganan diperbarui",`${plan.name} • Rp${plan.price}`,"👑")}} />}

        {page === "trash" && <TrashPage items={state.trash||[]} onRestore={restoreMaterial} onDelete={permanentDelete} />}

        {!["dashboard", "materials", "participants", "files", "workspace", "analytics", "ai", "settings", "subscription", "trash"].includes(page) && (
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

function Dashboard({ state, onCreate, onImportCode, user, onUseTemplate }) {
  const published = state.materials.filter(
    (m) => m.status === "Published"
  ).length;

  return (
    <section className="page">
      <div className="welcome-card">
        <div>
          <span className="eyebrow">Jenius Workspace</span>
          <h1>Halo, {user?.name?.split(" ")[0] || "Guru"} 👋</h1>
          <p>Wujudkan pembelajaran yang lebih hidup dalam satu ruang kerja.</p>
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
        <Stat icon={<Archive />} label="Dipublikasikan" value={published} />
        <Stat icon={<Users />} label="Peserta" value={state.participants.length} />
        <Stat icon={<FolderOpen />} label="Workspace" value="2" />
      </div>

      <div className="feature-grid">
        <Feature title="Ukuran Fleksibel" desc="Tersedia format 16:9, 4:3, A4, dan portrait." />
        <Feature title="Pratinjau Langsung" desc="Periksa slide, soal, dan hasil sebelum dibagikan." />
        <Feature title="Bagikan dengan QR" desc="Siswa dapat masuk melalui QR maupun tautan." />
        <Feature title="Kuis Interaktif" desc="Dukung pilihan ganda serta benar atau salah." />
      </div>
      <TemplateRecommendations onUse={onUseTemplate} />
    </section>
  );
}

function Materials({
  materials,
  participants = [],
  editMaterial,
  duplicateMaterial,
  deleteMaterial,
  openShare,
  onCreate,
  onImportCode,
  openParticipants,
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
                <span>{participants.filter((p) => (p.materialId === m.id || p.shareCode === m.shareCode) && p.status === "Selesai").length} Peserta</span>
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

                <button className="participants-button" onClick={() => openParticipants(m)}>
                  <Users size={16} />
                  Peserta
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

function Participants({ state, initialMaterial, clearInitialMaterial }) {
  const [search,setSearch]=useState("");
  const [material,setMaterial]=useState(initialMaterial || "");
  const [className,setClassName]=useState("");
  const [gender,setGender]=useState("");
  const [status,setStatus]=useState("");
  const [scoreRange,setScoreRange]=useState("");

  useEffect(() => {
    if (initialMaterial) setMaterial(initialMaterial);
  }, [initialMaterial]);

  const materialOptions=state.materials.map((m)=>({value:m.id||m.shareCode,label:m.title}));
  const classes=[...new Set(state.participants.map((p)=>p.className).filter(Boolean))].sort();
  const filtered=state.participants.filter((p)=>{
    const keyword=search.trim().toLowerCase();
    const matchSearch=!keyword || [p.studentName,p.materialTitle,p.className].some((v)=>String(v||"").toLowerCase().includes(keyword));
    const matchMaterial=!material || p.materialId===material || p.shareCode===material;
    const matchClass=!className || p.className===className;
    const matchGender=!gender || p.gender===gender;
    const matchStatus=!status || p.status===status;
    const score=Number(p.score);
    const matchScore=!scoreRange || (scoreRange==="high"&&score>=80) || (scoreRange==="medium"&&score>=60&&score<80) || (scoreRange==="low"&&score<60);
    return matchSearch&&matchMaterial&&matchClass&&matchGender&&matchStatus&&matchScore;
  });
  const completed=filtered.filter((p)=>p.status==="Selesai");
  const average=completed.length?Math.round(completed.reduce((n,p)=>n+Number(p.score||0),0)/completed.length):0;
  const selectedMaterialName=materialOptions.find((item)=>item.value===material)?.label;
  const reportTitle=selectedMaterialName ? `Materi: ${selectedMaterialName}` : "Semua Materi";
  const formatDate=(value)=>{const date=value?.toDate?.();return date?date.toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"}):"-";};
  function reset(){setSearch("");setMaterial("");setClassName("");setGender("");setStatus("");setScoreRange("");clearInitialMaterial?.();}
  async function downloadReport(type){try{if(type==="excel")await exportParticipantsExcel(filtered,reportTitle);else await exportParticipantsPdf(filtered,reportTitle);}catch(error){alert(error.message||"Laporan gagal dibuat.");}}

  return <section className="page participants-page">
    <div className="page-head participant-page-head"><div><span className="eyebrow">Data Kelas</span><h1>Peserta & Hasil</h1><p>Pantau identitas, progres, dan nilai peserta dari seluruh materi.</p></div><div className="report-actions"><button onClick={()=>downloadReport("excel")}><FileSpreadsheet size={17}/>Export Excel</button><button onClick={()=>downloadReport("pdf")}><FileText size={17}/>Export PDF</button></div></div>
    <div className="participant-summary"><div><span>Total Data</span><b>{filtered.length}</b></div><div><span>Sudah Selesai</span><b>{completed.length}</b></div><div><span>Sedang Mengerjakan</span><b>{filtered.filter((p)=>p.status==="Mengerjakan").length}</b></div><div><span>Rata-rata Nilai</span><b>{average}</b></div></div>
    <div className="participant-filters">
      <label className="filter-search"><span>Cari peserta</span><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nama, materi, atau kelas..."/></label>
      <label><span>Materi</span><select value={material} onChange={(e)=>setMaterial(e.target.value)}><option value="">Semua materi</option>{materialOptions.map((m)=><option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
      <label><span>Kelas</span><select value={className} onChange={(e)=>setClassName(e.target.value)}><option value="">Semua kelas</option>{classes.map((item)=><option key={item}>{item}</option>)}</select></label>
      <label><span>Jenis Kelamin</span><select value={gender} onChange={(e)=>setGender(e.target.value)}><option value="">Semua</option><option>Laki-laki</option><option>Perempuan</option></select></label>
      <label><span>Status</span><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">Semua status</option><option>Mengerjakan</option><option>Selesai</option></select></label>
      <label><span>Rentang Nilai</span><select value={scoreRange} onChange={(e)=>setScoreRange(e.target.value)}><option value="">Semua nilai</option><option value="high">80–100</option><option value="medium">60–79</option><option value="low">Di bawah 60</option></select></label>
      <button className="reset-filter" onClick={reset}>Reset Filter</button>
    </div>
    <div className="data-panel participant-table"><div className="participant-table-head"><b>Peserta</b><b>Kelas</b><b>Materi</b><b>Status</b><b>Hasil</b><b>Waktu</b></div>{filtered.length?filtered.map((p,i)=><div className="participant-table-row" key={p.id||i}><span className="participant-name"><i>{(p.studentName||"S")[0].toUpperCase()}</i><span><b>{p.studentName||"Siswa"}</b><small>{p.gender||"-"}</small></span></span><span>{p.className||"-"}</span><span><b>{p.materialTitle||"-"}</b><small>{p.shareCode||""}</small></span><span><em className={p.status==="Selesai"?"status-done":"status-progress"}>{p.status}</em></span><span>{p.status==="Selesai"?<><b className="score-value">{p.score}</b><small>{p.correct} benar • {p.wrong} salah</small></>:<small>Belum selesai</small>}</span><span><small>{formatDate(p.activityAt)}</small></span></div>):<div className="empty-inline">Belum ada data yang sesuai dengan filter.</div>}</div>
  </section>;
}

function Workspace({ state, editMaterial }) {
  const drafts = state.materials.filter((m) => m.status !== "Published");
  return <section className="page"><div className="page-head"><span className="eyebrow">Workspace</span><h1>Ruang Kerja Guru</h1><p>Lanjutkan draft dan susun materi terbaru.</p></div><div className="workspace-list">{drafts.length ? drafts.map((m)=><button key={m.id} className="workspace-item" onClick={()=>editMaterial(m)}><div><b>{m.title}</b><p>{m.subject} • {m.className}</p></div><span>{m.slides.length} slide →</span></button>) : <div className="empty-state"><h2>Semua pekerjaan selesai</h2><p>Belum ada draft materi.</p></div>}</div></section>;
}

function Analytics({ state }) {
  const totalSlides=state.materials.reduce((n,m)=>n+m.slides.length,0), totalQuiz=state.materials.reduce((n,m)=>n+m.questions.length,0), published=state.materials.filter(m=>m.status==="Published").length;
  const data=[["Materi",state.materials.length],["Slide",totalSlides],["Kuis",totalQuiz],["Terbit",published]], max=Math.max(...data.map(([,value])=>value),1);
  const questionMap=new Map();
  state.participants.filter((item)=>item.status==="Selesai").forEach((participant)=>(participant.answers||[]).forEach((answer,index)=>{const key=`${participant.materialId||participant.shareCode}-${index}`;const old=questionMap.get(key)||{question:answer.question||`Soal ${index+1}`,material:participant.materialTitle||"-",correct:0,total:0};old.total+=1;if(answer.correct)old.correct+=1;questionMap.set(key,old)}));
  const questionAnalytics=[...questionMap.values()].map((item)=>({...item,percentage:Math.round((item.correct/item.total)*100)})).sort((a,b)=>a.percentage-b.percentage);
  return <section className="page"><div className="page-head"><span className="eyebrow">Insight</span><h1>Analitik Pembelajaran</h1><p>Ringkasan konten dan tingkat keberhasilan setiap soal.</p></div><div className="analytics-card">{data.map(([label,value])=><div className="metric-row" key={label}><span>{label}</span><div><i style={{width:`${Math.max(value/max*100,2)}%`}}/></div><b>{value}</b></div>)}</div><div className="question-analytics"><div className="section-title"><div><span className="eyebrow">Analitik Soal</span><h2>Soal yang Perlu Dievaluasi</h2></div><p>Diurutkan dari persentase jawaban benar paling rendah.</p></div>{questionAnalytics.length?<div className="question-analysis-list">{questionAnalytics.map((item,index)=><article key={`${item.material}-${index}`}><div><b>{item.question}</b><small>{item.material} • {item.total} jawaban</small></div><div className="question-rate"><span><i style={{width:`${item.percentage}%`}}/></span><strong>{item.percentage}% benar</strong></div><em className={item.percentage<50?"hard":item.percentage<80?"medium":"easy"}>{item.percentage<50?"Sulit":item.percentage<80?"Sedang":"Mudah"}</em></article>)}</div>:<div className="empty-inline">Analitik muncul setelah peserta menyelesaikan kuis.</div>}</div></section>;
}

function AIAssistant({ onImportCode }) {
  return <section className="page"><div className="page-head"><span className="eyebrow">Jenius AI</span><h1>Buat Materi Lebih Cepat</h1><p>Gunakan struktur JSON untuk menghasilkan slide dan kuis sekaligus.</p></div><div className="ai-panel"><div><h2>Generator Materi</h2><p>Siapkan judul, isi slide, serta soal dengan format terstruktur. Hasil tetap bisa diedit sebelum dipublikasikan.</p><button className="primary-button" onClick={onImportCode}>Buka Generator Kode</button></div><pre>{`{\n  "title": "Topik Pembelajaran",\n  "slides": [...],\n  "questions": [...]\n}`}</pre></div></section>;
}

function SettingsPage({ user, notify }) {
  const [school,setSchool]=useState(localStorage.getItem("jeniusppt_school")||"");
  function save(){localStorage.setItem("jeniusppt_school",school);notify("Pengaturan disimpan.");}
  return <section className="page"><div className="page-head"><span className="eyebrow">Preferensi</span><h1>Pengaturan</h1></div><div className="info-form"><label>Nama Guru</label><input value={user?.name||""} disabled/><label>Email</label><input value={user?.email||""} disabled/><label>Nama Sekolah</label><input value={school} onChange={(e)=>setSchool(e.target.value)} placeholder="Masukkan nama sekolah"/><button className="primary-button" onClick={save}>Simpan Pengaturan</button></div></section>;
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
