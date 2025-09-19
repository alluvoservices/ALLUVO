import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircle2, Search, Clapperboard, UtensilsCrossed,
  MessagesSquare, Ticket, Gamepad2, Bell, Settings, LogIn
} from "lucide-react";
import api from "../utils/api";

const Item = ({ to, icon: IconComp, label, badge }) => (
  <NavLink className="item" to={to}>
    <span className="icon-wrap">
      {typeof IconComp === "function" ? <IconComp size={20} strokeWidth={2} /> : IconComp}
      {badge > 0 && <span className="badge">{badge > 9 ? "9+" : badge}</span>}
    </span>
    <span className="label">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const base = import.meta.env.BASE_URL || "/";
  const active = JSON.parse(localStorage.getItem("activeProfile") || "null");
  const initial = (active?.name?.[0] || "P").toUpperCase();

  const [unread, setUnread] = useState(0);

  // Fetch unread notification count (once on mount + every 60s)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const load = async () => {
      try {
        const { data } = await api.get("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const n = (data.items || []).filter(x => !x.read).length;
        setUnread(n);
      } catch (e) {
        // ignore
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

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
        <Item to="/notifications" icon={Bell} label="Notifications" badge={unread} />
        <Item to="/settings" icon={Settings} label="Settings" />
        <Item to="/login" icon={LogIn} label="Login" />
      </div>
    </aside>
  );
}
