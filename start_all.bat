@echo off
title SRATS - Major Project Launcher
color 0A

echo.
echo  =============================================
echo       SRATS - Smart Real-Time Attendance
echo         Major Project Demo Launcher
echo  =============================================
echo.

:: ── Step 1: Start Backend ─────────────────────────────────
echo  [1/3] Starting Spring Boot Backend...
start "SRATS Backend" cmd /k "cd /d "%~dp0backend" && set JAVA_HOME=C:\Users\meash\.jdks\ms-21.0.9 && set PATH=C:\Users\meash\.jdks\ms-21.0.9\bin;%PATH% && ..\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"
echo       Backend window opened. Waiting 20 seconds for it to start...
timeout /t 20 /nobreak > nul

:: ── Step 2: Start Frontend ────────────────────────────────
echo  [2/3] Starting React Frontend...
start "SRATS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host --port 5173"
echo       Frontend window opened. Waiting 5 seconds...
timeout /t 5 /nobreak > nul

:: ── Step 3: Start Ngrok ───────────────────────────────────
echo  [3/3] Starting Ngrok tunnel (for mobile access)...
start "SRATS Ngrok" cmd /k "ngrok http 5173"
echo       Ngrok window opened.

:: ── Get local IP ──────────────────────────────────────────
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

:: ── Summary ───────────────────────────────────────────────
echo.
echo  =============================================
echo   SRATS IS STARTING UP!
echo  =============================================
echo.
echo   PC Browser    : http://localhost:5173
echo   Phone (WiFi)  : http://%IP%:5173
echo   Phone (Ngrok) : Check the Ngrok window for
echo                   the https://xxxx.ngrok URL
echo.
echo  =============================================
echo   DEMO CHECKLIST:
echo    1. Wait for backend "Started SratsApplication"
echo    2. Open http://localhost:5173 on PC
echo    3. Login as teacher ^& start a session
echo       (set radius to 1000m, click Use My Location)
echo    4. Student scans QR with phone camera
echo    5. Attendance marked automatically!
echo  =============================================
echo.
pause
