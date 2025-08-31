@echo off
title Laravel + Frontend + Queue (Single CMD)

:: Pindah ke folder backend Laravel
cd /d "%~dp0"

echo Menjalankan Laravel backend...
start "" /b cmd /c "php artisan serve"

echo Menjalankan Frontend React...
start "" /b cmd /c "cd alfamart-shift-frontend && npm start"

echo Menjalankan Queue Worker...
start "" /b cmd /c "php artisan queue:work --tries=1 --timeout=0 --verbose"

echo =======================================
echo Semua service sudah dijalankan!
echo Tekan CTRL + C untuk menghentikan semua.
echo =======================================

pause > nul
