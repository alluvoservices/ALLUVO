import React from "react";

const themes = [
  { key: "cinematic-blue", name: "Cinematic Blue", sw: ["#1F8CFF","#58ADFF","#0D5ECC"] },
  { key: "sports-orange",  name: "Sports Orange",  sw: ["#FF7A1A","#FFAA52","#D85A00"] }
];

export default function Settings() {
  function setTheme(key) {
    document.documentElement.setAttribute("data-theme", key);
    localStorage.setItem("theme", key);
  }
  const current = typeof document !== 'undefined' ? document.documentElement.getAttribute("data-theme") : null;

  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div className="section-title">Theme</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {themes.map(t => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className="row"
            style={{
              display:"flex", alignItems:"center", gap:10, cursor:"pointer",
              outline: current===t.key ? "2px solid var(--accent-2)" : "none"
            }}>
            <Sw c={t.sw[0]} /><Sw c={t.sw[1]} /><Sw c={t.sw[2]} />
            <div style={{ fontWeight: 800 }}>{t.name}</div>
          </button>
        ))}
      </div>

      <div className="section-title">Account & app</div>
      <div className="list">
        <div className="row">Parental Control (PIN) — coming soon</div>
        <div className="row">Account details</div>
        <div className="row">Privacy & Security</div>
        <div className="row">Terms & Conditions</div>
        <div className="row">Content language preference</div>
        <div className="row">App language</div>
        <div className="row">Clear search history</div>
        <div className="row">Clear watch history</div>
      </div>
    </div>
  );
}
const Sw = ({c}) => <div style={{ width:22, height:22, borderRadius:6, background:c, boxShadow:`0 0 12px ${c}88` }} />;
