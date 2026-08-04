import { useEffect, useRef, useState } from "react";
import {
  Copy,
  ImagePlus,
  Plus,
  Redo2,
  Save,
  Shapes,
  Sticker,
  Settings2,
  Trash2,
  Type,
  Undo2,
  Video,
  Volume2,
  Table2,
  ChartColumn,
  Frame,
  FileInput,
  GalleryHorizontal,
  Box,
  X,
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  CopyPlus,
  MoreHorizontal,
} from "lucide-react";
import { SLIDE_SIZES, ratioStyle } from "../../utils/slideSizes";
import SolidSelect from "../ui/SolidSelect";
import BackgroundPicker from "./BackgroundPicker";
import MediaPlayer from "../ui/MediaPlayer";
import { normalizeVideoUrl } from "../../utils/mediaUrl";
import TextToolbar from "./TextToolbar";
import { textStyle } from "../../utils/fonts";
const defaultBg = {
  type: "css",
  value: "#ff641e",
};
const legacyDefaultBackgrounds = new Set([
  "linear-gradient(135deg,#ff7a25,#e94d08)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(125deg,#7c2d12,#f97316 58%,#fbbf24)",
]);
const animations = [
  { value: "none", label: "Tanpa Animasi" },
  { value: "fade", label: "Fade" },
  { value: "slide-right", label: "Slide Kanan" },
  { value: "slide-up", label: "Slide Atas" },
  { value: "zoom", label: "Zoom" },
  { value: "flip", label: "Flip" },
  { value: "float", label: "Float" },
  { value: "morph", label: "Morph" },
];
const builtInStickers = [
  "⭐",
  "🎓",
  "🏆",
  "💡",
  "🚀",
  "🌍",
  "🧪",
  "📚",
  "✅",
  "👏",
  "❤️",
  "☀️",
  "🌙",
  "🪐",
  "🔬",
  "🎨",
];
export default function PPTEditor({ material, updateMaterial }) {
  const slides = material.slides || [];
  const activeIndex = material.activeSlide || 0;
  const active = slides[activeIndex] || slides[0];
  const slideSize = material.slideSize || SLIDE_SIZES.wide;
  const [selectedElement, setSelectedElement] = useState(null);
  const [textTarget, setTextTarget] = useState("title");
  const [showStickers, setShowStickers] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(null);
  const [ribbonTab, setRibbonTab] = useState("home");
  const [historyStatus, setHistoryStatus] = useState({
    canUndo: false,
    canRedo: false,
  });
  const [savedAt, setSavedAt] = useState(material.lastSavedAt || null);
  const imageRef = useRef(null);
  const stickerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const historyRef = useRef([JSON.stringify(slides)]);
  const historyIndexRef = useRef(0);
  const lastCommitRef = useRef(0);

  useEffect(() => {
    historyRef.current = [JSON.stringify(material.slides || [])];
    historyIndexRef.current = 0;
    lastCommitRef.current = 0;
    setHistoryStatus({ canUndo: false, canRedo: false });
    setSavedAt(material.lastSavedAt || null);
  }, [material.id]);

  useEffect(() => {
    const sourceSlides = material.slides || [];
    const migratedSlides = sourceSlides.map((slide) =>
      legacyDefaultBackgrounds.has(slide.background?.value)
        ? { ...slide, background: defaultBg }
        : slide,
    );
    if (migratedSlides.some((slide, index) => slide !== sourceSlides[index])) {
      updateMaterial(material.id, { slides: migratedSlides });
    }
  }, [material.id]);

  useEffect(() => {
    function shortcuts(event) {
      const editable = ["INPUT", "TEXTAREA"].includes(event.target?.tagName) || event.target?.isContentEditable;
      if (!editable && selectedElement && ["Delete", "Backspace"].includes(event.key)) {
        event.preventDefault();
        deleteElement(selectedElement);
        return;
      }
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        saveNow();
      } else if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
      } else if (key === "z") {
        event.preventDefault();
        undo();
      } else if (key === "y") {
        event.preventDefault();
        redo();
      } else if (key === "d" && selectedElement && !editable) {
        event.preventDefault();
        duplicateElement(selectedElement);
      }
    }
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  });

  function syncHistoryStatus() {
    setHistoryStatus({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    });
  }

  function setSlides(next) {
    const serialized = JSON.stringify(next);
    const currentSerialized = historyRef.current[historyIndexRef.current];
    if (serialized !== currentSerialized) {
      const now = Date.now();
      const rapidChange = now - lastCommitRef.current < 650;
      if (rapidChange && historyIndexRef.current > 0) {
        historyRef.current[historyIndexRef.current] = serialized;
      } else {
        historyRef.current = historyRef.current.slice(
          0,
          historyIndexRef.current + 1,
        );
        historyRef.current.push(serialized);
        if (historyRef.current.length > 80) historyRef.current.shift();
        historyIndexRef.current = historyRef.current.length - 1;
      }
      lastCommitRef.current = now;
      syncHistoryStatus();
    }
    updateMaterial(material.id, { slides: next });
  }

  function applyHistory(index) {
    const nextSlides = JSON.parse(historyRef.current[index]);
    historyIndexRef.current = index;
    lastCommitRef.current = 0;
    updateMaterial(material.id, {
      slides: nextSlides,
      activeSlide: Math.min(activeIndex, Math.max(0, nextSlides.length - 1)),
    });
    setSelectedElement(null);
    syncHistoryStatus();
  }

  function undo() {
    if (historyIndexRef.current <= 0) return;
    applyHistory(historyIndexRef.current - 1);
  }

  function redo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    applyHistory(historyIndexRef.current + 1);
  }

  function saveNow() {
    const timestamp = new Date().toISOString();
    updateMaterial(material.id, { lastSavedAt: timestamp });
    setSavedAt(timestamp);
  }
  function updateSlide(patch) {
    setSlides(
      slides.map((slide, index) =>
        index === activeIndex ? { ...slide, ...patch } : slide,
      ),
    );
  }
  function addSlide() {
    const next = [
      ...slides,
      {
        title: "Slide Baru",
        body: "Mulai mengetik...",
        background: defaultBg,
        transition: "fade",
        duration: 700,
        titleColor: "#ffffff",
        bodyColor: "#fff7ed",
        textAlign: "left",
        elements: [],
      },
    ];
    setSlides(next);
    updateMaterial(material.id, { activeSlide: next.length - 1 });
  }
  function copySlide() {
    const next = [...slides];
    next.splice(activeIndex + 1, 0, {
      ...active,
      title: `${active.title} Copy`,
      elements: (active.elements || []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    });
    setSlides(next);
    updateMaterial(material.id, { activeSlide: activeIndex + 1 });
  }
  function deleteSlide() {
    if (slides.length <= 1) return;
    const next = slides.filter((_, index) => index !== activeIndex);
    setSlides(next);
    updateMaterial(material.id, { activeSlide: Math.max(0, activeIndex - 1) });
  }
  function setSizeKey(key) {
    updateMaterial(material.id, { slideSize: SLIDE_SIZES[key] });
  }
  function swapOrientation() {
    updateMaterial(material.id, {
      slideSize: {
        ...slideSize,
        width: slideSize.height,
        height: slideSize.width,
        label: slideSize.width > slideSize.height ? "Portrait" : "Landscape",
      },
    });
  }
  function templatePatch(template) {
    return {
      templateName: template.name,
      background: { type: "css", value: template.background },
      titleColor: template.titleColor,
      bodyColor: template.bodyColor,
      textAlign: template.textAlign,
    };
  }
  function applyTemplate(template) {
    updateSlide(templatePatch(template));
  }
  function applyTemplateAll(template) {
    setSlides(
      slides.map((slide) => ({ ...slide, ...templatePatch(template) })),
    );
  }
  function addElement(type, extra = {}) {
    const item = {
      id: crypto.randomUUID(),
      type,
      x: 12,
      y: 28,
      w: type === "text" ? 34 : 20,
      h: type === "text" ? 12 : 22,
      text: type === "text" ? "Teks tambahan" : "",
      color: "#ffffff",
      background: type === "shape" ? "#fb923c" : "transparent",
      ...extra,
    };
    updateSlide({ elements: [...(active.elements || []), item] });
    setSelectedElement(item.id);
  }
  function uploadElement(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      addElement("image", { src: reader.result, w: 28, h: 30 });
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  function addSticker(text) {
    addElement("sticker", { text, w: 13, h: 18, x: 44, y: 40 });
    setShowStickers(false);
  }
  function customSticker() {
    const text = window.prompt(
      "Ketik emoji, simbol, atau stiker teks buatan sendiri:",
      "✨",
    );
    if (text) addSticker(text);
  }
  function uploadSticker(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      addElement("sticker", {
        src: reader.result,
        w: 18,
        h: 22,
        x: 41,
        y: 38,
        fileName: file.name,
      });
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  function addMediaLink(type) {
    const url = window.prompt(
      `Tempel link ${type === "video" ? "video atau YouTube" : "audio"}:`,
    );
    if (!url) return;
    addElement(type, {
      src: type === "video" ? normalizeVideoUrl(url) : url,
      w: type === "video" ? 42 : 38,
      h: type === "video" ? 34 : 12,
    });
  }
  function uploadMedia(event, type) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      addElement(type, {
        src: reader.result,
        w: type === "video" ? 42 : 38,
        h: type === "video" ? 34 : 12,
        fileName: file.name,
      });
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  useEffect(() => {
    const handler = (event) => {
      const { type, src, fileName } = event.detail || {};
      if (type && src)
        addElement(type, {
          src: type === "video" ? normalizeVideoUrl(src) : src,
          w: type === "video" ? 42 : 38,
          h: type === "video" ? 34 : 12,
          fileName,
        });
    };
    window.addEventListener("jeniusppt:add-media", handler);
    return () => window.removeEventListener("jeniusppt:add-media", handler);
  });
  function updateElement(id, patch) {
    updateSlide({
      elements: (active.elements || []).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }
  function deleteElement(elementId = selectedElement) {
    if (!elementId) return;
    updateSlide({
      elements: (active.elements || []).filter(
        (item) => item.id !== elementId,
      ),
    });
    setSelectedElement(null);
  }
  function duplicateElement(elementId = selectedElement) {
    const source = (active.elements || []).find((item) => item.id === elementId);
    if (!source) return;
    const copy = {
      ...source,
      id: crypto.randomUUID(),
      x: Math.min(Math.max(0, source.x + 3), Math.max(0, 100 - source.w)),
      y: Math.min(Math.max(0, source.y + 3), Math.max(0, 100 - source.h)),
    };
    updateSlide({ elements: [...(active.elements || []), copy] });
    setSelectedElement(copy.id);
  }
  function reorderElement(elementId, position) {
    const items = [...(active.elements || [])];
    const index = items.findIndex((item) => item.id === elementId);
    if (index < 0) return;
    const [item] = items.splice(index, 1);
    if (position === "front") items.push(item);
    else items.unshift(item);
    updateSlide({ elements: items });
  }
  function toggleElementLock(elementId) {
    const item = (active.elements || []).find((entry) => entry.id === elementId);
    if (item) updateElement(elementId, { locked: !item.locked });
  }
  function moveTextBox(event, key, fallback) {
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget
      .closest(".slide-canvas")
      .getBoundingClientRect();
    const start = active?.[key] || fallback;
    const startX = event.clientX,
      startY = event.clientY;
    const move = (e) =>
      updateSlide({
        [key]: {
          ...start,
          x: Math.max(
            0,
            Math.min(
              100 - start.w,
              start.x + ((e.clientX - startX) / canvas.width) * 100,
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              100 - start.h,
              start.y + ((e.clientY - startY) / canvas.height) * 100,
            ),
          ),
        },
      });
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }
  const selected = (active?.elements || []).find(
    (item) => item.id === selectedElement,
  );
  const bg = active?.background || defaultBg;
  const canvasStyle = {
    ...ratioStyle(slideSize),
    "--slide-ratio": `${slideSize.width} / ${slideSize.height}`,
    ...(bg.type === "image"
      ? { backgroundImage: `url(${bg.value})` }
      : { background: bg.value }),
    textAlign: active?.textAlign || "left",
  };
  const titleBox = active?.titleBox || { x: 8, y: 12, w: 84, h: 20 };
  const bodyBox = active?.bodyBox || { x: 8, y: 36, w: 84, h: 42 };
  const currentTextStyle =
    textTarget === "title"
      ? active?.titleStyle || {
          fontFamily: "Arial",
          fontSize: 62,
          bold: true,
          color: active?.titleColor || "#ffffff",
        }
      : textTarget === "body"
        ? active?.bodyStyle || {
            fontFamily: "Arial",
            fontSize: 30,
            color: active?.bodyColor || "#fff7ed",
            lineHeight: 1.5,
          }
        : selected?.style || {
            fontFamily: "Arial",
            fontSize: 32,
            bold: true,
            color: selected?.color || "#ffffff",
          };
  function updateTextStyle(next) {
    if (textTarget === "title") updateSlide({ titleStyle: next });
    else if (textTarget === "body") updateSlide({ bodyStyle: next });
    else if (selected?.type === "text")
      updateElement(selected.id, { style: next });
  }
  return (
    <div className="ppt-editor">
      <main className="slide-stage">
        <nav className="editor-ribbon-tabs" aria-label="Menu editor slide">
          {[["home","Beranda"],["elements","Elemen"],["insert","Sisipkan"],["design","Desain"],["transition","Transisi"],["templates","Template"]].map(([key,label]) => <button key={key} className={ribbonTab === key ? "active" : ""} onClick={() => setRibbonTab(key)}>{label}</button>)}
        </nav>
        <div className="editor-toolbar">
          <div className="history-controls">
            <button onClick={saveNow} title="Simpan (Ctrl+S)">
              <Save size={16} />
              Simpan
            </button>
            <button
              onClick={undo}
              disabled={!historyStatus.canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={!historyStatus.canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
              Redo
            </button>
          </div>
          <span className="editor-save-time">
            {savedAt
              ? `Disimpan ${new Date(savedAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Penyimpanan otomatis aktif"}
          </span>
          <div className="mobile-editor-actions" aria-label="Alat editor HP">
            <button onClick={() => setMobileSheet("add")}>
              <Plus size={17} />
              Tambah
            </button>
            <button onClick={() => setMobileSheet("text")}>
              <Type size={17} />
              Teks
            </button>
            <button onClick={() => setMobileSheet("settings")}>
              <Settings2 size={17} />
              Atur
            </button>
          </div>
          {ribbonTab === "insert" && <div className="desktop-editor-tools ribbon-group">
          <button onClick={copySlide}>
            <Copy size={16} />
            Copy
          </button>
          <button onClick={() => addElement("text")}>
            <Type size={16} />
            Teks
          </button>
          <button onClick={() => addElement("shape")}>
            <Shapes size={16} />
            Bentuk
          </button>
          <button onClick={() => imageRef.current?.click()}>
            <ImagePlus size={16} />
            Gambar
          </button>
          <input
            ref={imageRef}
            hidden
            type="file"
            accept="image/*"
            onChange={uploadElement}
          />
          <button onClick={() => setShowStickers((value) => !value)}>
            <Sticker size={16} />
            Stiker
          </button>
          <input
            ref={stickerRef}
            hidden
            type="file"
            accept="image/*"
            onChange={uploadSticker}
          />
          <button onClick={deleteSlide}>
            <Trash2 size={16} />
            Slide
          </button>
          </div>}
          {ribbonTab === "design" && <div className="desktop-editor-tools ribbon-group"><span className="ribbon-label">Ukuran slide</span><SolidSelect
            value={
              Object.keys(SLIDE_SIZES).find(
                (key) => SLIDE_SIZES[key].label === slideSize.label,
              ) || "wide"
            }
            onChange={(e) => setSizeKey(e.target.value)}
          >
            {Object.entries(SLIDE_SIZES).map(([key, size]) => (
              <option key={key} value={key}>
                {size.label}
              </option>
            ))}
          </SolidSelect>
          <button onClick={swapOrientation}>Putar</button></div>}
          {ribbonTab === "transition" && <div className="desktop-editor-tools ribbon-group"><span className="ribbon-label">Animasi</span><SolidSelect value={active?.transition || "fade"} onChange={(e) => updateSlide({ transition: e.target.value })}>{animations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SolidSelect><span className="ribbon-label">Durasi</span><SolidSelect value={active?.duration || 700} onChange={(e) => updateSlide({ duration: Number(e.target.value) })}><option value={400}>Cepat</option><option value={700}>Normal</option><option value={1100}>Lembut</option><option value={1600}>Dramatis</option></SolidSelect></div>}
        </div>
        {ribbonTab === "home" && <div className="desktop-ribbon-content"><TextToolbar target={textTarget} onTarget={setTextTarget} style={currentTextStyle} onChange={updateTextStyle} hasSelectedText={selected?.type === "text"}/></div>}
        {ribbonTab === "elements" && <div className="desktop-ribbon-content element-library">
          <button onClick={() => addElement("shape", { text: "Bentuk", background: "#14b8a6" })}><Shapes/><span>Shapes</span></button>
          <button onClick={() => setShowStickers(true)}><GalleryHorizontal/><span>Graphics</span></button>
          <button onClick={() => imageRef.current?.click()}><ImagePlus/><span>Photos</span></button>
          <button onClick={() => videoRef.current?.click()}><Video/><span>Videos</span></button>
          <button onClick={() => addElement("shape", { kind: "form", text: "Formulir", background: "#22c55e", w: 28, h: 28 })}><FileInput/><span>Forms</span></button>
          <button onClick={() => audioRef.current?.click()}><Volume2/><span>Audio</span></button>
          <button onClick={() => addElement("shape", { kind: "table", text: "Tabel", background: "#f97316", w: 36, h: 30 })}><Table2/><span>Tables</span></button>
          <button onClick={() => addElement("shape", { kind: "chart", text: "Bagan", background: "#0891b2", w: 36, h: 30 })}><ChartColumn/><span>Charts</span></button>
          <button onClick={() => addElement("shape", { kind: "frame", text: "Bingkai", background: "transparent", w: 38, h: 38 })}><Frame/><span>Frames</span></button>
          <button onClick={() => addElement("shape", { kind: "box", text: "Kotak 3D", background: "#8b5cf6", w: 26, h: 26 })}><Box/><span>3D</span></button>
          <input ref={videoRef} hidden type="file" accept="video/*" onChange={(event) => uploadMedia(event,"video")}/>
          <input ref={audioRef} hidden type="file" accept="audio/*" onChange={(event) => uploadMedia(event,"audio")}/>
        </div>}
        {ribbonTab === "templates" && <div className="desktop-ribbon-content template-ribbon"><BackgroundPicker onPick={(background) => updateSlide({ background })} onTemplate={applyTemplate} onApplyAll={applyTemplateAll}/></div>}
        <div className={`mobile-sheet text-sheet ${mobileSheet === "text" ? "open" : ""}`}>
          <div className="mobile-sheet-head">
            <b>Format Teks</b>
            <button onClick={() => setMobileSheet(null)} aria-label="Tutup format teks"><X size={20} /></button>
          </div>
          <TextToolbar
            target={textTarget}
            onTarget={setTextTarget}
            style={currentTextStyle}
            onChange={updateTextStyle}
            hasSelectedText={selected?.type === "text"}
          />
        </div>
        <div className={`mobile-sheet add-sheet ${mobileSheet === "add" ? "open" : ""}`}>
          <div className="mobile-sheet-head">
            <b>Tambahkan ke Slide</b>
            <button onClick={() => setMobileSheet(null)} aria-label="Tutup alat tambah"><X size={20} /></button>
          </div>
          <div className="mobile-add-grid">
            <button onClick={() => { addSlide(); setMobileSheet(null); }}><Plus size={19} />Slide</button>
            <button onClick={() => { copySlide(); setMobileSheet(null); }}><Copy size={19} />Salin</button>
            <button onClick={() => { addElement("text"); setMobileSheet("text"); }}><Type size={19} />Teks</button>
            <button onClick={() => { addElement("shape"); setMobileSheet(null); }}><Shapes size={19} />Bentuk</button>
            <button onClick={() => imageRef.current?.click()}><ImagePlus size={19} />Gambar</button>
            <button onClick={() => { setShowStickers(true); setMobileSheet(null); }}><Sticker size={19} />Stiker</button>
            <button onClick={() => { addElement("shape", { kind: "table", text: "Tabel", background: "#f97316", w: 36, h: 30 }); setMobileSheet(null); }}><Table2 size={19}/>Tabel</button>
            <button onClick={() => { addElement("shape", { kind: "chart", text: "Bagan", background: "#0891b2", w: 36, h: 30 }); setMobileSheet(null); }}><ChartColumn size={19}/>Bagan</button>
          </div>
        </div>
        {showStickers && (
          <div className="sticker-palette">
            {builtInStickers.map((item) => (
              <button key={item} onClick={() => addSticker(item)}>
                {item}
              </button>
            ))}
            <button className="custom-sticker" onClick={customSticker}>
              Buat Sendiri
            </button>
            <button
              className="custom-sticker"
              onClick={() => stickerRef.current?.click()}
            >
              Upload PNG
            </button>
          </div>
        )}
        <section className="slide-canvas-wrap">
          <div
            key={`${activeIndex}-${active?.templateName || "custom"}`}
            className="slide-canvas editor-template-preview"
            style={canvasStyle}
          >
            <div
              className="movable-text title-box"
              style={{
                left: `${titleBox.x}%`,
                top: `${titleBox.y}%`,
                width: `${titleBox.w}%`,
                height: `${titleBox.h}%`,
              }}
            >
              <button
                title="Geser judul"
                onPointerDown={(e) => moveTextBox(e, "titleBox", titleBox)}
              >
                ⋮⋮
              </button>
              <input
                style={textStyle(
                  active?.titleStyle || {
                    fontFamily: "Arial",
                    fontSize: 62,
                    bold: true,
                    color: active?.titleColor || "#ffffff",
                  },
                  active?.titleColor || "#ffffff",
                )}
                value={active?.title || ""}
                onChange={(e) => updateSlide({ title: e.target.value })}
                className="slide-title-input"
                placeholder="Judul"
              />
            </div>
            <div
              className="movable-text body-box"
              style={{
                left: `${bodyBox.x}%`,
                top: `${bodyBox.y}%`,
                width: `${bodyBox.w}%`,
                height: `${bodyBox.h}%`,
              }}
            >
              <button
                title="Geser isi"
                onPointerDown={(e) => moveTextBox(e, "bodyBox", bodyBox)}
              >
                ⋮⋮
              </button>
              <textarea
                style={textStyle(
                  active?.bodyStyle || {
                    fontFamily: "Arial",
                    fontSize: 30,
                    color: active?.bodyColor || "#e4ecff",
                    lineHeight: 1.5,
                  },
                  active?.bodyColor || "#e4ecff",
                )}
                value={active?.body || ""}
                onChange={(e) => updateSlide({ body: e.target.value })}
                className="slide-body-input"
                placeholder="Mulai mengetik..."
              />
            </div>
            <ElementLayer
              elements={active?.elements || []}
              selected={selectedElement}
              select={(id) => {
                setSelectedElement(id);
                if (
                  (active?.elements || []).find((item) => item.id === id)
                    ?.type === "text"
                )
                  setTextTarget("selected");
              }}
              update={updateElement}
              remove={deleteElement}
              duplicate={duplicateElement}
              reorder={reorderElement}
              toggleLock={toggleElementLock}
            />
          </div>
        </section>
        <section className="slide-strip" aria-label="Daftar slide">
          <div className="slide-strip-head">
            <div>
              <b>Slide</b>
              <small>{slides.length} halaman</small>
            </div>
            <button onClick={addSlide}>
              <Plus size={17} />
              Tambah Slide
            </button>
          </div>
          <div className="slide-strip-scroll">
            {slides.map((slide, index) => (
              <button
                key={index}
                className={index === activeIndex ? "active" : ""}
                onClick={() => {
                  updateMaterial(material.id, { activeSlide: index });
                  setSelectedElement(null);
                }}
              >
                <span>{index + 1}</span>
                <div
                  className="slide-strip-thumb"
                  style={{
                    ...ratioStyle(slideSize),
                    background: slide.background?.value || defaultBg.value,
                  }}
                >
                  <b>{slide.title || "Tanpa Judul"}</b>
                  <small>{(slide.body || "").slice(0, 48)}</small>
                </div>
              </button>
            ))}
            <button className="slide-strip-add" onClick={addSlide}>
              <Plus size={22} />
              <b>Slide Baru</b>
            </button>
          </div>
        </section>
      </main>
      <aside className={`properties-panel mobile-sheet settings-sheet ${mobileSheet === "settings" ? "open" : ""}`}>
        <div className="mobile-sheet-head">
          <b>Pengaturan Slide</b>
          <button onClick={() => setMobileSheet(null)} aria-label="Tutup pengaturan"><X size={20} /></button>
        </div>
        <h3>Pengaturan Slide</h3>
        <label>Ukuran</label>
        <SolidSelect
          value={slideSize.label}
          onChange={(e) => {
            const found = Object.values(SLIDE_SIZES).find(
              (size) => size.label === e.target.value,
            );
            if (found) updateMaterial(material.id, { slideSize: found });
          }}
        >
          {Object.values(SLIDE_SIZES).map((size) => (
            <option key={size.label}>{size.label}</option>
          ))}
        </SolidSelect>
        <label>Animasi Masuk</label>
        <SolidSelect
          value={active?.transition || "fade"}
          onChange={(e) => updateSlide({ transition: e.target.value })}
        >
          {animations.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SolidSelect>
        <label>Durasi</label>
        <SolidSelect
          value={active?.duration || 700}
          onChange={(e) => updateSlide({ duration: Number(e.target.value) })}
        >
          <option value={400}>Cepat</option>
          <option value={700}>Normal</option>
          <option value={1100}>Lembut</option>
          <option value={1600}>Dramatis</option>
        </SolidSelect>
        {selected && (
          <div className="element-properties">
            <h3>Elemen Terpilih</h3>
            {(selected.type === "text" || selected.type === "sticker") &&
              !selected.src && (
                <>
                  <label>Teks / Stiker</label>
                  <textarea
                    value={selected.text || ""}
                    onChange={(e) =>
                      updateElement(selected.id, { text: e.target.value })
                    }
                  />
                  <label>Warna</label>
                  <input
                    type="color"
                    value={selected.color || "#ffffff"}
                    onChange={(e) =>
                      updateElement(selected.id, { color: e.target.value })
                    }
                  />
                </>
              )}
            {selected.type === "shape" && (
              <>
                <label>Warna Bentuk</label>
                <input
                  type="color"
                  value={selected.background || "#fb923c"}
                  onChange={(e) =>
                    updateElement(selected.id, { background: e.target.value })
                  }
                />
              </>
            )}
            <div className="element-size-grid">
              <label>
                Lebar
                <input
                  type="range"
                  min="8"
                  max="80"
                  value={selected.w}
                  onChange={(e) =>
                    updateElement(selected.id, { w: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Tinggi
                <input
                  type="range"
                  min="6"
                  max="70"
                  value={selected.h}
                  onChange={(e) =>
                    updateElement(selected.id, { h: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <button className="delete-element" onClick={deleteElement}>
              <Trash2 size={15} />
              Hapus Elemen
            </button>
          </div>
        )}
        <BackgroundPicker
          onPick={(background) => updateSlide({ background })}
          onTemplate={applyTemplate}
          onApplyAll={applyTemplateAll}
        />
      </aside>
      {mobileSheet && <button className="mobile-sheet-backdrop" onClick={() => setMobileSheet(null)} aria-label="Tutup panel" />}
    </div>
  );
}

function ElementLayer({ elements, selected, select, update, remove, duplicate, reorder, toggleLock }) {
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("pointerdown", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  function openMenu(event, item) {
    event.preventDefault();
    event.stopPropagation();
    select(item.id);
    const canvas = event.currentTarget.closest(".slide-canvas").getBoundingClientRect();
    setContextMenu({
      id: item.id,
      locked: Boolean(item.locked),
      x: Math.max(8, Math.min(event.clientX - canvas.left, canvas.width - 232)),
      y: Math.max(8, Math.min(event.clientY - canvas.top, canvas.height - 292)),
    });
  }

  function run(action) {
    action();
    setContextMenu(null);
  }

  function startDrag(event, item) {
    event.preventDefault();
    event.stopPropagation();
    select(item.id);
    if (item.locked) return;
    const canvas = event.currentTarget.parentElement.getBoundingClientRect();
    const startX = event.clientX,
      startY = event.clientY,
      originX = item.x,
      originY = item.y;
    const move = (e) =>
      update(item.id, {
        x: Math.max(
          0,
          Math.min(
            100 - item.w,
            originX + ((e.clientX - startX) / canvas.width) * 100,
          ),
        ),
        y: Math.max(
          0,
          Math.min(
            100 - item.h,
            originY + ((e.clientY - startY) / canvas.height) * 100,
          ),
        ),
      });
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }
  return (
    <div className="free-elements-layer">
      {elements.map((item) => (
        <div
          key={item.id}
          onPointerDown={(event) => startDrag(event, item)}
          onContextMenu={(event) => openMenu(event, item)}
          className={`free-element ${item.type} ${item.kind || ""} ${item.locked ? "locked" : ""} ${selected === item.id ? "selected" : ""}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.w}%`,
            height: `${item.h}%`,
            color: item.color,
            background: item.type === "shape" ? item.background : "transparent",
            ...(item.type === "text"
              ? textStyle(
                  item.style || {
                    color: item.color || "#ffffff",
                    fontSize: 32,
                    bold: true,
                  },
                  item.color || "#ffffff",
                )
              : {}),
          }}
        >
          {item.type === "text" && item.text}
          {item.type === "shape" && item.kind === "table" && <span className="element-table">{Array.from({length:9}).map((_,index) => <i key={index}/>)}</span>}
          {item.type === "shape" && item.kind === "chart" && <span className="element-chart"><i/><i/><i/><i/></span>}
          {item.type === "shape" && !["table","chart"].includes(item.kind) && <span className="shape-label">{item.text}</span>}
          {item.type === "sticker" &&
            (item.src ? <img src={item.src} alt="Stiker" /> : item.text)}
          {item.type === "image" && <img src={item.src} alt="Elemen slide" />}
          {(item.type === "video" || item.type === "audio") && (
            <MediaPlayer item={item} />
          )}
          {selected === item.id && <>
            <button className="element-quick-more" title="Pilihan elemen" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => openMenu(event, item)}><MoreHorizontal size={16}/></button>
            <button className="element-quick-delete" title="Hapus elemen" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); remove(item.id); }}><Trash2 size={15}/></button>
          </>}
        </div>
      ))}
      {contextMenu && (
        <div className="element-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}>
          <strong>Pilihan elemen</strong>
          <button onClick={() => run(() => duplicate(contextMenu.id))}><CopyPlus size={17}/><span>Duplikat</span><kbd>Ctrl+D</kbd></button>
          <button onClick={() => run(() => reorder(contextMenu.id, "front"))}><BringToFront size={17}/><span>Bawa ke depan</span></button>
          <button onClick={() => run(() => reorder(contextMenu.id, "back"))}><SendToBack size={17}/><span>Kirim ke belakang</span></button>
          <button onClick={() => run(() => toggleLock(contextMenu.id))}>{contextMenu.locked ? <Unlock size={17}/> : <Lock size={17}/>}<span>{contextMenu.locked ? "Buka kunci" : "Kunci elemen"}</span></button>
          <hr/>
          <button className="danger" onClick={() => run(() => remove(contextMenu.id))}><Trash2 size={17}/><span>Hapus</span><kbd>Delete</kbd></button>
        </div>
      )}
    </div>
  );
}
