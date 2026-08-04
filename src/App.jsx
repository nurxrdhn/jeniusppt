import { useEffect, useState } from "react";
import SolidSelect from "./components/ui/SolidSelect";

import {
  Archive,
  Bot,
  BookOpen,
  Copy,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Heart,
  Lightbulb,
  MessageSquareHeart,
  Send,
  Share2,
  Star,
  Trash2,
  Users,
  WandSparkles,
} from "lucide-react";

import OpeningLogin from "./components/auth/OpeningLogin";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import StudentPlayer from "./components/student/StudentPlayer";
import MaterialBuilder from "./components/materials/MaterialBuilder";
import CodeImportModal from "./components/materials/CodeImportModal";
import ShareModal from "./components/share/ShareModal";
import FileCenter from "./components/files/FileCenter";
import { JeniusDialog, JeniusToast } from "./components/ui/JeniusNotice";
import ProductTour from "./components/ui/ProductTour";
import ProductivityHub from "./components/dashboard/ProductivityHub";
import { translateVisiblePage } from "./services/translationService";
import { auth } from "./firebase/config";
import {
  SubscriptionPage,
  CreatorMarketplace,
  TemplateRecommendations,
  TrashPage,
} from "./components/dashboard/FeaturePages";

import { SLIDE_SIZES } from "./utils/slideSizes";
import { publishMaterialToFirestore } from "./services/materialService";
import { subscribeParticipants, deleteParticipantRecords } from "./services/studentService";
import {
  exportParticipantsExcel,
  exportParticipantsPdf,
} from "./utils/participantReport";

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
        value: "#ff641e",
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
  const savedTheme = localStorage.getItem("jeniusppt-theme") || "light";
  document.documentElement.dataset.theme = savedTheme === "device"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : savedTheme;
  document.documentElement.dataset.view = "auto";
  if (window.location.pathname.startsWith("/play/")) {
    return <StudentPlayer />;
  }

  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [showTour, setShowTour] = useState(
    () => !localStorage.getItem("jeniusppt-tour-done"),
  );
  const [editingId, setEditingId] = useState(null);
  const [shareMaterial, setShareMaterial] = useState(null);
  const [showCodeImport, setShowCodeImport] = useState(false);
  const [participantMaterialFilter, setParticipantMaterialFilter] =
    useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("jeniusppt-theme") || "light",
  );
  const [viewMode] = useState("auto");
  const [accent, setAccent] = useState(
    () => localStorage.getItem("jeniusppt-accent") || "#ff641e",
  );

  useEffect(() => {
    localStorage.setItem("jeniusppt-theme", theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      document.documentElement.dataset.theme = theme === "device"
        ? (media.matches ? "dark" : "light")
        : theme;
    };
    applyTheme();
    media.addEventListener?.("change", applyTheme);
    return () => media.removeEventListener?.("change", applyTheme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("jeniusppt-accent", accent);
    const root = document.documentElement.style;
    root.setProperty("--fresh-orange", accent);
    root.setProperty("--accent", accent);
    root.setProperty("--fresh-orange-dark", `color-mix(in srgb, ${accent} 78%, #111827)`);
    root.setProperty("--fresh-orange-light", `color-mix(in srgb, ${accent} 68%, white)`);
    root.setProperty("--fresh-peach", `color-mix(in srgb, ${accent} 12%, white)`);
    root.setProperty("--fresh-line", `color-mix(in srgb, ${accent} 23%, transparent)`);
    root.setProperty("--fresh-glow", `color-mix(in srgb, ${accent} 25%, transparent)`);
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) {
      const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="${accent}"/><text x="32" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="white">JP</text></svg>`;
      icon.href = `data:image/svg+xml,${encodeURIComponent(favicon)}`;
    }
  }, [accent]);
  useEffect(() => {
    localStorage.removeItem("jeniusppt-view");
    document.documentElement.dataset.view = viewMode;
    setSidebarOpen(window.innerWidth > 860);
  }, [viewMode]);

  useEffect(() => {
    const syncDevice = () => setSidebarOpen(window.innerWidth > 860);
    window.addEventListener("resize", syncDevice);
    window.addEventListener("orientationchange", syncDevice);
    return () => {
      window.removeEventListener("resize", syncDevice);
      window.removeEventListener("orientationchange", syncDevice);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const data = { ...state, participants: [] };
        const serialized = JSON.stringify(data);
        if (serialized.length > 1500000) return;
        const history = JSON.parse(
          localStorage.getItem("jeniusppt-version-history") || "[]",
        );
        if (history[0]?.serialized === serialized) return;
        localStorage.setItem(
          "jeniusppt-version-history",
          JSON.stringify(
            [
              {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                label: "Simpan otomatis",
                data,
                serialized,
              },
              ...history,
            ].slice(0, 8),
          ),
        );
      } catch {
        // Penyimpanan utama tetap berjalan jika ruang riwayat browser penuh.
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const expired = (state.trash || []).filter(
      (item) =>
        Date.now() - new Date(item.deletedAt).getTime() >= 30 * 86400000,
    );
    const warning = (state.trash || []).filter((item) => {
      const age = Date.now() - new Date(item.deletedAt).getTime();
      return age >= 29 * 86400000 && age < 30 * 86400000;
    });
    if (expired.length)
      setState((old) => ({
        ...old,
        trash: old.trash.filter(
          (item) => !expired.some((expiredItem) => expiredItem.id === item.id),
        ),
      }));
    warning.forEach((item) =>
      addNotification(
        "Materi akan dihapus besok",
        `${item.title} akan dihapus permanen dalam 1 hari.`,
        "⚠️",
        `trash-warning-${item.id}`,
      ),
    );
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeParticipants(
      (participants) => setState((old) => ({ ...old, participants })),
      (error) => {
        console.error("Gagal membaca peserta:", error);
        notify("Data peserta belum dapat dibaca dari Firebase.", "error");
      },
    );
  }, [user]);

  const editingMaterial = state.materials.find((m) => m.id === editingId);

  function notify(message, type = "success", title) {
    const notice = {
      id: crypto.randomUUID(),
      title:
        title ||
        (type === "error"
          ? "Belum berhasil"
          : type === "warning"
            ? "Perlu diperhatikan"
            : "Berhasil"),
      message,
      type,
    };
    setToast(notice);
    setTimeout(
      () => setToast((current) => (current?.id === notice.id ? null : current)),
      3600,
    );
  }

  function addNotification(title, message, icon = "🔔", uniqueKey) {
    setState((old) => {
      if (
        uniqueKey &&
        old.notifications?.some((item) => item.uniqueKey === uniqueKey)
      )
        return old;
      return {
        ...old,
        notifications: [
          {
            id: crypto.randomUUID(),
            title,
            message,
            icon,
            read: false,
            createdAt: new Date().toISOString(),
            uniqueKey,
          },
          ...(old.notifications || []),
        ].slice(0, 100),
      };
    });
  }

  function updateMaterial(id, patch) {
    setState((old) => ({
      ...old,
      materials: old.materials.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
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
    addNotification("Materi baru dibuat", `${item.title} siap diedit.`, "📝");
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
    addNotification(
      "Materi berhasil diimpor",
      `${item.title} dibuat dari kode atau dokumen.`,
      "📥",
    );
  }

  async function publishMaterial(material) {
    const updated = {
      ...material,
      status: "Published",
      publishedAtLocal: new Date().toISOString(),
    };

    localStorage.setItem(
      `jeniusppt_package_${updated.shareCode}`,
      JSON.stringify(updated),
    );

    updateMaterial(updated.id, {
      status: "Published",
      publishedAtLocal: updated.publishedAtLocal,
    });

    try {
      const online = await publishMaterialToFirestore(updated);
      updateMaterial(updated.id, {
        ...online,
        status: "Published",
        publishedAtLocal: updated.publishedAtLocal,
      });
      notify("Materi berhasil dipublish.");
      addNotification(
        "Materi dipublikasikan",
        `${updated.title} sudah dapat diakses siswa.`,
        "🚀",
      );
    } catch (err) {
      console.error(err);
      notify(
        "Link lokal siap. Firebase gagal, cek koneksi atau konfigurasi.",
        "warning",
      );
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
      const online = await publishMaterialToFirestore(instant);
      localStorage.setItem(
        `jeniusppt_package_${instant.shareCode}`,
        JSON.stringify(online),
      );
      updateMaterial(instant.id, {
        ...online,
        status: "Published",
        publishedAtLocal: instant.publishedAtLocal,
      });
      setShareMaterial(online);
      notify("QR dan link siswa siap dibuka di HP.");
      addNotification(
        "Tautan dibagikan",
        `QR dan tautan ${instant.title} siap digunakan.`,
        "🔗",
      );
      return online;
    } catch (err) {
      console.error(err);
      notify("Publikasi daring gagal. Link belum dapat dibuka di HP.", "error");
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
    addNotification(
      "Materi diduplikasi",
      `${copied.title} berhasil dibuat.`,
      "📑",
    );
  }

  function deleteMaterial(material) {
    const remove = (permanent) => {
      setState((old) => ({
        ...old,
        materials: old.materials.filter((m) => m.id !== material.id),
        trash: permanent
          ? old.trash
          : [
              { ...material, deletedAt: new Date().toISOString() },
              ...(old.trash || []),
            ],
      }));
      notify(
        permanent
          ? "Materi dihapus permanen."
          : "Materi disimpan di Tempat Sampah selama 30 hari.",
        permanent ? "warning" : "success",
      );
      addNotification(
        permanent ? "Materi dihapus permanen" : "Materi masuk Tempat Sampah",
        material.title,
        permanent ? "🗑️" : "♻️",
      );
    };
    setDialog({
      title: "Hapus materi ini?",
      message: `Pilih cara menghapus “${material.title}”. Materi di Tempat Sampah masih dapat dipulihkan selama 30 hari.`,
      icon: "trash",
      danger: true,
      confirmLabel: "Hapus permanen",
      secondaryLabel: "Ke Tempat Sampah",
      onConfirm: () => remove(true),
      onSecondary: () => remove(false),
    });
  }
  function restoreMaterial(material) {
    setDialog({
      title: "Pulihkan materi?",
      message: `“${material.title}” akan dikembalikan ke daftar Materi.`,
      confirmLabel: "Pulihkan",
      onConfirm: () => {
        const { deletedAt, ...restored } = material;
        setState((old) => ({
          ...old,
          trash: old.trash.filter((item) => item.id !== material.id),
          materials: [restored, ...old.materials],
        }));
        notify("Materi berhasil dikembalikan ke daftar.");
        addNotification("Materi dipulihkan", material.title, "✅");
      },
    });
  }
  function permanentDelete(material) {
    setDialog({
      title: "Hapus selamanya?",
      message: `“${material.title}” akan dihapus permanen dan tidak dapat dipulihkan.`,
      icon: "trash",
      danger: true,
      confirmLabel: "Ya, hapus",
      onConfirm: () => {
        setState((old) => ({
          ...old,
          trash: old.trash.filter((item) => item.id !== material.id),
        }));
        notify("Materi dihapus permanen.", "warning");
        addNotification("Materi dihapus permanen", material.title, "🗑️");
      },
    });
  }
  function useEducationTemplate(template) {
    const background = template.colors[0];
    const item = {
      ...blankMaterial(),
      title: template.title,
      subject: template.subject,
      className: template.level,
      status: "Draft",
      slides: [
        {
          title: template.title,
          body: template.desc,
          background: { type: "css", value: background },
          titleColor: "#ffffff",
          bodyColor: "#f8fafc",
          transition: "morph",
          duration: 900,
        },
        {
          title: "Tujuan Pembelajaran",
          body: "Tuliskan tujuan pembelajaran yang ingin dicapai.",
          background: { type: "css", value: background },
          titleColor: "#ffffff",
          bodyColor: "#f8fafc",
          transition: "morph",
          duration: 900,
        },
        {
          title: "Materi Utama",
          body: "Kembangkan isi materi sesuai kebutuhan kelas.",
          background: { type: "css", value: background },
          titleColor: "#ffffff",
          bodyColor: "#f8fafc",
          transition: "morph",
          duration: 900,
        },
      ],
    };
    setState((old) => ({ ...old, materials: [item, ...old.materials] }));
    setEditingId(item.id);
    addNotification(
      "Template digunakan",
      `${template.title} ditambahkan ke materi.`,
      "🎨",
    );
  }

  if (!user) {
    return <OpeningLogin onLogin={setUser} />;
  }

  if (editingMaterial) {
    return (
      <div className={`app-shell theme-${theme} device-${viewMode}`}>
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
          <JeniusToast notice={toast} onClose={() => setToast(null)} />
          <JeniusDialog dialog={dialog} onClose={() => setDialog(null)} />

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
              : page === "feedback"
                ? "Saran & Kritik"
                : page === "productivity"
                ? "Pusat Produktivitas"
                : page === "question_bank"
                  ? "Bank Soal"
                  : page === "creator_market"
                    ? "Galeri Kreator"
              : page === "trash"
                ? "Tempat Sampah"
                : "JeniusPPT";

  return (
    <div className={`app-shell theme-${theme} device-${viewMode}`}>
      <JeniusToast notice={toast} onClose={() => setToast(null)} />
      <JeniusDialog dialog={dialog} onClose={() => setDialog(null)} />

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
          markAllRead={() =>
            setState((old) => ({
              ...old,
              notifications: (old.notifications || []).map((item) => ({
                ...item,
                read: true,
              })),
            }))
          }
          theme={theme}
          onTheme={setTheme}
          accent={accent}
          onAccent={setAccent}
        />

        {page === "dashboard" && (
          <Dashboard
            state={state}
            onCreate={createMaterial}
            onImportCode={() => setShowCodeImport(true)}
            user={user}
            onUseTemplate={useEducationTemplate}
            onNavigate={setPage}
          />
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

        {page === "participants" && (
          <Participants
            state={state}
            initialMaterial={participantMaterialFilter}
            clearInitialMaterial={() => setParticipantMaterialFilter("")}
            notify={notify}
            deleteRecords={deleteParticipantRecords}
          />
        )}

        {page === "files" && (
          <FileCenter
            materials={state.materials}
            onImport={createMaterialFromCode}
            notify={notify}
          />
        )}

        {page === "workspace" && (
          <Workspace state={state} editMaterial={(m) => setEditingId(m.id)} deleteMaterial={deleteMaterial} />
        )}

        {page === "analytics" && <Analytics state={state} />}

        {page === "ai" && (
          <AIAssistant onGenerated={createMaterialFromCode} notify={notify} />
        )}

        {page === "feedback" && (
          <FeedbackPage user={user} notify={notify} />
        )}

        {page === "productivity" && (
          <ProductivityHub
            state={state}
            setState={setState}
            user={user}
            notify={notify}
            onNavigate={setPage}
          />
        )}

        {page === "question_bank" && (
          <ProductivityHub state={state} setState={setState} user={user} notify={notify} onNavigate={setPage} initialActive="questions" />
        )}

        {page === "creator_market" && <CreatorMarketplace user={user} notify={notify} />}

        {page === "settings" && (
          <SettingsPage
            user={user}
            notify={notify}
            notifications={state.notifications || []}
            setNotifications={(notifications) =>
              setState((old) => ({ ...old, notifications }))
            }
            restartTour={() => setShowTour(true)}
          />
        )}

        {page === "subscription" && (
          <SubscriptionPage
            activePlan={state.activePlan}
            onChoose={(plan) => {
              setState((old) => ({ ...old, activePlan: plan.name }));
              notify(`Paket ${plan.name} dipilih.`);
              addNotification(
                "Paket langganan diperbarui",
                `${plan.name} • Rp${plan.price}`,
                "👑",
              );
            }}
          />
        )}

        {page === "trash" && (
          <TrashPage
            items={state.trash || []}
            onRestore={restoreMaterial}
            onDelete={permanentDelete}
          />
        )}

        {![
          "dashboard",
          "materials",
          "participants",
          "files",
          "workspace",
          "analytics",
          "ai",
          "feedback",
          "productivity",
          "settings",
          "subscription",
          "trash",
        ].includes(page) && <ComingSoon title={title} />}
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
      {showTour && (
        <ProductTour
          onDone={() => {
            localStorage.setItem("jeniusppt-tour-done", "1");
            setShowTour(false);
          }}
        />
      )}
    </div>
  );
}

function Dashboard({
  state,
  onCreate,
  onImportCode,
  user,
  onUseTemplate,
  onNavigate,
}) {
  const published = state.materials.filter(
    (m) => m.status === "Published",
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
        <Stat
          onClick={() => onNavigate("materials")}
          icon={<BookOpen />}
          label="Materi"
          value={state.materials.length}
        />
        <Stat
          onClick={() => onNavigate("materials")}
          icon={<Archive />}
          label="Dipublikasikan"
          value={published}
        />
        <Stat
          onClick={() => onNavigate("participants")}
          icon={<Users />}
          label="Peserta"
          value={state.participants.length}
        />
        <Stat
          onClick={() => onNavigate("workspace")}
          icon={<FolderOpen />}
          label="Workspace"
          value="2"
        />
      </div>
      <button className="dashboard-ai" onClick={() => onNavigate("ai")}>
        <span>JP AI</span>
        <div>
          <b>Buat PPT dengan Jenius AI</b>
          <p>Susun materi, desain slide, dan kuis dari satu instruksi.</p>
        </div>
        <strong>Mulai →</strong>
      </button>

      <div className="feature-grid">
        <Feature
          title="Ukuran Fleksibel"
          desc="Tersedia format 16:9, 4:3, A4, dan portrait."
        />
        <Feature
          title="Pratinjau Langsung"
          desc="Periksa slide, soal, dan hasil sebelum dibagikan."
        />
        <Feature
          title="Bagikan dengan QR"
          desc="Siswa dapat masuk melalui QR maupun tautan."
        />
        <Feature
          title="Kuis Interaktif"
          desc="Dukung pilihan ganda serta benar atau salah."
        />
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
          <button className="primary-button" onClick={onCreate}>
            + Buat Materi
          </button>
          <button className="secondary-button" onClick={onImportCode}>
            &lt;/&gt; Buat dari Kode
          </button>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <h2>Belum ada materi</h2>
          <p>Buat manual atau generate dari kode.</p>
          <button className="primary-button" onClick={onCreate}>
            + Buat Materi
          </button>
          <button className="secondary-button" onClick={onImportCode}>
            &lt;/&gt; Buat dari Kode
          </button>
        </div>
      ) : (
        <div className="material-grid">
          {materials.map((m) => (
            <article className="material-card" key={m.id}>
              <span
                className={m.status === "Published" ? "badge success" : "badge"}
              >
                {m.status}
              </span>

              <h2>{m.title}</h2>
              <p>
                {m.subject} • {m.className}
              </p>

              <div className="material-meta">
                <span>{m.slides.length} Slide</span>
                <span>{m.questions.length} Soal</span>
                <span>
                  {
                    participants.filter(
                      (p) =>
                        (p.materialId === m.id ||
                          p.shareCode === m.shareCode) &&
                        p.status === "Selesai",
                    ).length
                  }{" "}
                  Peserta
                </span>
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

                <button
                  className="participants-button"
                  onClick={() => openParticipants(m)}
                >
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

function Participants({
  state,
  initialMaterial,
  clearInitialMaterial,
  notify,
  deleteRecords,
}) {
  const [search, setSearch] = useState("");
  const [material, setMaterial] = useState(initialMaterial || "");
  const [className, setClassName] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [scoreRange, setScoreRange] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (initialMaterial) setMaterial(initialMaterial);
  }, [initialMaterial]);

  const materialOptions = state.materials.map((m) => ({
    value: m.id || m.shareCode,
    label: m.title,
  }));
  const classes = [
    ...new Set(state.participants.map((p) => p.className).filter(Boolean)),
  ].sort();
  const filtered = state.participants.filter((p) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      !keyword ||
      [p.studentName, p.materialTitle, p.className].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(keyword),
      );
    const matchMaterial =
      !material || p.materialId === material || p.shareCode === material;
    const matchClass = !className || p.className === className;
    const matchGender = !gender || p.gender === gender;
    const matchStatus = !status || p.status === status;
    const score = Number(p.score);
    const matchScore =
      !scoreRange ||
      (scoreRange === "high" && score >= 80) ||
      (scoreRange === "medium" && score >= 60 && score < 80) ||
      (scoreRange === "low" && score < 60);
    return (
      matchSearch &&
      matchMaterial &&
      matchClass &&
      matchGender &&
      matchStatus &&
      matchScore
    );
  });
  const completed = filtered.filter((p) => p.status === "Selesai");
  const average = completed.length
    ? Math.round(
        completed.reduce((n, p) => n + Number(p.score || 0), 0) /
          completed.length,
      )
    : 0;
  const selectedMaterialName = materialOptions.find(
    (item) => item.value === material,
  )?.label;
  const reportTitle = selectedMaterialName
    ? `Materi: ${selectedMaterialName}`
    : "Semua Materi";
  const formatDate = (value) => {
    const date = value?.toDate?.();
    return date
      ? date.toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";
  };
  function reset() {
    setSearch("");
    setMaterial("");
    setClassName("");
    setGender("");
    setStatus("");
    setScoreRange("");
    clearInitialMaterial?.();
  }
  async function downloadReport(type) {
    try {
      if (type === "excel")
        await exportParticipantsExcel(filtered, reportTitle);
      else await exportParticipantsPdf(filtered, reportTitle);
    } catch (error) {
      notify(error.message || "Laporan gagal dibuat.", "error");
    }
  }
  async function removeSelected(items) {
    if (!items.length) return notify("Pilih riwayat yang ingin dihapus.", "warning");
    if (!window.confirm(`Hapus ${items.length} riwayat peserta? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteRecords(items);
      setSelectedRows([]);
      notify(`${items.length} riwayat peserta berhasil dihapus.`);
    } catch (error) {
      notify(error.message || "Riwayat peserta gagal dihapus.", "error");
    }
  }

  return (
    <section className="page participants-page">
      <div className="page-head participant-page-head">
        <div>
          <span className="eyebrow">Data Kelas</span>
          <h1>Peserta & Hasil</h1>
          <p>
            Pantau identitas, progres, dan nilai peserta dari seluruh materi.
          </p>
        </div>
        <div className="report-actions">
          <button className="participant-delete-selected" onClick={() => removeSelected(filtered.filter((item, index) => selectedRows.includes(item.id || `row-${index}`)))} disabled={!selectedRows.length}><Trash2 size={17}/>Hapus dipilih</button>
          <button className="participant-delete-all" onClick={() => removeSelected(filtered)} disabled={!filtered.length}><Trash2 size={17}/>Hapus semua</button>
          <button onClick={() => downloadReport("excel")}>
            <FileSpreadsheet size={17} />
            Export Excel
          </button>
          <button onClick={() => downloadReport("pdf")}>
            <FileText size={17} />
            Export PDF
          </button>
        </div>
      </div>
      <div className="participant-summary">
        <div>
          <span>Total Data</span>
          <b>{filtered.length}</b>
        </div>
        <div>
          <span>Sudah Selesai</span>
          <b>{completed.length}</b>
        </div>
        <div>
          <span>Sedang Mengerjakan</span>
          <b>{filtered.filter((p) => p.status === "Mengerjakan").length}</b>
        </div>
        <div>
          <span>Rata-rata Nilai</span>
          <b>{average}</b>
        </div>
      </div>
      <div className="participant-filters">
        <label className="filter-search">
          <span>Cari peserta</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nama, materi, atau kelas..."
          />
        </label>
        <label>
          <span>Materi</span>
          <SolidSelect
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="">Semua materi</option>
            {materialOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SolidSelect>
        </label>
        <label>
          <span>Kelas</span>
          <SolidSelect
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="">Semua kelas</option>
            {classes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SolidSelect>
        </label>
        <label>
          <span>Jenis Kelamin</span>
          <SolidSelect value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Semua</option>
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </SolidSelect>
        </label>
        <label>
          <span>Status</span>
          <SolidSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option>Mengerjakan</option>
            <option>Selesai</option>
          </SolidSelect>
        </label>
        <label>
          <span>Rentang Nilai</span>
          <SolidSelect
            value={scoreRange}
            onChange={(e) => setScoreRange(e.target.value)}
          >
            <option value="">Semua nilai</option>
            <option value="high">80–100</option>
            <option value="medium">60–79</option>
            <option value="low">Di bawah 60</option>
          </SolidSelect>
        </label>
        <button className="reset-filter" onClick={reset}>
          Reset Filter
        </button>
      </div>
      <div className="data-panel participant-table">
        <div className="participant-table-head">
          <label className="participant-check"><input type="checkbox" checked={filtered.length > 0 && selectedRows.length === filtered.length} onChange={(event) => setSelectedRows(event.target.checked ? filtered.map((item,index) => item.id || `row-${index}`) : [])}/></label>
          <b>Peserta</b>
          <b>Kelas</b>
          <b>Materi</b>
          <b>Status</b>
          <b>Hasil</b>
          <b>Waktu</b>
        </div>
        {filtered.length ? (
          filtered.map((p, i) => (
            <div className="participant-table-row" key={p.id || i}>
              <label className="participant-check"><input type="checkbox" checked={selectedRows.includes(p.id || `row-${i}`)} onChange={(event) => setSelectedRows((old) => event.target.checked ? [...old, p.id || `row-${i}`] : old.filter((id) => id !== (p.id || `row-${i}`)))}/></label>
              <span className="participant-name">
                <i>{(p.studentName || "S")[0].toUpperCase()}</i>
                <span>
                  <b>{p.studentName || "Siswa"}</b>
                  <small>{p.gender || "-"}</small>
                </span>
              </span>
              <span>{p.className || "-"}</span>
              <span>
                <b>{p.materialTitle || "-"}</b>
                <small>{p.shareCode || ""}</small>
              </span>
              <span>
                <em
                  className={
                    p.status === "Selesai" ? "status-done" : "status-progress"
                  }
                >
                  {p.status}
                </em>
              </span>
              <span>
                {p.status === "Selesai" ? (
                  <>
                    <b className="score-value">{p.score}</b>
                    <small>
                      {p.correct} benar • {p.wrong} salah
                    </small>
                  </>
                ) : (
                  <small>Belum selesai</small>
                )}
              </span>
              <span>
                <small>{formatDate(p.activityAt)}</small>
              </span>
            </div>
          ))
        ) : (
          <div className="empty-inline">
            Belum ada data yang sesuai dengan filter.
          </div>
        )}
      </div>
    </section>
  );
}

function Workspace({ state, editMaterial, deleteMaterial }) {
  const drafts = state.materials.filter((m) => m.status !== "Published");
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Workspace</span>
        <h1>Ruang Kerja Guru</h1>
        <p>Lanjutkan draft dan susun materi terbaru.</p>
      </div>
      <div className="workspace-list">
        {drafts.length ? (
          drafts.map((m) => (
            <article
              key={m.id}
              className="workspace-item"
            >
              <button className="workspace-open" onClick={() => editMaterial(m)}><div>
                <b>{m.title}</b>
                <p>
                  {m.subject} • {m.className}
                </p>
              </div><span>{m.slides.length} slide →</span></button>
              <button className="workspace-delete" onClick={() => deleteMaterial(m)} title="Hapus draft"><Trash2 size={17}/><span>Hapus</span></button>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h2>Semua pekerjaan selesai</h2>
            <p>Belum ada draft materi.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Analytics({ state }) {
  const totalSlides = state.materials.reduce((n, m) => n + m.slides.length, 0),
    totalQuiz = state.materials.reduce((n, m) => n + m.questions.length, 0),
    published = state.materials.filter((m) => m.status === "Published").length;
  const data = [
      ["Materi", state.materials.length],
      ["Slide", totalSlides],
      ["Kuis", totalQuiz],
      ["Terbit", published],
    ],
    max = Math.max(...data.map(([, value]) => value), 1);
  const questionMap = new Map();
  state.participants
    .filter((item) => item.status === "Selesai")
    .forEach((participant) =>
      (participant.answers || []).forEach((answer, index) => {
        const key = `${participant.materialId || participant.shareCode}-${index}`;
        const old = questionMap.get(key) || {
          question: answer.question || `Soal ${index + 1}`,
          material: participant.materialTitle || "-",
          correct: 0,
          total: 0,
        };
        old.total += 1;
        if (answer.correct) old.correct += 1;
        questionMap.set(key, old);
      }),
    );
  const questionAnalytics = [...questionMap.values()]
    .map((item) => ({
      ...item,
      percentage: Math.round((item.correct / item.total) * 100),
    }))
    .sort((a, b) => a.percentage - b.percentage);
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Insight</span>
        <h1>Analitik Pembelajaran</h1>
        <p>Ringkasan konten dan tingkat keberhasilan setiap soal.</p>
      </div>
      <div className="analytics-card">
        {data.map(([label, value]) => (
          <div className="metric-row" key={label}>
            <span>{label}</span>
            <div>
              <i style={{ width: `${Math.max((value / max) * 100, 2)}%` }} />
            </div>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <div className="question-analytics">
        <div className="section-title">
          <div>
            <span className="eyebrow">Analitik Soal</span>
            <h2>Soal yang Perlu Dievaluasi</h2>
          </div>
          <p>Diurutkan dari persentase jawaban benar paling rendah.</p>
        </div>
        {questionAnalytics.length ? (
          <div className="question-analysis-list">
            {questionAnalytics.map((item, index) => (
              <article key={`${item.material}-${index}`}>
                <div>
                  <b>{item.question}</b>
                  <small>
                    {item.material} • {item.total} jawaban
                  </small>
                </div>
                <div className="question-rate">
                  <span>
                    <i style={{ width: `${item.percentage}%` }} />
                  </span>
                  <strong>{item.percentage}% benar</strong>
                </div>
                <em
                  className={
                    item.percentage < 50
                      ? "hard"
                      : item.percentage < 80
                        ? "medium"
                        : "easy"
                  }
                >
                  {item.percentage < 50
                    ? "Sulit"
                    : item.percentage < 80
                      ? "Sedang"
                      : "Mudah"}
                </em>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            Analitik muncul setelah peserta menyelesaikan kuis.
          </div>
        )}
      </div>
    </section>
  );
}

function AIAssistant({ onGenerated, notify }) {
  const [prompt, setPrompt] = useState("");
  const [level, setLevel] = useState("SMA");
  const [slideCount, setSlideCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const suggestions = [
    "Buat materi tata surya untuk kelas 6 SD",
    "Susun presentasi keamanan siber dasar",
    "Buat kuis interaktif tentang ekonomi kreatif",
  ];
  async function generate() {
    if (!prompt.trim())
      return notify("Tuliskan topik materi terlebih dahulu.", "warning");
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/generate-ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ prompt, level, slides: slideCount }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "AI gagal membuat materi.");
      onGenerated(data);
      notify("Materi AI berhasil dibuat dan siap diedit.");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="page ai-workspace">
      <aside className="ai-history"><button className="ai-new-chat"><WandSparkles size={18}/>Percakapan baru</button><div><small>TERBARU</small><button>Materi pembelajaran baru</button><button>Ide presentasi kelas</button></div><p>Riwayat tersimpan di perangkat ini.</p></aside>
      <main className="ai-chat">
        <header><span><Bot size={22}/></span><div><h1>Jenius AI</h1><p>Asisten presentasi dan pembelajaran</p></div><i>Gemini</i></header>
        <section className="ai-chat-body">
          <div className="ai-greeting"><span><WandSparkles size={28}/></span><h2>Apa yang ingin kamu buat hari ini?</h2><p>Ceritakan topik dan tujuan. Jenius AI akan menyusun materi, slide, dan kuis yang tetap dapat kamu edit.</p></div>
          <div className="ai-suggestions">{suggestions.map((item) => <button key={item} onClick={() => setPrompt(item)}><Lightbulb size={17}/>{item}</button>)}</div>
        </section>
        <footer className="ai-composer">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ketik instruksi presentasi..." />
          <div><span><SolidSelect value={level} onChange={(e) => setLevel(e.target.value)}>{["SD","SMP","SMA","SMK","D3","S1"].map((x) => <option key={x}>{x}</option>)}</SolidSelect><label>Slide <input type="number" min="4" max="20" value={slideCount} onChange={(e) => setSlideCount(e.target.value)}/></label></span><button onClick={generate} disabled={loading} aria-label="Kirim instruksi"><Send size={19}/>{loading ? "Menyusun..." : "Buat PPT"}</button></div>
        </footer>
      </main>
    </section>
  );
}

function SettingsPage({
  user,
  notify,
  notifications,
  setNotifications,
  restartTour,
}) {
  const [school, setSchool] = useState(
    localStorage.getItem("jeniusppt_school") || "",
  );
  const [language, setLanguage] = useState(
    localStorage.getItem("jeniusppt-language") || "id",
  );
  const [languages, setLanguages] = useState([
    ["id", "Bahasa Indonesia"],
    ["en", "English"],
    ["ar", "العربية"],
    ["zh-CN", "中文"],
    ["ja", "日本語"],
    ["ko", "한국어"],
    ["fr", "Français"],
    ["de", "Deutsch"],
    ["es", "Español"],
    ["pt", "Português"],
    ["hi", "हिन्दी"],
    ["th", "ไทย"],
    ["vi", "Tiếng Việt"],
    ["ru", "Русский"],
  ]);
  useEffect(() => {
    auth.currentUser
      ?.getIdToken()
      .then((token) =>
        fetch("/api/translate", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      )
      .then((response) => (response?.ok ? response.json() : null))
      .then(
        (data) =>
          data?.languages?.length &&
          setLanguages(
            data.languages.map((item) => [item.language, item.name]),
          ),
      )
      .catch(() => {});
  }, []);
  async function changeLanguage(value) {
    setLanguage(value);
    localStorage.setItem("jeniusppt-language", value);
    try {
      await translateVisiblePage(value);
      notify("Bahasa tampilan diperbarui.");
    } catch (error) {
      notify(error.message, "error");
    }
  }
  async function clearAppData() {
    if ("caches" in window)
      await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
    document.cookie
      .split(";")
      .forEach(
        (cookie) =>
          (document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)),
      );
    Object.keys(localStorage)
      .filter((key) => key.startsWith("jeniusppt"))
      .forEach((key) => localStorage.removeItem(key));
    notify(
      "Cache, cookie aplikasi, dan preferensi lokal dibersihkan.",
      "warning",
    );
  }
  function save() {
    localStorage.setItem("jeniusppt_school", school);
    notify("Pengaturan disimpan.");
  }
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Preferensi</span>
        <h1>Pengaturan</h1>
      </div>
      <div className="info-form">
        <label>Nama Guru</label>
        <input value={user?.name || ""} disabled />
        <label>Email</label>
        <input value={user?.email || ""} disabled />
        <label>Nama Sekolah</label>
        <input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="Masukkan nama sekolah"
        />
        <label>Bahasa Aplikasi</label>
        <SolidSelect
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          {languages.map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </SolidSelect>
        <button className="primary-button" onClick={save}>
          Simpan Pengaturan
        </button>
      </div>
      <div className="settings-history">
        <div className="section-title">
          <div>
            <span className="eyebrow">Aktivitas</span>
            <h2>Riwayat JeniusPPT</h2>
            <p>Notifikasi dan aktivitas penting akun.</p>
          </div>
          <button onClick={() => setNotifications([])}>Hapus Semua</button>
        </div>
        <div className="history-list">
          {notifications.length ? (
            notifications.map((item) => (
              <article key={item.id}>
                <span>{item.icon}</span>
                <div>
                  <b>{item.title}</b>
                  <p>{item.message}</p>
                  <small>
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </small>
                </div>
                <button
                  onClick={() =>
                    setNotifications(
                      notifications.filter((x) => x.id !== item.id),
                    )
                  }
                >
                  Hapus
                </button>
              </article>
            ))
          ) : (
            <p>Belum ada riwayat.</p>
          )}
        </div>
      </div>
      <div className="settings-tools">
        <button onClick={restartTour}>Mulai Ulang Tour Guide</button>
        <button className="danger" onClick={clearAppData}>
          Bersihkan Cookie & Cache Aplikasi
        </button>
      </div>
    </section>
  );
}

function FeedbackPage({ user, notify }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("Saran fitur");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const ratingLabels = [
    "",
    "Perlu banyak perbaikan",
    "Masih kurang",
    "Cukup baik",
    "Sangat baik",
    "Luar biasa",
  ];

  async function submitFeedback(event) {
    event.preventDefault();
    if (!rating) {
      notify("Pilih penilaian dari 1 sampai 5 terlebih dahulu.", "warning");
      return;
    }
    if (comment.trim().length < 10) {
      notify("Tuliskan komentar minimal 10 karakter.", "warning");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/jeniusppt@gmail.com",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _subject: `[JeniusPPT] ${category} • ${rating}/5`,
            _template: "table",
            nama: user?.name || "Pengguna JeniusPPT",
            email_pengirim: user?.email || "Tidak tersedia",
            kategori: category,
            penilaian: `${rating} dari 5 • ${ratingLabels[rating]}`,
            komentar: comment.trim(),
            waktu: new Date().toLocaleString("id-ID"),
          }),
        },
      );
      if (!response.ok) throw new Error("Pengiriman ditolak layanan email.");
      const result = await response.json();
      if (result.success === false || result.success === "false") {
        throw new Error(result.message || "Saran belum dapat dikirim.");
      }
      setRating(0);
      setComment("");
      setCategory("Saran fitur");
      try {
        const history = JSON.parse(
          localStorage.getItem("jeniusppt-feedback-history") || "[]",
        );
        localStorage.setItem(
          "jeniusppt-feedback-history",
          JSON.stringify(
            [
              {
                id: crypto.randomUUID(),
                rating,
                category,
                comment: comment.trim(),
                createdAt: new Date().toISOString(),
                sender: user?.email || "",
              },
              ...history,
            ].slice(0, 100),
          ),
        );
      } catch {
        // Pengiriman email tetap dianggap berhasil jika riwayat lokal penuh.
      }
      notify("Terima kasih. Saran dan kritik sudah dikirim ke JeniusPPT.");
    } catch (error) {
      notify(
        error.message || "Saran belum dapat dikirim. Periksa koneksi internet.",
        "error",
      );
    } finally {
      setSending(false);
    }
  }

  const activeRating = hoveredRating || rating;

  return (
    <section className="page feedback-page">
      <div className="page-head">
        <span className="eyebrow">Bantu Kami Berkembang</span>
        <h1>Saran &amp; Kritik</h1>
        <p>
          Ceritakan pengalaman Anda agar JeniusPPT menjadi lebih nyaman,
          berguna, dan sesuai kebutuhan pembelajaran.
        </p>
      </div>

      <div className="feedback-layout">
        <aside className="feedback-intro">
          <div className="feedback-intro-icon">
            <MessageSquareHeart size={30} />
          </div>
          <span>Masukan Anda berarti</span>
          <h2>Kita bangun JeniusPPT bersama.</h2>
          <p>
            Setiap masukan akan dikirim langsung ke tim melalui
            jeniusppt@gmail.com.
          </p>
          <div className="feedback-promise">
            <Heart size={18} fill="currentColor" />
            <span>Terima kasih telah ikut menyempurnakan JeniusPPT.</span>
          </div>
        </aside>

        <form className="feedback-form" onSubmit={submitFeedback}>
          <div className="feedback-field">
            <label>Bagaimana pengalaman Anda?</label>
            <div
              className="rating-scale"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value <= activeRating ? "selected" : ""}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  aria-label={`Beri nilai ${value} dari 5`}
                  aria-pressed={rating === value}
                >
                  <Star size={25} fill="currentColor" />
                  <small>{value}</small>
                </button>
              ))}
            </div>
            <div className="rating-caption" aria-live="polite">
              {activeRating
                ? `${activeRating}/5 • ${ratingLabels[activeRating]}`
                : "Pilih nilai 1 sampai 5"}
            </div>
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-category">Jenis masukan</label>
            <SolidSelect
              id="feedback-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Saran fitur</option>
              <option>Kritik tampilan</option>
              <option>Laporan kendala</option>
              <option>Apresiasi</option>
              <option>Lainnya</option>
            </SolidSelect>
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-comment">Komentar</label>
            <textarea
              id="feedback-comment"
              rows="7"
              maxLength="1500"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Ceritakan bagian yang sudah baik atau yang perlu diperbaiki..."
            />
            <small className="character-count">
              {comment.length}/1500 karakter
            </small>
          </div>

          <div className="feedback-sender">
            <div>
              <span>Dikirim sebagai</span>
              <b>{user?.name || "Pengguna JeniusPPT"}</b>
              <small>{user?.email || "Email tidak tersedia"}</small>
            </div>
          </div>

          <button
            className="primary-button feedback-submit"
            type="submit"
            disabled={sending}
          >
            <Send size={18} />
            {sending ? "Mengirim..." : "Kirim Masukan"}
          </button>
        </form>
      </div>
    </section>
  );
}

function ComingSoon({ title }) {
  const texts = {
    Workspace: "Tempat ringkasan materi, draft, dan publish.",
    Analitik: "Ringkasan jumlah materi, slide, soal, dan publish.",
    AI: "Gunakan tombol Buat dari Kode untuk generate PPT dan kuis otomatis.",
    Setting: "Pengaturan akun dan workspace.",
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

function Stat({ icon, label, value, onClick }) {
  return (
    <button className="stat-card stat-link" onClick={onClick}>
      <div>{icon}</div>
      <p>{label}</p>
      <h2>{value}</h2>
    </button>
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
