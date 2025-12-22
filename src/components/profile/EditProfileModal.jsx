import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProfile } from 'firebase/auth'
import { auth, saveUserToFirestore } from '../../firebase'
import GeneratedAvatarPicker from './GeneratedAvatarPicker'
import { ErrorPopup } from '../error' 
import { FiX, FiCheck } from 'react-icons/fi'
import useTheme from '../../hooks/useTheme'

function resolveTheme(hookTheme) {
  if (typeof window === 'undefined') return hookTheme || 'light'
  if (document.documentElement.classList.contains('dark')) return 'dark'
  if (hookTheme === 'dark' || hookTheme === 'light') return hookTheme
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch (e) {
    return 'light'
  }
}

export default function EditProfileModal({ open, setOpen, user = {} }) {
  const [hookTheme] = useTheme()
  const resolvedTheme = resolveTheme(hookTheme)

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) console.log('EditProfileModal opened — user:', user)
  }, [open, user])

  useEffect(() => {
    if (open) {
      setDisplayName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
      setSaved(false)
    }
  }, [open, user])

  async function handleSave() {
    try {
      setError(null)
      setBusy(true)

      if (!auth.currentUser) {
        const msg = 'You must be signed in to update your profile.'
        setError(msg)
        try { sessionStorage.setItem('profile-error', JSON.stringify({ message: msg, time: Date.now() })) } catch (e) {}
        return
      }

      try {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim() || null,
          photoURL: photoURL || null,
        })
      } catch (err) {
        const msg = 'Unable to update profile: ' + (err.message || err)
        console.error('updateProfile failed', err)
        setError(msg)
        try { sessionStorage.setItem('profile-error', JSON.stringify({ message: err.message || String(err), code: err.code || null, time: Date.now() })) } catch (e) {}
        return
      }

      try { await auth.currentUser.reload() } catch (e) { console.warn('Failed to reload current user', e) }
      try { await saveUserToFirestore(auth.currentUser) } catch (e) { console.warn('Failed to save updated user to Firestore', e) }

      setSaved(true)
      setTimeout(() => setOpen(false), 800)
    } finally {
      setBusy(false)
    }
  }

  const labelText = 'text-gray-700 dark:text-gray-300'

  const inputClasses = 'w-full p-3 rounded-lg border focus-ring transition-colors duration-200 bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <motion.div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl bg-white dark:bg-gray-900 transition-colors duration-200`} initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Profile</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring" aria-label="Close">
                <FiX className="text-gray-700 dark:text-gray-200" />
              </button>
            </div>

            <div className="space-y-4">
              <ErrorPopup message={error} />
              <div>
                <label className={`text-sm block mb-1 ${labelText}`}>Display name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputClasses} placeholder="Your name" />
              </div>

              <div>
                <label className={`text-sm block mb-1 ${labelText}`}>Choose avatar (generated)</label>
                <GeneratedAvatarPicker name={displayName || (user?.email || '').split('@')[0]} currentUrl={photoURL} onSelect={(url) => setPhotoURL(url)} />
                {photoURL && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Selected avatar will be used as your profile photo.</div>}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleSave} disabled={busy} className="btn-primary px-5">
                  {busy ? 'Saving...' : saved ? (<><FiCheck className="inline" /> Saved</>) : 'Save'}
                </button>
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded border text-gray-900 border-gray-200 dark:text-gray-200 dark:border-gray-700">Cancel</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
