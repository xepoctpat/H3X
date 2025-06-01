# Environment Switcher for H3X Hexperiment System
# This script helps switch between development and production Docker Compose configurations

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod", "status", "list")]
    [string]$Environment,
    
    [switch]$Up,
    [switch]$Down,
    [switch]$Build,
    [switch]$Logs,
    [switch]$Status,
    [string]$Service = "",
    [string]$Profile = ""
)

# Configuration
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DevComposeFile = "$ProjectRoot\docker-compose.dev.yml"
$ProdComposeFile = "$ProjectRoot\docker-compose.prod.yml"
$CurrentEnvFile = "$ProjectRoot\.current-env"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Get-CurrentEnvironment {
    if (Test-Path $CurrentEnvFile) {
        return Get-Content $CurrentEnvFile -Raw | ForEach-Object { $_.Trim() }
    }
    return "none"
}

function Set-CurrentEnvironment {
    param([string]$Env)
    $Env | Out-File -FilePath $CurrentEnvFile -Encoding UTF8 -NoNewline
}

function Get-ComposeFile {
    param([string]$Env)
    switch ($Env) {
        "dev" { return $DevComposeFile }
        "prod" { return $ProdComposeFile }
        default { throw "Invalid environment: $Env" }
    }
}

function Invoke-DockerCompose {
    param(
        [string]$ComposeFile,
        [string[]]$Arguments
    )
    
    $cmd = "docker-compose"
    $args = @("-f", $ComposeFile) + $Arguments
    
    Write-ColorOutput "Executing: $cmd $($args -join ' ')" "Cyan"
    & $cmd @args
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Command failed with exit code: $LASTEXITCODE" "Red"
        return $false
    }
    return $true
}

function Show-EnvironmentStatus {
    $currentEnv = Get-CurrentEnvironment
    Write-ColorOutput "=== H3X Environment Status ===" "Yellow"
    Write-ColorOutput "Current Environment: $currentEnv" "Green"
    
    if ($currentEnv -ne "none") {
        $composeFile = Get-ComposeFile $currentEnv
        Write-ColorOutput "Compose File: $composeFile" "Gray"
        
        Write-ColorOutput "`n=== Running Services ===" "Yellow"
        Invoke-DockerCompose $composeFile @("ps")
        
        Write-ColorOutput "`n=== Network Status ===" "Yellow"
        if ($currentEnv -eq "dev") {
            docker network ls | Select-String "h3x-neural-network-dev"
        } else {
            docker network ls | Select-String "h3x-neural-network-prod"
        }
    }
}

function Show-EnvironmentList {
    Write-ColorOutput "=== Available Environments ===" "Yellow"
    Write-ColorOutput "• dev  - Development environment with hot reload, debug ports, and relaxed security" "Green"
    Write-ColorOutput "• prod - Production environment with optimized settings, resource limits, and security" "Green"
    Write-ColorOutput "`nCurrent: $(Get-CurrentEnvironment)" "Cyan"
}

function Switch-Environment {
    param([string]$NewEnv)
    
    $currentEnv = Get-CurrentEnvironment
    
    if ($currentEnv -eq $NewEnv) {
        Write-ColorOutput "Already using $NewEnv environment" "Yellow"
        return
    }
    
    # Stop current environment if running
    if ($currentEnv -ne "none") {
        Write-ColorOutput "Stopping current $currentEnv environment..." "Yellow"
        $currentComposeFile = Get-ComposeFile $currentEnv
        Invoke-DockerCompose $currentComposeFile @("down")
    }
    
    # Set new environment
    Set-CurrentEnvironment $NewEnv
    Write-ColorOutput "Switched to $NewEnv environment" "Green"
    
    # Show next steps
    Write-ColorOutput "`nNext steps:" "Cyan"
    Write-ColorOutput "• Run: npm run env:up -- $NewEnv" "White"
    Write-ColorOutput "• Or:  npm run env:build -- $NewEnv" "White"
}

function Start-Environment {
    param([string]$Env, [switch]$BuildFlag)
    
    $composeFile = Get-ComposeFile $Env
    
    if (-not (Test-Path $composeFile)) {
        Write-ColorOutput "Compose file not found: $composeFile" "Red"
        return $false
    }
    
    Set-CurrentEnvironment $Env
    
    $args = @()
    if ($BuildFlag) {
        $args += "up", "--build", "-d"
        Write-ColorOutput "Building and starting $Env environment..." "Yellow"
    } else {
        $args += "up", "-d"
        Write-ColorOutput "Starting $Env environment..." "Yellow"
    }
    
    if ($Profile) {
        $args += "--profile", $Profile
        Write-ColorOutput "Using profile: $Profile" "Cyan"
    }
    
    $success = Invoke-DockerCompose $composeFile $args
    
    if ($success) {
        Write-ColorOutput "$Env environment started successfully!" "Green"
        Write-ColorOutput "`nServices status:" "Cyan"
        Invoke-DockerCompose $composeFile @("ps")
    }
    
    return $success
}

function Stop-Environment {
    param([string]$Env)
    
    $composeFile = Get-ComposeFile $Env
    Write-ColorOutput "Stopping $Env environment..." "Yellow"
    
    $success = Invoke-DockerCompose $composeFile @("down")
    
    if ($success) {
        Write-ColorOutput "$Env environment stopped successfully!" "Green"
        
        # Clear current environment if stopping the active one
        $currentEnv = Get-CurrentEnvironment
        if ($currentEnv -eq $Env) {
            Set-CurrentEnvironment "none"
        }
    }
    
    return $success
}

function Show-Logs {
    param([string]$Env, [string]$ServiceName)
    
    $composeFile = Get-ComposeFile $Env
    $args = @("logs", "-f")
    
    if ($ServiceName) {
        $args += $ServiceName
        Write-ColorOutput "Showing logs for $ServiceName in $Env environment..." "Yellow"
    } else {
        Write-ColorOutput "Showing logs for all services in $Env environment..." "Yellow"
    }
    
    Invoke-DockerCompose $composeFile $args
}

# Main script logic
try {
    Write-ColorOutput "=== H3X Environment Switcher ===" "Magenta"
    
    switch ($Environment) {
        "status" {
            Show-EnvironmentStatus
        }
        "list" {
            Show-EnvironmentList
        }
        default {
            if ($Up) {
                Start-Environment $Environment -BuildFlag:$Build
            } elseif ($Down) {
                Stop-Environment $Environment
            } elseif ($Logs) {
                Show-Logs $Environment $Service
            } elseif ($Status) {
                Show-EnvironmentStatus
            } else {
                Switch-Environment $Environment
            }
        }
    }
} catch {
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-ColorOutput "Stack Trace: $($_.ScriptStackTrace)" "Red"
    exit 1
}
