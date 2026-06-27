import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">J</div>
          <div>
            <h2>JeniusPPT</h2>
            <p>Teacher Dashboard</p>
          </div>
        </div>

        <nav>
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

        <div className="sidebar-card">
          <h3>JeniusPPT Pro</h3>
          <p>Kelola PPT, kuis, peserta, nilai, dan laporan dalam satu tempat.</p>
          <button>Upgrade</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="label">Dashboard Guru</span>
            <h1>Selamat datang, Guru 👋</h1>
            <p>Kelola materi PPT, kuis, peserta, link belajar, dan hasil nilai siswa.</p>
          </div>

          <div className="top-actions">
            <button className="secondary-btn">Export Laporan</button>
            <button className="primary-btn">+ Buat Materi</button>
          </div>
        </header>

        <section className="stats">
          <Stat icon="📚" title="Total Materi" value="24" note="+4 minggu ini" />
          <Stat icon="🎞️" title="Total Slide" value="186" note="+38 slide baru" />
          <Stat icon="📝" title="Total Kuis" value="56" note="+7 kuis baru" />
          <Stat icon="👥" title="Peserta Masuk" value="342" note="+82 hari ini" />
          <Stat icon="📊" title="Rata-rata Nilai" value="86.4" note="+5.2 meningkat" />
          <Stat icon="✅" title="Selesai Belajar" value="218" note="63% peserta" />
          <Stat icon="⏱️" title="Durasi Rata-rata" value="18m" note="per materi" />
          <Stat icon="🔗" title="Link Aktif" value="12" note="sedang dibagikan" />
        </section>

        <section className="quick-panel">
          <div className="section-head">
            <div>
              <h2>Aksi Cepat</h2>
              <p>Pilih cara membuat materi atau pantau aktivitas siswa.</p>
            </div>
          </div>

          <div className="quick-grid">
            <Action color="purple" title="Buat PPT Manual" desc="Tambah slide, edit, hapus, copy, preview, dan publish." />
            <Action color="blue" title="Buat dari Kode" desc="Tempel JSON lalu otomatis jadi slide, kuis, esai, dan alasan jawaban." />
            <Action color="green" title="Lihat Peserta Masuk" desc="Pantau nama, jenis kelamin, kelas, waktu masuk, progress, dan nilai." />
            <Action color="orange" title="Bagikan Link" desc="Buat link PPT dan kuis agar siswa masuk tanpa akun." />
          </div>
        </section>

        <section className="content-grid">
          <div className="panel wide">
            <div className="section-head">
              <div>
                <h2>Materi Terbaru</h2>
                <p>Daftar PPT dan kuis yang baru dibuat.</p>
              </div>
              <button className="mini-btn">Lihat Semua</button>
            </div>

            <div className="materials">
              <Material title="Inflasi dan Deflasi" kelas="XI IPS" status="Published" slide="8" quiz="6" peserta="82" />
              <Material title="Sistem Perbankan Indonesia" kelas="XI IPS" status="Published" slide="10" quiz="8" peserta="64" />
              <Material title="Permintaan dan Penawaran" kelas="X IPS" status="Draft" slide="6" quiz="4" peserta="0" />
              <Material title="Perdagangan Internasional" kelas="XII IPS" status="Published" slide="9" quiz="7" peserta="47" />
            </div>
          </div>

          <div className="panel">
            <div className="section-head">
              <div>
                <h2>Aktivitas Hari Ini</h2>
                <p>Peserta terbaru yang membuka link.</p>
              </div>
            </div>

            <div className="activity-list">
              <Activity name="Budi Santoso" kelas="XI IPS 1" action="Masuk materi Inflasi" time="08.15" />
              <Activity name="Rina Putri" kelas="XI IPS 2" action="Selesai kuis" time="08.32" />
              <Activity name="Andi Pratama" kelas="X IPS 1" action="Membuka slide 3" time="09.10" />
              <Activity name="Salsa Amira" kelas="XII IPS" action="Nilai masuk: 92" time="10.05" />
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <h2>Progress Peserta</h2>
            <div className="progress-item">
              <span>Sudah selesai</span>
              <b>63%</b>
            </div>
            <div className="bar"><span style={{ width: "63%" }}></span></div>

            <div className="progress-item">
              <span>Sedang belajar</span>
              <b>24%</b>
            </div>
            <div className="bar blue"><span style={{ width: "24%" }}></span></div>

            <div className="progress-item">
              <span>Belum selesai</span>
              <b>13%</b>
            </div>
            <div className="bar orange"><span style={{ width: "13%" }}></span></div>
          </div>

          <div className="panel wide">
            <div className="section-head">
              <div>
                <h2>Peserta Masuk Terbaru</h2>
                <p>Data dari siswa yang membuka link materi.</p>
              </div>
            </div>

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
                <tr>
                  <td>Budi Santoso</td>
                  <td>Laki-laki</td>
                  <td>XI IPS 1</td>
                  <td>Inflasi</td>
                  <td>75%</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Rina Putri</td>
                  <td>Perempuan</td>
                  <td>XI IPS 2</td>
                  <td>Inflasi</td>
                  <td>100%</td>
                  <td>92</td>
                </tr>
                <tr>
                  <td>Andi Pratama</td>
                  <td>Laki-laki</td>
                  <td>X IPS 1</td>
                  <td>Permintaan</td>
                  <td>45%</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, title, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
      <span>{note}</span>
    </div>
  );
}

function Action({ color, title, desc }) {
  return (
    <button className={`action-card ${color}`}>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span>Mulai →</span>
    </button>
  );
}

function Material({ title, kelas, status, slide, quiz, peserta }) {
  return (
    <div className="material-row">
      <div>
        <h3>{title}</h3>
        <p>{kelas} • {slide} slide • {quiz} kuis • {peserta} peserta</p>
      </div>
      <span className={status === "Published" ? "badge publish" : "badge draft"}>{status}</span>
      <div className="row-actions">
        <button>Edit</button>
        <button>Copy</button>
        <button>Share</button>
      </div>
    </div>
  );
}

function Activity({ name, kelas, action, time }) {
  return (
    <div className="activity">
      <div className="avatar">{name[0]}</div>
      <div>
        <h4>{name}</h4>
        <p>{kelas} • {action}</p>
      </div>
      <span>{time}</span>
    </div>
  );
}

export default App;
