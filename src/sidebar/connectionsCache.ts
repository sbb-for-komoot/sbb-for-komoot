// In-memory cache for connection results, keyed by the canonical search tuple.
// Survives `v-if` unmounts of SbbConnectionList (e.g. switching to a non-Komoot
// tab and back) because module state outlives component instances.

const TTL_MS = 5 * 60_000

interface Entry {
  data: unknown[]
  cachedAt: number
}

const cache = new Map<string, Entry>()

export function buildKey(
  from: string,
  to: string,
  date: string,
  time: string,
  isArrival: boolean,
): string {
  return `${from}|${to}|${date}|${time}|${isArrival ? 'A' : 'D'}`
}

export function readFresh<T>(key: string): T[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.cachedAt >= TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T[]
}

export function write<T>(key: string, data: T[]): void {
  cache.set(key, {data, cachedAt: Date.now()})
}
