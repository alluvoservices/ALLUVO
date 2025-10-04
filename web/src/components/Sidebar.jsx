import React from "react";
import { NavLink } from "react-router-dom";
import { Search, Clapperboard, UtensilsCrossed, Ticket, Gamepad2, Bell, Settings, User } from "lucide-react";

const S = ({ to, icon: Icon, label }) => (
  <NavLink to={to} className="sb-item" title={label}><Icon size={20} /></NavLink>
);

export default function Sidebar() {
  const base = import.meta.env.BASE_URL || "/";
  const active = JSON.parse(localStorage.getItem("alluvo_activeProfile") || "null");
  const initial = (active?.name?.[0] || "P").toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src={`${base}logo.svg`} width="22" height="22" alt="ALLUVO"
          onError={e=>{e.currentTarget.onerror=null; e.currentTarget.src=`${base}logo-fallback.svg`;}} />
      </div>
      <S to="/profiles" icon={User} label="Profile" />
      <S to="/search" icon={Search} label="Search" />
      <S to="/stream" icon={Clapperboard} label="Stream" />
      <S to="/order" icon={UtensilsCrossed} label="Order" />
      <S to="/tickets" icon={Ticket} label="Tickets" />
      <S to="/playzone" icon={Gamepad2} label="Playzone" />
      <div style={{ marginTop: "auto", width: "100%" }}>
        <S to="/notifications" icon={Bell} label="Notifications" />
        <S to="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}
