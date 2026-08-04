import { useRef, useState } from "react";
import { Download, Eraser, Frame, ImagePlus, PenLine, Save, UserRound, X } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function CertificateStudio({ material, updateMaterial }) {
  const previewRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const patch = (value) => updateMaterial(material.id, value);
  function upload(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ [field]: reader.result });
    reader.readAsDataURL(file);
  }
  async function renderCertificate() {
    return html2canvas(previewRef.current, { scale: 2.5, backgroundColor: "#ffffff", useCORS: true });
  }
  async function downloadJpg() {
    const canvas = await renderCertificate();
    const link = document.createElement("a");
    link.download = `sertifikat-${material.title || "jeniusppt"}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", .96);
    link.click();
  }
  async function downloadPdf() {
    const canvas = await renderCertificate();
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(canvas.toDataURL("image/jpeg", .96), "JPEG", 0, 0, 297, 210);
    pdf.save(`sertifikat-${material.title || "jeniusppt"}.pdf`);
  }
  function signaturePoint(event) {
    const canvas = signatureCanvasRef.current;
    const box = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - box.left) * (canvas.width / box.width),
      y: (event.clientY - box.top) * (canvas.height / box.height),
    };
  }
  function startSignature(event) {
    event.preventDefault();
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext("2d");
    const point = signaturePoint(event);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = "#182230";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function drawSignature(event) {
    if (!drawingRef.current) return;
    event.preventDefault();
    const context = signatureCanvasRef.current.getContext("2d");
    const point = signaturePoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }
  function stopSignature() {
    drawingRef.current = false;
  }
  function clearSignature() {
    const canvas = signatureCanvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }
  function saveSignature() {
    patch({ certificateSignature: signatureCanvasRef.current.toDataURL("image/png") });
    setSignaturePadOpen(false);
  }
  const assets = [
    ["certificateLogo", ImagePlus, "Logo"],
    ["certificatePhoto", UserRound, "Foto"],
    ["certificateSignature", PenLine, "Tanda tangan"],
  ];
  return (
    <section className="certificate-studio">
      <header><div><small>STUDIO SERTIFIKAT</small><h2>Pratinjau langsung</h2><p>Perubahan teks, warna, dan gambar langsung terlihat.</p></div><div><button onClick={downloadJpg}><Download size={16}/>JPG</button><button onClick={downloadPdf}><Download size={16}/>PDF</button></div></header>
      <div className="certificate-assets">
        {assets.map(([field,Icon,label]) => <label key={field}><span><Icon size={22}/></span><b>{label}</b><small>{material[field] ? "Ganti gambar" : "Tambah gambar"}</small><input hidden type="file" accept="image/*" onChange={(event) => upload(event,field)}/></label>)}
        <button className="certificate-draw-button" onClick={() => setSignaturePadOpen(true)}><span><PenLine size={22}/></span><b>Tulis TTD</b><small>Pakai pena atau jari</small></button>
        <button className="certificate-frame-button" onClick={() => patch({ certificateFrame: material.certificateFrame === "double" ? "simple" : "double" })}><span><Frame size={22}/></span><b>Bingkai</b><small>{material.certificateFrame === "double" ? "Ganda" : "Sederhana"}</small></button>
      </div>
      <div className="certificate-preview-shell">
        <div ref={previewRef} className={`certificate-preview ${material.certificateFrame === "double" ? "double" : ""}`} style={{ "--certificate-accent": material.certificateColor || "#ff641e" }}>
          <div className="certificate-brand">{material.certificateLogo ? <img src={material.certificateLogo} alt="Logo penerbit"/> : <b>JP</b>}<span>{material.certificateIssuer || "JeniusPPT.online"}</span></div>
          {material.certificatePhoto && <img className="certificate-photo" src={material.certificatePhoto} alt="Foto penerima"/>}
          <small>DIBERIKAN KEPADA</small>
          <h3>Nama Peserta</h3>
          <div className="certificate-line"/>
          <h2>{material.certificateTitle || "SERTIFIKAT PENYELESAIAN"}</h2>
          <p>{material.certificateDescription || "Telah menyelesaikan materi dan evaluasi pembelajaran"}</p>
          <strong>{material.title || "Materi Pembelajaran"}</strong>
          <footer><div><span>Nilai Minimum</span><b>{material.passingScore ?? 75}</b></div><div className="certificate-signature">{material.certificateSignature && <img src={material.certificateSignature} alt="Tanda tangan"/>}<i/><b>{material.certificateSigner || "Guru / Pengajar"}</b><span>Penandatangan</span></div></footer>
        </div>
      </div>
      {signaturePadOpen && <div className="signature-pad-backdrop" role="dialog" aria-modal="true" aria-label="Tulis tanda tangan">
        <section className="signature-pad-dialog">
          <header><div><small>TANDA TANGAN DIGITAL</small><h3>Tulis di kotak putih</h3></div><button onClick={() => setSignaturePadOpen(false)} aria-label="Tutup"><X size={20}/></button></header>
          <canvas ref={signatureCanvasRef} width="900" height="300" onPointerDown={startSignature} onPointerMove={drawSignature} onPointerUp={stopSignature} onPointerCancel={stopSignature}/>
          <p>Gunakan mouse, pena digital, atau jari di layar HP.</p>
          <footer><button className="outline" onClick={clearSignature}><Eraser size={17}/>Bersihkan</button><button onClick={saveSignature}><Save size={17}/>Gunakan TTD</button></footer>
        </section>
      </div>}
    </section>
  );
}
