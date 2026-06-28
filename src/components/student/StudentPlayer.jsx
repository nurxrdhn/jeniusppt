import { useMemo, useState } from 'react';
import { SLIDE_SIZES, ratioStyle } from '../../utils/slideSizes';

export default function StudentPlayer() {
  const code = window.location.pathname.split('/play/')[1] || '';

  const data = useMemo(() => {
    const saved = localStorage.getItem(`jeniusppt_package_${code}`);

    if (!saved) return null;

    const material = JSON.parse(saved);

    if (material.shareCode !== code) return null;

    return material;
  }, [code]);

  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState('slide');
  const [slide, setSlide] = useState(0);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [correct, setCorrect] = useState(0);

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
              name: f.get('name'),
              gender: f.get('gender'),
              className: f.get('className'),
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

  if (mode === 'result') {
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

  if (mode === 'quiz') {
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

    const isTF = q.type === 'truefalse';
    const options = isTF ? ['Benar', 'Salah'] : q.options || [];

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
                  key={opt}
                  disabled={show}
                  className={show && isRight ? 'correct' : show && picked ? 'wrong' : ''}
                  onClick={() => {
                    setAnswer(value);
                    if (isRight) setCorrect((v) => v + 1);
                  }}
                >
                  <b>{isTF ? (i === 0 ? '✓' : '✕') : ['A', 'B', 'C', 'D'][i]}</b>
                  {opt}
                </button>
              );
            })}
          </div>

          {answer !== null && (
            <div className="answer-result">
              {answer === q.answer ? '✅ Benar' : '❌ Salah'}

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
                <button onClick={() => setMode('result')}>Skor</button>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  const s = slides[slide];
  const bg = s?.background || {
    type: 'css',
    value: 'linear-gradient(135deg,#0b1f46,#1d4ed8)',
  };

  return (
    <main className="student-page">
      <section
        className="student-slide ppt-like"
        style={{
          ...ratioStyle(data.slideSize || SLIDE_SIZES.wide),
          ...(bg.type === 'image'
            ? { backgroundImage: `url(${bg.value})` }
            : { background: bg.value }),
        }}
      >
        <div className="student-meta">
          <b>{student.name}</b>
          <span>Slide {slide + 1}/{slides.length}</span>
        </div>

        <h1>{s?.title || data.title}</h1>
        <p>{s?.body || 'Materi belum memiliki isi.'}</p>

        <div className="student-controls">
          <button disabled={slide === 0} onClick={() => setSlide((i) => i - 1)}>
            ←
          </button>

          {slide < slides.length - 1 ? (
            <button onClick={() => setSlide((i) => i + 1)}>→</button>
          ) : (
            <button onClick={() => setMode(questions.length ? 'quiz' : 'result')}>
              {questions.length ? 'Kuis' : 'Selesai'}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
