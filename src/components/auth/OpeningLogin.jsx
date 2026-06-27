import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";

const slides = [
  {
    title: "Buat Materi Interaktif Lebih Cepat",
    desc: "Susun materi pembelajaran, slide, dan kuis dalam satu ruang kerja yang rapi.",
  },
  {
    title: "Bagikan Link ke Siswa",
    desc: "Siswa cukup membuka link, mengisi nama, jenis kelamin, dan kelas tanpa membuat akun.",
  },
  {
    title: "Pantau Aktivitas dan Nilai",
    desc: "Guru dapat melihat siapa yang masuk, progres belajar, jawaban kuis, dan hasil nilai.",
  },
];

function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.2-5.2C29.1 35.2 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.4 39.6 16.1 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

export default function OpeningLogin({ setUser, setStudentView }) {
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");

  async function loginWithGoogle() {
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      setUser({
        role: "teacher",
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      });
    } catch (err) {
      setError("Login Google belum berhasil. Pastikan Google Auth aktif di Firebase dan domain sudah diizinkan.");
    }
  }

  return (
    <div className="opening-page">
      <div className="opening-shell">
        <section className="opening-left">
          <div className="opening-brand">
            <div className="opening-logo">J</div>
            <div>
              <h2>JeniusPPT</h2>
              <p>Create. Teach. Quiz. Analyze.</p>
            </div>
          </div>

          <div className="opening-slide">
            <span>Platform pembelajaran interaktif</span>
            <h1>{slides[active].title}</h1>
            <p>{slides[active].desc}</p>
          </div>

          <div className="opening-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </section>

        <section className="opening-card">
          <h2>Masuk sebagai Guru</h2>
          <p>Gunakan akun Google untuk mengelola materi, PPT, kuis, dan aktivitas siswa.</p>

          <button className="google-login-btn" onClick={loginWithGoogle}>
            <GoogleLogo />
            Lanjutkan dengan Google
          </button>

          <button className="student-preview-btn" onClick={() => setStudentView(true)}>
            Lihat tampilan siswa
          </button>

          {error && <div className="login-error">{error}</div>}

          <small>
            Siswa tidak perlu akun. Guru cukup membagikan link materi atau kuis.
          </small>
        </section>
      </div>
    </div>
  );
}
