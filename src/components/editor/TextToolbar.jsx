import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  SlidersHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
import { FONT_OPTIONS, loadWebFont } from "../../utils/fonts";
import SolidSelect from "../ui/SolidSelect";

export default function TextToolbar({
  target,
  onTarget,
  style,
  onChange,
  hasSelectedText,
}) {
  const [advanced, setAdvanced] = useState(false);
  const fontPreviewsLoaded = useRef(false);
  const patch = (value) => onChange({ ...style, ...value });
  function loadFontPreviews() {
    if (fontPreviewsLoaded.current) return;
    fontPreviewsLoaded.current = true;
    FONT_OPTIONS.forEach((font) => loadWebFont(font));
  }
  return (
    <section className="word-toolbar">
      <div className="word-toolbar-row">
        <SolidSelect value={target} onChange={(e) => onTarget(e.target.value)}>
          <option value="title">Judul</option>
          <option value="body">Isi</option>
          {hasSelectedText && <option value="selected">Teks Terpilih</option>}
        </SolidSelect>
        <SolidSelect
          className="font-select"
          onOpen={loadFontPreviews}
          value={style.fontFamily || "Arial"}
          onChange={(e) => {
            loadWebFont(e.target.value);
            patch({ fontFamily: e.target.value });
          }}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: `"${font}", sans-serif` }}>
              {font}
            </option>
          ))}
        </SolidSelect>
        <input
          className="font-size-input"
          type="number"
          min="8"
          max="180"
          value={style.fontSize || 32}
          onChange={(e) => patch({ fontSize: Number(e.target.value) })}
        />
        <button
          className={style.bold ? "active" : ""}
          title="Tebal"
          onClick={() => patch({ bold: !style.bold })}
        >
          <Bold size={16} />
        </button>
        <button
          className={style.italic ? "active" : ""}
          title="Miring"
          onClick={() => patch({ italic: !style.italic })}
        >
          <Italic size={16} />
        </button>
        <button
          className={style.underline ? "active" : ""}
          title="Garis bawah"
          onClick={() => patch({ underline: !style.underline })}
        >
          <Underline size={16} />
        </button>
        {[
          ["left", AlignLeft],
          ["center", AlignCenter],
          ["right", AlignRight],
          ["justify", AlignJustify],
        ].map(([value, Icon]) => (
          <button
            key={value}
            className={style.align === value ? "active" : ""}
            onClick={() => patch({ align: value })}
          >
            <Icon size={16} />
          </button>
        ))}
        <button
          className={`toolbar-more ${advanced ? "active" : ""}`}
          title="Pengaturan teks lanjutan"
          onClick={() => setAdvanced((value) => !value)}
        >
          <SlidersHorizontal size={16} />
          <span>Lanjutan</span>
        </button>
      </div>
      {advanced && <div className="word-toolbar-row compact">
        <label>
          Warna{" "}
          <input
            type="color"
            value={style.color || "#ffffff"}
            onChange={(e) =>
              patch({ color: e.target.value, gradientEnabled: false })
            }
          />
        </label>
        <label className="gradient-toggle">
          <input
            type="checkbox"
            checked={Boolean(style.gradientEnabled)}
            onChange={(e) => patch({ gradientEnabled: e.target.checked })}
          />{" "}
          Gradasi
        </label>
        {style.gradientEnabled && (
          <>
            <input
              type="color"
              value={style.gradientFrom || "#f97316"}
              onChange={(e) => patch({ gradientFrom: e.target.value })}
            />
            <input
              type="color"
              value={style.gradientTo || "#facc15"}
              onChange={(e) => patch({ gradientTo: e.target.value })}
            />
            <input
              title="Sudut gradasi"
              type="number"
              min="0"
              max="360"
              value={style.gradientAngle || 90}
              onChange={(e) => patch({ gradientAngle: Number(e.target.value) })}
            />
          </>
        )}
        <label>
          Jarak baris{" "}
          <input
            type="number"
            min="0.8"
            max="3"
            step="0.1"
            value={style.lineHeight || 1.2}
            onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
          />
        </label>
        <label>
          Jarak huruf{" "}
          <input
            type="number"
            min="-3"
            max="20"
            value={style.letterSpacing || 0}
            onChange={(e) => patch({ letterSpacing: Number(e.target.value) })}
          />
        </label>
        <SolidSelect
          value={style.textTransform || "none"}
          onChange={(e) => patch({ textTransform: e.target.value })}
        >
          <option value="none">Normal</option>
          <option value="uppercase">HURUF BESAR</option>
          <option value="lowercase">huruf kecil</option>
          <option value="capitalize">Awal Kapital</option>
        </SolidSelect>
      </div>}
    </section>
  );
}
