import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import apiBase from "../utils/api";
import { genKey, exportKey, importKey, encrypt, decrypt } from "../utils/crypto";

const API_ROOT = apiBase.defaults.baseURL;
let socket;

export default function Friends() {
  const [room, setRoom] = useState("alluvo-general");
  const [joined, setJoined] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [key, setKey] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    socket = io(API_ROOT, { transports: ["websocket"], withCredentials: true });
    return () => socket?.disconnect();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function join() {
    // create/load a shared room key (demo E2EE). Share the base64 key with friends by any secure channel in real life.
    let b64 = localStorage.getItem("roomKey:" + room);
    let k;
    if (!b64) {
      k = await genKey();
      b64 = await exportKey(k);
      localStorage.setItem("roomKey:" + room, b64);
      alert("Share this room key with your friends to decrypt messages:\n" + b64);
    } else {
      const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
      k = await importKey(raw);
    }
    setKey(k);
    socket.emit("join", room);
    socket.on("message", async (payload) => {
      if (!k) return;
      try {
        const txt = await decrypt(k, payload.meta.iv, payload.ciphertext);
        setMsgs(m => [...m, { text: txt, ts: payload.ts }]);
      } catch {}
    });
    setJoined(true);
  }

  async function sendMsg() {
    if (!text.trim() || !key) return;
    const { iv, ct } = await encrypt(key, text);
    socket.emit("message", { room, ciphertext: ct, meta: { iv } });
    setMsgs(m => [...m, { text, ts: Date.now() }]);
    setText("");
  }

  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>Friends & Groups</h2>
      <div className="chat-wrap">
        <div className="chat-side">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Rooms</div>
          <div className="list">
            {["alluvo-general","movies","food","tickets"].map(r => (
              <div key={r} className="row" style={{ cursor: "pointer", border: room===r?"1px solid var(--neon-2)":"1px solid #162038" }} onClick={()=>setRoom(r)}>{r}</div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            {!joined ? <button className="btn" onClick={join}>Join room</button> : <div style={{ color:"#9fb0cc" }}>Joined: {room}</div>}
            <div style={{ marginTop: 8, fontSize: 12, color:"#9fb0cc" }}>Tip: mention a movie like @Cars 3 to link it.</div>
          </div>
        </div>
        <div className="chat-main">
          <div className="msgs">
            {msgs.map((m,i) => <div key={i} className="msg">{linkify(m.text)}</div>)}
            <div ref={endRef} />
          </div>
          <div className="composer">
            <input className="input" placeholder="Type a message…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} />
            <button className="btn-send" onClick={sendMsg}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function linkify(text) {
  // turn @Movie into search link
  const parts = text.split(/(@[^@]+)/g);
  return parts.map((p, i) => {
    if (p.startsWith("@")) {
      const q = encodeURIComponent(p.slice(1).trim());
      return <a key={i} href={`${import.meta.env.BASE_URL}stream?q=${q}`} style={{ color: "#7ad7ff" }}>{p}</a>;
    }
    return <span key={i}>{p}</span>;
  });
}
