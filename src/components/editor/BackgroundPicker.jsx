import { useRef, useState } from "react";
import { jeniusConfirm } from "../../utils/jeniusDialog";

export const slideTemplates = [
  {
    name: "Jenius Orange",
    category: "Modern",
    background: "#fff0e8",
    titleColor: "#9a3412",
    bodyColor: "#7c2d12",
    textAlign: "left",
  },
  {
    name: "Academic Blue",
    category: "Pendidikan",
    background: "#eaf1ff",
    titleColor: "#1e3a8a",
    bodyColor: "#334e7d",
    textAlign: "left",
  },
  {
    name: "Minimal Paper",
    category: "Minimal",
    background: "#fffaf5",
    titleColor: "#431407",
    bodyColor: "#7c2d12",
    textAlign: "left",
  },
  {
    name: "Peach Classroom",
    category: "Pendidikan",
    background:
      "#fed7aa",
    titleColor: "#9a3412",
    bodyColor: "#7c2d12",
    textAlign: "left",
  },
  {
    name: "Forest Study",
    category: "Alam",
    background: "#e8f5ec",
    titleColor: "#166534",
    bodyColor: "#365f43",
    textAlign: "left",
  },
  {
    name: "Galaxy Class",
    category: "Teknologi",
    background:
      "#283241",
    titleColor: "#ffffff",
    bodyColor: "#e0e7ff",
    textAlign: "center",
  },
  {
    name: "Sunset Talk",
    category: "Modern",
    background: "#fff0e6",
    titleColor: "#9a3412",
    bodyColor: "#7c4a30",
    textAlign: "left",
  },
  {
    name: "Ocean Wave",
    category: "Alam",
    background:
      "#e6f7fa",
    titleColor: "#155e75",
    bodyColor: "#3d6670",
    textAlign: "left",
  },
  {
    name: "Lavender Idea",
    category: "Kreatif",
    background: "#ddd6fe",
    titleColor: "#5b21b6",
    bodyColor: "#6d28d9",
    textAlign: "left",
  },
  {
    name: "Dark Professional",
    category: "Bisnis",
    background: "#1f2937",
    titleColor: "#ffffff",
    bodyColor: "#d1d5db",
    textAlign: "left",
  },
  {
    name: "Notebook",
    category: "Pendidikan",
    background:
      "#eff6ff",
    titleColor: "#1e3a8a",
    bodyColor: "#334155",
    textAlign: "left",
  },
  {
    name: "Geometric",
    category: "Modern",
    background:
      "#fdba74",
    titleColor: "#7c2d12",
    bodyColor: "#9a3412",
    textAlign: "center",
  },
  {
    name: "Science Lab",
    category: "Sains",
    background:
      "#ccfbf1",
    titleColor: "#115e59",
    bodyColor: "#0f766e",
    textAlign: "left",
  },
  {
    name: "Business Gold",
    category: "Bisnis",
    background: "#292524",
    titleColor: "#fef3c7",
    bodyColor: "#fde68a",
    textAlign: "left",
  },
  {
    name: "Kids Fun",
    category: "Anak",
    background:
      "#fce7f3",
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
  const [unlocked, setUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jeniusppt-unlocked-templates")) || []; } catch { return []; }
  });
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
        {shown.map((template) => {
          const premium = slideTemplates.indexOf(template) > 2;
          const owned = unlocked.includes(template.name);
          return (
          <button
            key={template.name}
            className={selected.name === template.name ? "selected" : ""}
            title={template.name}
            onClick={async () => {
              if (premium && !owned) {
                const approved = await jeniusConfirm({
                  title: "Gunakan template premium?",
                  message: `${template.name} tersedia dengan harga Rp9.900. Lanjutkan ke proses penggunaan template?`,
                  confirmLabel: "Lanjutkan",
                });
                if (!approved) return;
                const next = [...unlocked, template.name];
                setUnlocked(next); localStorage.setItem("jeniusppt-unlocked-templates", JSON.stringify(next));
              }
              setSelected(template);
              onTemplate(template);
            }}
          >
            <span style={{ background: template.background }}>
              <i style={{ color: template.titleColor }}>Aa</i>
            </span>
            <b>{template.name}</b>
            <small>{template.category}</small>
            <em>{premium ? (owned ? "Dimiliki" : "Rp9.900") : "Gratis"}</em>
          </button>
        )})}
      </div>
      <button
        className="apply-all-template"
        onClick={() => onApplyAll(selected)}
      >
        Terapkan “{selected.name}” ke Semua Slide
      </button>
      <h3 className="custom-bg-title">Latar Kustom</h3>
      <label className="custom-background-color">
        <span>Warna solid</span>
        <input type="color" defaultValue="#ff641e" onChange={(event) => onPick({ type: "css", value: event.target.value })} />
      </label>
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
