# Sequence Diagram 2: Google OAuth 2.0 Login Flow

```
┌──────┐  ┌──────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ User │  │Login │  │Firebase│  │ Google │  │Firebase│  │Firestore│ │Dashboard│
│      │  │ Page │  │  Auth  │  │ OAuth  │  │  Auth  │  │   DB   │  │  Page  │
└──┬───┘  └──┬───┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘
   │         │          │           │           │           │           │
   │ Navigate to        │           │           │           │           │
   │ /login  │          │           │           │           │           │
   │────────>│          │           │           │           │           │
   │         │          │           │           │           │           │
   │         │ Display Login Form   │           │           │           │
   │<────────│          │           │           │           │           │
   │         │          │           │           │           │           │
   │ Click "Continue    │           │           │           │           │
   │ with Google"       │           │           │           │           │
   │────────>│          │           │           │           │           │
   │         │          │           │           │           │           │
   │         │ handleGoogleSignIn() │           │           │           │
   │         │          │           │           │           │           │
   │         │ Create GoogleAuthProvider()      │           │           │
   │         │          │           │           │           │           │
   │         │ addScope('profile')  │           │           │           │
   │         │ addScope('email')    │           │           │           │
   │         │          │           │           │           │           │
   │         │ signInWithPopup()    │           │           │           │
   │         │─────────>│           │           │           │           │
   │         │          │           │           │           │           │
   │         │          │ Open OAuth Popup      │           │           │
   │         │          │──────────>│           │           │           │
   │         │          │           │           │           │           │
   │ [POPUP OPENS]      │           │           │           │           │
   │<───────────────────┼───────────│           │           │           │
   │         │          │           │           │           │           │
   │         │          │           │ Display Google        │           │
   │         │          │           │ Account Selection     │           │
   │<───────────────────┼───────────│           │           │           │
   │         │          │           │           │           │           │
   │ Select Google      │           │           │           │           │
   │ Account │          │           │           │           │           │
   │────────────────────┼──────────>│           │           │           │
   │         │          │           │           │           │           │
   │         │          │           │ Show Consent Screen   │           │
   │         │          │           │ (Permissions)         │           │
   │<───────────────────┼───────────│           │           │           │
   │         │          │           │           │           │           │
   │         │          │           │ Requested Scopes:     │           │
   │         │          │           │ • Profile             │           │
   │         │          │           │ • Email               │           │
   │<───────────────────┼───────────│           │           │           │
   │         │          │           │           │           │           │
   │ Click "Allow"      │           │           │           │           │
   │────────────────────┼──────────>│           │           │           │
   │         │          │           │           │           │           │
   │         │          │           │ User Authorizes       │           │
   │         │          │           │           │           │           │
   │         │          │           │ Generate OAuth Token  │           │
   │         │          │           │ (ID Token + Access)   │           │
   │         │          │           │           │           │           │
   │         │          │           │ Return OAuth Response │           │
   │         │          │<──────────┤           │           │           │
   │         │          │           │           │           │           │
   │ [POPUP CLOSES]     │           │           │           │           │
   │<───────────────────┼───────────┤           │           │           │
   │         │          │           │           │           │           │
   │         │          │ Verify OAuth Token    │           │           │
   │         │          │───────────────────────>│           │           │
   │         │          │           │           │           │           │
   │         │          │           │ Token Valid           │           │
   │         │          │           │           │           │           │
   │         │          │           │ Create/Link Firebase  │           │
   │         │          │           │ User Account          │           │
   │         │          │<───────────────────────│           │           │
   │         │          │           │           │           │           │
   │         │ Return User Credentials          │           │           │
   │         │ + ID Token│           │           │           │           │
   │         │<─────────│           │           │           │           │
   │         │          │           │           │           │           │
   │         │ getIdToken()         │           │           │           │
   │         │─────────>│           │           │           │           │
   │         │          │           │           │           │           │
   │         │ ID Token │           │           │           │           │
   │         │<─────────│           │           │           │           │
   │         │          │           │           │           │           │
   │         │ Log ID Token to Console           │           │           │
   │         │ ══════════════════════            │           │           │
   │         │ Google OAuth ID Token:            │           │           │
   │         │ eyJhbGciOiJSUzI1NiIs...           │           │           │
   │         │ ══════════════════════            │           │           │
   │         │          │           │           │           │           │
   │         │ Check if user exists in Firestore │           │           │
   │         │───────────────────────────────────┼──────────>│           │
   │         │          │           │           │           │           │
   │         │          │           │  Query users/{uid}    │           │
   │         │          │           │           │           │           │
   │         │ IF USER EXISTS:      │           │           │           │
   │         │<──────────────────────────────────┼───────────│           │
   │         │ Return existing profile           │           │           │
   │         │          │           │           │           │           │
   │         │ IF NEW USER:         │           │           │           │
   │         │          │           │           │           │           │
   │         │ Create User Profile  │           │           │           │
   │         │ {                    │           │           │           │
   │         │   id: uid,           │           │           │           │
   │         │   email: from Google,│           │           │           │
   │         │   name: displayName, │           │           │           │
   │         │   createdAt: now     │           │           │           │
   │         │ }                    │           │           │           │
   │         │───────────────────────────────────┼──────────>│           │
   │         │          │           │           │           │           │
   │         │          │           │  Save to Firestore    │           │
   │         │          │           │           │           │           │
   │         │ Profile Created      │           │           │           │
   │         │<──────────────────────────────────┼───────────│           │
   │         │          │           │           │           │           │
   │         │ onLogin(userProfile) │           │           │           │
   │         │ Save user to App State            │           │           │
   │         │          │           │           │           │           │
   │         │ navigate('/dashboard')            │           │           │
   │         │───────────────────────────────────┼───────────┼──────────>│
   │         │          │           │           │           │           │
   │ Redirect to Dashboard          │           │           │           │
   │<───────────────────────────────────────────┼───────────┼───────────│
   │         │          │           │           │           │           │
   │ Display Dashboard with User Profile        │           │           │
   │<───────────────────────────────────────────┼───────────┼───────────│
   │         │          │           │           │           │           │
   ▼         ▼          ▼           ▼           ▼           ▼           ▼


OAUTH TOKEN STRUCTURE:
═══════════════════════

ID TOKEN (JWT):
{
  "header": {
    "alg": "RS256",
    "kid": "1234567890abcdef",
    "typ": "JWT"
  },
  "payload": {
    "iss": "https://accounts.google.com",
    "azp": "your-client-id.apps.googleusercontent.com",
    "aud": "your-client-id.apps.googleusercontent.com",
    "sub": "1234567890",           // Google User ID
    "email": "user@gmail.com",
    "email_verified": true,
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "given_name": "John",
    "family_name": "Doe",
    "locale": "en",
    "iat": 1234567890,             // Issued at
    "exp": 1234571490              // Expires at (1 hour)
  },
  "signature": "base64_encoded_signature"
}


ACCESS TOKEN:
{
  "access_token": "ya29.a0AfH6SMBx...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile email openid"
}


ERROR HANDLING FLOWS:
══════════════════════

1. User Closes Popup:
┌──────┐  ┌──────┐  ┌────────┐
│ User │  │Login │  │Firebase│
│      │  │ Page │  │  Auth  │
└──┬───┘  └──┬───┘  └───┬────┘
   │         │          │
   │ Click X on Popup   │
   │────────>│          │
   │         │          │
   │         │ Error:   │
   │         │ auth/popup-closed-by-user
   │         │<─────────│
   │         │          │
   │         │ Display: │
   │         │ "Sign-in │
   │         │ cancelled"│
   │<────────│          │
   │         │          │
   ▼         ▼          ▼


2. Unauthorized Domain:
┌──────┐  ┌──────┐  ┌────────┐
│ User │  │Login │  │Firebase│
│      │  │ Page │  │  Auth  │
└──┬───┘  └──┬───┘  └───┬────┘
   │         │          │
   │ Click Google Btn   │
   │────────>│          │
   │         │          │
   │         │ Error:   │
   │         │ auth/unauthorized-domain
   │         │<─────────│
   │         │          │
   │         │ Display: │
   │         │ "Domain not authorized:│
   │         │  Add to Firebase"      │
   │<────────│          │
   │         │          │
   ▼         ▼          ▼


3. Network Error:
┌──────┐  ┌──────┐  ┌────────┐
│ User │  │Login │  │Firebase│
│      │  │ Page │  │  Auth  │
└──┬───┘  └──┬───┘  └───┬────┘
   │         │          │
   │ Click Google Btn   │
   │────────>│          │
   │         │          │
   │         │ Network  │
   │         │ Timeout  │
   │         │<─────────│
   │         │          │
   │         │ Display: │
   │         │ "Network error│
   │         │ Check connection"│
   │<────────│          │
   │         │          │
   ▼         ▼          ▼


KEY OAUTH SCOPES:
══════════════════

• profile: Access to user's basic profile (name, photo)
• email: Access to user's email address
• openid: OpenID Connect authentication


SECURITY FEATURES:
═══════════════════

✓ HTTPS-only communication
✓ OAuth 2.0 industry standard
✓ JWT tokens with expiration
✓ State parameter prevents CSRF attacks
✓ Popup mode prevents phishing
✓ Token stored securely by Firebase
✓ ID token logged to console for debugging only


DATA SAVED TO FIRESTORE:
══════════════════════════

New User Profile:
{
  id: "firebase-uid-from-oauth",
  email: "user@gmail.com",
  name: "John Doe",
  createdAt: Timestamp(now),
  isAdmin: false
}

Existing User:
• No new document created
• Profile loaded from existing Firestore document


CONSOLE OUTPUT:
════════════════

==================================================
Google OAuth ID Token:
eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0M2NjY...
==================================================
Google Sign-In successful!
ID Token: eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4...
User UID: abc123xyz
User Email: user@gmail.com
```

---

**This sequence diagram shows the complete Google OAuth 2.0 authentication flow with ID token generation.**

**Next: Sequence Diagram 3 - Chat Message with AI (OpenAI + NLP)**
