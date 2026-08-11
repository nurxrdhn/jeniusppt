import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadDataAsset } from "./mediaService";

const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)]),
    );
  }
  return value;
};

const withTimeout = (promise, timeoutMs, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), timeoutMs),
    ),
  ]);

async function uploadLocalAssets(material, onProgress) {
  const copy = clean(material);
  const localAssetCount = (copy.slides || []).reduce((total, slide) => {
    const background = slide.background?.type === "image" &&
      String(slide.background.value || "").startsWith("data:") ? 1 : 0;
    const elements = (slide.elements || []).filter((element) =>
      String(element.src || "").startsWith("data:"),
    ).length;
    return total + background + elements;
  }, 0);
  let uploaded = 0;
  const assetDone = () => {
    uploaded += 1;
    onProgress?.({ stage: "upload", current: uploaded, total: localAssetCount });
  };
  onProgress?.({ stage: "prepare", current: 0, total: localAssetCount });
  copy.slides = await Promise.all(
    (copy.slides || []).map(async (slide, slideIndex) => {
      const next = { ...slide };
      if (
        next.background?.type === "image" &&
        String(next.background.value || "").startsWith("data:")
      )
        next.background = {
          ...next.background,
          value: await uploadDataAsset(
            next.background.value,
            copy.id,
            `background-${slideIndex + 1}`,
          ),
        };
      if (
        slide.background?.type === "image" &&
        String(slide.background.value || "").startsWith("data:")
      ) assetDone();
      next.elements = await Promise.all(
        (next.elements || []).map(async (element, index) => {
          if (!String(element.src || "").startsWith("data:")) return element;
          const uploadedElement = {
                ...element,
                src: await uploadDataAsset(
                  element.src,
                  copy.id,
                  `slide-${slideIndex + 1}-element-${index + 1}`,
                ),
              };
          assetDone();
          return uploadedElement;
        }),
      );
      return next;
    }),
  );
  return copy;
}

export async function publishMaterialToFirestore(material, onProgress) {
  const prepared = await withTimeout(
    uploadLocalAssets(material, onProgress),
    70000,
    "Unggahan media terlalu lama. Periksa koneksi atau kecilkan ukuran media.",
  );
  const data = {
    ...prepared,
    status: "Published",
    publishedAt: serverTimestamp(),
  };

  onProgress?.({ stage: "save" });
  await withTimeout(
    setDoc(doc(db, "publishedMaterials", material.shareCode), data),
    20000,
    "Firebase tidak merespons dalam 20 detik. Silakan coba kembali.",
  );
  onProgress?.({ stage: "done" });
  return prepared;
}

export async function getPublishedMaterial(shareCode) {
  const snap = await getDoc(doc(db, "publishedMaterials", shareCode));
  if (!snap.exists()) return null;
  return snap.data();
}
