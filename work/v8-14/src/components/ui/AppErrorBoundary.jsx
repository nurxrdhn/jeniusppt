import React from "react";

export default class AppErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("JeniusPPT render error", error, info); }
  async resetApp() {
    if ("caches" in window) await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
    window.location.replace(`${window.location.origin}/?fresh=${Date.now()}`);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="mobile-recovery"><section><span>JP</span><h1>JeniusPPT perlu dimuat ulang</h1><p>Versi browser belum sinkron dengan pembaruan terbaru. Data materi tetap tersimpan.</p><button onClick={() => window.location.reload()}>Muat Ulang</button><button className="secondary" onClick={() => this.resetApp()}>Bersihkan cache aplikasi</button><small>{this.state.error?.message || "Kesalahan tampilan"}</small></section></main>;
  }
}
