# Sequence Diagram 1: Email/Password Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   User   │     │  Login   │     │   Firebase   │     │  Firestore   │     │Dashboard │
│          │     │Component │     │     Auth     │     │   Database   │     │   Page   │
└────┬─────┘     └────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                │                   │                    │                   │
     │  Navigate to   │                   │                    │                   │
     │  /login        │                   │                    │                   │
     │───────────────>│                   │                    │                   │
     │                │                   │                    │                   │
     │                │  Display Login    │                    │                   │
     │                │  Form             │                    │                   │
     │<───────────────│                   │                    │                   │
     │                │                   │                    │                   │
     │  Enter Email   │                   │                    │                   │
     │  & Password    │                   │                    │                   │
     │───────────────>│                   │                    │                   │
     │                │                   │                    │                   │
     │  Click Login   │                   │                    │                   │
     │───────────────>│                   │                    │                   │
     │                │                   │                    │                   │
     │                │  Validate Input   │                    │                   │
     │                │  (Check empty)    │                    │                   │
     │                │                   │                    │                   │
     │                │  signIn()         │                    │                   │
     │                │  email, password  │                    │                   │
     │                │──────────────────>│                    │                   │
     │                │                   │                    │                   │
     │                │                   │  Verify Password   │                   │
     │                │                   │  (bcrypt hash)     │                   │
     │                │                   │                    │                   │
     │                │                   │  Check User Exists │                   │
     │                │                   │  in Auth System    │                   │
     │                │                   │                    │                   │
     │                │  Return User      │                    │                   │
     │                │  Credentials      │                    │                   │
     │                │<──────────────────│                    │                   │
     │                │                   │                    │                   │
     │                │  getUserProfile() │                    │                   │
     │                │  userId           │                    │                   │
     │                │───────────────────┼───────────────────>│                   │
     │                │                   │                    │                   │
     │                │                   │  Query Firestore   │                   │
     │                │                   │  users/{userId}    │                   │
     │                │                   │                    │                   │
     │                │  Return User Data │                    │                   │
     │                │  (name, email,    │                    │                   │
     │                │   studentId, etc) │                    │                   │
     │                │<──────────────────┼────────────────────│                   │
     │                │                   │                    │                   │
     │                │  onLogin(user)    │                    │                   │
     │                │  Save to App      │                    │                   │
     │                │  State            │                    │                   │
     │                │                   │                    │                   │
     │                │  navigate('/dashboard')                │                   │
     │                │───────────────────┼────────────────────┼──────────────────>│
     │                │                   │                    │                   │
     │  Redirect to   │                   │                    │                   │
     │  Dashboard     │                   │                    │                   │
     │<───────────────┼───────────────────┼────────────────────┼───────────────────│
     │                │                   │                    │                   │
     │  Display       │                   │                    │                   │
     │  Dashboard     │                   │                    │                   │
     │  with User     │                   │                    │                   │
     │  Profile       │                   │                    │                   │
     │<───────────────┼───────────────────┼────────────────────┼───────────────────│
     │                │                   │                    │                   │
     ▼                ▼                   ▼                    ▼                   ▼


ERROR HANDLING FLOW:
═════════════════════

If Invalid Credentials:

┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │     │  Login   │     │   Firebase   │
│          │     │Component │     │     Auth     │
└────┬─────┘     └────┬─────┘     └──────┬───────┘
     │                │                   │
     │  Wrong Email/  │                   │
     │  Password      │                   │
     │───────────────>│                   │
     │                │                   │
     │                │  signIn()         │
     │                │──────────────────>│
     │                │                   │
     │                │  Error:           │
     │                │  auth/wrong-      │
     │                │  password         │
     │                │<──────────────────│
     │                │                   │
     │                │  Display Error:   │
     │                │  "Invalid email   │
     │                │  or password"     │
     │<───────────────│                   │
     │                │                   │
     ▼                ▼                   ▼


ADMIN LOGIN VARIATION:
══════════════════════

If user email is "admin@hck.edu":

┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Admin   │     │  Login   │     │  Firestore   │     │  Admin   │
│          │     │Component │     │   Database   │     │  Panel   │
└────┬─────┘     └────┬─────┘     └──────┬───────┘     └────┬─────┘
     │                │                   │                   │
     │  Login with    │                   │                   │
     │  admin@hck.edu │                   │                   │
     │───────────────>│                   │                   │
     │                │                   │                   │
     │                │  Check isAdmin    │                   │
     │                │  field            │                   │
     │                │──────────────────>│                   │
     │                │                   │                   │
     │                │  isAdmin: true    │                   │
     │                │<──────────────────│                   │
     │                │                   │                   │
     │                │  Redirect to      │                   │
     │                │  /admin           │                   │
     │                │───────────────────┼──────────────────>│
     │                │                   │                   │
     ▼                ▼                   ▼                   ▼


KEY STEPS:
══════════

1. User navigates to /login
2. User enters email and password
3. Frontend validates input (not empty, email format)
4. Frontend calls Firebase Auth signIn()
5. Firebase verifies credentials (password hash)
6. Firebase returns user credentials
7. Frontend fetches user profile from Firestore
8. Frontend saves user to App state (onLogin)
9. Frontend redirects to /dashboard (or /admin for admin users)
10. User sees dashboard with their profile


DATA STRUCTURES:
════════════════

Login Request:
{
  email: "student@example.com",
  password: "password123"
}

Firebase Auth Response:
{
  user: {
    uid: "abc123xyz",
    email: "student@example.com",
    emailVerified: true
  }
}

Firestore User Profile:
{
  id: "abc123xyz",
  email: "student@example.com",
  name: "John Doe",
  studentId: "STU001",
  department: "Computer Science",
  year: "3rd Year",
  isAdmin: false,
  createdAt: Timestamp
}


SECURITY:
═════════

• Passwords hashed with bcrypt by Firebase
• HTTPS-only communication
• JWT tokens for session management
• Firestore security rules prevent unauthorized access
• Input validation on frontend and backend
```

---

**This sequence diagram shows the complete flow of email/password authentication.**

**Next: Sequence Diagram 2 - Google OAuth Login Flow**
