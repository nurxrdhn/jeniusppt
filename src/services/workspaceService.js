import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

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

export function saveWorkspace(uid, payload, deviceId) {
  return setDoc(doc(db, "userWorkspaces", uid), {
    payload,
    updatedBy: deviceId,
    updatedAt: serverTimestamp(),
  });
}
