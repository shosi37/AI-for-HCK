# Admin Account Setup Guide

## How to Create the Admin Account

The admin account needs to be created before you can access the admin panel. Follow these steps:

---

## Method 1: Sign Up via Signup Page (Recommended)

### Steps:

1. **Navigate to the Signup Page**
   - Go to `/signup` in your application
   - Or click "Sign up" from the login page

2. **Fill in Admin Details**
   - **Name:** Admin (or your preferred admin name)
   - **Email:** `admin@hck.edu`
   - **Password:** `admin` (or a more secure password)
   - **Student ID:** (optional, can leave blank)
   - **Department:** Administration (optional)
   - **Year:** (optional, can leave blank)

3. **Click "Create Account"**
   - Firebase will create the admin user
   - You'll be automatically logged in
   - The account will be created in Firebase Authentication

4. **Verify Admin Access**
   - Once logged in, you'll be redirected to the dashboard
   - To access admin panel: Navigate to `/admin/dashboard`
   - Or logout and login with `admin@hck.edu` credentials

---

## Method 2: Using Firebase Console (Alternative)

If you prefer to create the admin account directly in Firebase:

### Steps:

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project (HCK College AI Chatbot)

2. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar
   - Click "Users" tab

3. **Add User**
   - Click "Add user" button
   - **Email:** `admin@hck.edu`
   - **Password:** `admin` (or your secure password)
   - Click "Add user"

4. **Create Firestore Document**
   - Go to Firestore Database
   - Navigate to `users` collection
   - Click "Add document"
   - **Document ID:** Use the UID from the user you just created
   - **Fields:**
     ```
     id: {UID from Firebase Auth}
     email: admin@hck.edu
     name: Admin
     createdAt: {current timestamp}
     isAdmin: true (optional boolean field)
     ```

5. **Save and Test**
   - Go to your application
   - Login with `admin@hck.edu` and password `admin`
   - You should have admin access

---

## Verification

### How to Verify Admin Account is Working:

1. **Login Test**
   ```
   Email: admin@hck.edu
   Password: admin
   ```

2. **Check Console**
   - Open browser developer console (F12)
   - Look for any error messages
   - Should see successful login messages

3. **Access Admin Panel**
   - After login, navigate to `/admin/dashboard`
   - You should see the admin panel
   - If redirected to regular dashboard, check admin detection logic

4. **Check Firebase**
   - Firebase Console → Authentication → Users
   - Should see `admin@hck.edu` in the users list
   - Firebase Console → Firestore → users collection
   - Should have a document with the admin's UID

---

## Troubleshooting

### Error: "Invalid email or password"

**Cause:** Admin account doesn't exist in Firebase

**Solution:**
1. Go to `/signup`
2. Sign up with `admin@hck.edu` and password `admin`
3. Or create manually via Firebase Console (Method 2 above)

### Error: "No account found with this email"

**Cause:** No user exists with email `admin@hck.edu`

**Solution:**
1. Create the account using Method 1 or Method 2 above
2. Verify in Firebase Console → Authentication → Users

### Error: "Too many failed login attempts"

**Cause:** Firebase rate limiting after multiple failed attempts

**Solution:**
1. Wait 15-30 minutes
2. Try password reset via "Forgot password?" link
3. Or use Firebase Console to reset the password

### Admin Logged In But No Admin Access

**Cause:** Admin detection not working properly

**Solution:**
1. Check that email is exactly `admin@hck.edu` (case-sensitive)
2. Clear browser cache and cookies
3. Logout and login again
4. Check browser console for errors

---

## Security Recommendations

### For Production:

1. **Change Default Password**
   - The default password `admin` is NOT secure
   - Change it immediately after first login
   - Use a strong password (12+ characters, mixed case, numbers, symbols)

2. **Use Strong Email**
   - Consider using a real admin email like `admin@yourdomain.com`
   - This allows password recovery via email

3. **Enable Two-Factor Authentication (Optional)**
   - Add extra security layer
   - Configure in Firebase Console

4. **Restrict Admin Access**
   - Add IP whitelist (optional)
   - Use Firebase Security Rules to restrict admin operations
   - Monitor admin activity logs

5. **Create Multiple Admin Levels**
   - Super Admin: Full access
   - Moderator: Limited access
   - Support: Read-only access

---

## Multiple Admin Accounts

### To Create Additional Admins:

1. **Update Admin Check Function**
   
   In `/utils/firebase/auth.ts`:
   ```typescript
   export const isAdmin = (email: string): boolean => {
     const adminEmails = [
       'admin@hck.edu',
       'admin2@hck.edu',
       'superadmin@hck.edu'
     ];
     return adminEmails.includes(email);
   };
   ```

2. **Add Admin Flag in Firestore**
   
   When creating user document:
   ```typescript
   {
     id: "user-uid",
     email: "admin2@hck.edu",
     name: "Admin 2",
     isAdmin: true,  // Add this field
     createdAt: Timestamp
   }
   ```

3. **Update Admin Check Logic**
   
   Check both email and `isAdmin` field:
   ```typescript
   export const isAdmin = async (user: UserProfile): Promise<boolean> => {
     // Check email
     if (user.email === 'admin@hck.edu') return true;
     
     // Check Firestore isAdmin field
     const userDoc = await getDoc(doc(db, 'users', user.id));
     return userDoc.data()?.isAdmin === true;
   };
   ```

---

## Admin Capabilities

Once logged in as admin, you can:

- ✅ Access Admin Dashboard (`/admin/dashboard`)
- ✅ Manage FAQs (Create, Edit, Delete)
- ✅ View User Management
- ✅ Access Analytics Dashboard
- ✅ Monitor AI Accuracy
- ✅ View Chat History (all users)
- ✅ Export Data

---

## Quick Reference

### Default Admin Credentials:
```
Email: admin@hck.edu
Password: admin
```

### Admin Routes:
- Login: `/login` (use admin credentials)
- Admin Login: `/admin/login` (alternative admin login page)
- Admin Dashboard: `/admin/dashboard`

### Firebase Collections:
- Authentication: `users` (email: admin@hck.edu)
- Firestore: `users/{admin-uid}` (user profile document)

---

## Step-by-Step First-Time Setup

### Complete Setup Checklist:

1. ☐ Open application at `/signup`
2. ☐ Enter admin details:
   - Name: Admin
   - Email: admin@hck.edu
   - Password: admin
3. ☐ Click "Create Account"
4. ☐ Verify successful signup
5. ☐ Logout from regular account
6. ☐ Go to `/login`
7. ☐ Login with admin credentials
8. ☐ Navigate to `/admin/dashboard`
9. ☐ Verify admin panel access
10. ☐ Change admin password (recommended)

---

## Support

If you continue to have issues:

1. **Check Firebase Configuration**
   - Verify `/utils/firebase/config.ts` has correct credentials
   - Check Firebase Console project is active

2. **Check Browser Console**
   - Press F12 to open developer tools
   - Look for error messages in Console tab
   - Check Network tab for failed requests

3. **Verify Firebase Rules**
   - Check Firestore security rules allow user creation
   - Check Authentication is enabled in Firebase Console

4. **Clear Cache**
   - Clear browser cache and cookies
   - Try in incognito/private mode
   - Try different browser

---

## Next Steps

After setting up admin account:

1. ✅ Change default password
2. ✅ Add sample FAQs
3. ✅ Test chat functionality
4. ✅ Configure Firebase email templates
5. ✅ Set up Firebase security rules
6. ✅ Enable analytics tracking
7. ✅ Customize admin panel branding

Your admin account is now ready to use! 🎉
