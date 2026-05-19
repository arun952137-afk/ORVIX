import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: false,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch { /* ignore cache errors */ }
}

export async function deleteCache(key: string): Promise<void> {
  try { await redis.del(key) } catch { /* ignore */ }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch { /* ignore */ }
}

// Rate limiting
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now()
  const window = Math.floor(now / (windowSeconds * 1000))
  const rateKey = `rl:${key}:${window}`

  const count = await redis.incr(rateKey)
  if (count === 1) await redis.expire(rateKey, windowSeconds)

  const ttl = await redis.ttl(rateKey)
  const allowed = count <= limit

  return { allowed, remaining: Math.max(0, limit - count), resetIn: ttl }
}
