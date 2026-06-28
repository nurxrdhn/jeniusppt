import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function publishMaterialToFirestore(material) {
  const data = {
    ...material,
    status: "Published",
    publishedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "publishedMaterials", material.shareCode), data);
  return data;
}

export async function getPublishedMaterial(shareCode) {
  const snap = await getDoc(doc(db, "publishedMaterials", shareCode));
  if (!snap.exists()) return null;
  return snap.data();
}
