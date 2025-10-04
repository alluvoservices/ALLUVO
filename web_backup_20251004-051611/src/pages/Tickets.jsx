import React, { useState } from "react";
import api from "../utils/api";

export default function Tickets() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("hyderabad");
  const [items, setItems] = useState([]);

  async function run() {
    const { data } = await api.get("/api/tickets/search", { params: { q, city } });
    setItems(data.items || []);
  }

  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Book Tickets (BookMyShow)</h2>
      <div className="searchbar">
        <input className="input" placeholder="Movie title…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} />
        <input className="input" placeholder="City (e.g., hyderabad)" value={city} onChange={e=>setCity(e.target.value)} />
        <button className="btn" onClick={run}>Search</button>
      </div>
      <div className="row">
        {items.map(x => (
          <a key={x.id} href={x.link} target="_blank" rel="noreferrer" className="card"><div className="meta" style={{ padding: 20 }}>{x.title} · {city}</div></a>
        ))}
      </div>
    </div>
  );
}
