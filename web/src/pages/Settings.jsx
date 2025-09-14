import React from "react";

export default function Settings() {
  function theme(c1, c2, c3) {
    const r = document.documentElement.style;
    r.setProperty("--neon-1", c1); r.setProperty("--neon-2", c2); r.setProperty("--neon-3", c3); r.setProperty("--accent", c1);
  }
  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div className="section-title">Theme palettes</div>
      <div style={{ display: "flex", gap: 12 }}>
        <Pal onClick={()=>theme("#00e6ff","#5fff9f","#ff4dff")} a="#00e6ff" b="#5fff9f" c="#ff4dff" title="Neon" />
        <Pal onClick={()=>theme("#31e5ff","#00ffd1","#7a7dff")} a="#31e5ff" b="#00ffd1" c="#7a7dff" title="Aqua" />
        <Pal onClick={()=>theme("#ff7ac6","#ffe983","#7cffcb")} a="#ff7ac6" b="#ffe983" c="#7cffcb" title="Candy" />
      </div>

      <div className="section-title">Account & app</div>
      <div className="list">
        <div className="row">Parental Control (PIN) — set later</div>
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
function Pal({ a,b,c, title, onClick }) {
  return (
    <button onClick={onClick} className="row" style={{ display:"flex", gap:8, alignItems:"center", cursor:"pointer" }}>
      <Sw c={a}/><Sw c={b}/><Sw c={c}/> {title}
    </button>
  );
}
const Sw = ({c}) => <div style={{ width:22, height:22, borderRadius:6, background:c, boxShadow:`0 0 12px ${c}88` }} />;
