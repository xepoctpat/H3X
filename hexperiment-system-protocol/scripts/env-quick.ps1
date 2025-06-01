# Quick Environment Management Script
# Provides simple commands for common environment operations

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod", "switch", "status", "up", "down", "restart", "logs", "clean", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Target = "",
    
    [switch]$Build,
    [switch]$Force
)

$ScriptDir = $PSScriptRoot
$EnvSwitcher = "$ScriptDir\env-switcher.ps1"

function Write-Info { param([string]$Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host $Message -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host $Message -ForegroundColor Red }

function Invoke-EnvSwitcher {
    param([string[]]$Arguments)
    & $EnvSwitcher @Arguments
}

switch ($Command) {
    "dev" {
        Write-Info "Starting development environment..."
        if ($Build) {
            Invoke-EnvSwitcher @("dev", "-Up", "-Build")
        } else {
            Invoke-EnvSwitcher @("dev", "-Up")
        }
    }
    
    "prod" {
        Write-Info "Starting production environment..."
        if ($Build) {
            Invoke-EnvSwitcher @("prod", "-Up", "-Build")
        } else {
            Invoke-EnvSwitcher @("prod", "-Up")
        }
    }
    
    "switch" {
        if (-not $Target) {
            Write-Error "Please specify target environment: dev or prod"
            Write-Info "Usage: npm run env:quick switch dev"
            exit 1
        }
        Write-Info "Switching to $Target environment..."
        Invoke-EnvSwitcher @($Target)
    }
    
    "status" {
        Invoke-EnvSwitcher @("status")
    }
    
    "up" {
        if (-not $Target) {
            Write-Error "Please specify environment: dev or prod"
            Write-Info "Usage: npm run env:quick up dev"
            exit 1
        }
        Write-Info "Starting $Target environment..."
        if ($Build) {
            Invoke-EnvSwitcher @($Target, "-Up", "-Build")
        } else {
            Invoke-EnvSwitcher @($Target, "-Up")
        }
    }
    
    "down" {
        if (-not $Target) {
            Write-Error "Please specify environment: dev or prod"
            Write-Info "Usage: npm run env:quick down dev"
            exit 1
        }
        Write-Info "Stopping $Target environment..."
        Invoke-EnvSwitcher @($Target, "-Down")
    }
    
    "restart" {
        if (-not $Target) {
            Write-Error "Please specify environment: dev or prod"
            Write-Info "Usage: npm run env:quick restart dev"
            exit 1
        }
        Write-Info "Restarting $Target environment..."
        Invoke-EnvSwitcher @($Target, "-Down")
        Start-Sleep -Seconds 2
        if ($Build) {
            Invoke-EnvSwitcher @($Target, "-Up", "-Build")
        } else {
            Invoke-EnvSwitcher @($Target, "-Up")
        }
    }
    
    "logs" {
        if (-not $Target) {
            Write-Error "Please specify environment: dev or prod"
            Write-Info "Usage: npm run env:quick logs dev"
            exit 1
        }
        Write-Info "Showing logs for $Target environment..."
        Invoke-EnvSwitcher @($Target, "-Logs")
    }
    
    "clean" {
        Write-Warning "Cleaning up Docker resources..."
        if ($Force) {
            Write-Warning "Force cleaning - this will remove all containers, networks, and volumes!"
            docker system prune -af --volumes
        } else {
            Write-Info "Cleaning unused resources (use -Force for complete cleanup)..."
            docker system prune -f
        }
        Write-Success "Cleanup completed!"    }
    
    "help" {
        Write-Info "=== H3X Quick Environment Manager ==="
        Write-Info "Available commands:"
        Write-Info "• dev          - Start development environment"
        Write-Info "• prod         - Start production environment"
        Write-Info "• switch <env> - Switch environment without starting"
        Write-Info "• status       - Show current environment status"
        Write-Info "• up <env>     - Start specific environment"
        Write-Info "• down <env>   - Stop specific environment"
        Write-Info "• restart <env>- Restart specific environment"
        Write-Info "• logs <env>   - Show logs for environment"
        Write-Info "• clean        - Clean up Docker resources"
        Write-Info ""
        Write-Info "Flags:"
        Write-Info "• -Build       - Rebuild containers when starting"
        Write-Info "• -Force       - Force operation (for clean command)"
        Write-Info ""
        Write-Info "Examples:"
        Write-Info "• npm run env:quick dev -Build"
        Write-Info "• npm run env:quick switch prod"
        Write-Info "• npm run env:quick restart dev -Build"
        Write-Info "• npm run env:quick clean -Force"
    }
    
    default {
        Write-Info "=== H3X Quick Environment Manager ==="
        Write-Info "Available commands:"
        Write-Info "• dev          - Start development environment"
        Write-Info "• prod         - Start production environment"
        Write-Info "• switch <env> - Switch environment without starting"
        Write-Info "• status       - Show current environment status"
        Write-Info "• up <env>     - Start specific environment"
        Write-Info "• down <env>   - Stop specific environment"
        Write-Info "• restart <env>- Restart specific environment"
        Write-Info "• logs <env>   - Show logs for environment"
        Write-Info "• clean        - Clean up Docker resources"
        Write-Info ""
        Write-Info "Flags:"
        Write-Info "• -Build       - Rebuild containers when starting"
        Write-Info "• -Force       - Force operation (for clean command)"
        Write-Info ""
        Write-Info "Examples:"
        Write-Info "• npm run env:quick dev -Build"
        Write-Info "• npm run env:quick switch prod"
        Write-Info "• npm run env:quick restart dev -Build"
        Write-Info "• npm run env:quick clean -Force"
    }
}
