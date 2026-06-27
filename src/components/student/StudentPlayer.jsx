import { useMemo, useState } from "react";

const demo = {
  title: "Inflasi dan Deflasi",
  slides: [
    { title: "Inflasi dan Deflasi", body: "Inflasi adalah kenaikan harga barang dan jasa secara umum." },
    { title: "Penyebab Inflasi", body: "Inflasi dapat terjadi karena permintaan tinggi atau biaya produksi meningkat." },
  ],
  questions: [
    { type: "pg", question: "Apa yang dimaksud inflasi?", options: ["Harga naik umum", "Harga turun", "Produksi naik", "Ekspor naik"], answer: 0 },
    { type: "truefalse", question: "Inflasi membuat daya beli masyarakat dapat menurun.", answer: true },
  ],
};

export default function StudentPlayer() {
  const code = window.location.pathname.split("/play/")[1] || "DEMO";
  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState("slides");
  const [slideIndex, setSlideIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [correct, setCorrect] = useState(0);

  const data = useMemo(() => {
    const saved = localStorage.getItem(`jeniusppt_package_${code}`);
    return saved ? JSON.parse(saved) : demo;
  }, [code]);

  const question = data.questions[questionIndex];
  const score = data.questions.length ? Math.round((correct / data.questions.length) * 100) : 0;

  if (!student) {
    return (
      <main className="student-page">
        <form className="student-card" onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setStudent({
            name: form.get("name"),
            gender: form.get("gender"),
            className: form.get("className"),
          });
        }}>
          <span className="eyebrow">Kode: {code}</span>
          <h1>{data.title}</h1>
          <p>Isi data terlebih dahulu untuk mulai belajar.</p>
          <input name="name" placeholder="Nama lengkap" required />
          <select name="gender" required>
            <option value="">Jenis kelamin</option>
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </select>
          <input name="className" placeholder="Kelas" required />
          <button className="primary-button full">Mulai Belajar</button>
        </form>
      </main>
    );
  }

  if (mode === "result") {
    return (
      <main className="student-page">
        <section className="student-card center">
          <span className="eyebrow">Selesai</span>
          <h1>Nilai Kamu</h1>
          <div className="big-score">{score}</div>
          <p>Benar {correct} dari {data.questions.length} soal.</p>
        </section>
      </main>
    );
  }

  if (mode === "quiz") {
    const isTrueFalse = question.type === "truefalse";
    const options = isTrueFalse ? ["Benar", "Salah"] : question.options;
    return (
      <main className="student-page">
        <section className="student-slide">
          <div className="student-meta">
            <b>{student.name}</b>
            <span>Soal {questionIndex + 1}/{data.questions.length}</span>
          </div>
          <h1>{question.question}</h1>
          <div className="student-options">
            {options.map((opt, i) => {
              const value = isTrueFalse ? i === 0 : i;
              const isCorrect = question.answer === value;
              const selected = answer === value;
              const show = answer !== null;
              return (
                <button
                  key={opt}
                  className={show && isCorrect ? "correct" : show && selected ? "wrong" : ""}
                  disabled={show}
                  onClick={() => {
                    setAnswer(value);
                    if (isCorrect) setCorrect((v) => v + 1);
                  }}
                >
                  <b>{isTrueFalse ? (i === 0 ? "✓" : "✕") : ["A", "B", "C", "D"][i]}</b>
                  {opt}
                </button>
              );
            })}
          </div>
          {answer !== null && (
            <div className="answer-result">
              {answer === question.answer ? "✅ Benar" : "❌ Salah"}
              {questionIndex < data.questions.length - 1 ? (
                <button onClick={() => { setQuestionIndex((i) => i + 1); setAnswer(null); }}>Soal Berikutnya</button>
              ) : (
                <button onClick={() => setMode("result")}>Lihat Nilai</button>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  const slide = data.slides[slideIndex];
  return (
    <main className="student-page">
      <section className="student-slide">
        <div className="student-meta">
          <b>{student.name}</b>
          <span>Slide {slideIndex + 1}/{data.slides.length}</span>
        </div>
        <h1>{slide.title}</h1>
        <p>{slide.body}</p>
        <div className="student-controls">
          <button disabled={slideIndex === 0} onClick={() => setSlideIndex((i) => i - 1)}>Sebelumnya</button>
          {slideIndex < data.slides.length - 1 ? (
            <button onClick={() => setSlideIndex((i) => i + 1)}>Berikutnya</button>
          ) : (
            <button onClick={() => setMode(data.questions.length ? "quiz" : "result")}>Mulai Kuis</button>
          )}
        </div>
      </section>
    </main>
  );
}
