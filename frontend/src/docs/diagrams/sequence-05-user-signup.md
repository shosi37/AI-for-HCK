# Sequence Diagram 5: User Signup Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   User   │     │  Signup  │     │   Firebase   │     │  Firestore   │     │Dashboard │
│          │     │Component │     │     Auth     │     │   Database   │     │   Page   │
└────┬─────┘     └────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                │                   │                    │                   │
     │  Navigate to   │                   │                    │                   │
     │  /signup       │                   │                    │                   │
     │───────────────>│                   │                    │                   │
     │                │                   │                    │                   │
     │                │  Display Signup   │                    │                   │
     │                │  Form             │                    │                   │
     │<───────────────│                   │                    │                   │
     │                │                   │                    │                   │
     │  Fill Form:    │                   │                    │                   │
     │  ┌──────────────────────────────┐  │                    │                   │
     │  │ • Name: "John Doe"           │  │                    │                   │
     │  │ • Email: "john@example.com"  │  │                    │                   │
     │  │ • Password: "password123"    │  │                    │                   │
     │  │ • Student ID: "STU001"       │  │                    │                   │
     │  │ • Department: "CS"           │  │                    │                   │
     │  │ • Year: "3rd Year"           │  │                    │                   │
     │  └──────────────────────────────┘  │                    │                   │
     │───────────────>│                   │                    │                   │
     │                │                   │                    │                   │
     │  Click "Create │                   │                    │                   │
     │  Account"      │                   │                    │                   │
     │───────────────>│                   │                    │                   │
     │                │                   │                    │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │  STEP 1: CLIENT-SIDE VALIDATION        │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │                   │                    │                   │
     │                │  Validate Input:  │                    │                   │
     │                │  • Check all required fields filled    │                   │
     │                │  • Verify email format                 │                   │
     │                │  • Check password length >= 6 chars    │                   │
     │                │                   │                    │                   │
     │                │  ✓ All Valid      │                    │                   │
     │                │                   │                    │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │  STEP 2: CREATE FIREBASE AUTH USER     │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │                   │                    │                   │
     │                │  signUp()         │                    │                   │
     │                │  email, password  │                    │                   │
     │                │──────────────────>│                    │                   │
     │                │                   │                    │                   │
     │                │                   │  Create User Account                   │
     │                │                   │  • Hash password (bcrypt)              │
     │                │                   │  • Generate UID                        │
     │                │                   │  • Set email                           │
     │                │                   │                    │                   │
     │                │  Return User      │                    │                   │
     │                │  Credentials:     │                    │                   │
     │                │  {                │                    │                   │
     │                │    uid: "abc123xyz",                   │                   │
     │                │    email: "john@example.com",          │                   │
     │                │    emailVerified: false                │                   │
     │                │  }                │                    │                   │
     │                │<──────────────────│                    │                   │
     │                │                   │                    │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │  STEP 3: CREATE USER PROFILE IN FIRESTORE                  │
     │                │  ═══════════════════════════════════   │                   │
     │                │                   │                    │                   │
     │                │  Build User Profile Object:            │                   │
     │                │  {                │                    │                   │
     │                │    id: "abc123xyz",                    │                   │
     │                │    email: "john@example.com",          │                   │
     │                │    name: "John Doe",                   │                   │
     │                │    studentId: "STU001",                │                   │
     │                │    department: "Computer Science",     │                   │
     │                │    year: "3rd Year",                   │                   │
     │                │    isAdmin: false,                     │                   │
     │                │    createdAt: Timestamp(now)           │                   │
     │                │  }                │                    │                   │
     │                │                   │                    │                   │
     │                │  setDoc()         │                    │                   │
     │                │  users/{uid}      │                    │                   │
     │                │───────────────────┼───────────────────>│                   │
     │                │                   │                    │                   │
     │                │                   │  Create document in                    │
     │                │                   │  users collection                      │
     │                │                   │  Document ID = UID                     │
     │                │                   │                    │                   │
     │                │  Profile Created  │                    │                   │
     │                │<──────────────────┼────────────────────│                   │
     │                │                   │                    │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │  STEP 4: LOGIN USER & REDIRECT         │                   │
     │                │  ═══════════════════════════════════   │                   │
     │                │                   │                    │                   │
     │                │  onSignup(userProfile)                 │                   │
     │                │  Save user to App State                │                   │
     │                │                   │                    │                   │
     │                │  navigate('/dashboard')                │                   │
     │                │───────────────────┼────────────────────┼──────────────────>│
     │                │                   │                    │                   │
     │  Redirect to   │                   │                    │                   │
     │  Dashboard     │                   │                    │                   │
     │<───────────────┼───────────────────┼────────────────────┼───────────────────│
     │                │                   │                    │                   │
     │  Display       │                   │                    │                   │
     │  Welcome       │                   │                    │                   │
     │  Message       │                   │                    │                   │
     │<───────────────┼───────────────────┼────────────────────┼───────────────────│
     │                │                   │                    │                   │
     ▼                ▼                   ▼                    ▼                   ▼


═══════════════════════════════════════════════════════════════════════
ERROR HANDLING SCENARIOS
═══════════════════════════════════════════════════════════════════════

SCENARIO 1: Email Already Exists
─────────────────────────────────

┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │     │  Signup  │     │   Firebase   │
│          │     │Component │     │     Auth     │
└────┬─────┘     └────┬─────┘     └──────┬───────┘
     │                │                   │
     │  Enter Email   │                   │
     │  "existing@    │                   │
     │  example.com"  │                   │
     │───────────────>│                   │
     │                │                   │
     │  Submit Form   │                   │
     │───────────────>│                   │
     │                │                   │
     │                │  signUp()         │
     │                │──────────────────>│
     │                │                   │
     │                │  Error:           │
     │                │  auth/email-      │
     │                │  already-in-use   │
     │                │<──────────────────│
     │                │                   │
     │                │  Display Error:   │
     │                │  "An account with │
     │                │   this email      │
     │                │   already exists" │
     │<───────────────│                   │
     │                │                   │
     │                │  Show "Login"     │
     │                │  link instead     │
     │<───────────────│                   │
     │                │                   │
     ▼                ▼                   ▼


SCENARIO 2: Weak Password
──────────────────────────

┌──────────┐     ┌──────────┐
│   User   │     │  Signup  │
│          │     │Component │
└────┬─────┘     └────┬─────┘
     │                │
     │  Enter Password│
     │  "123" (short) │
     │───────────────>│
     │                │
     │  Submit Form   │
     │───────────────>│
     │                │
     │                │  Validate Input
     │                │  password.length < 6
     │                │
     │                │  Display Error:
     │                │  "Password must be
     │                │   at least 6
     │                │   characters"
     │<───────────────│
     │                │
     ▼                ▼


SCENARIO 3: Missing Required Fields
────────────────────────────────────

┌──────────┐     ┌──────────┐
│   User   │     │  Signup  │
│          │     │Component │
└────┬─────┘     └────┬─────┘
     │                │
     │  Leave Name    │
     │  field empty   │
     │───────────────>│
     │                │
     │  Submit Form   │
     │───────────────>│
     │                │
     │                │  Validate Input
     │                │  !name || !email || !password
     │                │
     │                │  Display Error:
     │                │  "Please fill in all
     │                │   required fields"
     │<───────────────│
     │                │
     │                │  Highlight empty
     │                │  fields in red
     │<───────────────│
     │                │
     ▼                ▼


SCENARIO 4: Invalid Email Format
─────────────────────────────────

┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │     │  Signup  │     │   Firebase   │
│          │     │Component │     │     Auth     │
└────┬─────┘     └────┬─────┘     └──────┬───────┘
     │                │                   │
     │  Enter Email   │                   │
     │  "notanemail"  │                   │
     │───────────────>│                   │
     │                │                   │
     │  Submit Form   │                   │
     │───────────────>│                   │
     │                │                   │
     │                │  signUp()         │
     │                │──────────────────>│
     │                │                   │
     │                │  Error:           │
     │                │  auth/invalid-    │
     │                │  email            │
     │                │<──────────────────│
     │                │                   │
     │                │  Display Error:   │
     │                │  "Invalid email   │
     │                │   format"         │
     │<───────────────│                   │
     │                │                   │
     ▼                ▼                   ▼


SCENARIO 5: Network Error
──────────────────────────

┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │     │  Signup  │     │   Firebase   │
│          │     │Component │     │     Auth     │
└────┬─────┘     └────┬─────┘     └──────┬───────┘
     │                │                   │
     │  Submit Form   │                   │
     │───────────────>│                   │
     │                │                   │
     │                │  signUp()         │
     │                │──────────────────>│
     │                │                   │
     │                │  Network timeout  │
     │                │  (no response)    │
     │                │                   │
     │                │  Error:           │
     │                │  auth/network-    │
     │                │  request-failed   │
     │                │<──────────────────│
     │                │                   │
     │                │  Display Error:   │
     │                │  "Network error.  │
     │                │   Check connection│
     │                │   and try again"  │
     │<───────────────│                   │
     │                │                   │
     │                │  Enable "Retry"   │
     │                │  button           │
     │<───────────────│                   │
     │                │                   │
     ▼                ▼                   ▼


═══════════════════════════════════════════════════════════════════════
GOOGLE OAUTH SIGNUP FLOW (Alternative)
═══════════════════════════════════════════════════════════════════════

┌──────────┐     ┌──────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│   User   │     │  Signup  │     │Firebase│     │ Google │     │Firestore│
│          │     │Component │     │  Auth  │     │ OAuth  │     │   DB   │
└────┬─────┘     └────┬─────┘     └───┬────┘     └───┬────┘     └───┬────┘
     │                │                │              │              │
     │  Click "Continue                │              │              │
     │  with Google"  │                │              │              │
     │───────────────>│                │              │              │
     │                │                │              │              │
     │                │  signInWithGoogle()           │              │
     │                │───────────────>│              │              │
     │                │                │              │              │
     │                │                │  Open OAuth Popup           │
     │                │                │─────────────>│              │
     │                │                │              │              │
     │  [GOOGLE POPUP OPENS]           │              │              │
     │                │                │              │              │
     │  Select Account│                │              │              │
     │  & Authorize   │                │              │              │
     │────────────────────────────────────────────────>│              │
     │                │                │              │              │
     │                │                │  OAuth Token │              │
     │                │                │<─────────────┤              │
     │                │                │              │              │
     │                │  User Credentials             │              │
     │                │<───────────────┤              │              │
     │                │                │              │              │
     │                │  Check if user exists:        │              │
     │                │───────────────────────────────┼─────────────>│
     │                │                │              │              │
     │                │  IF NEW USER:  │              │              │
     │                │  Create profile│              │              │
     │                │  {             │              │              │
     │                │    id: uid,    │              │              │
     │                │    email: from Google,        │              │
     │                │    name: displayName,         │              │
     │                │    createdAt: now()           │              │
     │                │  }             │              │              │
     │                │───────────────────────────────┼─────────────>│
     │                │                │              │              │
     │                │  Profile Created              │              │
     │                │<──────────────────────────────┼──────────────┤
     │                │                │              │              │
     │                │  navigate('/dashboard')       │              │
     │                │                │              │              │
     │  Redirect to Dashboard          │              │              │
     │<───────────────┤                │              │              │
     │                │                │              │              │
     ▼                ▼                ▼              ▼              ▼


VALIDATION RULES:
══════════════════

Name:
✓ Required
✓ Min length: 2 characters
✓ Max length: 100 characters
✓ Only letters, spaces, hyphens

Email:
✓ Required
✓ Valid email format (regex)
✓ Unique (checked by Firebase)

Password:
✓ Required
✓ Min length: 6 characters
✓ Max length: 128 characters

Student ID (Optional):
✓ Min length: 5 characters
✓ Max length: 20 characters
✓ Alphanumeric only

Department (Optional):
✓ Max length: 100 characters

Year (Optional):
✓ Must be one of: ["1st Year", "2nd Year", "3rd Year", "4th Year"]


DATA SAVED TO FIRESTORE:
══════════════════════════

User Profile Document:
{
  id: "firebase-uid-abc123",
  email: "john@example.com",
  name: "John Doe",
  studentId: "STU001",
  department: "Computer Science",
  year: "3rd Year",
  isAdmin: false,
  createdAt: Timestamp(2024-12-25 10:30:00)
}

Firestore Path:
users/{userId}


SECURITY:
═════════

✓ Password hashed by Firebase (bcrypt)
✓ HTTPS-only communication
✓ Email verification available (optional)
✓ Rate limiting on signup attempts
✓ CAPTCHA protection (can be added)
✓ Input sanitization
✓ XSS prevention


FIREBASE AUTH RECORD:
══════════════════════

{
  uid: "abc123xyz",
  email: "john@example.com",
  emailVerified: false,
  displayName: "John Doe",
  photoURL: null,
  disabled: false,
  metadata: {
    creationTime: "2024-12-25T10:30:00Z",
    lastSignInTime: "2024-12-25T10:30:00Z"
  },
  providerData: [
    {
      uid: "john@example.com",
      email: "john@example.com",
      providerId: "password"
    }
  ]
}


SUCCESS FLOW SUMMARY:
══════════════════════

1. User fills signup form
2. Frontend validates input
3. Firebase Auth creates user account
4. Password hashed and stored
5. UID generated
6. User profile created in Firestore
7. User logged in automatically
8. Redirect to dashboard
9. Welcome message displayed
10. User can start chatting with AI
```

---

**This sequence diagram shows the complete user signup flow including validation, error handling, and Google OAuth alternative.**

**Next: Sequence Diagram 6 - Admin Analytics Dashboard**
