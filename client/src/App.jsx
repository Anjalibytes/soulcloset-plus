import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./lib/useAuth.js";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Closet from "./pages/Closet.jsx";
import MoodMirror from "./pages/MoodMirror.jsx";
import Profile from "./pages/Profile.jsx";
import Swap from "./pages/Swap.jsx";
import Messages from "./pages/Messages.jsx";
import Chat from "./pages/Chat.jsx";

export default function App() {
  const { user, signup, login, logout, error } = useAuth();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,500&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/closet" /> : <Landing />} />
      <Route path="/signup" element={user ? <Navigate to="/closet" /> : <Signup onSignup={signup} authError={error} />} />
      <Route path="/login" element={user ? <Navigate to="/closet" /> : <Login onLogin={login} authError={error} />} />
      <Route path="/closet" element={<Protected user={user}><Closet user={user} onLogout={logout} /></Protected>} />
      <Route path="/mood" element={<Protected user={user}><MoodMirror user={user} onLogout={logout} /></Protected>} />
      <Route path="/profile" element={<Protected user={user}><Profile user={user} onLogout={logout} /></Protected>} />
      <Route path="/swap" element={<Protected user={user}><Swap user={user} onLogout={logout} /></Protected>} />
      <Route path="/messages" element={<Protected user={user}><Messages user={user} onLogout={logout} /></Protected>} />
      <Route path="/messages/:listingId/:otherUser" element={<Protected user={user}><Chat user={user} onLogout={logout} /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function Protected({ user, children }) {
  if (!user) return <Navigate to="/signup" />;
  return children;
}
