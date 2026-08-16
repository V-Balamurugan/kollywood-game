# 🎬 Kollywood Connect

<div align="center">


# 🍿 KOLLYWOOD CONNECT 🌟
### The Ultimate Real-Time Multiplayer Tamil Cinema Trivia & Guessing Game

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.3-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)

<br />

[🎮 Play Game](#-gameplay--how-it-works) • [✨ Key Features](#-features) • [🚀 Quick Start](#-quick-start) • [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) • [🔧 Firebase Setup](#-firebase-configuration) • [🤝 Contributing](#-contributing)

</div>

---

## 📖 Overview

**Kollywood Connect** is a high-octane, cinematic web application designed for passionate fans of Tamil Cinema. Test your film IQ solo or battle in real-time with friends across the globe in an interactive **2x2 Grid Puzzle Challenge**! 

Decipher movie clues, track down iconic songs, reveal first letters, listen to audio teasers, and race against the clock to prove who truly reigns supreme as the ultimate **Kollywood Veriyan**! 👑

---

## 🎯 Gameplay & How It Works

Every round delivers a 2x2 grid centered around a blockbuster Tamil movie. Your mission is to identify all 4 interconnected components:

```
┌───────────────────────────────┬───────────────────────────────┐
│          🦸‍♂️ HERO              │          💃 HEROINE           │
│   Who played the protagonist? │    Leading lady of the film   │
├───────────────────────────────┼───────────────────────────────┤
│          🎥 MOVIE             │          🎵 SONG              │
│      The title of the film    │    Chartbuster from the album │
└───────────────────────────────┴───────────────────────────────┘
```

### 💡 Hint & Clue Mechanics
* **🔤 First-Letter Clues**: Reveal the first letter of any field when you're stuck.
* **🖼️ Poster & Portrait Teasers**: High-res portraits and poster cards for visual detectives.
* **🎶 YouTube Song / Teaser Preview**: Built-in media integration to listen to the song or watch the glimpse.
* **🎬 Director & Music Director Details**: Year of release, director, and music maestro metadata to assist your deduction.

---

## ✨ Features

### 🕹️ Diverse Game Modes
- **🌟 Solo Challenge**: Infinite replayability! Test your instincts, build massive streaks, and set personal records on the global leaderboard.
- **⚔️ Real-Time Multiplayer Rooms**:
  - **Shared First-Solve (Co-op / Battle)**: Everyone plays on a single synchronized 2x2 board! First person to guess a tile stamps their avatar and claims the points.
  - **Individual Speed Race**: Each player races through their own puzzle grid concurrently. Fast fingers take the crown.
  - **🎬 Director Mode (Custom Puzzles)**: Take turns in the Director’s seat! Craft your own custom puzzles on-the-fly and broadcast live hints to contestants in the room.

### 📚 Movie Library & Archive
- Browse an expanding catalog of Kollywood classics and modern masterpieces spanning the 80s, 90s, 2000s, and current generation blockbusters.
- Filter by release decade, difficulty (Easy, Medium, Hard), and music director.

### 🛠️ Director's Studio (Admin Dashboard)
- Full-fledged built-in Admin suite to add, preview, edit, validate, and manage movie puzzle datasets.
- Instant JSON import/export and live puzzle testing sandbox.

### 🎨 Cinematic UI / UX
- **Dark Cinema Aesthetic**: Glassmorphic panels, glowing neon amber/gold accents, and premium typography (`Space Grotesk`, `Outfit`, `JetBrains Mono`).
- **Dynamic Feedback**: Confetti explosions on winning rounds, animated countdown timers, and responsive sound cues.
- **Mobile-First Responsive Design**: Flawless experience across smartphones, tablets, and widescreen desktops.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) |
| **Styling & Design System**| [Tailwind CSS 3](https://tailwindcss.com/) + Custom Glassmorphism |
| **Realtime Backend** | [Firebase Realtime Database](https://firebase.google.com/docs/database) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Sign-In + Guest Mode) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Deployment Targets** | Vercel / Netlify / Firebase Hosting |

---

## 🚀 Quick Start

Follow these simple steps to run Kollywood Connect locally on your machine.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/kollywood-connect.git
cd kollywood-connect
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the project root by copying the template:
```bash
cp .env.example .env
```

Add your Firebase configuration details to `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# (Optional: For TMDB automatic poster scraper)
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### 4️⃣ Start Development Server
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`** 🚀

---

## 🔧 Firebase Configuration

To enable real-time multiplayer rooms and user accounts:

1. Head to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Under **Authentication**, enable:
   - **Google Sign-In**
   - **Anonymous Auth** (for instant Guest login)
3. Under **Realtime Database**, create a database and configure Security Rules:
   ```json
   {
     "rules": {
       "rooms": {
         ".read": true,
         ".write": true
       },
       "users": {
         ".read": true,
         "$uid": {
           ".write": "$uid === auth.uid || auth != null"
         }
       }
     }
   }
   ```
4. Copy the Web SDK Configuration from **Project Settings** into your `.env` file.

---

## 📂 Project Structure

```
kollywood-game/
├── public/                # Static assets, redirects & icons
├── src/
│   ├── components/        # Reusable UI components (Navbar, Modals, Footer, ErrorBoundary)
│   ├── context/           # AuthContext & State management
│   ├── data/              # Curated default puzzle datasets (puzzles.json)
│   ├── pages/             # Main Application Views
│   │   ├── Home.tsx            # Game Hub & Mode Selector
│   │   ├── SoloGame.tsx        # Single-Player Endless Challenge
│   │   ├── CreateRoom.tsx      # Multiplayer Room Host Setup
│   │   ├── JoinRoom.tsx        # Room Code Entry Screen
│   │   ├── RoomLobby.tsx       # Real-Time Player Waiting Lobby
│   │   ├── MultiplayerGame.tsx # Synchronized Multiplayer Arena
│   │   ├── Library.tsx         # Movie & Trivia Archive
│   │   ├── Profile.tsx         # User Stats, Streaks & Match History
│   │   ├── Admin.tsx           # Puzzle Creator & Dataset Manager
│   │   └── WelcomeGate.tsx     # Hero Landing & Guest Gate
│   ├── services/          # Firebase & API service layer
│   ├── types/             # TypeScript interfaces (game.ts, auth, etc.)
│   ├── utils/             # Helper utilities (sound, string match, scoring)
│   ├── App.tsx            # Main router & layout container
│   ├── main.tsx           # React DOM root entry
│   └── index.css          # Tailwind CSS & custom animations
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🚢 Production Build & Deployment

Build the optimized bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

### Deploying to Netlify / Vercel
The repository includes out-of-the-box support with `netlify.toml`, `vercel.json`, and `public/_redirects` to handle Single Page Application (SPA) routing seamlessly. Simply connect your GitHub repository to your hosting provider and set your environment variables!

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/EpicCinemaFeature`)
3. Commit your Changes (`git commit -m 'Add some EpicCinemaFeature'`)
4. Push to the Branch (`git push origin feature/EpicCinemaFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ and 🍿 for **Tamil Cinema Lovers** worldwide.

**[⬆ Back to Top](#-kollywood-connect)**

</div>
