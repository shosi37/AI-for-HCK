// Avatar storage upload helper disabled — we now prefer using the AbstractAPI proxy instead of storing SVG data or exposing API keys.
// If you need a storage-backed approach in future, re-implement this helper with proper CORS handling or server-side uploads.
export async function uploadAvatarSvg() {
  throw new Error('avatar upload disabled — use AbstractAPI proxy instead')
}

