# Project Rebrand and PWA Transition Instructions

We are pivoting our development approach to **Path A: React Web + Capacitor**. 

Our current project generates an `.apk` build, but we want to focus on delivering a high-quality **Progressive Web App (PWA)** first. This will allow us to host the app online for free and test it immediately with friends on both iOS and Android. Later, we will use Capacitor to wrap this same codebase back into native App Store and Play Store packages.

Additionally, we are rebranding the application.

---

## 1. Rebranding Details
Please update all instances of the application's name, titles, metadata, and branding configurations to the following:

*   **New Name:** Rango Social

Also change the Logo as found in Logo.png

---

## 2. Your Task
At this stage, **do not write a migration plan or modify any code yet**. 

Instead, perform an initial analysis of our current project directory and prepare to address the following high-level considerations for Path A:

### High-Level Considerations to Analyze:

1.  **Current Project Stack:**
    Identify if our current setup is standard React (Vite, Webpack), React Native, or something else. We need to know how easily the current UI code can run in a standard desktop/mobile web browser.

2.  **Capacitor Architecture Compatibility:**
    How should we structure our build output (e.g., the `dist` or `build` folder) so that it remains fully compatible with a PWA hosting environment while also being ready for Capacitor’s standard sync command (`npx cap sync`) later?

3.  **PWA Core Requirements:**
    What assets (icons, splash screens matching the "Larica" branding), manifest settings, and service worker configurations will we need to introduce to ensure iOS and Android browsers recognize the web app as installable?

4.  **Native API Fallbacks:**
    If our current `.apk` code relies on native mobile hardware APIs (like Geolocation for finding food nearby, Camera, or local storage), how can we ensure these gracefully fall back to standard Web APIs when running as a PWA?

5.  **Environment Variables & Backend:**
    How are our database connections (e.g., Firebase, Supabase, or APIs) configured? We must ensure web-safe environment variables are used and that we don't encounter CORS (Cross-Origin Resource Sharing) issues when running on a web domain instead of a native mobile container.

---

## 3. Expected Output
Please review the codebase with these points in mind, update the app name references where safe to do so, and present your high-level findings regarding our project's readiness for this transition.