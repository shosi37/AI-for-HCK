Firebase Auth — React (Tailwind + Framer Motion)

Quick setup:
1. npm install
2. Copy `.env.example` to `.env` and fill frontend keys (VITE_FIREBASE_*, VITE_AVATAR_API_KEY, VITE_BACKEND_URL)
3. Copy `backend/.env.example` to `backend/.env` and fill backend keys (FIREBASE_API_KEY, JWT_SECRET, SERVICE_ACCOUNT_*)
4. start the backend in a separate terminal: `npm run start-backend`
5. start the frontend: `npm run dev`

Environment variables (summary):
- Frontend (`.env` at repo root):
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
  - VITE_FIREBASE_MEASUREMENT_ID
  - VITE_AVATAR_API_KEY (optional)
  - VITE_BACKEND_URL (e.g. http://localhost:4000)

- Backend (`backend/.env`):
  - FIREBASE_API_KEY
  - SERVICE_ACCOUNT_JSON or SERVICE_ACCOUNT_PATH (optional for admin features)
  - JWT_SECRET
  - PORT (optional)

Note: legacy Firebase Cloud Functions code has been archived to `backend/functions-legacy/`. The original `functions/` folder contains a small shim to avoid breaking scripts; remove it if you no longer need it.

Notes:
- The admin "Make me admin" button writes to the Firestore document `meta/admins`. If clicking it shows "Failed to set admin", it usually means Firestore security rules prevent client writes to `meta/admins`.
  - Quick fix: set the `meta/admins` document manually in the Firebase Console to:

```json
{ "emails": ["shoaibsid4884@gmail.com"], "uids": [] }
```

  - Better (recommended): deploy the supplied Cloud Function `setAdmins` which securely writes `meta/admins` on behalf of the authenticated primary admin. To deploy:

```bash
# from repo root
cd functions
npm install
# Ensure Firebase CLI is logged in and initialized for this project, then:
firebase deploy --only functions:setAdmins
```

  - After deploying, the client will automatically call the function as a fallback when the direct client write is denied. The function only allows the callable to succeed for the primary admin account `shoaibsid4884@gmail.com`, so deploy only to your project and keep access controls as needed.
