import React from "react";
import { NavLink } from "react-router-dom";
import { Search, Clapperboard, UtensilsCrossed, Ticket, Gamepad2 } from "lucide-react";

const B = ({ to, icon: Icon, label }) => (
  <NavLink to={to} className={({isActive}) => "bn-item" + (isActive ? " active" : "")}>
    <Icon size={20} />
    <span className="mnav-label">{label}</span>
  </NavLink>
);

export default function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom">
      <B to="/search" icon={Search} label="Search" />
      <B to="/stream" icon={Clapperboard} label="Stream" />
      <B to="/order" icon={UtensilsCrossed} label="Order" />
      <B to="/tickets" icon={Ticket} label="Tickets" />
      <B to="/playzone" icon={Gamepad2} label="Play" />
    </nav>
  );
}
