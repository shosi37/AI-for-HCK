import { auth } from '../firebase'

function getBackendBase() {
  // prefer explicit env var
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL
  // in dev, default to localhost:4000
  if (import.meta.env.MODE !== 'production') {
    try { return `${location.protocol}//${location.hostname}:4000` } catch (e) { return '' }
  }
  return ''
}

export async function fetchWithAuth(path, opts = {}) {
  const base = getBackendBase()
  opts.headers = opts.headers || {}

  // Prefer server-issued access token stored in localStorage (short-lived token issued by our backend)
  try {
    const access = localStorage.getItem('auth-token')
    if (access) {
      opts.headers['Authorization'] = `Bearer ${access}`
      console.log('[api] Using stored server access token for Authorization')
    } else {
      // No server token available — attempt to exchange Firebase ID token for a server token
      try {
        const u = auth.currentUser
        if (u) {
          const idTok = await u.getIdToken()
          if (idTok) {
            // exchange with backend
            try {
              const r = await fetch((import.meta.env.VITE_BACKEND_URL || '') + '/api/login-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ idToken: idTok })
              })
              if (r.ok) {
                const b = await r.json().catch(() => ({}))
                if (b && b.token) {
                  try { localStorage.setItem('auth-token', b.token) } catch (e) {}
                  opts.headers['Authorization'] = `Bearer ${b.token}`
                  console.log('[api] Exchanged ID token for server token')
                }
              } else {
                console.warn('[api] Exchange ID token failed with status', r.status)
              }
            } catch (e) {
              console.warn('[api] ID token exchange failed', e)
            }
          }
        }
      } catch (e) { console.warn('[api] Error while reading Firebase ID token', e) }
    }
  } catch (e) { console.warn('[api] Error reading stored access token', e) }

  // allow cookies for refresh token endpoint and cookie setting
  opts.credentials = opts.credentials || 'include'

  console.log('[api] fetchWithAuth', path, 'headers:', Object.keys(opts.headers))

  let res = await fetch(base + path, opts)
  if (res.status === 401) {
    // try refresh (cookie-based refresh endpoint)
    try {
      const r = await fetch(base + '/api/refresh', { method: 'POST', credentials: 'include' })
      if (r.ok) {
        const b = await r.json()
        if (b.token) {
          localStorage.setItem('auth-token', b.token)
          opts.headers['Authorization'] = `Bearer ${b.token}`
          // retry original request
          res = await fetch(base + path, opts)
        }
      }
    } catch (e) {
      // ignore and return original 401
    }
  }
  return res
}
