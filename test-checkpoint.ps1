# Manual Test Script for Daily Checkpoint Functionality
# Run this script to test the checkpoint system manually
# Author: GitHub Copilot
# Date: 2025-05-29

Write-Host "=== fLups Checkpoint System Manual Test ===" -ForegroundColor Magenta
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Current Time: $(Get-Date)" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check if Node.js is available
try {
    $NodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $NodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found - required for v-merger.js" -ForegroundColor Red
    exit 1
}

# Check if v-merger.js exists
if (Test-Path "v-merger.js") {
    Write-Host "✅ v-merger.js found" -ForegroundColor Green
} else {
    Write-Host "❌ v-merger.js not found in current directory" -ForegroundColor Red
    exit 1
}

# Check if daily-checkpoint.ps1 exists
if (Test-Path "daily-checkpoint.ps1") {
    Write-Host "✅ daily-checkpoint.ps1 found" -ForegroundColor Green
} else {
    Write-Host "❌ daily-checkpoint.ps1 not found in current directory" -ForegroundColor Red
    exit 1
}

# Check for existing log files
Write-Host "`n📊 Checking existing loop data..." -ForegroundColor Yellow
$LoopTypes = @("cFLup", "fLup", "fLuper", "fLupOut", "fLupRecurse")
$FoundLogs = @()

foreach ($LoopType in $LoopTypes) {
    $LogFile = "$LoopType-instances.log"
    if (Test-Path $LogFile) {
        $LineCount = (Get-Content $LogFile | Measure-Object -Line).Lines
        Write-Host "✅ $LogFile ($LineCount entries)" -ForegroundColor Green
        $FoundLogs += $LoopType
    } else {
        Write-Host "⚪ $LogFile (not found)" -ForegroundColor Gray
    }
}

if ($FoundLogs.Count -eq 0) {
    Write-Host "⚠️  No existing loop data found. The checkpoint will run but may not create archives." -ForegroundColor Yellow
} else {
    Write-Host "✅ Found data for: $($FoundLogs -join ', ')" -ForegroundColor Green
}

# Run manual test
Write-Host "`n🧪 Running manual checkpoint test..." -ForegroundColor Yellow
Write-Host "Executing: .\daily-checkpoint.ps1 -Verbose" -ForegroundColor Cyan

try {
    & ".\daily-checkpoint.ps1" -Verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Manual checkpoint test completed successfully!" -ForegroundColor Green
    } elseif ($LASTEXITCODE -eq 1) {
        Write-Host "`n⚠️  Manual checkpoint test completed with some failures" -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Manual checkpoint test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error running checkpoint test: $($_.Exception.Message)" -ForegroundColor Red
}

# Check results
Write-Host "`n📁 Checking checkpoint results..." -ForegroundColor Yellow

if (Test-Path "checkpoints") {
    $CheckpointFiles = Get-ChildItem "checkpoints" -Filter "*.json" | Sort-Object CreationTime -Descending
    if ($CheckpointFiles.Count -gt 0) {
        Write-Host "✅ Created $($CheckpointFiles.Count) checkpoint files:" -ForegroundColor Green
        foreach ($File in $CheckpointFiles | Select-Object -First 5) {
            $Size = [math]::Round($File.Length / 1KB, 2)
            Write-Host "   📄 $($File.Name) (${Size}KB)" -ForegroundColor Cyan
        }
        if ($CheckpointFiles.Count -gt 5) {
            Write-Host "   ... and $($CheckpointFiles.Count - 5) more files" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚪ No checkpoint files created" -ForegroundColor Gray
    }
} else {
    Write-Host "⚪ Checkpoints directory not created" -ForegroundColor Gray
}

# Check log
if (Test-Path "checkpoint-automation.log") {
    Write-Host "`n📝 Checking automation log..." -ForegroundColor Yellow
    $LogLines = Get-Content "checkpoint-automation.log" -Tail 10
    Write-Host "Last 10 log entries:" -ForegroundColor Cyan
    foreach ($Line in $LogLines) {
        if ($Line -like "*ERROR*") {
            Write-Host "   $Line" -ForegroundColor Red
        } elseif ($Line -like "*SUCCESS*") {
            Write-Host "   $Line" -ForegroundColor Green
        } elseif ($Line -like "*WARN*") {
            Write-Host "   $Line" -ForegroundColor Yellow
        } else {
            Write-Host "   $Line" -ForegroundColor White
        }
    }
} else {
    Write-Host "⚪ No automation log found" -ForegroundColor Gray
}

Write-Host "`n🎯 Next steps:" -ForegroundColor Magenta
Write-Host "1. Run: .\setup-task-scheduler.ps1     # Set up automatic daily execution" -ForegroundColor White
Write-Host "2. Run: .\setup-task-scheduler.ps1 -Status # Check scheduled task status" -ForegroundColor White
Write-Host "3. The checkpoint will run automatically every day at 22:00 (10 PM)" -ForegroundColor White

Write-Host "`n=== Manual Test Complete ===" -ForegroundColor Magenta
