import { useEffect, useState } from "react";
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { ArrowRight, Sparkles } from "lucide-react";
import { auth, googleProvider } from "../../firebase/config";
import GoogleLogo from "../ui/GoogleLogo";
import JeniusMark from "../ui/JeniusMark";
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
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (active && user) completeLogin(user);
    });
    async function finishRedirectLogin() {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await getRedirectResult(auth);
        if (active && result?.user) completeLogin(result.user);
      } catch (loginError) {
        console.error("Google redirect login failed", loginError);
        if (active) setError(loginMessage(loginError));
      }
    }
    finishRedirectLogin();
    return () => { active = false; unsubscribe(); };
  }, []);

  function completeLogin(user) {
    onLogin({
      uid: user.uid,
      name: user.displayName || "Guru",
      email: user.email,
      photoURL: user.photoURL,
      role: "teacher",
    });
  }

  function loginMessage(loginError) {
    const code = loginError?.code || "";
    if (code.includes("unauthorized-domain"))
      return "Domain jeniusppt.online belum diizinkan pada Firebase Authentication.";
    if (code.includes("popup-blocked"))
      return "Popup diblokir browser. Izinkan popup atau coba masuk kembali.";
    if (code.includes("network-request-failed"))
      return "Koneksi ke Google gagal. Periksa jaringan lalu coba kembali.";
    return "Login Google gagal. Periksa domain Firebase dan konfigurasi OAuth.";
  }

  async function login() {
    try {
      setError("");
      await setPersistence(auth, browserLocalPersistence);
      googleProvider.setCustomParameters({ prompt: "select_account" });
      try {
        const result = await signInWithPopup(auth, googleProvider);
        completeLogin(result.user);
      } catch (popupError) {
        const fallbackCodes = ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/web-storage-unsupported"];
        if (!fallbackCodes.includes(popupError?.code)) throw popupError;
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (loginError) {
      console.error("Google login failed", loginError);
      setError(loginMessage(loginError));
    }
  }
  return (
    <main className="opening-page">
      <section className="opening-shell">
        <div className="opening-left">
          <div className="brand-row logo-only">
            <div className="opening-logo-shell">
              <JeniusMark className="opening-logo" inverse />
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
            <JeniusMark title="Logo JP" />
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
