@echo off
title ASK MOTORS - 1-Click Desktop Installer
color 0A
echo ========================================================
echo        ASK MOTORS - Vehicle Registration & Accounts
echo                   Desktop App Installation
echo ========================================================
echo.
echo Installing ASK MOTORS App on your computer...

set "APP_URL=https://ais-dev-wm4uxaabi2imaofk7hzfyz-112628169916.asia-southeast1.run.app"

echo [1/3] Detecting web browser (Chrome / Edge / Brave)...
set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BROWSER=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"

if not defined BROWSER (
  echo.
  echo [ERROR] Google Chrome or Microsoft Edge not found.
  echo Please install Chrome or Edge, then run this installer again.
  pause
  exit /b
)

echo [2/3] Creating Desktop and Start Menu shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "$ws = New-Object -ComObject WScript.Shell;" ^
 "$d = [Environment]::GetFolderPath('Desktop') + '\ASK MOTORS.lnk';" ^
 "$sm = [Environment]::GetFolderPath('Programs') + '\ASK MOTORS.lnk';" ^
 "foreach($p in @($d, $sm)){ if($p){ try { $s = $ws.CreateShortcut($p); $s.TargetPath = '%BROWSER%'; $s.Arguments = '--app=\"%APP_URL%\"'; $s.Description = 'ASK MOTORS Vehicle Registration and Accounts'; $s.Save(); } catch {} } }"

echo [3/3] Launching ASK MOTORS...
echo ========================================================
echo  Success! Installation Complete.
echo  A shortcut "ASK MOTORS" has been placed on your Desktop.
echo ========================================================
start "" "%BROWSER%" --app="%APP_URL%"
exit
