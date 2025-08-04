Start-Process -FilePath "php" -ArgumentList "artisan serve" -WindowStyle Hidden
Start-Process -FilePath "php" -ArgumentList "artisan queue:work --tries=1 --timeout=0 --verbose" -WindowStyle Hidden
