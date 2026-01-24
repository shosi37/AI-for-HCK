# Diagram 1: System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HCK COLLEGE AI CHATBOT SYSTEM                        │
│                    (React + TypeScript + Tailwind CSS)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
          │   FRONTEND      │ │   BACKEND   │ │   AI & NLP      │
          │   (React App)   │ │  (Firebase) │ │   (OpenAI)      │
          └─────────────────┘ └─────────────┘ └─────────────────┘
                    │                 │                 │
                    │                 │                 │
        ┌───────────┼────────┐       │       ┌─────────┼─────────┐
        │           │        │       │       │         │         │
        ▼           ▼        ▼       ▼       ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────┐ ┌────┐ ┌────────┐ ┌─────┐ ┌──────┐
   │Landing │ │ Login  │ │Chat│ │Auth│ │Firestore│GPT-4│ │ NLP  │
   │  Page  │ │ Signup │ │ UI │ │    │ │Database │     │ │Engine│
   └────────┘ └────────┘ └────┘ └────┘ └────────┘ └─────┘ └──────┘
        │           │        │       │       │         │         │
        └───────────┴────────┴───────┴───────┴─────────┴─────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   USER EXPERIENCE     │
                          │                       │
                          │ • Dark/Light Theme    │
                          │ • Responsive Design   │
                          │ • Real-time Sync      │
                          │ • AI-Powered Chat     │
                          │ • Admin Dashboard     │
                          └───────────────────────┘


KEY COMPONENTS:
═══════════════

FRONTEND:
• React 18+ with TypeScript
• Tailwind CSS v4 for styling
• Theme Provider (Dark/Light mode)
• Protected Routes
• Real-time UI updates

BACKEND:
• Firebase Authentication (Email + Google OAuth)
• Firebase Firestore (NoSQL Database)
• Real-time data synchronization
• Secure API endpoints

AI & NLP:
• OpenAI GPT-4 / GPT-3.5-turbo
• Natural Language Processing
• Intent Classification
• Semantic Search
• Context-aware responses


DATA FLOW:
══════════

User Input → Frontend → Backend (Firebase) → AI (OpenAI) → Response → Frontend → User


MAIN FEATURES:
═══════════════

1. Authentication:
   • Email/Password login
   • Google OAuth 2.0 with ID token
   • Admin authentication

2. Chat System:
   • AI-powered responses
   • Chat history
   • Feedback mechanism
   • Quick topic suggestions

3. Admin Panel:
   • FAQ management
   • User management
   • Analytics dashboard
   • Real-time sync

4. Theme System:
   • Complete dark/light mode
   • Gradient blob backgrounds
   • Smooth transitions
```

---

**This diagram shows the high-level architecture of the entire HCK College AI Chatbot system.**

**Next: Diagram 2 - Frontend Layer (Detailed Component Structure)**
