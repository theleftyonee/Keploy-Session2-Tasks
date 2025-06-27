# StudentHub Dashboard Environment Setup Script (PowerShell)
# This script helps you set up your environment variables on Windows

Write-Host "🚀 StudentHub Dashboard Environment Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled. Your existing .env.local file is preserved." -ForegroundColor Yellow
        exit 0
    }
}

# Copy the example file
if (Test-Path "env.example") {
    Copy-Item "env.example" ".env.local"
    Write-Host "✅ Created .env.local from env.example" -ForegroundColor Green
} else {
    Write-Host "❌ env.example file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local and add your Supabase credentials" -ForegroundColor White
Write-Host "2. Get your Supabase URL and anon key from:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/api" -ForegroundColor Blue
Write-Host ""
Write-Host "🔧 Required variables to update:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: You can use any text editor to modify .env.local" -ForegroundColor Cyan
Write-Host "   Example: code .env.local (VS Code) or notepad .env.local" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green 