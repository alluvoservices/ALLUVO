import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Profiles() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        const { data } = await api.get("/api/profiles", { headers: { Authorization: `Bearer ${token}` } });
        setList(data.profiles || []); setActiveId(data.activeId || null);
      } finally { setLoading(false); }
    })();
  }, [token]);

  async function addProfile() {
    if (list.length >= 5) return alert("Maximum 5 profiles");
    const name = prompt("Profile name?");
    if (!name) return;
    const { data } = await api.post("/api/profiles", { name }, { headers: { Authorization: `Bearer ${token}` } });
    setList(x => [...x, data.profile]);
  }
  async function renameProfile(id, cur) {
    const name = prompt("New name", cur); if (!name) return;
    const { data } = await api.put(`/api/profiles/${id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.map(p => p.id === id ? data.profile : p));
    if (data.profile.id === activeId) localStorage.setItem("activeProfile", JSON.stringify(data.profile));
  }
  async function removeProfile(id) {
    if (!confirm("Delete this profile?")) return;
    await api.delete(`/api/profiles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.filter(p => p.id !== id));
  }
  async function activate(id) {
    await api.post(`/api/profiles/${id}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setActiveId(id);
    const p = list.find(x => x.id === id);
    if (p) localStorage.setItem("activeProfile", JSON.stringify(p));
    navigate("/stream");
  }

  if (loading) return <div className="page">Loading profiles…</div>;
  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Profiles</h2>
      <div className="profiles-grid">
        {list.map(p => (
          <div key={p.id} className={"profile-card" + (p.id === activeId ? " active" : "")}>
            <div className="avatar-lg"><span>{(p.name || "P")[0].toUpperCase()}</span></div>
            <div className="pname">{p.name}</div>
            <div className="prow">
              <button className="btn" onClick={() => activate(p.id)}>Activate</button>
              <button className="btn ghost" onClick={() => renameProfile(p.id, p.name)}>Rename</button>
              <button className="btn danger" onClick={() => removeProfile(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {list.length < 5 && (
          <div className="profile-card" onClick={addProfile} style={{ cursor: "pointer" }}>
            <div className="avatar-lg plus">+</div>
            <div className="pname">Add Profile</div>
          </div>
        )}
      </div>
    </div>
  );
}
