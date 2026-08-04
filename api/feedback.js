import nodemailer from "nodemailer";
import { requireFirebaseUser } from "./_auth.js";

const clean = (value, max = 1500) => String(value || "").trim().slice(0, max);
const escapeHtml = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const firebaseUser = await requireFirebaseUser(req, res);
  if (!firebaseUser) return;

  const { name, email, category, rating, ratingLabel, comment } = req.body || {};
  const safeRating = Number(rating);
  const safeComment = clean(comment);
  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) return res.status(400).json({ error: "Penilaian harus antara 1 sampai 5." });
  if (safeComment.length < 10) return res.status(400).json({ error: "Komentar minimal 10 karakter." });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const destination = process.env.FEEDBACK_TO_EMAIL || "jeniusppt@gmail.com";
  if (!gmailUser || !gmailPassword) return res.status(503).json({ error: "Pengiriman Gmail belum dikonfigurasi di Vercel." });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPassword },
    });
    const senderEmail = clean(email || firebaseUser.email, 254);
    await transporter.sendMail({
      from: `JeniusPPT <${gmailUser}>`,
      to: destination,
      replyTo: senderEmail || undefined,
      subject: `[JeniusPPT] ${clean(category, 80)} • ${safeRating}/5`,
      text: `Nama: ${clean(name, 120)}\nEmail: ${senderEmail || "Tidak tersedia"}\nKategori: ${clean(category, 80)}\nPenilaian: ${safeRating}/5 ${clean(ratingLabel, 80)}\n\nKomentar:\n${safeComment}`,
      html: `<h2>Masukan baru JeniusPPT</h2><table cellpadding="8" style="border-collapse:collapse"><tr><td><b>Nama</b></td><td>${escapeHtml(name)}</td></tr><tr><td><b>Email</b></td><td>${escapeHtml(senderEmail || "Tidak tersedia")}</td></tr><tr><td><b>Kategori</b></td><td>${escapeHtml(category)}</td></tr><tr><td><b>Penilaian</b></td><td>${safeRating}/5 ${escapeHtml(ratingLabel)}</td></tr></table><h3>Komentar</h3><p style="white-space:pre-wrap">${escapeHtml(safeComment)}</p>`,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Feedback email failed", error?.code || error?.message);
    return res.status(502).json({ error: "Gmail gagal menerima masukan. Periksa App Password di Vercel." });
  }
}
