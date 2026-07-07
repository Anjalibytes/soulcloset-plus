import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

// --- tiny file-based database ---
// This is a real, independent storage layer: a JSON file on disk that we
// read and rewrite. It's the simplest possible "own database" and is a
// genuine step up from borrowing an external system. Later this can be
// swapped for a real SQL/NoSQL database (Postgres, MongoDB) without
// changing any of the routes below, only the readDB/writeDB functions.
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { items: [], swapListings: [], messages: [], users: [] };
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  if (!data.messages) data.messages = []; // backfill for older db.json files
  if (!data.users) data.users = [];
  return data;
}
function writeDB(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // higher limit because clothing photos are base64 strings

// ---------- PASSWORD HASHING (built into Node, no extra library needed) ----------
// We never store the plain password. We store a random "salt" + the scrypt
// hash of (password + salt). On login we redo the same hash and compare.
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}
function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

// ---------- AUTH ----------

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email, and password are required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const { salt, hash } = hashPassword(password);
  const user = { id: crypto.randomUUID(), name, email, salt, hash, token: crypto.randomUUID() };
  db.users.push(user);
  writeDB(db);
  res.json({ token: user.token, user: { name: user.name, email: user.email } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
  // rotate the token on each login, invalidating any old session
  user.token = crypto.randomUUID();
  writeDB(db);
  res.json({ token: user.token, user: { name: user.name, email: user.email } });
});

// ---------- CLOSET ITEMS ----------

app.get("/api/items", (req, res) => {
  const db = readDB();
  res.json(db.items);
});

app.post("/api/items", (req, res) => {
  const db = readDB();
  const item = { id: crypto.randomUUID(), wearCount: 0, memory: "", ...req.body };
  db.items.unshift(item);
  writeDB(db);
  res.json(item);
});

app.patch("/api/items/:id", (req, res) => {
  const db = readDB();
  const idx = db.items.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  db.items[idx] = { ...db.items[idx], ...req.body };
  writeDB(db);
  res.json(db.items[idx]);
});

app.delete("/api/items/:id", (req, res) => {
  const db = readDB();
  db.items = db.items.filter((i) => i.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ---------- AURASWAP LISTINGS ----------

app.get("/api/swap", (req, res) => {
  const db = readDB();
  res.json(db.swapListings);
});

app.post("/api/swap", (req, res) => {
  const db = readDB();
  const listing = { id: crypto.randomUUID(), createdAt: Date.now(), ...req.body };
  db.swapListings.unshift(listing);
  writeDB(db);
  res.json(listing);
});

// ---------- SWAP CHAT ----------
// A "conversation" is identified by the listing + the two participants,
// so the same listing can have separate threads with different interested people.
function conversationId(listingId, userA, userB) {
  return `${listingId}::${[userA, userB].sort().join("|")}`;
}

// Inbox: all conversations a given user is part of, with a preview of the last message
app.get("/api/conversations", (req, res) => {
  const { user } = req.query;
  if (!user) return res.status(400).json({ error: "user query param required" });
  const db = readDB();
  const byConvo = {};
  for (const m of db.messages) {
    if (m.from !== user && m.to !== user) continue;
    if (!byConvo[m.convoId] || m.createdAt > byConvo[m.convoId].createdAt) {
      byConvo[m.convoId] = m;
    }
  }
  const conversations = Object.values(byConvo).map((m) => ({
    convoId: m.convoId,
    listingId: m.listingId,
    listingName: m.listingName,
    otherUser: m.from === user ? m.to : m.from,
    lastMessage: m.text,
    lastAt: m.createdAt,
  })).sort((a, b) => b.lastAt - a.lastAt);
  res.json(conversations);
});

// All messages in one specific conversation
app.get("/api/messages", (req, res) => {
  const { listingId, userA, userB } = req.query;
  if (!listingId || !userA || !userB) return res.status(400).json({ error: "listingId, userA, userB required" });
  const convoId = conversationId(listingId, userA, userB);
  const db = readDB();
  res.json(db.messages.filter((m) => m.convoId === convoId));
});

app.post("/api/messages", (req, res) => {
  const { listingId, listingName, from, to, text } = req.body;
  if (!listingId || !from || !to || !text) return res.status(400).json({ error: "listingId, from, to, text required" });
  const db = readDB();
  const message = {
    id: crypto.randomUUID(),
    convoId: conversationId(listingId, from, to),
    listingId, listingName, from, to, text,
    createdAt: Date.now(),
  };
  db.messages.push(message);
  writeDB(db);
  res.json(message);
});


// API key never reaches the browser / never gets exposed in frontend code) ----------

async function callClaude(system, userPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errText}`);
  }
  const data = await response.json();
  return (data.content || []).map((c) => c.text || "").join("\n").trim();
}

// Same idea as callClaude, but sends an image alongside the text prompt.
// dataUrl looks like "data:image/jpeg;base64,....." — we split off the
// media type and the raw base64 payload, since the API wants them separate.
async function callClaudeVision(system, userPrompt, dataUrl) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server");

  const match = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");
  const [, mediaType, base64Data] = match;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
          { type: "text", text: userPrompt },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errText}`);
  }
  const data = await response.json();
  return (data.content || []).map((c) => c.text || "").join("\n").trim();
}

app.post("/api/ai/profile", async (req, res) => {
  try {
    const { items } = req.body;
    const desc = items
      .map((i) => `${i.type}, ${i.fabric || "unknown fabric"}, ${i.condition}, tagged ${i.aesthetic || "no aesthetic tag"}, worn ${i.wearCount || 0} times`)
      .join("; ");
    const text = await callClaude(
      "You are a warm, perceptive personal stylist writing a short 'Aesthetic Style Profile' for someone's digital closet app, SoulCloset+. Write 3 short paragraphs: (1) name their dominant aesthetic vibe(s) in an evocative way, (2) describe the emotional/visual signature you notice across their pieces, (3) give one gentle, specific styling suggestion. Keep it warm, specific, and under 160 words total. No headers, no markdown, plain prose.",
      `Here is a list of the person's wardrobe items: ${desc}`
    );
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/mood", async (req, res) => {
  try {
    const { mood, weather, items } = req.body;
    const desc = items
      .map((i) => `[id:${i.id}] ${i.type} (${i.fabric || "fabric unknown"}, ${i.color || i.avgColor}, condition: ${i.condition}, aesthetic: ${i.aesthetic || "unset"})`)
      .join("; ");
    const weatherLine = weather ? `The weather today is ${weather}.` : "Weather isn't specified.";
    const text = await callClaude(
      "You are SoulCloset+'s mood-based styling engine. Given a mood, weather, and a real wardrobe list with item ids, choose 1-3 real items from the list (never invent new items) that fit the mood psychologically and the weather practically. Reply in this exact format on separate lines: 'ITEM_ID: <the id of the single best-fit hero item>' then a blank line then a short warm diary-style paragraph (under 70 words) written in second person explaining the outfit and why it matches the mood, mentioning the chosen pieces by their type/color, not their id.",
      `Mood: ${mood}. ${weatherLine} Wardrobe: ${desc}`
    );
    const idMatch = text.match(/ITEM_ID:\s*\[?id:([a-z0-9-]+)\]?|ITEM_ID:\s*([a-z0-9-]+)/i);
    const foundId = idMatch ? idMatch[1] || idMatch[2] : null;
    const bodyText = text.replace(/ITEM_ID:.*(\n|$)/i, "").trim();
    res.json({ itemId: foundId, text: bodyText || text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/tag-photo", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "image is required" });
    const text = await callClaudeVision(
      "You are a clothing recognition system for a wardrobe app. Look at the photo and respond with ONLY a JSON object, no other text, no markdown fences, in exactly this shape: {\"type\":\"one of Top/Kurti/Jeans/Dress/Hoodie/Saree/Skirt/Jacket/Co-ord/Other\",\"fabric\":\"one of Cotton/Denim/Silk/Linen/Wool/Polyester/Chiffon/Knit\",\"condition\":\"one of New/Good/Worn/Needs care\",\"aesthetic\":\"one of Soft girl/Streetwear/Minimal chic/Dark academia/Cozy core/Glam/Indie / vintage/Earthy\"}. Make your best guess for each field even if uncertain.",
      "What is this garment? Respond with only the JSON object.",
      image
    );
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/upcycle", async (req, res) => {
  try {
    const { item } = req.body;
    const text = await callClaude(
      "You are a sustainable-fashion advisor for the SoulCloset+ app. Given one wardrobe item's type, fabric, and condition, suggest either a simple repair (if it's just worn/damaged) or one creative upcycling idea (if it's old but structurally fine) to keep it out of landfill. Keep it to 2-3 short sentences, warm and practical, no headers or markdown.",
      `Item: ${item.type}, fabric: ${item.fabric || "unknown"}, condition: ${item.condition}, worn ${item.wearCount || 0} times.`
    );
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`SoulCloset+ backend running on http://localhost:${PORT}`));
