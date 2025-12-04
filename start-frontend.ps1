# Ontrack - Start Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Ontrack Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location -Path "c:\Users\user\Desktop\ontrack-project\Ontrack\frontend"

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend is running at: http://localhost:5066" -ForegroundColor Green
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Cyan
Write-Host "  Customer: customer@test.com / password123" -ForegroundColor White
Write-Host "  Driver:   driver@test.com / password123" -ForegroundColor White
Write-Host "  Admin:    admin@test.com / password123" -ForegroundColor White
Write-Host ""

npm run dev
