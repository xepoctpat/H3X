#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Babillon Unified System Network Setup Script
    
.DESCRIPTION
    Creates and manages Docker networks for the Babillon unified system.
    Ensures proper network isolation and service discovery.
    
.PARAMETER Action
    The action to perform: create, remove, inspect, or status
    
.PARAMETER Force
    Force recreation of existing networks
    
.EXAMPLE
    .\babillon-network-setup.ps1 -Action create
    
.EXAMPLE
    .\babillon-network-setup.ps1 -Action status
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("create", "remove", "inspect", "status", "recreate")]
    [string]$Action = "create",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Configuration
$NetworkName = "babillon-unified-network"
$Subnet = "172.20.0.0/16"
$Gateway = "172.20.0.1"
$Driver = "bridge"

# Color coding for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    switch ($Color) {
        "Red" { Write-Host $Message -ForegroundColor Red }
        "Green" { Write-Host $Message -ForegroundColor Green }
        "Yellow" { Write-Host $Message -ForegroundColor Yellow }
        "Blue" { Write-Host $Message -ForegroundColor Blue }
        "Cyan" { Write-Host $Message -ForegroundColor Cyan }
        "Magenta" { Write-Host $Message -ForegroundColor Magenta }
        default { Write-Host $Message }
    }
}

function Test-DockerAvailable {
    try {
        $null = docker --version 2>$null
        return $true
    } catch {
        return $false
    }
}

function Test-NetworkExists {
    param([string]$Name)
    
    try {
        $result = docker network inspect $Name 2>$null
        return $true
    } catch {
        return $false
    }
}

function Get-NetworkInfo {
    param([string]$Name)
    
    try {
        $networkInfo = docker network inspect $Name | ConvertFrom-Json
        return $networkInfo[0]
    } catch {
        return $null
    }
}

function New-BabillonNetwork {
    Write-ColorOutput "🌐 Creating Babillon Unified Network..." "Blue"
    
    if (-not (Test-DockerAvailable)) {
        Write-ColorOutput "❌ Docker is not available or not running" "Red"
        exit 1
    }
    
    # Check if network already exists
    if (Test-NetworkExists $NetworkName) {
        if ($Force) {
            Write-ColorOutput "⚠️ Network exists. Removing due to -Force flag..." "Yellow"
            Remove-BabillonNetwork -Quiet
        } else {
            Write-ColorOutput "⚠️ Network '$NetworkName' already exists" "Yellow"
            Write-ColorOutput "Use -Force to recreate or run with -Action status to view details" "Yellow"
            return
        }
    }
    
    try {
        # Create the network with custom configuration
        $createCommand = @(
            "docker", "network", "create",
            "--driver", $Driver,
            "--subnet", $Subnet,
            "--gateway", $Gateway,
            "--opt", "com.docker.network.bridge.name=br-babillon",
            "--opt", "com.docker.network.bridge.enable_ip_masquerade=true",
            "--opt", "com.docker.network.bridge.enable_icc=true",
            "--label", "project=babillon-unified",
            "--label", "version=1.0.0",
            "--label", "environment=production",
            $NetworkName
        )
        
        & $createCommand[0] $createCommand[1..($createCommand.Length-1)]
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Network '$NetworkName' created successfully" "Green"
            Write-ColorOutput "   📍 Subnet: $Subnet" "Cyan"
            Write-ColorOutput "   🚪 Gateway: $Gateway" "Cyan"
            Write-ColorOutput "   🔧 Driver: $Driver" "Cyan"
            
            # Show network details
            Show-NetworkStatus
        } else {
            Write-ColorOutput "❌ Failed to create network: $result" "Red"
            exit 1
        }
        
    } catch {
        Write-ColorOutput "❌ Error creating network: $_" "Red"
        exit 1
    }
}

function Remove-BabillonNetwork {
    param([switch]$Quiet)
    
    if (-not $Quiet) {
        Write-ColorOutput "🗑️ Removing Babillon Unified Network..." "Blue"
    }
    
    if (-not (Test-NetworkExists $NetworkName)) {
        if (-not $Quiet) {
            Write-ColorOutput "⚠️ Network '$NetworkName' does not exist" "Yellow"
        }
        return
    }
    
    try {
        # Check for connected containers
        $networkInfo = Get-NetworkInfo $NetworkName
        if ($networkInfo -and $networkInfo.Containers) {
            $containerCount = ($networkInfo.Containers | Get-Member -MemberType NoteProperty).Count
            if ($containerCount -gt 0) {
                Write-ColorOutput "⚠️ Warning: $containerCount containers are still connected to this network" "Yellow"
                Write-ColorOutput "Connected containers:" "Yellow"
                foreach ($container in $networkInfo.Containers.PSObject.Properties) {
                    Write-ColorOutput "  - $($container.Value.Name)" "Yellow"
                }
                
                if (-not $Force -and -not $Quiet) {
                    $response = Read-Host "Do you want to continue? (y/N)"
                    if ($response -ne "y" -and $response -ne "Y") {
                        Write-ColorOutput "Operation cancelled" "Yellow"
                        return
                    }
                }
            }
        }
        
        docker network rm $NetworkName | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            if (-not $Quiet) {
                Write-ColorOutput "✅ Network '$NetworkName' removed successfully" "Green"
            }
        } else {
            Write-ColorOutput "❌ Failed to remove network" "Red"
            exit 1
        }
        
    } catch {
        Write-ColorOutput "❌ Error removing network: $_" "Red"
        exit 1
    }
}

function Show-NetworkStatus {
    Write-ColorOutput "📊 Babillon Network Status" "Blue"
    Write-ColorOutput "=========================" "Blue"
    
    if (-not (Test-NetworkExists $NetworkName)) {
        Write-ColorOutput "❌ Network '$NetworkName' does not exist" "Red"
        Write-ColorOutput "Run with -Action create to create the network" "Yellow"
        return
    }
    
    try {
        $networkInfo = Get-NetworkInfo $NetworkName
        
        if ($networkInfo) {
            Write-ColorOutput "✅ Network Status: Active" "Green"
            Write-ColorOutput "🆔 Network ID: $($networkInfo.Id.Substring(0,12))" "Cyan"
            Write-ColorOutput "🔧 Driver: $($networkInfo.Driver)" "Cyan"
            Write-ColorOutput "📍 Subnet: $($networkInfo.IPAM.Config[0].Subnet)" "Cyan"
            Write-ColorOutput "🚪 Gateway: $($networkInfo.IPAM.Config[0].Gateway)" "Cyan"
            Write-ColorOutput "📅 Created: $([DateTime]::Parse($networkInfo.Created).ToString('yyyy-MM-dd HH:mm:ss'))" "Cyan"
            
            # Show connected containers
            if ($networkInfo.Containers) {
                $containerCount = ($networkInfo.Containers | Get-Member -MemberType NoteProperty).Count
                Write-ColorOutput "🐳 Connected Containers: $containerCount" "Cyan"
                
                if ($containerCount -gt 0) {
                    foreach ($container in $networkInfo.Containers.PSObject.Properties) {
                        $containerName = $container.Value.Name
                        $containerIP = $container.Value.IPv4Address.Split('/')[0]
                        Write-ColorOutput "  📦 $containerName - $containerIP" "White"
                    }
                }
            } else {
                Write-ColorOutput "🐳 Connected Containers: 0" "Cyan"
            }
            
            # Show labels
            if ($networkInfo.Labels) {
                Write-ColorOutput "🏷️ Labels:" "Cyan"
                foreach ($label in $networkInfo.Labels.PSObject.Properties) {
                    Write-ColorOutput "  $($label.Name): $($label.Value)" "White"
                }
            }
        }
        
    } catch {
        Write-ColorOutput "❌ Error getting network status: $_" "Red"
        exit 1
    }
}

function Show-NetworkInspect {
    Write-ColorOutput "🔍 Detailed Network Inspection" "Blue"
    Write-ColorOutput "==============================" "Blue"
    
    if (-not (Test-NetworkExists $NetworkName)) {
        Write-ColorOutput "❌ Network '$NetworkName' does not exist" "Red"
        return
    }
    
    try {
        docker network inspect $NetworkName
    } catch {
        Write-ColorOutput "❌ Error inspecting network: $_" "Red"
        exit 1
    }
}

function Start-NetworkRecreate {
    Write-ColorOutput "🔄 Recreating Babillon Unified Network..." "Blue"
    Remove-BabillonNetwork -Quiet
    New-BabillonNetwork
}

# Main execution
Write-ColorOutput "🚀 Babillon Unified System - Network Manager" "Magenta"
Write-ColorOutput "===========================================" "Magenta"
Write-ColorOutput ""

switch ($Action.ToLower()) {
    "create" {
        New-BabillonNetwork
    }
    "remove" {
        Remove-BabillonNetwork
    }
    "status" {
        Show-NetworkStatus
    }
    "inspect" {
        Show-NetworkInspect
    }
    "recreate" {
        Start-NetworkRecreate
    }
    default {
        Write-ColorOutput "❌ Unknown action: $Action" "Red"
        Write-ColorOutput "Valid actions: create, remove, status, inspect, recreate" "Yellow"
        exit 1
    }
}

Write-ColorOutput ""
Write-ColorOutput "🎯 Network management complete!" "Green"
