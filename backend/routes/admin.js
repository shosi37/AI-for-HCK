/**
 * @fileoverview Admin routes for authentication and management.
 * Handles the login process for admin users against Firestore credentials.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const { signAccessToken, JWT_SECRET } = require('../utils/auth');

// Initialize Firestore reference
const db = admin.firestore();

/**
 * Route: POST /admin/login
 * Validates admin credentials against stored hash in Firestore.
 * Expects a body containing { username, password }.
 * @route POST /login
 * @returns {Object} JSON object containing access tokens or an error message.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const db = admin.firestore();
        // Fetch the admin credentials stored in the 'meta/adminCredentials' document
        const snap = await db.collection('meta').doc('adminCredentials').get();

        if (!snap.exists) {
            console.error('[admin/login] meta/adminCredentials document not found');
            return res.status(500).json({ error: 'Admin credentials not configured' });
        }

        const data = snap.data() || {};
        // Username may be stored as a string or as an array (Firestore array field)
        const rawUsername = data.username;
        const storedUsername = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;
        const storedHash = data.hash;

        if (!storedUsername || !storedHash) {
            console.error('[admin/login] meta/adminCredentials missing username or hash fields');
            return res.status(500).json({ error: 'Admin credentials incomplete' });
        }

        // Compare the provided username
        if (username !== storedUsername) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Compare password — the stored hash is expected to be a SHA-256 hex string
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (passwordHash !== storedHash) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Issue a server-side JWT with an admin flag
        const payload = {
            uid: `admin:${username}`,
            email: username,
            displayName: 'Admin',
            isAdmin: true,
            admin: true,
        };
        const token = signAccessToken(payload);

        // Issue a Firebase Custom Token for client-side SDK integration
        const firebaseToken = await admin.auth().createCustomToken(`admin:${username}`, {
            email: username,
            admin: true
        });

        // Ensure admin is registered in meta/admins for fallback verification
        try {
            const metaAdminsRef = db.collection('meta').doc('admins');
            const metaAdminsSnap = await metaAdminsRef.get();
            const metaAdminsData = metaAdminsSnap.exists ? (metaAdminsSnap.data() || {}) : {};
            
            const adminUids = metaAdminsData.uids || [];
            const adminEmails = metaAdminsData.emails || [];
            const adminUid = `admin:${username}`;
            
            // Add admin to the collection if not already present
            if (!adminUids.includes(adminUid) || !adminEmails.includes(username)) {
                await metaAdminsRef.set({
                    uids: Array.from(new Set([...adminUids, adminUid])),
                    emails: Array.from(new Set([...adminEmails, username])),
                    updatedAt: new Date(),
                }, { merge: true });
                console.log('[admin/login] Added admin to meta/admins collection:', username);
            }
        } catch (err) {
            console.warn('[admin/login] Failed to update meta/admins:', err && err.message);
        }

        console.log('[admin/login] Admin login successful for', username);
        return res.json({ token, firebaseToken, user: payload });

    } catch (err) {
        console.error('[admin/login] Error:', err && (err.stack || err.message) || err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Checks if a given user is designated as an admin.
 * Evaluates against the 'meta/admins' document in Firestore.
 * @param {string} uid - The user's UID.
 * @param {string} email - The user's email address.
 * @returns {Promise<boolean>} True if the user is an admin.
 */
async function isAdminUser(uid, email) {
    try {
        if (!admin.apps.length) return false;
        const snap = await admin.firestore().collection('meta').doc('admins').get();
        const data = snap.exists ? (snap.data() || {}) : {};
        const uids = data.uids || [];
        const emails = data.emails || [];
        
        if ((uid && uids.includes(uid)) || (email && emails.includes(email))) return true;
    } catch (e) {
        console.warn('isAdminUser check failed', e && e.message);
    }
    return false;
}

/**
 * Express middleware to verify if the requesting user has admin privileges.
 * Supports both internal server JWTs and Firebase ID tokens.
 * Checks for admin status in the following order:
 * 1. Internal JWT with isAdmin flag
 * 2. Firebase ID token with admin custom claim
 * 3. Firestore meta/admins collection
 */
const verifyAdmin = async (req, res, next) => {
    const h = req.headers.authorization;
    if (!h) {
        console.warn('[verifyAdmin] Missing authorization header');
        return res.status(401).json({ error: 'Missing token' });
    }
    
    const token = h.replace('Bearer ', '');
    let payload = null;
    let tokenType = 'unknown';
    
    try {
        // First try verifying as an internal JWT
        payload = jwt.verify(token, JWT_SECRET);
        tokenType = 'internal-jwt';
        console.log('[verifyAdmin] Token verified as internal JWT, uid:', payload.uid);
    } catch (e) {
        try {
            // If internal verification fails, fallback to Firebase ID token verification
            payload = await admin.auth().verifyIdToken(token);
            tokenType = 'firebase-id-token';
            console.log('[verifyAdmin] Token verified as Firebase ID token, uid:', payload.uid);
        } catch (ex) {
            console.error('[verifyAdmin] Token verification failed:', ex && (ex.message || ex));
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
    
    const uid = payload.uid || payload.sub;
    const email = payload.email || '';
    
    console.log('[verifyAdmin] Checking admin privileges for:', { uid, email, tokenType });
    
    // Check if user is admin - support multiple claim names for flexibility
    const isAdminByJwt = payload.isAdmin === true;
    const isAdminByClaim = payload.admin === true;
    
    if (isAdminByJwt) {
        console.log('[verifyAdmin] Admin verified via isAdmin claim');
        req.user = { uid, email, isAdmin: true };
        return next();
    }
    
    if (isAdminByClaim) {
        console.log('[verifyAdmin] Admin verified via admin custom claim');
        req.user = { uid, email, isAdmin: true };
        return next();
    }
    
    // Fallback: check Firestore meta/admins collection
    try {
        const isAdmin = await isAdminUser(uid, email);
        if (isAdmin) {
            console.log('[verifyAdmin] Admin verified via meta/admins collection');
            req.user = { uid, email, isAdmin: true };
            return next();
        }
    } catch (err) {
        console.error('[verifyAdmin] Error checking meta/admins:', err && err.message);
    }
    
    console.warn('[verifyAdmin] Admin verification failed for uid:', uid);
    return res.status(403).json({ error: 'Admin required' });
};

/**
 * Route: DELETE /admin/users/:userId
 * Deletes a user from Firebase Authentication (Admin only).
 * Securely requires admin token validation.
 * @route DELETE /users/:userId
 * @returns {Object} JSON object indicating success or failure.
 */
router.delete('/users/:userId', verifyAdmin, async (req, res) => {
    const { userId } = req.params;
    const adminUid = req.user?.uid;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }

    try {
        console.log(`[admin/delete-user] Admin ${adminUid} requesting deletion of user ${userId}`);
        
        // Delete user from Firebase Auth using Firebase Admin SDK
        await admin.auth().deleteUser(userId);
        console.log(`[admin/delete-user] Successfully deleted user ${userId} from Firebase Auth`);
        return res.json({ success: true, message: 'User deleted from Firebase Authentication' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.warn(`[admin/delete-user] User ${userId} not found in Firebase Auth, proceeding.`);
            return res.json({ success: true, warning: 'User not found in Authentication' });
        }
        
        const errorMsg = (error.message || '').toLowerCase();
        const errorCode = (error.code || '').toLowerCase();
        
        if (errorCode.includes('permission') || errorCode.includes('credential') || 
            errorMsg.includes('permission') || errorMsg.includes('credential')) {
            console.warn(`[admin/delete-user] Firebase Service Account has insufficient permissions:`, error.message);
            return res.json({ 
                success: true, 
                warning: 'Firebase service account has insufficient permissions. Student was removed from the database, but please delete their credentials manually in Firebase Authentication.' 
            });
        }
        
        console.error(`[admin/delete-user] Error deleting user ${userId}:`, error);
        return res.status(500).json({ error: error.message || 'Failed to delete user from Firebase Auth' });
    }
});

module.exports = router;
