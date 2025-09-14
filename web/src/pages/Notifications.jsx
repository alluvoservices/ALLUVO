import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function Notifications() {
  const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  async function load() {
    if (!token) return;
    const { data } = await api.get("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
    setItems(data.items || []);
  }
  useEffect(()=>{ load(); }, []);
  async function markRead(id) {
    await api.post(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    load();
  }
  async function clearReads() {
    await api.delete(`/api/notifications/read`, { headers: { Authorization: `Bearer ${token}` } });
    load();
  }
  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Notifications</h2>
      <div style={{ marginBottom: 8 }}>
        <button className="btn" onClick={clearReads}>Delete read</button>
      </div>
      <div className="list">
        {items.map(n => (
          <div key={n.id} className="note-item">
            <div>
              <div style={{ fontWeight: 700 }}>{n.title}</div>
              <div style={{ color: "#9fb0cc" }}>{n.body}</div>
            </div>
            {!n.read ? <button className="btn" onClick={()=>markRead(n.id)}>Mark read</button> : <span style={{ color:"#a0f5c1" }}>Read</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
