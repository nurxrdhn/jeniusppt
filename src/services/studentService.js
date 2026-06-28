import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function saveStudentEntry({ shareCode, materialId, materialTitle, student }) {
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
