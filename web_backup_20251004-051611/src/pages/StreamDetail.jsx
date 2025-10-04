import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useParams } from "react-router-dom";

export default function StreamDetail({ setGlobalLoading }) {
  const { id } = useParams();
  const [m, setM] = useState(null);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    (async () => {
      setGlobalLoading?.(true);
      try {
        const [d1, d2] = await Promise.all([
          api.get(`/api/movies/${id}`),
          api.get(`/api/movies/${id}/open`)
        ]);
        setM(d1.data); setLinks(d2.data.links || []);
      } finally { setGlobalLoading?.(false); }
    })();
  }, [id]);

  if (!m) return <div className="page">Loading…</div>;
  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        <img src={m.poster} alt={m.title} style={{ borderRadius: 12, width: 220 }} />
        <div>
          <h2 style={{ marginTop: 0 }}>{m.title}</h2>
          <div style={{ color: "#ffd166" }}>Rating: {m.rating?.toFixed?.(1)}</div>
          <p style={{ color: "#c6d2ff" }}>{m.overview}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer" className="btn">{`Open on ${l.provider}`}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
