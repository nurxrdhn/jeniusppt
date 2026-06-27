import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">⚡ JeniusPPT</div>

        <nav>
          <button className="active">🏠 Dashboard</button>
          <button>📚 Semua Materi</button>
          <button>➕ Buat Manual</button>
          <button>📋 Buat dari Kode</button>
          <button>👨‍🎓 Aktivitas Siswa</button>
          <button>📊 Nilai</button>
          <button>⚙️ Pengaturan</button>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>Selamat datang, Guru Ekonomi! 👋</h1>
          <button className="new-btn">+ Materi Baru</button>
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
            <button className="action purple">
              <b>Buat Manual</b>
              <small>CRUD slide, copy, preview, publish</small>
            </button>

            <button className="action blue">
              <b>Buat dari Kode</b>
              <small>Tempel JSON jadi slide dan kuis</small>
            </button>

            <button className="action green">
              <b>Aktivitas Siswa</b>
              <small>Lihat siapa saja yang sudah masuk</small>
            </button>
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <h3>Materi Terbaru</h3>
            <div className="item">📈 Inflasi dan Deflasi <span>Published</span></div>
            <div className="item">🏦 Sistem Perbankan Indonesia <span>Published</span></div>
            <div className="item">📊 Permintaan dan Penawaran <span>Draft</span></div>
          </div>

          <div className="panel">
            <h3>Aktivitas Hari Ini</h3>
            <div className="item">Budi masuk materi Inflasi <span>08.15</span></div>
            <div className="item">Rina selesai kuis <span>Nilai 92</span></div>
            <div className="item">Andi membuka slide 3 <span>09.10</span></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
