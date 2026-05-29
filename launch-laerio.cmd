@echo off
REM L'AERIO desktop launcher.
REM Critical: clear ELECTRON_RUN_AS_NODE because bun/sub-shells may set it,
REM which forces Electron to behave as plain Node — breaks @electron-toolkit/utils.
cd /d %~dp0
set ELECTRON_RUN_AS_NODE=
echo Starting L'AERIO desktop (electron-vite dev)...
echo Sidecar auto-spawns on 127.0.0.1:5180 via Electron lifecycle.
echo For research+pitch to work, start llama-server in a separate shell:
echo   set PYTHONPATH=U:\Laerio\_scripts
echo   python -c "from p5_rag.llama_server import start; start()"
echo.
bun run dev
