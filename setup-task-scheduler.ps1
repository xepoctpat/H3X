# Windows Task Scheduler Setup Script for fLups Daily Checkpoints
# This script creates a scheduled task to run daily at 22:00 (10 PM)
# Author: GitHub Copilot
# Date: 2025-05-29

param(
    [switch]$Remove,
    [switch]$Status
)

$TaskName = "fLups-Daily-Checkpoint"
$ScriptPath = Join-Path $PSScriptRoot "daily-checkpoint.ps1"
$LogPath = Join-Path $PSScriptRoot "checkpoint-automation.log"

function Show-TaskStatus {
    try {
        $Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($Task) {
            Write-Host "✅ Task '$TaskName' is configured:" -ForegroundColor Green
            Write-Host "   State: $($Task.State)" -ForegroundColor Cyan
            Write-Host "   Next Run: $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).NextRunTime)" -ForegroundColor Cyan
            Write-Host "   Last Run: $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).LastRunTime)" -ForegroundColor Cyan
            Write-Host "   Last Result: $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).LastTaskResult)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Task '$TaskName' is not configured" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error checking task status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Remove-CheckpointTask {
    try {
        $Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($Task) {
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
            Write-Host "✅ Task '$TaskName' has been removed successfully" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Task '$TaskName' was not found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error removing task: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Create-CheckpointTask {
    try {
        # Check if script exists
        if (-not (Test-Path $ScriptPath)) {
            Write-Host "❌ Daily checkpoint script not found at: $ScriptPath" -ForegroundColor Red
            Write-Host "   Please ensure daily-checkpoint.ps1 is in the same directory as this script" -ForegroundColor Yellow
            return
        }

        # Remove existing task if it exists
        $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($ExistingTask) {
            Write-Host "ℹ️  Removing existing task '$TaskName'..." -ForegroundColor Yellow
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        }

        # Create the scheduled task action
        $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`" -KeepOnlyLast30Days"

        # Create the scheduled task trigger (daily at 22:00)
        $Trigger = New-ScheduledTaskTrigger -Daily -At "22:00"

        # Create task settings
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

        # Create task principal (run as current user)
        $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

        # Register the scheduled task
        $Task = Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Daily automated checkpoint backup for fLups loop database at 22:00"

        Write-Host "✅ Successfully created scheduled task '$TaskName'" -ForegroundColor Green
        Write-Host "   📅 Schedule: Daily at 22:00 (10:00 PM)" -ForegroundColor Cyan
        Write-Host "   📁 Script: $ScriptPath" -ForegroundColor Cyan
        Write-Host "   📝 Log: $LogPath" -ForegroundColor Cyan
        Write-Host "   🗂️  Checkpoints: .\checkpoints\" -ForegroundColor Cyan
        Write-Host "   🧹 Cleanup: Keeps last 30 days" -ForegroundColor Cyan

        # Show next run time
        $NextRun = (Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).NextRunTime
        Write-Host "   ⏰ Next run: $NextRun" -ForegroundColor Green

        # Test the task
        Write-Host "`n🧪 Testing task execution..." -ForegroundColor Yellow
        Start-ScheduledTask -TaskName $TaskName
        Start-Sleep -Seconds 3
        
        $TaskInfo = Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
        if ($TaskInfo.LastTaskResult -eq 0) {
            Write-Host "✅ Test execution successful!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Test execution completed with result code: $($TaskInfo.LastTaskResult)" -ForegroundColor Yellow
            Write-Host "   Check the log file for details: $LogPath" -ForegroundColor Cyan
        }

    } catch {
        Write-Host "❌ Error creating scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
Write-Host "=== fLups Daily Checkpoint Task Scheduler Setup ===" -ForegroundColor Magenta
Write-Host "Working Directory: $PSScriptRoot" -ForegroundColor Cyan

if ($Remove) {
    Remove-CheckpointTask
} elseif ($Status) {
    Show-TaskStatus
} else {
    # Check if running as administrator
    $IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if (-not $IsAdmin) {
        Write-Host "⚠️  Warning: Not running as administrator. Task may not be created properly." -ForegroundColor Yellow
        Write-Host "   For best results, run PowerShell as Administrator" -ForegroundColor Cyan
    }

    Create-CheckpointTask
}

Write-Host "`n📖 Usage:" -ForegroundColor Magenta
Write-Host "   .\setup-task-scheduler.ps1         # Create/update the scheduled task" -ForegroundColor White
Write-Host "   .\setup-task-scheduler.ps1 -Status # Check task status" -ForegroundColor White
Write-Host "   .\setup-task-scheduler.ps1 -Remove # Remove the scheduled task" -ForegroundColor White
