# TypeZone API

Base URL: /api

## Auth

- POST /auth/register
  - body: username, email, password
  - response: accessToken, user

- POST /auth/login
  - body: email, password
  - response: accessToken, user

- POST /auth/refresh
  - uses secure httpOnly refresh cookie
  - response: accessToken

- POST /auth/logout
  - clears refresh cookie

## User

- GET /user/profile
  - auth required
  - response: user, historyCount

- PATCH /user/settings
  - auth required
  - body: theme, soundEnabled, keypressSoundEnabled, ambienceEnabled, ambienceVolume, typingSoundProfile (classic|soft|clicky|mechanical|typewriter|spring|silent), keyboardOnlyMode, language
  - response: settings

## Typing

- POST /typing/start
  - auth required
  - body: mode, difficulty, timeLimit, wordCount, customText, weakKeys
  - response: textId, text

- POST /typing/submit
  - auth required
  - body: textId, mode, wpm, rawWpm, accuracy, errors, consistency, keystrokesPerSecond, timeTaken, rawInput, keystrokeTimeline, correctionPatterns, keyMistakes
  - response: id

- GET /typing/history
  - auth required

- GET /typing/analytics
  - auth required
  - response: dailyPerformance, weeklyAverage, personalBest, accuracyTrend, consistencyTrend

- GET /history
  - auth required
  - alias of typing history

## Leaderboard

- GET /leaderboard

## Challenges

- GET /challenges/daily

## Tournaments

- GET /tournaments
  - auth required
  - response: tournaments

- GET /tournaments/mine
  - auth required

- POST /tournaments/join
  - auth required
  - body: tournamentId

- POST /tournaments/submit
  - auth required
  - body: tournamentId, wpm, accuracy

### Admin Endpoints

- POST /tournaments
  - auth required (admin only)
  - body: title, mode (time|paragraph|custom), difficulty (easy|medium|hard|expert), startsAt (ISO datetime), endsAt (ISO datetime), rewardXp
  - response: tournament

- PATCH /tournaments/:id
  - auth required (admin only)
  - body: status (scheduled|active|completed), title?, rewardXp?
  - response: tournament

- DELETE /tournaments/:id
  - auth required (admin only)
  - response: 204 No Content

## Achievements

- GET /achievements/me
  - auth required

## Socket Events

Namespace: default

Client -> Server:
- race:join { roomId, username, isSpectator?, privateRoom?, ghostRun?, userId? }
- race:progress { roomId, progress, wpm, accuracy }
- race:finish { roomId, wpm, accuracy }
- race:spectate { roomId, username }
- race:queueRanked { username, skill, userId? }
- race:leaveQueue {}
- race:ghost { roomId, progress, wpm }

Server -> Client:
- race:state { roomId, roomType, playerCount, spectatorCount, players, spectators, ghostRuns }
- race:finished { winner, wpm, accuracy, rank }
- race:rankedMatch { roomId, opponent }
- race:queueMeta { skill, bucket, decayApplied }
- race:ghostProgress { socketId, progress, wpm }
- race:ratingUpdated { messages }
