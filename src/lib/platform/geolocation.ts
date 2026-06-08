import { Capacitor } from '@capacitor/core'

export interface Coordinates {
  latitude: number
  longitude: number
}

const NATIVE = Capacitor.isNativePlatform()

/**
 * Returns the device's current coordinates.
 * Native: `@capacitor/geolocation` (Phase 14). Web: navigator.geolocation.
 */
export async function getCurrentPosition(): Promise<Coordinates> {
  if (NATIVE) {
    try {
      const mod = '@capacitor/geolocation'
      const { Geolocation } = (await import(/* @vite-ignore */ mod)) as {
        Geolocation: {
          getCurrentPosition: () => Promise<{
            coords: { latitude: number; longitude: number }
          }>
        }
      }
      const pos = await Geolocation.getCurrentPosition()
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }
    } catch {
      // fall through to the web implementation
    }
  }

  return new Promise<Coordinates>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocalização não suportada neste dispositivo'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
