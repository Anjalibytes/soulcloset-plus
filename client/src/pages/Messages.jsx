import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import { GlobalStyle } from "./Closet.jsx";
import { api } from "../lib/shared.js";

export default function Messages({ user, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getConversations(user.name).then(setConversations).finally(() => setLoading(false));
  }, [user.name]);

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }}>
      <GlobalStyle />
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-5 md:px-10 py-8 max-w-2xl mx-auto">
        <h2 className="fraunces text-3xl mb-1">Messages</h2>
        <p className="text-sm opacity-70 mb-6">Your AuraSwap conversations.</p>

        {loading ? (
          <p className="text-sm opacity-50">Loading…</p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: "#FFFDF9", border: "1px dashed #C9BBA0" }}>
            <MessageCircle size={22} className="mx-auto mb-2 opacity-40" />
            <p className="fraunces text-xl mb-2" style={{ fontStyle: "italic" }}>No conversations yet.</p>
            <p className="text-sm opacity-60 max-w-sm mx-auto">Propose a swap on AuraSwap to start chatting.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <button key={c.convoId} onClick={() => navigate(`/messages/${c.listingId}/${encodeURIComponent(c.otherUser)}`)}
                className="w-full text-left p-4 rounded-lg flex items-center justify-between" style={{ background: "#FFFDF9", border: "1px solid #E4D8C4" }}>
                <div>
                  <div className="text-sm font-medium">{c.otherUser}</div>
                  <div className="text-xs opacity-50">{c.listingName}</div>
                  <div className="text-xs opacity-70 mt-1 truncate max-w-xs">{c.lastMessage}</div>
                </div>
                <div className="text-[10px] opacity-40">{new Date(c.lastAt).toLocaleDateString()}</div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
