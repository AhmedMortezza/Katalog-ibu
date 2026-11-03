@echo off
title Katalog Snack Ibu - Web Server
cd /d "%~dp0"

echo ===================================================
echo   Memulai Web Katalog Snack Ibu
echo ===================================================
echo.

set PYTHON_CMD="C:\Users\ACER\AppData\Local\Programs\Python\Python313\python.exe"

if exist %PYTHON_CMD% (
    start http://127.0.0.1:5000
    %PYTHON_CMD% app.py
) else (
    echo Python 3.13 tidak ditemukan di path default. Mencoba python sistem...
    start http://127.0.0.1:5000
    python app.py
)

pause

