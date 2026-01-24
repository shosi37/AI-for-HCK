# HCK College AI Chatbot - Functional Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HCK COLLEGE AI CHATBOT SYSTEM                        │
│                    (React + TypeScript + Tailwind CSS)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. FRONTEND LAYER (React Application)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Landing   │  │    Login    │  │   Signup    │  │    Admin    │   │
│  │    Page     │  │    Page     │  │    Page     │  │    Login    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AUTHENTICATED AREA                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │Dashboard │  │   Chat   │  │ Profile  │  │  Admin   │        │   │
│  │  │          │  │Interface │  │  Edit    │  │  Panel   │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                                                                   │   │
│  │  Chat Features:                      Admin Features:             │   │
│  │  • Chat History                      • FAQ Management            │   │
│  │  • New Chat                          • User Management           │   │
│  │  • Quick Topics                      • Analytics Dashboard       │   │
│  │  • Helpful/Not Helpful               • AI Accuracy Graphs        │   │
│  │  • Real-time Messaging               • Real-time Data Sync       │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              THEME SYSTEM (ThemeProvider)                        │   │
│  │  • ThemeContext                                                   │   │
│  │  • ThemeToggle Component                                          │   │
│  │  • Dark/Light Mode (Global)                                       │   │
│  │  • Gradient Blob Backgrounds                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. AUTHENTICATION LAYER (Firebase Auth)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION SYSTEM                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │              FIREBASE AUTHENTICATION                         │        │
│  ├─────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │  Authentication Methods:                                     │        │
│  │                                                               │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │   1. EMAIL/PASSWORD AUTHENTICATION                 │     │        │
│  │  ├────────────────────────────────────────────────────┤     │        │
│  │  │   • User registers with email + password           │     │        │
│  │  │   • Password hashing & validation (min 6 chars)    │     │        │
│  │  │   • Secure login with credentials                  │     │        │
│  │  │   • Session management                             │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  │                                                               │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │   2. GOOGLE OAUTH 2.0 AUTHENTICATION               │     │        │
│  │  ├────────────────────────────────────────────────────┤     │        │
│  │  │   Flow:                                             │     │        │
│  │  │   1. User clicks "Continue with Google"            │     │        │
│  │  │   2. OAuth popup opens (Google consent screen)     │     │        │
│  │  │   3. User selects Google account                   │     │        │
│  │  │   4. Firebase receives OAuth response              │     │        │
│  │  │   5. ID Token generated & logged to console        │     │        │
│  │  │   6. User profile created/updated in Firestore     │     │        │
│  │  │                                                      │     │        │
│  │  │   Scopes Requested:                                 │     │        │
│  │  │   • profile (name, photo)                           │     │        │
│  │  │   • email (email address)                           │     │        │
│  │  │                                                      │     │        │
│  │  │   OAuth Token Structure:                            │     │        │
│  │  │   ┌──────────────────────────────────────────┐     │     │        │
│  │  │   │ ID TOKEN (JWT)                            │     │     │        │
│  │  │   ├──────────────────────────────────────────┤     │     │        │
│  │  │   │ Header:                                   │     │     │        │
│  │  │   │   • Algorithm (RS256)                     │     │     │        │
│  │  │   │   • Type (JWT)                            │     │     │        │
│  │  │   │                                            │     │     │        │
│  │  │   │ Payload:                                  │     │     │        │
│  │  │   │   • iss: accounts.google.com              │     │     │        │
│  │  │   │   • sub: User ID                          │     │     │        │
│  │  │   │   • email: user@example.com               │     │     │        │
│  │  │   │   • name: User Name                       │     │     │        │
│  │  │   │   • picture: Profile URL                  │     │     │        │
│  │  │   │   • iat: Issued at timestamp              │     │     │        │
│  │  │   │   • exp: Expiration timestamp             │     │     │        │
│  │  │   │                                            │     │     │        │
│  │  │   │ Signature:                                │     │     │        │
│  │  │   │   • Cryptographic signature               │     │     │        │
│  │  │   └──────────────────────────────────────────┘     │     │        │
│  │  │                                                      │     │        │
│  │  │   Token Usage:                                      │     │        │
│  │  │   • Frontend: User authentication                   │     │        │
│  │  │   • Backend: API authorization                      │     │        │
│  │  │   • Logged to console for debugging                 │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  │                                                               │        │
│  │  ┌────────────────────────────────────────────────────┐     │        │
│  │  │   3. ADMIN AUTHENTICATION                          │     │        │
│  │  ├────────────────────────────────────────────────────┤     │        │
│  │  │   Option 1: Admin Login Page                       │     │        │
│  │  │     • Username: "admin"                            │     │        │
│  │  │     • Password: "admin"                            │     │        │
│  │  │                                                      │     │        │
│  │  │   Option 2: Regular Login with Admin Credentials   │     │        │
│  │  │     • Email: "admin@hck.edu"                       │     │        │
│  │  │     • Password: "admin"                            │     │        │
│  │  └────────────────────────────────────────────────────┘     │        │
│  │                                                               │        │
│  │  Session Management:                                         │        │
│  │  • JWT tokens stored in browser                             │        │
│  │  • Auto-refresh on expiry                                   │        │
│  │  • Secure logout (token invalidation)                       │        │
│  │                                                               │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. BACKEND & DATABASE LAYER (Firebase Firestore)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE DATABASE                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Collections:                                                             │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  1. USERS COLLECTION                                        │         │
│  ├────────────────────────────────────────────────────────────┤         │
│  │  Document ID: {userId}                                      │         │
│  │  {                                                           │         │
│  │    id: string,                                              │         │
│  │    email: string,                                           │         │
│  │    name: string,                                            │         │
│  │    studentId?: string,                                      │         │
│  │    department?: string,                                     │         │
│  │    year?: string,                                           │         │
│  │    phone?: string,                                          │         │
│  │    bio?: string,                                            │         │
│  │    isAdmin: boolean,                                        │         │
│  │    createdAt: timestamp,                                    │         │
│  │    lastLogin?: timestamp                                    │         │
│  │  }                                                           │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  2. CHATS COLLECTION                                        │         │
│  ├────────────────────────────────────────────────────────────┤         │
│  │  Document ID: {chatId}                                      │         │
│  │  {                                                           │         │
│  │    id: string,                                              │         │
│  │    userId: string,                                          │         │
│  │    title: string,                                           │         │
│  │    messages: [                                              │         │
│  │      {                                                       │         │
│  │        id: string,                                          │         │
│  │        content: string,                                     │         │
│  │        sender: 'user' | 'ai',                               │         │
│  │        timestamp: timestamp,                                │         │
│  │        feedback?: 'helpful' | 'not-helpful'                 │         │
│  │      }                                                       │         │
│  │    ],                                                        │         │
│  │    createdAt: timestamp,                                    │         │
│  │    updatedAt: timestamp                                     │         │
│  │  }                                                           │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  3. FAQS COLLECTION                                         │         │
│  ├────────────────────────────────────────────────────────────┤         │
│  │  Document ID: {faqId}                                       │         │
│  │  {                                                           │         │
│  │    id: string,                                              │         │
│  │    question: string,                                        │         │
│  │    answer: string,                                          │         │
│  │    category: string,                                        │         │
│  │    keywords: string[],                                      │         │
│  │    createdAt: timestamp,                                    │         │
│  │    updatedAt: timestamp                                     │         │
│  │  }                                                           │         │
│  │                                                              │         │
│  │  Categories:                                                │         │
│  │  • Admissions                                               │         │
│  │  • Courses                                                  │         │
│  │  • Library                                                  │         │
│  │  • Fees                                                     │         │
│  │  • Hostel                                                   │         │
│  │  • Events                                                   │         │
│  │  • Placements                                               │         │
│  │  • Contact                                                  │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  4. ANALYTICS COLLECTION                                    │         │
│  ├────────────────────────────────────────────────────────────┤         │
│  │  Document ID: {date}                                        │         │
│  │  {                                                           │         │
│  │    date: string,                                            │         │
│  │    totalQueries: number,                                    │         │
│  │    helpfulResponses: number,                                │         │
│  │    notHelpfulResponses: number,                             │         │
│  │    accuracy: number,                                        │         │
│  │    activeUsers: number,                                     │         │
│  │    categoryBreakdown: {                                     │         │
│  │      admissions: number,                                    │         │
│  │      courses: number,                                       │         │
│  │      library: number,                                       │         │
│  │      fees: number,                                          │         │
│  │      hostel: number,                                        │         │
│  │      events: number,                                        │         │
│  │      placements: number,                                    │         │
│  │      contact: number                                        │         │
│  │    }                                                         │         │
│  │  }                                                           │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  Real-time Sync:                                                         │
│  • Admin changes sync instantly to user interface                        │
│  • Chat history updates in real-time                                     │
│  • Analytics dashboard live updates                                      │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. AI & NLP LAYER (OpenAI Integration)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    AI & NATURAL LANGUAGE PROCESSING                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │              OPENAI GPT API INTEGRATION                      │        │
│  ├─────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │  Model: GPT-4 / GPT-3.5-turbo                               │        │
│  │  Purpose: Generate intelligent responses to student queries │        │
│  │                                                               │        │
│  │  ┌───────────────────────────────────────────────────┐      │        │
│  │  │  CHAT FLOW WITH NLP                                │      │        │
│  │  ├───────────────────────────────────────────────────┤      │        │
│  │  │                                                     │      │        │
│  │  │  1. USER INPUT                                     │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     Student types question in chat interface       │      │        │
│  │  │     Example: "What are the library hours?"         │      │        │
│  │  │                                                     │      │        │
│  │  │  2. PREPROCESSING                                  │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     • Input sanitization                           │      │        │
│  │  │     • Context extraction from chat history         │      │        │
│  │  │     • Intent classification (NLP)                  │      │        │
│  │  │                                                     │      │        │
│  │  │  3. FAQ MATCHING (Smart Search)                    │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     • Keyword extraction                           │      │        │
│  │  │     • Semantic similarity matching                 │      │        │
│  │  │     • Search Firestore FAQ collection             │      │        │
│  │  │     • Category filtering                           │      │        │
│  │  │                                                     │      │        │
│  │  │  4. CONTEXT BUILDING                               │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     Build prompt for OpenAI:                       │      │        │
│  │  │     ┌─────────────────────────────────────┐       │      │        │
│  │  │     │ System Prompt:                       │       │      │        │
│  │  │     │ "You are an AI assistant for HCK    │       │      │        │
│  │  │     │  College. Help students with:        │       │      │        │
│  │  │     │  - Admissions information            │       │      │        │
│  │  │     │  - Course details                    │       │      │        │
│  │  │     │  - Library hours & facilities        │       │      │        │
│  │  │     │  - Fee structure                     │       │      │        │
│  │  │     │  - Hostel information                │       │      │        │
│  │  │     │  - Campus events                     │       │      │        │
│  │  │     │  - Placement opportunities           │       │      │        │
│  │  │     │  - Contact information               │       │      │        │
│  │  │     │                                       │       │      │        │
│  │  │     │  Be helpful, accurate, and friendly."│       │      │        │
│  │  │     └─────────────────────────────────────┘       │      │        │
│  │  │     ┌─────────────────────────────────────┐       │      │        │
│  │  │     │ Context (from matched FAQs):         │       │      │        │
│  │  │     │ [Relevant FAQ answers from database] │       │      │        │
│  │  │     └─────────────────────────────────────┘       │      │        │
│  │  │     ┌─────────────────────────────────────┐       │      │        │
│  │  │     │ Chat History (last 5 messages):      │       │      │        │
│  │  │     │ [Previous conversation context]      │       │      │        │
│  │  │     └─────────────────────────────────────┘       │      │        │
│  │  │     ┌─────────────────────────────────────┐       │      │        │
│  │  │     │ User Question:                       │       │      │        │
│  │  │     │ "What are the library hours?"        │       │      │        │
│  │  │     └─────────────────────────────────────┘       │      │        │
│  │  │                                                     │      │        │
│  │  │  5. OPENAI API REQUEST                             │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     POST https://api.openai.com/v1/chat/completions│      │        │
│  │  │     Headers:                                        │      │        │
│  │  │       Authorization: Bearer {OPENAI_API_KEY}       │      │        │
│  │  │       Content-Type: application/json               │      │        │
│  │  │     Body:                                           │      │        │
│  │  │       {                                             │      │        │
│  │  │         "model": "gpt-4",                           │      │        │
│  │  │         "messages": [                               │      │        │
│  │  │           {                                         │      │        │
│  │  │             "role": "system",                       │      │        │
│  │  │             "content": "{system_prompt}"            │      │        │
│  │  │           },                                        │      │        │
│  │  │           {                                         │      │        │
│  │  │             "role": "user",                         │      │        │
│  │  │             "content": "{user_question}"            │      │        │
│  │  │           }                                         │      │        │
│  │  │         ],                                          │      │        │
│  │  │         "temperature": 0.7,                         │      │        │
│  │  │         "max_tokens": 500                           │      │        │
│  │  │       }                                             │      │        │
│  │  │                                                     │      │        │
│  │  │  6. NLP PROCESSING (OpenAI)                        │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     • Intent understanding                         │      │        │
│  │  │     • Entity extraction                            │      │        │
│  │  │     • Context-aware response generation            │      │        │
│  │  │     • Natural language synthesis                   │      │        │
│  │  │                                                     │      │        │
│  │  │  7. RESPONSE GENERATION                            │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     OpenAI returns:                                │      │        │
│  │  │     {                                               │      │        │
│  │  │       "id": "chatcmpl-...",                         │      │        │
│  │  │       "object": "chat.completion",                  │      │        │
│  │  │       "created": 1234567890,                        │      │        │
│  │  │       "model": "gpt-4",                             │      │        │
│  │  │       "choices": [                                  │      │        │
│  │  │         {                                           │      │        │
│  │  │           "message": {                              │      │        │
│  │  │             "role": "assistant",                    │      │        │
│  │  │             "content": "The HCK College library..." │      │        │
│  │  │           },                                        │      │        │
│  │  │           "finish_reason": "stop"                   │      │        │
│  │  │         }                                           │      │        │
│  │  │       ]                                             │      │        │
│  │  │     }                                               │      │        │
│  │  │                                                     │      │        │
│  │  │  8. POSTPROCESSING                                 │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     • Format response (Markdown support)           │      │        │
│  │  │     • Add helpful links/references                 │      │        │
│  │  │     • Attach feedback buttons                      │      │        │
│  │  │                                                     │      │        │
│  │  │  9. SAVE TO FIRESTORE                              │      │        │
│  │  │     ↓                                               │      │        │
│  │  │     • Save user message                            │      │        │
│  │  │     • Save AI response                             │      │        │
│  │  │     • Update chat history                          │      │        │
│  │  │     • Track analytics                              │      │        │
│  │  │                                                     │      │        │
│  │  │  10. DISPLAY TO USER                               │      │        │
│  │  │      ↓                                              │      │        │
│  │  │      Show AI response in chat interface            │      │        │
│  │  │      with "Helpful" / "Not Helpful" buttons        │      │        │
│  │  │                                                     │      │        │
│  │  └───────────────────────────────────────────────────┘      │        │
│  │                                                               │        │
│  │  NLP Capabilities:                                           │        │
│  │  ✓ Intent Classification                                     │        │
│  │  ✓ Entity Recognition                                        │        │
│  │  ✓ Sentiment Analysis                                        │        │
│  │  ✓ Context Understanding                                     │        │
│  │  ✓ Multi-turn Conversations                                  │        │
│  │  ✓ Semantic Search                                           │        │
│  │  ✓ Query Expansion                                           │        │
│  │                                                               │        │
│  │  Response Quality:                                           │        │
│  │  • Contextually relevant                                     │        │
│  │  • Grammatically correct                                     │        │
│  │  • College-specific information                              │        │
│  │  • Friendly and helpful tone                                 │        │
│  │                                                               │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. DATA FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE DATA FLOW                               │
└──────────────────────────────────────────────────────────────────────────┘

USER AUTHENTICATION FLOW:
════════════════════════

┌─────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────┐
│  User   │────────▶│  Login/      │────────▶│   Firebase   │────────▶│ Firestore│
│         │         │  Signup      │         │     Auth     │         │   User   │
│         │         │  Component   │         │              │         │   Doc    │
└─────────┘         └──────────────┘         └──────────────┘         └──────────┘
                            │
                            │ OAuth Option
                            ▼
                    ┌──────────────┐
                    │   Google     │
                    │  OAuth 2.0   │
                    │              │
                    │ Returns:     │
                    │ • ID Token   │
                    │ • Profile    │
                    └──────────────┘


CHAT MESSAGE FLOW:
═══════════════════

┌─────────┐   1. User Types    ┌──────────────┐   2. Store Message   ┌──────────┐
│  User   │──────────────────▶ │     Chat     │────────────────────▶ │ Firestore│
│         │                     │  Component   │                      │   Chats  │
└─────────┘                     └──────────────┘                      └──────────┘
    ▲                                   │
    │                                   │ 3. Send to AI
    │                                   ▼
    │                           ┌──────────────┐   4. FAQ Search     ┌──────────┐
    │                           │   OpenAI     │◀──────────────────  │ Firestore│
    │                           │   API NLP    │                     │   FAQs   │
    │                           └──────────────┘                     └──────────┘
    │                                   │
    │ 7. Display Response               │ 5. Generate Response
    │                                   ▼
    │                           ┌──────────────┐   6. Save AI Reply  ┌──────────┐
    └───────────────────────────│     Chat     │────────────────────▶│ Firestore│
                                │  Component   │                      │   Chats  │
                                └──────────────┘                      └──────────┘
                                        │
                                        │ 8. User Feedback
                                        ▼
                                ┌──────────────┐   9. Track Metrics  ┌──────────┐
                                │   Helpful/   │────────────────────▶│ Firestore│
                                │  Not Helpful │                      │ Analytics│
                                └──────────────┘                      └──────────┘


ADMIN PANEL DATA FLOW:
═══════════════════════

┌─────────┐   Login Admin     ┌──────────────┐   Check Admin Role  ┌──────────┐
│  Admin  │──────────────────▶│    Admin     │────────────────────▶│ Firestore│
│         │                    │    Login     │                     │   Users  │
└─────────┘                    └──────────────┘                     └──────────┘
    │                                  │
    │ Access Granted                   │
    ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     FAQ     │  │    User     │  │  Analytics  │         │
│  │ Management  │  │ Management  │  │  Dashboard  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                 │                 │                │
│         ▼                 ▼                 ▼                │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐            │
│  │ Firestore│     │ Firestore│     │ Firestore│            │
│  │   FAQs   │     │   Users  │     │ Analytics│            │
│  └──────────┘     └──────────┘     └──────────┘            │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                   │
│                  Real-time Sync                              │
│                           ▼                                   │
│                    ┌──────────────┐                          │
│                    │  User Chat   │                          │
│                    │  Interface   │                          │
│                    └──────────────┘                          │
│                                                               │
└───────────────────────────────────────────���──────────────────┘
```

---

## 6. SYSTEM COMPONENTS BREAKDOWN

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT ARCHITECTURE                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FRONTEND COMPONENTS:                                                     │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │ /App.tsx                 - Main application router          │         │
│  │ /components/Landing.tsx  - Landing page                     │         │
│  │ /components/Login.tsx    - Login with email/Google OAuth   │         │
│  │ /components/Signup.tsx   - Signup with email/Google OAuth  │         │
│  │ /components/AdminLogin.tsx - Admin authentication          │         │
│  │ /components/Dashboard.tsx  - User dashboard                │         │
│  │ /components/Chat.tsx       - Chat interface with AI        │         │
│  │ /components/ProfileEdit.tsx - User profile management      │         │
│  │ /components/AdminPanel.tsx  - Admin control panel          │         │
│  │ /components/ThemeToggle.tsx - Dark/Light mode toggle       │         │
│  │ /contexts/ThemeContext.tsx  - Theme state management       │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  FIREBASE UTILITIES:                                                      │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │ /utils/firebase/config.ts  - Firebase configuration        │         │
│  │ /utils/firebase/auth.ts    - Authentication functions      │         │
│  │ /utils/firebase/db.ts      - Firestore database operations │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
│  STYLING:                                                                 │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │ /styles/globals.css        - Global styles & theme tokens  │         │
│  │                            - Tailwind CSS configuration    │         │
│  │                            - Dark/Light mode variables     │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. SECURITY & BEST PRACTICES

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     SECURITY IMPLEMENTATION                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  AUTHENTICATION SECURITY:                                                 │
│  ✓ Firebase Auth handles password hashing (bcrypt)                       │
│  ✓ OAuth 2.0 for Google Sign-In (industry standard)                      │
│  ✓ ID tokens for secure session management                               │
│  ✓ JWT tokens with expiration                                            │
│  ✓ HTTPS-only communication                                              │
│                                                                           │
│  DATA SECURITY:                                                           │
│  ✓ Firestore security rules (user can only access own data)              │
│  ✓ Admin role validation                                                 │
│  ✓ Input sanitization for XSS prevention                                 │
│  ✓ API key environment variables                                         │
│                                                                           │
│  API SECURITY:                                                            │
│  ✓ OpenAI API key stored securely                                        │
│  ✓ Rate limiting on API calls                                            │
│  ✓ Request validation                                                    │
│  ✓ Error handling without exposing sensitive info                        │
│                                                                           │
│  PRIVACY:                                                                 │
│  ✓ User data encryption at rest (Firebase)                               │
│  ✓ Minimal data collection                                               │
│  ✓ OAuth tokens logged only in development                               │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. KEY FEATURES SUMMARY

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          FEATURE OVERVIEW                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  AUTHENTICATION:                                                          │
│  ✓ Email/Password authentication                                         │
│  ✓ Google OAuth 2.0 with ID token                                        │
│  ✓ Admin authentication (dual access)                                    │
│  ✓ Secure session management                                             │
│                                                                           │
│  CHAT FEATURES:                                                           │
│  ✓ AI-powered responses (OpenAI GPT + NLP)                                │
│  ✓ Chat history management                                               │
│  ✓ New chat creation                                                     │
│  ✓ Quick topic suggestions                                               │
│  ✓ Helpful/Not Helpful feedback                                          │
│  ✓ Real-time messaging                                                   │
│  ✓ Context-aware conversations                                           │
│                                                                           │
│  ADMIN PANEL:                                                             │
│  ✓ FAQ management (CRUD operations)                                      │
│  ✓ User management                                                       │
│  ✓ Analytics dashboard                                                   │
│  ✓ AI accuracy graphs                                                    │
│  ✓ Real-time data synchronization                                        │
│                                                                           │
│  UI/UX:                                                                   │
│  ✓ Complete dark/light theme system                                      │
│  ✓ Gradient blob backgrounds                                             │
│  ✓ Responsive design                                                     │
│  ✓ Smooth transitions                                                    │
│  ✓ Modern, clean interface                                               │
│                                                                           │
│  TOPICS COVERED:                                                          │
│  • Admissions                                                             │
│  • Courses                                                                │
│  • Library hours                                                          │
│  • Fee structure                                                          │
│  • Hostel facilities                                                      │
│  • Campus events                                                          │
│  • Placement opportunities                                                │
│  • Contact information                                                    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. TECHNOLOGY STACK

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          TECHNOLOGY STACK                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FRONTEND:                                                                │
│  • React 18+ (UI Framework)                                               │
│  • TypeScript (Type Safety)                                               │
│  • React Router (Navigation)                                              │
│  • Tailwind CSS v4 (Styling)                                              │
│  • Lucide React (Icons)                                                   │
│  • Recharts (Analytics Graphs)                                            │
│                                                                           │
│  BACKEND & DATABASE:                                                      │
│  • Firebase Authentication (User management)                              │
│  • Firebase Firestore (NoSQL Database)                                    │
│  • Firebase Hosting (Deployment - optional)                               │
│                                                                           │
│  AI & NLP:                                                                │
│  • OpenAI GPT-4 / GPT-3.5-turbo (Language Model)                          │
│  • OpenAI Chat Completions API                                            │
│  • Natural Language Processing                                            │
│  • Semantic Search & Matching                                             │
│                                                                           │
│  AUTHENTICATION:                                                          │
│  • Firebase Auth (Email/Password)                                         │
│  • Google OAuth 2.0                                                       │
│  • JWT Tokens                                                             │
│                                                                           │
│  DEVELOPMENT:                                                             │
│  • Vite (Build Tool)                                                      │
│  • ESLint (Code Quality)                                                  │
│  • Git (Version Control)                                                  │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 10. DEPLOYMENT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │                    CLIENT BROWSER                           │         │
│  │  (React App with Tailwind CSS + Theme System)              │         │
│  └────────────────────────────────────────────────────────────┘         │
│                              │                                            │
│                              │ HTTPS                                      │
│                              ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │              HOSTING PLATFORM                               │         │
│  │  • Firebase Hosting / Vercel / Netlify                     │         │
│  │  • CDN Distribution                                         │         │
│  │  • SSL/TLS Encryption                                       │         │
│  └────────────────────────────────────────────────────────────┘         │
│                              │                                            │
│        ┌─────────────────────┼─────────────────────┐                    │
│        │                     │                     │                     │
│        ▼                     ▼                     ▼                     │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐                │
│  │ Firebase │         │ Firebase │         │  OpenAI  │                │
│  │   Auth   │         │Firestore │         │   API    │                │
│  │          │         │          │         │          │                │
│  │ • Email  │         │ • Users  │         │ • GPT-4  │                │
│  │ • Google │         │ • Chats  │         │ • NLP    │                │
│  │   OAuth  │         │ • FAQs   │         │          │                │
│  │ • Tokens │         │ • Analytics       │                │
│  └──────────┘         └──────────┘         └──────────┘                │
│                                                                           │
│  ENVIRONMENT VARIABLES:                                                   │
│  • VITE_FIREBASE_API_KEY                                                 │
│  • VITE_FIREBASE_AUTH_DOMAIN                                             │
│  • VITE_FIREBASE_PROJECT_ID                                              │
│  • VITE_OPENAI_API_KEY                                                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## NOTES:

1. **OAuth ID Token**: Logged to browser console for debugging and backend integration
2. **Real-time Sync**: Admin changes instantly reflect in user interface via Firestore listeners
3. **NLP Processing**: OpenAI handles intent classification, entity recognition, and response generation
4. **Scalability**: Firebase auto-scales based on traffic
5. **Theme System**: Global dark/light mode with gradient blob backgrounds throughout entire app
6. **Security**: All sensitive data encrypted, API keys in environment variables
7. **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Application**: HCK College AI Chatbot  
**Framework**: React + TypeScript + Firebase + OpenAI
