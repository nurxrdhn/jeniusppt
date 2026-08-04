import { useMemo, useState } from "react";
import { Check, Crown, RotateCcw, Trash2, UploadCloud, Wallet, Store } from "lucide-react";
import SolidSelect from "../ui/SolidSelect";
export const educationTemplates = [
  {
    id: "ipa-sd",
    level: "SD",
    subject: "IPA",
    title: "Mengenal Sistem Tata Surya",
    desc: "Planet, orbit, dan benda langit untuk pembelajaran dasar.",
    colors: ["#0f766e", "#22c55e"],
  },
  {
    id: "mtk-sd",
    level: "SD",
    subject: "Matematika",
    title: "Pecahan dalam Kehidupan",
    desc: "Materi pecahan dengan contoh visual yang mudah dipahami.",
    colors: ["#2563eb", "#60a5fa"],
  },
  {
    id: "ips-smp",
    level: "SMP",
    subject: "IPS",
    title: "Interaksi Sosial",
    desc: "Bentuk dan faktor interaksi sosial di masyarakat.",
    colors: ["#c2410c", "#fb923c"],
  },
  {
    id: "biologi-smp",
    level: "SMP",
    subject: "Biologi",
    title: "Sistem Pencernaan",
    desc: "Organ dan proses pencernaan manusia.",
    colors: ["#15803d", "#4ade80"],
  },
  {
    id: "fisika-sma",
    level: "SMA",
    subject: "Fisika",
    title: "Hukum Newton",
    desc: "Gaya, massa, percepatan, dan penerapannya.",
    colors: ["#4338ca", "#818cf8"],
  },
  {
    id: "kimia-sma",
    level: "SMA",
    subject: "Kimia",
    title: "Ikatan Kimia",
    desc: "Ikatan ion, kovalen, dan logam.",
    colors: ["#7e22ce", "#c084fc"],
  },
  {
    id: "ekonomi-smk",
    level: "SMK",
    subject: "Ekonomi",
    title: "Dasar Kewirausahaan",
    desc: "Ide bisnis, modal, pemasaran, dan evaluasi.",
    colors: ["#b45309", "#fbbf24"],
  },
  {
    id: "ti-smk",
    level: "SMK",
    subject: "Teknologi Informasi",
    title: "Dasar Jaringan Komputer",
    desc: "Perangkat, topologi, protokol, dan keamanan dasar.",
    colors: ["#0369a1", "#38bdf8"],
  },
  {
    id: "metode-s1",
    level: "S1",
    subject: "Metodologi",
    title: "Metodologi Penelitian",
    desc: "Masalah, variabel, metode, dan analisis penelitian.",
    colors: ["#334155", "#64748b"],
  },
  {
    id: "data-s1",
    level: "S1",
    subject: "Data",
    title: "Pengantar Analisis Data",
    desc: "Alur pengumpulan, pembersihan, analisis, dan visualisasi.",
    colors: ["#be123c", "#fb7185"],
  },
];
export function TemplateRecommendations({ onUse }) {
  const [level, setLevel] = useState("Semua");
  const [subject, setSubject] = useState("Semua");
  const subjects = [
    "Semua",
    ...new Set(educationTemplates.map((item) => item.subject)),
  ];
  const shown = educationTemplates.filter(
    (item) =>
      (level === "Semua" || item.level === level) &&
      (subject === "Semua" || item.subject === subject),
  );
  return (
    <section className="recommendation-section">
      <div className="recommendation-head">
        <div>
          <span className="eyebrow">Coba Template</span>
          <h2>Mulai dari Materi Siap Pakai</h2>
          <p>
            Pilih jenjang dan mata pelajaran, kemudian edit sesuai kebutuhan.
          </p>
        </div>
        <div className="recommendation-filters">
          <SolidSelect value={level} onChange={(e) => setLevel(e.target.value)}>
            <option>Semua</option>
            <option>SD</option>
            <option>SMP</option>
            <option>SMA</option>
            <option>SMK</option>
            <option>S1</option>
          </SolidSelect>
          <SolidSelect value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SolidSelect>
        </div>
      </div>
      <div className="recommendation-grid">
        {shown.map((item) => (
          <article key={item.id}>
            <div
              className="template-cover"
              style={{
                background: item.colors[0],
              }}
            >
              <span>{item.level}</span>
              <b>{item.subject}</b>
            </div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <button onClick={() => onUse(item)}>Gunakan Template</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function SubscriptionPage({ activePlan, onChoose }) {
  const plans = [
    {
      name: "Pemula",
      duration: "Selamanya",
      price: "0k",
      features: ["5 materi aktif", "Template dasar", "Ekspor standar"],
    },
    {
      name: "Kreator",
      duration: "1 bulan",
      price: "29k",
      features: [
        "Materi tanpa batas",
        "Semua template",
        "Sertifikat dan analitik",
      ],
    },
    {
      name: "Pendidik",
      duration: "1 bulan",
      price: "59k",
      popular: true,
      features: ["Semua fitur Kreator", "Bank soal lengkap", "Prioritas dukungan"],
    },
    {
      name: "Studio",
      duration: "1 bulan",
      price: "99k",
      features: [
        "Semua fitur Pendidik",
        "Penyimpanan lebih besar",
        "Prioritas dukungan",
      ],
    },
    {
      name: "Jenius Tahunan",
      duration: "1 tahun",
      price: "500k",
      features: [
        "Semua fitur Studio",
        "Akses 12 bulan",
        "Paket institusi personal",
      ],
    },
  ];
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Paket Akun</span>
        <h1>Pilih Langganan</h1>
        <p>Pilih paket yang sesuai dengan kebutuhan mengajar.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <article key={plan.name} className={plan.popular ? "popular" : ""}>
            {plan.popular && <em>Paling Hemat</em>}
            <Crown />
            <h2>{plan.name}</h2>
            <p>{plan.duration}</p>
            <strong>Rp{plan.price}</strong>
            <ul>
              {plan.features.map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              disabled={activePlan === plan.name}
              onClick={() => onChoose(plan)}
            >
              {activePlan === plan.name
                ? "Paket Aktif"
                : plan.price === "0k"
                  ? "Gunakan Free"
                  : "Pilih Paket"}
            </button>
          </article>
        ))}
      </div>
      <div className="payment-note">
        Pembayaran pada versi ini dicatat sebagai pilihan paket. Integrasi
        pembayaran otomatis dapat disambungkan ke Stripe atau Midtrans pada
        tahap produksi.
      </div>
    </section>
  );
}

export function CreatorMarketplace({ user, notify }) {
  const [works, setWorks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jeniusppt-creator-works")) || []; } catch { return []; }
  });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pendidikan");
  const [price, setPrice] = useState("9900");
  const [preview, setPreview] = useState("");
  const earnings = works.reduce((sum, item) => sum + (item.uses || 0) * Number(item.price || 0) * .7, 0);

  function readPreview(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }
  function publish(event) {
    event.preventDefault();
    if (!title.trim() || !preview) return notify?.("Judul dan gambar pratinjau wajib diisi.", "error");
    const next = [{ id: crypto.randomUUID(), title: title.trim(), category, price: Number(price), preview, author: user?.name || "Kreator", uses: 0, status: "Menunggu kurasi" }, ...works];
    setWorks(next); localStorage.setItem("jeniusppt-creator-works", JSON.stringify(next));
    setTitle(""); setPreview(""); notify?.("Karya dikirim ke Galeri Kreator.");
  }
  return (
    <section className="page creator-market-page">
      <div className="page-head"><span className="eyebrow">Galeri Kreator</span><h1>Bagikan karya, dapatkan penghasilan</h1><p>Unggah template orisinal. Setiap pembelian membagikan 70% pendapatan kepada kreator.</p></div>
      <div className="creator-summary"><article><Store/><div><small>Karya</small><b>{works.length}</b></div></article><article><Wallet/><div><small>Estimasi penghasilan</small><b>Rp{Math.round(earnings).toLocaleString("id-ID")}</b></div></article></div>
      <div className="creator-layout">
        <form className="creator-upload" onSubmit={publish}><h2>Unggah karya</h2><label>Judul<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Kelas Sains Modern" /></label><label>Kategori<SolidSelect value={category} onChange={(e) => setCategory(e.target.value)}><option>Pendidikan</option><option>Bisnis</option><option>Kreatif</option><option>Teknologi</option></SolidSelect></label><label>Harga<SolidSelect value={price} onChange={(e) => setPrice(e.target.value)}><option value="0">Gratis</option><option value="5000">Rp5.000</option><option value="9900">Rp9.900 — rekomendasi</option><option value="15000">Rp15.000</option></SolidSelect></label><label className="creator-file"><UploadCloud/> {preview ? "Pratinjau siap" : "Pilih gambar pratinjau"}<input hidden type="file" accept="image/*" onChange={readPreview}/></label><button className="primary-button">Kirim untuk kurasi</button></form>
        <div className="creator-gallery"><h2>Karya saya</h2>{works.length ? <div>{works.map((item) => <article key={item.id}>{item.preview && <img src={item.preview} alt=""/>}<div><small>{item.status}</small><h3>{item.title}</h3><p>{item.category} • {item.price ? `Rp${item.price.toLocaleString("id-ID")}` : "Gratis"}</p></div></article>)}</div> : <div className="empty-state"><Store/><h3>Belum ada karya</h3><p>Karya pertama akan muncul di sini setelah dikirim.</p></div>}</div>
      </div>
      <p className="market-disclaimer">Pembayaran, kurasi otomatis, lisensi, dan pencairan dana siap disambungkan ke backend serta payment gateway sebelum marketplace dibuka untuk transaksi nyata.</p>
    </section>
  );
}
export function TrashPage({ items, onRestore, onDelete }) {
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)),
    [items],
  );
  const daysLeft = (item) =>
    Math.max(
      0,
      30 -
        Math.floor(
          (Date.now() - new Date(item.deletedAt).getTime()) / 86400000,
        ),
    );
  return (
    <section className="page">
      <div className="page-head">
        <span className="eyebrow">Penyimpanan Sementara</span>
        <h1>Tempat Sampah</h1>
        <p>Materi tersimpan selama 30 hari sebelum dihapus permanen.</p>
      </div>
      {sorted.length ? (
        <div className="trash-list">
          {sorted.map((item) => (
            <article key={item.id}>
              <div>
                <span className={daysLeft(item) <= 1 ? "trash-warning" : ""}>
                  {daysLeft(item) <= 1
                    ? "H-1 sebelum dihapus"
                    : `${daysLeft(item)} hari tersisa`}
                </span>
                <h2>{item.title}</h2>
                <p>
                  {item.subject} • {item.className}
                </p>
                <small>
                  Dihapus {new Date(item.deletedAt).toLocaleString("id-ID")}
                </small>
              </div>
              <div>
                <button onClick={() => onRestore(item)}>
                  <RotateCcw size={16} />
                  Pulihkan
                </button>
                <button className="danger" onClick={() => onDelete(item)}>
                  <Trash2 size={16} />
                  Hapus Permanen
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Trash2 size={40} />
          <h2>Tempat sampah kosong</h2>
          <p>Materi yang dihapus akan muncul di sini.</p>
        </div>
      )}
    </section>
  );
}
