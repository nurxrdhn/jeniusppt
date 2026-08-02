import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, ExternalLink, Share2, X } from "lucide-react";
import BrandIcon from "../ui/BrandIcon";

export default function ShareModal({ material, onClose, notify }) {
  const link = `${window.location.origin}/play/${material.shareCode}`;
  const isLocalLink = /localhost|127\.0\.0\.1/.test(window.location.hostname);

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    notify?.("Link siswa disalin.");
  }

  function openLink() {
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const shareText = `Pelajari “${material.title}” melalui JeniusPPT`;
  function openShareUrl(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({
        title: material.title,
        text: shareText,
        url: link,
      });
      notify?.("Pilihan aplikasi berbagi dibuka.");
    } else {
      await copyLink();
      notify?.("Browser tidak mendukung berbagi langsung. Link sudah disalin.");
    }
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

        {isLocalLink && (
          <p className="error-box">
            Link localhost hanya dapat dibuka di laptop ini. Buka website
            Vercel, lalu publikasikan ulang untuk memperoleh link HP.
          </p>
        )}

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

        <label>Kirim Langsung</label>
        <div className="social-share-grid">
          <button onClick={nativeShare}>
            <Share2 size={17} />
            Medsos / Aplikasi
          </button>
          <button
            onClick={() =>
              openShareUrl(
                `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${link}`)}`,
              )
            }
          >
            <BrandIcon name="whatsapp" />
            WhatsApp
          </button>
          <button
            onClick={() =>
              openShareUrl(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
              )
            }
          >
            <BrandIcon name="facebook" />
            Facebook
          </button>
          <button
            onClick={() =>
              openShareUrl(
                `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`,
              )
            }
          >
            <BrandIcon name="telegram" />
            Telegram
          </button>
          <button
            onClick={() =>
              openShareUrl(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`,
              )
            }
          >
            <BrandIcon name="x" />X
          </button>
          <button
            onClick={() =>
              openShareUrl(
                `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(material.title)}&body=${encodeURIComponent(`${shareText}\n\n${link}`)}`,
              )
            }
          >
            <BrandIcon name="gmail" />
            Gmail
          </button>
        </div>
      </section>
    </div>
  );
}
