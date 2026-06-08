import { Capacitor } from '@capacitor/core'

const NATIVE = Capacitor.isNativePlatform()

/**
 * Captures or picks a photo and returns it as a data URL (base64), or null if cancelled.
 * Native: `@capacitor/camera` (Phase 14). Web: <input type=file accept=image/* capture>.
 */
export async function pickPhoto(): Promise<string | null> {
  if (NATIVE) {
    try {
      const mod = '@capacitor/camera'
      const { Camera, CameraResultType } = (await import(/* @vite-ignore */ mod)) as {
        Camera: { getPhoto: (o: unknown) => Promise<{ dataUrl?: string }> }
        CameraResultType: { DataUrl: string }
      }
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
      })
      return photo.dataUrl ?? null
    } catch {
      return null
    }
  }

  return pickPhotoWeb()
}

function pickPhotoWeb(): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    // Hint mobile browsers to open the camera directly.
    input.setAttribute('capture', 'environment')
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    }
    input.click()
  })
}
