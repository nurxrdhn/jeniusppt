import { useState } from "react";
import Login from "./pages/auth/Login";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import Materials from "./pages/materials/Materials";
import Manual from "./pages/materials/Manual";
import CodeGenerator from "./pages/materials/CodeGenerator";
import Activity from "./pages/activity/Activity";
import Settings from "./pages/settings/Settings";

function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} user={user} setUser={setUser} />

      <main className="main">
        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "materials" && <Materials />}
        {page === "manual" && <Manual />}
        {page === "code" && <CodeGenerator />}
        {page === "activity" && <Activity />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  );
}

export default App;
