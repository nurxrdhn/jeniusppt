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

async function uploadLocalAssets(material) {
  const copy = clean(material);
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
      next.elements = await Promise.all(
        (next.elements || []).map(async (element, index) =>
          String(element.src || "").startsWith("data:")
            ? {
                ...element,
                src: await uploadDataAsset(
                  element.src,
                  copy.id,
                  `slide-${slideIndex + 1}-element-${index + 1}`,
                ),
              }
            : element,
        ),
      );
      return next;
    }),
  );
  return copy;
}

export async function publishMaterialToFirestore(material) {
  const prepared = await uploadLocalAssets(material);
  const data = {
    ...prepared,
    status: "Published",
    publishedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "publishedMaterials", material.shareCode), data);
  return prepared;
}

export async function getPublishedMaterial(shareCode) {
  const snap = await getDoc(doc(db, "publishedMaterials", shareCode));
  if (!snap.exists()) return null;
  return snap.data();
}
