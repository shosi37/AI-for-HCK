// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import ProfileMenu from '../components/ProfileMenu'
import ThemeToggle from '../components/ThemeToggle'
import SuccessPopup from '../components/SuccessPopup'
import { motion } from 'framer-motion'

export default function Home({ user, onSignOut }) {
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    // handler for the dispatched event
    function handleLoginSuccess(ev) {
      // prefer stored name if event didn't include details
      const nameFromEvent = ev?.detail?.name
      const name = nameFromEvent || user.displayName || user.email || 'there'
      setSuccessMsg(`Welcome back, ${name} 👋`)
    }

    // 1) localStorage fallback (in case AuthForm wrote flag before Home mounted)
    try {
      const flag = localStorage.getItem('login-success')
      if (flag) {
        const storedName = localStorage.getItem('login-success-name') || user.displayName || user.email || 'there'
        setSuccessMsg(`Welcome back, ${storedName} 👋`)
        // clear immediately to avoid repeat
        localStorage.removeItem('login-success')
        localStorage.removeItem('login-success-name')
      }
    } catch (e) {
      // ignore storage errors (private mode, etc.)
    }

    // 2) listen for the event (happy path)
    window.addEventListener('login-success', handleLoginSuccess)
    return () => window.removeEventListener('login-success', handleLoginSuccess)
  }, [user])

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100
        dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100
        p-6 transition-colors"
    >
      {/* Green success popup */}
      <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />

      <header className="max-w-6xl mx-auto flex items-center justify-between py-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome back — quick overview below
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ProfileMenu user={user} onSignOut={onSignOut} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white/80 dark:bg-white/5 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
        >
          {/* animated friendly welcome */}
          <motion.h3
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100"
          >
            Hello, {user.displayName || user.email} 👋
          </motion.h3>

          <p className="text-gray-600 dark:text-gray-300">
            This is your dashboard. Add widgets, content, or tools here.
          </p>

          {/* Example cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <div className="text-sm text-gray-500 dark:text-gray-300">Profile status</div>
              <div className="mt-2 font-medium">
                {user.emailVerified ? 'Verified' : 'Not verified'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <div className="text-sm text-gray-500 dark:text-gray-300">Email</div>
              <div className="mt-2 font-medium break-all">{user.email}</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <div className="text-sm text-gray-500 dark:text-gray-300">Account</div>
              <div className="mt-2 font-medium">Firebase ID: {user.uid.slice(0, 8)}…</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
