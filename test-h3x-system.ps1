# H3X System Test Suite
param(
    [string]$TestType = "all",
    [switch]$Verbose
)

Write-Host "🧪 H3X System Testing Suite" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$testResults = @()

function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Port
    )
    
    Write-Host "Testing $Name..." -ForegroundColor Yellow
    
    try {
        # Test port connectivity
        $portTest = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        
        if ($portTest.TcpTestSucceeded) {
            # Test HTTP endpoint if URL provided
            if ($Url) {
                $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
                Write-Host "✅ $Name is healthy" -ForegroundColor Green
                return @{ Service = $Name; Status = "Healthy"; Port = $Port; Response = $response }
            } else {
                Write-Host "✅ $Name port is open" -ForegroundColor Green
                return @{ Service = $Name; Status = "Port Open"; Port = $Port }
            }
        } else {
            Write-Host "❌ $Name is not responding on port $Port" -ForegroundColor Red
            return @{ Service = $Name; Status = "Failed"; Port = $Port; Error = "Port not accessible" }
        }
    }
    catch {
        Write-Host "❌ $Name test failed: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Service = $Name; Status = "Error"; Port = $Port; Error = $_.Exception.Message }
    }
}

function Test-H3XComponents {
    Write-Host "`n🔧 Testing H3X Core Components..." -ForegroundColor Magenta
    
    # Test UI Server
    $script:testResults += Test-Service -Name "H3X UI Server" -Url "http://localhost:3007/health" -Port 3007
    
    # Test API Server  
    $script:testResults += Test-Service -Name "H3X API Server" -Url "http://localhost:3008/api/health" -Port 3008
    
    # Test WebSocket (port only)
    $script:testResults += Test-Service -Name "H3X WebSocket" -Port 3009
    
    # Test if main HTML files exist
    $htmlFiles = @("index.html", "index.modular.html", "index.allinone.html")
    foreach ($file in $htmlFiles) {
        if (Test-Path $file) {
            Write-Host "✅ $file exists" -ForegroundColor Green
            $script:testResults += @{ Service = $file; Status = "Exists"; Port = "N/A" }
        } else {
            Write-Host "❌ $file missing" -ForegroundColor Red
            $script:testResults += @{ Service = $file; Status = "Missing"; Port = "N/A" }
        }
    }
}

function Test-DockerComponents {
    Write-Host "`n🐳 Testing Docker Components..." -ForegroundColor Blue
    
    # Check if Docker is running
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker is running" -ForegroundColor Green
            
            # Check H3X containers
            $containers = docker ps --filter "name=h3x" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            if ($containers.Count -gt 1) {
                Write-Host "H3X Containers:" -ForegroundColor Cyan
                $containers | ForEach-Object { Write-Host "  $_" }
            } else {
                Write-Host "⚠️  No H3X containers running" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "❌ Docker not available: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-Configuration {
    Write-Host "`n⚙️  Testing Configuration Files..." -ForegroundColor Magenta
    
    $configFiles = @(
        "H3X-config.json",
        "package.json", 
        "docker-compose.h3x.yml",
        "docker-import-config.json"
    )
    
    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            try {
                $content = Get-Content $file -Raw | ConvertFrom-Json -ErrorAction Stop
                Write-Host "✅ $file is valid JSON" -ForegroundColor Green
                $testResults += @{ Service = $file; Status = "Valid"; Port = "N/A" }
            }
            catch {
                Write-Host "❌ $file has invalid JSON: $($_.Exception.Message)" -ForegroundColor Red
                $testResults += @{ Service = $file; Status = "Invalid JSON"; Port = "N/A" }
            }
        } else {
            Write-Host "❌ $file missing" -ForegroundColor Red
            $testResults += @{ Service = $file; Status = "Missing"; Port = "N/A" }
        }
    }
}

# Run tests based on type
switch ($TestType.ToLower()) {
    "services" { Test-H3XComponents }
    "docker" { Test-DockerComponents }
    "config" { Test-Configuration }
    "all" { 
        Test-H3XComponents
        Test-DockerComponents  
        Test-Configuration
    }
    default { 
        Write-Host "Unknown test type: $TestType" -ForegroundColor Red
        Write-Host "Valid types: services, docker, config, all" -ForegroundColor Yellow
        exit 1
    }
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$healthyCount = ($testResults | Where-Object { $_.Status -in @("Healthy", "Exists", "Valid", "Port Open") }).Count
$totalCount = $testResults.Count

Write-Host "Healthy: $healthyCount/$totalCount" -ForegroundColor $(if ($healthyCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($Verbose) {
    $testResults | Format-Table -AutoSize
}

# Return appropriate exit code
if ($healthyCount -eq $totalCount) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
    exit 1
}
