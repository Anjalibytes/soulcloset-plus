import React, { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import { GlobalStyle } from "./Closet.jsx";
import { api } from "../lib/shared.js";

export default function Profile({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.getItems().then(setItems); }, []);

  async function generate() {
    if (items.length === 0) { setError("Add a few pieces to your closet first."); return; }
    setLoading(true); setError("");
    try {
      const { text, error: err } = await api.aiProfile(items);
      if (err) throw new Error(err);
      setProfile(text);
    } catch {
      setError("Couldn't reach the styling AI just now. Check the server's ANTHROPIC_API_KEY.");
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }}>
      <GlobalStyle />
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-5 md:px-10 py-8 max-w-5xl mx-auto">
        <h2 className="fraunces text-3xl mb-1">Aesthetic Style Profile</h2>
        <p className="text-sm opacity-70 mb-6">A read on your vibe, built from what's actually in your closet.</p>
        <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm mb-6" style={{ background: "#33232E", color: "#F6EFE4" }}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {loading ? "Reading your closet…" : profile ? "Refresh my profile" : "Build my profile"}
        </button>
        {error && <p className="text-sm mb-4" style={{ color: "#A94442" }}>{error}</p>}
        {profile && (
          <div className="rounded-lg p-6 md:p-8" style={{ background: "#FFFDF9", border: "1px solid #E4D8C4" }}>
            <p className="fraunces text-lg leading-relaxed whitespace-pre-line">{profile}</p>
          </div>
        )}
      </main>
    </div>
  );
}
