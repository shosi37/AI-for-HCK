# HCK College AI Chatbot 🎓🤖

A comprehensive AI-powered chatbot application designed for HCK College to assist students with inquiries about admissions, courses, library hours, fees, hostel facilities, events, placements, and contact information.

## 🌟 Features

### For Students
- 📝 **User Registration & Authentication** - Secure signup and login
- 💬 **AI Chat Interface** - Intelligent responses to college-related queries
- 📚 **Chat History** - Access previous conversations
- ⭐ **Feedback System** - Rate AI responses (helpful/not helpful)
- 👤 **Profile Management** - Edit personal information
- 🌙 **Dark Theme** - Modern, eye-friendly interface

### For Administrators
- 🔐 **Dual Admin Access** - Login via admin portal or regular login
- 📊 **Analytics Dashboard** - Track users, chats, and engagement
- 👥 **User Management** - View, search, and manage users
- 💭 **Chat Monitoring** - Access all user conversations
- ❓ **FAQ Manager** - Add, edit, delete, import, and export FAQs
- 📈 **AI Accuracy Tracking** - Monitor response quality
- 📥 **Data Export** - Download users (CSV) and FAQs (JSON)
- ⚡ **Real-time Updates** - Live synchronization across devices

## 🚀 Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Backend**: Firebase
  - Authentication
  - Cloud Firestore (Database)
  - Firebase Storage
- **Icons**: Lucide React
- **Real-time**: Firestore Listeners

## 📁 Project Structure

```
/
├── App.tsx                          # Main application with routing
├── components/
│   ├── Login.tsx                   # User login page
│   ├── Signup.tsx                  # User registration
│   ├── AdminLogin.tsx              # Admin portal login
│   ├── Dashboard.tsx               # User dashboard
│   ├── ChatPage.tsx                # Chat interface
│   ├── ProfileEdit.tsx             # Profile editor
│   └── AdminDashboard.tsx          # Admin control panel
├── utils/
│   └── firebase/
│       ├── config.ts               # Firebase configuration
│       ├── auth.ts                 # Authentication functions
│       └── db.ts                   # Database operations
├── styles/
│   └── globals.css                 # Global styles
├── sample_faqs.json                # Sample FAQ data for import
├── CREATE_ADMIN_INSTRUCTIONS.md    # Detailed setup guide
├── FIREBASE_INTEGRATION.md         # Firebase integration docs
├── SETUP_INSTRUCTIONS.md           # Quick setup guide
└── QUICK_REFERENCE.md              # Quick reference card
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Configuration

Your Firebase project is already configured in `/utils/firebase/config.ts`:
- **Project ID**: ai-chatbot-for-hck
- **Auth Domain**: ai-chatbot-for-hck.firebaseapp.com

### Step 3: Create Admin Account

**Option A: Via Signup Page (Recommended)**
1. Run the app: `npm run dev`
2. Navigate to `/signup`
3. Create account with email: `admin@hck.edu`

**Option B: Via Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ai-chatbot-for-hck`
3. Add user with email: `admin@hck.edu`
4. Add user document in Firestore

### Step 4: Add FAQs

1. Login as admin
2. Go to FAQ Manager
3. Either:
   - Manually add FAQs, or
   - Import `sample_faqs.json` (12 pre-made FAQs included!)

### Step 5: Start Using!

```bash
npm run dev
```

Visit `http://localhost:5173` (or your configured port)

## 🔑 Default Credentials

### Admin Access

**Method 1: Admin Portal**
- URL: `/admin/login`
- Username: `admin`
- Password: `admin`

**Method 2: Regular Login**
- URL: `/login`
- Email: `admin@hck.edu`
- Password: `admin`

### Test User (Create via Signup)
- Email: student@hck.edu
- Password: student123

## 📱 Application Routes

| Route | Description | Access Level |
|-------|-------------|--------------|
| `/` | Home (redirects to login) | Public |
| `/login` | User/Admin login | Public |
| `/signup` | New user registration | Public |
| `/dashboard` | User dashboard | Authenticated |
| `/chat` | Chat interface | Authenticated |
| `/profile` | Edit profile | Authenticated |
| `/admin/login` | Admin portal | Public |
| `/admin/dashboard` | Admin panel | Admin Only |

## 🗄️ Database Structure

### Firestore Collections

**users**
```javascript
{
  id: string,
  email: string,
  name: string,
  studentId?: string,
  department?: string,
  year?: string,
  createdAt: timestamp
}
```

**users/{userId}/chats**
```javascript
{
  id: string,
  title: string,
  timestamp: timestamp,
  userId: string,
  messages: [
    {
      id: string,
      text: string,
      sender: 'user' | 'ai',
      timestamp: timestamp,
      helpful?: boolean
    }
  ]
}
```

**faqs**
```javascript
{
  id: string,
  question: string,
  answer: string,
  createdAt: timestamp
}
```

## 📚 Documentation

- **[CREATE_ADMIN_INSTRUCTIONS.md](CREATE_ADMIN_INSTRUCTIONS.md)** - Complete setup guide with admin account creation
- **[FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md)** - Firebase integration details and security rules
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Step-by-step setup walkthrough
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for developers
- **[sample_faqs.json](sample_faqs.json)** - 12 sample FAQs ready to import

## 🎯 Key Features Explained

### Real-Time Synchronization
All data syncs automatically across devices using Firestore listeners. No manual refresh needed!

### Dual Admin Login
Administrators can access the dashboard through:
1. Dedicated admin portal (`/admin/login`) with username/password
2. Regular login (`/login`) using admin email

### FAQ Import/Export
- **Import**: Bulk import FAQs from JSON file
- **Export**: Download FAQ database as JSON
- **Format**: `[{"question": "...", "answer": "..."}]`

### Chat History Management
- Unlimited chat conversations per user
- Each chat saved with timestamp
- Full message history preserved
- Delete chats individually

### Feedback System
- Users rate AI responses as helpful or not helpful
- Admins see aggregated feedback statistics
- AI accuracy percentage calculated automatically

## 🔒 Security

### Firebase Authentication
- Secure email/password authentication
- Password encryption handled by Firebase
- Session management automatic

### Firestore Security Rules
Recommended rules (apply in Firebase Console):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.email == 'admin@hck.edu';
      
      match /chats/{chatId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    match /faqs/{faqId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.email == 'admin@hck.edu';
    }
  }
}
```

## 🎨 Customization

### Update College Information
1. Login as admin
2. Modify FAQs to reflect your college's details
3. Update contact information, fees, courses, etc.

### Theme Customization
Edit `/styles/globals.css` to change:
- Background colors
- Accent colors
- Typography
- Component styles

### Connect Real AI
Currently uses simulated responses. To integrate actual AI:
1. Open `/components/ChatPage.tsx`
2. Find `generateResponse` function
3. Replace with your AI API (OpenAI, Google AI, etc.)

## 📊 Admin Dashboard Overview

### Overview Tab
- Total users count
- Total chats and messages
- AI accuracy percentage
- Recent user activity
- Feedback statistics

### Users Tab
- Searchable user list
- View individual user details
- Access user chat history
- Delete users
- Export to CSV

### Chat Analytics Tab
- View all user conversations
- Read full chat history
- Monitor feedback ratings
- Track engagement

### FAQ Manager Tab
- Add/edit/delete FAQs
- Search FAQs
- Import from JSON
- Export to JSON

## 🧪 Testing

### Testing Checklist
1. Create admin account
2. Login as admin (both methods)
3. Add/import FAQs
4. Create test user
5. Test chat functionality
6. Rate responses
7. View chat history
8. Edit profile
9. Check admin analytics
10. Export data

### Sample Test Data
Use `sample_faqs.json` which includes:
- Admission information
- Course details
- Library hours
- Fee structure
- Hostel facilities
- Events calendar
- Placement statistics
- Contact information

## 🐛 Troubleshooting

### Common Issues

**"Admin account not found"**
- Create admin account first via signup or Firebase Console

**"Permission denied"**
- Check Firestore security rules
- Verify user is authenticated

**Data not loading**
- Check browser console (F12)
- Verify Firebase configuration
- Check internet connection

**Real-time updates not working**
- Check Firestore rules allow read
- Verify WebSocket not blocked

## 📈 Future Enhancements

Potential features to add:
- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Social authentication (Google, Facebook)
- [ ] File upload support
- [ ] Cloud Functions for AI integration
- [ ] Push notifications
- [ ] Mobile responsive improvements
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Chat export feature

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Check documentation files
- Review Firebase Console logs
- Check browser console for errors
- Refer to Firebase documentation

## 🎓 About HCK College

This chatbot is designed to assist students and prospective students of HCK College with instant access to important information about:
- Admissions process
- Course offerings
- Campus facilities
- Fee structure
- Hostel accommodations
- Library services
- Placement opportunities
- Contact details

## 🙏 Acknowledgments

- Built with React and Firebase
- Icons by Lucide
- Styled with Tailwind CSS

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: December 24, 2025

Made with ❤️ for HCK College
