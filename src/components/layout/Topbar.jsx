import React from "react";
import {
  Bell,
  CheckCheck,
  Code2,
  Menu,
  Monitor,
  Moon,
  Paintbrush,
  Palette,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
export default function Topbar({
  title,
  user,
  onCreate,
  onImportCode,
  onMenu,
  notifications = [],
  markAllRead,
  theme,
  onTheme,
  accent,
  onAccent,
}) {
  const [open, setOpen] = React.useState(false);
  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const accents = [
    ["#ff641e", "Oranye"], ["#2563eb", "Biru"], ["#0f766e", "Toska"],
    ["#16a34a", "Hijau"], ["#ca8a04", "Emas"], ["#ea580c", "Jingga"],
    ["#7c3aed", "Ungu"], ["#db2777", "Merah muda"], ["#dc2626", "Merah"], ["#475569", "Abu-abu"],
  ];
  const unread = notifications.filter((item) => !item.read).length;
  return (
    <header className="topbar">
      <button className="hamburger-button" onClick={onMenu}>
        <Menu size={21} />
      </button>
      <div className="topbar-title">
        <span>JeniusPPT</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-search">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari materi, peserta, atau menu..." />
        {query ? <button onClick={() => setQuery("")} aria-label="Hapus pencarian"><X size={15}/></button> : <kbd>Ctrl K</kbd>}
      </div>
      <div className="notification-wrap">
        <button
          className="icon-button"
          onClick={() => setOpen(!open)}
          title="Notifikasi"
        >
          <Bell size={18} />
          {unread > 0 && <i>{unread > 9 ? "9+" : unread}</i>}
        </button>
        {open && (
          <div className="notification-panel">
            <header>
              <div>
                <b>Notifikasi</b>
                <small>{unread} belum dibaca</small>
              </div>
              <button onClick={() => setOpen(false)}>
                <X size={17} />
              </button>
            </header>
            <button className="mark-read" onClick={markAllRead}>
              <CheckCheck size={15} />
              Tandai semua dibaca
            </button>
            <div>
              {notifications.length ? (
                notifications.slice(0, 20).map((item) => (
                  <article key={item.id} className={item.read ? "" : "unread"}>
                    <span>{item.icon || "🔔"}</span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.message}</p>
                      <small>
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="notification-empty">Belum ada notifikasi.</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="display-controls">
        <button
          className="icon-button"
          onClick={() => setCustomizeOpen(true)}
          title="Kustomisasi tampilan"
        >
          <Palette size={18} />
        </button>
      </div>
      <button className="secondary-button topbar-code" onClick={onImportCode}>
        <Code2 size={18} />
        Buat dari Kode
      </button>
      <button className="primary-button topbar-create" onClick={onCreate}>
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
      {customizeOpen && (
        <div className="customize-backdrop" onMouseDown={() => setCustomizeOpen(false)}>
          <aside className="customize-panel" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><span>Tampilan</span><h2>Kustomisasi JeniusPPT</h2></div>
              <button onClick={() => setCustomizeOpen(false)} aria-label="Tutup"><X size={20} /></button>
            </header>
            <section className="customize-preview" aria-label="Pratinjau tampilan">
              <div className="preview-window">
                <div className="preview-tabbar"><span /><span /><span /></div>
                <div className="preview-toolbar"><i>‹</i><i>›</i><i>↻</i><b /></div>
                <div className="preview-page">
                  <span className="preview-brand">JP</span>
                  <div><i /><i /><i /></div>
                </div>
              </div>
            </section>
            <p className="customize-preview-label">Pratinjau JeniusPPT</p>
            <button
              className="customize-theme-button"
              onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
            >
              <Paintbrush size={18} /> Ganti tema
            </button>
            <div className="theme-segment" role="group" aria-label="Pilihan tema">
              <button className={theme === "light" ? "active" : ""} onClick={() => onTheme("light")}><Sun size={18} />Terang</button>
              <button className={theme === "dark" ? "active" : ""} onClick={() => onTheme("dark")}><Moon size={18} />Gelap</button>
              <button className={theme === "device" ? "active" : ""} onClick={() => onTheme("device")}><Monitor size={18} />Perangkat</button>
            </div>
            <div className="accent-heading"><b>Warna aksen</b><small>Diterapkan pada tombol dan bagian aktif</small></div>
            <div className="accent-grid">
              {accents.map(([color, name]) => (
                <button key={color} className={accent === color ? "active" : ""} onClick={() => onAccent(color)} title={name} aria-label={name}>
                  <span style={{ "--swatch": color }} />
                  {accent === color && <i>✓</i>}
                </button>
              ))}
            </div>
            <button className="customize-reset" onClick={() => { onTheme("light"); onAccent("#ff641e"); }}>Kembalikan ke bawaan</button>
          </aside>
        </div>
      )}
    </header>
  );
}
