import { useEffect, useState } from "react";
import { getPublishedMaterial } from "../../services/materialService";
import {
  saveStudentEntry,
  saveStudentResult,
} from "../../services/studentService";
import MediaPlayer from "../ui/MediaPlayer";
import { textStyle } from "../../utils/fonts";
import SolidSelect from "../ui/SolidSelect";

export default function StudentPlayer() {
  const code = decodeURIComponent(
    window.location.pathname.split("/play/")[1] || "",
  );
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
  const [formError, setFormError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const online = await getPublishedMaterial(code);
        if (online) {
          setMaterial(online);
          localStorage.setItem(
            `jeniusppt_package_${code}`,
            JSON.stringify(online),
          );
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

  useEffect(() => {
    if (mode !== "quiz" || picked !== null) return undefined;
    const question = material?.questions?.[quizIndex];
    const seconds = Math.max(5, Number(question?.timer || 15));
    setTimeLeft(seconds);
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current > 1) return current - 1;
        window.clearInterval(timer);
        setPicked((chosen) => chosen === null ? -1 : chosen);
        setAnswers((previous) => {
          if (previous[quizIndex]) return previous;
          const copy = [...previous];
          copy[quizIndex] = {
            question: question?.question,
            picked: -1,
            correctAnswer: question?.type === "truefalse"
              ? (question.answer === true || question.answer === "Benar" || question.answer === 0 ? 0 : 1)
              : Number(question?.answer ?? question?.correctAnswer ?? 0),
            correct: false,
            timedOut: true,
          };
          return copy;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, quizIndex, material, picked]);

  if (loading) {
    return (
      <main className="student-clean">
        <h1>Membuka materi...</h1>
      </main>
    );
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
  const score = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;
  const passingScore = material.passingScore ?? 75;
  const resultMessage =
    score > passingScore
      ? material.successMessage || "Lulus dengan hasil sangat baik"
      : score === passingScore
        ? material.equalMessage || "Lulus sesuai nilai minimum"
        : material.failMessage || "Belum memenuhi nilai minimum";
  const now = Date.now();
  const notStarted =
    material.availableFrom && now < new Date(material.availableFrom).getTime();
  const hasEnded =
    material.availableUntil &&
    now > new Date(material.availableUntil).getTime();

  function normalizeAnswer(q) {
    if (q.type === "truefalse")
      return q.answer === true || q.answer === "Benar" || q.answer === 0
        ? 0
        : 1;
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

  async function downloadCertificate() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const accent = material.certificateColor || "#f97316";
    pdf.setFillColor(255, 247, 237);
    pdf.rect(0, 0, 297, 210, "F");
    pdf.setDrawColor(accent);
    pdf.setLineWidth(3);
    pdf.rect(9, 9, 279, 192);
    pdf.setTextColor(accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(material.certificateIssuer || "JeniusPPT.online", 148.5, 34, {
      align: "center",
    });
    pdf.setTextColor(67, 20, 7);
    pdf.setFontSize(31);
    pdf.text(
      material.certificateTitle || "SERTIFIKAT PENYELESAIAN",
      148.5,
      57,
      { align: "center" },
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.text("Diberikan kepada", 148.5, 78, { align: "center" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(27);
    pdf.setTextColor(accent);
    pdf.text(student.name, 148.5, 99, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(67, 20, 7);
    pdf.setFontSize(13);
    pdf.text(
      material.certificateDescription ||
        `Telah menyelesaikan materi “${material.title}”`,
      148.5,
      119,
      {
        align: "center",
      },
    );
    pdf.text(`Kelas ${student.className} dengan nilai ${score}`, 148.5, 131, {
      align: "center",
    });
    pdf.text(resultMessage, 148.5, 143, { align: "center" });
    pdf.setFontSize(11);
    pdf.text(
      new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
      148.5,
      164,
      { align: "center" },
    );
    pdf.setFont("helvetica", "bold");
    pdf.text(
      material.certificateSigner ||
        material.certificateIssuer ||
        "Guru / Pengajar",
      148.5,
      182,
      {
        align: "center",
      },
    );
    pdf.save(
      `sertifikat-${student.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${material.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`,
    );
  }

  if (mode === "form") {
    if (notStarted || hasEnded)
      return (
        <main className="student-clean">
          <section className="student-box">
            <h1>Materi belum tersedia</h1>
            <p>
              {notStarted
                ? `Materi dapat dibuka mulai ${new Date(material.availableFrom).toLocaleString("id-ID")}.`
                : `Batas pengerjaan berakhir pada ${new Date(material.availableUntil).toLocaleString("id-ID")}.`}
            </p>
          </section>
        </main>
      );
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

              const accessInput = String(f.get("accessCode") || "").trim();
              if (
                material.accessCode &&
                accessInput !== String(material.accessCode).trim()
              ) {
                setFormError("Kode akses tidak sesuai.");
                return;
              }
              const attemptKey = `jeniusppt_attempt_${code}_${studentData.name.toLowerCase()}_${studentData.className.toLowerCase()}`;
              const used = Number(localStorage.getItem(attemptKey) || 0);
              if (material.attemptLimit > 0 && used >= material.attemptLimit) {
                setFormError(
                  `Batas ${material.attemptLimit} kali percobaan sudah tercapai.`,
                );
                return;
              }
              localStorage.setItem(attemptKey, String(used + 1));
              setFormError("");

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

            <SolidSelect name="gender" required>
              <option value="">Jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </SolidSelect>

            <input name="className" placeholder="Nama kelas" required />

            {material.accessCode && (
              <input
                name="accessCode"
                placeholder="Kode akses materi"
                required
              />
            )}
            {formError && <div className="error-box">{formError}</div>}

            <button>Mulai Materi</button>
          </form>
        </section>
      </main>
    );
  }

  if (mode === "slide") {
    return (
      <main className="student-clean">
        <section
          key={`student-slide-${slideIndex}`}
          className={`student-slide-clean transition-${currentSlide?.transition || "fade"}`}
          style={{
            animationDuration: `${currentSlide?.duration || 700}ms`,
            ...(currentSlide?.background?.type === "image"
              ? { backgroundImage: `url(${currentSlide.background.value})` }
              : { background: currentSlide?.background?.value }),
            textAlign: currentSlide?.textAlign || "left",
          }}
        >
          <div className="student-top">
            <b>{student.name}</b>
            <span>{student.className}</span>
          </div>

          <small>
            Slide {slideIndex + 1} dari {slides.length}
          </small>
          <h1
            className="positioned-title"
            style={{
              ...textStyle(
                currentSlide?.titleStyle || {
                  fontFamily: "Arial",
                  fontSize: 62,
                  bold: true,
                  color: currentSlide?.titleColor || "#ffffff",
                },
                currentSlide?.titleColor || "#ffffff",
              ),
              left: `${currentSlide?.titleBox?.x ?? 8}%`,
              top: `${currentSlide?.titleBox?.y ?? 12}%`,
              width: `${currentSlide?.titleBox?.w ?? 84}%`,
              height: `${currentSlide?.titleBox?.h ?? 20}%`,
            }}
          >
            {currentSlide?.title || material.title}
          </h1>
          <p
            className="positioned-body"
            style={{
              ...textStyle(
                currentSlide?.bodyStyle || {
                  fontFamily: "Arial",
                  fontSize: 30,
                  color: currentSlide?.bodyColor || "#e4ecff",
                  lineHeight: 1.5,
                },
                currentSlide?.bodyColor || "#e4ecff",
              ),
              left: `${currentSlide?.bodyBox?.x ?? 8}%`,
              top: `${currentSlide?.bodyBox?.y ?? 36}%`,
              width: `${currentSlide?.bodyBox?.w ?? 84}%`,
              height: `${currentSlide?.bodyBox?.h ?? 42}%`,
            }}
          >
            {currentSlide?.body ||
              currentSlide?.content ||
              "Materi belum memiliki isi."}
          </p>

          <div className="free-elements-layer preview-elements">
            {(currentSlide?.elements || []).map((item) => (
              <div
                key={item.id}
                className={`free-element ${item.type}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.w}%`,
                  height: `${item.h}%`,
                  color: item.color,
                  background:
                    item.type === "shape" ? item.background : "transparent",
                  ...(item.type === "text"
                    ? textStyle(
                        item.style || {
                          color: item.color || "#fff",
                          fontSize: 32,
                          bold: true,
                        },
                        item.color || "#fff",
                      )
                    : {}),
                }}
              >
                {item.type === "text" && item.text}
                {item.type === "sticker" &&
                  (item.src ? <img src={item.src} alt="Stiker" /> : item.text)}
                {item.type === "image" && (
                  <img src={item.src} alt="Elemen slide" />
                )}
                {(item.type === "video" || item.type === "audio") && (
                  <MediaPlayer item={item} />
                )}
              </div>
            ))}
          </div>

          <div className="student-nav">
            <button
              disabled={slideIndex === 0}
              onClick={() => setSlideIndex(slideIndex - 1)}
            >
              Sebelumnya
            </button>

            {slideIndex < slides.length - 1 ? (
              <button onClick={() => setSlideIndex(slideIndex + 1)}>
                Lanjut
              </button>
            ) : (
              <button onClick={startQuizOrResult}>Mulai Kuis</button>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (mode === "quiz") {
    const isTrueFalse = currentQuiz?.type === "truefalse";
    const options = isTrueFalse
      ? ["Benar", "Salah"]
      : currentQuiz?.options || [];

    return (
      <main className="student-clean">
        <section className="student-box">
          <div className={`quiz-timer-bar ${timeLeft <= 5 ? "ending" : ""}`}>
            <span>Soal {quizIndex + 1} dari {questions.length}</span>
            <b>{timeLeft} detik</b>
          </div>
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
                  <b>
                    {isTrueFalse
                      ? i === 0
                        ? "✓"
                        : "✕"
                      : ["A", "B", "C", "D"][i]}
                  </b>
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="answer-info">
              {picked === -1 ? (
                <h2>⏱️ Waktu habis</h2>
              ) : picked === normalizeAnswer(currentQuiz) ? (
                <h2>✅ Jawaban benar</h2>
              ) : (
                <h2>❌ Jawaban salah</h2>
              )}

              <p>
                Jawaban yang benar:{" "}
                <b>{options[normalizeAnswer(currentQuiz)]}</b>
              </p>

              <button onClick={nextQuestion}>
                {quizIndex < questions.length - 1
                  ? "Soal Berikutnya"
                  : "Lihat Skor"}
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
        <p>
          {correctCount} benar dari {questions.length} soal
        </p>
        <p
          className={
            score >= passingScore
              ? "result-message success"
              : "result-message fail"
          }
        >
          {resultMessage}
        </p>

        {material.certificateEnabled && score >= passingScore && (
          <button className="certificate-button" onClick={downloadCertificate}>
            Download Sertifikat PDF
          </button>
        )}

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
