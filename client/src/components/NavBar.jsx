import React from "react";
import { NavLink } from "react-router-dom";
import { Shirt, Sparkles, BookOpen, ArrowLeftRight, LogOut, MessageCircle } from "lucide-react";

export default function NavBar({ user, onLogout }) {
  const tabs = [
    { to: "/closet", label: "My Closet", icon: Shirt },
    { to: "/mood", label: "Mood Mirror", icon: Sparkles },
    { to: "/profile", label: "Aesthetic Profile", icon: BookOpen },
    { to: "/swap", label: "AuraSwap", icon: ArrowLeftRight },
    { to: "/messages", label: "Messages", icon: MessageCircle },
  ];
  return (
    <div>
      <header style={{ borderBottom: "1px solid #E4D8C4" }} className="px-5 md:px-10 py-5 flex items-center justify-between sticky top-0 z-20 bg-[#F6EFE4]/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Shirt size={22} color="#C4707A" />
          <h1 className="fraunces text-2xl" style={{ fontStyle: "italic" }}>SoulCloset<span style={{ color: "#C4707A" }}>+</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="mono text-xs opacity-60 hidden sm:block">{user?.name}</div>
          <button onClick={onLogout} className="opacity-50 hover:opacity-90" title="Log out"><LogOut size={16} /></button>
        </div>
      </header>
      <nav className="px-5 md:px-10 pt-5 flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) =>
            `tab-btn mono text-xs px-4 py-2 rounded-full flex items-center gap-2 border ${isActive ? "" : ""}`
          } style={({ isActive }) => ({
            background: isActive ? "#33232E" : "transparent",
            color: isActive ? "#F6EFE4" : "#33232E",
            borderColor: "#33232E",
          })}>
            <t.icon size={14} /> {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
