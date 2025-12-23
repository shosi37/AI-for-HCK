# Backend for My Auth App

This small Express backend accepts email/password logins, validates with Firebase, and issues a server-signed JWT for client use.

Endpoints

- POST /api/login
  - Body: { email, password }
  - Response: { token, user: { uid, email, displayName, emailVerified } }

- POST /api/login-token
  - Body: { idToken }
  - Response: { token, user }
  - Notes: Verifies the Firebase ID token with the Admin SDK (recommended for production). On success the server creates a refresh session (firestore preferred, local file fallback available) and sets an HttpOnly `refreshToken` cookie.

- POST /api/__dev/impersonate (development only)
  - Body: { user: { uid, email, displayName, emailVerified, photoURL } }
  - Response: { token, user }
  - Notes: Useful for local testing when you don't have a valid Firebase ID token or Admin SDK is misconfigured. This is disabled in production.

- GET /api/profile
  - Header: Authorization: Bearer <token>
  - Response: { user }
  - Notes: The server will attempt to verify the Authorization token as a Firebase ID token when Admin SDK is configured; otherwise it falls back to the server-signed JWT.

- POST /api/__dev/impersonate  (development only)
  - Body: { user: { uid, email, displayName, emailVerified, photoURL } }
  - Response: { token, user }
  - Notes: only available when NODE_ENV !== 'production' and useful for local dev integration/testing.
  - Example (curl):

```bash
curl -X POST http://localhost:4000/api/__dev/impersonate \
  -H "Content-Type: application/json" \
  -d '{ "user": { "uid": "IF84cQtpgSbvSuTKsZVPNQNRW1G3", "email": "np03cs4a230185@heraldcollege.edu.np", "displayName": "HMMM", "photoURL": "data:image/svg+xml;utf8,<svg ...>", "emailVerified": true } }'
```

This will set the refresh cookie and return an access token and user payload for quick local testing.

Dev troubleshooting tips:
- If you see 500 /api/login or 500 /api/login-token errors stating missing configuration, ensure you have populated `backend/.env` from `backend/.env.example`. For local development you can either add `FIREBASE_API_KEY` or use the `dev: true` body field for `/api/login`, or use `/api/__dev/impersonate` for quick testing.
- When Admin SDK is not configured, `/api/login-token` will attempt to decode the idToken as a **local dev fallback only** (it does NOT verify signatures). This is intended for local testing only — **do not** use it in production.


Environment variables

- Add `ABSTRACTAPI_KEY` to your `backend/.env` to enable avatar proxying through AbstractAPI (do NOT commit this key).

See `.env.example`. 

Service account & sessions

- Place a Firebase **service account JSON** into this folder (e.g. `service-account.json`) and set `SERVICE_ACCOUNT_PATH=./service-account.json` in `backend/.env` to enable the Firebase Admin SDK.
- When Firebase Admin is configured, the server will automatically attempt to migrate any existing local `sessions.json` entries into Firestore on startup.
- `backend/sessions.json` is used as a local fallback for development when Admin is not configured.

Run locally

1. copy `.env.example` to `.env` and fill in values
2. npm install
3. npm run start

Notes:

- The backend will accept `CLIENT_ORIGIN` (comma-separated) to whitelist frontend origins. Defaults include `http://localhost:5173` and `http://localhost:5174`.
- For local dev with auto-reload, use `npm run dev` (`nodemon` must be installed as a dev dependency).
- Ensure your service account has Firestore permissions when you provide one — otherwise the Admin SDK will be initialized but Firestore calls may return `PERMISSION_DENIED`.
