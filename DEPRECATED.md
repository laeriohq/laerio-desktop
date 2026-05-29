# laerio-desktop — DEPRECATED 2026-05-28

This Hermes Electron fork is no longer the primary L'AERIO HQ surface.

## What replaced it

The 3 L'AERIO panels (Brands / Research / Health) were ported to the Prompt
Studio Tauri viewer at `U:\Laerio\AI-Creators\viewer\`. That viewer:

- Loads in ~50ms (native Tauri, not Electron+Chromium)
- Has zero Hermes upstream-drift risk
- Talks to the same FastAPI sidecar at `http://127.0.0.1:5180`
- Adds a "L'AERIO HQ" mode toggle to the existing Prompt Studio sidebar

Launch via:
```
cd U:\Laerio\AI-Creators\viewer
RUN_WEB.bat                      # browser, http://localhost:8765
# or build the Tauri desktop bundle once MSVC is installed:
# bunx tauri build
```

## What still lives here

- `sidecar/` — FastAPI HTTP service that all L'AERIO surfaces hit. Active.
- Hermes' default panels (mail/drive/chat) — untouched upstream fork.

If Hermes itself becomes useful again for L'AERIO (e.g. its mail UI for
hello@/asal@ integration), this fork is preserved — just no longer the
canonical L'AERIO frontend.

## Branch state

- `feature/p6-l-aerio-mvp` carries phase 6 + sidecar /state/snapshot + this
  deprecation note. Welcome.tsx + App.tsx skip-button edits were reverted.
  Layout.tsx still contains the 3 L'AERIO nav items but they harmless
  (only render when Hermes is fully installed + you reach `main` screen).
