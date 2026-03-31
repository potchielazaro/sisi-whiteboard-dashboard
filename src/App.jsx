import { useState, useEffect } from "react";

const API = "https://tools.tmtyl.com/whiteboard-api";
const WHITEBOARD = "https://whiteboard.tmtyl.com";

const PROJECTS = ["All", "Pacer", "MG Philippines", "Maxicare", "Yamaha", "Deej & Noele", "Internal"];

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
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .canvas-row { transition: background 0.15s; animation: fadeIn 0.2s ease both; }
        .canvas-row:hover { background: #141414 !important; }
        .canvas-row:hover .open-btn { opacity: 1 !important; }
        .filter-btn { transition: all 0.15s; cursor: pointer; border: none; }
        .filter-btn:hover { background: #1a1a1a !important; }
        input, select { outline: none; }
        input::placeholder { color: #444; }
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 300, letterSpacing: "-0.02em", color: "#fff" }}>Sisi</span>
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
          {uniqueProjects.map(p => (
            <button
              key={p}
              className="filter-btn"
              onClick={() => setFilter(p)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 20px",
                background: filter === p ? "#141414" : "none",
                color: filter === p ? "#fff" : "#555",
                fontSize: 13,
                borderLeft: filter === p ? "2px solid #fff" : "2px solid transparent",
              }}
            >{p}</button>
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

          {/* Error banner */}
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

          {/* Loading state */}
          {loading && (
            <div style={{ padding: "40px 16px", display: "flex", alignItems: "center", gap: 12, color: "#444", fontSize: 13 }}>
              <Spinner /> loading canvases...
            </div>
          )}

          {/* Empty state */}
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

          {/* Canvas rows */}
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
          onClick={() => !creating && setShowNew(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: 10, padding: 32, width: 400 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 300, marginBottom: 24, color: "#fff" }}>new canvas</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 6, letterSpacing: "0.08em" }}>CANVAS NAME</div>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createCanvas()}
                placeholder="e.g. Brand Discovery Board"
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 14, fontFamily: "'DM Mono', monospace" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 6, letterSpacing: "0.08em" }}>PROJECT</div>
              <select
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}
              >
                {PROJECTS.filter(p => p !== "All").map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowNew(false)} disabled={creating}
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

      {/* Delete confirm */}
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
    </div>
  );
}
