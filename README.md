## TypeZone

A full-stack typing speed platform with multiplayer races, analytics,
and 12 themes. Built with React + Vite (client) and Node/Express +
Socket.io + MongoDB (server).

## Quick start

**Prerequisites:** Node 18+, MongoDB running locally or Atlas URI

```bash
# Install all dependencies
npm install
cd client && npm install
cd ../server && npm install

# Copy and fill in env files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Start both servers
npm run dev          # from root — starts client on :5173 + server on :3001
```

## Themes
12 built-in themes: Midnight, Dracula, Nord, Catppuccin, Ocean, Cyber,
Sunset, Forest, Paper, Monochrome, Terminal, Rosé Pine.
Switch via the moon icon in the navbar.

## Typing modes
Time (15s/30s/60s/120s), Words (10/25/50/100), Quote, Code (JS/Python/Go),
Numbers, Custom text, Zen.

## Multiplayer
Create or join rooms at /multiplayer. Races support up to 8 players.
Results are saved to all participants' profiles.
