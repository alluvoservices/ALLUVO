# ALLUVO — Digital Multiplex

Monorepo
- server: Node.js (Express) API (OTP login, profiles, TMDB movies, search, notifications, chat)
- web: React (Vite) app (UI with black smoked glass + neon)
- mobile: Expo app (Android/iOS) using WebView to load the same web app

Live web URL (after deploy): https://alluvoservices.github.io/ALLUVO/

Quick steps
1) Upload assets in web/public (you can do this later)
   - logo.jpg  (your logo)
   - loader.svg (loading animation)
   - opening.mp4 (optional opening video)
2) Commit & Push (Source Control in Codespaces).
3) Deploy backend to Render
   - Root Directory: server
   - Build: npm install
   - Start: npm start
   - Node: 20
   - Environment Variables:
     - CORS_ORIGIN = https://alluvoservices.github.io
     - JWT_SECRET = your-strong-secret
     - TMDB_API_KEY = your_tmdb_key   (https://www.themoviedb.org/settings/api)
     - (Optional SMS) TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE
     - (Optional Email) SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, FROM_EMAIL
4) Copy your Render backend URL (e.g., https://alluvo-api.onrender.com).
5) In GitHub → this repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: API_URL
   - Value: your Render URL
6) In Settings → Pages → Build and deployment → Source = GitHub Actions
7) The workflow builds and deploys the web app automatically to Pages.

Mobile (Android/iOS)
- mobile app (Expo) loads the web URL in a WebView so you have working apps now.
- Later we can convert pages to fully native; this keeps one backend and one source of truth.

