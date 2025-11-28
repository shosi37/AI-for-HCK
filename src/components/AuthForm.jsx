// src/components/AuthForm.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase'
import { translateFirebaseError } from '../utils/firebaseErrors'
import ErrorPopup from './ErrorPopup'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function AuthForm({ mode, setMode, setBusy }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null) // global popup error (also used for success messages)
  const [fieldError, setFieldError] = useState('') // inline live error under input
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const emailRef = useRef(null)

  // email validation regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // suggested domains for quick completion
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com']

  // live validity
  const emailValid = emailPattern.test(email)

  // auto-clear popup after short time
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 3500)
    return () => clearTimeout(t)
  }, [error])

  // live validation while typing
  useEffect(() => {
    if (!email) {
      setFieldError('')
      return
    }
    if (emailValid) {
      setFieldError('')
    } else {
      // provide a friendly inline hint but not the big popup
      setFieldError("Enter a valid email (e.g. you@example.com)")
    }
  }, [email, emailValid])

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
        await sendEmailVerification(cred.user)
        // success note (use popup)
        setError('Account created — a verification email was sent.')
        setMode('login')
      } else if (mode === 'login') {
        try {
          await signInWithEmailAndPassword(auth, email, password)

          // 🔥 Success path:
          // 1) clear the red popup
          setError(null)

          // 2) persist a short-lived flag and name so Home can show the green popup even if it mounts later
          try {
            const nameToShow = auth.currentUser?.displayName || auth.currentUser?.email || ''
            localStorage.setItem('login-success', '1')
            localStorage.setItem('login-success-name', nameToShow)
            // schedule cleanup after 5s
            setTimeout(() => {
              try {
                localStorage.removeItem('login-success')
                localStorage.removeItem('login-success-name')
              } catch (e) {}
            }, 5000)
          } catch (e) {
            // ignore storage errors
            // (e.g. in private mode or restricted environments)
          }

          // 3) immediate event for the case Home is already mounted
          window.dispatchEvent(new CustomEvent('login-success'))
        } catch (err) {
          // unify credential-style errors to single friendly message
          if (CREDENTIAL_ERROR_CODES.has(err.code)) {
            setError('Invalid email or password')
          } else {
            setError(translateFirebaseError(err.code, err.message))
          }
          triggerShake()
          emailRef.current?.focus()
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
                ${!emailValid && email ? 'ring-2 ring-red-500/40 border-red-400' : ''}
                ${emailValid ? 'ring-2 ring-green-400/30 border-green-500' : ''}`}
              placeholder="you@company.com"
            />

            {/* green check when valid */}
            {emailValid && (
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
