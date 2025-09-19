import React from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircle2, Search, Clapperboard, UtensilsCrossed,
  MessagesSquare, Ticket, Gamepad2, Bell, Settings, LogIn
} from "lucide-react";

const Item = ({ to, icon: IconComp, label }) => (
  <NavLink className="item" to={to}>
    <span className="icon-wrap"><IconComp size={20} strokeWidth={2} /></span>
    <span className="label">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const base = import.meta.env.BASE_URL || "/";
  const active = JSON.parse(localStorage.getItem("activeProfile") || "null");
  const initial = (active?.name?.[0] || "P").toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src={`${base}logo.svg`}
          alt="ALLUVO"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `${base}logo.jpg`; }}
        />
        <div className="name">ALLUVO</div>
      </div>
      <nav className="nav">
        <Item to="/profiles" icon={() => <div className="avatar-mini">{initial}</div>} label="Profile" />
        <Item to="/search" icon={Search} label="Search" />
        <Item to="/stream" icon={Clapperboard} label="Stream" />
        <Item to="/order" icon={UtensilsCrossed} label="Order" />
        <Item to="/friends" icon={MessagesSquare} label="Friends" />
        <Item to="/tickets" icon={Ticket} label="Tickets" />
        <Item to="/playzone" icon={Gamepad2} label="Playzone" />
      </nav>
      <div className="sidebar-bottom">
        <Item to="/notifications" icon={Bell} label="Notifications" />
        <Item to="/settings" icon={Settings} label="Settings" />
        <Item to="/login" icon={LogIn} label="Login" />
      </div>
    </aside>
  );
}
