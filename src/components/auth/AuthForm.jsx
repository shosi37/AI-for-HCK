import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase'
import ErrorPopup from '../ErrorPopup'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { translateFirebaseError } from '../../utils/firebaseErrors'

export default function AuthForm({ mode = 'login', setMode = () => {}, setBusy = () => {} }) {
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
        try {
          // POST to backend which verifies via Firebase and returns a server-signed JWT
          const base = import.meta.env.VITE_BACKEND_URL || ''
          const r = await fetch(`${base}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          if (!r.ok) {
            const body = await r.json().catch(() => ({}))
            const msg = body.error || 'Login failed'
            if (msg === 'Invalid email or password') {
              setError('Invalid email or password')
            } else {
              setError(msg)
            }
            triggerShake()
            emailRef.current?.focus()
            throw new Error(msg)
          }

          const body = await r.json()

          // store server token (visible in DevTools -> Application -> Local Storage)
          try { localStorage.setItem('auth-token', body.token) } catch (e) {}

          // try to also sign into Firebase client SDK so the rest of the app (email verification etc.) keeps working
          try {
            await signInWithEmailAndPassword(auth, email, password)
          } catch (e) {
            // ignore if this fails; backend login is the authoritative path
            console.warn('client firebase sign-in failed after backend login', e?.message || e)
          }

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

          // immediate event for the case Home is already mounted
          window.dispatchEvent(new CustomEvent('login-success'))
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

