// backend/server.js
require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')

const app = express()
app.use(cors())
app.use(express.json())

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
  console.warn('Firebase Admin not initialized. PROFILE endpoint will only return token payload.')
}

// Utility: call Firebase REST sign-in to verify email/password
async function firebaseSignInWithPassword(email, password) {
  if (!FIREBASE_API_KEY) throw new Error('Missing FIREBASE_API_KEY')
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`
  const res = await axios.post(url, { email, password, returnSecureToken: true })
  return res.data // contains idToken, localId (uid), email, displayName, emailVerified
}

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

    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' })

    return res.json({ token, user: payload, firebaseIdToken: fb.idToken })
  } catch (err) {
    // relay Firebase error message as friendly message
    console.error('login error', err.response?.data || err.message)
    const msg = err.response?.data?.error?.message || err.message || 'Login failed'

    if (msg === 'INVALID_PASSWORD' || msg === 'EMAIL_NOT_FOUND') {
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

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`))
