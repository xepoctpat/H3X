# PowerShell script to fix markdown linting issues across all documentation
Write-Host "🔧 Starting comprehensive markdown lint fixes..." -ForegroundColor Green

$filesToFix = @(
    "e:/H3X-fLups/PULL-REQUEST-BABILLON-DEPLOYMENT.md",
    "e:/H3X-fLups/CHECKPOINT-BABILLON-DEPLOYMENT-COMPLETE.md",
    "e:/H3X-fLups/BABILLON-UNIFIED-GUIDE.md"
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "🔍 Processing: $file" -ForegroundColor Yellow
        try {
            & npx markdownlint --fix $file
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error fixing: $file" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Markdown lint fix process completed!" -ForegroundColor Green
