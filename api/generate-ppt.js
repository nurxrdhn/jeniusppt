import { requireFirebaseUser } from "./_auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireFirebaseUser(req, res))) return;
  if (!process.env.OPENAI_API_KEY)
    return res
      .status(503)
      .json({ error: "OPENAI_API_KEY belum dipasang di Vercel." });
  const { prompt, level = "SMA", slides = 8 } = req.body || {};
  if (!prompt?.trim())
    return res.status(400).json({ error: "Topik belum diisi." });
  const instruction = `Buat materi presentasi pendidikan berbahasa Indonesia untuk jenjang ${level}. Topik: ${prompt}. Hasil wajib JSON valid tanpa markdown dengan struktur {"title":"", "subject":"", "className":"${level}", "slides":[{"title":"", "body":"maksimal 45 kata", "background":{"type":"css","value":"linear-gradient(135deg,#7c2d12,#f97316)"}, "transition":"morph"}], "questions":[{"type":"pg","question":"","options":["","","",""],"answer":0,"timer":20,"points":1000}]}. Buat tepat ${Math.max(4, Math.min(20, Number(slides)))} slide, alur pembuka-konsep-contoh-rangkuman, dan 5 soal. Gunakan isi faktual, jelas, visual, tidak generik.`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        input: instruction,
      }),
    });
    const data = await response.json();
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: data.error?.message || "OpenAI gagal memproses." });
    const text =
      data.output_text ||
      data.output?.flatMap((x) => x.content || []).find((x) => x.text)?.text;
    const clean = String(text || "").replace(/^```json\s*|\s*```$/g, "");
    return res.status(200).json(JSON.parse(clean));
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Respons AI tidak valid." });
  }
}
