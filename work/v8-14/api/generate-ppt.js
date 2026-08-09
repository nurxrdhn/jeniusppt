import { requireFirebaseUser } from "./_auth.js";
import { callGemini } from "./_gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireFirebaseUser(req, res))) return;
  const { prompt, level = "SMA", slides = 8 } = req.body || {};
  if (!prompt?.trim()) return res.status(400).json({ error: "Topik belum diisi." });
  const safeSlides = Math.max(4, Math.min(20, Number(slides)));
  try {
    const data = await callGemini({
      prompt: `Buat materi presentasi pendidikan berbahasa Indonesia untuk jenjang ${level}. Topik dan tujuan pengguna: ${prompt}. Buat tepat ${safeSlides} slide dengan alur pembuka, konsep inti, contoh kontekstual, aktivitas atau refleksi, lalu rangkuman. Buat tepat 5 soal pilihan ganda. Isi harus faktual, spesifik, tidak generik, dan setiap body maksimal 45 kata. Pilih gradasi latar modern yang menjaga keterbacaan. Jawab hanya sebagai JSON sesuai skema.`,
      jsonSchema: {
        type: "object",
        required: ["title", "subject", "className", "slides", "questions"],
        properties: {
          title: { type: "string" }, subject: { type: "string" }, className: { type: "string" },
          slides: { type: "array", minItems: safeSlides, maxItems: safeSlides, items: { type: "object", required: ["title", "body", "background", "transition"], properties: { title: { type: "string" }, body: { type: "string" }, background: { type: "object", required: ["type", "value"], properties: { type: { type: "string", enum: ["css"] }, value: { type: "string" } } }, transition: { type: "string", enum: ["morph"] } } } },
          questions: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", required: ["type", "question", "options", "answer", "timer", "points"], properties: { type: { type: "string", enum: ["pg"] }, question: { type: "string" }, options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } }, answer: { type: "integer", minimum: 0, maximum: 3 }, timer: { type: "integer", enum: [20] }, points: { type: "integer", enum: [1000] } } } },
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Respons AI tidak valid." });
  }
}
