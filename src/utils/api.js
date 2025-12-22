export async function fetchWithAuth(path, opts = {}) {
  const base = import.meta.env.VITE_BACKEND_URL || ''
  opts.headers = opts.headers || {}
  const access = localStorage.getItem('auth-token')
  if (access) opts.headers['Authorization'] = `Bearer ${access}`
  // allow cookies for refresh token endpoint and cookie setting
  opts.credentials = opts.credentials || 'include'

  let res = await fetch(base + path, opts)
  if (res.status === 401) {
    // try refresh
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
