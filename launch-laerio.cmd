@echo off
REM L'AERIO desktop launcher — bypass PowerShell shell-shim friction.
REM Usage:  double-click this .cmd or run from cmd:  launch-laerio.cmd
cd /d %~dp0
echo Starting L'AERIO desktop (electron-vite dev)...
echo Sidecar auto-spawns on 127.0.0.1:5180 via Electron lifecycle.
echo For research+pitch to work, start llama-server in a separate shell:
echo   set PYTHONPATH=U:\Laerio\_scripts
echo   python -c "from p5_rag.llama_server import start; start()"
echo.
bun run dev
