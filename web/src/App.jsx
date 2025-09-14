import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Profiles from "./pages/Profiles.jsx";
import Search from "./pages/Search.jsx";
import Stream from "./pages/Stream.jsx";
import StreamDetail from "./pages/StreamDetail.jsx";
import Order from "./pages/Order.jsx";
import Friends from "./pages/Friends.jsx";
import Tickets from "./pages/Tickets.jsx";
import Playzone from "./pages/Playzone.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import LoaderOverlay from "./components/LoaderOverlay.jsx";
import OpeningVideo from "./components/OpeningVideo.jsx";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");
    if (seen) setShowIntro(false);
  }, []);
  function onIntroEnd() {
    sessionStorage.setItem("intro-seen", "1");
    setShowIntro(false);
  }

  return (
    <div className="app">
      {showIntro && <OpeningVideo onEnd={onIntroEnd} />}
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Profiles />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/search" element={<Search setGlobalLoading={setLoading} />} />
          <Route path="/stream" element={<Stream setGlobalLoading={setLoading} />} />
          <Route path="/stream/:id" element={<StreamDetail setGlobalLoading={setLoading} />} />
          <Route path="/order" element={<Order setGlobalLoading={setLoading} />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/playzone" element={<Playzone />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login setGlobalLoading={setLoading} />} />
        </Routes>
      </main>
      <LoaderOverlay show={loading} />
    </div>
  );
}
