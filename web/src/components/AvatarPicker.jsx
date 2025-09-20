import React, { useRef } from "react";

export default function AvatarPicker({ open, base = "/", onClose, onSelect }) {
  if (!open) return null;

  // Preset avatar file names (placed in web/public/avatars)
  const presets = Array.from({ length: 10 }, (_, i) => `${base}avatars/avatar-${i+1}.svg`);

  const fileRef = useRef(null);

  function pickFile() { fileRef.current?.click(); }
  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { onSelect?.(reader.result); onClose?.(); };
    reader.readAsDataURL(f);
  }
  function removeAvatar() { onSelect?.(null); onClose?.(); }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel picker" onClick={(e)=>e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Choose an avatar</h3>
        <div className="picker-grid">
          {presets.map((src, idx) => (
            <button key={idx} className="picker-cell" onClick={() => { onSelect?.(src); onClose?.(); }}>
              <img src={src} alt="" onError={(e)=>{ e.currentTarget.style.visibility="hidden"; e.currentTarget.parentElement.classList.add("broken"); }}/>
            </button>
          ))}
        </div>
        <div className="picker-actions">
          <button className="btn" onClick={pickFile}>Upload photo</button>
          <button className="btn ghost" onClick={removeAvatar}>Remove avatar</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
        <div style={{ color:"#9fb0cc", fontSize:12, marginTop:8 }}>
          You can replace the presets by uploading your own images into web/public/avatars.
        </div>
      </div>
    </div>
  );
}
