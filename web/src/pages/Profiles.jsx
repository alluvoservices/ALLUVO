import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, Plus, Image as ImageIcon } from "lucide-react";
import AvatarPicker from "../components/AvatarPicker.jsx";

export default function Profiles() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const MAX = 4;
  const base = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        const { data } = await api.get("/api/profiles", { headers: { Authorization: `Bearer ${token}` } });
        const profiles = (data.profiles || []).slice(0, MAX);
        setList(profiles); setActiveId(data.activeId || null);
        const idx = profiles.findIndex(p => p.id === data.activeId);
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
    const name = prompt("New name", cur); if (!name) return;
    const { data } = await api.put(`/api/profiles/${id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.map(p => p.id === id ? data.profile : p));
    if (data.profile.id === activeId) localStorage.setItem("activeProfile", JSON.stringify(data.profile));
  }
  async function removeProfile(id) {
    if (!confirm("Delete this profile?")) return;
    await api.delete(`/api/profiles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.filter(p => p.id !== id));
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
  async function changeAvatar(profileId, value) {
    const { data } = await api.put(`/api/profiles/${profileId}`, { avatar: value }, { headers: { Authorization: `Bearer ${token}` } });
    setList(prev => prev.map(p => p.id === profileId ? data.profile : p));
    if (data.profile.id === activeId) localStorage.setItem("activeProfile", JSON.stringify(data.profile));
  }

  if (loading) return <div className="page">Loading profiles…</div>;
  const canAdd = list.length < MAX;

  return (
    <div className="profiles-wrap">
      <div className="profiles-hero">
        <div className="hero-brand">ALLUVO</div>
        <div className="hero-sub">The Digital Multiplex</div>
        <div className="profiles-quick mobile-only">
          <a className="chip" href="/settings">Settings</a>
          <a className="chip ghost" href="/notifications">Notifications</a>
        </div>
      </div>
        <div className="hero-sub">The Digital Multiplex</div>
      </div>

      <div className="profiles-grid-2x2">
        {list.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div key={p.id} className={"p-tile" + (isActive ? " active" : "")}>
              <button className={"avatar-xxl" + (isActive ? " ring" : "")} onClick={() => activate(p.id)} title="Activate">
                {p.avatar ? <img src={p.avatar} alt="" className="avatar-xxl-img" /> : <span>{(p.name || "P")[0].toUpperCase()}</span>}
              </button>
              <div className="p-title">{p.name}</div>

              {edit && (
                <div className="p-actions">
                  <button className="chip" title="Change avatar" onClick={() => setPickerFor(p.id)}><ImageIcon size={16} /></button>
                  <button className="chip ghost" onClick={() => renameProfile(p.id, p.name)} title="Rename"><Pencil size={16} /></button>
                  <button className="chip danger" onClick={() => removeProfile(p.id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          );
        })}

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

      <AvatarPicker open={!!pickerFor} base={base} onClose={() => setPickerFor(null)} onSelect={(val) => pickerFor && changeAvatar(pickerFor, val)} />
    </div>
  );
}
