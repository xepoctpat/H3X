# PowerShell script to fix W3C naming conventions (CORRECTED VERSION)
# This script applies sensible naming conventions without over-hyphenating

function Convert-ToSensibleKebabCase {
    param([string]$InputString)
    
    # More sensible kebab-case conversion
    $result = $InputString
    
    # Convert camelCase and PascalCase to kebab-case
    $result = $result -replace '([a-z])([A-Z])', '$1-$2'
    
    # Replace underscores and spaces with hyphens
    $result = $result -replace '[_\s]+', '-'
    
    # Convert to lowercase
    $result = $result.ToLower()
    
    # Clean up multiple hyphens
    $result = $result -replace '-+', '-'
    
    # Remove leading/trailing hyphens
    $result = $result -replace '^-+|-+$', ''
    
    return $result
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

Write-Host "🔧 Fixing over-aggressive kebab-case conversions..." -ForegroundColor Cyan
Write-Host ""

# First, let's revert the badly named files back to something sensible
$badRenames = @{
    'a-zu-re-m365-b-ot-r-eq-ui-re-me-nt-s.md' = 'azure-m365-bot-requirements.md'
    'd-ep-lo-ym-en-t-o-pt-io-ns.-m-d.backup-2025-05-28T19-24-42' = 'deployment-options.md.backup-2025-05-28T19-24-42'
    'h3-x-c-le-an-up-s-um-ma-ry-2025-05-28-t19-24-42.md' = 'h3x-cleanup-summary-2025-05-28T19-24-42.md'
    'm365-a-ge-nt-s-u-sa-bi-li-ty-a-na-ly-si-s.md' = 'm365-agents-usability-analysis.md'
    'm365-a-i-c-om-pa-ti-bi-li-ty-r-ep-or-t.md' = 'm365-ai-compatibility-report.md'
    'm365-a-ge-nt-s.yml' = 'm365agents.yml'
    'p-ro-je-ct-c-he-ck-po-in-t-u-pl-oa-d-2025-01-25.md' = 'project-checkpoint-upload-2025-01-25.md'
    'r-ea-dm-e.-m-d.backup-2025-05-28T19-24-42' = 'readme.md.backup-2025-05-28T19-24-42'
    's-ta-nd-al-on-e-g-ui-de.-m-d.backup-2025-05-28T19-24-42' = 'standalone-guide.md.backup-2025-05-28T19-24-42'
    's-ys-te-m-c-he-ck-po-in-t-2025-05-28.md' = 'system-checkpoint-2025-05-28.md'
}

Write-Host "🔄 Reverting over-aggressive renames..." -ForegroundColor Yellow
foreach ($badName in $badRenames.Keys) {
    $goodName = $badRenames[$badName]
    if (Test-Path $badName) {
        Rename-ItemSafely $badName $goodName
    }
}

# Revert bad renames in src folder
if (Test-Path "src") {
    Set-Location "src"
    if (Test-Path "a-ge-nt.js") { Rename-ItemSafely "a-ge-nt.js" "agent.js" }
    if (Test-Path "i-nd-ex.js") { Rename-ItemSafely "i-nd-ex.js" "index.js" }
    Set-Location ".."
}

# Revert bad renames in scripts folder
if (Test-Path "scripts") {
    Set-Location "scripts"
    if (Test-Path "d-oc-ke-rf-il-e.response-processor") { 
        Rename-ItemSafely "d-oc-ke-rf-il-e.response-processor" "dockerfile.response-processor" 
    }
    Set-Location ".."
}

Write-Host "`n🎯 Applying sensible W3C naming conventions..." -ForegroundColor Green

# Keep root folders in normal case (they were fine as they were)
# Only fix specific files that actually need kebab-case

# Files that should definitely be kebab-case
$specificRenames = @{
    'FINAL-COMPLETION-SUMMARY.md' = 'final-completion-summary.md'
    'LM-STUDIO-SUCCESS-REPORT.md' = 'lm-studio-success-report.md'
    'PULL_REQUEST_AUTOGEN.md' = 'pull-request-autogen.md'
    'SEMIOTIC-COMPLETE-APPLICATION-REPORT.md' = 'semiotic-complete-application-report.md'
    'SEMIOTIC-IMPLEMENTATION-SUMMARY.md' = 'semiotic-implementation-summary.md'
    'SEMIOTIC-NAMING-STANDARDS.md' = 'semiotic-naming-standards.md'
    'SEMIOTIC-VALIDATION-REPORT.md' = 'semiotic-validation-report.md'
}

foreach ($oldName in $specificRenames.Keys) {
    $newName = $specificRenames[$oldName]
    if (Test-Path $oldName) {
        Rename-ItemSafely $oldName $newName
    }
}

Write-Host "`n✨ Sensible naming conventions applied!" -ForegroundColor Green
Write-Host "📁 Root folders remain in normal case for better organization" -ForegroundColor Cyan
Write-Host "📄 Files use appropriate kebab-case where it makes sense" -ForegroundColor Cyan
