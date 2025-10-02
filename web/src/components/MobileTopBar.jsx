import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Bell } from "lucide-react";

export default function MobileTopBar() {
  const base = import.meta.env.BASE_URL || "/";
  const navigate = useNavigate();
  const active = JSON.parse(localStorage.getItem("activeProfile") || "null");
  const initials = (active?.name?.[0] || "P").toUpperCase();

  return (
    <div className="mobile-topbar mobile-only" role="navigation" aria-label="Top bar">
      {/* Left slot */}
      <button aria-label="Open profiles" className="mtb-slot mtb-left" onClick={() => navigate("/profiles")}>
        {active?.avatar
          ? <span className="avatar-mini img" style={{ backgroundImage: `url(${active.avatar})` }} />
          : <div className="avatar-mini">{initials}</div>}
      </button>

      {/* Center brand */}
      <div className="mtb-brand">
        <img
          src={`${base}logo.svg`}
          alt="ALLUVO"
          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=`${base}logo.jpg`; }}
        />
        <span>ALLUVO</span>
      </div>

      {/* Right slot */}
      <NavLink aria-label="Notifications" to="/notifications" className="mtb-slot mtb-right">
        <Bell size={20}/>
      </NavLink>
    </div>
  );
}
