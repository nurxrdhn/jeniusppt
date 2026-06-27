import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";

export default function Login({ setUser }) {
  async function loginGuru() {
    const result = await signInWithPopup(auth, googleProvider);
    setUser({
      role: "teacher",
      name: result.user.displayName,
      email: result.user.email,
    });
  }

  function loginSiswa(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    setUser({
      role: "student",
      name: form.get("name"),
      kelas: form.get("kelas"),
      code: form.get("code"),
    });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>JeniusPPT</h1>
        <p>Masuk sebagai guru atau siswa.</p>

        <button className="google-btn" onClick={loginGuru}>
          🔐 Login Guru dengan Google
        </button>

        <div className="divider">atau masuk sebagai siswa</div>

        <form onSubmit={loginSiswa}>
          <input name="name" placeholder="Nama siswa" required />
          <input name="kelas" placeholder="Kelas" required />
          <input name="code" placeholder="Password / Kode kelas" required />
          <button className="student-btn">Masuk sebagai Siswa</button>
        </form>
      </div>
    </div>
  );
}
