import {
  ArrowUpDown,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  FolderOpen,
  Home,
  LogOut,
  MessageSquareHeart,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import JeniusMark from "../ui/JeniusMark";
const menu = [
  ["dashboard", Home, "Dashboard"],
  ["workspace", FolderOpen, "Workspace"],
  ["materials", BookOpen, "Materi"],
  ["files", ArrowUpDown, "Impor & Ekspor"],
  ["participants", Users, "Peserta"],
  ["analytics", BarChart3, "Analitik"],
  ["trash", Trash2, "Tempat Sampah"],
  ["question_bank", BookOpenCheck, "Bank Soal"],
  ["guide", BookOpen, "Panduan & Tutorial"],
  ["feedback", MessageSquareHeart, "Saran & Kritik"],
  ["settings", Settings, "Pengaturan"],
];
export default function Sidebar({
  page,
  setPage,
  user,
  onLogout,
  open,
  onClose,
}) {
  function navigate(key) {
    setPage(key);
    if (window.innerWidth <= 860) onClose?.();
  }
  return (
    <>
      <button
        className={`sidebar-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
        aria-label="Tutup menu"
      />
      <aside className={`sidebar ${open ? "sidebar-open" : "sidebar-closed"}`}>
        <button className="sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="sidebar-brand logo-only">
          <div className="brand-icon-shell">
            <JeniusMark className="brand-logo" />
          </div>
        </div>
        <nav className="side-menu">
          {menu.map(([key, Icon, label]) => (
            <button
              key={key}
              data-tour={`menu-${key}`}
              className={page === key ? "active" : ""}
              onClick={() => navigate(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.name} />
          ) : (
            <div className="avatar-letter">{user?.name?.[0] || "G"}</div>
          )}
          <div>
            <b>{user?.name || "Guru"}</b>
            <p>{user?.email || "guru@jeniusppt.online"}</p>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          Keluar
        </button>
      </aside>
    </>
  );
}
