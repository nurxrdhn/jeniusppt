export default function Sidebar({ page, setPage }) {
  const menu = [
    ["dashboard", "🏠 Dashboard"],
    ["materials", "📚 Semua Materi"],
    ["manual", "➕ Buat Manual"],
    ["code", "📋 Buat dari Kode"],
    ["activity", "👨‍🎓 Aktivitas Siswa"],
    ["settings", "⚙️ Pengaturan"],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">⚡ JeniusPPT</div>
      <nav>
        {menu.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? "active" : ""}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
