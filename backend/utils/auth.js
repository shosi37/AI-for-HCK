require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error('JWT_SECRET missing');

const signAccessToken = (payload) =>
    jwt.sign({ ...payload, jti: crypto.randomBytes(16).toString('hex') }, JWT_SECRET, { expiresIn: '15m' });

const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // local dev
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

const requireAuth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: 'Missing token' });

    try {
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
