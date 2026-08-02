import { requireFirebaseUser } from "./_auth.js";

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method))
    return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireFirebaseUser(req, res))) return;
  if (!process.env.GOOGLE_TRANSLATE_API_KEY)
    return res
      .status(503)
      .json({ error: "GOOGLE_TRANSLATE_API_KEY belum dipasang di Vercel." });
  if (req.method === "GET") {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/languages?target=id&key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
    );
    const data = await response.json();
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: data.error?.message || "Daftar bahasa gagal dimuat." });
    return res.status(200).json({ languages: data.data.languages });
  }
  const { texts = [], target = "en" } = req.body || {};
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: texts.slice(0, 100),
          target,
          format: "text",
        }),
      },
    );
    const data = await response.json();
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: data.error?.message || "Terjemahan gagal." });
    return res.status(200).json({
      translations: data.data.translations.map((item) => item.translatedText),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
