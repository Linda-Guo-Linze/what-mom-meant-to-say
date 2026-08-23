type Counter = { count: number; resetAt: number };
const hourCounters = new Map<string, Counter>();
function nextUtcDay(): number { const now = new Date(); return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1); }
let globalCounter: Counter = { count: 0, resetAt: nextUtcDay() };
export function consumeLiveRequest(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (globalCounter.resetAt <= now) globalCounter = { count: 0, resetAt: nextUtcDay() };
  if (globalCounter.count >= 100) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((globalCounter.resetAt - now) / 1000)) };
  const previous = hourCounters.get(ip);
  const current = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + 60 * 60 * 1000 } : previous;
  if (current.count >= 10) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  current.count += 1; hourCounters.set(ip, current); globalCounter.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
