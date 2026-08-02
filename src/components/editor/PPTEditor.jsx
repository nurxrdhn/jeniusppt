import { useEffect, useRef, useState } from "react";
import {
  Copy,
  ImagePlus,
  Plus,
  Shapes,
  Sticker,
  Trash2,
  Type,
  Video,
  Volume2,
} from "lucide-react";
import { SLIDE_SIZES, ratioStyle } from "../../utils/slideSizes";
import BackgroundPicker from "./BackgroundPicker";
import MediaPlayer from "../ui/MediaPlayer";
import { normalizeVideoUrl } from "../../utils/mediaUrl";
import TextToolbar from "./TextToolbar";
import { textStyle } from "../../utils/fonts";
const defaultBg = {
  type: "css",
  value: "linear-gradient(135deg,#ff7a25,#e94d08)",
};
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
  const imageRef = useRef(null);
  const stickerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  function setSlides(next) {
    updateMaterial(material.id, { slides: next });
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
  function deleteElement() {
    if (!selectedElement) return;
    updateSlide({
      elements: (active.elements || []).filter(
        (item) => item.id !== selectedElement,
      ),
    });
    setSelectedElement(null);
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
      <aside className="slide-list">
        <div className="panel-head">
          <h3>Slide</h3>
          <button onClick={addSlide}>
            <Plus size={16} />
          </button>
        </div>
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
            <b>{slide.title || "Untitled"}</b>
          </button>
        ))}
      </aside>
      <main className="slide-stage">
        <div className="editor-toolbar">
          <button onClick={addSlide}>
            <Plus size={16} />
            Slide
          </button>
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
          <select
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
          </select>
          <button onClick={swapOrientation}>Putar</button>
        </div>
        <TextToolbar
          target={textTarget}
          onTarget={setTextTarget}
          style={currentTextStyle}
          onChange={updateTextStyle}
          hasSelectedText={selected?.type === "text"}
        />
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
            />
          </div>
        </section>
      </main>
      <aside className="properties-panel">
        <h3>Pengaturan Slide</h3>
        <label>Ukuran</label>
        <select
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
        </select>
        <label>Animasi Masuk</label>
        <select
          value={active?.transition || "fade"}
          onChange={(e) => updateSlide({ transition: e.target.value })}
        >
          {animations.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <label>Durasi</label>
        <select
          value={active?.duration || 700}
          onChange={(e) => updateSlide({ duration: Number(e.target.value) })}
        >
          <option value={400}>Cepat</option>
          <option value={700}>Normal</option>
          <option value={1100}>Lembut</option>
          <option value={1600}>Dramatis</option>
        </select>
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
    </div>
  );
}

function ElementLayer({ elements, selected, select, update }) {
  function startDrag(event, item) {
    event.preventDefault();
    event.stopPropagation();
    select(item.id);
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
          className={`free-element ${item.type} ${selected === item.id ? "selected" : ""}`}
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
          {item.type === "sticker" &&
            (item.src ? <img src={item.src} alt="Stiker" /> : item.text)}
          {item.type === "image" && <img src={item.src} alt="Elemen slide" />}
          {(item.type === "video" || item.type === "audio") && (
            <MediaPlayer item={item} />
          )}
        </div>
      ))}
    </div>
  );
}
