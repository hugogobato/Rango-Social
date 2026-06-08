/**
 * Platform abstraction layer (Message §4).
 *
 * The app never calls a native or web API directly — it imports from here. Each
 * module picks the Capacitor plugin on native and a web fallback in the browser.
 */
export { storage } from './storage'
export { getCurrentPosition, type Coordinates } from './geolocation'
export { pickPhoto } from './camera'
export { shareContent, type SharePayload, type ShareResult } from './share'
