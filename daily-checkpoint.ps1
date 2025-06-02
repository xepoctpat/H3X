# H3Xbase Daily Checkpoint Automation Script
# Runs daily at 22:00 to create database archive checkpoints
# Author: GitHub Copilot
# Date: 2025-05-29
# Updated: H3Xbase integration

param(
    [switch]$Verbose,
    [switch]$KeepOnlyLast30Days,
    [string]$LogPath = ".\checkpoint-automation.log"
)

# Set working directory to script location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Logging function
function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Output $LogEntry
    Add-Content -Path $LogPath -Value $LogEntry
}

# Main checkpoint function
function Start-DailyCheckpoint {
    Write-Log "=== H3Xbase Daily Checkpoint Started ==="
    
    try {
        # Get current date for archive naming
        $DateStamp = Get-Date -Format "yyyy-MM-dd"
        $TimeStamp = Get-Date -Format "HH-mm-ss"
        
        # Define loop types to backup (H3Xbase system)
        $LoopTypes = @("cFLup", "fLup-out", "fLup-recurse", "H3Xbase")
        $SuccessfulBackups = @()
        $FailedBackups = @()
        
        Write-Log "Starting H3Xbase checkpoint for date: $DateStamp at $TimeStamp"
        
        # Create checkpoints directory if it doesn't exist
        $CheckpointDir = ".\checkpoints"
        if (-not (Test-Path $CheckpointDir)) {
            New-Item -ItemType Directory -Path $CheckpointDir | Out-Null
            Write-Log "Created checkpoints directory: $CheckpointDir"
        }
        
        # Export each loop type
        foreach ($LoopType in $LoopTypes) {
            try {
                Write-Log "Creating checkpoint for $LoopType..."
                
                # Check if there are any instances of this loop type
                $LogFile = "$LoopType-instances.log"
                if (-not (Test-Path $LogFile)) {
                    Write-Log "No log file found for $LoopType ($LogFile), skipping..." "WARN"
                    continue
                }
                
                # Check if log file has content
                $LogContent = Get-Content $LogFile -ErrorAction SilentlyContinue
                if (-not $LogContent -or $LogContent.Count -eq 0) {
                    Write-Log "Log file for $LoopType is empty, skipping..." "WARN"
                    continue
                }
                  # Create archive filename
                $ArchiveFile = "$CheckpointDir\$LoopType-checkpoint-$DateStamp-$TimeStamp.json"
                
                # Run H3Xbase export command
                $ExportCmd = "node H3Xbase-merger.js export-loop-archive $LoopType $ArchiveFile"
                Write-Log "Executing: $ExportCmd"
                
                $Result = Invoke-Expression $ExportCmd 2>&1
                  if ($LASTEXITCODE -eq 0) {
                    Write-Log "Successfully created checkpoint: $ArchiveFile" "SUCCESS"
                    $FileSize = 0
                    if (Test-Path $ArchiveFile) {
                        $FileSize = (Get-Item $ArchiveFile).Length
                    }
                    $SuccessfulBackups += @{
                        LoopType = $LoopType
                        ArchiveFile = $ArchiveFile
                        Size = $FileSize
                    }
                } else {
                    Write-Log "Failed to create checkpoint for $LoopType. Error: $Result" "ERROR"
                    $FailedBackups += $LoopType
                }
                
            } catch {
                Write-Log "Exception while creating checkpoint for $LoopType`: $($_.Exception.Message)" "ERROR"
                $FailedBackups += $LoopType
            }
        }
        
        # Create summary archive with all successful backups
        if ($SuccessfulBackups.Count -gt 0) {
            Write-Log "Creating comprehensive checkpoint summary..."
            $SummaryFile = "$CheckpointDir\COMPLETE-checkpoint-$DateStamp-$TimeStamp.json"
            
            $Summary = @{
                checkpointDate = $DateStamp
                checkpointTime = $TimeStamp
                totalLoopTypes = $LoopTypes.Count
                successfulBackups = $SuccessfulBackups.Count
                failedBackups = $FailedBackups.Count
                backupDetails = $SuccessfulBackups
                failedLoopTypes = $FailedBackups
                createdAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
            }
            
            $Summary | ConvertTo-Json -Depth 4 | Out-File -FilePath $SummaryFile -Encoding UTF8
            Write-Log "Checkpoint summary created: $SummaryFile"
        }
        
        # Cleanup old checkpoints if requested
        if ($KeepOnlyLast30Days) {
            Write-Log "Cleaning up checkpoints older than 30 days..."
            $CutoffDate = (Get-Date).AddDays(-30)
            $OldFiles = Get-ChildItem $CheckpointDir -Filter "*checkpoint*.json" | Where-Object { $_.CreationTime -lt $CutoffDate }
            
            foreach ($OldFile in $OldFiles) {
                try {
                    Remove-Item $OldFile.FullName -Force
                    Write-Log "Deleted old checkpoint: $($OldFile.Name)"
                } catch {
                    Write-Log "Failed to delete old checkpoint: $($OldFile.Name). Error: $($_.Exception.Message)" "ERROR"
                }
            }
        }
          Write-Log "=== H3Xbase Checkpoint Summary ==="
        Write-Log "Successful backups: $($SuccessfulBackups.Count)"
        Write-Log "Failed backups: $($FailedBackups.Count)"
        
        if ($SuccessfulBackups.Count -gt 0) {
            Write-Log "Successfully backed up loop types: $($SuccessfulBackups.LoopType -join ', ')"
        }
        
        if ($FailedBackups.Count -gt 0) {
            Write-Log "Failed to backup loop types: $($FailedBackups -join ', ')" "WARN"
        }
        
        Write-Log "=== H3Xbase Daily Checkpoint Completed ==="
        
        # Return exit code based on results
        if ($FailedBackups.Count -eq 0) {
            exit 0  # Success
        } else {
            exit 1  # Partial failure
        }
          } catch {
        Write-Log "Critical error during H3Xbase checkpoint process: $($_.Exception.Message)" "ERROR"
        Write-Log "=== H3Xbase Daily Checkpoint Failed ==="
        exit 2  # Critical failure
    }
}

# Execute main function
if ($Verbose) {
    Write-Log "Starting H3Xbase daily checkpoint in verbose mode..."
}

Start-DailyCheckpoint
