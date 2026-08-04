import { useMemo, useState } from "react";
import { BookmarkPlus, Plus, Search, Trash2 } from "lucide-react";
import SolidSelect from "../ui/SolidSelect";
const BANK_KEY = "jeniusppt_question_bank_v1";
const loadBank = () => {
  try {
    return JSON.parse(localStorage.getItem(BANK_KEY)) || [];
  } catch {
    return [];
  }
};
export default function QuizBuilder({ material, updateMaterial }) {
  const questions = material.questions || [];
  const activeIndex = material.activeQuestion || 0;
  const q = questions[activeIndex] || questions[0];
  const [bank, setBank] = useState(loadBank);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("Semua");
  function setQuestions(next) {
    updateMaterial(material.id, { questions: next });
  }
  function updateQuestion(patch) {
    setQuestions(
      questions.map((item, i) =>
        i === activeIndex ? { ...item, ...patch } : item,
      ),
    );
  }
  function addQuestion(type = "pg", source) {
    const nextQ = source
      ? { ...source, id: undefined }
      : type === "truefalse"
        ? {
            type: "truefalse",
            question: "Pernyataan benar atau salah.",
            answer: true,
            timer: 15,
            points: 1000,
            difficulty: "Mudah",
            topic: material.subject,
          }
        : {
            type: "pg",
            question: "Pertanyaan pilihan ganda.",
            options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
            answer: 0,
            timer: 15,
            points: 1000,
            difficulty: "Mudah",
            topic: material.subject,
          };
    const next = [...questions, nextQ];
    setQuestions(next);
    updateMaterial(material.id, { activeQuestion: next.length - 1 });
  }
  function deleteQuestion() {
    if (questions.length <= 1) return;
    const next = questions.filter((_, i) => i !== activeIndex);
    setQuestions(next);
    updateMaterial(material.id, {
      activeQuestion: Math.max(0, activeIndex - 1),
    });
  }
  function updateOption(index, value) {
    const options = [...q.options];
    options[index] = value;
    updateQuestion({ options });
  }
  function saveBank() {
    if (!q) return;
    const item = {
      ...q,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      topic: q.topic || material.subject,
      difficulty: q.difficulty || "Mudah",
    };
    const next = [item, ...bank];
    setBank(next);
    localStorage.setItem(BANK_KEY, JSON.stringify(next));
  }
  function removeBank(id) {
    const next = bank.filter((item) => item.id !== id);
    setBank(next);
    localStorage.setItem(BANK_KEY, JSON.stringify(next));
  }
  const shown = useMemo(
    () =>
      bank.filter((item) => {
        const keyword = search.toLowerCase();
        return (
          (!keyword ||
            item.question.toLowerCase().includes(keyword) ||
            String(item.topic || "")
              .toLowerCase()
              .includes(keyword)) &&
          (difficulty === "Semua" || item.difficulty === difficulty)
        );
      }),
    [bank, search, difficulty],
  );
  return (
    <div className="quiz-editor">
      <aside className="question-list">
        <div className="panel-head">
          <h3>Soal</h3>
          <button onClick={() => addQuestion("pg")}>
            <Plus size={16} />
          </button>
        </div>
        {questions.map((item, i) => (
          <button
            key={i}
            className={i === activeIndex ? "active" : ""}
            onClick={() => updateMaterial(material.id, { activeQuestion: i })}
          >
            <span>{i + 1}</span>
            <b>{item.type === "truefalse" ? "B/S" : "PG"}</b>
          </button>
        ))}
        <button
          className="outline-btn"
          onClick={() => addQuestion("truefalse")}
        >
          + B/S
        </button>
      </aside>
      <main className="quiz-stage">
        <div className="editor-toolbar">
          <button onClick={() => addQuestion("pg")}>
            <Plus size={16} />
            PG
          </button>
          <button onClick={() => addQuestion("truefalse")}>
            <Plus size={16} />
            B/S
          </button>
          <button onClick={saveBank}>
            <BookmarkPlus size={16} />
            Simpan ke Bank
          </button>
          <button onClick={deleteQuestion}>
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
        <section className="quiz-canvas">
          <textarea
            value={q?.question || ""}
            onChange={(e) => updateQuestion({ question: e.target.value })}
            className="quiz-question-input"
          />
          {q?.type === "truefalse" ? (
            <div className="tf-grid">
              {[true, false].map((value) => (
                <button
                  key={String(value)}
                  className={q.answer === value ? "selected" : ""}
                  onClick={() => updateQuestion({ answer: value })}
                >
                  {value ? "Benar" : "Salah"}
                </button>
              ))}
            </div>
          ) : (
            <div className="answer-grid">
              {q?.options?.map((option, i) => (
                <button
                  key={i}
                  className={q.answer === i ? "selected" : ""}
                  onClick={() => updateQuestion({ answer: i })}
                >
                  <b>{["A", "B", "C", "D"][i]}</b>
                  <input
                    value={option}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateOption(i, e.target.value)}
                  />
                  {q.answer === i && <em>✓</em>}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <aside className="properties-panel question-bank-panel">
        <h3>Pengaturan Kuis</h3>
        <label>Topik</label>
        <input
          value={q?.topic || material.subject || ""}
          onChange={(e) => updateQuestion({ topic: e.target.value })}
        />
        <label>Tingkat Kesulitan</label>
        <SolidSelect
          value={q?.difficulty || "Mudah"}
          onChange={(e) => updateQuestion({ difficulty: e.target.value })}
        >
          <option>Mudah</option>
          <option>Sedang</option>
          <option>Sulit</option>
        </SolidSelect>
        <label>Tipe</label>
        <SolidSelect
          value={q?.type || "pg"}
          onChange={(e) =>
            updateQuestion(
              e.target.value === "truefalse"
                ? { type: "truefalse", answer: true }
                : {
                    type: "pg",
                    options: q.options || ["A", "B", "C", "D"],
                    answer: 0,
                  },
            )
          }
        >
          <option value="pg">Pilihan Ganda</option>
          <option value="truefalse">Benar/Salah</option>
        </SolidSelect>
        <label>Timer</label>
        <SolidSelect
          value={q?.timer || 15}
          onChange={(e) => updateQuestion({ timer: Number(e.target.value) })}
        >
          <option>10</option>
          <option>15</option>
          <option>20</option>
          <option>30</option>
          <option>60</option>
        </SolidSelect>
        <label>Poin</label>
        <SolidSelect
          value={q?.points || 1000}
          onChange={(e) => updateQuestion({ points: Number(e.target.value) })}
        >
          <option>0</option>
          <option>500</option>
          <option>1000</option>
          <option>2000</option>
        </SolidSelect>
        <div className="bank-divider">
          <h3>Bank Soal</h3>
          <span>{bank.length} soal tersimpan</span>
        </div>
        <div className="bank-search">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari soal atau topik"
          />
        </div>
        <SolidSelect
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Semua</option>
          <option>Mudah</option>
          <option>Sedang</option>
          <option>Sulit</option>
        </SolidSelect>
        <div className="bank-list">
          {shown.length ? (
            shown.map((item) => (
              <article key={item.id}>
                <button
                  className="bank-use"
                  onClick={() => addQuestion(item.type, item)}
                >
                  <b>{item.question}</b>
                  <small>
                    {item.topic || "Umum"} • {item.difficulty || "Mudah"}
                  </small>
                </button>
                <button
                  className="bank-delete"
                  onClick={() => removeBank(item.id)}
                >
                  <Trash2 size={13} />
                </button>
              </article>
            ))
          ) : (
            <p>Belum ada soal tersimpan.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
