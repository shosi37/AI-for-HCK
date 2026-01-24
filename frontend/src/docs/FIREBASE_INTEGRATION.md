# Firebase Integration Guide

## Overview
Your HCK College AI Chatbot application is now fully integrated with Firebase for authentication, real-time database, and data persistence.

## Firebase Configuration

### Config File: `/utils/firebase/config.ts`
Your Firebase project credentials are configured with:
- **Project ID**: ai-chatbot-for-hck
- **Auth Domain**: ai-chatbot-for-hck.firebaseapp.com
- **Services Enabled**: Authentication, Firestore Database, Storage

## Database Structure

### Collections in Firestore

1. **users** (Collection)
   ```
   /users/{userId}
   ├── id: string
   ├── email: string
   ├── name: string
   ├── studentId?: string
   ├── department?: string
   ├── year?: string
   └── createdAt: Date
   ```

2. **chats** (Subcollection under users)
   ```
   /users/{userId}/chats/{chatId}
   ├── id: string
   ├── title: string
   ├── timestamp: Date
   ├── userId: string
   └── messages: Array
       ├── id: string
       ├── text: string
       ├── sender: 'user' | 'ai'
       ├── timestamp: Date
       └── helpful?: boolean | null
   ```

3. **faqs** (Collection)
   ```
   /faqs/{faqId}
   ├── id: string
   ├── question: string
   ├── answer: string
   └── createdAt: Date
   ```

## Authentication

### Admin Credentials
- **Email**: admin@hck.edu
- **Password**: admin (or as configured in your Firebase Authentication)

### Regular User Credentials
Users can sign up through the `/signup` route or login through `/login`

### Auth Functions (`/utils/firebase/auth.ts`)
- `signUp()` - Create new user account
- `signIn()` - Authenticate user
- `logOut()` - Sign out user
- `getCurrentUserProfile()` - Get user profile from Firestore
- `updateUserProfile()` - Update user information
- `isAdmin()` - Check if user has admin privileges

## Database Functions (`/utils/firebase/db.ts`)

### Chat Management
- `saveChat()` - Save a new chat
- `getUserChats()` - Get all chats for a user
- `getChat()` - Get specific chat by ID
- `updateChat()` - Update chat messages
- `deleteChat()` - Delete a chat
- `subscribeToUserChats()` - Real-time listener for user chats

### FAQ Management
- `addFAQ()` - Add new FAQ
- `getAllFAQs()` - Get all FAQs
- `updateFAQ()` - Update existing FAQ
- `deleteFAQ()` - Delete FAQ
- `subscribeToFAQs()` - Real-time listener for FAQs
- `importFAQs()` - Batch import FAQs from JSON

### Admin Functions
- `getAllUsers()` - Get all registered users
- `subscribeToAllUsers()` - Real-time listener for users
- `deleteUser()` - Delete user and all their chats
- `getAnalyticsData()` - Get dashboard analytics

## Real-Time Updates

The application uses Firebase's real-time listeners for automatic updates:

1. **User Chats** - Chat history updates automatically when new messages are added
2. **FAQs** - FAQ list updates in real-time when admins add/edit/delete FAQs
3. **Users List** - Admin dashboard shows real-time user registrations
4. **Analytics** - Dashboard statistics refresh every 30 seconds

## Key Features

### For Users
- ✅ Sign up with email and password
- ✅ Login with existing credentials
- ✅ Create and manage chat conversations
- ✅ View chat history across sessions
- ✅ Provide feedback on AI responses
- ✅ Edit profile information
- ✅ Real-time chat synchronization

### For Admins
- ✅ View all registered users
- ✅ Monitor user chat activity
- ✅ Manage FAQs (add, edit, delete)
- ✅ Import/Export FAQs
- ✅ View analytics and statistics
- ✅ Real-time dashboard updates
- ✅ Export user data to CSV
- ✅ Delete users and their data

## Security Rules (Recommended for Production)

You should configure Firestore Security Rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // Users can only access their own chats
      match /chats/{chatId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // FAQs are readable by all authenticated users
    // Only admin can write
    match /faqs/{faqId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.email == 'admin@hck.edu';
    }
  }
}
```

## Migration from localStorage

All data has been migrated from localStorage to Firebase:
- ❌ No more `localStorage.getItem('hck_users')`
- ❌ No more `localStorage.getItem('hck_chats_${userId}')`
- ❌ No more `localStorage.getItem('hck_faqs')`
- ✅ All data now in Firebase Firestore
- ✅ Real-time synchronization
- ✅ Data persistence across devices
- ✅ Better data integrity

## Testing the Integration

1. **Sign Up**: Create a new user account at `/signup`
2. **Login**: Login with the created account
3. **Create Chat**: Start a new chat conversation
4. **Admin Login**: Login as admin using admin@hck.edu
5. **Admin Dashboard**: View users, chats, and manage FAQs
6. **Real-time Updates**: Open the app in two browsers and see changes sync in real-time

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check Firebase console to ensure user exists
   - Verify email/password are correct
   - Check browser console for detailed error messages

2. **Data Not Loading**
   - Ensure Firebase config is correct
   - Check Firestore rules allow read/write
   - Verify internet connection

3. **Real-time Updates Not Working**
   - Check if listeners are properly subscribed
   - Verify Firestore rules allow read access
   - Check browser console for errors

## Future Enhancements

Consider adding:
- Email verification for new users
- Password reset functionality
- Social authentication (Google, Facebook)
- File upload to Firebase Storage
- Cloud Functions for AI responses
- Push notifications
- Analytics tracking with Firebase Analytics
