# PowerShell script to fix W3C naming conventions
# This script renames all files and folders to kebab-case

function Convert-ToKebabCase {
    param([string]$InputString)
    
    return $InputString `
        -replace '([a-z])([A-Z])', '$1-$2' `
        -replace '[_\s]+', '-' `
        -replace '([A-Z]+)', '-$1' `
        -replace '--+', '-' `
        -replace '^-+|-+$', '' `
        | ForEach-Object { $_.ToLower() }
}

function Rename-ItemSafely {
    param(
        [string]$OldPath,
        [string]$NewName
    )
    
    $directory = Split-Path $OldPath -Parent
    $newPath = Join-Path $directory $NewName
    
    if (Test-Path $OldPath) {
        if (-not (Test-Path $newPath)) {
            try {
                Rename-Item $OldPath $NewName -Force
                Write-Host "✅ Renamed: $(Split-Path $OldPath -Leaf) → $NewName" -ForegroundColor Green
                return $true
            }
            catch {
                Write-Host "❌ Error renaming $(Split-Path $OldPath -Leaf): $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        }
        else {
            Write-Host "⚠️  Target already exists: $NewName" -ForegroundColor Yellow
            return $false
        }
    }
    else {
        Write-Host "⚠️  Source not found: $(Split-Path $OldPath -Leaf)" -ForegroundColor Yellow
        return $false
    }
}

Set-Location "g:\CopilotAgents\H3X"

Write-Host "🚀 Starting W3C naming convention fixes with PowerShell..." -ForegroundColor Cyan
Write-Host ""

# Define files and folders that should preserve their original names
$preserveFiles = @(
    'README.md', 'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md',
    'SECURITY.md', 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    '.gitignore', '.dockerignore', '.env', '.env.example', 'Web.config', 'web.config',
    'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'tsconfig.json', 'jsconfig.json', 'eslint.config.js', '.eslintrc.js', '.eslintrc.json',
    'prettier.config.js', '.prettierrc', 'vite.config.js', 'webpack.config.js',
    'rollup.config.js', 'jest.config.js', 'vitest.config.js'
)

$preserveFolders = @(
    'node_modules', 'Node_Modules', '.git', '.vscode', '.vs', 'bin', 'obj',
    'dist', 'build', 'coverage', '.nyc_output', 'tmp', 'temp'
)

# First, rename folders
Write-Host "📁 Renaming folders..." -ForegroundColor Yellow
$folders = Get-ChildItem -Directory | Where-Object { 
    $_.Name -notmatch '^\..*' -and 
    $_.Name -notin $preserveFolders -and
    $_.Name -cmatch '[A-Z]'
}

foreach ($folder in $folders) {
    $newName = Convert-ToKebabCase $folder.Name
    if ($newName -ne $folder.Name) {
        Rename-ItemSafely $folder.FullName $newName
    }
}

# Then rename files
Write-Host "`n📄 Renaming files..." -ForegroundColor Yellow
$files = Get-ChildItem -File | Where-Object { 
    $_.Name -notmatch '^\..*' -and 
    $_.Name -notin $preserveFiles -and
    $_.Name -cmatch '[A-Z]'
}

foreach ($file in $files) {
    $extension = $file.Extension
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    
    # Handle special cases for documentation files
    if ($file.Name -match '^[A-Z][A-Z_-]*\.(md|txt)$') {
        continue  # Keep uppercase documentation files as-is
    }
    
    $newNameWithoutExt = Convert-ToKebabCase $nameWithoutExt
    $newName = $newNameWithoutExt + $extension
    
    if ($newName -ne $file.Name) {
        Rename-ItemSafely $file.FullName $newName
    }
}

# Process subdirectories
Write-Host "`n📁 Processing subdirectories..." -ForegroundColor Yellow

# Public folder
if (Test-Path "public") {
    Set-Location "public"
    
    $subFolders = Get-ChildItem -Directory | Where-Object { $_.Name -cmatch '[A-Z]' }
    foreach ($folder in $subFolders) {
        $newName = Convert-ToKebabCase $folder.Name
        if ($newName -ne $folder.Name) {
            Rename-ItemSafely $folder.FullName $newName
        }
    }
    
    $subFiles = Get-ChildItem -File | Where-Object { $_.Name -cmatch '[A-Z]' }
    foreach ($file in $subFiles) {
        $extension = $file.Extension
        $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $newNameWithoutExt = Convert-ToKebabCase $nameWithoutExt
        $newName = $newNameWithoutExt + $extension
        
        if ($newName -ne $file.Name) {
            Rename-ItemSafely $file.FullName $newName
        }
    }
    
    Set-Location ".."
}

# Src folder
if (Test-Path "src") {
    Set-Location "src"
    
    $subFolders = Get-ChildItem -Directory | Where-Object { $_.Name -cmatch '[A-Z]' }
    foreach ($folder in $subFolders) {
        $newName = Convert-ToKebabCase $folder.Name
        if ($newName -ne $folder.Name) {
            Rename-ItemSafely $folder.FullName $newName
        }
    }
    
    $subFiles = Get-ChildItem -File | Where-Object { $_.Name -cmatch '[A-Z]' }
    foreach ($file in $subFiles) {
        $extension = $file.Extension
        $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $newNameWithoutExt = Convert-ToKebabCase $nameWithoutExt
        $newName = $newNameWithoutExt + $extension
        
        if ($newName -ne $file.Name) {
            Rename-ItemSafely $file.FullName $newName
        }
    }
    
    Set-Location ".."
}

# Scripts folder
if (Test-Path "scripts") {
    Set-Location "scripts"
    
    $subFiles = Get-ChildItem -File | Where-Object { $_.Name -cmatch '[A-Z]' }
    foreach ($file in $subFiles) {
        $extension = $file.Extension
        $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $newNameWithoutExt = Convert-ToKebabCase $nameWithoutExt
        $newName = $newNameWithoutExt + $extension
        
        if ($newName -ne $file.Name) {
            Rename-ItemSafely $file.FullName $newName
        }
    }
    
    Set-Location ".."
}

Write-Host "`n🎉 W3C naming convention fixes completed!" -ForegroundColor Green

# Final check
Write-Host "`n📊 Remaining files/folders with uppercase letters:" -ForegroundColor Yellow
$remaining = Get-ChildItem -Recurse | Where-Object { 
    $_.Name -cmatch '[A-Z]' -and 
    -not $_.Name.StartsWith('.') -and
    $_.Name -notin $preserveFiles -and
    $_.Name -notin $preserveFolders -and
    $_.FullName -notmatch '\\(node_modules|Node_Modules|\\.git)\\' -and
    -not ($_.Name -match '^[A-Z][A-Z_-]*\.(md|txt)$')
} | Select-Object Name, FullName -First 20

if ($remaining.Count -gt 0) {
    $remaining | Format-Table -AutoSize
    Write-Host "Note: Some files may be intentionally preserved (documentation, config files, etc.)" -ForegroundColor Cyan
} else {
    Write-Host "✨ All applicable files and folders now follow W3C naming conventions!" -ForegroundColor Green
}
