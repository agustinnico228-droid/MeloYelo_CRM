import "server-only";

/**
 * Simple per-user rate limit for write routes (§14). In-memory sliding
 * window — enough for a 30-person team on one Cloud Run instance.
 */

const WINDOW_MS = 60_000;
const MAX_WRITES_PER_WINDOW = 30;

const hits = new Map<string, number[]>();

export function allowWrite(email: string): boolean {
  const now = Date.now();
  const list = (hits.get(email) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_WRITES_PER_WINDOW) {
    hits.set(email, list);
    return false;
  }
  list.push(now);
  hits.set(email, list);
  return true;
}
