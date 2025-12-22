// src/App.jsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, saveUserToFirestore } from './firebase' 
import AuthCard from './components/auth/AuthCard'
import Home from './pages/Home'
import AnimatedBackground from './components/AnimatedBackground'
import { ErrorBoundary } from './components/error' 

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = null
    const token = localStorage.getItem('auth-token')

    async function fetchProfileWithToken(t) {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || ''
        const r = await fetch(`${base}/api/profile`, { headers: { Authorization: `Bearer ${t}` } })
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

  function handleSignOut() {
    try { localStorage.removeItem('auth-token') } catch (e) {}
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
