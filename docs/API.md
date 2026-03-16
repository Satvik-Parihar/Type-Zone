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

## Typing

- POST /typing/start
  - auth required
  - body: mode, wordCount
  - response: textId, text

- POST /typing/submit
  - auth required
  - body: textId, mode, wpm, accuracy, errors, timeTaken, rawInput
  - response: id

- GET /typing/history
  - auth required

- GET /history
  - auth required
  - alias of typing history

## Leaderboard

- GET /leaderboard

## Challenges

- GET /challenges/daily

## Achievements

- GET /achievements/me
  - auth required

## Socket Events

Namespace: default

Client -> Server:
- race:join { roomId, username }
- race:progress { roomId, progress, wpm }
- race:finish { roomId, wpm }

Server -> Client:
- race:state [players]
- race:finished { winner, wpm }
