export default function Dashboard({ setPage }) {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Selamat datang, Guru Ekonomi! 👋</h1>
          <p>Kelola materi, pantau aktivitas siswa, dan buat PPT interaktif.</p>
        </div>
        <button className="new-btn" onClick={() => setPage("manual")}>+ Materi Baru</button>
      </header>

      <section className="stats">
        <div className="stat"><span>📚</span><p>Total Materi</p><h2>24</h2></div>
        <div className="stat"><span>👨‍🎓</span><p>Siswa Aktif</p><h2>132</h2></div>
        <div className="stat"><span>📝</span><p>Kuis Dibuat</p><h2>56</h2></div>
        <div className="stat"><span>📊</span><p>Rata-rata Nilai</p><h2>86.4</h2></div>
      </section>

      <section className="panel">
        <h3>Aksi Cepat</h3>
        <div className="actions">
          <button className="action purple" onClick={() => setPage("manual")}>
            <b>Buat Manual</b>
            <small>CRUD slide, copy, preview, publish</small>
          </button>
          <button className="action blue" onClick={() => setPage("code")}>
            <b>Buat dari Kode</b>
            <small>Tempel JSON jadi slide dan kuis</small>
          </button>
          <button className="action green" onClick={() => setPage("activity")}>
            <b>Aktivitas Siswa</b>
            <small>Lihat siapa saja yang sudah masuk</small>
          </button>
        </div>
      </section>
    </>
  );
}
