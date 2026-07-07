import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import { GlobalStyle } from "./Closet.jsx";
import { api } from "../lib/shared.js";

export default function Chat({ user, onLogout }) {
  const { listingId, otherUser } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const load = useCallback(() => {
    api.getMessages(listingId, user.name, otherUser).then(setMessages).finally(() => setLoading(false));
  }, [listingId, user.name, otherUser]);

  // load once, then poll every 3s so a chat feels close to real-time without needing websockets
  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    const listingName = messages[0]?.listingName || "this piece";
    const sent = await api.sendMessage({ listingId, listingName, from: user.name, to: otherUser, text });
    setMessages((prev) => [...prev, sent]);
  }

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }}>
      <GlobalStyle />
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-5 md:px-10 py-8 max-w-2xl mx-auto">
        <button onClick={() => navigate("/messages")} className="flex items-center gap-1 text-sm opacity-60 mb-4">
          <ArrowLeft size={14} /> Back to messages
        </button>
        <h2 className="fraunces text-2xl mb-1" style={{ fontStyle: "italic" }}>Chat with {otherUser}</h2>
        <p className="text-xs opacity-50 mb-6">about {messages[0]?.listingName || "a swap listing"}</p>

        <div className="rounded-lg p-4 mb-4 flex flex-col gap-2 overflow-y-auto" style={{ background: "#FFFDF9", border: "1px solid #E4D8C4", height: "50vh" }}>
          {loading ? (
            <p className="text-sm opacity-50 text-center mt-10">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm opacity-50 text-center mt-10">Say hi — start the conversation about this swap.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${m.from === user.name ? "self-end" : "self-start"}`}
                style={{ background: m.from === user.name ? "#C4707A" : "#EFE6D6", color: m.from === user.name ? "#FFFDF9" : "#33232E" }}>
                {m.text}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="flex-1 text-sm p-2.5 rounded-full border" style={{ borderColor: "#C9BBA0" }} />
          <button type="submit" className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#33232E", color: "#F6EFE4" }}>
            <Send size={16} />
          </button>
        </form>
      </main>
    </div>
  );
}
