import { useState } from "react";
import { Eye, Share2 } from "lucide-react";
import PPTEditor from "../editor/PPTEditor";
import QuizBuilder from "../quiz/QuizBuilder";
import PreviewPlayer from "../preview/PreviewPlayer";
import MediaManager from "../editor/MediaManager";
import CertificateStudio from "../certificate/CertificateStudio";

const tabs = ["Info", "Slide", "Media", "Quiz", "Preview", "Publish"];

export default function MaterialBuilder({
  material,
  updateMaterial,
  openShare,
  onBack,
}) {
  const [tab, setTab] = useState("Info");
  const [busy, setBusy] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);

  async function publish() {
    if (busy) return;

    try {
      setBusy(true);
      setPublishStatus("Menyiapkan materi...");
      await openShare(material, ({ stage, current, total }) => {
        if (stage === "prepare") setPublishStatus(total ? `Menyiapkan ${total} media...` : "Menyiapkan materi...");
        if (stage === "upload") setPublishStatus(`Mengunggah media ${current}/${total}...`);
        if (stage === "save") setPublishStatus("Menerbitkan link...");
        if (stage === "quick-save") setPublishStatus("Mengaktifkan link...");
        if (stage === "link-ready") setPublishStatus("Link siap");
        if (stage === "done") setPublishStatus("Publish selesai");
      });
    } finally {
      setBusy(false);
      setPublishStatus("");
    }
  }

  return (
    <section className="page builder-page">
      <div className="builder-top">
        <button onClick={onBack}>← Kembali</button>

        <span className="autosave-status">
          <i /> Tersimpan otomatis
        </span>

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

        <div className="builder-mobile-switcher">
          <button
            type="button"
            className="builder-mobile-current"
            aria-expanded={mobileTabsOpen}
            onClick={() => setMobileTabsOpen((value) => !value)}
          >
            <span><small>Langkah aktif</small><b>{tab}</b></span>
            <i>{mobileTabsOpen ? "▲" : "▼"}</i>
          </button>
          {mobileTabsOpen && (
            <div className="builder-mobile-menu">
              {tabs.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={tab === item ? "active" : ""}
                  onClick={() => { setTab(item); setMobileTabsOpen(false); }}
                >
                  <span>{index + 1}</span>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="primary-button" onClick={publish} disabled={busy}>
          <Share2 size={17} />
          {busy ? publishStatus || "Publishing..." : "Publish"}
        </button>
      </div>

      {tab === "Info" && (
        <div className="info-certificate-layout">
        <div className="info-form">
          <h1>Info Materi</h1>

          <label>Judul</label>
          <input
            value={material.title}
            onChange={(e) =>
              updateMaterial(material.id, { title: e.target.value })
            }
          />

          <label>Mapel</label>
          <input
            value={material.subject}
            onChange={(e) =>
              updateMaterial(material.id, { subject: e.target.value })
            }
          />

          <label>Kelas</label>
          <input
            value={material.className}
            onChange={(e) =>
              updateMaterial(material.id, { className: e.target.value })
            }
          />

          <div className="settings-divider">
            <h2>Akses & Sertifikat</h2>
            <p>
              Atur siapa yang dapat mengerjakan materi dan kapan materi
              tersedia.
            </p>
          </div>
          <div className="settings-grid">
            <label>
              <span>Kode Akses</span>
              <input
                value={material.accessCode || ""}
                onChange={(e) =>
                  updateMaterial(material.id, { accessCode: e.target.value })
                }
                placeholder="Opsional, contoh: KELAS11"
              />
            </label>
            <label>
              <span>Batas Percobaan</span>
              <input
                type="number"
                min="0"
                value={material.attemptLimit || 0}
                onChange={(e) =>
                  updateMaterial(material.id, {
                    attemptLimit: Number(e.target.value),
                  })
                }
              />
              <small>Isi 0 untuk tanpa batas.</small>
            </label>
            <label>
              <span>Mulai Tersedia</span>
              <input
                type="datetime-local"
                value={material.availableFrom || ""}
                onChange={(e) =>
                  updateMaterial(material.id, { availableFrom: e.target.value })
                }
              />
            </label>
            <label>
              <span>Berakhir</span>
              <input
                type="datetime-local"
                value={material.availableUntil || ""}
                onChange={(e) =>
                  updateMaterial(material.id, {
                    availableUntil: e.target.value,
                  })
                }
              />
            </label>
            <label className="toggle-setting">
              <input
                type="checkbox"
                checked={Boolean(material.certificateEnabled)}
                onChange={(e) =>
                  updateMaterial(material.id, {
                    certificateEnabled: e.target.checked,
                  })
                }
              />
              <span>Aktifkan sertifikat</span>
            </label>
            {material.certificateEnabled && (
              <>
                <label>
                  <span>Nilai Minimum Sertifikat</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={material.passingScore ?? 75}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        passingScore: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  <span>Judul Sertifikat</span>
                  <input
                    value={
                      material.certificateTitle || "SERTIFIKAT PENYELESAIAN"
                    }
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        certificateTitle: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Nama Penerbit</span>
                  <input
                    value={material.certificateIssuer || "JeniusPPT.online"}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        certificateIssuer: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Nama Penandatangan</span>
                  <input
                    value={material.certificateSigner || "Guru / Pengajar"}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        certificateSigner: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Deskripsi Sertifikat</span>
                  <input
                    value={
                      material.certificateDescription ||
                      "Telah menyelesaikan materi dan evaluasi pembelajaran"
                    }
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        certificateDescription: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Warna Sertifikat</span>
                  <input
                    type="color"
                    value={material.certificateColor || "#f97316"}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        certificateColor: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Pesan Nilai di Atas Minimum</span>
                  <input
                    value={
                      material.successMessage ||
                      "Lulus dengan hasil sangat baik"
                    }
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        successMessage: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Pesan Nilai Pas Minimum</span>
                  <input
                    value={
                      material.equalMessage || "Lulus sesuai nilai minimum"
                    }
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        equalMessage: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Pesan Nilai di Bawah Minimum</span>
                  <input
                    value={
                      material.failMessage || "Belum memenuhi nilai minimum"
                    }
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        failMessage: e.target.value,
                      })
                    }
                  />
                </label>
              </>
            )}
          </div>
        </div>
        {material.certificateEnabled && <CertificateStudio material={material} updateMaterial={updateMaterial}/>} 
        </div>
      )}

      {tab === "Slide" && (
        <PPTEditor material={material} updateMaterial={updateMaterial} />
      )}

      {tab === "Quiz" && (
        <QuizBuilder material={material} updateMaterial={updateMaterial} />
      )}

      {tab === "Media" && (
        <MediaManager material={material} updateMaterial={updateMaterial} />
      )}

      {tab === "Preview" && <PreviewPlayer material={material} teacher />}

      {tab === "Publish" && (
        <div className="publish-card">
          <h1>Bagikan</h1>
          <p>QR dan link siap dipakai.</p>

          <div className="share-box">/play/{material.shareCode}</div>

          <a
            className="primary-button"
            target="_blank"
            href={`/play/${material.shareCode}`}
          >
            <Eye size={17} />
            Preview
          </a>

          <button className="primary-button" onClick={publish} disabled={busy}>
            <Share2 size={17} />
            {busy ? publishStatus || "Publishing..." : "QR & Link"}
          </button>
        </div>
      )}
    </section>
  );
}
