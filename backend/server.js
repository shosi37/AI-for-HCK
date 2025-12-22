// backend/server.js
require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')

const app = express()
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const sessions = require('./sessions')

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

const {
  FIREBASE_API_KEY,
  SERVICE_ACCOUNT_JSON,
  SERVICE_ACCOUNT_PATH,
  JWT_SECRET,
  PORT = 4000,
} = process.env

// Use a runtime secret; if not set, fall back to a dev secret and warn
const SECRET = JWT_SECRET || 'dev-secret'
if (!JWT_SECRET) console.warn('JWT_SECRET is not set. Using dev-secret for local testing — set JWT_SECRET in backend/.env for production')

// Initialize Firebase Admin
if (SERVICE_ACCOUNT_JSON) {
  try {
    const sa = JSON.parse(SERVICE_ACCOUNT_JSON)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  } catch (e) {
    console.error('Failed to parse SERVICE_ACCOUNT_JSON', e.message)
  }
} else if (SERVICE_ACCOUNT_PATH) {
  try {
    const sa = require(SERVICE_ACCOUNT_PATH)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  } catch (e) {
    console.error('Failed to load service account from path', SERVICE_ACCOUNT_PATH, e.message)
  }
} else {
  console.warn('Firebase Admin not initialized. PROFILE endpoint will only return token payload and sessions will use a local file fallback.')
}

// Migrate any existing file-based sessions into Firestore if admin is present
(async () => {
  if (admin.apps.length) {
    try {
      const result = await sessions.migrateFromFileDb()
      if (result && result.migrated) console.log(`sessions migration: migrated ${result.migrated}`)
    } catch (e) {
      console.warn('sessions migration failed', e.message)
    }
  }
})()


// Utility: call Firebase REST sign-in to verify email/password
async function firebaseSignInWithPassword(email, password) {
  if (!FIREBASE_API_KEY) throw new Error('Missing FIREBASE_API_KEY')
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`
  const res = await axios.post(url, { email, password, returnSecureToken: true })
  return res.data // contains idToken, localId (uid), email, displayName, emailVerified
}

// health check to make debugging easier
app.get('/api', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }))

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

  try {
    const fb = await firebaseSignInWithPassword(email, password)
    const uid = fb.localId

    // optionally verify user exists via Admin
    let userRecord = null
    try {
      if (admin.apps.length) {
        userRecord = await admin.auth().getUser(uid)
      }
    } catch (e) {
      // ignore admin lookup failure
      console.warn('admin lookup failed', e.message)
    }

    const payload = {
      uid,
      email: fb.email,
      displayName: fb.displayName || (userRecord && userRecord.displayName) || '',
      emailVerified: fb.emailVerified || (userRecord && userRecord.emailVerified) || false,
    }

    // short-lived access token (keeps sessions limited)
    const accessToken = jwt.sign(payload, SECRET, { expiresIn: process.env.ACCESS_EXPIRES || '15m' })

    // create a refresh token, persist a hash server-side and set secure HttpOnly cookie
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const refreshExpiryMs = parseInt(process.env.REFRESH_EXPIRES_MS || String(30 * 24 * 60 * 60 * 1000), 10) // default 30 days
    const expiresAt = Date.now() + refreshExpiryMs

    await sessions.createSession({ uid, tokenHash: refreshHash, expiresAt, meta: payload })

    // set HttpOnly cookie (secure in production)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiryMs
    })

    // log a short success message to help debug frontend login flow
    console.log('login success for uid', uid, 'email', fb.email)

    return res.json({ token: accessToken, user: payload })
  } catch (err) {
    // relay Firebase error message as friendly message, but avoid leaking internal codes
    console.error('login error', {
      status: err.response?.status,
      url: err.config?.url,
      data: err.response?.data,
      message: err.message
    })

    // Normalize message from multiple possible shapes returned by firebase/axios
    let msg = 'Login failed'
    if (err.response && err.response.data) {
      const d = err.response.data
      if (typeof d === 'string') msg = d
      else if (typeof d.error === 'string') msg = d.error
      else if (d.error && typeof d.error.message === 'string') msg = d.error.message
      else if (typeof d.message === 'string') msg = d.message
    } else if (err.message) {
      msg = err.message
    }

    const credentialIndicators = [
      'INVALID_PASSWORD', 'EMAIL_NOT_FOUND', 'INVALID_LOGIN_CREDENTIALS',
      'INVALID_EMAIL', 'USER_NOT_FOUND', 'EMAIL_EXISTS'
    ]

    if (credentialIndicators.some(k => msg && msg.toString().includes(k))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    return res.status(500).json({ error: msg })
  }
})

// Auth middleware to verify server JWT
function verifyToken(req, res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer (.+)$/)
  if (!m) return res.status(401).json({ error: 'Missing token' })
  const token = m[1]
  try {
    const payload = jwt.verify(token, SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.get('/api/profile', verifyToken, async (req, res) => {
  // if admin available, fetch latest user info
  if (admin.apps.length) {
    try {
      const rec = await admin.auth().getUser(req.user.uid)
      const u = {
        uid: rec.uid,
        email: rec.email,
        displayName: rec.displayName || req.user.displayName || '',
        emailVerified: rec.emailVerified || false,
      }
      return res.json({ user: u })
    } catch (e) {
      // fallback to token payload
      console.warn('admin getUser failed', e.message)
    }
  }

  return res.json({ user: req.user })
})

// Refresh endpoint to rotate refresh tokens and issue a new access token
app.post('/api/refresh', async (req, res) => {
  try {
    const rt = req.cookies && req.cookies.refreshToken
    if (!rt) return res.status(401).json({ error: 'Missing refresh token' })
    const hash = crypto.createHash('sha256').update(rt).digest('hex')
    const session = await sessions.findByTokenHash(hash)
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // use stored meta (payload) when available
    const payload = session.meta || { uid: session.uid }
    const newAccess = jwt.sign(payload, SECRET, { expiresIn: process.env.ACCESS_EXPIRES || '15m' })

    // rotate refresh token
    const newRt = crypto.randomBytes(64).toString('hex')
    const newHash = crypto.createHash('sha256').update(newRt).digest('hex')
    const refreshExpiryMs = parseInt(process.env.REFRESH_EXPIRES_MS || String(30 * 24 * 60 * 60 * 1000), 10)
    const newExpiresAt = Date.now() + refreshExpiryMs
    await sessions.rotateSession(hash, newHash, newExpiresAt)

    res.cookie('refreshToken', newRt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiryMs
    })

    return res.json({ token: newAccess })
  } catch (e) {
    console.error('refresh error', e)
    return res.status(500).json({ error: 'Refresh failed' })
  }
})

// Logout: remove current refresh token session and clear cookie
app.post('/api/logout', async (req, res) => {
  try {
    const rt = req.cookies && req.cookies.refreshToken
    if (rt) {
      const hash = crypto.createHash('sha256').update(rt).digest('hex')
      await sessions.deleteByTokenHash(hash)
    }
    res.clearCookie('refreshToken')
    return res.json({ ok: true })
  } catch (e) {
    console.error('logout error', e)
    return res.status(500).json({ error: 'Logout failed' })
  }
})

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`))
