# Agent instructions

This project is developed **only on Windows**. Do not treat Linux, macOS, WSL, or remote Linux cloud VMs as a development environment.

## Canonical workspace

Clone and work at:

```
C:\projects\shevon\
```

If a remote Linux checkout already exists, delete it. Do not create another one.

## Commands and paths

- Use **PowerShell** (or cmd.exe). Do not write bash/zsh scripts or Unix-only commands (`rm -rf`, `chmod`, `apt`, shebangs).
- Use Windows paths (`C:\projects\shevon\src\App.tsx`). Do not use `/home/...` or `/workspace`.
- npm scripts must run on Windows. Prefer `node` scripts over shell one-liners.
- Desktop packaging is Windows-only: `npm run build:exe`.

## Local setup (Windows)

```powershell
cd C:\projects\shevon
npm install
copy .env.example .env.local
npm run dev
```

## What not to do

- Do not clone this repo onto a Linux machine or Cloud Agent disk for ongoing work.
- Do not add `.cursor/environment.json`, Dockerfiles, or Linux install/start scripts for this app.
- Do not change GitHub Pages deploy runners unless the task is specifically about CI; that workflow is not local development.
