import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Profiles from "./pages/Profiles.jsx";
import Search from "./pages/Search.jsx";
import Settings from "./pages/Settings.jsx";
import Notifications from "./pages/Notifications.jsx";
import Stream from "./pages/Stream.jsx";
import Order from "./pages/Order.jsx";
import Tickets from "./pages/Tickets.jsx";
import Playzone from "./pages/Playzone.jsx";

export default function App() {
  // ensure mobile spacing (no JS UA hacks — pure CSS with safe-area)
  return (
    <div className="app">
      <Sidebar />
      <TopBar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/profiles" replace />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/stream" element={<Stream />} />
          <Route path="/order" element={<Order />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/playzone" element={<Playzone />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
