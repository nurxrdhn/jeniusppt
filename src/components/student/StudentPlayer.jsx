import { useEffect, useState } from "react";
import { SLIDE_SIZES, ratioStyle } from "../../utils/slideSizes";
import { getPublishedMaterial } from "../../services/materialService";

export default function StudentPlayer() {
  const code = decodeURIComponent(window.location.pathname.split("/play/")[1] || "");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState("slide");
  const [slide, setSlide] = useState(0);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadMaterial() {
      setLoading(true);

      try {
        const firestoreData = await getPublishedMaterial(code);

        if (firestoreData && firestoreData.shareCode === code) {
          localStorage.setItem(`jeniusppt_package_${code}`, JSON.stringify(firestoreData));
          if (alive) setData(firestoreData);
          return;
        }

        const saved = localStorage.getItem(`jeniusppt_package_${code}`);
        const localData = saved ? JSON.parse(saved) : null;

        if (localData && localData.shareCode === code) {
          if (alive) setData(localData);
          return;
        }

        if (alive) setData(null);
      } catch (err) {
        console.error(err);

        const saved = localStorage.getItem(`jeniusppt_package_${code}`);
        const localData = saved ? JSON.parse(saved) : null;

        if (localData && localData.shareCode === code) {
          if (alive) setData(localData);
        } else {
          if (alive) setData(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadMaterial();

    return () => {
      alive = false;
    };
  }, [code]);

  if (loading) {
    return (
      <main className="student-page">
        <section className="student-card center">
          <span className="eyebrow">Loading</span>
          <h1>Membuka materi...</h1>
          <p>Mohon tunggu sebentar.</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="student-page">
        <section className="student-card center">
          <span className="eyebrow">404</span>
          <h1>Materi tidak ditemukan</h1>
          <p>Periksa link atau publish ulang materi.</p>
        </section>
      </main>
    );
  }

  const slides = data.slides || [];
  const questions = data.questions || [];
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  if (!student) {
    return (
      <main className="student-page">
        <form
          className="student-card"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setStudent({
              name: f.get("name"),
              gender: f.get("gender"),
              className: f.get("className"),
            });
          }}
        >
          <span className="eyebrow">Masuk Kelas</span>
          <h1>{data.title}</h1>

          <input name="name" placeholder="Nama" required />

          <select name="gender" required>
            <option value="">Gender</option>
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </select>

          <input name="className" placeholder="Kelas" required />

          <button className="primary-button full">Lanjut →</button>
        </form>
      </main>
    );
  }

  if (mode === "result") {
    return (
      <main className="student-page">
        <section className="student-card center">
          <span className="eyebrow">Skor</span>
          <div className="big-score">{score}</div>
          <p>{correct} Benar • {questions.length - correct} Salah</p>
        </section>
      </main>
    );
  }

  if (mode === "quiz") {
    const q = questions[question];

    if (!q) {
      return (
        <main className="student-page">
          <section className="student-card center">
            <span className="eyebrow">Selesai</span>
            <h1>Tidak ada kuis</h1>
            <p>Materi ini belum memiliki soal.</p>
          </section>
        </main>
      );
    }

    const isTF = q.type === "truefalse";
    const options = isTF ? ["Benar", "Salah"] : q.options || [];

    return (
      <main className="student-page">
        <section className="student-slide">
          <div className="student-meta">
            <b>{student.name}</b>
            <span>Soal {question + 1}/{questions.length}</span>
          </div>

          <h1>{q.question}</h1>

          <div className="student-options">
            {options.map((opt, i) => {
              const value = isTF ? i === 0 : i;
              const isRight = q.answer === value;
              const picked = answer === value;
              const show = answer !== null;

              return (
                <button
                  key={`${opt}-${i}`}
                  disabled={show}
                  className={show && isRight ? "correct" : show && picked ? "wrong" : ""}
                  onClick={() => {
                    setAnswer(value);
                    if (isRight) setCorrect((v) => v + 1);
                  }}
                >
                  <b>{isTF ? (i === 0 ? "✓" : "✕") : ["A", "B", "C", "D"][i]}</b>
                  {opt}
                </button>
              );
            })}
          </div>

          {answer !== null && (
            <div className="answer-result">
              {answer === q.answer ? "✅ Benar" : "❌ Salah"}

              {question < questions.length - 1 ? (
                <button
                  onClick={() => {
                    setQuestion((i) => i + 1);
                    setAnswer(null);
                  }}
                >
                  Lanjut
                </button>
              ) : (
                <button onClick={() => setMode("result")}>Skor</button>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  const s = slides[slide];
  const bg = s?.background || {
    type: "css",
    value: "linear-gradient(135deg,#0b1f46,#1d4ed8)",
  };

  return (
    <main className="student-page">
      <section
        className="student-slide ppt-like"
        style={{
          ...ratioStyle(data.slideSize || SLIDE_SIZES.wide),
          ...(bg.type === "image"
            ? { backgroundImage: `url(${bg.value})` }
            : { background: bg.value }),
        }}
      >
        <div className="student-meta">
          <b>{student.name}</b>
          <span>Slide {slide + 1}/{slides.length}</span>
        </div>

        <h1>{s?.title || data.title}</h1>
        <p>{s?.body || "Materi belum memiliki isi."}</p>

        <div className="student-controls">
          <button disabled={slide === 0} onClick={() => setSlide((i) => i - 1)}>
            ←
          </button>

          {slide < slides.length - 1 ? (
            <button onClick={() => setSlide((i) => i + 1)}>→</button>
          ) : (
            <button onClick={() => setMode(questions.length ? "quiz" : "result")}>
              {questions.length ? "Kuis" : "Selesai"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
