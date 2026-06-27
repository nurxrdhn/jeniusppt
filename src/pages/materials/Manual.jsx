export default function Manual() {
  return (
    <section>
      <div className="page-title">
        <h1>Buat PPT Manual</h1>
        <p>Buat materi dengan editor manual, slide, kuis, dan preview.</p>
      </div>

      <div className="editor">
        <div className="panel">
          <h3>Informasi Materi</h3>
          <input placeholder="Judul materi" />
          <input placeholder="Kelas" />
          <textarea placeholder="Deskripsi materi"></textarea>
          <button className="new-btn">Simpan Draft</button>
        </div>

        <div className="slide-preview">
          <span>Slide 1</span>
          <h2>Judul Materi</h2>
          <p>Preview slide akan tampil di sini.</p>
        </div>
      </div>
    </section>
  );
}
