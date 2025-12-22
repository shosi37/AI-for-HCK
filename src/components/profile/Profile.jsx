import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { sendEmailVerification } from 'firebase/auth'
import BackButton from '../BackButton'

export default function Profile({ user, onSignOut }) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleResend() {
    try {
      setBusy(true)
      const res = await sendEmailVerification(user)
      console.log('sendEmailVerification result:', res)
      alert('Verification email resent — check your inbox.')
      setSent(true)
    } catch (err) {
      console.error('sendEmailVerification ERROR:', err.code, err.message)
      alert(`Resend failed: ${err.code} — ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  function handleBackToLogin() {
    onSignOut()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-2xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={handleBackToLogin} />
          <div>
            <div className="text-lg font-semibold">{user.displayName || 'User'}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
          </div>
        </div>
      </div>

      {!user.emailVerified && (
        <div className="mb-4 p-3 rounded border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30">
          <div className="text-sm font-semibold">Please verify your email</div>
          <div className="text-sm">A verification email was sent to <strong>{user.email}</strong>. You must verify to access certain features.</div>
          <div className="mt-2 flex gap-2">
            <button onClick={handleResend} disabled={busy} className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed">
              {busy ? 'Sending...' : 'Resend verification'}
            </button>

            <button onClick={onSignOut} className="btn-ghost">Sign out</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl">{user.displayName ? user.displayName[0] : 'U'}</div>
        <div>
          <div className="text-lg font-semibold">{user.displayName || 'User'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{user.email} {user.emailVerified ? <span className="ml-2 text-xs text-green-600">(verified)</span> : <span className="ml-2 text-xs text-yellow-600">(not verified)</span>}</div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onSignOut} className="px-4 py-2 bg-red-50 text-red-700 border rounded">Sign out</button>
        <button className="px-4 py-2 border rounded">Settings</button>
      </div>
    </motion.div>
  )
}
