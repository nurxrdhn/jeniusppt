import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, ExternalLink, X } from "lucide-react";

export default function ShareModal({ material, onClose, notify }) {
  const link = `${window.location.origin}/play/${material.shareCode}`;

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    notify?.("Link siswa disalin.");
  }

  function openLink() {
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function downloadQR() {
    const svg = document.querySelector("#share-qr svg");
    if (!svg) return;

    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${material.shareCode}-qr.svg`;
    a.click();

    URL.revokeObjectURL(url);
    notify?.("QR Code diunduh.");
  }

  return (
    <div className="modal-backdrop">
      <section className="share-modal clean-share">
        <header>
          <div>
            <h2>Berhasil Dipublikasikan!</h2>
            <p>Link dan QR Code ini untuk siswa.</p>
          </div>

          <button onClick={onClose} title="Tutup">
            <X size={22} />
          </button>
        </header>

        <label>Link untuk Siswa</label>

        <div className="link-box">
          <span>{link}</span>
          <button onClick={copyLink}>
            <Copy size={18} />
            Salin
          </button>
        </div>

        <label>QR Code</label>

        <div className="qr-card qr-like-example" id="share-qr">
          <QRCodeSVG
            value={link}
            size={260}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            marginSize={1}
          />
        </div>

        <p className="qr-help">Scan untuk membuka materi siswa</p>

        <div className="share-actions">
          <button onClick={openLink}>
            <ExternalLink size={18} />
            Buka Link
          </button>

          <button onClick={downloadQR}>
            <Download size={18} />
            Unduh QR
          </button>

          <button onClick={onClose}>Tutup</button>
        </div>
      </section>
    </div>
  );
}
