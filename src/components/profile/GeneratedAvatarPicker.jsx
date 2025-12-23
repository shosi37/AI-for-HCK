import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useTheme from '../../hooks/useTheme'

export default function GeneratedAvatarPicker({ name = '', currentUrl = '', onSelect }) {
  const [theme] = useTheme()
  const [seedBase, setSeedBase] = useState((name && name.trim()) || `user`)
  const [variantIndex, setVariantIndex] = useState(0)
  const [loadingMap, setLoadingMap] = useState({})

  const variants = ['v1','v2','v3','v4','v5','v6']

  const seeds = useMemo(() => {
    const base = seedBase || 'user'
    return Array.from({ length: 8 }).map((_, i) => `${base}-${variantIndex}-${i}`)
  }, [seedBase, variantIndex])

  function avatarCandidates(seed) {
    // Use AbstractAPI (proxied by backend) for generated avatars. Prefer backend proxy when available to avoid exposing API key.
    try {
      const s = encodeURIComponent(seed)
      const proxyBase = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE !== 'production' ? `${location.protocol}//${location.hostname}:4000` : '')
      const proxy = proxyBase ? `${proxyBase}/api/avatar/abstract/${s}` : null
      const clientKey = import.meta.env.VITE_AVATAR_API_KEY || null
      const direct = clientKey ? `https://avatars.abstractapi.com/v1/?api_key=${encodeURIComponent(clientKey)}&name=${s}` : null
      // fallback to ui-avatars when direct isn't available
      const uiFallback = `https://ui-avatars.com/api/?name=${s}&format=png`
      const candidates = []
      if (proxy) candidates.push(proxy)
      if (direct) candidates.push(direct)
      candidates.push(uiFallback)
      return candidates
    } catch (e) {
      return []
    }
  }

  function findWorkingUrl(candidates) {
    return new Promise((resolve) => {
      let settled = false
      const tryNext = (i) => {
        if (i >= candidates.length) return resolve(null)
        const url = candidates[i]
        const img = new Image()
        img.onload = () => { if (!settled) { settled = true; resolve(url) } }
        img.onerror = () => { if (!settled) { tryNext(i + 1) } }
        img.src = url
      }
      tryNext(0)
    })
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      for (const s of seeds) {
        const styleForSeed = variants[variantIndex % variants.length]
        const candidates = avatarCandidates(s)
        setLoadingMap((m) => ({ ...m, [s]: { status: 'loading' } }))
        const working = await findWorkingUrl(candidates)
        if (!active) return
        if (working) setLoadingMap((m) => ({ ...m, [s]: { status: 'ok', url: working } }))
        else setLoadingMap((m) => ({ ...m, [s]: { status: 'error' } }))
      }
    })()
    return () => { active = false }
  }, [seeds, variantIndex, theme])

  function handleRandomize() {
    setVariantIndex((v) => (v + 1) % variants.length)
    setSeedBase(`rnd-${Math.floor(Math.random() * 9999)}`)
  }

  function fallbackDataUrl(seed) {
    const initials = (seed || 'U').slice(0, 2).toUpperCase()
    const bg = theme === 'dark' ? '#111827' : '#ffffff'
    const fg = theme === 'dark' ? '#9ca3af' : '#6b7280'
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' font-size='44' fill='${fg}' text-anchor='middle' dominant-baseline='central' font-family='Helvetica,Arial'>${initials}</text></svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  const style = variants[variantIndex % variants.length]

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <input
          value={seedBase}
          onChange={(e) => setSeedBase(e.target.value)}
          placeholder="Name or seed (optional)"
          className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-ring text-gray-900 dark:text-gray-100"
        />
        <button onClick={handleRandomize} className="px-3 py-2 rounded bg-indigo-600 text-white hover:opacity-95">
          Randomize
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {seeds.map((s) => {
          const entry = loadingMap[s] || { status: 'loading' }
          const status = entry.status
          const workingUrl = entry.url
          const isCurrent = currentUrl && currentUrl === workingUrl
          const showSrc = status === 'ok' && workingUrl ? workingUrl : fallbackDataUrl(s)

          return (
            <motion.button
              key={s}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect && onSelect(status === 'ok' && workingUrl ? workingUrl : fallbackDataUrl(s))}
              className={`relative rounded-lg overflow-hidden border p-1
                ${isCurrent ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-transparent'}
                ${theme === 'dark' ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
              <div className={`w-full h-20 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                {status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    <svg className="h-6 w-6 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                ) : (
                  <img src={showSrc} alt={`avatar-${s}`} referrerPolicy="no-referrer" className="w-full h-20 object-cover block" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackDataUrl(s) }} />
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 truncate px-1">{s.split('-').pop()}</div>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">Avatars generated via AbstractAPI (API key optional). The app prefers the backend proxy to avoid exposing your API key or triggering external blocking.</div> 
    </div>
  )
}
