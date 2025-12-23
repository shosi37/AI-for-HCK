import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProfile } from 'firebase/auth'
import { auth, saveUserToFirestore } from '../../firebase'
import GeneratedAvatarPicker from './GeneratedAvatarPicker'
import { ErrorPopup, SuccessPopup } from '../error' 
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
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    if (open) console.log('EditProfileModal opened — user:', user)

    // listen for profile-updated events to keep local state in sync if needed
    function onProfileUpdated(ev) {
      try {
        const u = ev?.detail?.user
        if (u) {
          setDisplayName(u.displayName || '')
          setPhotoURL(u.photoURL || '')
        }
      } catch (e) {}
    }
    window.addEventListener('profile-updated', onProfileUpdated)
    return () => window.removeEventListener('profile-updated', onProfileUpdated)
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

      // Attempt to update the Firebase Auth profile but avoid sending very large data URLs (they are rejected by Auth)
      let authUpdateFailed = false
      const skipAuthPhotoUpdate = typeof photoURL === 'string' && photoURL.startsWith('data:') && photoURL.length > 1024
      try {
        const updatePayload = { displayName: displayName.trim() || null }
        if (!skipAuthPhotoUpdate) updatePayload.photoURL = photoURL || null
        await updateProfile(auth.currentUser, updatePayload)
      } catch (err) {
        authUpdateFailed = true
        console.warn('updateProfile failed', err)
        const errText = err && (err.message || String(err)) || ''
        const isPhotoTooLong = errText.includes('Photo URL too long') || err.code === 'auth/invalid-profile-attribute'
        if (isPhotoTooLong) {
          setSuccessMsg('Profile saved — avatar stored in Firestore, but Firebase Auth rejected the photo (too long). It will still display in the app.')
        } else {
          setError('Unable to update Firebase Auth profile (will still save profile to Firestore): ' + errText)
        }
        try { sessionStorage.setItem('profile-error', JSON.stringify({ message: err.message || String(err), code: err.code || null, time: Date.now() })) } catch (e) {}
      }

      // Try to reload auth user (best-effort)
      try { await auth.currentUser.reload() } catch (e) { console.warn('Failed to reload current user', e) }

      // Compute the canonical saved URL. For generated AbstractAPI selections we store a proxy-based URL so the API key is never exposed
      let finalPhotoURL = photoURL || null
      try {
        const uid = auth.currentUser && auth.currentUser.uid
        // If the selected avatar is a generated preview (data: or blob:) or an AbstractAPI url, canonicalize to the backend proxy URL `/api/avatar/abstract/{uid}`
        if (uid && finalPhotoURL && (finalPhotoURL.startsWith('data:') || finalPhotoURL.startsWith('blob:') || finalPhotoURL.includes('abstractapi.com') || finalPhotoURL.includes('/api/avatar/abstract'))) {
          const base = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE !== 'production' ? `${location.protocol}//${location.hostname}:4000` : '')
          finalPhotoURL = `${base}/api/avatar/abstract/${encodeURIComponent(uid)}`
        }
      } catch (e) { console.warn('Failed to canonicalize avatar URL', e) }

      // Save to Firestore using the canonical value
      try {
        const userToSave = { ...(auth.currentUser || {}), displayName: displayName.trim() || null, photoURL: finalPhotoURL }
        await saveUserToFirestore(userToSave)
      } catch (e) { console.warn('Failed to save updated user to Firestore', e) }

      // Update Firebase Auth profile with the canonical URL (should succeed since it's short)
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: displayName.trim() || null, photoURL: finalPhotoURL || null })
          try { await auth.currentUser.reload() } catch (e) { console.warn('Failed to reload current user after update', e) }
        }
      } catch (e) {
        console.warn('updateProfile with canonical URL failed', e)
      }

      // Try to update server session meta so /api/profile returns the updated photo (and issue a fresh access token)
      try {
        const { fetchWithAuth } = await import('../../utils/api')
        const res = await fetchWithAuth('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: displayName.trim() || '', photoURL: finalPhotoURL || '' }) })
        if (res && res.ok) {
          const b = await res.json()
          if (b.token) {
            try { localStorage.setItem('auth-token', b.token) } catch (e) {}
          }
          if (b.user) {
            // use server-canonical user object in the dispatched event
            const srvUser = b.user

            // Persist the server-canonical user to Firestore so the hosted URL survives reloads
            try {
              await saveUserToFirestore(srvUser)
            } catch (e) {
              console.warn('Failed to save server-canonical user to Firestore', e)
            }

            // Prefer the server-provided proxy URL when available so the client avoids blocked third-party requests
            let displayPhoto = srvUser.photoURLProxy || srvUser.photoURL || ''
            if (typeof displayPhoto === 'string' && displayPhoto.startsWith('data:')) {
              // convert to stable AbstractAPI proxy URL using uid
              const uidFromServer = srvUser.uid || (auth.currentUser && auth.currentUser.uid) || null
              if (uidFromServer) {
                const base = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE !== 'production' ? `${location.protocol}//${location.hostname}:4000` : '')
                displayPhoto = `${base}/api/avatar/abstract/${encodeURIComponent(uidFromServer)}`
              }
            }

            const dispatchUser = { ...srvUser, photoURL: displayPhoto || srvUser.photoURL }
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { user: dispatchUser } }))
          }
        }
      } catch (e) { console.warn('Failed to update server profile meta', e) }

      // dispatch a profile-updated event so the app can update its user state immediately
      try {
        const u = auth.currentUser
        let payload = null
        // choose the best photoURL to display (Auth-updated, or selected photo). If it's an inline data URL, convert to a short blob URL for stable rendering.
        let displayPhoto = null
        if (!authUpdateFailed) {
          displayPhoto = u && u.photoURL ? u.photoURL : null
        } else {
          displayPhoto = photoURL || null
        }

        // Never use temporary blob/data URLs for the app state. Prefer the Firebase Auth value or a stable canonical URL.
        if (typeof displayPhoto === 'string' && (displayPhoto.startsWith('data:') || displayPhoto.startsWith('blob:'))) {
          const uidFromAuth = auth.currentUser && auth.currentUser.uid ? auth.currentUser.uid : null
          if (uidFromAuth) {
            const base = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE !== 'production' ? `${location.protocol}//${location.hostname}:4000` : '')
            displayPhoto = `${base}/api/avatar/abstract/${encodeURIComponent(uidFromAuth)}`
          }
        }

        if (!authUpdateFailed) {
          if (u) payload = { uid: u.uid, email: u.email, displayName: u.displayName || '', photoURL: u.photoURL || displayPhoto || '', emailVerified: !!u.emailVerified }
        } else {
          payload = { uid: u ? u.uid : null, email: u ? u.email : '', displayName: displayName.trim() || '', photoURL: displayPhoto || photoURL || '', emailVerified: !!(u && u.emailVerified) }
        }

        if (payload) window.dispatchEvent(new CustomEvent('profile-updated', { detail: { user: payload } }))
      } catch (e) { console.warn('failed to dispatch profile-updated event', e) }

      // show a success popup briefly
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
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
              <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />

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
