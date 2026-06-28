import { X, Code2, Wand2 } from "lucide-react";
import { SLIDE_SIZES } from "../../utils/slideSizes";

const sampleCode = `export default {
  title: "Presiden Indonesia",
  subject: "PPKN",
  className: "XI",

  slides: [
    {
      title: "Presiden Indonesia",
      body: "Presiden adalah kepala negara dan kepala pemerintahan."
    },
    {
      title: "Tugas Presiden",
      body: "Menjalankan pemerintahan dan menetapkan kebijakan negara."
    }
  ],

  questions: [
    {
      type: "pg",
      question: "Siapa presiden pertama Indonesia?",
      options: ["Soekarno", "Soeharto", "Habibie", "Megawati"],
      answer: 0
    },
    {
      type: "truefalse",
      question: "Presiden dipilih melalui pemilu.",
      answer: true
    }
  ]
}`;

function parseCode(raw) {
  const cleaned = raw
    .replace(/export\s+default\s+/g, "")
    .replace(/module\.exports\s*=\s*/g, "")
    .trim()
    .replace(/;$/g, "");

  return Function(`"use strict"; return (${cleaned});`)();
}

export default function CodeImportModal({ onClose, onImport, notify }) {
  function submit(e) {
    e.preventDefault();

    try {
      const raw = e.currentTarget.code.value;
      const data = parseCode(raw);

      const material = {
        title: data.title || "Materi Import",
        subject: data.subject || data.mapel || "Umum",
        className: data.className || data.kelas || "Kelas",
        slideSize: data.slideSize || SLIDE_SIZES.wide,
        slides: (data.slides || []).map((slide) => ({
          title: slide.title || "Slide",
          body: slide.body || slide.text || "Mulai mengetik...",
          background: slide.background || {
            type: "css",
            value: "linear-gradient(135deg,#0b1f46,#1d4ed8)",
          },
        })),
        questions: (data.questions || data.quiz || []).map((q) => ({
          type: q.type === "bs" ? "truefalse" : q.type || "pg",
          question: q.question,
          options: q.options || ["Benar", "Salah"],
          answer: q.answer,
          timer: q.timer || 15,
          points: q.points || 1000,
        })),
      };

      onImport(material);
      onClose();
      notify("Materi dibuat dari kode.");
    } catch (error) {
      console.error(error);
      notify("Kode belum valid.");
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="code-modal">
        <header>
          <div>
            <span className="eyebrow"><Code2 size={15} /> Import Code</span>
            <h2>Buat dari Kode</h2>
          </div>
          <button onClick={onClose}><X size={22} /></button>
        </header>

        <form onSubmit={submit}>
          <textarea name="code" defaultValue={sampleCode} spellCheck="false" />
          <button className="primary-button">
            <Wand2 size={18} />
            Generate
          </button>
        </form>
      </section>
    </div>
  );
}
