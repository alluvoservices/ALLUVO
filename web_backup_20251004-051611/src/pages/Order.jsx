import React, { useState } from "react";
import api from "../utils/api";

export default function Order({ setGlobalLoading }) {
  const [q, setQ] = useState("");
  const [veg, setVeg] = useState("all");
  const [items, setItems] = useState([]);
  async function run() {
    setGlobalLoading?.(true);
    try {
      const { data } = await api.get("/api/food/search", { params: { q, veg: veg === "all" ? undefined : veg } });
      setItems(data.items || []);
    } finally { setGlobalLoading?.(false); }
  }
  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Order from EatSure</h2>
      <div className="searchbar">
        <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search food…" onKeyDown={e=>e.key==='Enter'&&run()} />
        <button className="btn" onClick={run}>Search</button>
      </div>
      <div className="filters">
        {["all","veg","non-veg"].map(v => (
          <div key={v} className={"tab"+(veg===v?" active":"")} onClick={()=>setVeg(v)}>{v.toUpperCase()}</div>
        ))}
      </div>
      <div className="row">
        {items.map(i => (
          <a key={i.id} href={i.link} target="_blank" rel="noreferrer" className="card">
            <img src={i.img || `https://source.unsplash.com/collection/1424340/400x300?sig=${i.id}`} />
            <div className="meta">{i.name} · {i.type}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
