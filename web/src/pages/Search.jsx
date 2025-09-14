import React, { useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function Search({ setGlobalLoading }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [res, setRes] = useState({ movies: [], food: [], tickets: [] });

  async function run() {
    if (!q.trim()) return;
    setGlobalLoading?.(true);
    try {
      const { data } = await api.get("/api/search", { params: { q } });
      setRes(data);
    } finally { setGlobalLoading?.(false); }
  }

  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Global Search</h2>
      <div className="searchbar">
        <input className="input" placeholder="Search movies, food, tickets…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} />
        <button className="btn" onClick={run}>Search</button>
      </div>
      <div className="tabs">
        {["all","movies","food","tickets"].map(t => (
          <div key={t} className={"tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>{t.toUpperCase()}</div>
        ))}
      </div>

      {(tab==="all"||tab==="movies") && (
        <>
          <div className="section-title">Movies</div>
          <div className="row">
            {res.movies.map(m => (
              <Link key={m.id} to={`/stream/${m.id}`} className="card">
                <img src={m.poster} alt={m.title} />
                <div className="meta">{m.title}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {(tab==="all"||tab==="food") && (
        <>
          <div className="section-title">Food (EatSure)</div>
          <div className="row">
            {res.food.map(f => (
              <a key={f.id} href={f.link} target="_blank" rel="noreferrer" className="card">
                <img src={`https://source.unsplash.com/collection/1424340/400x300?sig=${f.id}`} />
                <div className="meta">{f.name} · {f.type}</div>
              </a>
            ))}
          </div>
        </>
      )}

      {(tab==="all"||tab==="tickets") && (
        <>
          <div className="section-title">Tickets (BookMyShow)</div>
          <div className="row">
            {res.tickets.map(t => (
              <a key={t.id} href={t.link} target="_blank" rel="noreferrer" className="card">
                <div className="meta" style={{ padding: 20 }}>{t.title}</div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
