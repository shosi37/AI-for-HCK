# Backend for My Auth App

This small Express backend accepts email/password logins, validates with Firebase, and issues a server-signed JWT for client use.

Endpoints

- POST /api/login
  - Body: { email, password }
  - Response: { token, user: { uid, email, displayName, emailVerified } }

- GET /api/profile
  - Header: Authorization: Bearer <token>
  - Response: { user }

Environment variables

See `.env.example`.

Run locally

1. copy `.env.example` to `.env` and fill in values
2. npm install
3. npm run start
