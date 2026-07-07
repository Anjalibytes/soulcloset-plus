// Shared API helper — every page imports this instead of writing its own fetch calls.
export const api = {
  getItems: () => fetch("/api/items").then((r) => r.json()),
  addItem: (item) => fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) }).then((r) => r.json()),
  updateItem: (id, patch) => fetch(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).then((r) => r.json()),
  deleteItem: (id) => fetch(`/api/items/${id}`, { method: "DELETE" }).then((r) => r.json()),
  getSwap: () => fetch("/api/swap").then((r) => r.json()),
  listSwap: (listing) => fetch("/api/swap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(listing) }).then((r) => r.json()),
  aiProfile: (items) => fetch("/api/ai/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) }).then((r) => r.json()),
  aiMood: (mood, weather, items) => fetch("/api/ai/mood", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mood, weather, items }) }).then((r) => r.json()),
  aiTagPhoto: (image) => fetch("/api/ai/tag-photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) }).then((r) => r.json()),
  aiUpcycle: (item) => fetch("/api/ai/upcycle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item }) }).then((r) => r.json()),
  signup: (name, email, password) => fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) }).then((r) => r.json()),
  login: (email, password) => fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }).then((r) => r.json()),
  getConversations: (user) => fetch(`/api/conversations?user=${encodeURIComponent(user)}`).then((r) => r.json()),
  getMessages: (listingId, userA, userB) => fetch(`/api/messages?listingId=${encodeURIComponent(listingId)}&userA=${encodeURIComponent(userA)}&userB=${encodeURIComponent(userB)}`).then((r) => r.json()),
  sendMessage: (msg) => fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msg) }).then((r) => r.json()),
};

export function fileToCompressedDataUrl(file, maxDim = 480, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", quality), avgColor: averageColor(ctx, width, height) });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function averageColor(ctx, w, h) {
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 40) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return "rgb(180,170,160)";
  }
}

export const MOODS = [
  { key: "happy", label: "Happy", color: "#F3C969", ink: "#5B4213" },
  { key: "confident", label: "Confident", color: "#E1A24A", ink: "#432C0A" },
  { key: "romantic", label: "Romantic", color: "#E3AEB4", ink: "#5A2630" },
  { key: "tired", label: "Tired", color: "#B9AFC7", ink: "#33283F" },
  { key: "stressed", label: "Stressed", color: "#9FB08C", ink: "#2B3320" },
  { key: "lazy", label: "Lazy", color: "#D9CBB8", ink: "#4A3E2C" },
];

export const CLOTHING_TYPES = ["Top", "Kurti", "Jeans", "Dress", "Hoodie", "Saree", "Skirt", "Jacket", "Co-ord", "Other"];
export const FABRICS = ["Cotton", "Denim", "Silk", "Linen", "Wool", "Polyester", "Chiffon", "Knit"];
export const CONDITIONS = ["New", "Good", "Worn", "Needs care"];
export const AESTHETICS = ["Soft girl", "Streetwear", "Minimal chic", "Dark academia", "Cozy core", "Glam", "Indie / vintage", "Earthy"];
