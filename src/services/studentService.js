import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export async function saveStudentEntry({
  shareCode,
  materialId,
  materialTitle,
  student,
}) {
  const ref = await addDoc(collection(db, "studentEntries"), {
    shareCode,
    materialId: materialId || "",
    materialTitle: materialTitle || "",
    studentName: student.name,
    gender: student.gender,
    className: student.className,
    startedAt: serverTimestamp(),
    userAgent: navigator.userAgent,
  });

  return ref.id;
}

export async function saveStudentResult({
  entryId,
  shareCode,
  materialId,
  materialTitle,
  student,
  answers,
  score,
  correctCount,
  totalQuestions,
}) {
  await addDoc(collection(db, "studentResults"), {
    entryId,
    shareCode,
    materialId: materialId || "",
    materialTitle: materialTitle || "",
    studentName: student.name,
    gender: student.gender,
    className: student.className,
    answers,
    score,
    correctCount,
    totalQuestions,
    finishedAt: serverTimestamp(),
  });
}

export function subscribeParticipants(callback, onError) {
  let entries = [];
  let results = [];

  const emit = () => {
    const resultByEntry = new Map(
      results
        .filter((item) => item.entryId)
        .map((item) => [item.entryId, item]),
    );
    const merged = entries.map((entry) => {
      const result = resultByEntry.get(entry.id);
      const total = result?.totalQuestions || 0;
      const correct = result?.correctCount || 0;
      return {
        ...entry,
        ...(result || {}),
        id: result?.id || entry.id,
        entryId: entry.id,
        studentName: result?.studentName || entry.studentName,
        status: result ? "Selesai" : "Mengerjakan",
        correct,
        wrong: Math.max(total - correct, 0),
        score: result?.score ?? null,
        activityAt: result?.finishedAt || entry.startedAt || null,
      };
    });

    const known = new Set(entries.map((entry) => entry.id));
    results.forEach((result) => {
      if (!result.entryId || !known.has(result.entryId)) {
        const total = result.totalQuestions || 0;
        const correct = result.correctCount || 0;
        merged.push({
          ...result,
          status: "Selesai",
          correct,
          wrong: Math.max(total - correct, 0),
          activityAt: result.finishedAt || null,
        });
      }
    });

    merged.sort((a, b) => {
      const aTime = a.activityAt?.toMillis?.() || 0;
      const bTime = b.activityAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(merged);
  };

  const stopEntries = onSnapshot(
    collection(db, "studentEntries"),
    (snapshot) => {
      entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      emit();
    },
    onError,
  );

  const stopResults = onSnapshot(
    collection(db, "studentResults"),
    (snapshot) => {
      results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      emit();
    },
    onError,
  );

  return () => {
    stopEntries();
    stopResults();
  };
}
