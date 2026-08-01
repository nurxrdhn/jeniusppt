import { useState } from "react";
import { Eye, Share2 } from "lucide-react";
import PPTEditor from "../editor/PPTEditor";
import QuizBuilder from "../quiz/QuizBuilder";
import PreviewPlayer from "../preview/PreviewPlayer";

const tabs = ["Info", "Slide", "Quiz", "Preview", "Publish"];

export default function MaterialBuilder({
  material,
  updateMaterial,
  openShare,
  onBack,
}) {
  const [tab, setTab] = useState("Info");
  const [busy, setBusy] = useState(false);

  async function publish() {
    if (busy) return;

    try {
      setBusy(true);
      await openShare(material);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page builder-page">
      <div className="builder-top">
        <button onClick={onBack}>← Kembali</button>

        <div className="stepper">
          {tabs.map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button className="primary-button" onClick={publish} disabled={busy}>
          <Share2 size={17} />
          {busy ? "Publishing..." : "Publish"}
        </button>
      </div>

      {tab === "Info" && (
        <div className="info-form">
          <h1>Info Materi</h1>

          <label>Judul</label>
          <input
            value={material.title}
            onChange={(e) => updateMaterial(material.id, { title: e.target.value })}
          />

          <label>Mapel</label>
          <input
            value={material.subject}
            onChange={(e) => updateMaterial(material.id, { subject: e.target.value })}
          />

          <label>Kelas</label>
          <input
            value={material.className}
            onChange={(e) => updateMaterial(material.id, { className: e.target.value })}
          />

          <div className="settings-divider"><h2>Akses & Sertifikat</h2><p>Atur siapa yang dapat mengerjakan materi dan kapan materi tersedia.</p></div>
          <div className="settings-grid">
            <label><span>Kode Akses</span><input value={material.accessCode||""} onChange={(e)=>updateMaterial(material.id,{accessCode:e.target.value})} placeholder="Opsional, contoh: KELAS11"/></label>
            <label><span>Batas Percobaan</span><input type="number" min="0" value={material.attemptLimit||0} onChange={(e)=>updateMaterial(material.id,{attemptLimit:Number(e.target.value)})}/><small>Isi 0 untuk tanpa batas.</small></label>
            <label><span>Mulai Tersedia</span><input type="datetime-local" value={material.availableFrom||""} onChange={(e)=>updateMaterial(material.id,{availableFrom:e.target.value})}/></label>
            <label><span>Berakhir</span><input type="datetime-local" value={material.availableUntil||""} onChange={(e)=>updateMaterial(material.id,{availableUntil:e.target.value})}/></label>
            <label className="toggle-setting"><input type="checkbox" checked={material.certificateEnabled!==false} onChange={(e)=>updateMaterial(material.id,{certificateEnabled:e.target.checked})}/><span>Aktifkan sertifikat otomatis</span></label>
            <label><span>Nilai Minimum Sertifikat</span><input type="number" min="0" max="100" value={material.passingScore??75} onChange={(e)=>updateMaterial(material.id,{passingScore:Number(e.target.value)})}/></label>
          </div>
        </div>
      )}

      {tab === "Slide" && (
        <PPTEditor material={material} updateMaterial={updateMaterial} />
      )}

      {tab === "Quiz" && (
        <QuizBuilder material={material} updateMaterial={updateMaterial} />
      )}

      {tab === "Preview" && <PreviewPlayer material={material} teacher />}

      {tab === "Publish" && (
        <div className="publish-card">
          <h1>Bagikan</h1>
          <p>QR dan link siap dipakai.</p>

          <div className="share-box">/play/{material.shareCode}</div>

          <a className="primary-button" target="_blank" href={`/play/${material.shareCode}`}>
            <Eye size={17} />
            Preview
          </a>

          <button className="primary-button" onClick={publish} disabled={busy}>
            <Share2 size={17} />
            {busy ? "Publishing..." : "QR & Link"}
          </button>
        </div>
      )}
    </section>
  );
}
