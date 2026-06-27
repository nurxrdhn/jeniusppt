import { useState } from "react";

export default function QuizBuilder() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: "Pilihan Ganda",
      question: "Apa yang dimaksud inflasi?",
      options: ["Harga naik secara umum", "Harga turun", "Produksi naik", "Ekspor naik"],
      answer: 0,
      timer: 15,
      points: 1000,
      explanation: "Inflasi adalah kenaikan harga barang dan jasa secara umum.",
    },
  ]);

  const [active, setActive] = useState(0);
  const q = questions[active];

  function updateQuestion(field, value) {
    setQuestions((old) =>
      old.map((item, index) =>
        index === active ? { ...item, [field]: value } : item
      )
    );
  }

  function updateOption(index, value) {
    const nextOptions = [...q.options];
    nextOptions[index] = value;
    updateQuestion("options", nextOptions);
  }

  function addQuestion() {
    const next = {
      id: Date.now(),
      type: "Pilihan Ganda",
      question: "Pertanyaan baru",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      answer: 0,
      timer: 15,
      points: 1000,
      explanation: "",
    };

    setQuestions([...questions, next]);
    setActive(questions.length);
  }

  function deleteQuestion() {
    if (questions.length === 1) return alert("Minimal harus ada 1 soal.");
    const next = questions.filter((_, index) => index !== active);
    setQuestions(next);
    setActive(Math.max(0, active - 1));
  }

  return (
    <div className="quiz-builder">
      <aside className="quiz-list">
        <div className="quiz-list-head">
          <h3>Soal</h3>
          <button onClick={addQuestion}>+ Soal</button>
        </div>

        {questions.map((item, index) => (
          <button
            key={item.id}
            className={active === index ? "active" : ""}
            onClick={() => setActive(index)}
          >
            <span>{index + 1}</span>
            <div>
              <b>Soal {index + 1}</b>
              <small>{item.type}</small>
            </div>
          </button>
        ))}
      </aside>

      <main className="quiz-editor">
        <div className="quiz-top">
          <select value={q.type} onChange={(e) => updateQuestion("type", e.target.value)}>
            <option>Pilihan Ganda</option>
            <option>Benar / Salah</option>
            <option>Essay</option>
            <option>Polling</option>
          </select>

          <button onClick={deleteQuestion}>Hapus Soal</button>
        </div>

        <label>Pertanyaan</label>
        <textarea
          value={q.question}
          onChange={(e) => updateQuestion("question", e.target.value)}
        />

        <div className="media-box">
          <button>Upload Gambar</button>
          <button>Upload Video</button>
        </div>

        {q.type === "Pilihan Ganda" && (
          <div className="kahoot-options">
            {q.options.map((option, index) => (
              <div className={`option option-${index}`} key={index}>
                <span>{["A", "B", "C", "D"][index]}</span>
                <input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
              </div>
            ))}

            <div className="answer-box">
              <h3>Jawaban Benar</h3>
              {q.options.map((_, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    name="answer"
                    checked={q.answer === index}
                    onChange={() => updateQuestion("answer", index)}
                  />
                  {["A", "B", "C", "D"][index]}
                </label>
              ))}
            </div>
          </div>
        )}

        {q.type === "Benar / Salah" && (
          <div className="true-false">
            <button onClick={() => updateQuestion("answer", "Benar")}>Benar</button>
            <button onClick={() => updateQuestion("answer", "Salah")}>Salah</button>
          </div>
        )}

        {q.type === "Essay" && (
          <>
            <label>Jawaban Acuan</label>
            <textarea placeholder="Tulis jawaban acuan..." />
          </>
        )}

        <label>Penjelasan Jawaban</label>
        <textarea
          value={q.explanation}
          onChange={(e) => updateQuestion("explanation", e.target.value)}
        />
      </main>

      <aside className="quiz-properties">
        <h3>Properties</h3>

        <label>Timer</label>
        <select value={q.timer} onChange={(e) => updateQuestion("timer", e.target.value)}>
          <option>5</option>
          <option>10</option>
          <option>15</option>
          <option>20</option>
          <option>30</option>
          <option>60</option>
        </select>

        <label>Poin</label>
        <select value={q.points} onChange={(e) => updateQuestion("points", e.target.value)}>
          <option>0</option>
          <option>500</option>
          <option>1000</option>
          <option>2000</option>
        </select>

        <div className="toggle-row">
          <span>Acak Jawaban</span>
          <input type="checkbox" />
        </div>

        <div className="toggle-row">
          <span>Tampilkan Pembahasan</span>
          <input type="checkbox" defaultChecked />
        </div>

        <button className="quiz-preview">Preview</button>
        <button className="quiz-save">Simpan Kuis</button>
      </aside>
    </div>
  );
}
