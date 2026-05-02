const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const admin = require('../config/firebase');
const { signAccessToken } = require('../utils/auth');

/**
 * POST /admin/login
 * Body: { username, password }
 *
 * Checks against Firestore meta/adminCredentials:
 *   - username  (string)
 *   - hash      (SHA-256 hex of the password)
 *
 * Returns { token } on success, 401 on failure.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const db = admin.firestore();
        const snap = await db.collection('meta').doc('adminCredentials').get();

        if (!snap.exists) {
            console.error('[admin/login] meta/adminCredentials document not found');
            return res.status(500).json({ error: 'Admin credentials not configured' });
        }

        const data = snap.data() || {};
        // username may be stored as a string or as an array (Firestore array field)
        const rawUsername = data.username;
        const storedUsername = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;
        const storedHash = data.hash;

        if (!storedUsername || !storedHash) {
            console.error('[admin/login] meta/adminCredentials missing username or hash fields');
            return res.status(500).json({ error: 'Admin credentials incomplete' });
        }

        // Compare username
        if (username !== storedUsername) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Compare password — stored hash is SHA-256 hex
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (passwordHash !== storedHash) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Issue a JWT with an admin flag
        const payload = {
            uid: `admin:${username}`,
            email: username,
            displayName: 'Admin',
            isAdmin: true,
        };
        const token = signAccessToken(payload);

        // Issue a Firebase Custom Token
        const firebaseToken = await admin.auth().createCustomToken(`admin:${username}`, {
            email: username,
            admin: true
        });

        console.log('[admin/login] Admin login successful for', username);
        return res.json({ token, firebaseToken, user: payload });

    } catch (err) {
        console.error('[admin/login] Error:', err && (err.stack || err.message) || err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
