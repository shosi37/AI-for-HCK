require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const admin = require('firebase-admin')
const sessions = require('./sessions')
const axios = require('axios')

/* ---------------- ENV ---------------- */
const {
  SERVICE_ACCOUNT_PATH,
  JWT_SECRET,
  FIREBASE_API_KEY,
  PORT = 4000,
} = process.env

if (!SERVICE_ACCOUNT_PATH) throw new Error('SERVICE_ACCOUNT_PATH missing')
if (!JWT_SECRET) throw new Error('JWT_SECRET missing')

/* ---------------- Firebase Admin ---------------- */
admin.initializeApp({
  credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
})

/* ---------------- App ---------------- */
const app = express()

/* ---------------- CORS (FIXED) ---------------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

// Allow setting additional allowed origins via BACKEND_ALLOWED_ORIGINS (comma separated)
if (process.env.BACKEND_ALLOWED_ORIGINS) {
  process.env.BACKEND_ALLOWED_ORIGINS.split(',').forEach(o => {
    const t = o && o.trim()
    if (t && !allowedOrigins.includes(t)) allowedOrigins.push(t)
  })
}

app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser requests (no Origin header)
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    // in development allow any localhost/127.0.0.1 origins (helps with multiple dev ports)
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true)
    }
    return cb(new Error('Blocked by CORS: ' + origin))
  },
  credentials: true,
}))

// 🔥 REQUIRED for preflight
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())

/* ---------------- Utils ---------------- */
const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // local dev
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

/* ---------------- Routes ---------------- */

app.get('/api', (_, res) => res.json({ ok: true }))

/**
 * Login with Firebase ID token
 */
app.post('/api/login-token', async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' })

  let decoded
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch (e) {
    console.error('login-token verify failed', e && (e.stack || e.message) || e)
    return res.status(401).json({ error: 'Invalid Firebase token' })
  }

  let payload = {
    uid: decoded.uid,
    email: decoded.email || '',
    displayName: decoded.name || '',
    emailVerified: !!decoded.email_verified,
  }

  // If we have an existing session or Firestore user record, prefer its meta so persisted photoURL isn't lost
  try {
    if (admin.apps.length) {
      const db = admin.firestore()
      // find the latest session for this uid, if any
      const q = await db.collection('sessions').where('uid', '==', payload.uid).orderBy('createdAt', 'desc').limit(1).get()
      if (!q.empty) {
        const s = q.docs[0].data()
        if (s && s.meta) {
          payload = { ...payload, ...s.meta }
        }
      } else {
        // fallback: check users collection
        const ud = await db.collection('users').doc(payload.uid).get()
        if (ud.exists) {
          const udata = ud.data() || {}
          if (udata.photoURL) payload.photoURL = udata.photoURL
          if (udata.displayName) payload.displayName = payload.displayName || udata.displayName
        }
      }
    } else {
      // file-based sessions.json fallback
      const fs = require('fs')
      const path = require('path')
      const FILE_PATH = path.join(__dirname, 'sessions.json')
      try {
        if (fs.existsSync(FILE_PATH)) {
          const raw = fs.readFileSync(FILE_PATH, 'utf8')
          const parsed = JSON.parse(raw)
          const arr = parsed.sessions || []
          const latest = arr.filter(s => s.uid === payload.uid).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0]
          if (latest && latest.meta) payload = { ...payload, ...latest.meta }
        }
      } catch (e) { /** ignore file read errors */ }
    }
  } catch (e) {
    console.warn('Failed to merge existing session meta for login-token', e && (e.message || e))
  }

  // include a proxy URL that the client can use to avoid direct external requests
  try {
    const proxyBase = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`
    payload.photoURLProxy = `${proxyBase.replace(/\/$/, '')}/api/avatar/${encodeURIComponent(payload.uid)}.svg`
  } catch (e) {}

  const accessToken = signAccessToken(payload)

  const refreshToken = crypto.randomBytes(64).toString('hex')
  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

  try {
    await sessions.createSession({
      uid: payload.uid,
      tokenHash: refreshHash,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      meta: payload,
    })
  } catch (e) {
    console.error('createSession failed for login-token', e && (e.stack || e.message) || e)
  }

  setRefreshCookie(res, refreshToken)
  console.log('login-token success for uid', payload.uid, 'email', payload.email)
  res.json({ token: accessToken, user: payload })
})


/**
 * Login with email+password (legacy/support for environments without ID-token exchange)
 */
app.post('/api/login', async (req, res) => {
  const { email, password, dev } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

  // quick config guard
  if (!FIREBASE_API_KEY) {
    // In development allow an explicit dev-mode credentialless login when `dev: true` is passed
    if (process.env.NODE_ENV !== 'production' && dev) {
      console.warn('DEV login used (FIREBASE_API_KEY missing) — creating a local dev session for', email)
      const uid = `dev:${email}`
      const payload = { uid, email, displayName: email.split('@')[0], emailVerified: false }
      const accessToken = signAccessToken(payload)
      const refreshToken = crypto.randomBytes(64).toString('hex')
      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
      try {
        await sessions.createSession({ uid, tokenHash: refreshHash, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, meta: payload })
      } catch (e) { console.error('createSession failed for dev login', e && (e.stack || e.message) || e) }
      setRefreshCookie(res, refreshToken)
      return res.json({ token: accessToken, user: payload })
    }

    return res.status(500).json({ error: 'Server configuration error: Missing FIREBASE_API_KEY. Set it in backend/.env or pass dev:true for local testing.' })
  }

  try {
    // call Firebase REST sign-in API
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`
    const r = await axios.post(url, { email, password, returnSecureToken: true })
    const fb = r.data
    const uid = fb.localId

    const payload = {
      uid,
      email: fb.email || '',
      displayName: fb.displayName || '',
      emailVerified: fb.emailVerified || false,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    try {
      await sessions.createSession({ uid, tokenHash: refreshHash, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, meta: payload })
    } catch (e) { console.error('createSession failed for login', e && (e.stack || e.message) || e) }

    setRefreshCookie(res, refreshToken)
    console.log('login success for uid', uid, 'email', fb.email)
    return res.json({ token: accessToken, user: payload })
  } catch (err) {
    console.error('login error', {
      status: err.response?.status,
      url: err.config?.url,
      data: err.response?.data,
      message: err.message
    })

    const d = err.response && err.response.data
    let msg = 'Login failed'
    if (d && d.error && d.error.message) msg = d.error.message

    const credentialIndicators = ['INVALID_PASSWORD','EMAIL_NOT_FOUND','INVALID_EMAIL','USER_NOT_FOUND','INVALID_LOGIN_CREDENTIALS']
    if (credentialIndicators.some(k => msg && msg.toString().includes(k))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    return res.status(500).json({ error: msg })
  }
})

/**
 * Auth middleware
 */
const requireAuth = (req, res, next) => {
  const h = req.headers.authorization
  if (!h) return res.status(401).json({ error: 'Missing token' })

  try {
    req.user = jwt.verify(h.replace('Bearer ', ''), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Profile
 */
app.get('/api/profile', requireAuth, async (req, res) => {
  // Prefer proxy URL for client display when available to avoid cross-origin blocks
  const u = { ...(req.user || {}) }
  if (u.photoURLProxy) {
    // If proxy provided as relative path, make it absolute using request origin
    if (typeof u.photoURLProxy === 'string' && u.photoURLProxy.startsWith('/')) {
      const origin = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`
      u.photoURL = `${origin}${u.photoURLProxy}`
    } else {
      u.photoURL = u.photoURLProxy
    }
  }
  res.json({ user: u })
})

// Update profile (update session meta and return a fresh access token)
app.post('/api/profile', requireAuth, async (req, res) => {
  const { displayName, photoURL } = req.body || {}
  const uid = req.user && req.user.uid
  if (!uid) return res.status(400).json({ error: 'Missing user in token' })

  const newMeta = { ...req.user, displayName: displayName || req.user.displayName || '', photoURL: photoURL || req.user.photoURL || '' }

  // Canonicalize generated avatar selections: if client sent inline SVG, blob, or a third-party API URL, store the backend proxy URL so API keys aren't exposed
  try {
    if (newMeta.photoURL && typeof newMeta.photoURL === 'string' && (newMeta.photoURL.startsWith('data:image/svg+xml') || newMeta.photoURL.startsWith('blob:') || newMeta.photoURL.includes('abstractapi.com') || newMeta.photoURL.includes('/api/avatar/abstract'))) {
      if (uid) {
        const proxyBase = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`
        newMeta.photoURL = `${proxyBase.replace(/\/$/, '')}/api/avatar/abstract/${encodeURIComponent(uid)}`
      }
    }
  } catch (e) {
    console.warn('avatar canonicalization failed', e && (e.message || e))
  }

  // Update sessions store: Firestore or file store
  try {
    if (admin.apps.length) {
      const db = admin.firestore()
      const q = await db.collection('sessions').where('uid', '==', uid).get()
      const batch = db.batch()
      q.docs.forEach(d => {
        const docRef = d.ref
        const meta = { ...(d.data().meta || {}), displayName: newMeta.displayName, photoURL: newMeta.photoURL }
        batch.update(docRef, { meta })
      })
      await batch.commit()
    } else {
      // file store: read, modify and write
      const fs = require('fs')
      const path = require('path')
      const FILE_PATH = path.join(__dirname, 'sessions.json')
      try {
        if (fs.existsSync(FILE_PATH)) {
          const raw = fs.readFileSync(FILE_PATH, 'utf8')
          const parsed = JSON.parse(raw)
          const sessionsArr = parsed.sessions || []
          const updated = sessionsArr.map(s => s.uid === uid ? { ...s, meta: { ...(s.meta || {}), displayName: newMeta.displayName, photoURL: newMeta.photoURL } } : s)
          fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions: updated }, null, 2))
        }
      } catch (e) { console.warn('Failed to update file store sessions', e && e.message) }
    }

    // sign a fresh token with updated meta and return it
    const tokenPayload = { uid, email: newMeta.email || '', displayName: newMeta.displayName || '', emailVerified: !!newMeta.emailVerified, photoURL: newMeta.photoURL || '' }
    // include a proxy URL that the client can use to avoid direct external requests
    try {
      const proxyBase = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`
      tokenPayload.photoURLProxy = `${proxyBase.replace(/\/$/, '')}/api/avatar/${encodeURIComponent(uid)}.svg`
    } catch (e) {}
    const newAccess = signAccessToken(tokenPayload)
    return res.json({ token: newAccess, user: tokenPayload })
  } catch (e) {
    console.error('Failed to update session meta', e && (e.stack || e.message) || e)
    return res.status(500).json({ error: 'Failed to update session meta' })
  }
})

// Admin helpers: check `meta/admins` and provide config endpoints
async function isAdminUser(uid, email) {
  try {
    if (!admin.apps.length) return false
    const snap = await admin.firestore().collection('meta').doc('admins').get()
    const data = snap.exists ? (snap.data() || {}) : {}
    const uids = data.uids || []
    const emails = data.emails || []
    if ((uid && uids.includes(uid)) || (email && emails.includes(email))) return true
  } catch (e) {
    console.warn('isAdminUser check failed', e && e.message)
  }
  return false
}

const verifyAdmin = async (req, res, next) => {
  const h = req.headers.authorization
  if (!h) return res.status(401).json({ error: 'Missing token' })
  const token = h.replace('Bearer ', '')
  let payload = null
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch (e) {
    try {
      payload = await admin.auth().verifyIdToken(token)
    } catch (ex) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
  const uid = payload.uid
  const email = payload.email || ''
  if (await isAdminUser(uid, email)) {
    req.user = { uid, email }
    return next()
  }
  return res.status(403).json({ error: 'Admin required' })
}

// Public config endpoint (no client-side Firestore access required)
app.get('/api/config/:doc', async (req, res) => {
  try {
    const docName = req.params.doc
    if (!admin.apps.length) {
      return res.status(500).json({ error: 'Server admin not configured' })
    }
    const snap = await admin.firestore().collection('config').doc(docName).get()
    if (!snap.exists) return res.status(404).json({ error: 'Not found' })
    return res.json({ data: snap.data() })
  } catch (e) {
    console.error('Failed to fetch config', e && (e.stack || e.message) || e)
    return res.status(500).json({ error: 'Failed to fetch config' })
  }
})

// Admin-only update endpoint
app.put('/api/config/:doc', verifyAdmin, async (req, res) => {
  try {
    const docName = req.params.doc
    const payload = req.body || {}
    if (!admin.apps.length) return res.status(500).json({ error: 'Server admin not configured' })
    await admin.firestore().collection('config').doc(docName).set(payload, { merge: true })
    return res.json({ ok: true })
  } catch (e) {
    console.error('Failed to set config', e && (e.stack || e.message) || e)
    return res.status(500).json({ error: 'Failed to set config' })
  }
})

// Dev-only helper to impersonate a user (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/__dev/impersonate', async (req, res) => {
    const u = req.body && req.body.user ? req.body.user : req.body
    if (!u || !u.uid) return res.status(400).json({ error: 'Missing user object with uid' })
    const payload = {
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      emailVerified: !!u.emailVerified,
      photoURL: u.photoURL || ''
    }
    const accessToken = signAccessToken(payload)
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const refreshExpiryMs = 30 * 24 * 60 * 60 * 1000
    try { await sessions.createSession({ uid: payload.uid, tokenHash: refreshHash, expiresAt: Date.now() + refreshExpiryMs, meta: payload }) } catch (e) { console.error('createSession failed in impersonate', e && (e.stack || e.message) || e) }
    setRefreshCookie(res, refreshToken)
    return res.json({ token: accessToken, user: payload })
  })

  // Simple health endpoint to verify AbstractAPI connectivity
  app.get('/api/avatar/abstract/health', async (req, res) => {
    const testName = 'healthcheck'
    const key = process.env.ABSTRACTAPI_KEY
    if (!key) return res.status(500).json({ ok: false, error: 'ABSTRACTAPI_KEY not configured' })
    try {
      const abstractUrl = `https://avatars.abstractapi.com/v1/?api_key=${encodeURIComponent(key)}&name=${encodeURIComponent(testName)}`
      const r = await axios.get(abstractUrl, { responseType: 'arraybuffer' })
      return res.json({ ok: true, providerStatus: r.status, contentType: r.headers['content-type'] || null })
    } catch (e) {
      console.error('AbstractAPI health check failed', e && (e.stack || e.message) || e)
      if (e && e.response) return res.status(502).json({ ok: false, providerStatus: e.response.status, providerData: e.response.data ? (e.response.data.toString ? e.response.data.toString() : e.response.data) : null })
      return res.status(502).json({ ok: false, error: 'Failed to contact AbstractAPI' })
    }
  })
}

/**
 * Refresh
 */
app.post('/api/refresh', async (req, res) => {
  const rt = req.cookies.refreshToken
  if (!rt) return res.status(401).json({ error: 'Missing refresh token' })

  const hash = crypto.createHash('sha256').update(rt).digest('hex')
  const session = await sessions.findByTokenHash(hash)

  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }

  const newAccess = signAccessToken(session.meta)
  res.json({ token: newAccess })
})

/**
 * Logout
 */
app.post('/api/logout', async (req, res) => {
  const rt = req.cookies.refreshToken
  if (rt) {
    const hash = crypto.createHash('sha256').update(rt).digest('hex')
    await sessions.deleteByTokenHash(hash)
  }
  res.clearCookie('refreshToken')
  res.json({ ok: true })
})

/* ---------------- Google OAuth (server-side) ---------------- */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI

function buildGoogleAuthUrl(login_hint) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent'
  })
  if (login_hint) params.set('login_hint', login_hint)
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

app.get('/api/oauth/google/start', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    return res.status(500).json({ error: 'Google OAuth not configured on server' })
  }

  const redirectTo = req.query.redirect || '/'
  const ok = allowedOrigins.some(o => redirectTo.startsWith(o)) || redirectTo.startsWith('/') || (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(redirectTo))
  if (!ok) return res.status(400).json({ error: 'Invalid redirect' })

  const login_hint = req.query.login_hint || ''
  const nonce = crypto.randomBytes(16).toString('hex')
  const stateObj = { nonce, redirectTo }
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url')

  res.cookie('oauth_state', nonce, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 5 * 60 * 1000 })
  const url = buildGoogleAuthUrl(login_hint) + `&state=${encodeURIComponent(state)}`
  return res.redirect(url)
})

app.get('/api/oauth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    if (!code) return res.status(400).send('Missing code')
    if (!state) return res.status(400).send('Missing state')

    let stateObj
    try { stateObj = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) } catch (e) { return res.status(400).send('Invalid state') }

    const nonceCookie = req.cookies && req.cookies.oauth_state
    if (!nonceCookie || nonceCookie !== stateObj.nonce) return res.status(400).send('Invalid state or expired')

    const params = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const { access_token } = tokenRes.data


// Proxy endpoint for AbstractAPI avatars to avoid exposing API keys and to prevent client-side CORS/Referer blocking
app.get('/api/avatar/abstract/:seed', async (req, res) => {
  try {
    const seed = req.params.seed
    if (!seed) return res.status(400).send('Missing seed')

    const key = process.env.ABSTRACTAPI_KEY
    if (!key) return res.status(500).send('AbstractAPI key not configured on server')

    const abstractUrl = `https://avatars.abstractapi.com/v1/?api_key=${encodeURIComponent(key)}&name=${encodeURIComponent(seed)}`
    const r = await axios.get(abstractUrl, { responseType: 'arraybuffer' })
    const ct = (r.headers && r.headers['content-type']) ? r.headers['content-type'] : 'image/png'

    res.set('Content-Type', ct)
    res.set('Cache-Control', 'public, max-age=31536000')
    // allow cross-origin image embedding from any origin
    res.set('Access-Control-Allow-Origin', '*')
    return res.send(Buffer.from(r.data))
  } catch (e) {
    // Improved logging and diagnostic response in dev
    console.error('Failed to proxy abstractapi avatar', e && (e.stack || e.message) || e)
    if (e && e.response) {
      console.error('Provider response status:', e.response.status)
      console.error('Provider response data:', (e.response.data && e.response.data.toString && e.response.data.toString()) || e.response.data)
      if (process.env.NODE_ENV !== 'production') {
        return res.status(502).json({ error: 'Failed to fetch avatar from provider', status: e.response.status, data: e.response.data ? (e.response.data.toString ? e.response.data.toString() : e.response.data) : null })
      }
    }
    return res.status(502).send('Failed to fetch avatar')
  }
})

    const uRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } })
    const u = uRes.data

    const payload = {
      uid: `google:${u.sub}`,
      email: u.email || '',
      displayName: u.name || '',
      emailVerified: !!u.email_verified,
      photoURL: u.picture || ''
    }

    const serverAccess = signAccessToken(payload)
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const refreshExpiryMs = 30 * 24 * 60 * 60 * 1000

    try {
      await sessions.createSession({ uid: payload.uid, tokenHash: refreshHash, expiresAt: Date.now() + refreshExpiryMs, meta: payload })
    } catch (e) {
      console.error('createSession failed during oauth', e && (e.stack || e.message) || e)
    }

    setRefreshCookie(res, refreshToken)
    res.clearCookie('oauth_state')

    const redirectTo = stateObj.redirectTo || '/'

    // Create a Firebase Custom Token so the client can sign in with the Firebase client SDK
    let firebaseCustomToken = null
    try {
      // Use the payload.uid as the uid in the custom token; include minimal claims
      firebaseCustomToken = await admin.auth().createCustomToken(payload.uid, { provider: 'google', email: payload.email })
      console.log('OAuth: created Firebase custom token for', payload.uid)
    } catch (e) {
      console.error('Failed to create Firebase custom token during OAuth callback', e && (e.stack || e.message) || e)
    }

    // Include the server access token and (if available) the Firebase custom token in the fragment
    const fragmentParts = [`access_token=${encodeURIComponent(serverAccess)}`]
    if (firebaseCustomToken) fragmentParts.push(`firebase_custom_token=${encodeURIComponent(firebaseCustomToken)}`)
    const fragment = `#${fragmentParts.join('&')}`

    return res.redirect(`${redirectTo}${fragment}`)
  } catch (e) {
    console.error('oauth callback error', e && (e.stack || e.message) || e)
    return res.status(500).send('OAuth error')
  }
})

/* ---------------- Start ---------------- */
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
)
