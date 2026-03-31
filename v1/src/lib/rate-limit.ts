const map = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean; resetAt: number } {
  const now = Date.now()
  const record = map.get(key)

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs
    map.set(key, { count: 1, resetAt })
    return { success: true, resetAt }
  }

  if (record.count >= limit) {
    return { success: false, resetAt: record.resetAt }
  }

  record.count += 1
  return { success: true, resetAt: record.resetAt }
}
