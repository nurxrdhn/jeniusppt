import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";
import GoogleLogo from "../ui/GoogleLogo";

const slides = [
  {
    title: "Buat Materi Interaktif Lebih Cepat",
    desc: "Susun materi, slide, dan kuis dalam satu ruang kerja yang rapi.",
  },
  {
    title: "Bagikan Link ke Siswa",
    desc: "Siswa cukup membuka link, lalu mengisi nama, jenis kelamin, dan kelas.",
  },
  {
    title: "Pantau Aktivitas dan Nilai",
    desc: "Guru dapat melihat peserta masuk, progres belajar, dan hasil kuis.",
  },
];

export default function OpeningLogin({ onLogin }) {
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      onLogin({
        uid: result.user.uid,
        name: result.user.displayName || "Guru",
        email: result.user.email,
        photoURL: result.user.photoURL,
        role: "teacher",
      });
    } catch (err) {
      setError("Login Google belum berhasil. Pastikan Google Auth aktif dan domain sudah diizinkan di Firebase.");
    }
  }

  return (
    <main className="opening-page">
      <section className="opening-shell">
        <div className="opening-panel">
          <div className="brand-row">
            <div className="logo-mark">J</div>
            <div>
              <h2>JeniusPPT</h2>
              <p>Create. Teach. Quiz. Analyze.</p>
            </div>
          </div>

          <div className="opening-copy">
            <span>Platform pembelajaran interaktif</span>
            <h1>{slides[active].title}</h1>
            <p>{slides[active].desc}</p>
          </div>

          <div className="opening-dots">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={active === i ? "active" : ""} />
            ))}
          </div>
        </div>

        <div className="login-card">
          <span className="eyebrow">Masuk Guru</span>
          <h2>Kelola kelas dari satu dashboard</h2>
          <p>Gunakan akun Google untuk masuk. Foto profil dan nama akan mengikuti akun Gmail.</p>

          <button className="google-button" onClick={handleGoogleLogin}>
            <GoogleLogo />
            Lanjutkan dengan Google
          </button>

          {error && <div className="error-box">{error}</div>}

          <small>Siswa tidak perlu akun. Guru cukup membagikan link materi atau kuis.</small>
        </div>
      </section>
    </main>
  );
}
