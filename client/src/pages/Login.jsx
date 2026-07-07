import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shirt, Loader2 } from "lucide-react";

export default function Login({ onLogin, authError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLocalError("");
    if (!email.trim() || !password) return setLocalError("Enter both email and password.");
    setBusy(true);
    const ok = await onLogin({ email: email.trim(), password });
    setBusy(false);
    if (ok) navigate("/closet");
  }

  return (
    <div style={{ background: "#F6EFE4", minHeight: "100vh", color: "#33232E" }} className="flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Shirt size={22} color="#C4707A" />
          <span className="fraunces text-xl" style={{ fontStyle: "italic" }}>SoulCloset<span style={{ color: "#C4707A" }}>+</span></span>
        </div>

        <div className="rounded-lg p-7" style={{ background: "#FFFDF9", border: "1px solid #E4D8C4" }}>
          <h2 className="fraunces text-2xl mb-1" style={{ fontStyle: "italic" }}>Welcome back.</h2>
          <p className="text-xs opacity-60 mb-6">Log in to your closet.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mono text-[10px] opacity-60 block mb-1">EMAIL</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="w-full text-sm p-2.5 rounded border" style={{ borderColor: "#C9BBA0" }} />
            </div>
            <div>
              <label className="mono text-[10px] opacity-60 block mb-1">PASSWORD</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full text-sm p-2.5 rounded border" style={{ borderColor: "#C9BBA0" }} />
            </div>
            {(localError || authError) && <p className="text-xs" style={{ color: "#A94442" }}>{localError || authError}</p>}
            <button type="submit" disabled={busy} className="w-full py-2.5 rounded-full text-sm flex items-center justify-center gap-2" style={{ background: "#C4707A", color: "#FFFDF9" }}>
              {busy && <Loader2 className="animate-spin" size={14} />} Log in
            </button>
          </form>
          <p className="text-xs text-center mt-4 opacity-60">
            New here? <Link to="/signup" className="underline">Create a closet</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
