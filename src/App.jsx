import { useState, useEffect, useRef } from "react";

const API = "https://tools.tmtyl.studio/whiteboard-api";
const WHITEBOARD = "https://whiteboard.tmtyl.studio";

const DEFAULT_PROJECTS = ["Pacer", "MG Philippines", "Maxicare", "Yamaha", "Deej & Noele", "Internal"];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Spinner() {
  return (
    <div style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #333", borderTopColor: "#888", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  );
}

function SisiLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 564.41 89.1" style={{ height: 22, width: "auto" }}>
      <style>{`.sl { fill: #fff; }`}</style>
      <g>
        <path className="sl" d="M31.17,41.62l-9.79-2.1c-4.48-1.05-6.68-2.77-6.68-5.29,0-3.29,3.15-5.5,7.97-5.5,5.15,0,8.45,2.54,8.74,6.64h12.83c-.19-9.93-8.54-16.42-21.38-16.42S1.29,25.34,1.29,35.09c0,7.54,4.96,12.59,14.66,14.8l9.44,2.1c4.58,1.1,6.31,2.53,6.31,5.1,0,3.34-3.21,5.44-8.5,5.44s-8.92-2.48-9.54-6.77H0c.76,9.97,9.16,16.56,22.81,16.56s22.76-6.64,22.76-16.69c0-7.66-4.15-11.71-14.4-14Z"/>
        <path className="sl" d="M60.81,0c-3.95.16-7.02,3.49-6.86,7.44.16,3.95,3.49,7.02,7.44,6.86,3.83-.15,6.87-3.31,6.87-7.14C68.22,3.17,64.95-.04,60.96,0c-.05,0-.1,0-.15,0Z"/>
        <rect className="sl" x="53.82" y="20.05" width="13.94" height="51.17"/>
        <path className="sl" d="M106.93,41.62l-9.78-2.1c-4.48-1.05-6.68-2.77-6.68-5.29,0-3.29,3.15-5.5,7.97-5.5,5.15,0,8.44,2.54,8.73,6.64h12.84c-.19-9.93-8.54-16.42-21.38-16.42s-21.57,6.39-21.57,16.13c0,7.54,4.96,12.59,14.66,14.8l9.44,2.1c4.58,1.1,6.3,2.53,6.3,5.1,0,3.34-3.2,5.44-8.49,5.44s-8.92-2.48-9.54-6.77h-13.65c.76,9.97,9.16,16.56,22.81,16.56s22.76-6.64,22.76-16.69c0-7.66-4.15-11.71-14.42-14Z"/>
        <rect className="sl" x="129.57" y="20.05" width="13.94" height="51.17"/>
        <path className="sl" d="M136.55,0c-3.99-.13-7.32,3.01-7.45,7,0,.05,0,.11,0,.16-.16,4.11,3.04,7.58,7.15,7.74,4.11.16,7.58-3.04,7.74-7.15.16-4.11-3.04-7.58-7.15-7.74-.1,0-.19,0-.29,0Z"/>
        <path className="sl" d="M173.69,20.81c-10.84,0-17.99,5.96-18.95,15.18h3.58c1.19-7.5,6.68-11.84,15.32-11.84s13.98,5.21,13.98,13.8v4.44l-17.08,1.19c-11.46.91-17.56,5.77-17.56,14.31s6.73,14.13,16.42,14.13c8.35,0,15.74-4.69,18.27-11.41h.1v10.65h3.58v-33.59c.01-10.36-6.77-16.85-17.65-16.85ZM187.62,52.79c0,8.82-7.92,15.93-17.7,15.93-7.69,0-13.22-4.53-13.22-10.88s5.06-10.51,14.37-11.22l16.55-1.19v7.36Z"/>
        <path className="sl" d="M239.27,34.58h-.1c-2.39-8.24-9.98-13.88-18.57-13.77-12.41,0-21.09,10.31-21.09,25.58s8.73,25.59,21.09,25.59c8.7.06,16.36-5.71,18.71-14.08h.14v13.32h3.48V2.39h-3.72l.05,32.2ZM221.13,68.63c-10.55,0-17.89-8.97-17.89-22.29s7.35-22.19,17.89-22.19,18.18,9.07,18.18,22.24-7.55,22.24-18.18,22.24Z"/>
        <polygon className="sl" points="270.23 67.48 270.09 67.48 253.2 21.58 249.23 21.58 267.94 71.22 272.38 71.22 291.04 21.58 287.13 21.58 270.23 67.48"/>
        <path className="sl" d="M315.76,20.81c-13.12,0-21.76,10.22-21.76,25.63s8.65,25.54,22.14,25.54c11.08,0,18.61-6.26,20.27-14.66h-3.72c-1.48,6.49-7.39,11.35-16.5,11.35-11.13,0-18.42-7.97-18.42-21.46v-.19h39.28v-2.11c.01-14.4-8.44-24.1-21.29-24.1ZM297.81,43.91c.54-11.83,7.6-19.81,17.89-19.81s17.48,8.1,17.53,19.81h-35.42Z"/>
        <path className="sl" d="M349.08,31.37h-.1v-9.79h-3.48v49.64h3.72v-30.93c0-9.3,4.77-15.94,12.65-15.94,1.77-.05,3.53.29,5.15,1v-3.72c-1.48-.55-3.05-.82-4.63-.81-6.59,0-11.27,3.72-13.32,10.55Z"/>
        <path className="sl" d="M381.33,59.81V24.77h9.98v-3.2h-9.98v-13.02h-3.67v13.02h-7.39v3.2h7.39v35.13c0,8.2,3.1,11.41,10.36,11.41.57,0,3.58,0,3.96-.1v-3.24h-3.43c-5.02,0-7.21-2.3-7.21-8.17Z"/>
        <path className="sl" d="M402.71,3.58c-1.59-.01-2.9,1.27-2.91,2.86h0c.1,1.61,1.49,2.83,3.1,2.73,1.47-.09,2.64-1.26,2.73-2.73-.01-1.59-1.32-2.88-2.91-2.86,0,0,0,0-.01,0Z"/>
        <rect className="sl" x="400.85" y="21.58" width="3.72" height="49.64"/>
        <path className="sl" d="M436.65,45.2l-6.87-1.62c-7.98-1.86-11.32-4.63-11.32-9.44,0-5.88,5.58-10.12,13.27-10.12s13.26,4.44,14.31,11.79h3.58c-.91-9.22-7.79-14.99-17.8-14.99s-16.94,5.63-16.94,13.46c0,6.34,4.25,10.3,13.55,12.5l7.15,1.67c7.97,1.92,11.11,4.69,11.11,9.93,0,6.11-5.96,10.4-14.4,10.4s-14.49-4.67-15.39-11.53h-3.67c.76,8.63,8.54,14.75,18.95,14.75s18.23-5.74,18.23-13.84c0-6.98-3.88-10.61-13.75-12.95Z"/>
        <path className="sl" d="M460.89,3.58c-1.59-.01-2.9,1.27-2.91,2.86h0c0,1.61,1.3,2.91,2.91,2.91s2.91-1.3,2.91-2.91c-.01-1.59-1.32-2.88-2.91-2.86,0,0,0,0,0,0Z"/>
        <rect className="sl" x="459.03" y="21.58" width="3.72" height="49.64"/>
        <path className="sl" d="M494.93,20.81c-8.45,0-14.94,4.77-17.18,11.55h-.1v-10.73h-3.48v49.58h3.72v-29.64c0-10.3,6.58-17.42,16.18-17.42s15.26,5.78,15.26,15.37v31.7h3.72v-32.2c0-11.15-7.2-18.21-18.13-18.21Z"/>
        <path className="sl" d="M560.93,21.58v13.32h-.1c-2.33-8.33-9.92-14.09-18.57-14.08-12.51,0-21,10.27-21,25.53s8.44,25.49,20.95,25.49c8.53.06,16.05-5.59,18.38-13.8h.14v12.75c0,9.06-6.55,15.07-16.85,15.07-8.55,0-14.31-4.1-15.99-9.4h-3.82c1.38,7.01,8.87,12.64,19.62,12.64,12.7,0,20.71-7.35,20.71-18.46V21.58h-3.48ZM542.7,68.49c-10.55,0-17.71-8.87-17.71-22.1s7.15-22.24,17.71-22.24,18.04,9.07,18.04,22.19-7.44,22.14-18.04,22.14Z"/>
      </g>
    </svg>
  );
}

export default function Dashboard() {
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProject, setNewProject] = useState("Internal");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Dynamic projects state
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const newProjectInputRef = useRef(null);

  // Delete project state
  const [deleteProject, setDeleteProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);

  // ── Fetch canvases ──────────────────────────────────────────────────────────
  async function fetchCanvases() {
    try {
      setError(null);
      const res = await fetch(`${API}/canvases`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setCanvases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCanvases(); }, []);

  useEffect(() => {
    if (showNewProject && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [showNewProject]);

  // ── Create canvas ───────────────────────────────────────────────────────────
  async function createCanvas() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API}/canvases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), project: newProject, creator: "Potchie" }),
      });
      if (!res.ok) throw new Error("Failed to create canvas");
      const canvas = await res.json();
      setCanvases([canvas, ...canvases]);
      setNewName("");
      setNewProject("Internal");
      setShowNew(false);
      setShowNewProject(false);
      setNewProjectName("");
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  // ── Add new project ─────────────────────────────────────────────────────────
  function confirmNewProject() {
    const name = newProjectName.trim();
    if (!name) return;
    if (!projects.includes(name)) {
      setProjects([...projects, name]);
    }
    setNewProject(name);
    setShowNewProject(false);
    setNewProjectName("");
  }

  function cancelNewProject() {
    setShowNewProject(false);
    setNewProjectName("");
  }

  // ── Delete project (+ all its canvases) ─────────────────────────────────────
  async function confirmDeleteProject() {
    setDeletingProject(true);
    try {
      const toDelete = canvases.filter(c => c.project === deleteProject);
      await Promise.all(
        toDelete.map(c => fetch(`${API}/canvases/${c.id}`, { method: "DELETE" }))
      );
      setCanvases(canvases.filter(c => c.project !== deleteProject));
      setProjects(projects.filter(p => p !== deleteProject));
      if (filter === deleteProject) setFilter("All");
      setDeleteProject(null);
    } catch (err) {
      alert("Failed to delete some canvases: " + err.message);
    } finally {
      setDeletingProject(false);
    }
  }

  // ── Delete canvas ───────────────────────────────────────────────────────────
  async function deleteCanvas(id) {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/canvases/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCanvases(canvases.filter(c => c.id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = canvases.filter(c => {
    const matchProject = filter === "All" || c.project === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.project.toLowerCase().includes(search.toLowerCase());
    return matchProject && matchSearch;
  });

  const uniqueProjects = ["All", ...new Set(canvases.map(c => c.project))];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#f0f0f0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .canvas-row { transition: background 0.15s; animation: fadeIn 0.2s ease both; }
        .canvas-row:hover { background: #141414 !important; }
        .canvas-row:hover .open-btn { opacity: 1 !important; }
        .filter-btn { transition: all 0.15s; cursor: pointer; border: none; }
        .filter-btn:hover { background: #1a1a1a !important; }
        .filter-btn:hover .project-delete-btn { opacity: 1 !important; }
        input, select { outline: none; }
        input::placeholder { color: #444; }
        .new-project-row { animation: slideDown 0.15s ease both; }
        .add-project-btn { background: none; border: 1px dashed #2a2a2a; color: #444; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-family: 'DM Mono', monospace; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em; }
        .add-project-btn:hover { border-color: #444; color: #888; }
        .project-delete-btn { opacity: 0; transition: opacity 0.15s; background: none; border: none; color: #555; cursor: pointer; padding: 0 2px; font-size: 10px; line-height: 1; flex-shrink: 0; }
        .project-delete-btn:hover { color: #cc4444 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1c1c1c",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SisiLogo />
          <span style={{ color: "#333", fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, color: "#555", letterSpacing: "0.05em" }}>whiteboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "#111", border: "1px solid #1c1c1c", borderRadius: 6, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#444", fontSize: 12 }}>⌘</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="search canvases..."
              style={{ background: "none", border: "none", color: "#ccc", fontSize: 13, width: 180 }}
            />
          </div>
          <button
            onClick={() => fetchCanvases()}
            title="Refresh"
            style={{ background: "none", border: "1px solid #1c1c1c", color: "#555", padding: "7px 12px", borderRadius: 6, fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
          >↻</button>
          <button
            onClick={() => setShowNew(true)}
            style={{ background: "#fff", color: "#000", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
          >+ new canvas</button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

        {/* Sidebar */}
        <div style={{ width: 200, borderRight: "1px solid #1c1c1c", padding: "24px 0", flexShrink: 0 }}>
          <div style={{ padding: "0 20px 12px", fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>projects</div>

          {/* All — no delete */}
          <button
            className="filter-btn"
            onClick={() => setFilter("All")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", textAlign: "left", padding: "8px 20px",
              background: filter === "All" ? "#141414" : "none",
              color: filter === "All" ? "#fff" : "#555",
              fontSize: 13,
              borderLeft: filter === "All" ? "2px solid #fff" : "2px solid transparent",
            }}
          >
            <span>All</span>
          </button>

          {/* Individual projects with delete on hover */}
          {uniqueProjects.filter(p => p !== "All").map(p => (
            <button
              key={p}
              className="filter-btn"
              onClick={() => setFilter(p)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", textAlign: "left", padding: "8px 20px 8px 18px",
                background: filter === p ? "#141414" : "none",
                color: filter === p ? "#fff" : "#555",
                fontSize: 13,
                borderLeft: filter === p ? "2px solid #fff" : "2px solid transparent",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 4 }}>{p}</span>
              <span
                className="project-delete-btn"
                onClick={e => { e.stopPropagation(); setDeleteProject(p); }}
                title={`Delete "${p}"`}
              >✕</span>
            </button>
          ))}

          <div style={{ margin: "24px 20px 12px", borderTop: "1px solid #1a1a1a" }} />
          <div style={{ padding: "0 20px 12px", fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>api</div>
          <div style={{ padding: "6px 20px" }}>
            <a href={`${API}/health`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#333", textDecoration: "none" }}>
              health check ↗
            </a>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "32px 40px" }}>

          {error && (
            <div style={{ background: "#1a0505", border: "1px solid #2a0a0a", color: "#cc4444", padding: "12px 16px", borderRadius: 6, marginBottom: 24, fontSize: 13 }}>
              ⚠ Could not reach API: {error} — check that the Docker container is running on SisiAdHub.
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            {[
              { label: "total canvases", value: canvases.length },
              { label: "this week", value: canvases.filter(c => (Date.now() - new Date(c.updatedAt)) < 7 * 86400000).length },
              { label: "projects", value: [...new Set(canvases.map(c => c.project))].length },
            ].map(s => (
              <div key={s.label} style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: 8, padding: "16px 20px", minWidth: 130 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 300, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 4, letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 140px 120px 80px 80px 60px",
            padding: "8px 16px", fontSize: 10, color: "#444", letterSpacing: "0.1em",
            textTransform: "uppercase", borderBottom: "1px solid #161616", marginBottom: 4,
          }}>
            <span>name</span><span>project</span><span>creator</span><span>updated</span><span>size</span><span></span>
          </div>

          {loading && (
            <div style={{ padding: "40px 16px", display: "flex", alignItems: "center", gap: 12, color: "#444", fontSize: 13 }}>
              <Spinner /> loading canvases...
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: "60px 16px", textAlign: "center" }}>
              <div style={{ color: "#333", fontSize: 13, marginBottom: 12 }}>
                {search || filter !== "All" ? "no canvases match your filter" : "no canvases yet"}
              </div>
              {!search && filter === "All" && (
                <button
                  onClick={() => setShowNew(true)}
                  style={{ background: "none", border: "1px solid #222", color: "#555", padding: "8px 20px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
                >create your first canvas</button>
              )}
            </div>
          )}

          {!loading && filtered.map((c, i) => (
            <div
              key={c.id}
              className="canvas-row"
              style={{
                display: "grid", gridTemplateColumns: "1fr 140px 120px 80px 80px 60px",
                padding: "14px 16px", alignItems: "center",
                borderBottom: "1px solid #111",
                background: i % 2 === 0 ? "#0a0a0a" : "#0c0c0c",
                animationDelay: `${i * 0.03}s`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, color: "#1c1c1c" }}>▭</span>
                <span style={{ fontSize: 14, color: "#ccc" }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 11, color: "#555", background: "#111", border: "1px solid #1c1c1c", padding: "2px 8px", borderRadius: 4, display: "inline-block", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.project}</span>
              <span style={{ fontSize: 12, color: "#555" }}>{c.creator}</span>
              <span style={{ fontSize: 12, color: "#444" }}>{timeAgo(c.updatedAt)}</span>
              <span style={{ fontSize: 11, color: "#333" }}>{c.size}</span>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <a
                  href={`${WHITEBOARD}/#canvas-${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="open-btn"
                  style={{ fontSize: 11, color: "#fff", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "3px 10px", borderRadius: 4, textDecoration: "none", opacity: 0, transition: "opacity 0.15s" }}
                >open</a>
                <button
                  onClick={() => setDeleteId(c.id)}
                  style={{ fontSize: 11, color: "#333", background: "none", border: "none", padding: "3px 6px", cursor: "pointer" }}
                >✕</button>
              </div>
            </div>
          ))}

          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 16px", fontSize: 11, color: "#333" }}>
              {filtered.length} canvas{filtered.length !== 1 ? "es" : ""}
            </div>
          )}
        </div>
      </div>

      {/* New canvas modal */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => { if (!creating) { setShowNew(false); setShowNewProject(false); setNewProjectName(""); } }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: 10, padding: 32, width: 400 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 300, marginBottom: 24, color: "#fff" }}>new canvas</div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 6, letterSpacing: "0.08em" }}>CANVAS NAME</div>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !showNewProject && createCanvas()}
                placeholder="e.g. Brand Discovery Board"
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 14, fontFamily: "'DM Mono', monospace" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.08em" }}>PROJECT</div>
                {!showNewProject && (
                  <button className="add-project-btn" onClick={() => setShowNewProject(true)}>+ project</button>
                )}
              </div>

              {showNewProject && (
                <div className="new-project-row" style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input
                    ref={newProjectInputRef}
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") confirmNewProject();
                      if (e.key === "Escape") cancelNewProject();
                    }}
                    placeholder="project name"
                    style={{
                      flex: 1, background: "#111", border: "1px solid #3a3a3a", borderRadius: 6,
                      padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "'DM Mono', monospace",
                    }}
                  />
                  <button onClick={confirmNewProject} disabled={!newProjectName.trim()}
                    style={{ background: newProjectName.trim() ? "#fff" : "#1a1a1a", color: newProjectName.trim() ? "#000" : "#444", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                    add
                  </button>
                  <button onClick={cancelNewProject}
                    style={{ background: "none", border: "1px solid #222", color: "#555", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                    ✕
                  </button>
                </div>
              )}

              <select
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
              >
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setShowNew(false); setShowNewProject(false); setNewProjectName(""); }} disabled={creating}
                style={{ background: "none", border: "1px solid #222", color: "#555", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                cancel
              </button>
              <button onClick={createCanvas} disabled={!newName.trim() || creating}
                style={{ background: newName.trim() && !creating ? "#fff" : "#1a1a1a", color: newName.trim() && !creating ? "#000" : "#444", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {creating ? <><Spinner /> creating...</> : "create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete canvas confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: 10, padding: 28, width: 340 }}>
            <div style={{ fontSize: 14, color: "#ccc", marginBottom: 20 }}>
              delete <span style={{ color: "#fff" }}>"{canvases.find(c => c.id === deleteId)?.name}"</span>?
            </div>
            <div style={{ fontSize: 12, color: "#444", marginBottom: 20 }}>this will permanently delete the .excalidraw file from SisiAdHub.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                style={{ background: "none", border: "1px solid #222", color: "#555", padding: "7px 18px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                cancel
              </button>
              <button onClick={() => deleteCanvas(deleteId)} disabled={deleting}
                style={{ background: "#1a0505", border: "1px solid #2a0a0a", color: "#cc4444", padding: "7px 18px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {deleting ? <><Spinner /> deleting...</> : "delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete project confirm */}
      {deleteProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: 10, padding: 28, width: 380 }}>
            <div style={{ fontSize: 14, color: "#ccc", marginBottom: 12 }}>
              delete project <span style={{ color: "#fff" }}>"{deleteProject}"</span>?
            </div>
            <div style={{ fontSize: 12, color: "#cc4444", background: "#1a0505", border: "1px solid #2a0a0a", borderRadius: 6, padding: "10px 14px", marginBottom: 20 }}>
              ⚠ This will permanently delete{" "}
              <strong>{canvases.filter(c => c.project === deleteProject).length} canvas{canvases.filter(c => c.project === deleteProject).length !== 1 ? "es" : ""}</strong>{" "}
              inside this project from SisiAdHub.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteProject(null)} disabled={deletingProject}
                style={{ background: "none", border: "1px solid #222", color: "#555", padding: "7px 18px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                cancel
              </button>
              <button onClick={confirmDeleteProject} disabled={deletingProject}
                style={{ background: "#1a0505", border: "1px solid #2a0a0a", color: "#cc4444", padding: "7px 18px", borderRadius: 6, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {deletingProject ? <><Spinner /> deleting...</> : "delete project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
