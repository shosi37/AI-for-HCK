import { auth } from '../firebase'

export async function fetchWithAuth(path, opts = {}) {
  const base = import.meta.env.VITE_BACKEND_URL || ''
  opts.headers = opts.headers || {}

  // Prefer Firebase client ID token if available (keeps server validation straightforward)
  try {
    const u = auth.currentUser
    if (u) {
      const idTok = await u.getIdToken()
      if (idTok) opts.headers['Authorization'] = `Bearer ${idTok}`
    }
  } catch (e) {
    console.warn('[api] Error while reading Firebase ID token', e)
  }

  // If no Authorization header was set (no Firebase user), fall back to the stored server access token
  if (!opts.headers['Authorization']) {
    const access = localStorage.getItem('auth-token')
    if (access) {
      opts.headers['Authorization'] = `Bearer ${access}`
      console.log('[api] Using stored server access token for Authorization')
    }
  }

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
