# TypeZone

TypeZone is a full-stack typing speed platform with real-time multiplayer races,
deep analytics, and a polished theme system. The client is built with React + Vite
and the server runs on Node/Express + Socket.IO + MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Theme System](#theme-system)
- [Typing Modes](#typing-modes)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Multiplayer and Sockets](#multiplayer-and-sockets)
- [Testing and Linting](#testing-and-linting)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- Real-time typing tests with live WPM, accuracy, and consistency metrics.
- Multiplayer rooms and races with live progress tracking.
- Profile analytics, streaks, and achievements.
- Practice drills for weak keys and accuracy training.
- 12 theme presets backed by CSS variables.
- Responsive UI with reusable UI components.

## Tech Stack

**Client**
- React 19 + Vite
- Tailwind CSS and CSS variables for theming
- Framer Motion for UI motion
- Socket.IO client for multiplayer

**Server**
- Node.js + Express
- Socket.IO for real-time rooms and races
- MongoDB with Mongoose
- JWT auth + refresh tokens

**Tooling**
- ESLint
- Prettier

## Architecture Overview

TypeZone uses a standard split between a React SPA and a Node API server:

```
Browser (React)  <----HTTP---->  Express API  <---->  MongoDB
			 |                         |
			 |----Socket.IO------------|
```

- The client talks to the API for auth, typing sessions, analytics, and profile data.
- Socket.IO handles multiplayer rooms, race state, and live progress updates.
- JWT access tokens are used for API and socket authentication.

## Theme System

TypeZone ships with 12 themes:

- Midnight
- Dracula
- Nord
- Catppuccin
- Ocean
- Cyber
- Sunset
- Forest
- Paper
- Monochrome
- Terminal
- Rose Pine

Themes are driven by CSS variables and can be switched from the navbar theme button.

## Typing Modes

- **Time**: 15s, 30s, 60s, 120s
- **Words**: 10, 25, 50, 100
- **Quote**: curated quotes
- **Code**: JavaScript, Python, Go
- **Numbers**: numeric sequences
- **Custom**: user-provided text
- **Zen**: long-form free typing

## Project Structure

```
client/
	public/
	src/
		components/
		context/
		hooks/
		layout/
		pages/
		services/
		styles/
		ui/
		utils/
server/
	src/
		config/
		controllers/
		middleware/
		models/
		routes/
		services/
		sockets/
		utils/
docs/
```

## Getting Started

**Prerequisites**

- Node.js 18+
- MongoDB running locally or an Atlas URI

**Install dependencies**

```bash
npm install
npm --prefix client install
npm --prefix server install
```

**Configure environment files**

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

**Run the full stack (recommended)**

```bash
npm run dev
```

Defaults:
- Client: http://localhost:5173
- Server: http://localhost:5000

**Run client or server separately**

```bash
# Client only
npm --prefix client run dev

# Server only
npm --prefix server run dev
```

## Configuration

**Client env** ([client/.env.example](client/.env.example))

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Server env** ([server/.env.example](server/.env.example))

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net
MONGO_DB_NAME=typezone
JWT_SECRET=change_this_to_a_long_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=14
CLIENT_ORIGIN=http://localhost:5173
```

Notes:
- `CLIENT_ORIGIN` must match the client URL for CORS and cookies.
- `JWT_SECRET` should be a long, random string in production.

## Scripts

**Root** ([package.json](package.json))

- `npm run dev` - start client + server
- `npm run lint` - lint client and server
- `npm run format` - run Prettier
- `npm run test` - server tests

**Client** ([client/package.json](client/package.json))

- `npm --prefix client run dev`
- `npm --prefix client run build`
- `npm --prefix client run preview`

**Server** ([server/package.json](server/package.json))

- `npm --prefix server run dev`
- `npm --prefix server run start`
- `npm --prefix server run test`

## API Reference

See the detailed endpoints in [docs/API.md](docs/API.md).

Highlights:
- `POST /api/auth/register` and `POST /api/auth/login`
- `POST /api/typing/submit` for session results
- `GET /api/typing/profile/stats` for profile aggregates

## Multiplayer and Sockets

Socket.IO is used for rooms and race events.

- Rooms: list, create, join, leave, and updates.
- Races: countdown, progress updates, and final results.

The socket auth middleware reads the JWT from `socket.handshake.auth.token`.

## Testing and Linting

```bash
npm run lint
npm --prefix server run test
```

## Docker

The repo includes a docker-compose file for a full stack setup:

```bash
docker compose up --build
```

Defaults:
- Client: http://localhost:8080
- Server: http://localhost:5000
- MongoDB: mongodb://localhost:27017

See [docker-compose.yml](docker-compose.yml) for details.

## Troubleshooting

- **Mongo connection errors**: verify `MONGO_URI` and that MongoDB is running.
- **CORS or auth refresh issues**: confirm `CLIENT_ORIGIN` matches the client URL.
- **Ports in use**: update `PORT` (server) or Vite config (client).

## License

ISC
