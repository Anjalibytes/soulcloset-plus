import React, { useState, useEffect } from "react";
import { Sun, CloudRain, Droplet, Wind, Sparkle, Loader2 } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import { GlobalStyle } from "./Closet.jsx";
import { api, MOODS } from "../lib/shared.js";

const WEATHERS = [
  { key: "sunny", label: "Sunny", icon: Sun },
  { key: "rainy", label: "Rainy", icon: CloudRain },
  { key: "cold", label: "Cold", icon: Droplet },
  { key: "windy", label: "Windy", icon: Wind },
];

export default function MoodMirror({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [mood, setMood] = useState(null);
  const [weather, setWeather] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [itemId, setItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.getItems().then(setItems); }, []);

  async function generate() {
    if (!mood) { setError("Pick a mood first."); return; }
    if (items.length === 0) { setError("Add a few closet pieces first — go to My Closet."); return; }
    setLoading(true); setError("");
    try {
      const { itemId: id, text, error: err } = await api.aiMood(mood, weather, items);
      if (err) throw new Error(err);
      setItemId(items.find((i) => i.id === id) ? id : null);
      setSuggestion(text);
    } catch {
      setError("Couldn't reach the styling AI just now. Check the server's ANTHROPIC_API_KEY.");
    }
    setLoading(false);
  }

  const theme = mood ? MOODS.find((m) => m.key === mood) : null;

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }}>
      <GlobalStyle />
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-5 md:px-10 py-8 max-w-5xl mx-auto">
        <h2 className="fraunces text-3xl mb-1">Mood Mirror</h2>
        <p className="text-sm opacity-70 mb-6">Tell it how you feel. It reaches into your actual closet.</p>

        <div className="mb-5">
          <div className="mono text-xs opacity-60 mb-2">HOW ARE YOU FEELING</div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button key={m.key} onClick={() => setMood(m.key)} className="px-4 py-2 rounded-full text-sm border"
                style={{ background: mood === m.key ? m.color : "transparent", borderColor: m.color, color: mood === m.key ? m.ink : "#33232E" }}>{m.label}</button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="mono text-xs opacity-60 mb-2">WEATHER (OPTIONAL)</div>
          <div className="flex flex-wrap gap-2">
            {WEATHERS.map((w) => (
              <button key={w.key} onClick={() => setWeather(weather === w.key ? null : w.key)} className="px-3 py-2 rounded-full text-sm border flex items-center gap-1.5"
                style={{ background: weather === w.key ? "#33232E" : "transparent", color: weather === w.key ? "#F6EFE4" : "#33232E", borderColor: "#33232E" }}>
                <w.icon size={14} /> {w.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm mb-6" style={{ background: "#33232E", color: "#F6EFE4" }}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkle size={16} />}
          {loading ? "Reading the room…" : "Show me an outfit"}
        </button>

        {error && <p className="text-sm mb-4" style={{ color: "#A94442" }}>{error}</p>}

        {suggestion && (
          <div className="rounded-lg p-6 md:p-8" style={{ background: theme ? theme.color : "#EFE6D6", color: theme ? theme.ink : "#33232E", boxShadow: "0 8px 30px rgba(51,35,46,0.15)" }}>
            <div className="flex gap-6 flex-col md:flex-row">
              {itemId && items.find((i) => i.id === itemId) && (
                <div className="polaroid shrink-0 self-start" style={{ transform: "rotate(-3deg)", width: 140 }}>
                  <img src={items.find((i) => i.id === itemId).image} alt="" className="w-full h-28 object-cover rounded-sm" />
                  <div className="mono text-[10px] text-center mt-2 opacity-70">{items.find((i) => i.id === itemId).type}</div>
                </div>
              )}
              <div>
                <div className="mono text-xs opacity-70 mb-2">TODAY'S PAGE</div>
                <p className="fraunces text-xl leading-relaxed" style={{ fontStyle: "italic" }}>{suggestion}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
