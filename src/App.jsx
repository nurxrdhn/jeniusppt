import "./App.css";

const stats = [
  ["Total Materi", "24", "📚", "+4 minggu ini"],
  ["Total Slide", "186", "🎞️", "+38 slide"],
  ["Kuis Dibuat", "56", "📝", "+7 kuis"],
  ["Peserta Masuk", "342", "👥", "+82 hari ini"],
];

const materials = [
  ["Inflasi dan Deflasi", "XI IPS", "8 slide", "6 kuis", "82 peserta", "Published"],
  ["Sistem Perbankan Indonesia", "XI IPS", "10 slide", "8 kuis", "64 peserta", "Published"],
  ["Permintaan dan Penawaran", "X IPS", "6 slide", "4 kuis", "0 peserta", "Draft"],
  ["Perdagangan Internasional", "XII IPS", "9 slide", "7 kuis", "47 peserta", "Published"],
];

const participants = [
  ["Budi Santoso", "Laki-laki", "XI IPS 1", "Inflasi", "75%", "-"],
  ["Rina Putri", "Perempuan", "XI IPS 2", "Inflasi", "100%", "92"],
  ["Andi Pratama", "Laki-laki", "X IPS 1", "Permintaan", "45%", "-"],
];

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">J</div>
          <div>
            <h2>JeniusPPT</h2>
            <p>Teacher Workspace</p>
          </div>
        </div>

        <nav className="menu">
          <button className="active">🏠 Dashboard</button>
          <button>📚 Semua Materi</button>
          <button>➕ Buat PPT Manual</button>
          <button>📋 Buat dari Kode</button>
          <button>📝 Bank Soal</button>
          <button>👥 Peserta Masuk</button>
          <button>📊 Nilai & Laporan</button>
          <button>🔗 Link Bagikan</button>
          <button>⚙️ Pengaturan</button>
        </nav>

        <div className="upgrade">
          <h3>JeniusPPT Pro</h3>
          <p>Kelola PPT, kuis, peserta, nilai, dan laporan dalam satu dashboard.</p>
          <button>Upgrade</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="hamburger">☰</button>

          <div className="search">
            <span>🔍</span>
            <input placeholder="Cari materi, peserta, kuis..." />
          </div>

          <div className="profile">
            <button className="notif">🔔</button>
            <div className="avatar">G</div>
            <div>
              <b>Guru Ekonomi</b>
              <p>Guru</p>
            </div>
          </div>
        </header>

        <section className="hero">
          <div>
            <span className="label">Dashboard Guru</span>
            <h1>Selamat datang, Guru 👋</h1>
            <p>Kelola PPT, kuis, link belajar, peserta masuk, dan nilai siswa dalam satu tempat.</p>
          </div>

          <div className="hero-actions">
            <button className="btn light">Export Laporan</button>
            <button className="btn primary">+ Buat Materi</button>
          </div>
        </section>

        <section className="stats">
          {stats.map(([title, value, icon, note]) => (
            <div className="stat" key={title}>
              <div className="stat-icon">{icon}</div>
              <p>{title}</p>
              <h2>{value}</h2>
              <span>{note}</span>
            </div>
          ))}
        </section>

        <section className="quick">
          <div className="section-title">
            <h2>Aksi Cepat</h2>
            <p>Pilih fitur utama untuk membuat dan membagikan materi.</p>
          </div>

          <div className="quick-grid">
            <button className="quick-card purple">
              <h3>Buat Manual</h3>
              <p>CRUD slide, copy, preview, publish.</p>
              <span>Mulai →</span>
            </button>
            <button className="quick-card blue">
              <h3>Buat dari Kode</h3>
              <p>Tempel JSON menjadi slide dan kuis.</p>
              <span>Generate →</span>
            </button>
            <button className="quick-card green">
              <h3>Peserta Masuk</h3>
              <p>Lihat siswa yang membuka link.</p>
              <span>Lihat →</span>
            </button>
            <button className="quick-card orange">
              <h3>Bagikan Link</h3>
              <p>Siswa isi nama, gender, kelas.</p>
              <span>Share →</span>
            </button>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel chart-panel">
            <div className="section-title row">
              <div>
                <h2>Aktivitas Peserta</h2>
                <p>Perkembangan peserta selama 7 hari terakhir.</p>
              </div>
              <button className="mini">7 Hari</button>
            </div>

            <div className="chart">
              <div className="bar h62"></div>
              <div className="bar h54"></div>
              <div className="bar h76"></div>
              <div className="bar h64"></div>
              <div className="bar h43"></div>
              <div className="bar h55"></div>
              <div className="bar h74"></div>
            </div>
            <div className="chart-labels">
              <span>18 Jun</span><span>19 Jun</span><span>20 Jun</span><span>21 Jun</span><span>22 Jun</span><span>23 Jun</span><span>24 Jun</span>
            </div>
          </div>

          <div className="panel">
            <div className="section-title row">
              <div>
                <h2>Materi Terbaru</h2>
                <p>PPT dan kuis yang baru dibuat.</p>
              </div>
              <button className="mini">Lihat Semua</button>
            </div>

            <div className="material-list">
              {materials.map((m) => (
                <div className="material" key={m[0]}>
                  <div className="thumb">📘</div>
                  <div className="material-info">
                    <h3>{m[0]}</h3>
                    <p>{m[1]} • {m[2]} • {m[3]} • {m[4]}</p>
                  </div>
                  <span className={m[5] === "Published" ? "badge publish" : "badge draft"}>{m[5]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-grid bottom">
          <div className="panel">
            <div className="section-title">
              <h2>Progress Peserta</h2>
              <p>Status penyelesaian materi.</p>
            </div>

            <Progress title="Sudah selesai" value="63%" color="green" />
            <Progress title="Sedang belajar" value="24%" color="blue" />
            <Progress title="Belum selesai" value="13%" color="orange" />
          </div>

          <div className="panel table-panel">
            <div className="section-title">
              <h2>Peserta Masuk Terbaru</h2>
              <p>Data dari siswa yang membuka link materi.</p>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Kelas</th>
                    <th>Materi</th>
                    <th>Progress</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p[0]}>
                      {p.map((x) => <td key={x}>{x}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Progress({ title, value, color }) {
  return (
    <div className="progress-item">
      <div>
        <span>{title}</span>
        <b>{value}</b>
      </div>
      <div className="progress">
        <i className={color} style={{ width: value }}></i>
      </div>
    </div>
  );
}

export default App;
