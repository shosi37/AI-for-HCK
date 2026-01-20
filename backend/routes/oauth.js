const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const admin = require('../config/firebase');
const sessions = require('../sessions');
const { signAccessToken, setRefreshCookie } = require('../utils/auth');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI, BACKEND_PUBLIC_URL } = process.env;

// ALLOWED_ORIGINS needed for redirect check?
// Ideally move allowedOrigins check to utils or config if reused, but here we can just use a simple regex for dev/prod.
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];
if (process.env.BACKEND_ALLOWED_ORIGINS) {
    process.env.BACKEND_ALLOWED_ORIGINS.split(',').forEach(o => {
        const t = o && o.trim();
        if (t && !allowedOrigins.includes(t)) allowedOrigins.push(t);
    });
}

function buildGoogleAuthUrl(login_hint) {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        include_granted_scopes: 'true',
        prompt: 'consent'
    });
    if (login_hint) params.set('login_hint', login_hint);
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

router.get('/google/start', (req, res) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_OAUTH_REDIRECT_URI) {
        return res.status(500).json({ error: 'Google OAuth not configured on server' });
    }

    const redirectTo = req.query.redirect || '/';
    const ok = allowedOrigins.some(o => redirectTo.startsWith(o)) || redirectTo.startsWith('/') || (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(redirectTo));
    if (!ok) return res.status(400).json({ error: 'Invalid redirect' });

    const login_hint = req.query.login_hint || '';
    const nonce = crypto.randomBytes(16).toString('hex');
    const stateObj = { nonce, redirectTo };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');

    res.cookie('oauth_state', nonce, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 5 * 60 * 1000 });
    const url = buildGoogleAuthUrl(login_hint) + `&state=${encodeURIComponent(state)}`;
    return res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) return res.status(400).send('Missing code');
        if (!state) return res.status(400).send('Missing state');

        let stateObj;
        try { stateObj = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')); } catch (e) { return res.status(400).send('Invalid state'); }

        const nonceCookie = req.cookies && req.cookies.oauth_state;
        if (!nonceCookie || nonceCookie !== stateObj.nonce) return res.status(400).send('Invalid state or expired');

        const params = new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const { access_token } = tokenRes.data;

        const uRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
        const u = uRes.data;

        const payload = {
            uid: `google:${u.sub}`,
            email: u.email || '',
            displayName: u.name || '',
            emailVerified: !!u.email_verified,
            photoURL: u.picture || ''
        };

        const serverAccess = signAccessToken(payload);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const refreshExpiryMs = 30 * 24 * 60 * 60 * 1000;

        try {
            await sessions.createSession({ uid: payload.uid, tokenHash: refreshHash, expiresAt: Date.now() + refreshExpiryMs, meta: payload });
        } catch (e) {
            console.error('createSession failed during oauth', e && (e.stack || e.message) || e);
        }

        setRefreshCookie(res, refreshToken);
        res.clearCookie('oauth_state');

        const redirectTo = stateObj.redirectTo || '/';

        // Create a Firebase Custom Token so the client can sign in with the Firebase client SDK
        let firebaseCustomToken = null;
        try {
            // Use the payload.uid as the uid in the custom token; include minimal claims
            firebaseCustomToken = await admin.auth().createCustomToken(payload.uid, { provider: 'google', email: payload.email });
            console.log('OAuth: created Firebase custom token for', payload.uid);
        } catch (e) {
            console.error('Failed to create Firebase custom token during OAuth callback', e && (e.stack || e.message) || e);
        }

        // Include the server access token and (if available) the Firebase custom token in the fragment
        const fragmentParts = [`access_token=${encodeURIComponent(serverAccess)}`];
        if (firebaseCustomToken) fragmentParts.push(`firebase_custom_token=${encodeURIComponent(firebaseCustomToken)}`);
        const fragment = `#${fragmentParts.join('&')}`;

        return res.redirect(`${redirectTo}${fragment}`);
    } catch (e) {
        console.error('oauth callback error', e && (e.stack || e.message) || e);
        return res.status(500).send('OAuth error');
    }
});

module.exports = router;
