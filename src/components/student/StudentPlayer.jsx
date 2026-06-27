import { useState } from "react";

export default function StudentPlayer() {
  const code = window.location.pathname.split("/play/")[1] || "DEMO";
  const [student, setStudent] = useState(null);
  const [step, setStep] = useState("ppt");
  const [slide, setSlide] = useState(0);
  const [answer, setAnswer] = useState(null);

  const slides = [
    { title: "Inflasi dan Deflasi", text: "Inflasi adalah kenaikan harga barang dan jasa secara umum." },
    { title: "Penyebab Inflasi", text: "Inflasi dapat terjadi karena permintaan tinggi, biaya produksi naik, atau jumlah uang beredar meningkat." },
    { title: "Dampak Inflasi", text: "Inflasi dapat menurunkan daya beli masyarakat dan memengaruhi kestabilan ekonomi." },
  ];

  const quiz = {
    question: "Apa yang dimaksud inflasi?",
    options: ["Harga naik secara umum", "Harga turun", "Produksi naik", "Ekspor naik"],
    correct: 0,
  };

  if (!student) {
    return (
      <div className="student-play-page">
        <div className="student-join-card">
          <span>JeniusPPT</span>
          <h1>Masuk ke Materi</h1>
          <p>Kode materi: <b>{code}</b></p>

          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setStudent({
              name: form.get("name"),
              gender: form.get("gender"),
              className: form.get("className"),
            });
          }}>
            <input name="name" placeholder="Nama lengkap" required />
            <select name="gender" required>
              <option value="">Pilih jenis kelamin</option>
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
            <input name="className" placeholder="Kelas, contoh XI IPS 1" required />
            <button>Mulai Belajar</button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "quiz") {
    return (
      <div className="student-play-page">
        <div className="student-quiz">
          <div className="student-top">
            <b>{student.name}</b>
            <span>Kuis</span>
          </div>

          <h1>{quiz.question}</h1>

          <div className="student-answer-grid">
            {quiz.options.map((opt, i) => {
              const show = answer !== null;
              return (
                <button
                  key={opt}
                  className={
                    show && i === quiz.correct
                      ? "correct"
                      : show && i === answer
                      ? "wrong"
                      : ""
                  }
                  onClick={() => setAnswer(i)}
                  disabled={show}
                >
                  <b>{["A", "B", "C", "D"][i]}</b>
                  {opt}
                </button>
              );
            })}
          </div>

          {answer !== null && (
            <div className="student-result">
              {answer === quiz.correct ? "✅ Benar" : "❌ Salah"}
              <p>Jawaban benar: {quiz.options[quiz.correct]}</p>
              <button onClick={() => setStep("done")}>Lihat Nilai</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="student-play-page">
        <div className="student-join-card">
          <span>Selesai</span>
          <h1>Nilai Kamu</h1>
          <div className="student-score">{answer === quiz.correct ? 100 : 0}</div>
          <p>Terima kasih, {student.name}. Jawabanmu sudah tercatat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-play-page">
      <div className="student-slide">
        <div className="student-top">
          <b>{student.name}</b>
          <span>Slide {slide + 1} / {slides.length}</span>
        </div>

        <h1>{slides[slide].title}</h1>
        <p>{slides[slide].text}</p>

        <div className="student-controls">
          <button disabled={slide === 0} onClick={() => setSlide(slide - 1)}>Sebelumnya</button>
          {slide < slides.length - 1 ? (
            <button onClick={() => setSlide(slide + 1)}>Berikutnya</button>
          ) : (
            <button onClick={() => setStep("quiz")}>Mulai Kuis</button>
          )}
        </div>
      </div>
    </div>
  );
}
