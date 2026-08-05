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
  Layers3,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Presentation,
  Search,
  Command,
} from "lucide-react";
import { SLIDE_SIZES, ratioStyle } from "../../utils/slideSizes";
import SolidSelect from "../ui/SolidSelect";
import BackgroundPicker from "./BackgroundPicker";
import MediaPlayer from "../ui/MediaPlayer";
import { normalizeVideoUrl } from "../../utils/mediaUrl";
import TextToolbar from "./TextToolbar";
import { loadWebFont, textStyle } from "../../utils/fonts";
import { jeniusPrompt } from "../../utils/jeniusDialog";
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
  const [mobileRibbonMore, setMobileRibbonMore] = useState(false);
  const [textBoxMenu, setTextBoxMenu] = useState(null);
  const [spellcheck, setSpellcheck] = useState(true);
  const [smartGuides, setSmartGuides] = useState({ x: null, y: null });
  const [historyStatus, setHistoryStatus] = useState({
    canUndo: false,
    canRedo: false,
  });
  const [savedAt, setSavedAt] = useState(material.lastSavedAt || null);
  const imageRef = useRef(null);
  const stickerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const mobileRibbonRef = useRef(null);
  const historyRef = useRef([JSON.stringify(slides)]);
  const historyIndexRef = useRef(0);
  const lastCommitRef = useRef(0);

  useEffect(() => {
    if (mobileRibbonRef.current) mobileRibbonRef.current.scrollLeft = 0;
  }, [material.id]);

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
    const fonts = [active?.titleStyle?.fontFamily, active?.bodyStyle?.fontFamily];
    (active?.elements || []).forEach((item) => fonts.push(item.style?.fontFamily));
    fonts.filter(Boolean).forEach(loadWebFont);
  }, [activeIndex, active?.titleStyle?.fontFamily, active?.bodyStyle?.fontFamily, active?.elements]);

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
  function copySlideAt(index = activeIndex) {
    const source = slides[index];
    if (!source) return;
    const next = [...slides];
    next.splice(index + 1, 0, {
      ...source,
      title: `${source.title} Copy`,
      elements: (source.elements || []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    });
    setSlides(next);
    updateMaterial(material.id, { activeSlide: index + 1 });
  }
  function copySlide() { copySlideAt(activeIndex); }
  function deleteSlideAt(index = activeIndex) {
    if (slides.length <= 1) return;
    const next = slides.filter((_, slideIndex) => slideIndex !== index);
    setSlides(next);
    updateMaterial(material.id, { activeSlide: Math.max(0, Math.min(index - 1, next.length - 1)) });
  }
  function deleteSlide() { deleteSlideAt(activeIndex); }
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
  async function customSticker() {
    const text = await jeniusPrompt({
      title: "Buat stiker sendiri",
      message: "Masukkan emoji, simbol, atau teks singkat untuk dijadikan stiker.",
      placeholder: "Contoh: ✨",
      defaultValue: "✨",
      confirmLabel: "Tambahkan",
    });
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
  async function addMediaLink(type) {
    const url = await jeniusPrompt({
      title: type === "video" ? "Tambahkan video" : "Tambahkan audio",
      message: `Tempel tautan ${type === "video" ? "video atau YouTube" : "audio"} yang ingin dimasukkan ke slide.`,
      placeholder: "https://...",
      confirmLabel: "Tambahkan",
    });
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
  function textBoxData(key) {
    const isTitle = key === "title";
    return {
      text: active?.[key] || "",
      style: active?.[`${key}Style`] || {},
      color: active?.[isTitle ? "titleColor" : "bodyColor"] || "#ffffff",
      box: active?.[isTitle ? "titleBox" : "bodyBox"] || (isTitle
        ? { x: 7, y: 10, w: 86, h: 20 }
        : { x: 8, y: 38, w: 84, h: 40 }),
    };
  }
  function duplicateTextBox(key) {
    const source = textBoxData(key);
    addElement("text", {
      text: source.text || "Teks salinan",
      style: { ...source.style, color: source.color },
      color: source.color,
      x: Math.min(source.box.x + 3, 66),
      y: Math.min(source.box.y + 3, 82),
      w: Math.min(source.box.w, 50),
      h: Math.max(10, Math.min(source.box.h, 28)),
    });
    setTextBoxMenu(null);
  }
  function clearTextBox(key) {
    updateSlide({ [key]: "" });
    setTextBoxMenu(null);
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
  function toggleElementVisibility(elementId) {
    const item = (active.elements || []).find((entry) => entry.id === elementId);
    if (item) updateElement(elementId, { hidden: !item.hidden });
  }
  function shiftElement(elementId, direction) {
    const items = [...(active.elements || [])];
    const index = items.findIndex((item) => item.id === elementId);
    const target = direction === "up" ? index + 1 : index - 1;
    if (index < 0 || target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    updateSlide({ elements: items });
  }
  function updateTextLayer(key, patch) {
    const boxKey = key === "title" ? "titleBox" : "bodyBox";
    const fallback = key === "title"
      ? { x: 8, y: 12, w: 84, h: 20 }
      : { x: 8, y: 36, w: 84, h: 42 };
    updateSlide({ [boxKey]: { ...(active?.[boxKey] || fallback), ...patch } });
  }
  function moveTextBox(event, key, fallback) {
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget
      .closest(".slide-canvas")
      .getBoundingClientRect();
    const start = active?.[key] || fallback;
    if (start.locked) return;
    const startX = event.clientX,
      startY = event.clientY;
    const move = (e) => {
      const rawX = Math.max(0, Math.min(100 - start.w, start.x + ((e.clientX - startX) / canvas.width) * 100));
      const rawY = Math.max(0, Math.min(100 - start.h, start.y + ((e.clientY - startY) / canvas.height) * 100));
      const snapped = snapToCanvas(rawX, rawY, start.w, start.h);
      setSmartGuides(snapped.guides);
      updateSlide({
        [key]: {
          ...start,
          x: snapped.x,
          y: snapped.y,
        },
      });
    };
    const stop = () => {
      setSmartGuides({ x: null, y: null });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }
  function snapToCanvas(x, y, w, h) {
    const threshold = 1.35;
    let nextX = x, nextY = y, guideX = null, guideY = null;
    const xPoints = [{ value: x, target: 0, result: 0 }, { value: x + w / 2, target: 50, result: 50 - w / 2 }, { value: x + w, target: 100, result: 100 - w }];
    const yPoints = [{ value: y, target: 0, result: 0 }, { value: y + h / 2, target: 50, result: 50 - h / 2 }, { value: y + h, target: 100, result: 100 - h }];
    const hitX = xPoints.find((point) => Math.abs(point.value - point.target) <= threshold);
    const hitY = yPoints.find((point) => Math.abs(point.value - point.target) <= threshold);
    if (hitX) { nextX = hitX.result; guideX = hitX.target; }
    if (hitY) { nextY = hitY.result; guideY = hitY.target; }
    return { x: nextX, y: nextY, guides: { x: guideX, y: guideY } };
  }
  function moveTextBoxFromZone(event, key, fallback) {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("button")) return;
    const canvas = event.currentTarget.closest(".slide-canvas").getBoundingClientRect();
    const start = active?.[key] || fallback;
    if (start.locked) return;
    const startX = event.clientX;
    const startY = event.clientY;
    let dragging = false;
    const move = (nextEvent) => {
      const dx = nextEvent.clientX - startX;
      const dy = nextEvent.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < 4) return;
      dragging = true;
      updateSlide({
        [key]: {
          ...start,
          x: Math.max(0, Math.min(100 - start.w, start.x + (dx / canvas.width) * 100)),
          y: Math.max(0, Math.min(100 - start.h, start.y + (dy / canvas.height) * 100)),
        },
      });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
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
        <header className="powerpoint-titlebar"><span>JP</span><b>{material.title || "Presentasi tanpa judul"}</b><small>JeniusPPT Editor</small></header>
        <nav ref={mobileRibbonRef} className="mobile-ribbon-tabs" aria-label="Menu editor slide di HP">
          {[["home","Beranda"],["insert","Sisipkan"],["elements","Elemen"]].map(([key,label]) => (
            <button
              key={key}
              type="button"
              className={ribbonTab === key ? "active" : ""}
              aria-pressed={ribbonTab === key}
              onClick={() => { setRibbonTab(key); setMobileRibbonMore(false); }}
            >
              {label}
            </button>
          ))}
          <div className="mobile-ribbon-more">
            <button
              type="button"
              className={["file","tools","draw","design","transition","slideshow","record","review","view","templates","help"].includes(ribbonTab) ? "active" : ""}
              aria-expanded={mobileRibbonMore}
              onClick={() => setMobileRibbonMore((value) => !value)}
            >
              <MoreHorizontal size={17} />
              Lainnya
            </button>
            {mobileRibbonMore && (
              <div className="mobile-ribbon-menu" role="menu">
                {[["file","Berkas"],["tools","100+ Alat"],["draw","Gambar"],["design","Desain"],["transition","Animasi"],["slideshow","Peragaan"],["record","Rekam"],["review","Tinjau"],["view","Tampilan"],["templates","Template"],["help","Bantuan"]].map(([key,label]) => (
                  <button
                    key={key}
                    type="button"
                    role="menuitem"
                    className={ribbonTab === key ? "active" : ""}
                    onClick={() => { setRibbonTab(key); setMobileRibbonMore(false); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
        <nav className="editor-ribbon-tabs" aria-label="Menu editor slide" data-tour="editor-ribbon">
          {[["file","Berkas"],["home","Beranda"],["insert","Sisipkan"],["draw","Gambar"],["elements","Elemen"],["design","Desain"],["transition","Transisi"],["slideshow","Peragaan"],["record","Rekam"],["review","Tinjau"],["view","Tampilan"],["templates","Template"],["tools","100+ Alat"],["help","Bantuan"]].map(([key,label]) => <button key={key} className={ribbonTab === key ? "active" : ""} onClick={() => setRibbonTab(key)}>{label}</button>)}
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
              Slide
            </button>
            <button onClick={() => setMobileSheet("layers")}>
              <Layers3 size={17} />
              Lapisan
            </button>
          </div>
          {ribbonTab === "file" && <div className="desktop-editor-tools ribbon-group word-command-strip">
            <div className="word-command-group"><div><button onClick={saveNow}><Save size={17}/>Simpan</button><button onClick={copySlide}><Copy size={17}/>Duplikat</button><button className="danger" disabled={slides.length <= 1} onClick={deleteSlide}><Trash2 size={17}/>Hapus</button></div><small>Berkas slide</small></div>
          </div>}
          {ribbonTab === "insert" && <div className="desktop-editor-tools ribbon-group word-command-strip">
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
          </div>}
          {ribbonTab === "draw" && <div className="desktop-editor-tools ribbon-group word-command-strip">
            <div className="word-command-group"><div><button onClick={() => addElement("shape", { text: "Garis", w: 38, h: 2, background: "#ff641e" })}><Shapes size={17}/>Garis</button><button onClick={() => addElement("shape", { text: "Panah", w: 34, h: 4, background: "#ff641e" })}><Shapes size={17}/>Panah</button><button onClick={() => addElement("text", { text: "Catatan", style: { fontFamily: "Caveat", fontSize: 34, color: "#172033" }, color: "#172033" })}><Type size={17}/>Tulis</button></div><small>Alat gambar</small></div>
            <div className="word-command-group"><div><button onClick={() => setShowStickers(true)}><Sticker size={17}/>Stiker</button><button onClick={() => imageRef.current?.click()}><ImagePlus size={17}/>Gambar</button></div><small>Tambahkan</small></div>
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
          {ribbonTab === "view" && <div className="desktop-editor-tools ribbon-group word-command-strip">
            <div className="word-command-group"><div><button onClick={() => { setMobileSheet("layers"); document.querySelector(".desktop-layer-wrapper")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}><Layers3 size={17}/>Lapisan</button><button onClick={() => { setMobileSheet("settings"); document.querySelector(".properties-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}><Settings2 size={17}/>Properti</button></div><small>Panel editor</small></div>
            <div className="word-command-group"><div><button onClick={() => setSelectedElement(null)}><Eye size={17}/>Kanvas bersih</button><button onClick={() => updateSlide({ showGuides: active?.showGuides === false })}><GalleryHorizontal size={17}/>{active?.showGuides === false ? "Panduan aktif" : "Panduan nonaktif"}</button></div><small>Tampilan kanvas</small></div>
          </div>}
          {ribbonTab === "slideshow" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button onClick={() => window.open(`/play/${material.shareCode}`, "_blank")}><Eye size={17}/>Dari awal</button><button onClick={() => window.open(`/play/${material.shareCode}?slide=${activeIndex}`, "_blank")}><Presentation size={17}/>Slide aktif</button></div><small>Mulai presentasi</small></div></div>}
          {ribbonTab === "record" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button onClick={() => addMediaLink("audio")}><Volume2 size={17}/>Rekam narasi</button><button onClick={() => audioRef.current?.click()}><Volume2 size={17}/>Audio lokal</button><button onClick={() => videoRef.current?.click()}><Video size={17}/>Video lokal</button></div><small>Rekaman dan media</small></div></div>}
          {ribbonTab === "review" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button className={spellcheck ? "active" : ""} onClick={() => setSpellcheck((value) => !value)}><FileInput size={17}/>{spellcheck ? "Ejaan aktif" : "Ejaan nonaktif"}</button><button onClick={() => setMobileSheet("layers")}><Layers3 size={17}/>Periksa objek</button></div><small>Pemeriksaan</small></div></div>}
          {ribbonTab === "help" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button onClick={() => window.open("/downloads/panduan-lengkap-jeniusppt.pdf", "_blank")}><FileInput size={17}/>Buku PDF</button><button onClick={() => window.open("/downloads/video-tutorial-jeniusppt.mp4", "_blank")}><Video size={17}/>Video tutorial</button></div><small>Bantuan JeniusPPT</small></div></div>}
        </div>
        {ribbonTab === "home" && <div className="desktop-ribbon-content"><TextToolbar target={textTarget} onTarget={setTextTarget} style={currentTextStyle} onChange={updateTextStyle} hasSelectedText={selected?.type === "text"}/></div>}
        {ribbonTab === "tools" && <div className="desktop-ribbon-content"><CommandCenter currentTextStyle={currentTextStyle} updateTextStyle={updateTextStyle} active={active} selected={selected} updateSlide={updateSlide} updateElement={updateElement} addElement={addElement} addSlide={addSlide} copySlide={copySlide} deleteSlide={deleteSlide} saveNow={saveNow} swapOrientation={swapOrientation} undo={undo} redo={redo} historyStatus={historyStatus} duplicateElement={duplicateElement} toggleElementLock={toggleElementLock} reorderElement={reorderElement} shiftElement={shiftElement} deleteElement={deleteElement} slides={slides}/></div>}
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
        <div className="powerpoint-workspace">
        <section className="slide-canvas-wrap" data-tour="slide-canvas">
          <div
            key={`${activeIndex}-${active?.templateName || "custom"}`}
            className="slide-canvas editor-template-preview"
            style={canvasStyle}
          >
            {active?.showGuides !== false && smartGuides.x !== null && <div className="smart-guide vertical" style={{ left: `${smartGuides.x}%` }}><span>{Math.round(smartGuides.x)}%</span></div>}
            {active?.showGuides !== false && smartGuides.y !== null && <div className="smart-guide horizontal" style={{ top: `${smartGuides.y}%` }}><span>{Math.round(smartGuides.y)}%</span></div>}
            <div
              className={`movable-text title-box ${titleBox.locked ? "locked" : ""}`}
              onPointerDown={(e) => moveTextBoxFromZone(e, "titleBox", titleBox)}
              style={{
                display: titleBox.hidden ? "none" : undefined,
                left: `${titleBox.x}%`,
                top: `${titleBox.y}%`,
                width: `${titleBox.w}%`,
                height: `${titleBox.h}%`,
              }}
            >
              <button
                className="text-box-move"
                title="Geser judul"
                onPointerDown={(e) => moveTextBox(e, "titleBox", titleBox)}
              >
                +
              </button>
              <button className="text-box-more" title="Pilihan judul" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setTextBoxMenu(textBoxMenu === "title" ? null : "title"); }}><MoreHorizontal size={16}/></button>
              {textBoxMenu === "title" && <div className="text-box-menu" onPointerDown={(e) => e.stopPropagation()}>
                <strong>Pilihan judul</strong>
                <button onClick={() => duplicateTextBox("title")}><Copy size={15}/>Salin</button>
                <button onClick={() => duplicateTextBox("title")}><CopyPlus size={15}/>Duplikat</button>
                <button className="danger" onClick={() => clearTextBox("title")}><Trash2 size={15}/>Hapus</button>
              </div>}
              <textarea
                rows={2}
                key={`title-${active?.titleStyle?.fontFamily || "Arial"}`}
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
                onFocus={() => setTextTarget("title")}
                className="slide-title-input"
                placeholder="Judul"
                spellCheck={spellcheck}
              />
            </div>
            <div
              className={`movable-text body-box ${bodyBox.locked ? "locked" : ""}`}
              onPointerDown={(e) => moveTextBoxFromZone(e, "bodyBox", bodyBox)}
              style={{
                display: bodyBox.hidden ? "none" : undefined,
                left: `${bodyBox.x}%`,
                top: `${bodyBox.y}%`,
                width: `${bodyBox.w}%`,
                height: `${bodyBox.h}%`,
              }}
            >
              <button
                className="text-box-move"
                title="Geser isi"
                onPointerDown={(e) => moveTextBox(e, "bodyBox", bodyBox)}
              >
                +
              </button>
              <button className="text-box-more" title="Pilihan isi" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setTextBoxMenu(textBoxMenu === "body" ? null : "body"); }}><MoreHorizontal size={16}/></button>
              {textBoxMenu === "body" && <div className="text-box-menu" onPointerDown={(e) => e.stopPropagation()}>
                <strong>Pilihan isi</strong>
                <button onClick={() => duplicateTextBox("body")}><Copy size={15}/>Salin</button>
                <button onClick={() => duplicateTextBox("body")}><CopyPlus size={15}/>Duplikat</button>
                <button className="danger" onClick={() => clearTextBox("body")}><Trash2 size={15}/>Hapus</button>
              </div>}
              <textarea
                key={`body-${active?.bodyStyle?.fontFamily || "Arial"}`}
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
                onFocus={() => setTextTarget("body")}
                className="slide-body-input"
                placeholder="Mulai mengetik..."
                spellCheck={spellcheck}
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
              onGuides={setSmartGuides}
              snap={snapToCanvas}
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
              <article key={index} className={`slide-thumb-card ${index === activeIndex ? "active" : ""}`}>
              <button className="slide-thumb-select" onClick={() => {
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
              <div className="slide-thumb-actions">
                <button title="Duplikat slide" aria-label={`Duplikat slide ${index + 1}`} onClick={() => copySlideAt(index)}><CopyPlus size={14}/></button>
                <button className="danger" title="Hapus slide" aria-label={`Hapus slide ${index + 1}`} disabled={slides.length <= 1} onClick={() => deleteSlideAt(index)}><Trash2 size={14}/></button>
              </div>
              </article>
            ))}
            <button className="slide-strip-add" onClick={addSlide}>
              <Plus size={22} />
              <b>Slide Baru</b>
            </button>
          </div>
        </section>
        </div>
      </main>
      <div className={`mobile-sheet layers-sheet ${mobileSheet === "layers" ? "open" : ""}`}>
        <div className="mobile-sheet-head"><b>Lapisan Slide</b><button onClick={() => setMobileSheet(null)} aria-label="Tutup lapisan"><X size={20}/></button></div>
        <LayerPanel
          slide={active}
          selected={selectedElement}
          select={setSelectedElement}
          updateTextLayer={updateTextLayer}
          updateElement={updateElement}
          shiftElement={shiftElement}
          removeElement={deleteElement}
          clearText={clearTextBox}
          onTextTarget={setTextTarget}
        />
      </div>
      <aside className={`properties-panel mobile-sheet settings-sheet ${mobileSheet === "settings" ? "open" : ""}`}>
        <div className="mobile-sheet-head">
          <b>Pengaturan Slide</b>
          <button onClick={() => setMobileSheet(null)} aria-label="Tutup pengaturan"><X size={20} /></button>
        </div>
        <h3>Pengaturan Slide</h3>
        <div className="desktop-layer-wrapper">
          <LayerPanel
            slide={active}
            selected={selectedElement}
            select={setSelectedElement}
            updateTextLayer={updateTextLayer}
            updateElement={updateElement}
            shiftElement={shiftElement}
            removeElement={deleteElement}
            clearText={clearTextBox}
            onTextTarget={setTextTarget}
          />
        </div>
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

function LayerPanel({ slide, selected, select, updateTextLayer, updateElement, shiftElement, removeElement, clearText, onTextTarget }) {
  const elements = slide?.elements || [];
  const textLayers = [
    { key: "title", label: "Judul", box: slide?.titleBox || {}, empty: !slide?.title },
    { key: "body", label: "Isi paragraf", box: slide?.bodyBox || {}, empty: !slide?.body },
  ];
  const nameOf = (item) => item.type === "image" ? "Gambar" : item.type === "video" ? "Video" : item.type === "audio" ? "Audio" : item.type === "sticker" ? "Stiker" : item.type === "shape" ? (item.text || "Bentuk") : (item.text || "Teks tambahan");
  return (
    <section className="layer-panel" aria-label="Daftar lapisan slide">
      <header><div><small>URUTAN OBJEK</small><h3><Layers3 size={18}/> Lapisan</h3></div><span>{elements.length + 2}</span></header>
      <p>Lapisan paling atas tampil paling depan.</p>
      <div className="layer-list">
        {[...elements].map((item, sourceIndex) => ({ item, sourceIndex })).reverse().map(({ item, sourceIndex }, order) => (
          <article key={item.id} className={`layer-row ${selected === item.id ? "active" : ""} ${item.hidden ? "is-hidden" : ""}`}>
            <button className="layer-main" onClick={() => select(item.id)}><span>{elements.length - order + 2}</span><div><b>{nameOf(item)}</b><small>{item.type}</small></div></button>
            <div className="layer-actions">
              <button title={item.hidden ? "Tampilkan" : "Sembunyikan"} onClick={() => updateElement(item.id, { hidden: !item.hidden })}>{item.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
              <button title={item.locked ? "Buka kunci" : "Kunci"} onClick={() => updateElement(item.id, { locked: !item.locked })}>{item.locked ? <Unlock size={14}/> : <Lock size={14}/>}</button>
              <button title="Naik satu lapisan" disabled={sourceIndex === elements.length - 1} onClick={() => shiftElement(item.id, "up")}><ChevronUp size={14}/></button>
              <button title="Turun satu lapisan" disabled={sourceIndex === 0} onClick={() => shiftElement(item.id, "down")}><ChevronDown size={14}/></button>
              <button className="danger" title="Hapus" onClick={() => removeElement(item.id)}><Trash2 size={14}/></button>
            </div>
          </article>
        ))}
        {textLayers.map((layer, index) => (
          <article key={layer.key} className={`layer-row text-layer ${layer.box.hidden ? "is-hidden" : ""}`}>
            <button className="layer-main" onClick={() => onTextTarget(layer.key)}><span>{2 - index}</span><div><b>{layer.label}</b><small>Teks utama</small></div></button>
            <div className="layer-actions">
              <button title={layer.box.hidden ? "Tampilkan" : "Sembunyikan"} onClick={() => updateTextLayer(layer.key, { hidden: !layer.box.hidden })}>{layer.box.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
              <button title={layer.box.locked ? "Buka kunci" : "Kunci"} onClick={() => updateTextLayer(layer.key, { locked: !layer.box.locked })}>{layer.box.locked ? <Unlock size={14}/> : <Lock size={14}/>}</button>
              <button className="danger" title="Hapus teks" disabled={layer.empty} onClick={() => clearText(layer.key)}><Trash2 size={14}/></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ElementLayer({ elements, selected, select, update, remove, duplicate, reorder, toggleLock, onGuides, snap }) {
  const [contextMenu, setContextMenu] = useState(null);
  const clipboardRef = useRef(null);

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
  function copyElement(id) {
    const source = elements.find((item) => item.id === id);
    if (source) {
      clipboardRef.current = structuredClone(source);
      duplicate(id);
    }
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
    const move = (e) => {
      const rawX = Math.max(0, Math.min(100 - item.w, originX + ((e.clientX - startX) / canvas.width) * 100));
      const rawY = Math.max(0, Math.min(100 - item.h, originY + ((e.clientY - startY) / canvas.height) * 100));
      const result = snap(rawX, rawY, item.w, item.h);
      onGuides(result.guides);
      update(item.id, { x: result.x, y: result.y });
    };
    const stop = () => {
      onGuides({ x: null, y: null });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }
  function startResize(event, item, corner) {
    event.preventDefault(); event.stopPropagation();
    if (item.locked) return;
    const canvas = event.currentTarget.closest(".slide-canvas").getBoundingClientRect();
    const startX = event.clientX, startY = event.clientY;
    const origin = { x: item.x, y: item.y, w: item.w, h: item.h };
    const move = (e) => {
      const dx = ((e.clientX - startX) / canvas.width) * 100;
      const dy = ((e.clientY - startY) / canvas.height) * 100;
      let { x, y, w, h } = origin;
      if (corner.includes("e")) w = Math.max(4, Math.min(100 - x, origin.w + dx));
      if (corner.includes("s")) h = Math.max(4, Math.min(100 - y, origin.h + dy));
      if (corner.includes("w")) { const nx = Math.max(0, Math.min(origin.x + origin.w - 4, origin.x + dx)); w = origin.w + origin.x - nx; x = nx; }
      if (corner.includes("n")) { const ny = Math.max(0, Math.min(origin.y + origin.h - 4, origin.y + dy)); h = origin.h + origin.y - ny; y = ny; }
      update(item.id, { x, y, w, h });
    };
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }
  function startRotate(event, item) {
    event.preventDefault(); event.stopPropagation();
    if (item.locked) return;
    const box = event.currentTarget.closest(".free-element").getBoundingClientRect();
    const centerX = box.left + box.width / 2, centerY = box.top + box.height / 2;
    const move = (e) => update(item.id, { rotation: Math.round(Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90) });
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }
  return (
    <div className="free-elements-layer">
      {elements.map((item) => item.hidden ? null : (
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
            transform: `rotate(${item.rotation || 0}deg)`,
            opacity: item.opacity ?? 1,
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
            <button className="element-move-handle" title="Geser elemen" aria-label="Geser elemen" onPointerDown={(event) => startDrag(event, item)}>+</button>
            <button className="element-quick-more" title="Pilihan elemen" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => openMenu(event, item)}><MoreHorizontal size={16}/></button>
            <button className="element-quick-delete" title="Hapus elemen" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); remove(item.id); }}><Trash2 size={15}/></button>
            {!item.locked && ["nw","ne","sw","se"].map((corner) => <button key={corner} className={`element-resize-handle ${corner}`} aria-label={`Ubah ukuran ${corner}`} onPointerDown={(event) => startResize(event, item, corner)} />)}
            {!item.locked && <button className="element-rotate-handle" title="Putar elemen" aria-label="Putar elemen" onPointerDown={(event) => startRotate(event, item)}><RotateCw size={13}/></button>}
          </>}
        </div>
      ))}
      {contextMenu && (
        <div className="element-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}>
          <strong>Pilihan elemen</strong>
          <button onClick={() => run(() => copyElement(contextMenu.id))}><Copy size={17}/><span>Salin</span><kbd>Ctrl+C</kbd></button>
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
