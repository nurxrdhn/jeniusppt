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

const withoutEmbeddedData = (value) => {
  if (Array.isArray(value)) return value.map(withoutEmbeddedData);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withoutEmbeddedData(item)]),
    );
  }
  if (typeof value === "string" && value.startsWith("data:")) return "";
  return value;
};

const compressBackground = (dataUrl) => new Promise((resolve) => {
  if (!String(dataUrl || "").startsWith("data:image/")) {
    resolve(dataUrl);
    return;
  }
  const image = new Image();
  image.onload = () => {
    const maxWidth = 1100;
    let scale = Math.min(1, maxWidth / image.naturalWidth);
    const canvas = document.createElement("canvas");
    let result = dataUrl;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      result = canvas.toDataURL("image/webp", Math.max(0.38, 0.68 - attempt * 0.08));
      if (result.length <= 90000) break;
      scale *= 0.78;
    }
    resolve(result);
  };
  image.onerror = () => resolve(dataUrl);
  image.src = dataUrl;
});

async function quickPublishedData(material) {
  const quick = withoutEmbeddedData(clean(material));
  quick.slides = await Promise.all((material.slides || []).map(async (slide, index) => {
    const safeSlide = quick.slides?.[index] || withoutEmbeddedData(clean(slide));
    if (
      slide.background?.type === "image" &&
      String(slide.background.value || "").startsWith("data:image/")
    ) {
      safeSlide.background = {
        ...slide.background,
        value: await compressBackground(slide.background.value),
      };
    }
    return safeSlide;
  }));
  return quick;
}

const hasLocalAssets = (material) => (material.slides || []).some((slide) =>
  (slide.background?.type === "image" && String(slide.background.value || "").startsWith("data:")) ||
  (slide.elements || []).some((element) => String(element.src || "").startsWith("data:")),
);

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
  const localAssets = hasLocalAssets(material);
  onProgress?.({ stage: "prepare-background" });
  const quickMaterial = await quickPublishedData(material);
  const quickData = {
    ...quickMaterial,
    status: "Published",
    publishedAt: serverTimestamp(),
    mediaSyncing: localAssets,
  };

  onProgress?.({ stage: "quick-save" });
  await withTimeout(
    setDoc(doc(db, "publishedMaterials", material.shareCode), quickData),
    20000,
    "Firebase tidak merespons dalam 20 detik. Silakan coba kembali.",
  );
  onProgress?.({ stage: "link-ready", backgroundSync: localAssets });

  if (localAssets) {
    void withTimeout(
      uploadLocalAssets(material, onProgress),
      70000,
      "Sinkronisasi media terlalu lama. Coba publikasikan ulang.",
    ).then(async (prepared) => {
      await withTimeout(
        setDoc(doc(db, "publishedMaterials", material.shareCode), {
          ...prepared,
          status: "Published",
          publishedAt: serverTimestamp(),
          mediaSyncing: false,
        }),
        20000,
        "Penyimpanan media ke materi tidak selesai.",
      );
      onProgress?.({ stage: "media-done", prepared });
    }).catch((error) => {
      console.error("Sinkronisasi media setelah publish gagal:", error);
      onProgress?.({ stage: "media-error", error });
    });
  }

  return { ...material, status: "Published", mediaSyncing: localAssets };
}

export async function getPublishedMaterial(shareCode) {
  const snap = await getDoc(doc(db, "publishedMaterials", shareCode));
  if (!snap.exists()) return null;
  return snap.data();
}
