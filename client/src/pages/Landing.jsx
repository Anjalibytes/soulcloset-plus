import React from "react";
import { useNavigate } from "react-router-dom";
import { Shirt, Sparkles, ArrowLeftRight, BookOpen } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }} className="flex flex-col">
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shirt size={22} color="#C4707A" />
          <span className="fraunces text-xl" style={{ fontStyle: "italic" }}>SoulCloset<span style={{ color: "#C4707A" }}>+</span></span>
        </div>
        <button onClick={() => navigate("/login")} className="text-xs underline opacity-60">Log in</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-2xl mx-auto">
        <h1 className="fraunces text-4xl md:text-5xl leading-tight mb-4" style={{ fontStyle: "italic" }}>
          Your closet, kept gently.
        </h1>
        <p className="text-base md:text-lg opacity-70 mb-8 max-w-md">
          An AI wardrobe that reads your mood, remembers your memories, and helps you swap clothes without spending a rupee.
        </p>
        <button onClick={() => navigate("/signup")} className="px-7 py-3 rounded-full text-sm" style={{ background: "#C4707A", color: "#FFFDF9" }}>
          Get started — it's free
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16 w-full text-left">
          <FeatureCard icon={Sparkles} title="Mood Mirror" body="Tell it how you feel, it styles you from your own closet." />
          <FeatureCard icon={BookOpen} title="Aesthetic Profile" body="A read on your vibe, built from what you actually own." />
          <FeatureCard icon={ArrowLeftRight} title="AuraSwap" body="Trade clothes by vibe — no price tags, ever." />
        </div>
      </main>

      <footer className="text-center text-xs opacity-40 pb-6">SoulCloset+ · a small, sustainable styling experiment</footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div className="p-5 rounded-lg" style={{ background: "#FFFDF9", border: "1px solid #E4D8C4" }}>
      <Icon size={18} color="#C4707A" className="mb-2" />
      <div className="fraunces text-base mb-1" style={{ fontStyle: "italic" }}>{title}</div>
      <div className="text-xs opacity-60">{body}</div>
    </div>
  );
}
