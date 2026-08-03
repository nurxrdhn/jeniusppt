import { AlertTriangle, Check, Info, Trash2, X, XCircle } from "lucide-react";

const icons = {
  success: Check,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function JeniusToast({ notice, onClose }) {
  if (!notice) return null;
  const Icon = icons[notice.type] || Info;
  return (
    <aside
      className={`jp-toast jp-toast-${notice.type || "info"}`}
      role="status"
    >
      <span className="jp-toast-icon">
        <Icon size={19} />
      </span>
      <div>
        <b>{notice.title}</b>
        {notice.message && <p>{notice.message}</p>}
      </div>
      <button onClick={onClose} aria-label="Tutup notifikasi">
        <X size={17} />
      </button>
      <i />
    </aside>
  );
}

export function JeniusDialog({ dialog, onClose }) {
  if (!dialog) return null;
  const Icon =
    dialog.icon === "trash" ? Trash2 : dialog.danger ? AlertTriangle : Info;
  return (
    <div
      className="jp-dialog-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`jp-dialog ${dialog.danger ? "is-danger" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jp-dialog-title"
      >
        <button
          className="jp-dialog-close"
          onClick={onClose}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
        <div className="jp-dialog-symbol">
          <Icon size={25} />
        </div>
        <span className="jp-dialog-brand">JENIUSPPT</span>
        <h2 id="jp-dialog-title">{dialog.title}</h2>
        <p>{dialog.message}</p>
        <div className="jp-dialog-actions">
          {dialog.showCancel && (
            <button className="jp-dialog-cancel" onClick={onClose}>
              {dialog.cancelLabel || "Batal"}
            </button>
          )}
          {dialog.secondaryLabel && (
            <button
              className="jp-dialog-secondary"
              onClick={() => {
                dialog.onSecondary?.();
                onClose();
              }}
            >
              {dialog.secondaryLabel}
            </button>
          )}
          <button
            className="jp-dialog-primary"
            onClick={() => {
              dialog.onConfirm?.();
              onClose();
            }}
          >
            {dialog.confirmLabel || "Lanjutkan"}
          </button>
        </div>
      </section>
    </div>
  );
}
