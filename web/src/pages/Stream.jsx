import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function Stream({ setGlobalLoading }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      setGlobalLoading?.(true);
      try {
        const { data } = await api.get("/api/movies/trending");
        setItems(data.items || []);
      } finally { setGlobalLoading?.(false); }
    })();
  }, []);
  return (
    <div>
      <div className="hero">
        <div className="slide">
          <div>
            <h1>Trending on ALLUVO</h1>
            <div className="tag">Across platforms like Netflix, Prime, Hotstar, Zee5, aha, JioCinema, Discovery+, etc.</div>
            <button className="cta">Explore</button>
          </div>
          <img className="poster" src={items[0]?.poster} alt="" />
        </div>
      </div>

      <div className="section-title">Popular</div>
      <div className="row">
        {items.map(m => (
          <Link key={m.id} to={`/stream/${m.id}`} className="card">
            <img src={m.poster} alt={m.title} />
            <div className="meta">{m.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
