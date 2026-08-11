import { useRef, useState } from "react";
import {
  Download,
  FileDown,
  FileText,
  Presentation,
  UploadCloud,
} from "lucide-react";
import JSZip from "jszip";
import PptxGenJS from "pptxgenjs";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";
import { renderSlideToDataUrl } from "../../utils/slideRenderer";
import SolidSelect from "../ui/SolidSelect";

const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const safeName = (value) =>
  (value || "materi-jeniusppt").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
const colorFromBackground = (background, fallback = "FFF7ED") => {
  const matches = String(background?.value || "").match(/#[0-9a-f]{6}/gi);
  return matches?.[0]?.slice(1).toUpperCase() || fallback;
};
const pptColor = (value, fallback) =>
  String(value || fallback)
    .replace("#", "")
    .toUpperCase();
const powerpointSize = (source = {}) => {
  const width = Number(source.width) || 1920;
  const height = Number(source.height) || 1080;
  if (width <= 30 && height <= 30) return { width, height };
  const label = String(source.label || "").toLowerCase();
  if (label.includes("a4") && width >= height) return { width: 11.693, height: 8.268 };
  if (label.includes("a4")) return { width: 8.268, height: 11.693 };
  if (width >= height) {
    const safeHeight = 7.5;
    return { width: Math.min(13.333, safeHeight * (width / height)), height: safeHeight };
  }
  const safeWidth = 7.5;
  return { width: safeWidth, height: Math.min(13.333, safeWidth * (height / width)) };
};
const stripXml = (xml) =>
  xml
    .replace(/<a:br\s*\/>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

async function readOffice(file) {
  const zip = await JSZip.loadAsync(file);
  if (file.name.toLowerCase().endsWith(".pptx")) {
    const names = Object.keys(zip.files)
      .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    return Promise.all(
      names.map(async (name, index) => {
        const text = stripXml(await zip.file(name).async("text"));
        const parts = text.split(/(?<=[.!?])\s+/);
        return {
          title: parts.shift() || `Slide ${index + 1}`,
          body: parts.join(" ") || "Konten hasil impor",
          background: {
            type: "css",
            value: "#ff641e",
          },
        };
      }),
    );
  }
  const xml = await zip.file("word/document.xml")?.async("text");
  if (!xml) throw new Error("Dokumen Word tidak valid.");
  const paragraphs = xml.split("</w:p>").map(stripXml).filter(Boolean);
  return paragraphs.map((p, i) => ({
    title: i === 0 ? p.slice(0, 80) : `Bagian ${i + 1}`,
    body: i === 0 ? "Dokumen hasil impor" : p,
    background: {
      type: "css",
      value: "#ff641e",
    },
  }));
}

async function readPdf(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() })
    .promise;
  const slides = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => item.str)
      .join(" ")
      .trim();
    slides.push({
      title: text.slice(0, 80) || `Halaman ${i}`,
      body: text.slice(80) || "Konten hasil impor PDF",
      background: {
        type: "css",
        value: "#ff641e",
      },
    });
  }
  return slides;
}

export async function exportPptx(material) {
  const pptx = new PptxGenJS();
  const sourceSize = material.slideSize || { width: 1920, height: 1080 };
  const size = powerpointSize(sourceSize);
  pptx.defineLayout({
    name: "JENIUS_CUSTOM",
    width: size.width,
    height: size.height,
  });
  pptx.layout = "JENIUS_CUSTOM";
  pptx.author = "JeniusPPT";
  pptx.subject = material.subject;
  const isPublished = material.status === "Published";
  const liveUrl = isPublished && material.shareCode && typeof window !== "undefined"
    ? `${window.location.origin}/play/${encodeURIComponent(material.shareCode)}`
    : "";
  for (const item of material.slides || []) {
    const image = await renderSlideToDataUrl(item, sourceSize);
    const slide = pptx.addSlide();
    slide.addImage({ data: image, x: 0, y: 0, w: size.width, h: size.height });
    for (const element of item.elements || []) {
      if (["video", "audio"].includes(element.type)) {
        const directUrl = /^https?:/i.test(element.src || "") ? element.src : "";
        const mediaUrl = directUrl || liveUrl;
        slide.addText(mediaUrl
          ? (element.type === "video" ? "BUKA VIDEO" : "BUKA AUDIO")
          : "PUBLIKASIKAN UNTUK MEMBUKA MEDIA", {
          x: (element.x / 100) * size.width,
          y: (element.y / 100) * size.height,
          w: (element.w / 100) * size.width,
          h: Math.max(0.45, (element.h / 100) * size.height),
          color: "FFFFFF",
          bold: true,
          fill: { color: "172033" },
          align: "center",
          valign: "mid",
          ...(mediaUrl ? { hyperlink: { url: mediaUrl } } : {}),
        });
      }
    }
  }
  const questions = material.questions || [];
  questions.forEach((question, index) => {
    const isTrueFalse = question.type === "truefalse";
    const options = isTrueFalse ? ["Benar", "Salah"] : (question.options || []);
    const answerIndex = isTrueFalse
      ? (question.answer === true || question.answer === "Benar" || question.answer === 0 ? 0 : 1)
      : Number(question.answer ?? question.correctAnswer ?? 0);
    const quizSlide = pptx.addSlide();
    quizSlide.background = { color: "FFF7F1" };
    quizSlide.addText(`SOAL ${index + 1} / ${questions.length}`, { x: 0.6, y: 0.35, w: 4, h: 0.35, color: "C2410C", bold: true, fontSize: 13 });
    quizSlide.addText(`⏱ ${Math.max(5, Number(question.timer || 15))} detik`, { x: size.width - 2.5, y: 0.3, w: 1.8, h: 0.4, color: "FFFFFF", fill: { color: "E85D04" }, bold: true, align: "center", valign: "mid", margin: 0.05 });
    quizSlide.addText(question.question || "Pertanyaan", { x: 0.75, y: 1.05, w: size.width - 1.5, h: 1.2, color: "172033", bold: true, fontSize: 25, valign: "mid" });
    options.forEach((option, optionIndex) => {
      const columns = 2;
      const optionWidth = (size.width - 2.05) / columns;
      const x = 0.75 + (optionIndex % columns) * (optionWidth + 0.55);
      const y = 2.65 + Math.floor(optionIndex / columns) * 1.25;
      quizSlide.addText(`${isTrueFalse ? (optionIndex === 0 ? "✓" : "✕") : String.fromCharCode(65 + optionIndex)}  ${option}`, {
        x, y, w: optionWidth, h: 0.82, color: "172033", fill: { color: "FFFFFF" },
        line: { color: "F4A261", width: 1.2 }, bold: true, fontSize: 16,
        valign: "mid", margin: 0.15,
      });
    });

    const answerSlide = pptx.addSlide();
    answerSlide.background = { color: "172033" };
    answerSlide.addText("JAWABAN BENAR", { x: 0.8, y: 1.15, w: size.width - 1.6, h: 0.55, color: "F4A261", bold: true, fontSize: 18, align: "center" });
    answerSlide.addText(options[answerIndex] || "Jawaban belum ditentukan", { x: 1, y: 2, w: size.width - 2, h: 1.25, color: "FFFFFF", bold: true, fontSize: 30, align: "center", valign: "mid" });
    answerSlide.addText(index < questions.length - 1 ? "Lanjutkan ke slide berikutnya" : "Lanjutkan ke halaman hasil", { x: size.width / 2 - 1.8, y: 4.45, w: 3.6, h: 0.6, color: "FFFFFF", fill: { color: "E85D04" }, bold: true, align: "center", valign: "mid" });
  });
  if (questions.length) {
    const resultSlide = pptx.addSlide();
    resultSlide.background = { color: "FFF7F1" };
    resultSlide.addText("Selesai", { x: 0.8, y: 1.15, w: size.width - 1.6, h: 0.8, color: "172033", bold: true, fontSize: 34, align: "center" });
    resultSlide.addText(material.certificateEnabled ? "Nilai otomatis dan sertifikat tersedia pada versi interaktif JeniusPPT." : "Nilai otomatis tersedia pada versi interaktif JeniusPPT.", { x: 1.2, y: 2.25, w: size.width - 2.4, h: 0.8, color: "475467", fontSize: 17, align: "center" });
    if (liveUrl) {
      resultSlide.addText("Buka kuis interaktif, nilai, dan sertifikat", { x: size.width / 2 - 2.4, y: 3.55, w: 4.8, h: 0.72, color: "FFFFFF", fill: { color: "E85D04" }, bold: true, align: "center", valign: "mid", hyperlink: { url: liveUrl } });
    } else {
      resultSlide.addText("Terbitkan materi untuk mengaktifkan kuis interaktif, nilai, QR, dan sertifikat.", { x: size.width / 2 - 2.8, y: 3.45, w: 5.6, h: 0.85, color: "9A3412", fill: { color: "FFEDD5" }, line: { color: "FDBA74" }, bold: true, align: "center", valign: "mid", margin: 0.12 });
    }
  }
  await pptx.writeFile({ fileName: `${safeName(material.title)}.pptx` });
}
export async function exportDocx(material) {
  const children = [
    new Paragraph({ text: material.title, heading: HeadingLevel.TITLE }),
    new Paragraph(`${material.subject} • ${material.className}`),
  ];
  material.slides.forEach((s, i) =>
    children.push(
      new Paragraph({
        text: `${i + 1}. ${s.title}`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph(s.body),
    ),
  );
  saveBlob(
    await Packer.toBlob(new Document({ sections: [{ children }] })),
    `${safeName(material.title)}.docx`,
  );
}
export async function exportPdf(material) {
  const size = material.slideSize || { width: 1920, height: 1080 };
  const width = 297,
    height = width * (size.height / size.width);
  const orientation = width >= height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "mm", format: [width, height] });
  let pageStarted = false;
  const nextPage = () => {
    if (pageStarted) pdf.addPage([width, height], orientation);
    pageStarted = true;
  };
  const paintBackground = (r, g, b) => {
    pdf.setFillColor(r, g, b);
    pdf.rect(0, 0, width, height, "F");
  };
  for (let i = 0; i < (material.slides || []).length; i++) {
    nextPage();
    const image = await renderSlideToDataUrl(material.slides[i], size);
    pdf.addImage(image, "PNG", 0, 0, width, height, undefined, "FAST");
  }
  const questions = material.questions || [];
  questions.forEach((question, index) => {
    const isTrueFalse = question.type === "truefalse";
    const options = isTrueFalse ? ["Benar", "Salah"] : (question.options || []);
    const answerIndex = isTrueFalse
      ? (question.answer === true || question.answer === "Benar" || question.answer === 0 ? 0 : 1)
      : Number(question.answer ?? question.correctAnswer ?? 0);

    nextPage();
    paintBackground(255, 247, 241);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(194, 65, 12);
    pdf.setFontSize(12);
    pdf.text(`SOAL ${index + 1} / ${questions.length}`, 16, 15);
    pdf.setFillColor(232, 93, 4);
    pdf.roundedRect(width - 62, 8, 46, 12, 2, 2, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(`WAKTU ${Math.max(5, Number(question.timer || 15))} DETIK`, width - 39, 15.5, { align: "center" });

    pdf.setTextColor(23, 32, 51);
    pdf.setFontSize(20);
    const questionLines = pdf.splitTextToSize(question.question || "Pertanyaan", width - 34);
    pdf.text(questionLines, width / 2, 38, { align: "center", maxWidth: width - 34 });

    const boxGap = 10;
    const boxWidth = (width - 42 - boxGap) / 2;
    const boxHeight = Math.max(22, Math.min(30, height * 0.16));
    const startY = Math.max(68, height * 0.42);
    options.forEach((option, optionIndex) => {
      const column = optionIndex % 2;
      const row = Math.floor(optionIndex / 2);
      const x = 16 + column * (boxWidth + boxGap);
      const y = startY + row * (boxHeight + 8);
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(244, 162, 97);
      pdf.setLineWidth(0.6);
      pdf.roundedRect(x, y, boxWidth, boxHeight, 2, 2, "FD");
      pdf.setTextColor(23, 32, 51);
      pdf.setFontSize(11);
      const label = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
      const lines = pdf.splitTextToSize(label, boxWidth - 10);
      pdf.text(lines, x + 5, y + boxHeight / 2 - ((lines.length - 1) * 2.5), { maxWidth: boxWidth - 10 });
    });

    nextPage();
    paintBackground(23, 32, 51);
    pdf.setTextColor(244, 162, 97);
    pdf.setFontSize(15);
    pdf.text("JAWABAN BENAR", width / 2, height * 0.32, { align: "center" });
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(25);
    const answerLines = pdf.splitTextToSize(options[answerIndex] || "Jawaban belum ditentukan", width - 50);
    pdf.text(answerLines, width / 2, height * 0.5, { align: "center", maxWidth: width - 50 });
  });

  if (questions.length) {
    const isPublished = material.status === "Published";
    const liveUrl = isPublished && material.shareCode && typeof window !== "undefined"
      ? `${window.location.origin}/play/${encodeURIComponent(material.shareCode)}`
      : "";
    nextPage();
    paintBackground(255, 247, 241);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(23, 32, 51);
    pdf.setFontSize(27);
    pdf.text("Selesai", width / 2, height * 0.3, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 84, 103);
    pdf.setFontSize(13);
    const resultText = liveUrl
      ? "Buka kuis interaktif untuk mengerjakan soal, memperoleh nilai, dan menerima sertifikat."
      : "Materi ini masih Draft. Terbitkan materi untuk mengaktifkan kuis interaktif, nilai, QR, dan sertifikat.";
    pdf.text(pdf.splitTextToSize(resultText, width - 70), width / 2, height * 0.45, { align: "center", maxWidth: width - 70 });
    if (liveUrl) {
      const buttonWidth = 105;
      const buttonX = (width - buttonWidth) / 2;
      const buttonY = height * 0.62;
      pdf.setFillColor(232, 93, 4);
      pdf.roundedRect(buttonX, buttonY, buttonWidth, 15, 3, 3, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text("BUKA KUIS INTERAKTIF", width / 2, buttonY + 9.5, { align: "center" });
      pdf.link(buttonX, buttonY, buttonWidth, 15, { url: liveUrl });
    }
  }
  pdf.save(`${safeName(material.title)}.pdf`);
}

export default function FileCenter({ materials, onImport, notify }) {
  const input = useRef();
  const [selected, setSelected] = useState(materials[0]?.id || "");
  const material = materials.find((m) => m.id === selected) || materials[0];
  const [busy, setBusy] = useState(false);
  async function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const lower = file.name.toLowerCase();
      const slides = lower.endsWith(".pdf")
        ? await readPdf(file)
        : await readOffice(file);
      if (!slides.length) throw new Error("Tidak ada teks yang dapat dibaca.");
      onImport({
        title: file.name.replace(/\.(pptx|docx|pdf)$/i, ""),
        subject: "Hasil Impor",
        className: "Umum",
        slides,
      });
      notify(`${slides.length} slide berhasil diimpor.`);
    } catch (e) {
      notify(e.message || "Impor gagal.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Pusat Berkas</span>
        <h1>Impor, Ekspor & Aplikasi</h1>
        <p>Kelola materi lintas format dari satu tempat.</p>
      </div>
      <div className="file-grid">
        <article className="tool-card accent-card">
          <UploadCloud size={30} />
          <h2>Impor Dokumen</h2>
          <p>
            Pilih PPTX, DOCX, atau PDF. Isi dokumen akan disusun menjadi slide
            yang dapat diedit.
          </p>
          <input
            ref={input}
            hidden
            type="file"
            accept=".pptx,.docx,.pdf"
            onChange={importFile}
          />
          <button
            className="primary-button"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? "Membaca berkas..." : "Pilih Berkas"}
          </button>
        </article>
        <article className="tool-card">
          <FileDown size={30} />
          <h2>Ekspor Materi</h2>
          <p>Pilih materi lalu unduh sebagai presentasi, dokumen, atau PDF.</p>
          <SolidSelect
            value={material?.id || ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </SolidSelect>
          {material ? (
            <div className="export-actions">
              <button onClick={() => exportPptx(material)}>
                <Presentation size={17} />
                PPTX
              </button>
              <button onClick={() => exportDocx(material)}>
                <FileText size={17} />
                Word
              </button>
              <button onClick={() => exportPdf(material)}>
                <FileDown size={17} />
                PDF
              </button>
            </div>
          ) : (
            <p className="muted">Buat atau impor materi terlebih dahulu.</p>
          )}
        </article>
        <article className="tool-card app-card">
          <Download size={30} />
          <h2>JeniusPPT Android</h2>
          <p>
            Pasang versi aplikasi untuk akses cepat dari layar utama Android.
          </p>
          <a
            className="primary-button"
            href="/downloads/jeniusppt.apk"
            download
          >
            Download APK
          </a>
          <button
            className="secondary-button"
            onClick={() =>
              notify(
                "Jika browser menampilkan tombol Instal, pilih Tambahkan ke layar utama.",
              )
            }
          >
            Panduan Instalasi
          </button>
        </article>
      </div>
    </section>
  );
}
