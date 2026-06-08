import { QueryClient, dehydrate, hydrate } from '@tanstack/react-query'

const CACHE_KEY = 'rango-query-cache'
const CACHE_VERSION = 1
const MAX_AGE = 1000 * 60 * 60 * 24 // 24h

interface PersistedCache {
  version: number
  timestamp: number
  state: ReturnType<typeof dehydrate>
}

/**
 * Builds the app QueryClient with offline persistence.
 *
 * The successful query cache is mirrored to localStorage (debounced) and rehydrated
 * synchronously on startup, so reloading the PWA while offline still paints the last
 * feed/ranking the user saw. Native webviews share the same localStorage, so this
 * works there too.
 */
export function createPersistedQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        // Keep cached data around long enough to survive reloads (offline support).
        gcTime: MAX_AGE,
        staleTime: 1000 * 30,
      },
    },
  })

  // Hydrate synchronously so an offline reload renders the cached feed immediately.
  restoreCache(queryClient)

  // Persist on every cache settle, debounced to avoid thrashing localStorage.
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  queryClient.getQueryCache().subscribe(() => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => saveCache(queryClient), 1000)
  })

  return queryClient
}

function restoreCache(queryClient: QueryClient): void {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as PersistedCache
    if (parsed.version !== CACHE_VERSION || Date.now() - parsed.timestamp > MAX_AGE) {
      localStorage.removeItem(CACHE_KEY)
      return
    }
    hydrate(queryClient, parsed.state)
  } catch {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      /* ignore */
    }
  }
}

function saveCache(queryClient: QueryClient): void {
  if (typeof localStorage === 'undefined') return
  try {
    const state = dehydrate(queryClient, {
      shouldDehydrateQuery: (query) => query.state.status === 'success',
    })
    const payload: PersistedCache = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      state,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / serialization issue — skip this save */
  }
}
