<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/69e9e5fe-f80b-4e34-92a1-8b72ad146782

## Development environment

Development is **Windows only**. Canonical clone path:

```
C:\projects\shevon\
```

Do not use Linux, WSL, or a remote Linux Cloud Agent as a development machine.

## Run Locally

**Prerequisites:** Node.js on Windows

1. Clone (if needed) and open the project:

   ```powershell
   git clone https://github.com/ronimb/shevon.git C:\projects\shevon
   cd C:\projects\shevon
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Copy [.env.example](.env.example) to `.env.local` and set `GEMINI_API_KEY`.

   ```powershell
   copy .env.example .env.local
   ```

4. Run the app:

   ```powershell
   npm run dev
   ```

Desktop Windows build:

```powershell
npm run build:exe
```
