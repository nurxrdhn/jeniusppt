import { useRef, useState } from "react";

export const slideTemplates = [
  {
    name: "Jenius Orange",
    category: "Modern",
    background: "linear-gradient(135deg,#ff7a25,#e94d08)",
    titleColor: "#ffffff",
    bodyColor: "#fff7ed",
    textAlign: "left",
  },
  {
    name: "Academic Blue",
    category: "Pendidikan",
    background: "linear-gradient(135deg,#0f2a5f,#2563eb)",
    titleColor: "#ffffff",
    bodyColor: "#dbeafe",
    textAlign: "left",
  },
  {
    name: "Minimal Paper",
    category: "Minimal",
    background: "linear-gradient(135deg,#ffffff,#fff7ed)",
    titleColor: "#431407",
    bodyColor: "#7c2d12",
    textAlign: "left",
  },
  {
    name: "Peach Classroom",
    category: "Pendidikan",
    background:
      "radial-gradient(circle at 88% 15%,#fdba74 0 10%,transparent 11%),linear-gradient(135deg,#fff7ed,#fed7aa)",
    titleColor: "#9a3412",
    bodyColor: "#7c2d12",
    textAlign: "left",
  },
  {
    name: "Forest Study",
    category: "Alam",
    background: "linear-gradient(135deg,#064e3b,#16a34a)",
    titleColor: "#ffffff",
    bodyColor: "#dcfce7",
    textAlign: "left",
  },
  {
    name: "Galaxy Class",
    category: "Teknologi",
    background:
      "radial-gradient(circle at 18% 16%,#8b5cf6,transparent 28%),radial-gradient(circle at 82% 20%,#22d3ee,transparent 25%),linear-gradient(135deg,#020617,#111827)",
    titleColor: "#ffffff",
    bodyColor: "#e0e7ff",
    textAlign: "center",
  },
  {
    name: "Sunset Talk",
    category: "Modern",
    background: "linear-gradient(125deg,#7c2d12,#f97316 58%,#fbbf24)",
    titleColor: "#ffffff",
    bodyColor: "#ffedd5",
    textAlign: "left",
  },
  {
    name: "Ocean Wave",
    category: "Alam",
    background:
      "radial-gradient(circle at 80% 90%,#67e8f9 0 18%,transparent 19%),linear-gradient(135deg,#075985,#0891b2)",
    titleColor: "#ffffff",
    bodyColor: "#cffafe",
    textAlign: "left",
  },
  {
    name: "Lavender Idea",
    category: "Kreatif",
    background: "linear-gradient(135deg,#f5f3ff,#ddd6fe)",
    titleColor: "#5b21b6",
    bodyColor: "#6d28d9",
    textAlign: "left",
  },
  {
    name: "Dark Professional",
    category: "Bisnis",
    background: "linear-gradient(135deg,#111827,#374151)",
    titleColor: "#ffffff",
    bodyColor: "#d1d5db",
    textAlign: "left",
  },
  {
    name: "Notebook",
    category: "Pendidikan",
    background:
      "repeating-linear-gradient(0deg,#ffffff 0,#ffffff 38px,#bfdbfe 39px,#bfdbfe 40px)",
    titleColor: "#1e3a8a",
    bodyColor: "#334155",
    textAlign: "left",
  },
  {
    name: "Geometric",
    category: "Modern",
    background:
      "linear-gradient(30deg,#fb923c 12%,transparent 12.5%,transparent 87%,#fb923c 87.5%),linear-gradient(150deg,#fff7ed 12%,transparent 12.5%,transparent 87%,#fff7ed 87.5%),#fed7aa",
    titleColor: "#7c2d12",
    bodyColor: "#9a3412",
    textAlign: "center",
  },
  {
    name: "Science Lab",
    category: "Sains",
    background:
      "radial-gradient(circle at 15% 20%,#22d3ee 0 3%,transparent 3.5%),radial-gradient(circle at 85% 75%,#34d399 0 4%,transparent 4.5%),linear-gradient(135deg,#ecfeff,#d1fae5)",
    titleColor: "#115e59",
    bodyColor: "#0f766e",
    textAlign: "left",
  },
  {
    name: "Business Gold",
    category: "Bisnis",
    background: "linear-gradient(135deg,#18181b 0 72%,#ca8a04 72%)",
    titleColor: "#fef3c7",
    bodyColor: "#fde68a",
    textAlign: "left",
  },
  {
    name: "Kids Fun",
    category: "Anak",
    background:
      "radial-gradient(circle at 13% 18%,#f472b6 0 6%,transparent 6.5%),radial-gradient(circle at 88% 20%,#60a5fa 0 7%,transparent 7.5%),linear-gradient(135deg,#fef3c7,#fce7f3)",
    titleColor: "#be185d",
    bodyColor: "#7c3aed",
    textAlign: "center",
  },
];

export default function BackgroundPicker({ onPick, onTemplate, onApplyAll }) {
  const ref = useRef(null);
  const mediaRef = useRef(null);
  const [url, setUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [category, setCategory] = useState("Semua");
  const [selected, setSelected] = useState(slideTemplates[0]);
  const categories = [
    "Semua",
    ...new Set(slideTemplates.map((item) => item.category)),
  ];
  const shown =
    category === "Semua"
      ? slideTemplates
      : slideTemplates.filter((item) => item.category === category);
  function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPick({ type: "image", value: reader.result });
    reader.readAsDataURL(file);
  }
  function sendMedia(src, type = mediaType, fileName) {
    window.dispatchEvent(
      new CustomEvent("jeniusppt:add-media", {
        detail: { type, src, fileName },
      }),
    );
  }
  function uploadMedia(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video/") ? "video" : "audio";
    const reader = new FileReader();
    reader.onload = () => sendMedia(reader.result, type, file.name);
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  return (
    <div className="bg-panel">
      <h3>Template Slide</h3>
      <div className="template-categories">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="template-grid">
        {shown.map((template) => (
          <button
            key={template.name}
            className={selected.name === template.name ? "selected" : ""}
            title={template.name}
            onClick={() => {
              setSelected(template);
              onTemplate(template);
            }}
          >
            <span style={{ background: template.background }}>
              <i style={{ color: template.titleColor }}>Aa</i>
            </span>
            <b>{template.name}</b>
            <small>{template.category}</small>
          </button>
        ))}
      </div>
      <button
        className="apply-all-template"
        onClick={() => onApplyAll(selected)}
      >
        Terapkan “{selected.name}” ke Semua Slide
      </button>
      <h3 className="custom-bg-title">Latar Kustom</h3>
      <button className="upload-bg" onClick={() => ref.current.click()}>
        Upload Gambar
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={upload} />
      <div className="url-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Tempel URL gambar"
        />
        <button
          onClick={() =>
            url.trim() && onPick({ type: "image", value: url.trim() })
          }
        >
          Pakai
        </button>
      </div>
    </div>
  );
}
