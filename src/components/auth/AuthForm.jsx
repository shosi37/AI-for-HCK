import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase'
import { ErrorPopup } from '../error' 
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc' 
import { translateFirebaseError } from '../../utils/firebaseErrors'

export default function AuthForm({ mode = 'login', setMode = () => {}, setBusy = () => {}, showGoogleButton = true }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState('')
  const [shake, setShake] = useState(false)
  const emailRef = useRef(null)

  const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // live validation while typing
  useEffect(() => {
    if (!email) {
      setFieldError('')
      return
    }
    if (emailPattern.test(email)) {
      setFieldError('')
    } else {
      // provide a friendly inline hint but not the big popup
      setFieldError('Enter a valid email (e.g. you@example.com)')
    }
  }, [email])

  // helper: trigger shake animation
  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  // suggestion generator (first domain)
  function suggestionFor(emailText) {
    if (!emailText || emailText.includes('@')) return null
    return `${emailText}@${commonDomains[0]}`
  }

  // Google sign-in helper (starts server-side OAuth flow)
  const base = import.meta.env.VITE_BACKEND_URL || ''
  function handleGoogleSignIn() {
    const redirect = window.location.origin
    console.log('[AuthForm] Starting Google OAuth, redirecting to:', `${base}/api/oauth/google/start?redirect=${encodeURIComponent(redirect)}`)
    // open in same tab so the OAuth callback can set HttpOnly cookies from the backend
    window.location.href = `${base}/api/oauth/google/start?redirect=${encodeURIComponent(redirect)}`
  }

  // unified credential-failure codes that should show "Invalid email or password"
  const CREDENTIAL_ERROR_CODES = new Set([
    'auth/wrong-password',
    'auth/invalid-credential',
    'auth/user-not-found',
    'auth/invalid-email',
  ])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setFieldError('')
    setLoading(true)
    setBusy(true)

    // manual validation (prevent browser HTML validation)
    if (!emailPattern.test(email)) {
      // show consistent message everywhere
      setError('Invalid email or password')
      setFieldError('Enter a valid email (e.g. you@example.com)')
      triggerShake()
      setLoading(false)
      setBusy(false)
      // focus input for convenience
      emailRef.current?.focus()
      return
    }

    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name) await updateProfile(cred.user, { displayName: name })
        await sendPasswordResetEmail(cred.user)
        // note: previous flow used sendEmailVerification; if you want verification on signup switch to sendEmailVerification
        setError('Account created — a verification email was sent.')
        setMode('login')
      } else if (mode === 'login') {
        // `body` holds the server response (either from ID token exchange or credentials fallback)
        let body = null
        try {
          // Preferred flow (production-ready): sign in with Firebase client SDK to get an ID token,
          // then exchange the ID token with the backend (/api/login-token) which verifies the token and issues server session/refresh cookie.
            //
            // NOTE (ID token vs Access token):
            // - ID tokens (JWTs) assert the user's identity and are obtained by the client from Firebase.
            // - Access tokens are bearer tokens used by resource servers (APIs) to authorize requests.
            // In this app we send the ID token to our BACKEND for verification (using the Admin SDK). The backend MUST verify
            // the ID token before trusting it, then issues a short-lived server-signed access token and sets a secure HttpOnly
            // refresh cookie to maintain the session. This keeps long-lived secrets out of the browser and ensures the API
            // receives a backend-issued access token for authorization. (See README for more details.)
          try {
            const cred = await signInWithEmailAndPassword(auth, email, password)
            console.log('[AuthForm] Signed in with Firebase client:', { uid: cred.user?.uid, email: cred.user?.email })
            const idToken = await cred.user.getIdToken()
            console.log('[AuthForm] Obtained ID token length:', idToken ? idToken.length : 'none')

            const r = await fetch(`${base}/api/login-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ idToken })
            })

            console.log('[AuthForm] POST /api/login-token ->', `${base}/api/login-token`, 'status:', r.status)

            if (!r.ok) {
              const b = await r.json().catch(() => ({}))
              const msg = b.error || 'Login failed'
              if (msg === 'Invalid email or password') setError('Invalid email or password')
              else setError(msg)
              triggerShake()
              emailRef.current?.focus()
              throw new Error(msg)
            }

            body = await r.json()
          } catch (e) {
            // Fallback: some environments may not have Admin configured or ID-token exchange might fail; fall back to server login using credentials
            console.warn('ID-token login failed, falling back to credentials flow:', e?.message || e)
            const r2 = await fetch(`${base}/api/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ email, password })
            })

            console.log('[AuthForm] POST /api/login ->', `${base}/api/login`, 'status:', r2.status)

            if (!r2.ok) {
              const bodyErr = await r2.json().catch(() => ({}))
              const msg = bodyErr.error || 'Login failed'

              // If server is misconfigured, offer dev impersonation fallback in development
              const misconfIndicators = ['Missing FIREBASE_API_KEY', 'Server not configured to verify id tokens']
              if (misconfIndicators.some(k => msg && msg.includes(k))) {
                const friendly = 'Server misconfigured for auth (backend missing FIREBASE_API_KEY or service account).'
                setError(friendly + ' You can either configure the backend or use a local dev impersonation.')
                triggerShake()

                // prompt developer to use dev impersonation (only in non-production)
                if (import.meta.env.MODE !== 'production') {
                  const ok = window.confirm('Use a local dev impersonation for this account? (Only for local development)')
                  if (ok) {
                    try {
                      const imp = await fetch(`${base}/api/__dev/impersonate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ user: { uid: `dev:${email}`, email, displayName: email.split('@')[0], emailVerified: false } })
                      })
                      if (imp.ok) {
                        body = await imp.json()
                      } else {
                        const b = await imp.json().catch(() => ({}))
                        throw new Error(b.error || 'Impersonation failed')
                      }
                    } catch (impErr) {
                      setError('Dev impersonation failed: ' + (impErr && impErr.message || impErr))
                      throw impErr
                    }
                  } else {
                    throw new Error(msg)
                  }
                } else {
                  throw new Error(msg)
                }
              }

              if (msg === 'Invalid email or password') setError('Invalid email or password')
              else setError(msg)
              triggerShake()
              emailRef.current?.focus()
              throw new Error(msg)
            }

            body = await r2.json()

            // ensure client SDK is signed in when using credentials flow
            try { await signInWithEmailAndPassword(auth, email, password) } catch (e2) { console.warn('client firebase sign-in failed after backend login', e2?.message || e2) }
          }

          // store server token (visible in DevTools -> Application -> Local Storage)
          try { if (body && body.token) localStorage.setItem('auth-token', body.token) } catch (e) {}

          // 🔥 Success path — use backend user info when available
          setError(null)

          try {
            const nameToShow = (body.user && (body.user.displayName || body.user.email)) || auth.currentUser?.displayName || auth.currentUser?.email || ''
            localStorage.setItem('login-success', '1')
            localStorage.setItem('login-success-name', nameToShow)

            // Also write into sessionStorage for immediate session-only visibility (DevTools -> Session Storage)
            try {
              const minimal = JSON.stringify({ uid: (body.user && body.user.uid) || auth.currentUser?.uid || '', email: (body.user && body.user.email) || auth.currentUser?.email || '', displayName: (body.user && body.user.displayName) || auth.currentUser?.displayName || '' })
              sessionStorage.setItem('session-user', minimal)
              sessionStorage.setItem('login-success', '1')
              sessionStorage.setItem('login-success-name', nameToShow)
            } catch (e) { /* ignore sessionStorage errors */ }

            // schedule cleanup after 5s
            setTimeout(() => {
              try {
                localStorage.removeItem('login-success')
                localStorage.removeItem('login-success-name')
                // Also remove session flags after 5s to avoid stale UI signals
                try {
                  sessionStorage.removeItem('login-success')
                  sessionStorage.removeItem('login-success-name')
                } catch (e) {}
              } catch (e) {}
            }, 5000)
          } catch (e) {
            // ignore storage errors
          }

          // immediate event for the case Home is already mounted — include user detail so any listener can update state
          window.dispatchEvent(new CustomEvent('login-success', { detail: { user: body.user } }))
        } catch (err) {
          // record error in sessionStorage for debugging
          try {
            sessionStorage.setItem('login-error', JSON.stringify({ message: err.message || 'Login error', code: err.code || null, time: Date.now() }))
          } catch (e) {}
          throw err
        }
      } else if (mode === 'reset') {
        try {
          await sendPasswordResetEmail(auth, email)
          setError('Password reset email sent.')
          setMode('login')
        } catch (err) {
          // For reset, treat invalid-email / user-not-found as the unified message
          if (CREDENTIAL_ERROR_CODES.has(err.code)) {
            setError('Invalid email or password')
          } else {
            setError(translateFirebaseError(err.code, err.message))
          }
          // record error in sessionStorage
          try {
            sessionStorage.setItem('login-error', JSON.stringify({ message: err.message || 'Reset error', code: err.code || null, time: Date.now() }))
          } catch (e) {}
          triggerShake()
          emailRef.current?.focus()
          throw err
        }
      }
    } catch (e) {
      // already handled above; log for dev
      console.error('AuthForm error ->', e)
    } finally {
      setLoading(false)
      setBusy(false)
    }
  }

  // apply suggestion into the field
  function applySuggestion(sugg) {
    if (!sugg) return
    setEmail(sugg)
    // focus input and place caret at end
    setTimeout(() => {
      emailRef.current?.focus()
      emailRef.current?.setSelectionRange(sugg.length, sugg.length)
    }, 50)
  }

  return (
    <>
      {/* global animated popup */}
      <ErrorPopup message={error} />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 space-y-4"
      >
        {mode === 'signup' && (
          <div>
            <label className="text-sm">Full name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus-ring"
              placeholder="Jane Doe"
            />
          </div>
        )}

        {/* EMAIL FIELD */}
        <div>
          <label className="text-sm">Email</label>

          <motion.div
            animate={shake ? { x: [0, -8, 8, -6, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <input
              ref={emailRef}
              required
              type="text" // use text to stop browser native validation popup
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`mt-1 w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus-ring pr-12
                ${!emailPattern.test(email) && email ? 'ring-2 ring-red-500/40 border-red-400' : ''}
                ${emailPattern.test(email) ? 'ring-2 ring-green-400/30 border-green-500' : ''}`}
              placeholder="you@company.com"
            />

            {/* green check when valid */}
            {emailPattern.test(email) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300">
                <FiCheckCircle className="text-2xl" />
              </span>
            )}

            {/* inline suggestion pill when there's no @ yet */}
            {!email.includes('@') && email.trim().length > 0 && (
              <button
                type="button"
                onClick={() => applySuggestion(suggestionFor(email.trim()))}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-sm bg-gray-100/70 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md hover:opacity-90"
              >
                Suggest: {suggestionFor(email.trim())}
              </button>
            )}
          </motion.div>

          {/* live inline error */}
          {fieldError && (
            <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <FiAlertCircle />
              <span>{fieldError}</span>
            </div>
          )}
        </div>

        {/* PASSWORD */}
        {mode !== 'reset' && (
          <div>
            <label className="text-sm">Password</label>
            <input
              required
              type="password"
              name="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus-ring"
              placeholder="••••••••"
            />
          </div>
        )}

        {/* CENTERED SUBMIT BUTTON */}
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="btn-primary text-center px-8 flex items-center gap-3"
            disabled={loading}
          >
            {loading
              ? 'Working...'
              : mode === 'login'
              ? 'Log in'
              : mode === 'signup'
              ? 'Create account'
              : 'Send reset email'}
          </button>
        </div>

        {/* CONTINUE WITH GOOGLE (server-side flow) - shown here unless parent disables it */}
        {mode === 'login' && showGoogleButton && (
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mt-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition focus-ring"
            >
              <FcGoogle className="text-2xl" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Continue with Google</span>
            </button>
          </div>
        )} 

        {/* FORGOT */}
        {mode === 'login' && (
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              Forgot?
            </button>
          </div>
        )}
      </motion.form>
    </>
  )
}

