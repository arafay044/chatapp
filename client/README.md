# Pulse (client)

React 19 + Vite frontend for Pulse, a real-time messaging app.

## Stack

- React 19, React Router 7
- Tailwind CSS v4 (light/dark theme via CSS variables)
- Zustand for client state, TanStack Query for server state
- Socket.IO client for real-time messaging, typing, presence, and WebRTC call signaling
- `emoji-picker-react`, `framer-motion`, `lucide-react`, `vite-plugin-pwa`

## Setup

```bash
npm install
cp .env.example .env   # then fill in VITE_BACKEND_URL
npm run dev
```

## Notes

- Voice/video calls use native WebRTC with a public STUN server only (no TURN server), so calls may fail across strict corporate NATs.
- The GIF picker and push notifications degrade gracefully if the backend isn't configured with `TENOR_API_KEY` / VAPID keys.
