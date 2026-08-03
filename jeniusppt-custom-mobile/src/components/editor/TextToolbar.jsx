import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import { FONT_OPTIONS, loadWebFont } from "../../utils/fonts";

export default function TextToolbar({
  target,
  onTarget,
  style,
  onChange,
  hasSelectedText,
}) {
  const patch = (value) => onChange({ ...style, ...value });
  return (
    <section className="word-toolbar">
      <div className="word-toolbar-row">
        <select value={target} onChange={(e) => onTarget(e.target.value)}>
          <option value="title">Judul</option>
          <option value="body">Isi</option>
          {hasSelectedText && <option value="selected">Teks Terpilih</option>}
        </select>
        <select
          className="font-select"
          value={style.fontFamily || "Arial"}
          onChange={(e) => {
            loadWebFont(e.target.value);
            patch({ fontFamily: e.target.value });
          }}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
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
      </div>
      <div className="word-toolbar-row compact">
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
        <select
          value={style.textTransform || "none"}
          onChange={(e) => patch({ textTransform: e.target.value })}
        >
          <option value="none">Normal</option>
          <option value="uppercase">HURUF BESAR</option>
          <option value="lowercase">huruf kecil</option>
          <option value="capitalize">Awal Kapital</option>
        </select>
      </div>
    </section>
  );
}
