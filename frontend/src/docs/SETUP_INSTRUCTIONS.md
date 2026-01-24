# HCK College AI Chatbot - Setup Instructions

## ✅ Firebase Integration Complete!

Your application is fully integrated with Firebase. Here's what's been set up:

## 🔐 Admin Access

### Option 1: Admin Login Page
1. Navigate to `/admin/login`
2. Username: `admin`
3. Password: `admin`

### Option 2: Regular Login (Admin Email)
1. Navigate to `/login`
2. Email: `admin@hck.edu`
3. Password: `admin`

**Note**: You need to create the admin account first using Firebase Authentication or through the signup flow.

## 🚀 Getting Started

### Step 1: Create Admin Account (First Time Only)

Since the admin account needs to exist in Firebase, you have two options:

#### Option A: Through Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ai-chatbot-for-hck`
3. Go to Authentication → Users
4. Click "Add User"
5. Email: `admin@hck.edu`
6. Password: `admin` (or your preferred secure password)
7. Click "Add User"

#### Option B: Using the Signup Page
1. Navigate to `/signup`
2. Fill in the form with admin details
3. Use email: `admin@hck.edu`
4. Create the account
5. Now you can login as admin

### Step 2: Create Regular User Accounts

1. Navigate to `/signup`
2. Fill in the registration form:
   - Name (required)
   - Email (required)
   - Password (required, min 6 characters)
   - Student ID (optional)
   - Department (optional)
   - Year (optional)
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

### Step 3: Add FAQs (Admin Only)

1. Login as admin
2. Go to Admin Dashboard
3. Click on "FAQ Manager" tab
4. Add your college's FAQs:
   - Admissions information
   - Course details
   - Library hours
   - Fees structure
   - Hostel facilities
   - Events calendar
   - Placement information
   - Contact details

Example FAQs to add:

**Admissions**
- Q: "How do I apply for admission?"
- A: "Visit our admissions office or apply online at www.hck.edu/admissions..."

**Courses**
- Q: "What courses does HCK College offer?"
- A: "HCK College offers various undergraduate and postgraduate programs..."

**Library**
- Q: "What are the library hours?"
- A: "The library is open Monday-Friday from 8 AM to 8 PM, and Saturday from 9 AM to 5 PM..."

### Step 4: Test the Chat Functionality

1. Login as a regular user
2. Click "Start Chatting" or navigate to `/chat`
3. Try asking questions about:
   - Admissions process
   - Available courses
   - Library timings
   - Fee structure
   - Hostel facilities
   - College events
   - Placement opportunities
   - Contact information
4. Provide feedback using 👍 (Helpful) or 👎 (Not Helpful) buttons

## 📊 Admin Dashboard Features

Once logged in as admin, you can:

### Overview Tab
- View total users, chats, and messages
- Monitor AI accuracy based on user feedback
- See recent user activity
- Track helpful vs not helpful feedback

### Users Tab
- View all registered users
- Search users by name, email, or student ID
- View individual user chat history
- Delete users if needed
- Export user data to CSV

### Chat Analytics Tab
- Select any user to view their chats
- Read full conversation history
- See user feedback on AI responses
- Monitor chat activity by date

### FAQ Manager Tab
- Add new FAQs
- Edit existing FAQs
- Delete outdated FAQs
- Search FAQs
- Import FAQs from JSON file
- Export FAQs to JSON file

## 🔄 Real-Time Features

The app includes real-time synchronization:
- New chats appear instantly
- FAQ updates reflect immediately
- User registrations show in admin panel in real-time
- Analytics update automatically
- No need to refresh the page!

## 📱 Application Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Redirects to login | Public |
| `/login` | User/Admin login page | Public |
| `/signup` | User registration | Public |
| `/dashboard` | User dashboard | Authenticated Users |
| `/chat` | Chat interface | Authenticated Users |
| `/profile` | Edit profile | Authenticated Users |
| `/admin/login` | Admin-only login | Public |
| `/admin/dashboard` | Admin panel | Admin Only |

## 🎨 Features Overview

### For Students
✅ Sign up with college email  
✅ Login to personal dashboard  
✅ Chat with AI about college information  
✅ View chat history  
✅ Rate AI responses  
✅ Edit profile information  
✅ Dark theme interface  

### For Administrators
✅ Comprehensive admin panel  
✅ User management  
✅ Chat monitoring  
✅ FAQ management  
✅ Analytics and insights  
✅ Data export capabilities  
✅ Real-time updates  

## 🛠 Customization

### Update College Information
Edit the FAQs in the admin panel to reflect your college's specific information.

### Modify AI Responses
The AI responses are currently simulated. To connect to a real AI:
1. Open `/components/ChatPage.tsx`
2. Find the `generateResponse` function
3. Replace the simulated logic with your AI API integration (e.g., OpenAI, Google AI, etc.)

### Change Theme Colors
The app uses a dark theme with purple/indigo accents. To customize:
1. Open `/styles/globals.css`
2. Modify the color variables
3. Update component-specific colors in the `.tsx` files

## 🔒 Security Recommendations

1. **Change Admin Password**: Use a strong password for the admin account
2. **Firebase Rules**: Configure Firestore security rules (see FIREBASE_INTEGRATION.md)
3. **Environment Variables**: Move Firebase config to environment variables for production
4. **Email Verification**: Enable email verification in Firebase Console
5. **Rate Limiting**: Implement rate limiting for API calls

## 📊 Sample Data for Testing

### Test User Account
- Email: student@hck.edu
- Password: student123
- Name: Test Student
- Student ID: HCK2024001
- Department: Computer Science
- Year: 2024

### Test Admin Account
- Email: admin@hck.edu
- Password: admin

## 🐛 Troubleshooting

### Issue: "Admin account not found"
**Solution**: Create the admin account in Firebase Authentication first (see Step 1 above)

### Issue: Chat messages not saving
**Solution**: Check Firebase Firestore rules allow write access

### Issue: Real-time updates not working
**Solution**: Verify internet connection and Firebase config

### Issue: Login fails with valid credentials
**Solution**: Check browser console for detailed error messages

## 📞 Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)

For application issues:
- Check browser console for errors
- Review FIREBASE_INTEGRATION.md for detailed setup
- Ensure all Firebase services are enabled in console

## 🎯 Next Steps

1. ✅ Create admin account in Firebase
2. ✅ Login as admin
3. ✅ Add initial FAQs
4. ✅ Create test user accounts
5. ✅ Test chat functionality
6. ✅ Monitor analytics
7. ✅ Customize for your college

Enjoy your fully functional AI chatbot! 🚀
