/**
 * @fileoverview Session management service providing a dual-storage strategy.
 * Uses Firebase Firestore when available, and falls back to a local JSON file.
 * Handles creating, retrieving, rotating, and deleting sessions.
 */

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const COLLECTION = 'sessions'
const FILE_PATH = path.join(__dirname, 'sessions.json')

/**
 * Ensures the local session file exists. Creates it with an empty structure if not.
 */
function ensureFile() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions: [] }, null, 2))
  }
}

/**
 * Reads the sessions from the local JSON file.
 * @returns {Array} An array of session objects.
 */
function readFileStore() {
  ensureFile()
  const raw = fs.readFileSync(FILE_PATH, 'utf8')
  try {
    return JSON.parse(raw).sessions || []
  } catch (e) {
    console.warn('sessions.json parse failed, resetting file', e && e.message)
    fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions: [] }, null, 2))
    return []
  }
}

/**
 * Writes the provided sessions array to the local JSON file.
 * @param {Array} sessions - The array of session objects to save.
 */
function writeFileStore(sessions) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions }, null, 2))
}

/**
 * Creates a new session in Firestore or the local file store.
 * @param {Object} params - Session creation parameters.
 * @param {string} params.uid - The user ID.
 * @param {string} params.tokenHash - The hashed refresh token.
 * @param {number} params.expiresAt - Expiration timestamp in milliseconds.
 * @param {Object} [params.meta] - Additional metadata for the session.
 * @returns {Promise<Object>} The created session object.
 */
async function createSession({ uid, tokenHash, expiresAt, meta }) {
  // Prefer Firestore if available; fall back to file store on any error
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const ref = db.collection(COLLECTION).doc()
      const session = {
        id: ref.id,
        uid,
        tokenHash,
        expiresAt,
        meta,
        createdAt: Date.now(),
      }
      await ref.set(session)
      return session
    } catch (e) {
      console.warn('createSession firestore failed, falling back to file store', e && e.message)
    }
  }

  // File store fallback
  const sessions = readFileStore()
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')
  const session = { id, uid, tokenHash, expiresAt, meta, createdAt: Date.now() }
  sessions.push(session)
  writeFileStore(sessions)
  return session
}

/**
 * Finds a session by its hashed refresh token.
 * @param {string} tokenHash - The hashed token to search for.
 * @returns {Promise<Object|null>} The session object if found, otherwise null.
 */
async function findByTokenHash(tokenHash) {
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const q = await db
        .collection(COLLECTION)
        .where('tokenHash', '==', tokenHash)
        .limit(1)
        .get()

      if (q.empty) return null
      return q.docs[0].data()
    } catch (e) {
      console.warn('findByTokenHash firestore failed, falling back to file store', e && e.message)
    }
  }

  const sessions = readFileStore()
  return sessions.find(s => s.tokenHash === tokenHash) || null
}

/**
 * Rotates a session by updating its token hash and expiration.
 * @param {string} oldHash - The current hashed token.
 * @param {string} newHash - The new hashed token to apply.
 * @param {number} newExpiresAt - The new expiration timestamp.
 * @returns {Promise<boolean|null>} True if successful, null if the session wasn't found.
 */
async function rotateSession(oldHash, newHash, newExpiresAt) {
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const q = await db
        .collection(COLLECTION)
        .where('tokenHash', '==', oldHash)
        .limit(1)
        .get()

      if (q.empty) return null

      const doc = q.docs[0]
      await doc.ref.update({ tokenHash: newHash, expiresAt: newExpiresAt })
      return true
    } catch (e) {
      console.warn('rotateSession firestore failed, falling back to file store', e && e.message)
    }
  }

  const sessions = readFileStore()
  const idx = sessions.findIndex(s => s.tokenHash === oldHash)
  if (idx === -1) return null
  sessions[idx].tokenHash = newHash
  sessions[idx].expiresAt = newExpiresAt
  writeFileStore(sessions)
  return true
}

/**
 * Deletes a session by its hashed token.
 * @param {string} tokenHash - The hashed token of the session to delete.
 */
async function deleteByTokenHash(tokenHash) {
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const q = await db.collection(COLLECTION).where('tokenHash', '==', tokenHash).get()
      const batch = db.batch()
      q.docs.forEach(d => batch.delete(d.ref))
      await batch.commit()
      return
    } catch (e) {
      console.warn('deleteByTokenHash firestore failed, falling back to file store', e && e.message)
    }
  }

  const sessions = readFileStore()
  const filtered = sessions.filter(s => s.tokenHash !== tokenHash)
  writeFileStore(filtered)
}

/**
 * Migrates sessions from the local JSON file to Firestore.
 * Typically called on startup if Firestore is available.
 * @returns {Promise<Object>} An object indicating the number of migrated sessions.
 */
async function migrateFromFileDb() {
  // Attempt to move local sessions into firestore
  if (!admin.apps.length) return { migrated: 0 }
  const sessions = readFileStore()
  if (!sessions || !sessions.length) return { migrated: 0 }

  try {
    const db = admin.firestore()
    let migrated = 0
    for (const s of sessions) {
      // Write each session into firestore with same id
      const ref = db.collection(COLLECTION).doc(s.id)
      await ref.set(s)
      migrated++
    }

    // Clear local store after successful migration
    writeFileStore([])
    return { migrated }
  } catch (e) {
    console.warn('migrateFromFileDb failed', e && e.message)
    return { migrated: 0 }
  }
}

module.exports = {
  createSession,
  findByTokenHash,
  rotateSession,
  deleteByTokenHash,
  migrateFromFileDb,
}
