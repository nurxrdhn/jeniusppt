import { requireFirebaseUser } from "./_auth.js";
import { callGemini } from "./_gemini.js";

const languages = [
  ["id", "Bahasa Indonesia"], ["en", "English"], ["ms", "Bahasa Melayu"], ["jv", "Basa Jawa"], ["su", "Basa Sunda"],
  ["ar", "العربية"], ["zh-CN", "中文（简体）"], ["zh-TW", "中文（繁體）"], ["ja", "日本語"], ["ko", "한국어"],
  ["hi", "हिन्दी"], ["bn", "বাংলা"], ["ur", "اردو"], ["th", "ไทย"], ["vi", "Tiếng Việt"], ["tl", "Filipino"],
  ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"], ["it", "Italiano"], ["pt", "Português"], ["nl", "Nederlands"],
  ["ru", "Русский"], ["uk", "Українська"], ["tr", "Türkçe"], ["pl", "Polski"], ["cs", "Čeština"], ["sk", "Slovenčina"],
  ["ro", "Română"], ["hu", "Magyar"], ["el", "Ελληνικά"], ["sv", "Svenska"], ["no", "Norsk"], ["da", "Dansk"], ["fi", "Suomi"],
  ["he", "עברית"], ["fa", "فارسی"], ["sw", "Kiswahili"], ["af", "Afrikaans"], ["am", "አማርኛ"], ["ta", "தமிழ்"],
  ["te", "తెలుగు"], ["mr", "मराठी"], ["gu", "ગુજરાતી"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"],
  ["ne", "नेपाली"], ["si", "සිංහල"], ["my", "မြန်မာ"], ["km", "ខ្មែរ"], ["lo", "ລາວ"], ["mn", "Монгол"],
  ["ka", "ქართული"], ["hy", "Հայերեն"], ["az", "Azərbaycanca"], ["uz", "O‘zbekcha"], ["kk", "Қазақша"],
  ["sq", "Shqip"], ["bs", "Bosanski"], ["hr", "Hrvatski"], ["sr", "Српски"], ["bg", "Български"], ["sl", "Slovenščina"],
  ["et", "Eesti"], ["lv", "Latviešu"], ["lt", "Lietuvių"], ["is", "Íslenska"], ["ga", "Gaeilge"], ["cy", "Cymraeg"],
  ["eu", "Euskara"], ["ca", "Català"], ["gl", "Galego"], ["mt", "Malti"], ["mk", "Македонски"], ["so", "Soomaali"],
  ["zu", "isiZulu"], ["xh", "isiXhosa"], ["ha", "Hausa"], ["yo", "Yorùbá"], ["ig", "Igbo"], ["mi", "Māori"],
  ["haw", "ʻŌlelo Hawaiʻi"], ["ht", "Kreyòl ayisyen"], ["la", "Latina"], ["eo", "Esperanto"],
];

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireFirebaseUser(req, res))) return;
  if (req.method === "GET") return res.status(200).json({ languages: languages.map(([language, name]) => ({ language, name })) });
  const { texts = [], target = "en" } = req.body || {};
  if (!Array.isArray(texts) || !texts.length) return res.status(400).json({ error: "Teks belum tersedia." });
  if (!languages.some(([code]) => code === target)) return res.status(400).json({ error: "Bahasa tidak didukung." });
  try {
    const limitedTexts = texts.slice(0, 80).map(String);
    const result = await callGemini({
      prompt: `Terjemahkan setiap elemen array berikut ke bahasa dengan kode ${target}. Pertahankan nama merek JeniusPPT, angka, simbol, placeholder, dan urutan. Jangan menambah penjelasan. Input: ${JSON.stringify(limitedTexts)}`,
      jsonSchema: { type: "object", required: ["translations"], properties: { translations: { type: "array", minItems: limitedTexts.length, maxItems: limitedTexts.length, items: { type: "string" } } } },
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Terjemahan gagal." });
  }
}
