const DEFAULT_MODEL = "gemini-2.5-flash";

export async function callGemini({ prompt, jsonSchema }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY belum dipasang di Vercel.");
    error.status = 503;
    throw error;
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const generationConfig = { temperature: 0.55, responseMimeType: "application/json" };
  if (jsonSchema) generationConfig.responseJsonSchema = jsonSchema;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || "Gemini gagal memproses permintaan.");
    error.status = response.status;
    throw error;
  }
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (!text) {
    const error = new Error("Gemini tidak menghasilkan jawaban. Coba ubah instruksi Anda.");
    error.status = 502;
    throw error;
  }
  return JSON.parse(String(text).replace(/^```json\s*|\s*```$/g, ""));
}
