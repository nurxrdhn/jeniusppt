import { Bell, Code2, Plus, Search } from "lucide-react";

export default function Topbar({ title, user, onCreate, onImportCode, notify }) {
  return (
    <header className="topbar">
      <div>
        <span>JeniusPPT</span>
        <h1>{title}</h1>
      </div>

      <div className="topbar-search">
        <Search size={17} />
        <input placeholder="Cari..." />
      </div>

      <button
        className="icon-button"
        onClick={() => notify?.("Belum ada notifikasi baru.")}
        title="Notifikasi"
      >
        <Bell size={18} />
      </button>

      <button className="secondary-button" onClick={onImportCode}>
        <Code2 size={18} />
        Buat dari Kode
      </button>

      <button className="primary-button" onClick={onCreate}>
        <Plus size={18} />
        Buat Materi
      </button>

      <div className="top-profile">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.name} />
        ) : (
          <div>{user?.name?.[0] || "G"}</div>
        )}
      </div>
    </header>
  );
}
