# Sequence Diagram 4: Admin FAQ Management Flow

```
┌───────┐  ┌───────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Admin │  │ Admin │  │Firebase│  │Firestore│ │Real-time│ │  User  │
│       │  │ Panel │  │  Auth  │  │   DB   │  │  Sync  │  │  Chat  │
└───┬───┘  └───┬───┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘
    │          │          │           │           │           │
    │ Navigate to /admin  │           │           │           │
    │─────────>│          │           │           │           │
    │          │          │           │           │           │
    │          │ Check Admin Auth      │           │           │
    │          │─────────>│           │           │           │
    │          │          │           │           │           │
    │          │ Verify Admin Role     │           │           │
    │          │<─────────┤           │           │           │
    │          │          │           │           │           │
    │          │ Load Admin Panel      │           │           │
    │<─────────┤          │           │           │           │
    │          │          │           │           │           │


═══════════════════════════════════════════════════════════════════════
SCENARIO 1: CREATE NEW FAQ
═══════════════════════════════════════════════════════════════════════

    │          │          │           │           │           │
    │ Click "Add New FAQ" │           │           │           │
    │─────────>│          │           │           │           │
    │          │          │           │           │           │
    │          │ Show FAQ Form Modal   │           │           │
    │<─────────┤          │           │           │           │
    │          │          │           │           │           │
    │ Fill Form:          │           │           │           │
    │ • Question: "What are the admission dates?"  │           │
    │ • Answer: "Admissions open on June 1, 2024..." │         │
    │ • Category: "Admissions"                      │           │
    │ • Keywords: ["admission", "dates", "june"]    │           │
    │─────────>│          │           │           │           │
    │          │          │           │           │           │
    │ Click "Save"        │           │           │           │
    │─────────>│          │           │           │           │
    │          │          │           │           │           │
    │          │ Validate Input        │           │           │
    │          │ • Check required fields           │           │
    │          │ • Validate category   │           │           │
    │          │ • Validate keywords   │           │           │
    │          │          │           │           │           │
    │          │ Create FAQ Object     │           │           │
    │          │ {                     │           │           │
    │          │   id: uuid(),         │           │           │
    │          │   question: "What are...",        │           │
    │          │   answer: "Admissions open...",   │           │
    │          │   category: "Admissions",         │           │
    │          │   keywords: ["admission", ...],   │           │
    │          │   createdAt: now(),   │           │           │
    │          │   updatedAt: now()    │           │           │
    │          │ }                     │           │           │
    │          │          │           │           │           │
    │          │ Save to Firestore     │           │           │
    │          │─────────────────────>│           │           │
    │          │          │           │           │           │
    │          │          │ Add document to       │           │
    │          │          │ faqs collection       │           │
    │          │          │           │           │           │
    │          │ Success  │           │           │           │
    │          │<─────────────────────┤           │           │
    │          │          │           │           │           │
    │          │ Close Modal           │           │           │
    │          │ Show Success: "FAQ added successfully!"       │
    │<─────────┤          │           │           │           │
    │          │          │           │           │           │
    │          │ Refresh FAQ List      │           │           │
    │          │─────────────────────>│           │           │
    │          │          │           │           │           │
    │          │ Display Updated List  │           │           │
    │<─────────┤          │           │           │           │
    │          │          │           │           │           │
    │          │          │           │ REAL-TIME SYNC        │
    │          │          │           │──────────>│           │
    │          │          │           │           │           │
    │          │          │           │           │ Notify User Chat
    │          │          │           │           │ FAQ DB Updated │
    │          │          │           │           │──────────>│
    │          │          │           │           │           │
    │          │          │           │ User's AI now has     │
    │          │          │           │ access to new FAQ     │
    │          │          │           │ for better responses  │
    │          │          │           │           │           │
    ▼          ▼          ▼           ▼           ▼           ▼


═══════════════════════════════════════════════════════════════════════
SCENARIO 2: EDIT EXISTING FAQ
═══════════════════════════════════════════════════════════════════════

┌───────┐  ┌───────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Admin │  │ Admin │  │Firestore│ │Real-time│ │  User  │
│       │  │ Panel │  │   DB   │  │  Sync  │  │  Chat  │
└───┬───┘  └───┬───┘  └───┬────┘  └───┬────┘  └───┬────┘
    │          │          │           │           │
    │ Browse FAQ List     │           │           │
    │          │          │           │           │
    │ Click "Edit" on FAQ │           │           │
    │─────────>│          │           │           │
    │          │          │           │           │
    │          │ Load FAQ Data         │           │
    │          │─────────>│           │           │
    │          │          │           │           │
    │          │ FAQ Data │           │           │
    │          │<─────────┤           │           │
    │          │          │           │           │
    │          │ Show Edit Form with   │           │
    │          │ Pre-filled Data       │           │
    │<─────────┤          │           │           │
    │          │          │           │           │
    │ Modify Fields:      │           │           │
    │ • Update Answer     │           │           │
    │ • Add Keywords      │           │           │
    │─────────>│          │           │           │
    │          │          │           │           │
    │ Click "Update"      │           │           │
    │─────────>│          │           │           │
    │          │          │           │           │
    │          │ Validate Changes      │           │
    │          │          │           │           │
    │          │ Update FAQ Object     │           │
    │          │ {                     │           │
    │          │   ...existingFields,  │           │
    │          │   answer: "Updated answer...",    │
    │          │   keywords: ["new", "keywords"],  │
    │          │   updatedAt: now()    │           │
    │          │ }                     │           │
    │          │          │           │           │
    │          │ Update in Firestore   │           │
    │          │─────────>│           │           │
    │          │          │           │           │
    │          │          │ Update document       │
    │          │          │ faqs/{faqId}          │
    │          │          │           │           │
    │          │ Success  │           │           │
    │          │<─────────┤           │           │
    │          │          │           │           │
    │          │ Show Success: "FAQ updated!"      │
    │<─────────┤          │           │           │
    │          │          │           │           │
    │          │          │           │ REAL-TIME SYNC        │
    │          │          │           │──────────>│           │
    │          │          │           │           │           │
    │          │          │           │ Push Updated FAQ      │
    │          │          │           │ to All User Sessions  │
    │          │          │           │──────────>│           │
    │          │          │           │           │           │
    │          │          │           │ User Chat refreshes   │
    │          │          │           │ FAQ cache instantly   │
    │          │          │           │           │           │
    ▼          ▼          ▼           ▼           ▼


═══════════════════════════════════════════════════════════════════════
SCENARIO 3: DELETE FAQ
═══════════════════════════════════════════════════════════════════════

┌───────┐  ┌───────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Admin │  │ Admin │  │Firestore│ │Real-time│ │  User  │
│       │  │ Panel │  │   DB   │  │  Sync  │  │  Chat  │
└───┬───┘  └───┬───┘  └───┬────┘  └───┬────┘  └───┬────┘
    │          │          │           │           │
    │ Click "Delete" on FAQ           │           │
    │─────────>│          │           │           │
    │          │          │           │           │
    │          │ Show Confirmation Dialog:         │
    │          │ "Are you sure you want to delete  │
    │          │  this FAQ? This cannot be undone."│
    │<─────────┤          │           │           │
    │          │          │           │           │
    │ Click "Confirm Delete"          │           │
    │─────────>│          │           │           │
    │          │          │           │           │
    │          │ Delete from Firestore │           │
    │          │─────────>│           │           │
    │          │          │           │           │
    │          │          │ Delete document       │
    │          │          │ faqs/{faqId}          │
    │          │          │           │           │
    │          │ Deleted  │           │           │
    │          │<─────────┤           │           │
    │          │          │           │           │
    │          │ Remove from UI        │           │
    │          │ Show Success: "FAQ deleted"       │
    │<─────────┤          │           │           │
    │          │          │           │           │
    │          │          │           │ REAL-TIME SYNC        │
    │          │          │           │──────────>│           │
    │          │          │           │           │           │
    │          │          │           │ Remove FAQ from       │
    │          │          │           │ all user caches       │
    │          │          │           │──────────>│           │
    │          │          │           │           │           │
    │          │          │           │ AI will no longer     │
    │          │          │           │ reference this FAQ    │
    │          │          │           │           │           │
    ▼          ▼          ▼           ▼           ▼


═══════════════════════════════════════════════════════════════════════
SCENARIO 4: BULK OPERATIONS
═══════════════════════════════════════════════════════════════════════

┌───────┐  ┌───────┐  ┌────────┐  ┌────────┐
│ Admin │  │ Admin │  │Firestore│ │Real-time│
│       │  │ Panel │  │   DB   │  │  Sync  │
└───┬───┘  └───┬───┘  └───┬────┘  └───┬────┘
    │          │          │           │
    │ Select Multiple FAQs (checkboxes)│
    │─────────>│          │           │
    │          │          │           │
    │ FAQ IDs: [faq1, faq2, faq3]      │
    │          │          │           │
    │ Click "Bulk Delete"  │           │
    │─────────>│          │           │
    │          │          │           │
    │          │ Show Confirmation:    │
    │          │ "Delete 3 FAQs?"      │
    │<─────────┤          │           │
    │          │          │           │
    │ Confirm  │          │           │
    │─────────>│          │           │
    │          │          │           │
    │          │ Loop through IDs      │
    │          │ For each faqId:       │
    │          │─────────>│           │
    │          │          │           │
    │          │          │ Delete faqs/{faqId}
    │          │          │           │
    │          │<─────────┤           │
    │          │          │           │
    │          │ All Deleted           │
    │          │          │           │
    │          │ Show: "3 FAQs deleted"│
    │<─────────┤          │           │
    │          │          │           │
    │          │          │           │ Batch Sync
    │          │          │           │──────────>│
    │          │          │           │           │
    ▼          ▼          ▼           ▼


═══════════════════════════════════════════════════════════════════════
SCENARIO 5: SEARCH & FILTER FAQs
═══════════════════════════════════════════════════════════════════════

┌───────┐  ┌───────┐  ┌────────┐
│ Admin │  │ Admin │  │Firestore│
│       │  │ Panel │  │   DB   │
└───┬───┘  └───┬───┘  └───┬────┘
    │          │          │
    │ Type in Search: "library"         │
    │─────────>│          │
    │          │          │
    │          │ Filter FAQs Locally (if cached)
    │          │ OR       │
    │          │ Query Firestore:      │
    │          │─────────>│
    │          │          │
    │          │ WHERE question CONTAINS "library"
    │          │ OR keywords ARRAY-CONTAINS "library"
    │          │ OR category = "Library"
    │          │          │
    │          │ Matching FAQs
    │          │<─────────┤
    │          │          │
    │          │ Display Filtered Results
    │<─────────┤          │
    │          │          │
    │ See only library-related FAQs
    │          │          │
    ▼          ▼          ▼


═══════════════════════════════════════════════════════════════════════
SCENARIO 6: EXPORT FAQs (Optional Feature)
═══════════════════════════════════════════════════════════════════════

┌───────┐  ┌───────┐  ┌────────┐
│ Admin │  │ Admin │  │Firestore│
│       │  │ Panel │  │   DB   │
└───┬───┘  └───┬───┘  └───┬────┘
    │          │          │
    │ Click "Export FAQs"  │
    │─────────>│          │
    │          │          │
    │          │ Fetch All FAQs
    │          │─────────>│
    │          │          │
    │          │ All FAQs │
    │          │<─────────┤
    │          │          │
    │          │ Convert to CSV/JSON
    │          │ Format:  │
    │          │ [        │
    │          │   {      │
    │          │     "Question": "...",
    │          │     "Answer": "...",
    │          │     "Category": "...",
    │          │     "Keywords": "..."
    │          │   }      │
    │          │ ]        │
    │          │          │
    │          │ Download File: faqs-export.csv
    │<─────────┤          │
    │          │          │
    │ File Downloaded      │
    │          │          │
    ▼          ▼          ▼


REAL-TIME SYNCHRONIZATION DETAILS:
═══════════════════════════════════

When Admin Makes Changes:
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  1. Admin saves/updates/deletes FAQ                     │
│     ↓                                                    │
│  2. Firestore document changes                          │
│     ↓                                                    │
│  3. Firestore triggers onSnapshot listeners             │
│     ↓                                                    │
│  4. All connected clients receive update event          │
│     ↓                                                    │
│  5. User Chat components re-fetch FAQs                  │
│     ↓                                                    │
│  6. AI context updated with new FAQ data                │
│     ↓                                                    │
│  7. Next user query uses updated FAQs                   │
│                                                          │
│  Time Delay: < 1 second (real-time)                     │
│                                                          │
└─────────────────────────────────────────────────────────┘


FAQ DATA STRUCTURE:
════════════════════

{
  id: "faq_12345",
  question: "What are the admission requirements?",
  answer: "To apply for admission to HCK College, you need...",
  category: "Admissions",
  keywords: [
    "admission",
    "requirements",
    "apply",
    "eligibility",
    "documents"
  ],
  createdAt: Timestamp(2024-01-15 10:30:00),
  updatedAt: Timestamp(2024-01-20 14:45:00)
}


VALIDATION RULES:
══════════════════

Question:
• Required
• Min length: 10 characters
• Max length: 500 characters

Answer:
• Required
• Min length: 20 characters
• Max length: 2000 characters

Category:
• Required
• Must be one of: [
    "Admissions",
    "Courses",
    "Library",
    "Fees",
    "Hostel",
    "Events",
    "Placements",
    "Contact"
  ]

Keywords:
• Optional
• Array of strings
• Each keyword: 2-50 characters
• Max 10 keywords per FAQ


ADMIN PERMISSIONS:
═══════════════════

✓ Create new FAQs
✓ Edit existing FAQs
✓ Delete FAQs
✓ Bulk operations
✓ Search & filter
✓ Export data
✓ View analytics
✗ Cannot edit other admin's profile (unless super admin)


ERROR HANDLING:
════════════════

1. Duplicate Question:
   → Show: "This question already exists. Edit the existing FAQ instead."

2. Invalid Category:
   → Show: "Please select a valid category."

3. Network Error:
   → Show: "Failed to save FAQ. Check connection and retry."
   → Auto-retry 3 times

4. Permission Denied:
   → Show: "You don't have permission to perform this action."
   → Redirect to login
```

---

**This sequence diagram shows the complete Admin FAQ Management flow with real-time synchronization to user chat interfaces.**

**Next: Sequence Diagram 5 - User Signup Flow**
