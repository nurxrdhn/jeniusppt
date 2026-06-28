import { useEffect, useState } from "react";
import { getPublishedMaterial } from "../../services/materialService";
import { saveStudentEntry, saveStudentResult } from "../../services/studentService";

export default function StudentPlayer() {
  const code = decodeURIComponent(window.location.pathname.split("/play/")[1] || "");
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [mode, setMode] = useState("form");
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const online = await getPublishedMaterial(code);
        if (online) {
          setMaterial(online);
          localStorage.setItem(`jeniusppt_package_${code}`, JSON.stringify(online));
          return;
        }
      } catch (e) {
        console.error(e);
      }

      const saved = localStorage.getItem(`jeniusppt_package_${code}`);
      setMaterial(saved ? JSON.parse(saved) : null);
      setLoading(false);
    }

    load().finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return <main className="student-clean"><h1>Membuka materi...</h1></main>;
  }

  if (!material) {
    return (
      <main className="student-clean">
        <section className="student-box">
          <h1>Materi tidak ditemukan</h1>
          <p>Link siswa belum aktif atau materi belum dipublish.</p>
        </section>
      </main>
    );
  }

  const slides = material.slides || [];
  const questions = material.questions || [];
  const currentSlide = slides[slideIndex];
  const currentQuiz = questions[quizIndex];

  const correctCount = answers.filter((a) => a.correct).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  function normalizeAnswer(q) {
    if (q.type === "truefalse") return q.answer === true || q.answer === "Benar" || q.answer === 0 ? 0 : 1;
    return Number(q.answer ?? q.correctAnswer ?? 0);
  }

  function startQuizOrResult() {
    if (questions.length > 0) {
      setMode("quiz");
    } else {
      setMode("result");
    }
  }

  function chooseAnswer(value) {
    const correctAnswer = normalizeAnswer(currentQuiz);
    const isCorrect = value === correctAnswer;

    setPicked(value);

    setAnswers((prev) => {
      const copy = [...prev];
      copy[quizIndex] = {
        question: currentQuiz.question,
        picked: value,
        correctAnswer,
        correct: isCorrect,
      };
      return copy;
    });
  }

  function nextQuestion() {
    setPicked(null);
    if (quizIndex < questions.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setMode("result");
    }
  }

  if (mode === "form") {
    return (
      <main className="student-clean">
        <section className="student-box">
          <h1>{material.title}</h1>
          <p>Isi data terlebih dahulu untuk mulai belajar.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const studentData = {
                name: f.get("name"),
                gender: f.get("gender"),
                className: f.get("className"),
              };

              setStudent(studentData);
              setMode("slide");

              saveStudentEntry({
                shareCode: code,
                materialId: material.id,
                materialTitle: material.title,
                student: studentData,
              })
                .then((id) => setEntryId(id))
                .catch((err) => console.error("Gagal simpan siswa:", err));
            }}
          >
            <input name="name" placeholder="Nama siswa" required />

            <select name="gender" required>
              <option value="">Jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>

            <input name="className" placeholder="Nama kelas" required />

            <button>Mulai Materi</button>
          </form>
        </section>
      </main>
    );
  }

  if (mode === "slide") {
    return (
      <main className="student-clean">
        <section className="student-slide-clean">
          <div className="student-top">
            <b>{student.name}</b>
            <span>{student.className}</span>
          </div>

          <small>Slide {slideIndex + 1} dari {slides.length}</small>
          <h1>{currentSlide?.title || material.title}</h1>
          <p>{currentSlide?.body || currentSlide?.content || "Materi belum memiliki isi."}</p>

          <div className="student-nav">
            <button disabled={slideIndex === 0} onClick={() => setSlideIndex(slideIndex - 1)}>
              Sebelumnya
            </button>

            {slideIndex < slides.length - 1 ? (
              <button onClick={() => setSlideIndex(slideIndex + 1)}>
                Lanjut
              </button>
            ) : (
              <button onClick={startQuizOrResult}>
                Mulai Kuis
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (mode === "quiz") {
    const isTrueFalse = currentQuiz?.type === "truefalse";
    const options = isTrueFalse ? ["Benar", "Salah"] : currentQuiz?.options || [];

    return (
      <main className="student-clean">
        <section className="student-box">
          <small>Soal {quizIndex + 1} dari {questions.length}</small>
          <h1>{currentQuiz?.question}</h1>

          <div className="quiz-options-clean">
            {options.map((opt, i) => {
              const correctAnswer = normalizeAnswer(currentQuiz);
              const isCorrect = i === correctAnswer;
              const isPicked = picked === i;

              return (
                <button
                  key={i}
                  disabled={picked !== null}
                  className={
                    picked === null
                      ? ""
                      : isCorrect
                      ? "right"
                      : isPicked
                      ? "wrong"
                      : ""
                  }
                  onClick={() => chooseAnswer(i)}
                >
                  <b>{isTrueFalse ? (i === 0 ? "✓" : "✕") : ["A", "B", "C", "D"][i]}</b>
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="answer-info">
              {picked === normalizeAnswer(currentQuiz) ? (
                <h2>✅ Jawaban benar</h2>
              ) : (
                <h2>❌ Jawaban salah</h2>
              )}

              <p>
                Jawaban yang benar:{" "}
                <b>{options[normalizeAnswer(currentQuiz)]}</b>
              </p>

              <button onClick={nextQuestion}>
                {quizIndex < questions.length - 1 ? "Soal Berikutnya" : "Lihat Skor"}
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (!resultSaved && student) {
    setResultSaved(true);
    saveStudentResult({
      entryId,
      shareCode: code,
      materialId: material.id,
      materialTitle: material.title,
      student,
      answers,
      score,
      correctCount,
      totalQuestions: questions.length,
    }).catch((err) => console.error("Gagal simpan skor:", err));
  }

  return (
    <main className="student-clean">
      <section className="student-box center">
        <h1>Skor Kamu</h1>
        <div className="score-clean">{score}</div>
        <p>{correctCount} benar dari {questions.length} soal</p>

        <button
          onClick={() => {
            setMode("slide");
            setSlideIndex(0);
            setQuizIndex(0);
            setPicked(null);
            setAnswers([]);
          }}
        >
          Balik ke Awal Materi
        </button>

        <button
          onClick={() => {
            window.location.href = `/play/${code}`;
          }}
        >
          Home
        </button>
      </section>
    </main>
  );
}
