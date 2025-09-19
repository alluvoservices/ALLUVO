import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Login({ setGlobalLoading }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("input");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  async function requestOtp(e) {
    e.preventDefault(); setErr(""); setGlobalLoading?.(true);
    try {
      const payload = phone ? { phone } : { email };
      const { data } = await api.post("/api/auth/request-otp", payload);
      if (data.sent) setMode("otp");
    } catch (e) { setErr(e.response?.data?.error || "Failed to send OTP"); }
    finally { setGlobalLoading?.(false); }
  }
  async function verify(e) {
    e.preventDefault(); setErr(""); setGlobalLoading?.(true);
    try {
      const payload = phone ? { phone, code } : { email, code };
      const { data } = await api.post("/api/auth/verify-otp", payload);
      localStorage.setItem("token", data.token);
      if (data.activeId && (data.profiles||[]).length) {
        const p = (data.profiles||[]).find(x=>x.id===data.activeId) || data.profiles[0];
        localStorage.setItem("activeProfile", JSON.stringify(p));
        const idx = (data.profiles||[]).findIndex(x=>x.id===data.activeId);
        if (idx>=0) localStorage.setItem("activeProfileIndex", String(idx+1));
      }
      navigate("/profiles");
    } catch (e) { setErr(e.response?.data?.error || "Invalid code"); }
    finally { setGlobalLoading?.(false); }
  }
  async function demo() {
    setErr(""); setGlobalLoading?.(true);
    try {
      // If you set DEMO_CODE on server, send it here: { code: "ALLUVO" }
      const { data } = await api.post("/api/auth/demo", {});
      localStorage.setItem("token", data.token);
      if (data.activeId && (data.profiles||[]).length) {
        const p = (data.profiles||[]).find(x=>x.id===data.activeId) || data.profiles[0];
        localStorage.setItem("activeProfile", JSON.stringify(p));
        const idx = (data.profiles||[]).findIndex(x=>x.id===data.activeId);
        if (idx>=0) localStorage.setItem("activeProfileIndex", String(idx+1));
      }
      navigate("/profiles");
    } catch (e) {
      setErr(e.response?.data?.error || "Demo disabled");
    } finally {
      setGlobalLoading?.(false);
    }
  }

  const input = { background: "#0a1326", border: "1px solid #1a2b4a", padding: "12px 14px", borderRadius: 12, color: "white" };

  return (
    <div className="page" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={`${import.meta.env.BASE_URL}logo.svg`} width="78" style={{ borderRadius: 12, boxShadow: "0 0 18px #0ff5" }} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src=`${import.meta.env.BASE_URL}logo.jpg`;}} />
        <h2>Sign in to ALLUVO</h2>
        <div style={{ color: "#9fb0cc" }}>OTP-only login (phone or email)</div>
      </div>

      {mode === "input" && (
        <form onSubmit={requestOtp} style={{ display: "grid", gap: 12 }}>
          <input placeholder="Phone (+91…)" value={phone} onChange={e=>setPhone(e.target.value)} style={input} />
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={input} />
          <button className="btn" type="submit">Get OTP</button>
          {err && <div style={{ color: "#ff7a7a" }}>{err}</div>}
        </form>
      )}
      {mode === "otp" && (
        <form onSubmit={verify} style={{ display: "grid", gap: 12 }}>
          <div style={{ color: "#a8c3ff" }}>Enter the 6‑digit code sent to {phone || email}</div>
          <input placeholder="6-digit code" value={code} onChange={e=>setCode(e.target.value)} style={input} maxLength={6} />
          <button className="btn" type="submit">Verify</button>
          {err && <div style={{ color: "#ff7a7a" }}>{err}</div>}
        </form>
      )}

      <div style={{ marginTop: 14, textAlign: "center", color: "#9fb0cc" }}>— or —</div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <button className="btn ghost" type="button" onClick={demo}>Try Demo (no OTP)</button>
      </div>
    </div>
  );
}
