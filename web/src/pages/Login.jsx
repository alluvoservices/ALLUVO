import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { Eye, EyeOff } from "lucide-react";

const COUNTRIES = [
  { code: "IN", dial: "+91", label: "India (+91)" },
  { code: "US", dial: "+1", label: "USA (+1)" },
  { code: "GB", dial: "+44", label: "UK (+44)" },
  { code: "AE", dial: "+971", label: "UAE (+971)" },
  { code: "AU", dial: "+61", label: "Australia (+61)" }
];

function isEmail(v) {
  const s = String(v||"").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function normalizeIdentifier(raw, countryCode) {
  const v = String(raw||"").trim();
  if (!v) return { ok: false, error: "Enter email or phone" };
  if (v.includes("@")) {
    if (!isEmail(v)) return { ok: false, error: "Enter a valid email" };
    return { ok: true, id: v.toLowerCase(), type: "email" };
  }
  const cc = (countryCode || "IN").toUpperCase();
  const p = parsePhoneNumberFromString(v, cc);
  if (!p || !p.isValid()) return { ok: false, error: "Enter a valid phone number" };
  return { ok: true, id: p.number, type: "phone" }; // E.164
}
function strongPassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,18}$/.test(String(pw||""));
}
function errMsg(e, fallback) {
  const d = e?.response?.data;
  if (d?.error) return d.error;
  if (typeof d === "string") return d.slice(0, 200);
  if (e?.message) return e.message;
  return fallback;
}

export default function Login({ setGlobalLoading }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register | otp | otp-code
  const [country, setCountry] = useState("IN");
  const [id, setId] = useState(""); // email or phone
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [code, setCode] = useState(""); // OTP
  const [err, setErr] = useState("");

  function onAuth(data) {
    localStorage.setItem("token", data.token);
    if (data.activeId && (data.profiles||[]).length) {
      const p = (data.profiles||[]).find(x=>x.id===data.activeId) || data.profiles[0];
      localStorage.setItem("activeProfile", JSON.stringify(p));
      const idx = (data.profiles||[]).findIndex(x=>x.id===data.activeId);
      if (idx>=0) localStorage.setItem("activeProfileIndex", String(idx+1));
    }
    navigate("/profiles");
  }

  async function doRegister(e) {
    e.preventDefault(); setErr("");
    const norm = normalizeIdentifier(id, country);
    if (!norm.ok) return setErr(norm.error);
    if (!strongPassword(pw)) return setErr("Password: 8–18 chars with upper, lower, number, symbol");
    if (pw !== pw2) return setErr("Passwords do not match");
    setGlobalLoading?.(true);
    try {
      const { data } = await api.post("/api/auth/register", { identifier: norm.id, password: pw, country });
      onAuth(data);
    } catch (e) {
      setErr(errMsg(e, "Could not create account"));
    } finally { setGlobalLoading?.(false); }
  }

  async function doLogin(e) {
    e.preventDefault(); setErr("");
    const norm = normalizeIdentifier(id, country);
    if (!norm.ok) return setErr(norm.error);
    if (!pw) return setErr("Enter your password");
    setGlobalLoading?.(true);
    try {
      const { data } = await api.post("/api/auth/login", { identifier: norm.id, password: pw, country });
      onAuth(data);
    } catch (e) {
      setErr(errMsg(e, "Invalid credentials"));
    } finally { setGlobalLoading?.(false); }
  }

  async function requestOtp(e) {
    e.preventDefault(); setErr("");
    const norm = normalizeIdentifier(id, country);
    if (!norm.ok) return setErr(norm.error);
    setGlobalLoading?.(true);
    try {
      const payload = norm.type === "phone" ? { phone: norm.id } : { email: norm.id };
      const { data } = await api.post("/api/auth/request-otp", payload);
      if (data.sent) setMode("otp-code");
    } catch (e) {
      setErr(errMsg(e, "Failed to send OTP"));
    } finally { setGlobalLoading?.(false); }
  }

  async function verifyOtp(e) {
    e.preventDefault(); setErr("");
    const norm = normalizeIdentifier(id, country);
    if (!norm.ok) return setErr(norm.error);
    if (!code.trim()) return setErr("Enter the OTP");
    setGlobalLoading?.(true);
    try {
      const payload = norm.type === "phone" ? { phone: norm.id, code } : { email: norm.id, code };
      const { data } = await api.post("/api/auth/verify-otp", payload);
      onAuth(data);
    } catch (e) {
      setErr(errMsg(e, "Invalid code"));
    } finally { setGlobalLoading?.(false); }
  }

  async function demo() {
    setErr(""); setGlobalLoading?.(true);
    try {
      const { data } = await api.post("/api/auth/demo", {});
      onAuth(data);
    } catch (e) {
      setErr(errMsg(e, "Demo disabled"));
    } finally { setGlobalLoading?.(false); }
  }

  const base = import.meta.env.BASE_URL || "/";
  const inputClass = "input";

  return (
    <div className="page" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={`${base}logo.svg`} width="78"
             onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src=`${base}logo.jpg`;}}
             style={{ borderRadius: 12, boxShadow: "0 0 18px #0ff5" }} />
        <h2 className="login-title">Sign in to ALLUVO</h2>
        <div className="login-sub">Use email/phone + password, or OTP</div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <button className={"tab" + (mode==="login" ? " active" : "")} onClick={()=>setMode("login")}>Login</button>
        <button className={"tab" + (mode==="register" ? " active" : "")} onClick={()=>setMode("register")}>Create account</button>
        <button className={"tab" + ((mode==="otp"||mode==="otp-code") ? " active" : "")} onClick={()=>setMode("otp")}>Use OTP</button>
      </div>

      {/* Email/Phone + Country */}
      <div className="searchbar" style={{ alignItems:"center" }}>
        <input className={inputClass} placeholder="Email or phone number" value={id} onChange={e=>setId(e.target.value)} />
        <select className={inputClass} style={{ maxWidth:160 }} value={country} onChange={e=>setCountry(e.target.value)}>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>

      {mode === "login" && (
        <form onSubmit={doLogin} style={{ display:"grid", gap:12 }}>
          <div className="input-wrap">
            <input className={inputClass} placeholder="Password" type={showPw ? "text" : "password"} value={pw} onChange={e=>setPw(e.target.value)} />
            <button type="button" aria-label={showPw ? "Hide password" : "Show password"} className="eye-btn" onClick={()=>setShowPw(s=>!s)}>
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <button className="btn" type="submit">Login</button>
          {err && <div className="error-text">{err}</div>}
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={doRegister} style={{ display:"grid", gap:12 }}>
          <div className="input-wrap">
            <input className={inputClass} placeholder="Password (8–18, upper/lower/number/symbol)" type={showPw ? "text" : "password"} value={pw} onChange={e=>setPw(e.target.value)} autoComplete="new-password" />
            <button type="button" aria-label={showPw ? "Hide password" : "Show password"} className="eye-btn" onClick={()=>setShowPw(s=>!s)}>
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <div className="input-wrap">
            <input className={inputClass} placeholder="Confirm password" type={showPw2 ? "text" : "password"} value={pw2} onChange={e=>setPw2(e.target.value)} autoComplete="new-password" />
            <button type="button" aria-label={showPw2 ? "Hide password" : "Show password"} className="eye-btn" onClick={()=>setShowPw2(s=>!s)}>
              {showPw2 ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <button className="btn" type="submit">Create account</button>
          {err && <div className="error-text">{err}</div>}
        </form>
      )}

      {mode === "otp" && (
        <form onSubmit={requestOtp} style={{ display:"grid", gap:12 }}>
          <button className="btn" type="submit">Get OTP</button>
          {err && <div className="error-text">{err}</div>}
        </form>
      )}

      {mode === "otp-code" && (
        <form onSubmit={verifyOtp} style={{ display:"grid", gap:12 }}>
          <input className={inputClass} placeholder="Enter 6-digit OTP" value={code} onChange={e=>setCode(e.target.value)} maxLength={6}/>
          <button className="btn" type="submit">Verify</button>
          {err && <div className="error-text">{err}</div>}
        </form>
      )}

      <div style={{ marginTop: 14, textAlign: "center" }} className="login-sub">— or —</div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <button className="btn ghost" type="button" onClick={demo}>Try Demo (no OTP)</button>
      </div>
    </div>
  );
}
