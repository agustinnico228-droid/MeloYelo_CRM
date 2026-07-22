import "server-only";

/**
 * In-memory TTL cache with stale-on-error (§13): a Sheets API failure
 * serves the last good value with a visible age, never a broken page.
 */

interface Entry<T> {
  value: T;
  fetchedAt: number;
}

export interface CachedResult<T> {
  value: T;
  /** ms since the underlying fetch actually succeeded */
  ageMs: number;
  /** true when the TTL has lapsed and the refresh attempt failed */
  stale: boolean;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T>> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;

  if (hit && now - hit.fetchedAt < ttlMs) {
    return { value: hit.value, ageMs: now - hit.fetchedAt, stale: false };
  }

  // Collapse concurrent refreshes into one upstream call.
  let pending = inflight.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = fetcher().finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }

  try {
    const value = await pending;
    store.set(key, { value, fetchedAt: Date.now() });
    return { value, ageMs: 0, stale: false };
  } catch (err) {
    if (hit) {
      return { value: hit.value, ageMs: now - hit.fetchedAt, stale: true };
    }
    throw err;
  }
}

export function invalidate(key: string): void {
  store.delete(key);
}
