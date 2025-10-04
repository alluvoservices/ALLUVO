import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Bell } from "lucide-react";

export default function TopBar() {
  const base = import.meta.env.BASE_URL || "/";
  const navigate = useNavigate();
  const active = JSON.parse(localStorage.getItem("alluvo_activeProfile") || "null");
  const initials = (active?.name?.[0] || "P").toUpperCase();

  return (
    <div className="topbar">
      <button className="tb-slot" aria-label="Open profiles" onClick={() => navigate("/profiles")}>
        {active?.avatar
          ? <span className="avatar-mini img" style={{ backgroundImage: `url(${active.avatar})` }} />
          : <div className="avatar-mini">{initials}</div>}
      </button>

      <div className="tb-brand">
        <img src={`${base}logo.svg`} alt="ALLUVO"
          onError={e=>{e.currentTarget.onerror=null; e.currentTarget.src=`${base}logo-fallback.svg`;}} />
        <span>ALLUVO</span>
      </div>

      <NavLink to="/notifications" className="tb-slot" aria-label="Notifications">
        <Bell size={20} />
      </NavLink>
    </div>
  );
}
