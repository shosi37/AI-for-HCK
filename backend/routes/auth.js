/**
 * @fileoverview Main authentication routes.
 * Provides endpoints for token-based login, legacy email/password login,
 * profile management, session refresh, and admin-specific configurations.
 */

const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const sessions = require('../sessions');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // For verifyAdmin payload decoding

const { signAccessToken, setRefreshCookie, requireAuth, JWT_SECRET } = require('../utils/auth');
const { FIREBASE_API_KEY, BACKEND_PUBLIC_URL } = process.env;

/**
 * Route: POST /login-token
 * Authenticates a user using a Firebase ID token.
 * Validates the token, fetches user data from Firestore, merges session metadata,
 * creates a new active session, and issues a server-side access token.
 * @route POST /login-token
 * @returns {Object} JSON object containing the access token and user payload.
 */
router.post('/login-token', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

    let decoded;
    try {
        decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
        console.error('login-token verify failed', e && (e.stack || e.message) || e);
        return res.status(401).json({ error: 'Invalid Firebase token' });
    }

    let payload = {
        uid: decoded.uid,
        email: decoded.email || '',
        displayName: decoded.name || '',
        emailVerified: !!decoded.email_verified,
        isVerified: false, // Default to false, will be updated via Firestore check
    };

    // Always check Firestore for the latest user state to avoid stale session data
    try {
        const db = admin.firestore();
        const ud = await db.collection('users').doc(payload.uid).get();

        if (ud.exists) {
            const udata = ud.data() || {};
            // If we have an existing session, merge its meta FIRST
            const sessionQuery = await db.collection('sessions').where('uid', '==', payload.uid).orderBy('createdAt', 'desc').limit(1).get();
            if (!sessionQuery.empty) {
                const s = sessionQuery.docs[0].data();
                if (s && s.meta) {
                    payload = { ...payload, ...s.meta };
                }
            }

            // THEN override with the absolute truth from 'users' collection for critical fields
            if (udata.photoURL) payload.photoURL = udata.photoURL;
            if (udata.displayName) payload.displayName = udata.displayName || payload.displayName;
            if (udata.isVerified !== undefined) payload.isVerified = udata.isVerified;

            // Student details
            if (udata.studentId) payload.studentId = udata.studentId;
            if (udata.department) payload.department = udata.department;
            if (udata.year) payload.year = udata.year;
        }
    } catch (e) {
        console.warn('Failed to sync with Firestore in login-token', e && (e.message || e));
    }

    // Include a proxy URL that the client can use to avoid direct external avatar requests (CORS issues)
    try {
        const proxyBase = BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
        payload.photoURLProxy = `${proxyBase.replace(/\/$/, '')}/api/avatar/${encodeURIComponent(payload.uid)}.svg`;
    } catch (e) { }

    const accessToken = signAccessToken(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    try {
        await sessions.createSession({
            uid: payload.uid,
            tokenHash: refreshHash,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
            meta: payload,
        });
    } catch (e) {
        console.error('createSession failed for login-token', e && (e.stack || e.message) || e);
    }

    setRefreshCookie(res, refreshToken);
    console.log('login-token success for uid', payload.uid, 'email', payload.email);
    res.json({ token: accessToken, user: payload });
});

/**
 * Route: POST /login
 * Authenticates a user using a traditional email and password combination (Legacy).
 * Utilizes the Firebase Identity Toolkit REST API.
 * @route POST /login
 * @returns {Object} JSON object containing the access token and user payload.
 */
router.post('/login', async (req, res) => {
    const { email, password, dev } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    // Quick configuration guard for Firebase API Key
    if (!FIREBASE_API_KEY) {
        // DEV mode check - allows local login bypass if configured
        if (process.env.NODE_ENV !== 'production' && dev) {
            console.warn('DEV login used (FIREBASE_API_KEY missing) — creating a local dev session for', email);
            const uid = `dev:${email}`;
            const payload = { uid, email, displayName: email.split('@')[0], emailVerified: false };
            const accessToken = signAccessToken(payload);
            const refreshToken = crypto.randomBytes(64).toString('hex');
            const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            try {
                await sessions.createSession({ uid, tokenHash: refreshHash, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, meta: payload });
            } catch (e) { console.error('createSession failed for dev login', e && (e.stack || e.message) || e); }
            setRefreshCookie(res, refreshToken);
            return res.json({ token: accessToken, user: payload });
        }
        return res.status(500).json({ error: 'Server configuration error: Missing FIREBASE_API_KEY.' });
    }

    try {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const r = await axios.post(url, { email, password, returnSecureToken: true });
        const fb = r.data;
        const uid = fb.localId;

        const payload = {
            uid,
            email: fb.email || '',
            displayName: fb.displayName || '',
            emailVerified: fb.emailVerified || false,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        try {
            await sessions.createSession({ uid, tokenHash: refreshHash, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, meta: payload });
        } catch (e) { console.error('createSession failed for login', e && (e.stack || e.message) || e); }

        setRefreshCookie(res, refreshToken);
        console.log('login success for uid', uid, 'email', fb.email);
        return res.json({ token: accessToken, user: payload });
    } catch (err) {
        console.error('login error', err.response?.data || err.message);
        return res.status(401).json({ error: 'Invalid email or password' });
    }
});

/**
 * Route: GET /profile
 * Retrieves the currently authenticated user's profile information.
 * @route GET /profile
 * @returns {Object} JSON object containing the user profile.
 */
router.get('/profile', requireAuth, async (req, res) => {
    const u = { ...(req.user || {}) };
    
    // Resolve proxy URL for avatar to absolute URL if needed
    if (u.photoURLProxy) {
        if (typeof u.photoURLProxy === 'string' && u.photoURLProxy.startsWith('/')) {
            const origin = BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
            u.photoURL = `${origin}${u.photoURLProxy}`;
        } else {
            u.photoURL = u.photoURLProxy;
        }
    }
    res.json({ user: u });
});

/**
 * Route: POST /profile
 * Updates the user's profile information (e.g., displayName, photoURL).
 * Updates the session metadata in Firestore and issues a new access token.
 * @route POST /profile
 * @returns {Object} JSON object containing the updated access token and user payload.
 */
router.post('/profile', requireAuth, async (req, res) => {
    const { displayName, photoURL } = req.body || {};
    const uid = req.user && req.user.uid;
    if (!uid) return res.status(400).json({ error: 'Missing user in token' });

    // Construct the updated metadata object
    const newMeta = { 
        ...req.user, 
        displayName: displayName || req.user.displayName || '', 
        photoURL: photoURL || req.user.photoURL || '' 
    };

    // Canonicalize avatar URLs pointing to AbstractAPI to use the internal proxy
    try {
        if (newMeta.photoURL && typeof newMeta.photoURL === 'string' && (newMeta.photoURL.startsWith('data:image/svg+xml') || newMeta.photoURL.startsWith('blob:') || newMeta.photoURL.includes('abstractapi.com') || newMeta.photoURL.includes('/api/avatar/abstract'))) {
            if (uid) {
                const proxyBase = BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
                newMeta.photoURL = `${proxyBase.replace(/\/$/, '')}/api/avatar/abstract/${encodeURIComponent(uid)}`;
            }
        }
    } catch (e) {
        console.warn('avatar canonicalization failed', e && (e.message || e));
    }

    // Persist the updated metadata across all active sessions in Firestore
    try {
        if (admin.apps.length) {
            const db = admin.firestore();
            const q = await db.collection('sessions').where('uid', '==', uid).get();
            const batch = db.batch();
            q.docs.forEach(d => {
                const docRef = d.ref;
                const meta = { ...(d.data().meta || {}), displayName: newMeta.displayName, photoURL: newMeta.photoURL };
                batch.update(docRef, { meta });
            });
            await batch.commit();
        }

        // Sign a fresh access token with the updated metadata
        const tokenPayload = { 
            uid, 
            email: newMeta.email || '', 
            displayName: newMeta.displayName || '', 
            emailVerified: !!newMeta.emailVerified, 
            photoURL: newMeta.photoURL || '' 
        };
        
        try {
            const proxyBase = BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
            tokenPayload.photoURLProxy = `${proxyBase.replace(/\/$/, '')}/api/avatar/${encodeURIComponent(uid)}.svg`;
        } catch (e) { }
        
        const newAccess = signAccessToken(tokenPayload);
        return res.json({ token: newAccess, user: tokenPayload });
    } catch (e) {
        console.error('Failed to update session meta', e && (e.stack || e.message) || e);
        return res.status(500).json({ error: 'Failed to update session meta' });
    }
});

/**
 * Route: POST /refresh
 * Refreshes an expired access token using the HTTP-only refresh token cookie.
 * @route POST /refresh
 * @returns {Object} JSON object containing a new access token.
 */
router.post('/refresh', async (req, res) => {
    const rt = req.cookies.refreshToken;
    if (!rt) return res.status(401).json({ error: 'Missing refresh token' });

    // Validate the refresh token against the stored hash in the session database
    const hash = crypto.createHash('sha256').update(rt).digest('hex');
    const session = await sessions.findByTokenHash(hash);

    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Issue a new access token using the session's stored metadata
    const newAccess = signAccessToken(session.meta);
    res.json({ token: newAccess });
});

/**
 * Route: POST /logout
 * Ends the user session by deleting the session record and clearing the refresh token cookie.
 * @route POST /logout
 * @returns {Object} JSON indicating success.
 */
router.post('/logout', async (req, res) => {
    const rt = req.cookies.refreshToken;
    if (rt) {
        const hash = crypto.createHash('sha256').update(rt).digest('hex');
        await sessions.deleteByTokenHash(hash);
    }
    res.clearCookie('refreshToken');
    res.json({ ok: true });
});

/* ---------------- Admin Helpers and Config Routes ---------------- */

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
 */
const verifyAdmin = async (req, res, next) => {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: 'Missing token' });
    const token = h.replace('Bearer ', '');
    
    let payload = null;
    try {
        // First try verifying as an internal JWT
        payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        try {
            // If internal verification fails, fallback to Firebase ID token verification
            payload = await admin.auth().verifyIdToken(token);
        } catch (ex) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
    
    const uid = payload.uid;
    const email = payload.email || '';
    
    if (await isAdminUser(uid, email)) {
        req.user = { uid, email };
        return next();
    }
    
    return res.status(403).json({ error: 'Admin required' });
};

/**
 * Route: GET /config/:doc
 * Retrieves a public configuration document from Firestore.
 * @route GET /config/:doc
 * @returns {Object} The configuration data.
 */
router.get('/config/:doc', async (req, res) => {
    try {
        const docName = req.params.doc;
        const snap = await admin.firestore().collection('config').doc(docName).get();
        if (!snap.exists) return res.status(404).json({ error: 'Not found' });
        return res.json({ data: snap.data() });
    } catch (e) {
        console.error('Failed to fetch config', e && (e.stack || e.message) || e);
        return res.status(500).json({ error: 'Failed to fetch config' });
    }
});

/**
 * Route: PUT /config/:doc
 * Updates a configuration document in Firestore (Admin only).
 * @route PUT /config/:doc
 */
router.put('/config/:doc', verifyAdmin, async (req, res) => {
    try {
        const docName = req.params.doc;
        const payload = req.body || {};
        await admin.firestore().collection('config').doc(docName).set(payload, { merge: true });
        return res.json({ ok: true });
    } catch (e) {
        console.error('Failed to set config', e && (e.stack || e.message) || e);
        return res.status(500).json({ error: 'Failed to set config' });
    }
});

module.exports = router;
