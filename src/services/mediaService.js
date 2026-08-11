import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase/config";

const safeName = (name = "media") => name.replace(/[^a-zA-Z0-9._-]/g, "-");

export function uploadMediaFile(file, materialId, onProgress, timeoutMs = 45000) {
  const path = `materials/${materialId}/${Date.now()}-${safeName(file.name)}`;
  const task = uploadBytesResumable(ref(storage, path), file, {
    contentType: file.type || "application/octet-stream",
  });

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      handler(value);
    };
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Unggahan ${file.name} melewati batas waktu 45 detik.`));
      task.cancel();
    }, timeoutMs);
    task.on(
      "state_changed",
      (snapshot) =>
        onProgress?.(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        ),
      (error) => finish(reject, error),
      async () => {
        try {
          finish(resolve, await getDownloadURL(task.snapshot.ref));
        } catch (error) {
          finish(reject, error);
        }
      },
    );
  });
}

export async function uploadDataAsset(dataUrl, materialId, name = "asset") {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = (blob.type.split("/")[1] || "bin").replace(
    "svg+xml",
    "svg",
  );
  const file = new File([blob], `${name}.${extension}`, { type: blob.type });
  return uploadMediaFile(file, materialId);
}
