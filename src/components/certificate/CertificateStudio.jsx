import { useRef } from "react";
import { Download, Frame, ImagePlus, PenLine, UserRound } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function CertificateStudio({ material, updateMaterial }) {
  const previewRef = useRef(null);
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
        <button className="certificate-frame-button" onClick={() => patch({ certificateFrame: material.certificateFrame === "double" ? "simple" : "double" })}><span><Frame size={22}/></span><b>Bingkai</b><small>{material.certificateFrame === "double" ? "Ganda" : "Sederhana"}</small></button>
      </div>
      <div className="certificate-preview-shell">
        <div ref={previewRef} className={`certificate-preview ${material.certificateFrame === "double" ? "double" : ""}`} style={{ "--certificate-accent": material.certificateColor || "#ff641e" }}>
          <i className="certificate-corner top"/><i className="certificate-corner bottom"/>
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
    </section>
  );
}
