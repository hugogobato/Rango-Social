import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor wraps the same static `dist/` that Vercel serves as a PWA into
 * native iOS/Android shells (Phase 14). The service worker is registered on web
 * only (see src/main.tsx) to avoid cache conflicts inside the native WebView.
 */
const config: CapacitorConfig = {
  appId: 'com.rangosocial.app',
  appName: 'Rango Social',
  webDir: 'dist',
  backgroundColor: '#0F0F0F',
  plugins: {
    SplashScreen: {
      backgroundColor: '#0F0F0F',
      launchShowDuration: 1200,
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F0F0F',
    },
  },
}

export default config
