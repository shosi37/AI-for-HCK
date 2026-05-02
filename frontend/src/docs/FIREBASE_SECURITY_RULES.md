# Firebase Security Rules Setup

## Current Issue
You're seeing a "Missing or insufficient permissions" error because Firestore security rules need to be configured.

## How to Fix

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `ai-chatbot-for-hck`
3. **Navigate to Firestore Database** (in the left sidebar)
4. **Click on "Rules" tab**
5. **Replace the existing rules with the following:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && (request.auth.token.email == 'admin@hck.edu' || request.auth.token.admin == true);
    }

    // Allow users to read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Admin can manage users
      allow read, write: if isAdmin();
      
      // Chats subcollection
      match /chats/{chatId} {
        allow read, write: if (request.auth != null && request.auth.uid == userId) || isAdmin();
      }
    }
    
    // FAQs
    match /faqs/{faqId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

6. **Click "Publish"**

## What These Rules Do

- **Users can read and write their own profile data**
- **Users can read and write their own chats**
- **Everyone can read FAQs** (so the AI can answer questions)
- **Only admin@hck.edu can write/update FAQs**
- **Admin can read all users and all chats** (for the admin dashboard)

## Testing After Setup

1. Sign up with a test user account
2. Try logging in
3. Try chatting with the AI
4. Create an admin account (email: admin@hck.edu, password: admin)
5. Log in as admin and access the admin dashboard

## Note

These rules provide basic security. For production, you may want to add more specific validation and additional checks.
