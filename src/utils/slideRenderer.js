import html2canvas from "html2canvas";

const box = (value, fallback) => ({ ...fallback, ...(value || {}) });

function addMediaPlaceholder(parent, element) {
  const media = document.createElement("div");
  media.style.cssText = "width:100%;height:100%;display:grid;place-items:center;background:#111827;color:white;border-radius:12px;font:700 28px Arial;text-align:center;padding:16px";
  media.textContent = element.type === "audio" ? `🔊 ${element.fileName || "Audio"}` : `▶ ${element.fileName || "Video"}`;
  parent.appendChild(media);
}

export async function renderSlideToDataUrl(slide, slideSize) {
  const width = 1600;
  const height = Math.round(width * ((slideSize?.height || 7.5) / (slideSize?.width || 13.333)));
  const root = document.createElement("section");
  root.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;height:${height}px;overflow:hidden;font-family:Arial,sans-serif;color:#fff;`;
  if (slide.background?.type === "image") {
    root.style.backgroundImage = `url(${slide.background.value})`;
    root.style.backgroundSize = "cover";
    root.style.backgroundPosition = "center";
  } else root.style.background = slide.background?.value || "linear-gradient(135deg,#ff7a25,#e94d08)";

  const titleBox = box(slide.titleBox, { x:8, y:12, w:84, h:20 });
  const bodyBox = box(slide.bodyBox, { x:8, y:36, w:84, h:42 });
  const addText = (text, area, color, size, weight) => {
    const node = document.createElement("div");
    node.textContent = text || "";
    node.style.cssText = `position:absolute;left:${area.x}%;top:${area.y}%;width:${area.w}%;height:${area.h}%;color:${color};font-size:${size}px;font-weight:${weight};line-height:1.15;text-align:${slide.textAlign || "left"};white-space:pre-wrap;overflow:hidden;display:flex;align-items:flex-start;`;
    root.appendChild(node);
  };
  addText(slide.title, titleBox, slide.titleColor || "#fff", 62, 800);
  addText(slide.body, bodyBox, slide.bodyColor || "#fff7ed", 30, 400);

  for (const element of slide.elements || []) {
    const node = document.createElement("div");
    node.style.cssText = `position:absolute;left:${element.x}%;top:${element.y}%;width:${element.w}%;height:${element.h}%;display:flex;align-items:center;justify-content:center;overflow:hidden;color:${element.color || "#fff"};font-size:${element.type === "sticker" ? 72 : 30}px;font-weight:700;text-align:center;`;
    if (element.type === "text") node.textContent = element.text || "";
    if (element.type === "sticker" && !element.src) node.textContent = element.text || "⭐";
    if (element.type === "shape") { node.style.background = element.background || "#f97316"; node.style.borderRadius = "20px"; }
    if ((element.type === "image" || (element.type === "sticker" && element.src)) && element.src) {
      const image = document.createElement("img"); image.src = element.src; image.style.cssText = "width:100%;height:100%;object-fit:contain"; node.appendChild(image);
    }
    if (element.type === "video" || element.type === "audio") addMediaPlaceholder(node, element);
    root.appendChild(node);
  }

  document.body.appendChild(root);
  try {
    await Promise.all([...root.querySelectorAll("img")].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload=resolve; img.onerror=resolve; })));
    const canvas = await html2canvas(root, { backgroundColor:null, scale:1, useCORS:true, allowTaint:false, logging:false });
    return canvas.toDataURL("image/png", 1);
  } finally { root.remove(); }
}
