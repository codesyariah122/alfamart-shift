@echo off
title Laravel App Starter (Minimized)

:: Jalankan Laravel serve (minimize)
start /min cmd /c "php artisan serve"

:: Jalankan queue worker (minimize)
start /min cmd /c "php artisan queue:work --tries=1 --timeout=0 --verbose"
