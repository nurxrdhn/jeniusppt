import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase/config";

const safeName = (name = "media") => name.replace(/[^a-zA-Z0-9._-]/g, "-");

export function uploadMediaFile(file, materialId, onProgress) {
  const path = `materials/${materialId}/${Date.now()}-${safeName(file.name)}`;
  const task = uploadBytesResumable(ref(storage, path), file, {
    contentType: file.type || "application/octet-stream",
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
}
