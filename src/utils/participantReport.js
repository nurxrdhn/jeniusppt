const cleanName = (value) =>
  String(value || "semua-materi")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
const formatDate = (value) => {
  const date = value?.toDate?.() || (value instanceof Date ? value : null);
  return date
    ? date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    : "-";
};
const rowsFromParticipants = (participants) =>
  participants.map((item, index) => ({
    No: index + 1,
    "Nama Peserta": item.studentName || "Siswa",
    "Jenis Kelamin": item.gender || "-",
    Kelas: item.className || "-",
    Materi: item.materialTitle || "-",
    "Kode Materi": item.shareCode || "-",
    Status: item.status || "-",
    Benar: item.status === "Selesai" ? item.correct || 0 : "-",
    Salah: item.status === "Selesai" ? item.wrong || 0 : "-",
    Nilai: item.status === "Selesai" ? (item.score ?? 0) : "-",
    "Waktu Aktivitas": formatDate(item.activityAt),
  }));

export async function exportParticipantsExcel(participants, reportTitle) {
  if (!participants.length)
    throw new Error("Tidak ada data peserta untuk diekspor.");
  const XLSX = await import("xlsx");
  const rows = rowsFromParticipants(participants);
  const sheet = XLSX.utils.json_to_sheet(rows, { origin: "A4" });
  XLSX.utils.sheet_add_aoa(
    sheet,
    [
      ["LAPORAN PESERTA JENIUSPPT"],
      [reportTitle],
      [`Dicetak: ${new Date().toLocaleString("id-ID")}`],
    ],
    { origin: "A1" },
  );
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
  ];
  sheet["!cols"] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 17 },
    { wch: 14 },
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 9 },
    { wch: 9 },
    { wch: 10 },
    { wch: 24 },
  ];
  sheet["!autofilter"] = { ref: `A4:K${rows.length + 4}` };
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Peserta");
  XLSX.writeFile(book, `laporan-peserta-${cleanName(reportTitle)}.xlsx`);
}

export async function exportParticipantsPdf(participants, reportTitle) {
  if (!participants.length)
    throw new Error("Tidak ada data peserta untuk diekspor.");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const columns = [
    { label: "No", x: 10, w: 10 },
    { label: "Nama", x: 20, w: 43 },
    { label: "Kelas", x: 63, w: 26 },
    { label: "Materi", x: 89, w: 53 },
    { label: "Status", x: 142, w: 25 },
    { label: "Benar", x: 167, w: 17 },
    { label: "Salah", x: 184, w: 17 },
    { label: "Nilai", x: 201, w: 18 },
    { label: "Waktu", x: 219, w: 68 },
  ];
  let y = 0;
  const header = () => {
    pdf.setFillColor(249, 115, 22);
    pdf.rect(0, 0, 297, 7, "F");
    pdf.setTextColor(67, 20, 7);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text("Laporan Peserta JeniusPPT", 10, 18);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 75, 62);
    pdf.text(reportTitle, 10, 25);
    pdf.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 287, 25, {
      align: "right",
    });
    y = 34;
    pdf.setFillColor(255, 237, 213);
    pdf.rect(10, y, 277, 9, "F");
    pdf.setTextColor(154, 52, 18);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    columns.forEach((c) => pdf.text(c.label, c.x + 2, y + 6));
    y += 9;
  };
  header();
  participants.forEach((item, index) => {
    if (y > 192) {
      pdf.addPage();
      header();
    }
    if (index % 2 === 1) {
      pdf.setFillColor(255, 250, 245);
      pdf.rect(10, y, 277, 9, "F");
    }
    pdf.setTextColor(67, 45, 35);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    const values = [
      index + 1,
      item.studentName || "Siswa",
      item.className || "-",
      item.materialTitle || "-",
      item.status || "-",
      item.status === "Selesai" ? item.correct || 0 : "-",
      item.status === "Selesai" ? item.wrong || 0 : "-",
      item.status === "Selesai" ? (item.score ?? 0) : "-",
      formatDate(item.activityAt),
    ];
    columns.forEach((c, i) => {
      const text = String(values[i]);
      const max = Math.floor(c.w * 1.8);
      pdf.text(
        text.length > max ? `${text.slice(0, max - 2)}...` : text,
        c.x + 2,
        y + 6,
      );
    });
    y += 9;
  });
  const completed = participants.filter((i) => i.status === "Selesai");
  const average = completed.length
    ? Math.round(
        completed.reduce((n, i) => n + Number(i.score || 0), 0) /
          completed.length,
      )
    : 0;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(154, 52, 18);
  pdf.setFontSize(9);
  pdf.text(
    `Total peserta: ${participants.length}   |   Selesai: ${completed.length}   |   Rata-rata nilai: ${average}`,
    10,
    Math.min(y + 8, 203),
  );
  pdf.save(`laporan-peserta-${cleanName(reportTitle)}.pdf`);
}
