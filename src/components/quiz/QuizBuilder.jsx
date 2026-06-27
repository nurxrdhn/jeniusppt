import { useState } from "react";

const colors = ["red", "blue", "yellow", "green"];

export default function QuizBuilder() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "Apa yang dimaksud inflasi?",
      options: ["Harga naik", "Harga turun", "Produksi naik", "Ekspor naik"],
      answer: 0,
      timer: 15,
      points: 1000,
    },
  ]);

  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const q = questions[active];

  function updateQuestion(field, value) {
    setQuestions((old) =>
      old.map((item, index) =>
        index === active ? { ...item, [field]: value } : item
      )
    );
  }

  function updateOption(index, value) {
    const next = [...q.options];
    next[index] = value;
    updateQuestion("options", next);
  }

  function addQuestion() {
    const next = {
      id: Date.now(),
      question: "Pertanyaan baru",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      answer: 0,
      timer: 15,
      points: 1000,
    };

    setQuestions([...questions, next]);
    setActive(questions.length);
    setSelectedAnswer(null);
  }

  function deleteQuestion() {
    if (questions.length === 1) return alert("Minimal harus ada 1 soal.");
    const next = questions.filter((_, i) => i !== active);
    setQuestions(next);
    setActive(Math.max(0, active - 1));
    setSelectedAnswer(null);
  }

  return (
    <div className="quiz-slide-builder">
      <aside className="quiz-slide-list">
        <div className="quiz-side-head">
          <h3>Quiz</h3>
          <button onClick={addQuestion}>+ Soal</button>
        </div>

        {questions.map((item, index) => (
          <button
            key={item.id}
            className={active === index ? "active" : ""}
            onClick={() => {
              setActive(index);
              setSelectedAnswer(null);
            }}
          >
            <span>{index + 1}</span>
            <b>Soal {index + 1}</b>
          </button>
        ))}

        <button className="delete-question" onClick={deleteQuestion}>
          Hapus Soal
        </button>
      </aside>

      <main className="quiz-canvas-wrap">
        <div className="quiz-toolbar">
          <button>Undo</button>
          <button>Redo</button>

          <div className="chip-group">
            {[5, 10, 15, 20, 30, 60].map((time) => (
              <button
                key={time}
                className={q.timer === time ? "chip active" : "chip"}
                onClick={() => updateQuestion("timer", time)}
              >
                {time}s
              </button>
            ))}
          </div>

          <div className="chip-group">
            {[0, 500, 1000, 2000].map((point) => (
              <button
                key={point}
                className={q.points === point ? "chip active" : "chip"}
                onClick={() => updateQuestion("points", point)}
              >
                {point}
              </button>
            ))}
          </div>

          <button className="preview-btn" onClick={() => setPreview(!preview)}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        <section className="quiz-canvas">
          <div className="quiz-top-info">
            <span>{q.timer}s</span>
            <span>{q.points} poin</span>
          </div>

          <textarea
            className="quiz-question-input"
            value={q.question}
            onChange={(e) => updateQuestion("question", e.target.value)}
            disabled={preview}
          />

          <div className="quiz-media-placeholder">
            + Tambah Gambar / Video
          </div>

          <div className="quiz-answer-grid">
            {q.options.map((option, index) => {
              const isCorrect = q.answer === index;
              const isSelected = selectedAnswer === index;
              const showResult = preview && selectedAnswer !== null;

              return (
                <button
                  key={index}
                  className={[
                    "answer-card",
                    colors[index],
                    isCorrect && !preview ? "correct-edit" : "",
                    showResult && isCorrect ? "result-correct" : "",
                    showResult && isSelected && !isCorrect ? "result-wrong" : "",
                  ].join(" ")}
                  onClick={() => {
                    if (preview) {
                      setSelectedAnswer(index);
                    } else {
                      updateQuestion("answer", index);
                    }
                  }}
                >
                  <strong>{["A", "B", "C", "D"][index]}</strong>

                  {preview ? (
                    <span>{option}</span>
                  ) : (
                    <input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {isCorrect && !preview && <em>✓ Jawaban Benar</em>}
                  {showResult && isCorrect && <em>✓ Benar</em>}
                  {showResult && isSelected && !isCorrect && <em>✕ Salah</em>}
                </button>
              );
            })}
          </div>

          {preview && selectedAnswer !== null && (
            <div className="quiz-result-box">
              {selectedAnswer === q.answer ? (
                <b className="right">Jawaban kamu benar ✅</b>
              ) : (
                <b className="wrong">
                  Jawaban salah ❌. Jawaban benar: {["A", "B", "C", "D"][q.answer]}
                </b>
              )}
            </div>
          )}
        </section>
      </main>

      <aside className="quiz-mini-tools">
        <h3>Tools</h3>
        <button>Theme</button>
        <button>Background</button>
        <button>Music</button>
        <button>Transition</button>
        <button>Simpan Quiz</button>
        <button>Publish</button>
      </aside>
    </div>
  );
}
