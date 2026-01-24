# HCK College AI Chatbot - Quick Reference

## 🔑 Login Credentials

### Admin Access (Two Options)

**Option 1: Admin Portal**
- URL: `/admin/login`
- Username: `admin`
- Password: `admin`

**Option 2: Regular Login**
- URL: `/login`
- Email: `admin@hck.edu`
- Password: `admin`
- ⚠️ **Must create this account in Firebase first!**

### Test User
- URL: `/login`
- Email: `student@hck.edu`
- Password: `student123`
- ⚠️ **Must create through signup!**

## 📁 File Structure

```
/
├── App.tsx                          # Main app with routing
├── components/
│   ├── Login.tsx                   # User login (Firebase)
│   ├── Signup.tsx                  # User registration (Firebase)
│   ├── AdminLogin.tsx              # Admin login (username/password)
│   ├── Dashboard.tsx               # User dashboard
│   ├── ChatPage.tsx                # Chat interface (Firebase)
│   ├── ProfileEdit.tsx             # User profile editor
│   └── AdminDashboard.tsx          # Admin panel (Firebase)
├── utils/
│   └── firebase/
│       ├── config.ts               # Firebase configuration
│       ├── auth.ts                 # Authentication functions
│       └── db.ts                   # Database functions
└── styles/
    └── globals.css                 # Global styles
```

## 🔥 Firebase Integration

### Services Used
- ✅ Firebase Authentication
- ✅ Cloud Firestore Database
- ✅ Firebase Storage (configured)

### Collections
```
/users/{userId}
  - User profiles

/users/{userId}/chats/{chatId}
  - User chat history

/faqs/{faqId}
  - FAQ database
```

## 🎯 Key Functions

### Authentication (`/utils/firebase/auth.ts`)
```typescript
signUp(email, password, name, ...)     // Create account
signIn(email, password)                 // Login
logOut()                                // Logout
getCurrentUserProfile(user)             // Get user data
updateUserProfile(userId, updates)      // Update user
isAdmin(email)                          // Check admin status
```

### Database (`/utils/firebase/db.ts`)
```typescript
// Chats
saveChat(userId, chat)                  // Save new chat
getUserChats(userId)                    // Get all user chats
updateChat(userId, chat)                // Update chat
deleteChat(userId, chatId)              // Delete chat
subscribeToUserChats(userId, callback)  // Real-time listener

// FAQs
addFAQ(faq)                             // Add new FAQ
getAllFAQs()                            // Get all FAQs
updateFAQ(faqId, updates)               // Update FAQ
deleteFAQ(faqId)                        // Delete FAQ
importFAQs(faqs)                        // Batch import
subscribeToFAQs(callback)               // Real-time listener

// Admin
getAllUsers()                           // Get all users
deleteUser(userId)                      // Delete user + chats
getAnalyticsData()                      // Get dashboard stats
subscribeToAllUsers(callback)           // Real-time users
```

## 🛣️ Routes

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/` | → `/login` | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/dashboard` | Dashboard | User |
| `/chat` | ChatPage | User |
| `/profile` | ProfileEdit | User |
| `/admin/login` | AdminLogin | No |
| `/admin/dashboard` | AdminDashboard | Admin |

## 📊 Admin Dashboard Tabs

1. **Overview**
   - Total users, chats, messages
   - AI accuracy percentage
   - Recent users list
   - Feedback statistics

2. **Users**
   - View all users
   - Search by name/email/ID
   - View user chats
   - Delete users
   - Export to CSV

3. **Chat Analytics**
   - Select user
   - View chat history
   - Read conversations
   - See feedback ratings

4. **FAQ Manager**
   - Add/Edit/Delete FAQs
   - Search FAQs
   - Import/Export JSON

## 🎨 Theme Colors

```css
Background: #2d3748 (dark gray-blue)
Cards: #1a202c (darker)
Accents: Indigo/Purple gradient
Text: White with opacity variants
Admin: Red/Orange gradient
```

## 💡 Quick Setup Steps

1. **Create Admin Account**
   ```
   Firebase Console → Authentication → Add User
   Email: admin@hck.edu
   Password: admin
   ```

2. **Add Initial FAQs**
   ```
   Login as admin → FAQ Manager → Add FAQ
   ```

3. **Create Test User**
   ```
   /signup → Fill form → Create account
   ```

4. **Test Chat**
   ```
   Login as user → /chat → Ask question
   ```

## 🔧 Common Tasks

### Add a New FAQ
1. Login as admin
2. Go to Admin Dashboard
3. Click "FAQ Manager" tab
4. Fill in Question and Answer
5. Click "Add FAQ"

### View User Chats
1. Login as admin
2. Go to "Users" tab
3. Click eye icon on user row
4. Browse chat history

### Export Data
- **Users**: Users tab → "Export CSV"
- **FAQs**: FAQ Manager → "Export JSON"

### Import FAQs
1. Prepare JSON file: `[{"question": "...", "answer": "..."}]`
2. FAQ Manager → "Import JSON"
3. Select file

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin login fails | Create admin account in Firebase first |
| User not found | Check Firebase Authentication console |
| Data not loading | Check browser console for errors |
| Real-time not working | Verify Firestore rules allow read |
| Login redirects to login | Check auth state in App.tsx |

## 📱 Testing Checklist

- [ ] Create admin account in Firebase
- [ ] Login as admin via /admin/login
- [ ] Login as admin via /login (admin@hck.edu)
- [ ] Add 5+ FAQs
- [ ] Create test user via /signup
- [ ] Login as test user
- [ ] Start new chat
- [ ] Ask questions
- [ ] Rate responses
- [ ] View chat history
- [ ] Edit profile
- [ ] Admin: view user list
- [ ] Admin: view user chats
- [ ] Admin: check analytics
- [ ] Admin: export data

## 🚀 Deployment Notes

Before deploying to production:
1. Move Firebase config to environment variables
2. Set up Firestore security rules
3. Enable email verification
4. Change default admin password
5. Configure custom domain
6. Set up Firebase hosting (optional)
7. Enable Firebase Analytics

## 📞 Resources

- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Project ID: `ai-chatbot-for-hck`
- Auth Domain: `ai-chatbot-for-hck.firebaseapp.com`

---

**Last Updated**: December 24, 2025
**Version**: 1.0 - Full Firebase Integration
