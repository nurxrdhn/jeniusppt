export default function Settings() {
  return (
    <section>
      <div className="page-title">
        <h1>Pengaturan</h1>
        <p>Atur profil guru, sekolah, kelas, dan konfigurasi aplikasi.</p>
      </div>

      <div className="panel">
        <h3>Profil Sekolah</h3>
        <input placeholder="Nama sekolah" />
        <input placeholder="Nama guru" />
        <button className="new-btn">Simpan Pengaturan</button>
      </div>
    </section>
  );
}
