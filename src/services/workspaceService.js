import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadDataAsset } from "./mediaService";

const assetCache = new Map();
const workspaceRevision = new Map();

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

const removeLargeEmbeddedFiles = (value) => {
  if (Array.isArray(value)) return value.map(removeLargeEmbeddedFiles);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, removeLargeEmbeddedFiles(item)]),
    );
  }
  if (typeof value === "string" && value.startsWith("data:") && value.length > 150000)
    return "";
  return value;
};

const withoutEmbeddedFiles = (value) => {
  if (Array.isArray(value)) return value.map(withoutEmbeddedFiles);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withoutEmbeddedFiles(item)]),
    );
  }
  if (typeof value === "string" && value.startsWith("data:")) return "";
  return value;
};

const containsEmbeddedFiles = (value) => {
  if (Array.isArray(value)) return value.some(containsEmbeddedFiles);
  if (value && typeof value === "object") return Object.values(value).some(containsEmbeddedFiles);
  return typeof value === "string" && value.startsWith("data:");
};

const uploadCachedAsset = (dataUrl, materialId, name) => {
  if (!assetCache.has(dataUrl))
    assetCache.set(dataUrl, uploadDataAsset(dataUrl, materialId, name));
  return assetCache.get(dataUrl);
};

async function resolveMaterialAssets(material) {
  const materialId = material.id || material.shareCode || "workspace";
  const slides = await Promise.all((material.slides || []).map(async (slide, slideIndex) => {
    const next = { ...slide };
    if (next.background?.type === "image" && String(next.background.value || "").startsWith("data:")) {
      next.background = {
        ...next.background,
        value: await uploadCachedAsset(next.background.value, materialId, `sync-background-${slideIndex + 1}`),
      };
    }
    next.elements = await Promise.all((next.elements || []).map(async (element, elementIndex) =>
      String(element.src || "").startsWith("data:")
        ? {
            ...element,
            src: await uploadCachedAsset(
              element.src,
              materialId,
              `sync-slide-${slideIndex + 1}-element-${elementIndex + 1}`,
            ),
          }
        : element,
    ));
    return next;
  }));
  const next = { ...material, slides };
  for (const field of ["certificateLogo", "certificatePhoto", "certificateSignature"]) {
    if (String(next[field] || "").startsWith("data:"))
      next[field] = await uploadCachedAsset(next[field], materialId, `sync-${field}`);
  }
  return next;
}

async function resolveWorkspaceAssets(payload) {
  return {
    ...payload,
    materials: await Promise.all((payload.materials || []).map(resolveMaterialAssets)),
    trash: await Promise.all((payload.trash || []).map(resolveMaterialAssets)),
  };
}

export function workspacePayload(state, settings = {}) {
  const payload = clean({
    materials: state.materials || [],
    trash: state.trash || [],
    notifications: state.notifications || [],
    activePlan: state.activePlan || "Free",
    settings,
  });
  return JSON.stringify(payload).length < 850000
    ? payload
    : removeLargeEmbeddedFiles(payload);
}

const itemTime = (item) => new Date(
  item?.updatedAt || item?.publishedAtLocal || item?.createdAt || 0,
).getTime() || 0;

const mergeItems = (localItems = [], remoteItems = []) => {
  const items = new Map(remoteItems.map((item) => [item.id || item.shareCode, item]));
  localItems.forEach((item) => {
    const key = item.id || item.shareCode;
    const remote = items.get(key);
    if (!remote || itemTime(item) > itemTime(remote)) items.set(key, item);
  });
  return [...items.values()];
};

export function mergeWorkspace(localState, remotePayload) {
  return {
    ...localState,
    ...remotePayload,
    materials: mergeItems(localState.materials, remotePayload.materials),
    trash: mergeItems(localState.trash, remotePayload.trash),
    notifications: mergeItems(localState.notifications, remotePayload.notifications).slice(0, 100),
    participants: localState.participants,
  };
}

export function subscribeWorkspace(uid, onSnapshotValue, onError) {
  return onSnapshot(
    doc(db, "userWorkspaces", uid),
    (snapshot) => onSnapshotValue(snapshot.exists() ? snapshot.data() : null),
    onError,
  );
}

export async function saveWorkspace(uid, payload, deviceId) {
  const revision = (workspaceRevision.get(uid) || 0) + 1;
  workspaceRevision.set(uid, revision);
  const hasAssets = containsEmbeddedFiles(payload);
  await setDoc(doc(db, "userWorkspaces", uid), {
    payload: hasAssets ? withoutEmbeddedFiles(payload) : payload,
    updatedBy: deviceId,
    updatedAt: serverTimestamp(),
    mediaSyncing: hasAssets,
    mediaResolved: false,
  });
  if (hasAssets) {
    void resolveWorkspaceAssets(payload).then(async (resolved) => {
      if (workspaceRevision.get(uid) !== revision) return;
      await setDoc(doc(db, "userWorkspaces", uid), {
        payload: resolved,
        updatedBy: deviceId,
        updatedAt: serverTimestamp(),
        mediaSyncing: false,
        mediaResolved: true,
      });
    }).catch((error) => console.error("Sinkronisasi media workspace gagal:", error));
  }
}
