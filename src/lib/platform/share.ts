import { Capacitor } from '@capacitor/core'

const NATIVE = Capacitor.isNativePlatform()

export interface SharePayload {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export type ShareResult = 'shared' | 'copied' | 'failed'

/**
 * Shares content via the platform sheet, falling back to clipboard.
 * Native: `@capacitor/share` (Phase 14). Web: navigator.share → clipboard.
 */
export async function shareContent(payload: SharePayload): Promise<ShareResult> {
  if (NATIVE) {
    try {
      const mod = '@capacitor/share'
      const { Share } = (await import(/* @vite-ignore */ mod)) as {
        Share: { share: (o: SharePayload) => Promise<unknown> }
      }
      await Share.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      })
      return 'shared'
    } catch {
      // fall through to web
    }
  }

  // Web Share API (with file support where available).
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      if (payload.files && payload.files.length > 0) {
        if (navigator.canShare?.({ files: payload.files })) {
          await navigator.share({
            files: payload.files,
            title: payload.title,
            text: payload.text,
          })
          return 'shared'
        }
      } else {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        })
        return 'shared'
      }
    }
  } catch (err) {
    // User dismissed the share sheet — treat as a no-op rather than copying.
    if ((err as Error)?.name === 'AbortError') return 'failed'
  }

  // Clipboard fallback.
  try {
    await navigator.clipboard.writeText(payload.url || payload.text || '')
    return 'copied'
  } catch {
    return 'failed'
  }
}
