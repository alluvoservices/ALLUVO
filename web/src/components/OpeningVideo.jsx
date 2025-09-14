import React, { useState } from "react";
export default function OpeningVideo({ onEnd }) {
  const base = import.meta.env.BASE_URL || "/";
  const [hide, setHide] = useState(false);
  if (hide) return null;
  return (
    <div className="overlay" onClick={() => { setHide(true); onEnd?.(); }}>
      <video
        src={`${base}opening.mp4`}
        autoPlay muted playsInline
        onEnded={() => { setHide(true); onEnd?.(); }}
        onError={() => { setHide(true); onEnd?.(); }}
      />
      <div className="skip">Tap to skip</div>
    </div>
  );
}
