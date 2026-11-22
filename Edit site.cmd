@echo off
title Site editor (close this window to stop)
cd /d "%~dp0"
if not exist node_modules (
  echo Installing, first run only...
  call npx -y pnpm@11.2.2 install
)
set OPEN_EDITOR=1
echo Starting the editor. Your browser will open at http://localhost:4321/editor/
echo Close this window when you are done.
call npx -y pnpm@11.2.2 dev
