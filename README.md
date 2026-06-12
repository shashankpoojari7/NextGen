# NextGen — Social Interaction & Real-Time Chat Platform
 
A full-stack social media platform built for real-time communication, content sharing, and social networking. NextGen supports instant messaging, live presence tracking, media uploads, and a dynamic feed — all delivered through a modern, scalable architecture.
 
> **This project is split across two repositories:**
> - `nextgen` — Next.js frontend + API routes (this repo)
> - [`nextgen-socket`](https://github.com/shashankpoojari7/nextgen-socket) — Standalone Socket.IO server
 
🔗 **Live Demo:** [next-gen-delta.vercel.app](https://next-gen-delta.vercel.app)
 
---
 
## Features
 
- **Real-Time Messaging** — Instant chat with typing indicators and online/offline presence via a dedicated Socket.IO server
- **Social Feed** — Create, like, share, and comment on posts with a paginated following and public feed
- **Follow System** — Send/accept follow requests, manage followers and following with privacy controls
- **Notifications** — Live push notifications for follows, likes, comments, and messages
- **Media Uploads** — Image sharing via Cloudinary with optimized delivery
- **OAuth & Auth** — Sign in with GitHub, Google, or Facebook via NextAuth, plus local JWT-based auth
- **Profile Management** — Edit profile, change password, manage privacy settings, and remove followers
- **Skeleton Loaders** — Polished loading states across feed, profile, and chat views
- **Dark / Light Theme** — Theme preference persisted via Zustand store
---
 
## Architecture
 
```
┌──────────────────────────┐        ┌─────────────────────────┐
│   Next.js App (Vercel)   │◄──────►│  Socket Server (Render) │
│  - Pages & API Routes    │        │  - Socket.IO             │
│  - NextAuth              │        │  - MongoDB (shared)      │
│  - React Query + Zustand │        │  - Real-time events      │
└────────────┬─────────────┘        └─────────────────────────┘
             │
     ┌───────┴────────┐
     │   MongoDB Atlas │
     │   Redis Cache   │
     │   Cloudinary    │
     └────────────────┘
```
 
---
 
## Tech Stack
 
| Layer | Technologies |
|---|---|
| Frontend | Next.js 14 (App Router), React Query, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Node.js |
| Real-Time | Socket.IO (separate server — `nextgen-socket`) |
| Database | MongoDB, Mongoose |
| Caching | Redis |
| Auth | NextAuth.js (GitHub, Google, Facebook), JWT |
| Media | Cloudinary |
| State | Zustand |
| Deployment | Vercel (frontend), Render (socket server) |
| Language | TypeScript |
 
---
 
## Monorepo Overview
 
### 1. `nextgen` — Main Application
 
The primary Next.js application containing all pages, API routes, components, and business logic.
 
### 2. `nextgen-socket` — Socket.IO Server
 
A standalone Node.js + TypeScript server responsible for all real-time functionality. Kept separate to avoid serverless limitations on Vercel (WebSocket connections require a persistent server).
 
```
nextgen-socket/
├── src/
│   ├── database/
│   │   └── dbConnection.ts     # Shared MongoDB connection
│   └── models/
│       ├── user.model.ts
│       └── post.model.ts
├── server.ts                   # Socket.IO server entry point
├── .env.sample
├── package.json
└── tsconfig.json
```
 
**Socket Server Handles:**
- `sendMessage` / `receiveMessage` — Real-time chat delivery
- `typing` — Typing indicator broadcast
- `userOnline` / `userOffline` — Presence tracking
- `notification` — Live notification push to recipients
---
 
## Project Structure
 
```
src/
├── app/
│   ├── (app)/                  # Authenticated app routes
│   │   ├── connect/            # Discover & connect with users
│   │   ├── messages/[userId]/  # Direct messages
│   │   ├── notification/       # Notifications + follow requests
│   │   ├── profile/[username]/ # User profiles
│   │   ├── search/             # User search
│   │   └── settings/           # Profile, password, privacy
│   ├── (auth)/                 # Public auth routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   └── api/                    # REST API routes
│       ├── auth/               # NextAuth + local auth
│       ├── chat/               # Conversations & messages
│       ├── notifications/
│       ├── posts/              # Feed, likes, comments, shares
│       ├── redis/              # Redis health check
│       └── user/               # Follow, profile, settings
├── components/                 # UI components by feature
├── context/                    # React context providers
├── database/                   # MongoDB connection
├── helpers/                    # Utility functions
├── hooks/                      # React Query custom hooks
├── lib/                        # Shared utilities (JWT, Redis, Cloudinary)
├── models/                     # Mongoose schemas
├── schemas/                    # Zod validation schemas
├── services/                   # API call functions
├── store/                      # Zustand global stores
└── types/                      # TypeScript type definitions
```
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js 18+
- MongoDB (Atlas or local)
- Redis (Upstash or local)
- Cloudinary account
- OAuth apps for GitHub, Google, and/or Facebook
### 1. Clone & Install
 
```bash
# Main app
git clone https://github.com/shashankpoojari7/nextgen.git
cd nextgen
npm install
 
# Socket server (separate repo)
git clone https://github.com/shashankpoojari7/nextgen-socket.git
cd nextgen-socket
npm install
```
 
### 2. Configure Environment Variables
 
Create a `.env.local` file in the `nextgen` root:
 
```env
# Database
MONGODB_URI=
 
# API & Socket
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_SERVER_URL=
 
# Security
PEPPER_KEY=
ACCESS_TOKEN_SECRET=
 
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
 
# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
 
# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
 
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
 
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```
 
Create a `.env` file in the `nextgen-socket` root:
 
```env
MONGODB_URI=
PORT=5000
```
 
> A `.env.sample` file is included in both repos — copy and fill in your values.
 
### 3. Run Locally
 
```bash
# Terminal 1 — Main app
cd nextgen
npm run dev
 
# Terminal 2 — Socket server
cd nextgen-socket
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000) in your browser.
 
---
 
## API Overview
 
| Resource | Method | Endpoint |
|---|---|---|
| Auth | POST | `/api/auth/sign-up`, `/api/auth/sign-in` |
| User | GET | `/api/user/get-profile/[id]` |
| User | POST | `/api/user/follow`, `/api/user/unfollow` |
| User | PUT | `/api/user/settings/update-profile-data` |
| Posts | GET | `/api/posts/feed` |
| Posts | POST | `/api/posts/create-post` |
| Posts | POST | `/api/posts/like/[id]` |
| Comments | GET | `/api/posts/comment/get-comments/[id]` |
| Messages | GET | `/api/chat/messages/[conversationId]` |
| Messages | POST | `/api/chat/messages/create` |
| Notifications | GET | `/api/notifications` |
 
---
 
## Zustand Stores
 
| Store | Purpose |
|---|---|
| `useActiveChatStore` | Tracks active conversation |
| `useOnlineStore` | Online user presence map |
| `useNotificationStore` | Unread notification count |
| `useThemeStore` | Dark / light theme |
| `useGlobalLoader` | Page-level loading state |
| `useDrawerStore` | Mobile drawer open/close |
 
---
 
## Deployment
 
### Frontend → Vercel
 
```bash
# Vercel auto-deploys on push to main
# Set all environment variables in the Vercel project dashboard
npm run build
```
 
### Socket Server → Render
 
1. Connect the `nextgen-socket` repo to a new Render Web Service
2. Set **Build Command:** `npm install && npm run build`
3. Set **Start Command:** `npm start`
4. Add `MONGODB_URI` and `PORT` as environment variables in the Render dashboard
5. Copy the Render service URL → set as `NEXT_PUBLIC_SOCKET_SERVER_URL` in your Vercel project
---
 
## Screenshots
 
> _Add screenshots or a GIF walkthrough of the feed, chat, and profile pages here._
 
---
 
## Contributing
 
Pull requests are welcome. For significant changes, please open an issue first.
 
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request
---
 
## License
 
This project is licensed under the [MIT License](LICENSE).
 
---
 
> Built by [@shashankpoojari7](https://github.com/shashankpoojari7) · Next.js · Socket.IO · MongoDB · Redis