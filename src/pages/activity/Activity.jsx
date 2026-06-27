import { students } from "../../data/appData";

export default function Activity() {
  return (
    <section>
      <div className="page-title">
        <h1>Aktivitas Siswa</h1>
        <p>Lihat siapa saja yang sudah masuk dan mengikuti materi.</p>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kelas</th>
              <th>Materi</th>
              <th>Status</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.kelas}</td>
                <td>{s.materi}</td>
                <td>{s.status}</td>
                <td>{s.nilai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
