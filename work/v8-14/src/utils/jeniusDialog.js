function openDialog(detail) {
  window.dispatchEvent(new CustomEvent("jeniusppt:dialog", { detail }));
}

export function jeniusConfirm({ title = "Konfirmasi", message, confirmLabel = "Lanjutkan", danger = false } = {}) {
  return new Promise((resolve) => {
    openDialog({
      title,
      message,
      confirmLabel,
      cancelLabel: "Batal",
      showCancel: true,
      danger,
      icon: danger ? "trash" : "info",
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

export function jeniusPrompt({ title = "Masukkan data", message, placeholder = "", defaultValue = "", confirmLabel = "Simpan" } = {}) {
  return new Promise((resolve) => {
    openDialog({
      title,
      message,
      confirmLabel,
      cancelLabel: "Batal",
      showCancel: true,
      input: { placeholder, defaultValue },
      onConfirm: (value) => resolve(String(value || "").trim() || null),
      onCancel: () => resolve(null),
    });
  });
}
