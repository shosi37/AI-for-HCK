/**
 * @fileoverview Authentication utilities.
 * Provides helper functions for signing JWTs, setting refresh cookies,
 * and middleware for protecting routes.
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { JWT_SECRET } = process.env;

// Ensure the JWT secret is available
if (!JWT_SECRET) throw new Error('JWT_SECRET missing');

/**
 * Signs a new access token with a 15-minute expiration.
 * @param {Object} payload - The user payload to encode in the token.
 * @returns {string} The signed JWT string.
 */
const signAccessToken = (payload) =>
    jwt.sign({ ...payload, jti: crypto.randomBytes(16).toString('hex') }, JWT_SECRET, { expiresIn: '15m' });

/**
 * Sets an HTTP-only cookie containing the refresh token.
 * @param {Object} res - Express response object.
 * @param {string} token - The refresh token to store in the cookie.
 */
const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Set to true in production with HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

/**
 * Express middleware to require authentication.
 * Verifies the JWT bearer token in the Authorization header.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const requireAuth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: 'Missing token' });

    try {
        // Verify token and attach payload to request user property
        req.user = jwt.verify(h.replace('Bearer ', ''), JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    signAccessToken,
    setRefreshCookie,
    requireAuth,
    JWT_SECRET
};
