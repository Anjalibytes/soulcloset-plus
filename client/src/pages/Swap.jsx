import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Repeat2, Loader2 } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import { GlobalStyle } from "./Closet.jsx";
import { api, AESTHETICS } from "../lib/shared.js";

export default function Swap({ user, onLogout }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const refresh = useCallback(() => {
    setLoading(true);
    api.getSwap().then((d) => setListings(d.reverse())).finally(() => setLoading(false));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function startChat(listing) {
    if (listing.owner === user.name) return; // can't message yourself
    // send an opening message so the conversation exists, then go straight to the thread
    await api.sendMessage({
      listingId: listing.id,
      listingName: listing.name,
      from: user.name,
      to: listing.owner,
      text: `Hi! I'm interested in swapping for your ${listing.name}.`,
    });
    navigate(`/messages/${listing.id}/${encodeURIComponent(listing.owner)}`);
  }

  const filtered = listings.filter((s) => filter === "All" || s.aesthetic === filter);

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }}>
      <GlobalStyle />
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-5 md:px-10 py-8 max-w-5xl mx-auto">
        <h2 className="fraunces text-3xl mb-1">AuraSwap</h2>
        <p className="text-sm opacity-70 mb-2">No price tags — just vibe-matched trading.</p>
        <p className="text-xs opacity-50 mb-6">Listings are shared with anyone hitting this same backend. Proposing a swap just confirms interest for now.</p>

        <div className="flex gap-2 flex-wrap mb-6">
          {["All", ...AESTHETICS].map((a) => (
            <button key={a} onClick={() => setFilter(a)} className="mono text-[11px] px-3 py-1.5 rounded-full border"
              style={{ background: filter === a ? "#7F8F6B" : "transparent", color: filter === a ? "#FFFDF9" : "#33232E", borderColor: "#7F8F6B" }}>{a}</button>
          ))}
        </div>

        {loading ? (
          <div className="opacity-60 text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading the swap pool…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: "#FFFDF9", border: "1px dashed #C9BBA0" }}>
            <p className="fraunces text-xl mb-2" style={{ fontStyle: "italic" }}>No listings here yet.</p>
            <p className="text-sm opacity-60 max-w-sm mx-auto">List a piece from My Closet to start the pool.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filtered.map((s) => (
              <div key={s.id} className="polaroid">
                <img src={s.image} alt="" className="w-full h-28 object-cover rounded-sm" />
                <div className="mono text-[10px] mt-2">{s.name}</div>
                <div className="text-[10px] opacity-60 mb-2">{s.aesthetic || "unaesthetic"} · {s.owner}</div>
                <button onClick={() => startChat(s)} className="w-full text-[11px] py-1.5 rounded-full flex items-center justify-center gap-1" style={{ background: "#33232E", color: "#F6EFE4" }}>
                  <Repeat2 size={12} /> {s.owner === user.name ? "This is yours" : "Propose swap"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
