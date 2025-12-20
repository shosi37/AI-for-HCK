// src/components/AuthCard.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from './AuthForm'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, getAdmins } from '../firebase'
import ThemeToggle from './ThemeToggle'
import BackButton from './BackButton'

export default function AuthCard() {
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)

  async function handleGoogle() {
    try {
      setBusy(true)
      await signInWithPopup(auth, googleProvider)
      // if this Google account is an admin, set a flag so Home can auto-open admin panel
      try {
        const u = auth.currentUser
        if (u && u.email) {
          const meta = await getAdmins()
          const emails = meta?.emails || []
          const uids = meta?.uids || []
          if (emails.includes(u.email) || uids.includes(u.uid)) {
            try { localStorage.setItem('admin-auto-open', '1') } catch (e) {}
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass p-6 md:p-10 rounded-2xl shadow-2xl max-w-xl mx-auto"
    >
      {/* HEADER + BACK BUTTON (SINGLE INSTANCE) */}
      <div className="flex items-center justify-between mb-6">
        <BackButton onClick={() => setMode('login')} />

        <ThemeToggle />
      </div>

     <div className="mb-4 text-center">
  <h1 className="text-2xl md:text-3xl font-semibold">
    {mode === 'login'
      ? 'Welcome'
      : mode === 'signup'
      ? 'Create Account'
      : 'Reset Password'}
  </h1>

  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
    {mode === 'login'
      ? 'Sign in to your account'
      : mode === 'signup'
      ? 'Create an account to get started'
      : 'Enter your email to reset your password'}
  </p>
</div>

      {/* AUTH FORM */}
      <AuthForm mode={mode} setMode={setMode} setBusy={setBusy} />

      <div className="flex items-center justify-center my-6">
  <div className="h-px bg-gray-300 dark:bg-gray-700 w-full"></div>

  <span className="
      mx-4 whitespace-nowrap 
      text-gray-500 dark:text-gray-400 text-sm
    ">
    or continue with
  </span>

  <div className="h-px bg-gray-300 dark:bg-gray-700 w-full"></div>
</div>

      {/* GOOGLE BUTTON */}
      <button
        onClick={handleGoogle}
        disabled={busy}
        className="
          w-full flex items-center justify-center gap-3 py-3 rounded-xl 
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
          shadow-sm hover:shadow-md transition focus-ring
        "
      >
        <FcGoogle className="text-2xl" />
        <span className="font-medium text-gray-700 dark:text-gray-200">
          Continue with Google
        </span>
      </button>

      {/* APPLE BUTTON (OPTIONAL) */}
      <button
        disabled
        className="
          w-full flex items-center justify-center gap-3 py-3 rounded-xl mt-3 
          bg-black text-white opacity-80 cursor-not-allowed 
        "
      >
        <FaApple className="text-xl" />
        <span className="font-medium">Continue with Apple</span>
      </button>

      {/* SWITCH LOGIN ↔ SIGNUP */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
        {mode !== 'signup' ? (
          <>
            Don’t have an account?{' '}
            <button
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => setMode('login')}
            >
              Log in
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
