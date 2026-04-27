# Environment & Config Variables

- `GEMINI_API_KEY`: Required for Google Gemini AI integration. Set in `.env.local`.
- `DISABLE_HMR`: Disables Hot Module Reloading in AI Studio (optional).

## Scripts (from package.json)
- `dev`: vite --port=3000 --host=0.0.0.0
- `build`: vite build
- `preview`: vite preview
- `clean`: rm -rf dist
- `lint`: tsc --noEmit
