import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword } from 'firebase/auth'
import { auth, saveUserToFirestore } from '../../firebase'
import { FiX } from 'react-icons/fi'
import useTheme from '../../hooks/useTheme'
import { ErrorPopup } from '../error' 

function resolveTheme(hookTheme) {
  if (typeof window === 'undefined') return hookTheme || 'light'
  if (document.documentElement.classList.contains('dark')) return 'dark'
  if (hookTheme === 'dark' || hookTheme === 'light') return hookTheme

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function EditEmailModal({ open, setOpen, user, translateFirebaseError }) {
  const [hookTheme] = useTheme()
  const resolvedTheme = resolveTheme(hookTheme)

  const [newEmail, setNewEmail] = useState(user.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    if (open) {
      setNewEmail(user.email || '')
      setNewPassword('')
      setCurrentPassword('')
      setPopup(null)
    }
  }, [open, user])

  async function reauthAndUpdate({ wantsEmail, wantsPassword }) {
    setBusy(true)
    setPopup(null)

    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, cred)

      if (wantsEmail && newEmail && newEmail !== user.email) {
        await updateEmail(auth.currentUser, newEmail)
      }

      if (wantsPassword && newPassword) {
        await updatePassword(auth.currentUser, newPassword)
      }

      setPopup('Account updated successfully.')

      try { await saveUserToFirestore(auth.currentUser) } catch (e) { console.warn('Failed to save updated user to Firestore', e) }

      setTimeout(() => setOpen(false), 1200)

    } catch (err) {
      console.error(err)

      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPopup('Incorrect password. Please enter your current password to confirm changes.')
      } else {
        setPopup(
          translateFirebaseError
            ? translateFirebaseError(err.code, err.message)
            : (err.message || err.code)
        )
      }

    } finally {
      setBusy(false)
    }
  }

  const labelText = 'text-gray-700 dark:text-gray-300'
  const inputClasses = 'w-full p-3 rounded-lg border focus-ring transition-colors duration-200 bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl bg-white dark:bg-gray-900 transition-colors duration-200`}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Email & Password</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring"
                aria-label="Close"
              >
                <FiX className="text-gray-700 dark:text-gray-200" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`text-sm ${labelText}`}>New email</label>
                <input
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`text-sm ${labelText}`}>New password</label>
                <input
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  type="password"
                  className={inputClasses}
                  placeholder="Leave empty to keep current"
                />
              </div>

              <div>
                <label className={`text-sm ${labelText}`}>Current password (required)</label>
                <input
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  type="password"
                  className={inputClasses}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => reauthAndUpdate({
                    wantsEmail: true,
                    wantsPassword: newPassword.length > 0
                  })}
                  disabled={busy}
                  className="btn-primary px-4"
                >
                  {busy ? 'Updating...' : 'Save changes'}
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded border text-gray-900 border-gray-200 dark:text-gray-200 dark:border-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>

            <ErrorPopup message={popup} setMessage={setPopup} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
