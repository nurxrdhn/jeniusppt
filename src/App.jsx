import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>JeniusPPT</h2>
        <a>🏠 Dashboard</a>
        <a>📚 Semua Materi</a>
        <a>➕ Buat Manual</a>
        <a>📋 Buat dari Kode</a>
        <a>👨‍🎓 Aktivitas Siswa</a>
        <a>📊 Nilai</a>
      </aside>

      <main className="main">
        <h1>Dashboard Guru</h1>
        <p>Buat PPT interaktif dengan dua cara: manual atau dari kode.</p>

        <div className="cards">
          <div className="card">
            <h3>Buat Manual</h3>
            <p>Tambah, edit, hapus, copy, dan preview materi.</p>
            <button>Buat PPT Manual</button>
          </div>

          <div className="card">
            <h3>Buat dari Kode</h3>
            <p>Tempel kode JSON lalu otomatis jadi slide dan kuis.</p>
            <button>Tempel Kode Materi</button>
          </div>

          <div className="card">
            <h3>Aktivitas Siswa</h3>
            <p>Lihat siapa saja yang sudah masuk dan mengerjakan kuis.</p>
            <button>Lihat Aktivitas</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;