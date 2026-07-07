# 👕 SoulCloset+

An AI-powered digital wardrobe application that helps users organize clothing, receive personalized outfit recommendations, preserve clothing memories, and exchange garments through a sustainable community marketplace.

---

## Why I Built This

Fast fashion contributes significantly to clothing waste, while many garments remain unused in our wardrobes. I built SoulCloset+ to explore how AI can encourage mindful fashion by helping users organize clothes, rediscover forgotten outfits, and exchange garments instead of buying new ones.

---

## Features

- 👕 Digital wardrobe management
- 🤖 AI-powered outfit recommendations (Mood Mirror)
- 🎨 AI-generated aesthetic profile
- 🪄 AI photo tagging for clothing items
- 💡 AI upcycling suggestions
- ♻️ AuraSwap clothing exchange marketplace
- 💬 Messaging interface for swap conversations
- ❤️ Favorites and wear tracking
- 📝 Clothing memory journal
- 🔐 Secure authentication with password hashing

---

## Screenshots

### Landing Page

<img width="960" alt="Landing Page" src="https://github.com/user-attachments/assets/77b196af-bb80-4623-8f70-3341d94bb035">

### Sign Up

![Signup](<img width="960" height="600" alt="Screenshot 2026-07-07 192747" src="https://github.com/user-attachments/assets/22b74314-a85a-42f4-8476-fb74df789ab2" />
)

### Login

![Login](<img width="960" height="600" alt="Screenshot 2026-07-07 192817" src="https://github.com/user-attachments/assets/9fc60533-5a92-4b4b-ac5a-05b8feba11ce" />
)

### My Closet

![Dashboard](<img width="960" height="600" alt="Screenshot 2026-07-07 193935" src="https://github.com/user-attachments/assets/b881fa54-50ea-4064-afbb-2d5c438ef22b" />
)

### Mood Mirror

![Mood Mirror](assets/screenshots/mood-mirror.png)

### AuraSwap

![AuraSwap](<img width="960" height="600" alt="Screenshot 2026-07-07 194008" src="https://github.com/user-attachments/assets/8d4ea3ba-f123-4c3f-ba04-5fde980ab147" />
)

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### AI

- Anthropic Claude API
- Claude Vision

### Authentication

- Password hashing using Node.js Crypto (scrypt)

### Storage

- JSON Database

---

## Project Structure

```
SoulCloset+

├── client/
│   ├── src/
│   └── public/
│
├── server/
│   ├── data/
│   ├── .env.example
│   └── server.js
│
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Anjalibytes/soulcloset-plus.git

cd soulcloset-plus
```

### 2. Backend Setup

```bash
cd server

npm install
```

Create a `.env` file.

```
ANTHROPIC_API_KEY=YOUR_API_KEY
```

Start the backend.

```bash
npm start
```

---

### 3. Frontend Setup

Open another terminal.

```bash
cd client

npm install

npm run dev
```

Visit

```
http://localhost:5173
```

---

## Environment Variable

```
ANTHROPIC_API_KEY=
```

---

## AI Features

The following features require an Anthropic API key with active credits.

- Mood Mirror
- Aesthetic Profile
- AI Photo Tagging
- AI Upcycling Suggestions

The remaining features of the application work independently.

---

## Future Improvements

- MongoDB integration
- JWT-based authentication
- Real-time chat
- Multi-user support
- Live deployment with Vercel and Render

---

## Known Limitations

- AI features require an Anthropic API key with available credits.
- The application currently uses a local JSON database instead of MongoDB.
- AuraSwap messaging is currently a prototype.
- Live deployment is planned.

---

## Author

**Anjali Singh**

B.Tech Computer Science Engineering Student

GitHub: https://github.com/Anjalibytes

Project Repository: https://github.com/Anjalibytes/soulcloset-plus
