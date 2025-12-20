Firebase Auth — React (Tailwind + Framer Motion)

Quick setup:
1. npm install
2. add your Firebase config in src/firebase.js
3. npm run dev

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
