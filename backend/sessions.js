const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const DB = path.join(__dirname, 'sessions.json')

function read() {
  try {
    if (!fs.existsSync(DB)) return { sessions: [] }
    const raw = fs.readFileSync(DB, 'utf8')
    return JSON.parse(raw || '{"sessions": []}')
  } catch (e) {
    console.error('sessions read error', e.message)
    return { sessions: [] }
  }
}

function write(data) {
  try {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2))
    return true
  } catch (e) {
    console.error('sessions write error', e.message)
    return false
  }
}

async function createSession({ uid, tokenHash, expiresAt, meta = {} }) {
  const db = read()
  const s = { id: randomUUID(), uid, tokenHash, expiresAt, meta, createdAt: Date.now() }
  db.sessions = db.sessions.filter(x => !(x.uid === uid && x.tokenHash === tokenHash))
  db.sessions.push(s)
  write(db)
  return s
}

async function findByTokenHash(tokenHash) {
  const db = read()
  return db.sessions.find(s => s.tokenHash === tokenHash)
}

async function deleteByTokenHash(tokenHash) {
  const db = read()
  const before = db.sessions.length
  db.sessions = db.sessions.filter(s => s.tokenHash !== tokenHash)
  write(db)
  return db.sessions.length !== before
}

async function rotateSession(oldHash, newHash, newExpiresAt) {
  const db = read()
  const idx = db.sessions.findIndex(s => s.tokenHash === oldHash)
  if (idx === -1) return null
  db.sessions[idx].tokenHash = newHash
  db.sessions[idx].expiresAt = newExpiresAt
  write(db)
  return db.sessions[idx]
}

module.exports = { createSession, findByTokenHash, deleteByTokenHash, rotateSession }
