import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, Plus } from "lucide-react";

export default function Profiles() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const MAX = 4;

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        const { data } = await api.get("/api/profiles", { headers: { Authorization: `Bearer ${token}` } });
        setList((data.profiles || []).slice(0, MAX));
        setActiveId(data.activeId || null);
        // Also store the index for sidebar label
        const idx = (data.profiles || []).findIndex(p => p.id === data.activeId);
        if (idx >= 0) localStorage.setItem("activeProfileIndex", String(idx + 1));
      } finally { setLoading(false); }
    })();
  }, [token]);

  async function addProfile() {
    if (list.length >= MAX) return alert(`Maximum ${MAX} profiles`);
    const name = prompt("Profile name? (e.g., KIDS, Profile 2)");
    if (!name) return;
    const { data } = await api.post("/api/profiles", { name }, { headers: { Authorization: `Bearer ${token}` } });
    setList(x => [...x, data.profile].slice(0, MAX));
  }

  async function renameProfile(id, cur) {
    const name = prompt("New name", cur);
    if (!name) return;
    const { data } = await api.put(`/api/profiles/${id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.map(p => p.id === id ? data.profile : p));
    if (data.profile.id === activeId) {
      localStorage.setItem("activeProfile", JSON.stringify(data.profile));
    }
  }

  async function removeProfile(id) {
    if (!confirm("Delete this profile?")) return;
    await api.delete(`/api/profiles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.filter(p => p.id !== id));
    // If active got deleted, sidebar index gets cleared by backend response on next load/activation
    if (id === activeId) {
      localStorage.removeItem("activeProfile");
      localStorage.removeItem("activeProfileIndex");
      setActiveId(null);
    }
  }

  async function activate(id) {
    await api.post(`/api/profiles/${id}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setActiveId(id);
    const idx = list.findIndex(x => x.id === id);
    if (idx >= 0) localStorage.setItem("activeProfileIndex", String(idx + 1));
    const p = list.find(x => x.id === id);
    if (p) localStorage.setItem("activeProfile", JSON.stringify(p));
    navigate("/stream");
  }

  if (loading) return <div className="page">Loading profiles…</div>;

  // 2x2 grid: show up to 4. If fewer, show "Add Profile" tile.
  const canAdd = list.length < MAX;

  return (
    <div className="profiles-wrap">
      <div className="profiles-hero">
        <div className="hero-brand">ALLUVO</div>
        <div className="hero-sub">The Digital Multiplex</div>
      </div>

      <div className="profiles-grid-2x2">
        {list.map((p, i) => (
          <div key={p.id} className={"p-tile" + (p.id === activeId ? " active" : "")}>
            <button className={"avatar-xxl" + (p.id === activeId ? " ring" : "")} onClick={() => activate(p.id)} title="Activate">
              <span>{(p.name || "P")[0].toUpperCase()}</span>
            </button>
            <div className="p-title">{p.name}</div>

            {edit && (
              <div className="p-actions">
                <button className="chip ghost" onClick={() => renameProfile(p.id, p.name)} title="Rename"><Pencil size={16} /></button>
                <button className="chip danger" onClick={() => removeProfile(p.id)} title="Delete"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}

        {canAdd && (
          <div className="p-tile add">
            <button className="avatar-xxl plus" onClick={addProfile} title="Add Profile">
              <Plus size={42} />
            </button>
            <div className="p-title muted">Add Profile</div>
          </div>
        )}
      </div>

      <div className="profiles-footer">
        <button className="btn ghost" onClick={() => setEdit(e => !e)}>{edit ? "Done" : "Edit Profiles"}</button>
      </div>
    </div>
  );
}
