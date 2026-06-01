/**
 * @fileoverview Main Express server configuration and entry point.
 * Sets up middleware, CORS, routing, and handles server startup.
 */

require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('./config/firebase'); // Initialize Firebase Admin SDK
const axios = require('axios'); // For AbstractAPI proxy

const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const oauthRoutes = require('./routes/oauth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------------- CORS Configuration ---------------- */
// Default allowed origins for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Append any additional origins from environment variables
if (process.env.BACKEND_ALLOWED_ORIGINS) {
  process.env.BACKEND_ALLOWED_ORIGINS.split(',').forEach(o => {
    const t = o && o.trim();
    if (t && !allowedOrigins.includes(t)) allowedOrigins.push(t);
  });
}

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (e.g., Postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    
    // Allow any localhost port in development
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    
    // Allow ngrok tunnels for testing
    if (/\.ngrok-free\.(app|dev)$/.test(origin)) {
      return cb(null, true);
    }
    
    return cb(new Error('Blocked by CORS: ' + origin));
  },
  credentials: true, // Allow cookies to be sent across origins
}));

app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

/* ---------------- Routes ---------------- */
app.use('/api/otp', otpRoutes);       // OTP authentication routes
app.use('/api/oauth', oauthRoutes);   // OAuth (e.g., Google) routes
app.use('/api', authRoutes);          // Standard auth routes (login, profile, etc.)
app.use('/api', chatRoutes);          // Chatbot and messaging routes
app.use('/api/admin', adminRoutes);   // Admin portal routes

// Simple health check endpoint
app.get('/api', (_, res) => res.json({ ok: true }));

/**
 * Avatar Proxy (AbstractAPI)
 * Proxies requests to AbstractAPI to generate and serve user avatars,
 * avoiding CORS issues from the frontend directly calling the API.
 * @route GET /api/avatar/abstract/:seed
 */
app.get('/api/avatar/abstract/:seed', async (req, res) => {
  try {
    const seed = req.params.seed;
    if (!seed) return res.status(400).send('Missing seed');

    const key = process.env.ABSTRACTAPI_KEY;
    if (!key) return res.status(500).send('AbstractAPI key not configured on server');

    const abstractUrl = `https://avatars.abstractapi.com/v1/?api_key=${encodeURIComponent(key)}&name=${encodeURIComponent(seed)}`;
    const r = await axios.get(abstractUrl, { responseType: 'arraybuffer' });
    const ct = (r.headers && r.headers['content-type']) ? r.headers['content-type'] : 'image/png';

    res.set('Content-Type', ct);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.set('Access-Control-Allow-Origin', '*');
    return res.send(Buffer.from(r.data));
  } catch (e) {
    console.error('Failed to proxy abstractapi avatar', e && (e.stack || e.message) || e);
    if (e && e.response) {
      if (process.env.NODE_ENV !== 'production') {
        return res.status(502).json({ error: 'Failed to fetch avatar', status: e.response.status });
      }
    }
    return res.status(502).send('Failed to fetch avatar');
  }
});

// Dev Impersonate Helper - only active in non-production environments
if (process.env.NODE_ENV !== 'production') {
  const { signAccessToken, setRefreshCookie } = require('./utils/auth');
  const sessions = require('./sessions');
  const crypto = require('crypto');

  app.post('/api/__dev/impersonate', async (req, res) => {
    const u = req.body && req.body.user ? req.body.user : req.body;
    if (!u || !u.uid) return res.status(400).json({ error: 'Missing user object with uid' });
    
    const payload = {
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      emailVerified: !!u.emailVerified,
      photoURL: u.photoURL || ''
    };
    
    const accessToken = signAccessToken(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    try { 
      await sessions.createSession({ uid: payload.uid, tokenHash: refreshHash, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, meta: payload }); 
    } catch (e) { 
      console.error('createSession failed in impersonate', e); 
    }
    
    setRefreshCookie(res, refreshToken);
    return res.json({ token: accessToken, user: payload });
  });
}

/* ---------------- Server Startup ---------------- */
/**
 * Starts the Express server, handling port conflicts by attempting
 * sequential ports if the primary port is in use.
 * @param {number} port - The port to attempt binding to.
 * @param {number} attempts - The number of retry attempts remaining.
 * @returns {http.Server} The running server instance.
 */
const startServer = (port = PORT, attempts = 5) => {
  const p = Number(port);
  const server = app.listen(p, () => console.log(`Backend running on http://localhost:${p}`));

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(` Port ${p} is in use.`);
      if (attempts > 0) {
        const nextPort = p + 1;
        console.log(`Trying port ${nextPort}...`);
        setTimeout(() => startServer(nextPort, attempts - 1), 300);
      } else {
        console.error('No available ports found. Exiting.');
        process.exit(1);
      }
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
  return server;
};

// Initiate server startup
startServer();
