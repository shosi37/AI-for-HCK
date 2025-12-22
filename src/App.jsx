// src/App.jsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, saveUserToFirestore } from './firebase' 
import AuthCard from './components/auth/AuthCard'
import Home from './pages/Home'
import { AnimatedBackground } from './components/ui' 
import { ErrorBoundary } from './components/error' 

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = null

    // Handle OAuth redirect fragment: server redirects back as `#access_token=...`
    ;(async () => {
      try {
        const hash = window.location.hash || ''
        if (hash && (hash.includes('access_token=') || hash.includes('firebase_custom_token='))) {
          const p = new URLSearchParams(hash.replace(/^#/, ''))

          // Server-issued API access token (for server auth)
          const t = p.get('access_token')
          if (t) {
            console.log('[App] Detected OAuth access_token in fragment — storing to localStorage')
            localStorage.setItem('auth-token', t)
          }

          // Server-issued Firebase custom token (so the client SDK can sign in)
          const custom = p.get('firebase_custom_token')
          if (custom) {
            console.log('[App] Detected firebase_custom_token in fragment — signing in Firebase client')
            try {
              // lazy-load to avoid adding initial bundle weight
              const { signInWithCustomToken } = await import('firebase/auth')
              const { auth } = await import('./firebase')
              try {
                await signInWithCustomToken(auth, custom)
                console.log('[App] Firebase client signed in with custom token')
              } catch (e) {
                console.warn('[App] Firebase signInWithCustomToken failed', e)
              }
            } catch (e) {
              console.warn('[App] Failed to import Firebase signInWithCustomToken', e)
            }
          }

          // remove fragment for cleanliness
          try { history.replaceState(null, '', window.location.pathname + window.location.search) } catch (e) {}
        }
      } catch (e) {}
    })()

    const token = localStorage.getItem('auth-token')

    async function fetchProfileWithToken(t) {
      try {
        const { fetchWithAuth } = await import('./utils/api')
        const r = await fetchWithAuth('/api/profile', { method: 'GET' })
        if (r.ok) {
          const { user } = await r.json()
          setUser(user)
          return true
        }
      } catch (e) {}
      return false
    }

    // listen for login-success events so the app can update immediately after login
    function handleLoginSuccess(ev) {
      try {
        const userFromEvent = ev?.detail?.user
        if (userFromEvent) {
          setUser(userFromEvent)
          setLoading(false)
          return
        }
      } catch (e) {}

      // fallback: if no detail provided, try re-fetching profile from server
      const t = localStorage.getItem('auth-token')
      if (t) fetchProfileWithToken(t).then(found => { if (!found) {
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u)
          if (u) saveUserToFirestore(u)
        })
        setLoading(false)
      }})
    }

    window.addEventListener('login-success', handleLoginSuccess)

    // also listen for profile updates from the EditProfileModal
    function handleProfileUpdated(ev) {
      try {
        const userFromEvent = ev?.detail?.user
        if (userFromEvent) {
          setUser(userFromEvent)
          setLoading(false)
        }
      } catch (e) {}
    }
    window.addEventListener('profile-updated', handleProfileUpdated)

    if (token) {
      ;(async () => {
        const ok = await fetchProfileWithToken(token)
        if (!ok) {
          unsub = onAuthStateChanged(auth, (u) => {
            setUser(u)
            if (u) saveUserToFirestore(u)
          })
        }
        setLoading(false)
      })()
    } else {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
        if (u) saveUserToFirestore(u)
      })
    }

    return () => { if (unsub) unsub(); window.removeEventListener('login-success', handleLoginSuccess) }
  }, [])

  async function handleSignOut() {
    try { localStorage.removeItem('auth-token') } catch (e) {}
    try {
      const base = import.meta.env.VITE_BACKEND_URL || ''
      await fetch(`${base}/api/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {}
    signOut(auth)
    setUser(null)
  }



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 w-full max-w-6xl px-6">
        <div className="mx-auto">
          <ErrorBoundary>
            {loading ? (
              <div className="p-10 text-center">Loading...</div>
            ) : user ? (
              <Home user={user} onSignOut={handleSignOut} />
            ) : (
              <AuthCard />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
