# fLups Daily Checkpoint Automation System

## Overview
Automated daily backup system for fLups loop database that creates archive checkpoints every day at 22:00 (10 PM) without user intervention.

## Files Created

### 1. `daily-checkpoint.ps1` - Main Automation Script
- **Purpose**: Creates daily archive exports of all loop types
- **Features**:
  - Exports all available loop types (cFLup, fLup, fLuper, fLupOut, fLupRecurse)
  - Creates timestamped archive files
  - Comprehensive error handling and logging
  - Automatic cleanup of old archives (30-day retention)
  - Summary reporting

### 2. `setup-task-scheduler.ps1` - Windows Task Scheduler Setup
- **Purpose**: Configures Windows Task Scheduler for automatic execution
- **Features**:
  - Creates scheduled task to run daily at 22:00
  - Handles existing task updates
  - Administrative privilege detection
  - Task status checking and removal options

### 3. `test-checkpoint.ps1` - Manual Testing Script
- **Purpose**: Tests the checkpoint system manually before automation
- **Features**:
  - Prerequisites validation
  - Manual checkpoint execution
  - Results verification
  - Log analysis

## Quick Setup

### Step 1: Test the System
```powershell
# Navigate to fLups directory
cd e:\fLups

# Test the checkpoint system manually
.\test-checkpoint.ps1
```

### Step 2: Set Up Automation
```powershell
# Set up daily automation (run as Administrator for best results)
.\setup-task-scheduler.ps1

# Check status anytime
.\setup-task-scheduler.ps1 -Status
```

### Step 3: Verify Automation
The system will now automatically:
- Run every day at 22:00 (10 PM)
- Create checkpoint archives in `.\checkpoints\` directory
- Log all activities to `checkpoint-automation.log`
- Clean up archives older than 30 days

## Generated Files Structure

```
checkpoints/
├── cFLup-checkpoint-2025-05-29-22-00-00.json
├── fLup-checkpoint-2025-05-29-22-00-00.json
├── fLuper-checkpoint-2025-05-29-22-00-00.json
├── COMPLETE-checkpoint-2025-05-29-22-00-00.json
└── ...

checkpoint-automation.log  # Automation activity log
```

## Features

### Automatic Export
- **All Loop Types**: Exports cFLup, fLup, fLuper, fLupOut, fLupRecurse
- **Timestamped Files**: Format: `{LoopType}-checkpoint-YYYY-MM-DD-HH-MM-SS.json`
- **Summary Archive**: Combined summary with metadata

### Error Handling
- **Graceful Failures**: Continues with other loop types if one fails
- **Detailed Logging**: All activities logged with timestamps
- **Exit Codes**: Proper exit codes for monitoring

### Maintenance
- **Automatic Cleanup**: Removes archives older than 30 days
- **Storage Efficient**: Only creates archives for loop types with data
- **Non-Destructive**: Never modifies original log files

## Manual Commands

### Run Checkpoint Now
```powershell
.\daily-checkpoint.ps1 -Verbose
```

### Run Without Cleanup
```powershell
.\daily-checkpoint.ps1
```

### Check Task Status
```powershell
.\setup-task-scheduler.ps1 -Status
```

### Remove Automation
```powershell
.\setup-task-scheduler.ps1 -Remove
```

## Monitoring

### Check Last Run
```powershell
# View recent log entries
Get-Content checkpoint-automation.log -Tail 20

# Check Windows Task Scheduler
.\setup-task-scheduler.ps1 -Status
```

### Check Backup Files
```powershell
# List recent checkpoints
Get-ChildItem checkpoints -Filter "*.json" | Sort CreationTime -Desc | Select -First 10
```

## Troubleshooting

### Common Issues

1. **PowerShell Execution Policy**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Task Scheduler Permissions**
   - Run PowerShell as Administrator when setting up the task
   - Ensure user has permission to run scheduled tasks

3. **Missing Node.js**
   - Ensure Node.js is installed and in PATH
   - Test with: `node --version`

4. **Log File Permissions**
   - Ensure write permissions to fLups directory
   - Check that checkpoints directory can be created

### Log Analysis
```powershell
# View errors only
Get-Content checkpoint-automation.log | Where-Object { $_ -like "*ERROR*" }

# View success messages
Get-Content checkpoint-automation.log | Where-Object { $_ -like "*SUCCESS*" }
```

## Benefits

1. **Zero Maintenance**: Runs automatically without intervention
2. **Data Safety**: Regular backups ensure data preservation
3. **Storage Management**: Automatic cleanup prevents disk bloat
4. **Monitoring**: Comprehensive logging for troubleshooting
5. **Flexibility**: Easy to modify schedule or retention policies

## Notes

- Archives are created in JSON format compatible with the import system
- The system skips empty or non-existent loop types
- All operations are logged for audit trail
- Backup files can be imported using the existing import functionality
- Schedule can be modified via Windows Task Scheduler if needed

## Integration

This automation system integrates seamlessly with:
- Existing fLups export functionality (`v-merger.js export-loop-type`)
- Import system for restoring from checkpoints
- Browser-based fLups interface
- Command-line fLups operations
