import { materials } from "../../data/appData";

export default function Materials() {
  return (
    <section>
      <div className="page-title">
        <h1>Semua Materi</h1>
        <p>Kelola materi, edit, copy, hapus, dan publish.</p>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Kelas</th>
              <th>Slide</th>
              <th>Kuis</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>{m.kelas}</td>
                <td>{m.slides}</td>
                <td>{m.quiz}</td>
                <td><span className={m.status === "Published" ? "badge green-badge" : "badge blue-badge"}>{m.status}</span></td>
                <td>
                  <button className="small-btn">Edit</button>
                  <button className="small-btn">Copy</button>
                  <button className="small-btn danger">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
