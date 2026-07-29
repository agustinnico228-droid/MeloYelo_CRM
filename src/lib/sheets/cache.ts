import "server-only";

/**
 * In-memory TTL cache with stale-while-revalidate and stale-on-error
 * (§13): an expired entry is served instantly while a background
 * refresh runs — page loads never block on the Sheets API or the CMS
 * database once warm — and a failed refresh serves the last good value
 * with a visible age, never a broken page.
 */

interface Entry<T> {
  value: T;
  fetchedAt: number;
  /** a refresh attempt failed since the last successful fetch */
  refreshFailed?: boolean;
}

export interface CachedResult<T> {
  value: T;
  /** ms since the underlying fetch actually succeeded */
  ageMs: number;
  /** true when the TTL has lapsed and the refresh attempt failed */
  stale: boolean;
}

/** Beyond ttl × HARD_CAP the entry is too old to serve — block and fetch. */
const HARD_CAP = 10;

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function startFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  let pending = inflight.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = fetcher().finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T>> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  const age = hit ? now - hit.fetchedAt : Infinity;

  if (hit && age < ttlMs) {
    return { value: hit.value, ageMs: age, stale: false };
  }

  // Expired but recent enough: serve immediately, refresh in the
  // background. The refresh is shared (inflight-collapsed) and its
  // failure is remembered so the next read reports staleness.
  if (hit && age < ttlMs * HARD_CAP) {
    startFetch(key, fetcher)
      .then((value) => store.set(key, { value, fetchedAt: Date.now() }))
      .catch(() => {
        hit.refreshFailed = true;
      });
    return { value: hit.value, ageMs: age, stale: hit.refreshFailed ?? false };
  }

  // Cold (or ancient): block on the fetch.
  try {
    const value = await startFetch(key, fetcher);
    store.set(key, { value, fetchedAt: Date.now() });
    return { value, ageMs: 0, stale: false };
  } catch (err) {
    if (hit) {
      return { value: hit.value, ageMs: age, stale: true };
    }
    throw err;
  }
}

export function invalidate(key: string): void {
  store.delete(key);
}
