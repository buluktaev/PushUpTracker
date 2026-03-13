// lib/emailRateLimit.ts

interface RateLimitEntry {
  attempts: number
  windowStart: number // ms timestamp
}

const WINDOW_MS = 15 * 60 * 1000 // 15 минут
const MAX_ATTEMPTS = 3

// Singleton — живёт в памяти процесса Node.js
const store = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  allowed: boolean
  attemptsLeft: number
  retryAfter: number | null // unix ms timestamp когда сбросится лимит
}

export function checkRateLimit(email: string): RateLimitResult {
  const now = Date.now()
  const key = email.toLowerCase().trim()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // Нет записи или окно истекло — создаём новое
    store.set(key, { attempts: 1, windowStart: now })
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS - 1, retryAfter: null }
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    const retryAfter = entry.windowStart + WINDOW_MS
    return { allowed: false, attemptsLeft: 0, retryAfter }
  }

  entry.attempts += 1
  return {
    allowed: true,
    attemptsLeft: MAX_ATTEMPTS - entry.attempts,
    retryAfter: null,
  }
}
