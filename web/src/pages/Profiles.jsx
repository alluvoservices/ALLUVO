import React, { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, Image as ImageIcon } from "lucide-react";

const KEY = "alluvo_profiles";
const ACTIVE = "alluvo_activeProfile";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
function ensureDefaults() {
  let list = load();
  if (!Array.isArray(list) || list.length === 0) {
    list = ["KIDS", "Profile 2", "Profile 3", "Profile 4"].map((n,i) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2),
      name: n, avatar: null, kids: i === 0
    }));
    save(list);
    localStorage.setItem(ACTIVE, JSON.stringify(list[0]));
  }
}

export default function Profiles() {
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    ensureDefaults();
    const l = load();
    setList(l);
    const a = JSON.parse(localStorage.getItem(ACTIVE) || "null");
    setActive(a);
  }, []);

  function activate(p) {
    setActive(p);
    localStorage.setItem(ACTIVE, JSON.stringify(p));
  }

  function addProfile() {
    if (list.length >= 4) return alert("Maximum 4 profiles");
    const name = prompt("Profile name?");
    if (!name) return;
    const p = { id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2), name, avatar: null, kids: false };
    const next = [...list, p];
    setList(next); save(next);
  }

  function renameProfile(id, cur) {
    const name = prompt("New name", cur);
    if (!name) return;
    const next = list.map(p => p.id === id ? { ...p, name } : p);
    setList(next); save(next);
    if (active?.id === id) { localStorage.setItem(ACTIVE, JSON.stringify(next.find(p=>p.id===id))); setActive(next.find(p=>p.id===id)); }
  }

  function removeProfile(id) {
    if (!confirm("Delete this profile?")) return;
    let next = list.filter(p => p.id !== id);
    if (next.length === 0) {
      next = ["KIDS","Profile 2","Profile 3","Profile 4"].map((n,i)=>({ id: String(Math.random()).slice(2), name:n, avatar:null, kids:i===0 }));
    }
    setList(next); save(next);
    if (active?.id === id) { localStorage.setItem(ACTIVE, JSON.stringify(next[0])); setActive(next[0]); }
  }

  function changeAvatar(id) {
    alert("Avatar picker can be added later. For now, this is a placeholder.");
  }

  const canAdd = list.length < 4;

  return (
    <div className="page">
      <div className="hero-brand">ALLUVO</div>
      <div className="hero-sub">The Digital Multiplex</div>

      <div className="profiles-grid-2x2" style={{ marginTop: 10 }}>
        {list.map((p) => {
          const isActive = active?.id === p.id;
          return (
            <div key={p.id} className={"p-tile" + (isActive ? " active" : "")}>
              <button type="button" className={"avatar-xxl" + (isActive ? " ring" : "")} onClick={()=>activate(p)}>
                {p.avatar ? <img src={p.avatar} alt="" className="avatar-xxl-img" /> : <span>{(p.name || "P").charAt(0).toUpperCase()}</span>}
              </button>
              <div className="p-title">{p.name}</div>
              {edit && (
                <div className="p-actions">
                  <button type="button" className="chip" onClick={()=>changeAvatar(p.id)} title="Change avatar"><ImageIcon size={16} /></button>
                  <button type="button" className="chip ghost" onClick={()=>renameProfile(p.id, p.name)} title="Rename"><Pencil size={16} /></button>
                  <button type="button" className="chip danger" onClick={()=>removeProfile(p.id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          );
        })}

        {canAdd && (
          <div className="p-tile add">
            <button type="button" className="avatar-xxl plus" onClick={addProfile}><Plus size={42} /></button>
            <div className="p-title muted">Add Profile</div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button type="button" className="btn ghost" onClick={()=>setEdit(v=>!v)}>{edit ? "Done" : "Edit Profiles"}</button>
      </div>
    </div>
  );
}
