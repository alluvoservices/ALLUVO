import React from "react";

export default function LoaderOverlay({ show }) {
  const base = import.meta.env.BASE_URL || "/";
  if (!show) return null;
  return (
    <div className="overlay">
      <div className="panel">
        <object data={`${base}loader.svg`} type="image/svg+xml" width="160" height="160" aria-label="loading" />
        <div style={{ marginTop: 8, color: "#9fb0cc" }}>Loading…</div>
      </div>
    </div>
  );
}
