import React, { useEffect, useState, useSyncExternalStore } from "react";
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

// Subscribe to changes in auth state (token) across tabs and in the same tab
function useAuthed() {
  const get = () => !!localStorage.getItem("token");
  function subscribe(listener) {
    const h = () => listener();
    window.addEventListener("storage", h);
    window.addEventListener("auth-changed", h);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("auth-changed", h);
    };
  }
  return useSyncExternalStore(subscribe, get, get);
}

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
  const authed = useAuthed();

  // Read profile fresh on every render so it reflects login/logout immediately
  const active = JSON.parse(localStorage.getItem("activeProfile") || "null");
  const initials = (active?.name?.[0] || "P").toUpperCase();

  // Notifications only when authed
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!authed) return;
    const token = localStorage.getItem("token");
    const load = async () => {
      try {
        const { data } = await api.get("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
        setUnread((data.items || []).filter(x => !x.read).length);
      } catch {}
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [authed]);

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
          <span className="icon-wrap">
            {active?.avatar
              ? <span className="avatar-mini img" style={{ backgroundImage: `url(${active.avatar})` }} />
              : <div className="avatar-mini">{initials}</div>}
          </span>
          <span className="label">Profile</span>
        </NavLink>
        <Item to="/search" icon={SearchIcon} label="Search" />
        <Item to="/stream" icon={ClapperIcon} label="Stream" />
        <Item to="/order" icon={FoodIcon} label="Order" />
        <Item to="/friends" icon={ChatIcon} label="Friends" />
        <Item to="/tickets" icon={TicketIcon} label="Tickets" />
        <Item to="/playzone" icon={GameIcon} label="Playzone" />
      </nav>

      <nav className="sidebar-bottom nav">
        {authed && <Item to="/notifications" icon={BellIcon} label="Notifications" badge={unread} />}
        <Item to="/settings" icon={SettingsIcon} label="Settings" />
        {!authed && <Item to="/login" icon={LoginIcon} label="Login" />}
      </nav>
    </aside>
  );
}
