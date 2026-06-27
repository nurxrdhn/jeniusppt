export default function CodeGenerator() {
  return (
    <section>
      <div className="page-title">
        <h1>Tempel Kode Materi</h1>
        <p>Tempel JSON lalu otomatis menjadi slide dan kuis.</p>
      </div>

      <div className="editor">
        <div className="panel">
          <h3>Kode JSON</h3>
          <textarea className="code-area" defaultValue={`{
  "title": "Inflasi dan Deflasi",
  "class": "XI IPS",
  "slides": [
    {
      "title": "Pengertian Inflasi",
      "content": "Inflasi adalah kenaikan harga barang dan jasa secara umum."
    }
  ],
  "quiz": [
    {
      "question": "Apa itu inflasi?",
      "options": ["Harga naik", "Harga turun", "Uang hilang", "Produksi naik"],
      "answer": 0,
      "reason": "Inflasi berarti harga naik secara umum."
    }
  ]
}`} />
          <button className="new-btn">Generate Materi</button>
        </div>

        <div className="panel">
          <h3>Output</h3>
          <p>✅ Slide materi</p>
          <p>✅ Kuis A-D</p>
          <p>✅ Benar/Salah</p>
          <p>✅ Esai</p>
          <p>✅ Alasan jawaban</p>
        </div>
      </div>
    </section>
  );
}
