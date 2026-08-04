import { useMemo, useRef, useState } from "react";
import { CheckSquare, CopyPlus, Download, FileInput, FileQuestion, Folder, FolderPlus, Grid2X2, List, MoreVertical, Search, Trash2, Upload } from "lucide-react";
import SolidSelect from "../ui/SolidSelect";
import { jeniusConfirm, jeniusPrompt } from "../../utils/jeniusDialog";

export default function QuestionBankDrive({ questions, setQuestions, notify }) {
  const [folders, setFolders] = useState(() => JSON.parse(localStorage.getItem("jeniusppt-question-folders") || "[]"));
  const [folderId, setFolderId] = useState("root");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState("newest");
  const importRef = useRef(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((item) => (item.folderId || "root") === folderId && (!term || `${item.question} ${item.answer} ${item.subject || ""}`.toLowerCase().includes(term)))
      .sort((a,b) => sort === "az" ? a.question.localeCompare(b.question) : String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [questions, folderId, search, sort]);

  function saveFolders(next) { setFolders(next); localStorage.setItem("jeniusppt-question-folders", JSON.stringify(next)); }
  async function newFolder() {
    const name = await jeniusPrompt({ title:"Folder baru", message:"Beri nama folder agar soal lebih mudah dikelompokkan.", placeholder:"Nama folder", defaultValue:"Folder Baru", confirmLabel:"Buat folder" });
    if (!name?.trim()) return;
    saveFolders([...folders, { id: crypto.randomUUID(), name: name.trim() }]);
    notify("Folder bank soal dibuat.");
  }
  async function removeSelected() {
    if (!selected.length) return;
    const approved = await jeniusConfirm({ title:"Hapus soal terpilih?", message:`${selected.length} soal akan dihapus dari Bank Soal.`, confirmLabel:"Ya, hapus", danger:true });
    if (!approved) return;
    setQuestions(questions.filter((item) => !selected.includes(item.id)));
    setSelected([]);
    notify("Soal yang dipilih telah dihapus.");
  }
  function duplicate(item) {
    setQuestions([{ ...item, id: crypto.randomUUID(), question: `${item.question} (Salinan)`, createdAt: new Date().toISOString() }, ...questions]);
    notify("Soal berhasil diduplikasi.");
  }
  function exportData() {
    const data = selected.length ? questions.filter((item) => selected.includes(item.id)) : questions;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
    link.download = "bank-soal-jeniusppt.json"; link.click(); URL.revokeObjectURL(link.href);
  }
  function importData(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const data = JSON.parse(reader.result); const rows = (Array.isArray(data) ? data : []).map((item) => ({...item,id:crypto.randomUUID(),folderId,createdAt:new Date().toISOString()})); setQuestions([...rows,...questions]); notify(`${rows.length} soal berhasil diimpor.`); } catch { notify("Berkas bank soal tidak valid.","error"); } };
    reader.readAsText(file); event.target.value="";
  }
  function moveSelected(nextFolder) {
    setQuestions(questions.map((item) => selected.includes(item.id) ? {...item,folderId:nextFolder} : item));
    setSelected([]); notify("Soal dipindahkan ke folder tujuan.");
  }

  return <div className="question-drive">
    <aside className="question-drive-sidebar">
      <button className="drive-new" onClick={newFolder}><FolderPlus size={19}/> Folder baru</button>
      <button className={folderId === "root" ? "active" : ""} onClick={() => setFolderId("root")}><FileQuestion size={18}/> Semua soal</button>
      {folders.map((folder) => <button key={folder.id} className={folderId === folder.id ? "active" : ""} onClick={() => setFolderId(folder.id)}><Folder size={18}/><span>{folder.name}</span></button>)}
    </aside>
    <section className="question-drive-main">
      <header className="drive-toolbar">
        <label className="drive-search"><Search size={18}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari di Bank Soal"/></label>
        <button onClick={()=>importRef.current?.click()}><Upload size={17}/> Impor</button>
        <button onClick={exportData}><Download size={17}/> Ekspor</button>
        <button className="icon-only" onClick={()=>setView(view === "list" ? "grid" : "list")}>{view === "list" ? <Grid2X2 size={18}/> : <List size={18}/>}</button>
        <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={importData}/>
      </header>
      <div className="drive-breadcrumb"><b>Bank Soal</b><span>/</span><span>{folderId === "root" ? "Semua soal" : folders.find((f)=>f.id===folderId)?.name}</span></div>
      <div className="drive-actions">
        <label><input type="checkbox" checked={visible.length > 0 && selected.length === visible.length} onChange={(e)=>setSelected(e.target.checked ? visible.map((item)=>item.id) : [])}/> Pilih semua</label>
        <SolidSelect value={sort} onChange={(e)=>setSort(e.target.value)}><option value="newest">Terbaru</option><option value="az">Nama A-Z</option></SolidSelect>
        {selected.length > 0 && <><SolidSelect value="" onChange={(e)=>moveSelected(e.target.value)}><option value="" disabled>Pindahkan ke...</option><option value="root">Semua soal</option>{folders.map((f)=><option key={f.id} value={f.id}>{f.name}</option>)}</SolidSelect><button className="drive-delete" onClick={removeSelected}><Trash2 size={16}/> Hapus ({selected.length})</button></>}
      </div>
      <div className={`drive-items ${view}`}>
        {visible.map((item) => <article key={item.id} className={selected.includes(item.id) ? "selected" : ""}>
          <label><input type="checkbox" checked={selected.includes(item.id)} onChange={(e)=>setSelected((old)=>e.target.checked?[...old,item.id]:old.filter((id)=>id!==item.id))}/></label>
          <span className="drive-file-icon"><FileQuestion size={21}/></span>
          <div><b>{item.question}</b><p>{item.subject || "Umum"} · Jawaban: {item.answer}</p></div>
          <button className="icon-only" title="Duplikat" onClick={()=>duplicate(item)}><CopyPlus size={17}/></button>
          <button className="icon-only" title="Hapus" onClick={async()=>{ const approved = await jeniusConfirm({ title:"Hapus soal?", message:"Soal ini akan dihapus dari Bank Soal.", confirmLabel:"Ya, hapus", danger:true }); if (approved) { setQuestions(questions.filter((row)=>row.id!==item.id)); notify("Soal dihapus."); } }}><MoreVertical size={17}/></button>
        </article>)}
        {!visible.length && <div className="drive-empty"><FileInput size={35}/><b>Folder ini masih kosong</b><p>Tambahkan soal baru atau impor berkas JSON.</p></div>}
      </div>
    </section>
  </div>;
}
