import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Search as SearchIcon,
  Clapperboard as ClapperIcon,
  UtensilsCrossed as FoodIcon,
  MessagesSquare as ChatIcon,
  Ticket as TicketIcon,
  Gamepad2 as GameIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  LogIn as LoginIcon
} from "lucide-react";
import api from "../utils/api";

const Item = ({ to, icon: IconComp, label, badge }) => (
  <NavLink className="item" to={to}>
    <span className="icon-wrap">
      <IconComp size={20} strokeWidth={2} />
      {badge > 0 && <span className="badge">{badge > 9 ? "9+" : badge}</span>}
    </span>
    <span className="label">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const base = import.meta.env.BASE_URL || "/";
  const active = JSON.parse(localStorage.getItem("activeProfile") || "null");
  const index = Number(localStorage.getItem("activeProfileIndex") || ""); // 1..4
  const activeLabel = index ? `Profile ${index}` : (active?.name ? active.name : "Profile");
  const [unread, setUnread] = useState(0);

  // Notifications count
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
      } catch {}
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
        <NavLink className="item" to="/profiles">
          <span className="icon-wrap"><div className="avatar-mini">{(active?.name?.[0] || 'P').toUpperCase()}</div></span>
          <span className="label">
            <span className="label-inline">
              {/* Logo beside "Profile" text */}
              <img
                src={`${base}logo.svg`}
                alt=""
                className="inline-logo"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `${base}logo.jpg`; }}
              />
              {activeLabel}
            </span>
          </span>
        </NavLink>

        <Item to="/search" icon={SearchIcon} label="Search" />
        <Item to="/stream" icon={ClapperIcon} label="Stream" />
        <Item to="/order" icon={FoodIcon} label="Order" />
        <Item to="/friends" icon={ChatIcon} label="Friends" />
        <Item to="/tickets" icon={TicketIcon} label="Tickets" />
        <Item to="/playzone" icon={GameIcon} label="Playzone" />
      </nav>

      <nav className="sidebar-bottom nav">
        <Item to="/notifications" icon={BellIcon} label="Notifications" badge={unread} />
        <Item to="/settings" icon={SettingsIcon} label="Settings" />
        <Item to="/login" icon={LoginIcon} label="Login" />
      </nav>
    </aside>
  );
}
