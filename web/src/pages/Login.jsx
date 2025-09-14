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
      const activeId = data.activeId; const profiles = data.profiles || [];
      if (activeId && profiles.length) {
        const p = profiles.find(x => x.id === activeId) || profiles[0];
        localStorage.setItem("activeProfile", JSON.stringify(p));
      }
      navigate("/profiles");
    } catch (e) { setErr(e.response?.data?.error || "Invalid code"); }
    finally { setGlobalLoading?.(false); }
  }

  const input = { background: "#0a1326", border: "1px solid #1a2b4a", padding: "12px 14px", borderRadius: 12, color: "white" };

  return (
    <div className="page" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={`${import.meta.env.BASE_URL}logo.jpg`} width="78" style={{ borderRadius: 12, boxShadow: "0 0 18px #0ff5" }} />
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
          <div style={{ color: "#a8c3ff" }}>Enter the 6-digit code sent to {phone || email}</div>
          <input placeholder="6-digit code" value={code} onChange={e=>setCode(e.target.value)} style={input} maxLength={6} />
          <button className="btn" type="submit">Verify</button>
          {err && <div style={{ color: "#ff7a7a" }}>{err}</div>}
        </form>
      )}
    </div>
  );
}
