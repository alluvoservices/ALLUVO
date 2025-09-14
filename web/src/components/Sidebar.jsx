import React from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, icon, label }) => (
  <NavLink className="item" to={to}>
    <span style={{ width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
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
        <img src={`${base}logo.jpg`} alt="logo" />
        <div className="name">ALLUVO</div>
      </div>
      <nav className="nav">
        <Item to="/profiles" icon={<span className="avatar-mini">{initial}</span>} label="Profile" />
        <Item to="/search" icon={"🔎"} label="Search" />
        <Item to="/stream" icon={"🎬"} label="Stream" />
        <Item to="/order" icon={"🍱"} label="Order" />
        <Item to="/friends" icon={"💬"} label="Friends" />
        <Item to="/tickets" icon={"🎟️"} label="Tickets" />
        <Item to="/playzone" icon={"🕹️"} label="Playzone" />
      </nav>
      <div className="sidebar-bottom">
        <Item to="/notifications" icon={"🔔"} label="Notifications" />
        <Item to="/settings" icon={"⚙️"} label="Settings" />
        <Item to="/login" icon={"🔐"} label="Login" />
      </div>
    </aside>
  );
}
