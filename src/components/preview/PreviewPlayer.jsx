import { useMemo, useState } from "react";
import { SLIDE_SIZES, ratioStyle } from "../../utils/slideSizes";
import MediaPlayer from "../ui/MediaPlayer";
import { scaledTextStyle } from "../../utils/fonts";

function SlideElements({ elements, sourceWidth }) {
  return (
    <div className="free-elements-layer preview-elements">
      {elements.map((item, layerIndex) => item.hidden ? null : (
        <div
          key={item.id}
          className={`free-element ${item.type} ${item.kind || ""}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.w}%`,
            height: `${item.h}%`,
            color: item.color,
            background: item.type === "shape" ? item.background : "transparent",
            transform: `rotate(${item.rotation || 0}deg)`,
            opacity: item.opacity ?? 1,
            zIndex: 20 + layerIndex,
            ...(item.type === "text"
              ? scaledTextStyle(
                  item.style || {
                    color: item.color || "#fff",
                    fontSize: 32,
                    bold: true,
                  },
                  item.color || "#fff", sourceWidth,
                )
              : {}),
          }}
        >
          {item.type === "text" && item.text}
          {item.type === "shape" && item.kind === "table" && <span className="element-table">{Array.from({ length: 9 }).map((_, index) => <i key={index} />)}</span>}
          {item.type === "shape" && item.kind === "chart" && <span className="element-chart"><i/><i/><i/><i/></span>}
          {item.type === "shape" && !["table", "chart"].includes(item.kind) && <span className="shape-label">{item.text}</span>}
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

export default function PreviewPlayer({ material, teacher = true }) {
  const timeline = useMemo(
    () => [
      ...(material.slides || []).map((item, index) => ({
        kind: "slide",
        item,
        index,
      })),
      ...(material.questions || []).map((item, index) => ({
        kind: "question",
        item,
        index,
      })),
      { kind: "finish", item: null, index: 0 },
    ],
    [material],
  );
  const [active, setActive] = useState(0);
  const current = timeline[active];
  const slideSize = material.slideSize || SLIDE_SIZES.wide;
  function next() {
    setActive((i) => Math.min(i + 1, timeline.length - 1));
  }
  function prev() {
    setActive((i) => Math.max(i - 1, 0));
  }
  return (
    <div className="preview-player">
      <aside className="preview-timeline">
        {timeline.map((item, index) => (
          <button
            key={index}
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
          >
            <span>
              {item.kind === "slide"
                ? index + 1
                : item.kind === "question"
                  ? item.item.type === "truefalse"
                    ? "B/S"
                    : "PG"
                  : "✓"}
            </span>
            <b>
              {item.kind === "slide"
                ? item.item.title
                : item.kind === "question"
                  ? item.item.question
                  : "Selesai"}
            </b>
          </button>
        ))}
      </aside>
      <main className="preview-stage">
        {current.kind === "slide" && (
          <section
            key={`slide-${active}`}
            className={`preview-canvas transition-${current.item.transition || "fade"}`}
            style={{
              ...ratioStyle(slideSize),
              ...(current.item.background?.type === "image"
                ? { backgroundImage: `url(${current.item.background.value})` }
                : {
                    background:
                      current.item.background?.value ||
                      "#ff641e",
                  }),
              textAlign: current.item.textAlign || "left",
              animationDuration: `${current.item.duration || 700}ms`,
            }}
          >
            <h1
              className="positioned-title"
              style={{
                ...scaledTextStyle(
                  current.item.titleStyle || {
                    fontFamily: "Arial",
                    fontSize: 62,
                    bold: true,
                    color: current.item.titleColor || "#fff",
                  },
                  current.item.titleColor || "#fff", slideSize.width,
                ),
                left: `${current.item.titleBox?.x ?? 8}%`,
                top: `${current.item.titleBox?.y ?? 12}%`,
                width: `${current.item.titleBox?.w ?? 84}%`,
                height: `${current.item.titleBox?.h ?? 20}%`,
                display: current.item.titleBox?.hidden ? "none" : undefined,
              }}
            >
              {current.item.title}
            </h1>
            <p
              className="positioned-body"
              style={{
                ...scaledTextStyle(
                  current.item.bodyStyle || {
                    fontFamily: "Arial",
                    fontSize: 30,
                    color: current.item.bodyColor || "#fff7ed",
                    lineHeight: 1.5,
                  },
                  current.item.bodyColor || "#fff7ed", slideSize.width,
                ),
                left: `${current.item.bodyBox?.x ?? 8}%`,
                top: `${current.item.bodyBox?.y ?? 36}%`,
                width: `${current.item.bodyBox?.w ?? 84}%`,
                height: `${current.item.bodyBox?.h ?? 42}%`,
                display: current.item.bodyBox?.hidden ? "none" : undefined,
              }}
            >
              {current.item.body}
            </p>
            <SlideElements elements={current.item.elements || []} sourceWidth={slideSize.width} />
          </section>
        )}
        {current.kind === "question" && (
          <section className="preview-question">
            <span>
              {current.item.type === "truefalse"
                ? "Benar / Salah"
                : "Pilihan Ganda"}
            </span>
            <h1>{current.item.question}</h1>
            <div
              className={
                current.item.type === "truefalse" ? "tf-grid" : "answer-grid"
              }
            >
              {(current.item.type === "truefalse"
                ? ["Benar", "Salah"]
                : current.item.options
              ).map((option, index) => {
                const value =
                  current.item.type === "truefalse" ? index === 0 : index;
                return (
                  <button
                    key={option}
                    className={
                      teacher && current.item.answer === value ? "selected" : ""
                    }
                  >
                    <b>
                      {current.item.type === "truefalse"
                        ? index === 0
                          ? "✓"
                          : "✕"
                        : ["A", "B", "C", "D"][index]}
                    </b>
                    {option}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {current.kind === "finish" && (
          <section className="preview-finish">
            <h1>Selesai</h1>
            <p>
              {material.slides.length} Slide • {material.questions.length} Soal
            </p>
          </section>
        )}
        <div className="preview-controls">
          <button onClick={prev} disabled={active === 0}>
            ←
          </button>
          <span>
            {active + 1} / {timeline.length}
          </span>
          <button onClick={next} disabled={active === timeline.length - 1}>
            →
          </button>
        </div>
      </main>
    </div>
  );
}
