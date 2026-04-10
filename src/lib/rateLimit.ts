const requests = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string,
  limit = 20,
  windowMs = 60000,
): boolean {
  const now = Date.now();

  // Clean up expired entries
  for (const [key, entry] of requests) {
    if (now > entry.resetTime) requests.delete(key);
  }

  const entry = requests.get(ip);

  if (!entry || now > entry.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
