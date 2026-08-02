import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { ArrowRight, Sparkles } from "lucide-react";
import { auth, googleProvider } from "../../firebase/config";
import GoogleLogo from "../ui/GoogleLogo";
const slides = [
  {
    title: "Mengajar Lebih Mudah",
    desc: "Kelas interaktif dalam satu tempat.",
  },
  { title: "Presentasi & Kuis", desc: "Belajar tanpa berpindah aplikasi." },
  { title: "Siap Digunakan", desc: "Masuk dengan akun Google." },
];
export default function OpeningLogin({ onLogin }) {
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const t = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);
  async function login() {
    try {
      setError("");
      const r = await signInWithPopup(auth, googleProvider);
      onLogin({
        uid: r.user.uid,
        name: r.user.displayName || "Guru",
        email: r.user.email,
        photoURL: r.user.photoURL,
        role: "teacher",
      });
    } catch {
      setError("Google Auth belum aktif atau domain belum diizinkan.");
    }
  }
  return (
    <main className="opening-page">
      <section className="opening-shell">
        <div className="opening-left">
          <div className="brand-row logo-only">
            <div className="opening-logo-shell">
              <img
                className="opening-logo"
                src="/jeniusppt-icon.svg"
                alt="Logo JP"
              />
            </div>
          </div>
          <div className="opening-copy" key={active}>
            <span>
              <Sparkles size={15} />
              Learning Presentation
            </span>
            <h1>{slides[active].title}</h1>
            <p>{slides[active].desc}</p>
          </div>
          <div className="opening-benefits">
            <b>Presentasi modern</b>
            <b>Kuis interaktif</b>
            <b>Ekspor mudah</b>
          </div>
          <div className="opening-progress">
            {slides.map((_, i) => (
              <button
                key={i}
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
        <div className="login-card">
          <div className="login-brand-mobile">
            <img src="/jeniusppt-icon.svg" alt="Logo JP" />
          </div>
          <span className="eyebrow">Khusus Guru</span>
          <h2>Selamat Datang</h2>
          <p>
            Masuk untuk membuat materi yang lebih hidup, menarik, dan mudah
            dibagikan.
          </p>
          <button className="google-btn" onClick={login}>
            <GoogleLogo />
            Lanjutkan dengan Google
            <ArrowRight size={18} />
          </button>
          <small>Login aman menggunakan akun Google Anda.</small>
          {error && <div className="error-box">{error}</div>}
        </div>
      </section>
    </main>
  );
}
