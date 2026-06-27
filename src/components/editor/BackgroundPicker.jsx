import { useRef, useState } from "react";

const builtInBackgrounds = [
  { id: "purple", name: "Purple Aurora", css: "linear-gradient(135deg,#111827,#6d4aff)" },
  { id: "blue", name: "Ocean Blue", css: "linear-gradient(135deg,#0f172a,#2563eb)" },
  { id: "green", name: "Fresh Green", css: "linear-gradient(135deg,#064e3b,#22c55e)" },
  { id: "yellow-flower", name: "Kuning Bunga", css: "radial-gradient(circle at 15% 20%,#fff7ad 0 8%,transparent 9%), radial-gradient(circle at 85% 18%,#ffe066 0 7%,transparent 8%), linear-gradient(135deg,#fff7c2,#facc15)" },
  { id: "pink-flower", name: "Pink Sakura", css: "radial-gradient(circle at 18% 22%,#fb7185 0 7%,transparent 8%), radial-gradient(circle at 80% 18%,#f9a8d4 0 8%,transparent 9%), linear-gradient(135deg,#fff1f2,#fbcfe8)" },
  { id: "sunflower", name: "Sunflower", css: "radial-gradient(circle at 20% 20%,#92400e 0 4%,#facc15 5% 11%,transparent 12%), radial-gradient(circle at 82% 22%,#92400e 0 4%,#facc15 5% 11%,transparent 12%), linear-gradient(135deg,#fff7ed,#fde68a)" },
  { id: "rainbow", name: "Rainbow Kids", css: "linear-gradient(135deg,#f9a8d4,#fde68a,#bbf7d0,#bfdbfe)" },
  { id: "galaxy", name: "Galaxy", css: "radial-gradient(circle at 20% 15%,#8b5cf6,transparent 28%), radial-gradient(circle at 80% 20%,#22d3ee,transparent 25%), linear-gradient(135deg,#020617,#111827)" },
];

export default function BackgroundPicker({ onSelect }) {
  const fileRef = useRef(null);
  const [customs, setCustoms] = useState(() => {
    return JSON.parse(localStorage.getItem("jeniusppt_custom_backgrounds") || "[]");
  });
  const [url, setUrl] = useState("");

  function saveCustom(next) {
    setCustoms(next);
    localStorage.setItem("jeniusppt_custom_backgrounds", JSON.stringify(next));
  }

  function uploadLocal(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const bg = {
        id: Date.now(),
        name: file.name,
        image: reader.result,
      };
      saveCustom([bg, ...customs]);
      onSelect({ type: "image", value: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function addUrl() {
    if (!url.trim()) return;
    const bg = {
      id: Date.now(),
      name: "Background URL",
      image: url.trim(),
    };
    saveCustom([bg, ...customs]);
    onSelect({ type: "image", value: url.trim() });
    setUrl("");
  }

  function removeCustom(id) {
    saveCustom(customs.filter((item) => item.id !== id));
  }

  return (
    <div className="bg-picker">
      <h3>Background</h3>

      <button className="bg-upload" onClick={() => fileRef.current.click()}>
        + Upload Background Lokal
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadLocal} />

      <div className="bg-url">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Tempel URL gambar / Google Drive" />
        <button onClick={addUrl}>Pakai</button>
      </div>

      <h4>Template Bawaan</h4>
      <div className="bg-grid">
        {builtInBackgrounds.map((bg) => (
          <button
            key={bg.id}
            className="bg-item"
            onClick={() => onSelect({ type: "css", value: bg.css })}
          >
            <span style={{ background: bg.css }} />
            <b>{bg.name}</b>
          </button>
        ))}
      </div>

      <h4>Upload Saya</h4>
      <div className="bg-grid">
        {customs.length === 0 && <p className="bg-empty">Belum ada background upload.</p>}
        {customs.map((bg) => (
          <div className="bg-custom" key={bg.id}>
            <button onClick={() => onSelect({ type: "image", value: bg.image })}>
              <span style={{ backgroundImage: `url(${bg.image})` }} />
              <b>{bg.name}</b>
            </button>
            <small onClick={() => removeCustom(bg.id)}>Hapus</small>
          </div>
        ))}
      </div>
    </div>
  );
}
