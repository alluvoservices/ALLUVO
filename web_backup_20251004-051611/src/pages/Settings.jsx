import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { clearAuthSession } from "../utils/auth";

const themes = [
  { key: "cinematic-blue", name: "Cinematic Blue", sw: ["#1F8CFF","#58ADFF","#0D5ECC"] },
  { key: "sports-orange",  name: "Sports Orange",  sw: ["#FF7A1A","#FFAA52","#D85A00"] }
];

const TYPES = ["General", "Bug Report", "Feature Request", "Partnership"];

export default function Settings() {
  const navigate = useNavigate();

  function setTheme(key) {
    document.documentElement.setAttribute("data-theme", key);
    localStorage.setItem("theme", key);
  }
  function logout() {
    if (!confirm("Log out of ALLUVO on this device?")) return;
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  const current = typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : null;

  // Feedback state
  const [fb, setFb] = useState({ name: "", email: "", type: "General", subject: "", message: "", rating: "" });
  const [fbErr, setFbErr] = useState("");
  const [fbOk, setFbOk] = useState("");
  const [sending, setSending] = useState(false);

  async function sendFeedback(e) {
    e.preventDefault(); setFbErr(""); setFbOk("");
    if (!fb.message || fb.message.trim().length < 10) {
      setFbErr("Please write at least 10 characters."); return;
    }
    if (fb.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fb.email.trim())) {
      setFbErr("Enter a valid contact email."); return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/api/feedback", {
        name: fb.name, email: fb.email, type: fb.type, subject: fb.subject, message: fb.message, rating: fb.rating ? Number(fb.rating) : undefined
      });
      if (data.ok) {
        setFbOk("Thanks! Your feedback was sent.");
        setFb({ name: "", email: "", type: "General", subject: "", message: "", rating: "" });
      } else {
        setFbErr("Could not send now. Please try again.");
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Could not send now.";
      setFbErr(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Settings</h2>

      <div className="section-title">Theme</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {themes.map(t => (
          <button key={t.key} onClick={() => setTheme(t.key)} className="row"
            style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", outline: current===t.key ? "2px solid var(--accent-2)" : "none" }}>
            <Sw c={t.sw[0]} /><Sw c={t.sw[1]} /><Sw c={t.sw[2]} />
            <div style={{ fontWeight: 800 }}>{t.name}</div>
          </button>
        ))}
      </div>

      <div className="section-title">Feedback</div>
      <form onSubmit={sendFeedback} className="list" style={{ gap: 10 }}>
        <div className="row" style={{ display:"grid", gap:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input className="input" placeholder="Your name (optional)" value={fb.name} onChange={e=>setFb({...fb, name:e.target.value})}/>
            <input className="input" placeholder="Your contact email (optional)" value={fb.email} onChange={e=>setFb({...fb, email:e.target.value})}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <select className="input" value={fb.type} onChange={e=>setFb({...fb, type:e.target.value})}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input" value={fb.rating} onChange={e=>setFb({...fb, rating:e.target.value})}>
              <option value="">Rating (optional)</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
            </select>
          </div>
          <input className="input" placeholder="Subject (optional)" value={fb.subject} onChange={e=>setFb({...fb, subject:e.target.value})}/>
          <textarea className="textarea" rows={6} placeholder="Write your feedback (10+ characters)" value={fb.message} onChange={e=>setFb({...fb, message:e.target.value})}/>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button className="btn" type="submit" disabled={sending}>{sending ? "Sending..." : "Send feedback"}</button>
            {fbOk && <span className="success-text">{fbOk}</span>}
            {fbErr && <span className="error-text">{fbErr}</span>}
          </div>
          <div className="help">Your message will be emailed to our team. We may reply to the contact email if provided.</div>
        </div>
      </form>

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

      <div className="section-title">Danger Zone</div>
      <div className="row" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontWeight: 700 }}>Log out</div>
          <div style={{ color:"var(--muted)", fontSize: 12 }}>Sign out of ALLUVO on this device.</div>
        </div>
        <button className="btn danger" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}

function Sw({ c }) { return <div style={{ width:22, height:22, borderRadius:6, background:c, boxShadow:`0 0 12px ${c}88` }} />; }
