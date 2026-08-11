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
  GripVertical,
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
const shapeLibrary = [
  ["Kotak","rectangle",30,22],["Kotak bulat","rounded",30,22],["Lingkaran","circle",22,22],["Oval","oval",32,20],
  ["Segitiga","triangle",26,24],["Belah ketupat","diamond",25,25],["Trapesium","trapezoid",32,22],["Jajar genjang","parallelogram",32,22],
  ["Pentagon","pentagon",26,26],["Hexagon","hexagon",30,26],["Oktagon","octagon",28,28],["Bintang","star",28,28],
  ["Hati","heart",28,25],["Awan","cloud",34,22],["Balon bicara","speech",35,23],["Plus","plus",25,25],
  ["Panah kanan","arrow-right",36,18],["Panah kiri","arrow-left",36,18],["Panah atas","arrow-up",18,32],["Panah bawah","arrow-down",18,32],
  ["Panah dua arah","arrow-both",40,16],["Garis","line",40,2],["Garis vertikal","line-vertical",2,34],["Chevron","chevron",32,18],
  ["Pita","ribbon",36,18],["Lencana","badge",26,28],["Dokumen","document",26,32],["Bingkai","frame",38,30],
  ["Kurung kiri","bracket-left",12,32],["Kurung kanan","bracket-right",12,32],["Setengah lingkaran","semicircle",30,18],["Silinder","cylinder",28,30],
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
  const [slideMenu, setSlideMenu] = useState(null);
  const [draggedSlide, setDraggedSlide] = useState(null);
  const [slideDropTarget, setSlideDropTarget] = useState(null);
  const [spellcheck, setSpellcheck] = useState(true);
  const [smartGuides, setSmartGuides] = useState({ x: null, y: null });
  const [historyStatus, setHistoryStatus] = useState({
    canUndo: false,
    canRedo: false,
  });
  const [savedAt, setSavedAt] = useState(material.lastSavedAt || null);
  const imageRef = useRef(null);
  const backgroundRef = useRef(null);
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
  function cloneElements(elements = []) {
    return elements.map((item) => ({ ...item, id: crypto.randomUUID(), style: item.style ? { ...item.style } : item.style }));
  }
  function applyActiveToAll(scope) {
    if (!active || slides.length < 2) return;
    const stylePatch = {
      titleStyle: active.titleStyle ? { ...active.titleStyle } : undefined,
      bodyStyle: active.bodyStyle ? { ...active.bodyStyle } : undefined,
      titleColor: active.titleColor,
      bodyColor: active.bodyColor,
      textAlign: active.textAlign,
      titleBox: active.titleBox ? { ...active.titleBox } : undefined,
      bodyBox: active.bodyBox ? { ...active.bodyBox } : undefined,
    };
    const next = slides.map((slide, index) => {
      if (index === activeIndex) return slide;
      if (scope === "background") return { ...slide, background: { ...active.background } };
      if (scope === "text") return { ...slide, ...stylePatch };
      if (scope === "elements") return { ...slide, elements: cloneElements(active.elements) };
      return {
        ...slide,
        ...stylePatch,
        background: { ...active.background },
        elements: cloneElements(active.elements),
        transition: active.transition,
        duration: active.duration,
      };
    });
    setSlides(next);
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
  async function copySlideContent(index = activeIndex) {
    const source = slides[index];
    if (!source) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(source, null, 2));
    } catch {
      localStorage.setItem("jeniusppt-slide-clipboard", JSON.stringify(source));
    }
    setSlideMenu(null);
  }
  function deleteSlideAt(index = activeIndex) {
    if (slides.length <= 1) return;
    const next = slides.filter((_, slideIndex) => slideIndex !== index);
    setSlides(next);
    updateMaterial(material.id, { activeSlide: Math.max(0, Math.min(index - 1, next.length - 1)) });
  }
  function deleteSlide() { deleteSlideAt(activeIndex); }
  function moveSlide(from, to) {
    if (from === to || from < 0 || to < 0 || from >= slides.length || to >= slides.length) return;
    const next = [...slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSlides(next);
    const nextActive = activeIndex === from ? to : activeIndex > from && activeIndex <= to ? activeIndex - 1 : activeIndex < from && activeIndex >= to ? activeIndex + 1 : activeIndex;
    updateMaterial(material.id, { activeSlide: nextActive });
  }
  function startSlideDrag(event, index) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    let target = index;
    setDraggedSlide(index); setSlideDropTarget(index);
    const move = (e) => {
      const card = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-slide-index]");
      if (card) { target = Number(card.dataset.slideIndex); setSlideDropTarget(target); }
    };
    const stop = () => {
      if (target !== index) moveSlide(index, target);
      setDraggedSlide(null); setSlideDropTarget(null);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
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
  function uploadBackground(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSlide({
      background: { type: "image", value: reader.result, fileName: file.name },
    });
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
    const current = (active.elements || []).find((item) => item.id === id);
    if (!current) return;
    const unlocking = Object.keys(patch).length === 1 && patch.locked === false;
    if (current.locked && !unlocking) return;
    updateSlide({
      elements: (active.elements || []).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }
  function deleteElement(elementId = selectedElement) {
    if (!elementId) return;
    if ((active.elements || []).find((item) => item.id === elementId)?.locked) return;
    updateSlide({
      elements: (active.elements || []).filter(
        (item) => item.id !== elementId,
      ),
    });
    setSelectedElement(null);
  }
  function duplicateElement(elementId = selectedElement) {
    const source = (active.elements || []).find((item) => item.id === elementId);
    if (!source || source.locked) return;
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
    const boxKey = key === "title" ? "titleBox" : "bodyBox";
    if (active?.[boxKey]?.locked) return;
    updateSlide({ [key]: "" });
    setTextBoxMenu(null);
  }
  function reorderElement(elementId, position) {
    const items = [...(active.elements || [])];
    const index = items.findIndex((item) => item.id === elementId);
    if (index < 0 || items[index].locked) return;
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
    if (index < 0 || items[index].locked || target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    updateSlide({ elements: items });
  }
  function updateTextLayer(key, patch) {
    const boxKey = key === "title" ? "titleBox" : "bodyBox";
    const fallback = key === "title"
      ? { x: 8, y: 12, w: 84, h: 20 }
      : { x: 8, y: 36, w: 84, h: 42 };
    const current = active?.[boxKey] || fallback;
    const unlocking = Object.keys(patch).length === 1 && patch.locked === false;
    if (current.locked && !unlocking) return;
    updateSlide({ [boxKey]: { ...current, ...patch } });
  }
  function moveLayer(sourceId, targetId) {
    const valid = ["__title", "__body", ...(active.elements || []).map((item) => item.id)];
    const order = [...new Set([...(active.layerOrder || []).filter((id) => valid.includes(id)), ...valid])];
    const from = order.indexOf(sourceId), to = order.indexOf(targetId);
    const sourceLocked = sourceId === "__title" ? active?.titleBox?.locked : sourceId === "__body" ? active?.bodyBox?.locked : (active.elements || []).find((item) => item.id === sourceId)?.locked;
    if (from < 0 || to < 0 || sourceLocked || from === to) return;
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    updateSlide({ layerOrder: order });
  }
  function alignObjects(mode) {
    const items = (active.elements || []).filter((item) => !item.locked && !item.hidden);
    if (items.length < 2) return;
    const patch = (item) => mode === "left" ? { x: Math.min(...items.map((x) => x.x)) } : mode === "row" ? { y: items[0].y } : mode === "size" ? { w: items[0].w, h: items[0].h } : {};
    updateSlide({ elements: (active.elements || []).map((item) => items.includes(item) ? { ...item, ...patch(item) } : item) });
  }
  function distributeObjects(axis) {
    const movable = (active.elements || []).filter((item) => !item.locked && !item.hidden).sort((a,b) => axis === "x" ? a.x-b.x : a.y-b.y);
    if (movable.length < 3) return;
    const first = movable[0][axis], last = movable[movable.length-1][axis], step = (last-first)/(movable.length-1);
    const positions = new Map(movable.map((item,index) => [item.id, first + step*index]));
    updateSlide({ elements: (active.elements || []).map((item) => positions.has(item.id) ? { ...item, [axis]: positions.get(item.id) } : item) });
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
  function resizeTextBox(event, key, fallback, corner) {
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget.closest(".slide-canvas").getBoundingClientRect();
    const origin = active?.[key] || fallback;
    if (origin.locked) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (nextEvent) => {
      const dx = ((nextEvent.clientX - startX) / canvas.width) * 100;
      const dy = ((nextEvent.clientY - startY) / canvas.height) * 100;
      let { x, y, w, h } = origin;
      if (corner.includes("e")) w = Math.max(8, Math.min(100 - x, origin.w + dx));
      if (corner.includes("s")) h = Math.max(6, Math.min(100 - y, origin.h + dy));
      if (corner.includes("w")) { const nx = Math.max(0, Math.min(origin.x + origin.w - 8, origin.x + dx)); w = origin.w + origin.x - nx; x = nx; }
      if (corner.includes("n")) { const ny = Math.max(0, Math.min(origin.y + origin.h - 6, origin.y + dy)); h = origin.h + origin.y - ny; y = ny; }
      updateSlide({ [key]: { ...origin, x, y, w, h } });
    };
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
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
      ? { backgroundImage: `url(${bg.value})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
      : { background: bg.value }),
    textAlign: active?.textAlign || "left",
  };
  const titleBox = active?.titleBox || { x: 8, y: 12, w: 84, h: 20 };
  const bodyBox = active?.bodyBox || { x: 8, y: 36, w: 84, h: 42 };
  const validLayerIds = ["__title", "__body", ...(active?.elements || []).map((item) => item.id)];
  const layerOrder = [...new Set([...(active?.layerOrder || []).filter((id) => validLayerIds.includes(id)), ...validLayerIds])];
  const layerZ = (id) => 20 + layerOrder.indexOf(id);
  const currentTextStyle =
    textTarget === "title"
      ? {
          fontFamily: "Arial",
          fontSize: 62,
          bold: true,
          ...(active?.titleStyle || {}),
          color: active?.titleStyle?.color || active?.titleColor || "#ffffff",
        }
      : textTarget === "body"
        ? {
            fontFamily: "Arial",
            fontSize: 30,
            lineHeight: 1.5,
            ...(active?.bodyStyle || {}),
            color: active?.bodyStyle?.color || active?.bodyColor || "#fff7ed",
          }
        : {
            fontFamily: "Arial",
            fontSize: 32,
            bold: true,
            ...(selected?.style || {}),
            color: selected?.style?.color || selected?.color || "#ffffff",
          };
  function updateTextStyle(next) {
    if (next.fontFamily) loadWebFont(next.fontFamily);
    if (textTarget === "title" && !titleBox.locked) updateSlide({ titleStyle: next, titleColor: next.color || active?.titleColor });
    else if (textTarget === "body" && !bodyBox.locked) updateSlide({ bodyStyle: next, bodyColor: next.color || active?.bodyColor });
    else if (selected?.type === "text")
      updateElement(selected.id, { style: next, color: next.color || selected.color });
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
              className={["file","draw","transition","slideshow","record","review","view","help"].includes(ribbonTab) ? "active" : ""}
              aria-expanded={mobileRibbonMore}
              onClick={() => setMobileRibbonMore((value) => !value)}
            >
              <MoreHorizontal size={17} />
              Lainnya
            </button>
            {mobileRibbonMore && (
              <div className="mobile-ribbon-menu" role="menu">
                {[["file","Berkas"],["draw","Gambar"],["transition","Animasi"],["slideshow","Peragaan"],["record","Rekam"],["review","Tinjau"],["view","Tampilan"],["help","Bantuan"]].map(([key,label]) => (
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
          {[["file","Berkas"],["home","Beranda"],["insert","Sisipkan"],["draw","Gambar"],["elements","Elemen"],["transition","Transisi"],["slideshow","Peragaan"],["record","Rekam"],["review","Tinjau"],["view","Tampilan"],["help","Bantuan"]].map(([key,label]) => <button key={key} className={ribbonTab === key ? "active" : ""} onClick={() => setRibbonTab(key)}>{label}</button>)}
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
            <button onClick={() => setMobileSheet((value) => value === "layers" ? null : "layers")}>
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
          {ribbonTab === "home" && <div className="desktop-editor-tools ribbon-group design-background-tools"><div className="background-tool-group"><span className="ribbon-label">Latar slide</span><label className="slide-background-color" title="Pilih warna latar"><input type="color" value={bg.type === "css" && /^#[0-9a-f]{6}$/i.test(bg.value) ? bg.value : "#ff641e"} onChange={(event) => updateSlide({ background: { type: "css", value: event.target.value } })}/><span>Warna</span></label><button onClick={() => backgroundRef.current?.click()}><ImagePlus size={16}/>Dari Folder</button><input ref={backgroundRef} hidden type="file" accept="image/*" onChange={uploadBackground}/></div><span className="ribbon-label">Ukuran slide</span><SolidSelect
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
          <button onClick={swapOrientation}>Putar</button><span className="ribbon-label">Terapkan ke semua</span><SolidSelect value="" aria-label="Terapkan perubahan ke semua slide" onChange={(event) => applyActiveToAll(event.target.value)}><option value="">Pilih bagian</option><option value="background">Latar slide</option><option value="text">Font, warna &amp; posisi teks</option><option value="elements">Elemen &amp; media</option><option value="all">Semua tampilan</option></SolidSelect></div>}
          {ribbonTab === "transition" && <div className="desktop-editor-tools ribbon-group"><span className="ribbon-label">Animasi</span><SolidSelect value={active?.transition || "fade"} onChange={(e) => updateSlide({ transition: e.target.value })}>{animations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SolidSelect><span className="ribbon-label">Durasi</span><SolidSelect value={active?.duration || 700} onChange={(e) => updateSlide({ duration: Number(e.target.value) })}><option value={400}>Cepat</option><option value={700}>Normal</option><option value={1100}>Lembut</option><option value={1600}>Dramatis</option></SolidSelect></div>}
          {ribbonTab === "view" && <div className="desktop-editor-tools ribbon-group word-command-strip">
            <div className="word-command-group"><div><button className={mobileSheet === "layers" ? "active" : ""} onClick={() => setMobileSheet((value) => value === "layers" ? null : "layers")}><Layers3 size={17}/>{mobileSheet === "layers" ? "Tutup lapisan" : "Lapisan"}</button><button onClick={() => setMobileSheet((value) => value === "settings" ? null : "settings")}><Settings2 size={17}/>Properti</button></div><small>Panel editor</small></div>
            <div className="word-command-group"><div><button onClick={() => setSelectedElement(null)}><Eye size={17}/>Kanvas bersih</button><button onClick={() => updateSlide({ showGuides: active?.showGuides === false })}><GalleryHorizontal size={17}/>{active?.showGuides === false ? "Panduan aktif" : "Panduan nonaktif"}</button></div><small>Tampilan kanvas</small></div>
            <div className="word-command-group"><div><button onClick={() => alignObjects("size")}>Ukuran sama</button><button onClick={() => alignObjects("row")}>Sejajar</button><button onClick={() => alignObjects("left")}>Rata kiri</button><button onClick={() => distributeObjects("x")}>Sebar mendatar</button><button onClick={() => distributeObjects("y")}>Sebar vertikal</button></div><small>Ukur &amp; rapikan otomatis</small></div>
          </div>}
          {ribbonTab === "slideshow" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button onClick={() => window.open(`/play/${material.shareCode}`, "_blank")}><Eye size={17}/>Dari awal</button><button onClick={() => window.open(`/play/${material.shareCode}?slide=${activeIndex}`, "_blank")}><Presentation size={17}/>Slide aktif</button></div><small>Mulai presentasi</small></div></div>}
          {ribbonTab === "record" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button onClick={() => addMediaLink("audio")}><Volume2 size={17}/>Rekam narasi</button><button onClick={() => audioRef.current?.click()}><Volume2 size={17}/>Audio lokal</button><button onClick={() => videoRef.current?.click()}><Video size={17}/>Video lokal</button></div><small>Rekaman dan media</small></div></div>}
          {ribbonTab === "review" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button className={spellcheck ? "active" : ""} onClick={() => setSpellcheck((value) => !value)}><FileInput size={17}/>{spellcheck ? "Ejaan aktif" : "Ejaan nonaktif"}</button><button onClick={() => setMobileSheet((value) => value === "layers" ? null : "layers")}><Layers3 size={17}/>Periksa objek</button></div><small>Pemeriksaan</small></div></div>}
          {ribbonTab === "help" && <div className="desktop-editor-tools ribbon-group word-command-strip"><div className="word-command-group"><div><button onClick={() => window.open("/downloads/panduan-lengkap-jeniusppt.pdf", "_blank")}><FileInput size={17}/>Buku PDF</button><button onClick={() => window.open("/downloads/video-tutorial-jeniusppt.mp4", "_blank")}><Video size={17}/>Video tutorial</button></div><small>Bantuan JeniusPPT</small></div></div>}
        </div>
        {ribbonTab === "home" && <div className="desktop-ribbon-content"><TextToolbar target={textTarget} onTarget={setTextTarget} style={currentTextStyle} onChange={updateTextStyle} hasSelectedText={selected?.type === "text"}/></div>}
        {ribbonTab === "elements" && <div className="desktop-ribbon-content element-library complete-element-library">
          <section className="element-library-section"><header><Shapes size={18}/><div><b>Bentuk lengkap</b><small>Klik bentuk untuk menambahkannya</small></div></header><div className="shape-library-grid">
            {shapeLibrary.map(([label,kind,w,h]) => <button key={kind} title={label} onClick={() => addElement("shape", { text: label, kind, background: "#ff641e", w, h })}><i className={`shape-preview ${kind}`}/><span>{label}</span></button>)}
          </div></section>
          <section className="element-library-section"><header><ImagePlus size={18}/><div><b>Media dan data</b><small>Tambahkan konten pendukung</small></div></header><div className="element-media-grid">
          <button onClick={() => setShowStickers(true)}><GalleryHorizontal/><span>Graphics</span></button>
          <button onClick={() => imageRef.current?.click()}><ImagePlus/><span>Photos</span></button>
          <button onClick={() => videoRef.current?.click()}><Video/><span>Videos</span></button>
          <button onClick={() => addElement("shape", { kind: "form", text: "Formulir", background: "#22c55e", w: 28, h: 28 })}><FileInput/><span>Forms</span></button>
          <button onClick={() => audioRef.current?.click()}><Volume2/><span>Audio</span></button>
          <button onClick={() => addElement("shape", { kind: "table", text: "Tabel", background: "#f97316", w: 36, h: 30 })}><Table2/><span>Tables</span></button>
          <button onClick={() => addElement("shape", { kind: "chart", text: "Bagan", background: "#0891b2", w: 36, h: 30 })}><ChartColumn/><span>Charts</span></button>
          <button onClick={() => addElement("shape", { kind: "frame", text: "Bingkai", background: "transparent", w: 38, h: 38 })}><Frame/><span>Frames</span></button>
          <button onClick={() => addElement("shape", { kind: "box", text: "Kotak 3D", background: "#8b5cf6", w: 26, h: 26 })}><Box/><span>3D</span></button>
          </div></section>
          <input ref={videoRef} hidden type="file" accept="video/*" onChange={(event) => uploadMedia(event,"video")}/>
          <input ref={audioRef} hidden type="file" accept="audio/*" onChange={(event) => uploadMedia(event,"audio")}/>
        </div>}
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
                zIndex: layerZ("__title"),
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
              {!titleBox.locked && ["nw","n","ne","e","se","s","sw","w"].map((corner) => <button key={corner} className={`text-resize-handle ${corner}`} aria-label={`Perkecil atau perbesar judul ${corner}`} onPointerDown={(event) => resizeTextBox(event,"titleBox",titleBox,corner)}/>)}
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
                readOnly={titleBox.locked}
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
                zIndex: layerZ("__body"),
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
              {!bodyBox.locked && ["nw","n","ne","e","se","s","sw","w"].map((corner) => <button key={corner} className={`text-resize-handle ${corner}`} aria-label={`Perkecil atau perbesar isi ${corner}`} onPointerDown={(event) => resizeTextBox(event,"bodyBox",bodyBox,corner)}/>)}
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
                readOnly={bodyBox.locked}
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
              layerOrder={layerOrder}
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
              <article data-slide-index={index} key={index} className={`slide-thumb-card ${index === activeIndex ? "active" : ""} ${draggedSlide === index ? "is-dragging" : ""} ${slideDropTarget === index && draggedSlide !== index ? "is-drop-target" : ""}`}>
              <button className="slide-drag-handle" title="Tekan dan tarik untuk mengubah urutan slide" aria-label={`Pindahkan slide ${index + 1}`} onPointerDown={(event) => startSlideDrag(event,index)}><GripVertical size={16}/></button>
              <button className="slide-thumb-select" onClick={() => {
                  updateMaterial(material.id, { activeSlide: index });
                  setSelectedElement(null);
                }}
              >
                <span>{index + 1}</span>
                <SlideMiniature slide={slide} slideSize={slideSize} />
              </button>
              <div className="slide-thumb-actions">
                <button className="slide-more-button" title="Pilihan slide" aria-label={`Pilihan slide ${index + 1}`} onClick={(event) => { event.stopPropagation(); setSlideMenu(slideMenu === index ? null : index); }}><MoreHorizontal size={17}/></button>
                {slideMenu === index && <div className="slide-thumb-menu" onClick={(event)=>event.stopPropagation()}>
                  <button onClick={() => copySlideContent(index)}><Copy size={14}/>Copy isi slide</button>
                  <button onClick={() => { copySlideAt(index); setSlideMenu(null); }}><CopyPlus size={14}/>Duplikat slide</button>
                  <button className="danger" disabled={slides.length <= 1} onClick={() => { deleteSlideAt(index); setSlideMenu(null); }}><Trash2 size={14}/>Hapus slide</button>
                </div>}
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
          moveLayer={moveLayer}
          layerOrder={layerOrder}
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
            moveLayer={moveLayer}
            layerOrder={layerOrder}
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
                    value={selected.style?.color || selected.color || "#ffffff"}
                    onChange={(e) =>
                      updateElement(selected.id, {
                        color: e.target.value,
                        style: {
                          ...(selected.style || {}),
                          color: e.target.value,
                          gradientEnabled: false,
                        },
                      })
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
            <div className="element-size-grid">
              <label>
                Posisi X
                <input type="number" min="0" max="100" value={Math.round(selected.x)} onChange={(e) => updateElement(selected.id, { x: Math.max(0, Math.min(100 - selected.w, Number(e.target.value))) })}/>
              </label>
              <label>
                Posisi Y
                <input type="number" min="0" max="100" value={Math.round(selected.y)} onChange={(e) => updateElement(selected.id, { y: Math.max(0, Math.min(100 - selected.h, Number(e.target.value))) })}/>
              </label>
              <label>
                Rotasi
                <input type="number" min="-360" max="360" value={Math.round(selected.rotation || 0)} onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) })}/>
              </label>
              <label>
                Opasitas
                <input type="range" min="0.1" max="1" step="0.1" value={selected.opacity ?? 1} onChange={(e) => updateElement(selected.id, { opacity: Number(e.target.value) })}/>
              </label>
            </div>
            <div className="element-property-actions">
              <button onClick={() => duplicateElement(selected.id)}><CopyPlus size={15}/>Duplikat</button>
              <button onClick={() => toggleElementLock(selected.id)}>{selected.locked ? <Unlock size={15}/> : <Lock size={15}/>} {selected.locked ? "Buka Kunci" : "Kunci"}</button>
              <button onClick={() => reorderElement(selected.id, "front")} disabled={selected.locked}><BringToFront size={15}/>Depan</button>
              <button onClick={() => reorderElement(selected.id, "back")} disabled={selected.locked}><SendToBack size={15}/>Belakang</button>
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

function CommandCenter({ currentTextStyle, updateTextStyle, active, selected, updateSlide, updateElement, addElement, addSlide, copySlide, deleteSlide, saveNow, swapOrientation, undo, redo, historyStatus, duplicateElement, toggleElementLock, reorderElement, shiftElement, deleteElement, slides }) {
  const [query, setQuery] = useState("");
  const patchText = (patch) => updateTextStyle({ ...currentTextStyle, ...patch });
  const patchElement = (patch) => selected && updateElement(selected.id, patch);
  const fontCommands = Array.from({ length: 60 }, (_, index) => {
    const size = index + 8;
    return ["Ukuran Font", `Font presisi ${size} px`, () => patchText({ fontSize: size })];
  });
  const typographyCommands = [
    ...Array.from({ length: 30 }, (_, index) => {
      const lineHeight = Number((0.8 + index * 0.07).toFixed(2));
      return ["Jarak Baris", `Jarak baris ${lineHeight}`, () => patchText({ lineHeight })];
    }),
    ...Array.from({ length: 30 }, (_, index) => {
      const letterSpacing = index - 5;
      return ["Jarak Huruf", `Jarak huruf ${letterSpacing}`, () => patchText({ letterSpacing })];
    }),
  ];
  const positionCommands = Array.from({ length: 8 }, (_, row) => Array.from({ length: 10 }, (_, column) => {
    const x = Math.round(column * 8.5);
    const y = Math.round(row * 11);
    return ["Posisi Presisi", `Posisi R${row + 1} K${column + 1}`, () => patchElement({ x, y }), !selected];
  })).flat();
  const rotationCommands = Array.from({ length: 40 }, (_, index) => {
    const rotation = index * 9;
    return ["Rotasi Presisi", `Rotasi ${rotation}°`, () => patchElement({ rotation }), !selected];
  });
  const opacityCommands = Array.from({ length: 40 }, (_, index) => {
    const opacity = Number(((index + 1) / 40).toFixed(3));
    return ["Transparansi", `Opasitas ${Math.round(opacity * 100)}%`, () => patchElement({ opacity }), !selected];
  });
  const backgroundCommands = Array.from({ length: 20 }, (_, index) => {
    const color = `hsl(${index * 18} 72% ${index % 2 ? 44 : 54}%)`;
    return ["Latar Solid", `Latar warna ${index + 1}`, () => updateSlide({ background: { type: "css", value: color } }), false, color];
  });
  const shapes = [["Kotak",28,22],["Persegi panjang",42,18],["Lingkaran",22,22],["Garis",42,2],["Panah",38,4],["Label",28,12],["Kartu",34,24],["Tabel",38,30],["Bagan",38,30],["Bingkai",42,38]];
  const shapeCommands = shapes.map(([label,w,h], index) => ["Bentuk", `Tambah ${label}`, () => addElement("shape", { text: label, kind: label.toLowerCase(), w, h, background: `hsl(${index * 32} 70% 48%)` })]);
  const coreCommands = [
    ["Perintah Utama","Tambah slide",addSlide],["Perintah Utama","Duplikat slide",copySlide],["Perintah Utama","Hapus slide",deleteSlide,slides.length <= 1],["Perintah Utama","Simpan sekarang",saveNow],["Perintah Utama","Ubah orientasi",swapOrientation],["Perintah Utama","Panduan aktif/nonaktif",()=>updateSlide({showGuides:active?.showGuides===false})],["Perintah Utama","Undo",undo,!historyStatus.canUndo],["Perintah Utama","Redo",redo,!historyStatus.canRedo],["Perintah Utama","Duplikat objek",()=>duplicateElement(),!selected],["Perintah Utama","Kunci objek",()=>toggleElementLock(selected?.id),!selected],["Perintah Utama","Bawa ke depan",()=>reorderElement(selected?.id,"front"),!selected],["Perintah Utama","Kirim ke belakang",()=>reorderElement(selected?.id,"back"),!selected],["Perintah Utama","Hapus objek",()=>deleteElement(),!selected],
  ];
  const commands = [...fontCommands, ...typographyCommands, ...positionCommands, ...rotationCommands, ...opacityCommands, ...backgroundCommands, ...shapeCommands, ...coreCommands];
  const visible = commands.filter(([group,label]) => `${group} ${label}`.toLowerCase().includes(query.toLowerCase()));
  const groups = [...new Set(visible.map(([group]) => group))];
  return <section className="command-center"><header><div><Command size={18}/><b>{commands.length} alat aktif</b></div><label><Search size={16}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Cari dari 323 perintah..."/></label></header><div className="command-groups">{groups.map((group)=><section key={group}><h3>{group}</h3><div>{visible.filter(([itemGroup])=>itemGroup===group).map(([_,label,run,disabled,color])=><button key={`${group}-${label}`} disabled={disabled} onClick={run}>{color&&<i style={{background:color}}/>}<span>{label}</span></button>)}</div></section>)}</div></section>;
}

function LayerPanel({ slide, selected, select, updateTextLayer, updateElement, shiftElement, removeElement, clearText, onTextTarget, moveLayer, layerOrder = [] }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const elements = slide?.elements || [];
  const textLayers = [
    { key: "title", label: "Judul", box: slide?.titleBox || {}, empty: !slide?.title },
    { key: "body", label: "Isi paragraf", box: slide?.bodyBox || {}, empty: !slide?.body },
  ];
  const nameOf = (item) => item.type === "image" ? "Gambar" : item.type === "video" ? "Video" : item.type === "audio" ? "Audio" : item.type === "sticker" ? "Stiker" : item.type === "shape" ? (item.text || "Bentuk") : (item.text || "Teks tambahan");
  function startLayerDrag(event, item) {
    event.preventDefault(); event.stopPropagation();
    if (item.locked) return;
    let targetId = item.id;
    setDragging(item.id); setDragOver(item.id);
    const move = (e) => {
      const row = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-layer-id]");
      if (row?.dataset.layerId) { targetId = row.dataset.layerId; setDragOver(targetId); }
    };
    const stop = () => {
      if (targetId !== item.id) moveLayer(item.id, targetId);
      setDragging(null); setDragOver(null);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }
  return (
    <section className="layer-panel" aria-label="Daftar lapisan slide">
      <header><div><small>URUTAN OBJEK</small><h3><Layers3 size={18}/> Lapisan</h3></div><span>{elements.length + 2}</span></header>
      <p>Lapisan paling atas tampil paling depan.</p>
      <div className="layer-list">
        {[...elements].map((item, sourceIndex) => ({ item, sourceIndex })).reverse().map(({ item, sourceIndex }, order) => (
          <article style={{order: layerOrder.length - layerOrder.indexOf(item.id)}} data-layer-id={item.id} key={item.id} className={`layer-row ${selected === item.id ? "active" : ""} ${item.hidden ? "is-hidden" : ""} ${dragging === item.id ? "dragging" : ""} ${dragOver === item.id && dragging !== item.id ? "drag-over" : ""}`}>
            <button className="layer-drag-handle" disabled={item.locked} title={item.locked ? "Buka kunci untuk memindahkan lapisan" : "Tarik ke urutan lapisan lain"} onPointerDown={(event) => startLayerDrag(event,item)}><GripVertical size={17}/></button>
            <button className="layer-main" onClick={() => select(item.id)}><span>{elements.length - order + 2}</span><div><b>{nameOf(item)}</b><small>{item.type}</small></div></button>
            <div className="layer-actions">
              <button disabled={item.locked} title={item.hidden ? "Tampilkan" : "Sembunyikan"} onClick={() => updateElement(item.id, { hidden: !item.hidden })}>{item.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
              <button className={`layer-lock-toggle ${item.locked ? "is-locked" : "is-unlocked"}`} aria-label={item.locked ? "Buka kunci" : "Kunci"} aria-pressed={Boolean(item.locked)} title={item.locked ? "Buka kunci" : "Kunci"} onClick={() => updateElement(item.id, { locked: !item.locked })}>{item.locked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
              <button title="Naik satu lapisan" disabled={sourceIndex === elements.length - 1} onClick={() => shiftElement(item.id, "up")}><ChevronUp size={14}/></button>
              <button title="Turun satu lapisan" disabled={sourceIndex === 0} onClick={() => shiftElement(item.id, "down")}><ChevronDown size={14}/></button>
              <button disabled={item.locked} className="danger" title="Hapus" onClick={() => removeElement(item.id)}><Trash2 size={14}/></button>
            </div>
          </article>
        ))}
        {textLayers.map((layer, index) => (
          <article style={{order: layerOrder.length - layerOrder.indexOf(layer.key === "title" ? "__title" : "__body")}} data-layer-id={layer.key === "title" ? "__title" : "__body"} key={layer.key} className={`layer-row text-layer ${layer.box.hidden ? "is-hidden" : ""} ${dragging === (layer.key === "title" ? "__title" : "__body") ? "dragging" : ""} ${dragOver === (layer.key === "title" ? "__title" : "__body") ? "drag-over" : ""}`}>
            <button className="layer-drag-handle" disabled={layer.box.locked} title={layer.box.locked ? "Buka kunci untuk memindahkan lapisan" : "Tekan dan tarik ke atas atau bawah"} onPointerDown={(event) => startLayerDrag(event,{id:layer.key === "title" ? "__title" : "__body",locked:layer.box.locked})}><GripVertical size={17}/></button>
            <button className="layer-main" onClick={() => onTextTarget(layer.key)}><span>{2 - index}</span><div><b>{layer.label}</b><small>Teks utama</small></div></button>
            <div className="layer-actions">
              <button disabled={layer.box.locked} title={layer.box.hidden ? "Tampilkan" : "Sembunyikan"} onClick={() => updateTextLayer(layer.key, { hidden: !layer.box.hidden })}>{layer.box.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
              <button className={`layer-lock-toggle ${layer.box.locked ? "is-locked" : "is-unlocked"}`} aria-label={layer.box.locked ? "Buka kunci" : "Kunci"} aria-pressed={Boolean(layer.box.locked)} title={layer.box.locked ? "Buka kunci" : "Kunci"} onClick={() => updateTextLayer(layer.key, { locked: !layer.box.locked })}>{layer.box.locked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
              <button className="danger" title="Hapus teks" disabled={layer.empty || layer.box.locked} onClick={() => clearText(layer.key)}><Trash2 size={14}/></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SlideMiniature({ slide, slideSize }) {
  const miniTextStyle = (style, fallback) => {
    const result = textStyle(style, fallback);
    return { ...result, fontSize: `${Math.max(4, Number(style?.fontSize || 32) / 7.5)}px`, lineHeight: style?.lineHeight || 1.15 };
  };
  const background = slide.background || defaultBg;
  const titleBox = slide.titleBox || { x: 8, y: 12, w: 84, h: 20 };
  const bodyBox = slide.bodyBox || { x: 8, y: 36, w: 84, h: 42 };
  return <div className="slide-strip-thumb miniature-live" style={{
    ...ratioStyle(slideSize),
    ...(background.type === "image" ? { backgroundImage: `url(${background.value})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: background.value || defaultBg.value }),
  }}>
    {!titleBox.hidden && <b style={{ ...miniTextStyle(slide.titleStyle || { fontSize: 62, bold: true, color: slide.titleColor || "#fff" }, slide.titleColor || "#fff"), left: `${titleBox.x}%`, top: `${titleBox.y}%`, width: `${titleBox.w}%`, height: `${titleBox.h}%` }}>{slide.title || "Tanpa Judul"}</b>}
    {!bodyBox.hidden && <small style={{ ...miniTextStyle(slide.bodyStyle || { fontSize: 30, color: slide.bodyColor || "#fff7ed" }, slide.bodyColor || "#fff7ed"), left: `${bodyBox.x}%`, top: `${bodyBox.y}%`, width: `${bodyBox.w}%`, height: `${bodyBox.h}%` }}>{slide.body || ""}</small>}
    {(slide.elements || []).filter((item) => !item.hidden).map((item) => <i key={item.id} className={`miniature-element ${item.type} ${item.kind || ""}`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, transform: `rotate(${item.rotation || 0}deg)`, background: item.type === "shape" ? item.background : "transparent", color: item.color, ...(item.type === "text" ? miniTextStyle(item.style || { color: item.color, fontSize: 32 }, item.color) : {}) }}>
      {(item.type === "image" || (item.type === "sticker" && item.src)) && <img src={item.src} alt=""/>}
      {item.type === "text" && item.text}
      {item.type === "sticker" && !item.src && item.text}
      {item.type === "shape" && item.text}
      {item.type === "video" && "▶"}
      {item.type === "audio" && "♫"}
    </i>)}
  </div>;
}

function ElementLayer({ elements, selected, select, update, remove, duplicate, reorder, toggleLock, onGuides, snap, layerOrder = [] }) {
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
      const peers = elements.filter((peer) => peer.id !== item.id && !peer.hidden);
      const threshold = 1.2;
      for (const peer of peers) {
        const candidatesX = [[result.x, peer.x], [result.x + item.w / 2, peer.x + peer.w / 2], [result.x + item.w, peer.x + peer.w]];
        const candidatesY = [[result.y, peer.y], [result.y + item.h / 2, peer.y + peer.h / 2], [result.y + item.h, peer.y + peer.h]];
        const hitX = candidatesX.find(([a,b]) => Math.abs(a-b) <= threshold);
        const hitY = candidatesY.find(([a,b]) => Math.abs(a-b) <= threshold);
        if (hitX) { result.x += hitX[1] - hitX[0]; result.guides.x = hitX[1]; }
        if (hitY) { result.y += hitY[1] - hitY[0]; result.guides.y = hitY[1]; }
      }
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
            zIndex: 20 + layerOrder.indexOf(item.id),
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
          {item.type === "text" && <textarea className="element-inline-text" value={item.text || ""} readOnly={item.locked} aria-label="Edit teks elemen" onPointerDown={(event) => { event.stopPropagation(); select(item.id); }} onChange={(event) => update(item.id, { text: event.target.value })}/>} 
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
            {!item.locked && ["nw","n","ne","e","se","s","sw","w"].map((corner) => <button key={corner} className={`element-resize-handle ${corner}`} aria-label={`Ubah ukuran ${corner}`} onPointerDown={(event) => startResize(event, item, corner)} />)}
            {!item.locked && <button className="element-rotate-handle" title="Putar elemen" aria-label="Putar elemen" onPointerDown={(event) => startRotate(event, item)}><RotateCw size={13}/></button>}
          </>}
        </div>
      ))}
      {contextMenu && (
        <div className="element-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}>
          <strong>Pilihan elemen</strong>
          <button disabled={contextMenu.locked} onClick={() => run(() => copyElement(contextMenu.id))}><Copy size={17}/><span>Salin</span><kbd>Ctrl+C</kbd></button>
          <button disabled={contextMenu.locked} onClick={() => run(() => duplicate(contextMenu.id))}><CopyPlus size={17}/><span>Duplikat</span><kbd>Ctrl+D</kbd></button>
          <button disabled={contextMenu.locked} onClick={() => run(() => reorder(contextMenu.id, "front"))}><BringToFront size={17}/><span>Bawa ke depan</span></button>
          <button disabled={contextMenu.locked} onClick={() => run(() => reorder(contextMenu.id, "back"))}><SendToBack size={17}/><span>Kirim ke belakang</span></button>
          <button onClick={() => run(() => toggleLock(contextMenu.id))}>{contextMenu.locked ? <Unlock size={17}/> : <Lock size={17}/>}<span>{contextMenu.locked ? "Buka kunci" : "Kunci elemen"}</span></button>
          <hr/>
          <button disabled={contextMenu.locked} className="danger" onClick={() => run(() => remove(contextMenu.id))}><Trash2 size={17}/><span>Hapus</span><kbd>Delete</kbd></button>
        </div>
      )}
    </div>
  );
}
