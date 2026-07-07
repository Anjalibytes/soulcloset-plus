import { useState } from "react";
import { api } from "./shared.js";

// Real auth now: passwords are hashed and checked server-side. We still
// keep it simple by storing the returned token + user in localStorage
// (there's no token verification middleware on every API route yet —
// a genuine next step, noted in the README — but signup/login themselves
// are now real, not just a name typed into a box).
export function useAuth() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("soulcloset-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [error, setError] = useState("");

  async function signup({ name, email, password }) {
    setError("");
    const res = await api.signup(name, email, password);
    if (res.error) { setError(res.error); return false; }
    localStorage.setItem("soulcloset-user", JSON.stringify(res.user));
    localStorage.setItem("soulcloset-token", res.token);
    setUser(res.user);
    return true;
  }

  async function login({ email, password }) {
    setError("");
    const res = await api.login(email, password);
    if (res.error) { setError(res.error); return false; }
    localStorage.setItem("soulcloset-user", JSON.stringify(res.user));
    localStorage.setItem("soulcloset-token", res.token);
    setUser(res.user);
    return true;
  }

  function logout() {
    localStorage.removeItem("soulcloset-user");
    localStorage.removeItem("soulcloset-token");
    setUser(null);
  }

  return { user, signup, login, logout, error };
}
