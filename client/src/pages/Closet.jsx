import React, { useState, useEffect } from "react";
import { Plus, X, Heart, ArrowLeftRight, PenLine, Upload, Loader2, Star, Sparkles } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import { api, fileToCompressedDataUrl, CLOTHING_TYPES, FABRICS, CONDITIONS, AESTHETICS } from "../lib/shared.js";

export default function Closet({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => { api.getItems().then(setItems).finally(() => setLoading(false)); }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2400); }

  async function addItem(newItem) {
    const saved = await api.addItem(newItem);
    setItems((prev) => [saved, ...prev]);
  }
  async function updateItem(id, patch) {
    const saved = await api.updateItem(id, patch);
    setItems((prev) => prev.map((i) => (i.id === id ? saved : i)));
  }
  async function removeItem(id) {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  async function listForSwap(item) {
    try {
      await api.listSwap({ itemId: item.id, name: item.type, image: item.image, aesthetic: item.aesthetic, condition: item.condition, owner: user?.name || "Someone" });
      showToast("Listed on AuraSwap ✓");
    } catch { showToast("Couldn't list right now"); }
  }

  const rarelyWorn = items.filter((i) => (i.wearCount || 0) === 0);
  const visibleItems = favoritesOnly ? items.filter((i) => i.favorite) : items;

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }}>
      <GlobalStyle />
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-5 md:px-10 py-8 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="fraunces text-3xl mb-1">Your wardrobe, kept gently.</h2>
            <p className="text-sm opacity-70">{items.length} piece{items.length !== 1 ? "s" : ""} logged{rarelyWorn.length > 0 ? ` · ${rarelyWorn.length} haven't been worn yet` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFavoritesOnly((v) => !v)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
              style={{ background: favoritesOnly ? "#33232E" : "transparent", color: favoritesOnly ? "#F6EFE4" : "#33232E", borderColor: "#33232E" }}>
              <Star size={14} fill={favoritesOnly ? "#F6EFE4" : "none"} /> Favorites
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ background: "#C4707A", color: "#FFFDF9" }}>
              <Plus size={16} /> Add a piece
            </button>
          </div>
        </div>

        {loading ? (
          <div className="opacity-60 text-sm flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Opening your closet…</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: "#FFFDF9", border: "1px dashed #C9BBA0" }}>
            <p className="fraunces text-xl mb-2" style={{ fontStyle: "italic" }}>{favoritesOnly ? "No favorites marked yet." : "Nothing hung up yet."}</p>
            <p className="text-sm opacity-60 max-w-sm mx-auto mb-5">{favoritesOnly ? "Tap the star on a piece to save it here." : "Add your first piece and this starts feeling like your closet."}</p>
            {!favoritesOnly && <button onClick={() => setShowAdd(true)} className="px-5 py-2 rounded-full text-sm" style={{ background: "#C4707A", color: "#FFFDF9" }}>Add your first piece</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {visibleItems.map((item, idx) => (
              <ClosetCard key={item.id} item={item} rotate={idx % 2 === 0 ? -2 : 2}
                onWear={() => updateItem(item.id, { wearCount: (item.wearCount || 0) + 1 })}
                onNote={(memory) => updateItem(item.id, { memory })}
                onFavorite={() => updateItem(item.id, { favorite: !item.favorite })}
                onRemove={() => removeItem(item.id)}
                onList={() => listForSwap(item)} />
            ))}
          </div>
        )}
      </main>
      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdd={(item) => { addItem(item); setShowAdd(false); }} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm z-30" style={{ background: "#33232E", color: "#F6EFE4" }}>{toast}</div>}
    </div>
  );
}

function ClosetCard({ item, rotate, onWear, onNote, onRemove, onList, onFavorite }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(item.memory || "");
  const [upcycleText, setUpcycleText] = useState("");
  const [upcycleLoading, setUpcycleLoading] = useState(false);

  async function getUpcycleIdea() {
    setUpcycleLoading(true);
    try {
      const { text, error } = await api.aiUpcycle(item);
      setUpcycleText(error ? "Couldn't reach the AI right now." : text);
    } catch {
      setUpcycleText("Couldn't reach the AI right now.");
    }
    setUpcycleLoading(false);
  }

  return (
    <div className="polaroid relative" style={{ transform: `rotate(${rotate}deg)` }}>
      <button onClick={onRemove} className="absolute top-1 right-1 opacity-40 hover:opacity-80"><X size={14} /></button>
      <button onClick={onFavorite} className="absolute top-1 left-1" style={{ color: item.favorite ? "#E1A24A" : "#33232E", opacity: item.favorite ? 1 : 0.35 }}>
        <Star size={16} fill={item.favorite ? "#E1A24A" : "none"} />
      </button>
      <img src={item.image} alt={item.type} className="w-full h-32 object-cover rounded-sm mb-2" />
      <div className="mono text-[10px] leading-tight">{item.type}</div>
      <div className="text-[10px] opacity-60 mb-2">{item.fabric} · {item.condition}{item.aesthetic ? ` · ${item.aesthetic}` : ""}</div>
      <div className="flex items-center gap-1 mb-1 flex-wrap">
        <button onClick={onWear} className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "#EFE6D6" }}><Heart size={10} /> Worn {item.wearCount || 0}×</button>
        <button onClick={onList} className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "#EFE6D6" }}><ArrowLeftRight size={10} /> List</button>
        <button onClick={() => setNoteOpen((v) => !v)} className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "#EFE6D6" }}><PenLine size={10} /> Memory</button>
        <button onClick={getUpcycleIdea} disabled={upcycleLoading} className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "#EFE6D6" }}>
          {upcycleLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Upcycle idea
        </button>
      </div>
      {upcycleText && <p className="text-[10px] italic opacity-80 mt-1 mb-1" style={{ color: "#7F8F6B" }}>🌱 {upcycleText}</p>}
      {item.memory && !noteOpen && <p className="text-[10px] italic opacity-70 mt-1">"{item.memory}"</p>}
      {noteOpen && (
        <div className="mt-1">
          <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Wore this on…" className="w-full text-[11px] p-1.5 rounded border" rows={2} style={{ borderColor: "#C9BBA0" }} />
          <button onClick={() => { onNote(noteDraft); setNoteOpen(false); }} className="text-[10px] mt-1 px-2 py-1 rounded-full" style={{ background: "#33232E", color: "#F6EFE4" }}>Save</button>
        </div>
      )}
    </div>
  );
}

function AddItemModal({ onClose, onAdd }) {
  const [preview, setPreview] = useState(null);
  const [avgColor, setAvgColor] = useState(null);
  const [type, setType] = useState(CLOTHING_TYPES[0]);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [aesthetic, setAesthetic] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiTagged, setAiTagged] = useState(false);
  const [aiError, setAiError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setAiError("");
    try {
      const { dataUrl, avgColor } = await fileToCompressedDataUrl(file);
      setPreview(dataUrl); setAvgColor(avgColor);
      // ask the AI to guess the tags from the actual photo
      const guess = await api.aiTagPhoto(dataUrl);
      if (guess.error) throw new Error(guess.error);
      if (guess.type && CLOTHING_TYPES.includes(guess.type)) setType(guess.type);
      if (guess.fabric && FABRICS.includes(guess.fabric)) setFabric(guess.fabric);
      if (guess.condition && CONDITIONS.includes(guess.condition)) setCondition(guess.condition);
      if (guess.aesthetic && AESTHETICS.includes(guess.aesthetic)) setAesthetic(guess.aesthetic);
      setAiTagged(true);
    } catch {
      setAiError("Couldn't auto-tag this photo — pick the details manually below.");
    }
    setBusy(false);
  }
  function submit() {
    if (!preview) return;
    onAdd({ image: preview, color: avgColor, avgColor, type, fabric, condition, aesthetic });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(51,35,46,0.45)" }}>
      <div className="rounded-lg p-6 w-full max-w-md" style={{ background: "#FFFDF9" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="fraunces text-xl" style={{ fontStyle: "italic" }}>New piece</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {!preview ? (
          <label className="w-full py-10 rounded-lg border-2 border-dashed flex flex-col items-center gap-2 text-sm opacity-70 cursor-pointer relative" style={{ borderColor: "#C9BBA0" }}>
            {busy ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {busy ? "AI is reading the fabric, type & color…" : "Upload a photo"}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute w-0 h-0 opacity-0" style={{ pointerEvents: "none" }} />
          </label>
        ) : (
          <div className="mb-3 flex gap-3 items-center">
            <img src={preview} alt="" className="w-20 h-20 object-cover rounded" />
            <div className="text-xs opacity-60">
              {busy ? <span className="flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> AI is tagging this…</span> : <>Detected tone: <span style={{ color: avgColor }}>●</span> {avgColor}</>}
            </div>
          </div>
        )}
        {aiTagged && <p className="text-xs mb-3" style={{ color: "#7F8F6B" }}>✓ AI guessed the tags below — feel free to adjust them.</p>}
        {aiError && <p className="text-xs mb-3" style={{ color: "#A94442" }}>{aiError}</p>}
        {preview && (
          <div className="space-y-3">
            <LabeledSelect label="Type" value={type} onChange={setType} options={CLOTHING_TYPES} />
            <LabeledSelect label="Fabric" value={fabric} onChange={setFabric} options={FABRICS} />
            <LabeledSelect label="Condition" value={condition} onChange={setCondition} options={CONDITIONS} />
            <LabeledSelect label="Aesthetic (optional)" value={aesthetic} onChange={setAesthetic} options={["", ...AESTHETICS]} />
            <button onClick={submit} disabled={busy} className="w-full py-2.5 rounded-full text-sm mt-2" style={{ background: "#C4707A", color: "#FFFDF9", opacity: busy ? 0.6 : 1 }}>{busy ? "Waiting for AI…" : "Add to closet"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <div className="mono text-[10px] opacity-60 mb-1">{label.toUpperCase()}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm p-2 rounded border" style={{ borderColor: "#C9BBA0" }}>
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </div>
  );
}

export function GlobalStyle() {
  return (
    <style>{`
      .fraunces { font-family: 'Fraunces', serif; }
      .mono { font-family: 'Space Mono', monospace; letter-spacing: 0.02em; }
      .polaroid { background: #FFFDF9; padding: 10px 10px 34px 10px; box-shadow: 0 3px 10px rgba(51,35,46,0.18); border-radius: 2px; }
    `}</style>
  );
}
