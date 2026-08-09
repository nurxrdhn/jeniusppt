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
import { isYouTubeUrl, normalizeVideoUrl } from "../../utils/mediaUrl";
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
  const size = material.slideSize || { width: 13.333, height: 7.5 };
  pptx.defineLayout({
    name: "JENIUS_CUSTOM",
    width: size.width,
    height: size.height,
  });
  pptx.layout = "JENIUS_CUSTOM";
  pptx.author = "JeniusPPT";
  pptx.subject = material.subject;
  for (const item of material.slides || []) {
    const image = await renderSlideToDataUrl(item, size);
    const slide = pptx.addSlide();
    slide.addImage({ data: image, x: 0, y: 0, w: size.width, h: size.height });
    for (const element of item.elements || []) {
      if (element.type === "video" && isYouTubeUrl(element.src)) {
        slide.addMedia({
          type: "online",
          link: normalizeVideoUrl(element.src),
          x: (element.x / 100) * size.width,
          y: (element.y / 100) * size.height,
          w: (element.w / 100) * size.width,
          h: (element.h / 100) * size.height,
        });
      }
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
  const size = material.slideSize || { width: 13.333, height: 7.5 };
  const width = 297,
    height = width * (size.height / size.width);
  const orientation = width >= height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "mm", format: [width, height] });
  for (let i = 0; i < (material.slides || []).length; i++) {
    if (i) pdf.addPage([width, height], orientation);
    const image = await renderSlideToDataUrl(material.slides[i], size);
    pdf.addImage(image, "PNG", 0, 0, width, height, undefined, "FAST");
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
