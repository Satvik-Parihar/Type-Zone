# TypeZone

TypeZone is a modern MERN typing platform with secure authentication, persistent progress tracking, real-time race rooms, and a clean dashboard for daily practice.

## Highlights

- Full-stack architecture with isolated client and server apps
- JWT access token + refresh token cookie authentication
- MongoDB-backed typing history, user stats, and leaderboard state
- Real-time race room updates over Socket.io
- Multi-mode typing engine with live metrics and trend visualization
- Container-ready local deployment with Docker Compose

## Tech Stack

### Frontend

- React + Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- Socket.io client

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Zod validation
- Helmet, rate limiting, sanitize middleware
- Socket.io server

## Project Structure

```text
TypeZone/
  client/                  # React app
  server/                  # Express API
  docs/                    # API documentation
  docker-compose.yml       # Local multi-service orchestration
```

## Core Features

### Authentication

- Register and login endpoints
- Password hashing via bcrypt
- Access token authorization for protected routes
- Refresh token rotation with secure cookie handling

### Typing Engine

- Modes: words, quote, numbers, code, punctuation
- Time presets: 15s, 30s, 60s, 120s
- Live WPM, accuracy, and error tracking
- Progress bar and restart/finish controls
- Custom text support for focused practice

### Analytics

- Session history retrieval
- Personal performance summaries
- Trend chart rendering for WPM and accuracy
- Mistake heatmap summary for each run

### Competitive Layer

- Global leaderboard endpoint
- Daily challenge endpoint
- Real-time race rooms with progress and winner broadcast

## Security Measures

- Helmet security headers
- API and auth rate limiting
- Mongo query sanitization
- HTTP parameter pollution protection
- XSS request sanitization
- Centralized API error handling with validated payloads

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB local instance or Atlas connection string

### Setup

1. Install root dependencies

```bash
npm install
```

2. Configure environment files

- Copy server/.env.example to server/.env
- Set at minimum:
  - MONGO_URI
  - JWT_SECRET
  - CLIENT_ORIGIN

3. Start development servers

```bash
npm run dev
```

### Default Local URLs

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Build and Run

### Frontend production build

```bash
npm run build
```

### Backend production start

```bash
npm run start
```

## Docker

Run all services together:

```bash
docker compose up --build
```

Service endpoints:

- Client: http://localhost:8080
- Server: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## API Docs

Detailed route reference is available in docs/API.md.

## Deployment Guidance

- Frontend: Vercel or Netlify
- Backend: Render, Railway, AWS, or Fly.io
- Database: MongoDB Atlas

Use separate environment variables per environment and rotate secrets regularly.

## Current Status

- Legacy static pages removed
- Unified MERN workflow active
- Security middleware baseline in place
- Test-only artifacts removed from this branch
