import React, { useEffect, useState } from "react";

export default function OpeningVideo({ onEnd }) {
  const base = import.meta.env.BASE_URL || "/";
  const [useSvg, setUseSvg] = useState(true);
  const [hide, setHide] = useState(false);

  // How long to keep the SVG intro visible (ms) before auto-hiding
  const DURATION_MS = 1200;

  useEffect(() => {
    // Check if opening.svg exists; if not, fall back to MP4 and auto-hide on error
    fetch(`${base}opening.svg`, { method: "HEAD" })
      .then(r => setUseSvg(r.ok))
      .catch(() => setUseSvg(false));
  }, []);

  useEffect(() => {
    if (hide) return;
    if (useSvg) {
      const t = setTimeout(() => end(), DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [useSvg, hide]);

  function end() {
    if (hide) return;
    setHide(true);
    onEnd?.();
  }

  if (hide) return null;

  return (
    <div className="overlay" onClick={end}>
      {useSvg ? (
        <object
          data={`${base}opening.svg`}
          type="image/svg+xml"
          aria-label="ALLUVO intro animation"
          style={{ width: "60vw", maxWidth: 720, height: "auto" }}
          onError={end}
        />
      ) : (
        <video
          src={`${base}opening.mp4`}
          autoPlay
          muted
          playsInline
          onEnded={end}
          onError={end}
          style={{ width: "60vw", maxWidth: 720 }}
        />
      )}
      <div className="skip">Tap to skip</div>
    </div>
  );
}
