/**
 * @fileoverview Admin routes for authentication and management.
 * Handles the login process for admin users against Firestore credentials.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const admin = require('../config/firebase');
const { signAccessToken } = require('../utils/auth');

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
        };
        const token = signAccessToken(payload);

        // Issue a Firebase Custom Token for client-side SDK integration
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
