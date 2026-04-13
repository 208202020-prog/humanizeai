const rateLimitMap = new Map<string, number>()

export function checkRateLimit(userId: string, windowMs = 5000): boolean {
  const now = Date.now()
  const lastRequest = rateLimitMap.get(userId) || 0

  if (now - lastRequest < windowMs) {
    return false
  }

  rateLimitMap.set(userId, now)
  return true
}
