import React from "react";
import { NavLink } from "react-router-dom";
import {
  Search as SearchIcon,
  Clapperboard as ClapperIcon,
  UtensilsCrossed as FoodIcon,
  Ticket as TicketIcon,
  Gamepad2 as GameIcon
} from "lucide-react";

const Item = ({ to, icon: Icon, label }) => (
  <NavLink to={to} className={({isActive}) => "mnav-item" + (isActive ? " active" : "")}>
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

export default function MobileNav() {
  return (
    <nav className="mobile-nav mobile-only" role="navigation" aria-label="Bottom navigation">
      <Item to="/search" icon={SearchIcon} label="Search" />
      <Item to="/stream" icon={ClapperIcon} label="Stream" />
      <Item to="/order" icon={FoodIcon} label="Order" />
      <Item to="/tickets" icon={TicketIcon} label="Tickets" />
      <Item to="/playzone" icon={GameIcon} label="Play" />
    </nav>
  );
}
