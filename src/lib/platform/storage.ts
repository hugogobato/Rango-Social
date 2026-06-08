import { Capacitor } from '@capacitor/core'

/**
 * Key-value storage abstraction (DataStore / Preferences equivalent).
 *
 * Native: `@capacitor/preferences` (the plugin is added in Phase 14; until then the
 * dynamic import simply no-ops and we fall back to the web path). Web: localStorage.
 *
 * The rest of the app must never touch localStorage / Preferences directly — always
 * go through this module so the native swap is transparent.
 */

const NATIVE = Capacitor.isNativePlatform()

async function nativePreferences(): Promise<{
  get: (o: { key: string }) => Promise<{ value: string | null }>
  set: (o: { key: string; value: string }) => Promise<void>
  remove: (o: { key: string }) => Promise<void>
} | null> {
  if (!NATIVE) return null
  try {
    // Variable specifier keeps tsc/Vite from resolving the (not-yet-installed) plugin.
    const mod = '@capacitor/preferences'
    const { Preferences } = (await import(/* @vite-ignore */ mod)) as {
      Preferences: NonNullable<Awaited<ReturnType<typeof nativePreferences>>>
    }
    return Preferences
  } catch {
    return null
  }
}

export const storage = {
  async get(key: string): Promise<string | null> {
    const prefs = await nativePreferences()
    if (prefs) {
      const { value } = await prefs.get({ key })
      return value ?? null
    }
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  async set(key: string, value: string): Promise<void> {
    const prefs = await nativePreferences()
    if (prefs) {
      await prefs.set({ key, value })
      return
    }
    try {
      localStorage.setItem(key, value)
    } catch {
      /* quota exceeded / private mode — ignore */
    }
  },

  async remove(key: string): Promise<void> {
    const prefs = await nativePreferences()
    if (prefs) {
      await prefs.remove({ key })
      return
    }
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    await this.set(key, JSON.stringify(value))
  },
}
