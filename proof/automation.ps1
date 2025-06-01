# fLups Proof Automation: Windows PowerShell Example

# This script automates concatenation of all flups-*.md files in the proof folder into a single file.
# Save as proof/automation.ps1 and run in PowerShell: ./automation.ps1

$proofDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputFile = Join-Path $proofDir 'flups-proof-all.md'

# Get all relevant proof files
$proofFiles = Get-ChildItem -Path $proofDir -Filter 'flups-*.md' | Sort-Object Name

# Start output
"# fLups Proofs: All Parts`n" | Out-File -Encoding utf8 $outputFile

foreach ($file in $proofFiles) {
    "---`n`n## $($file.Name)`n" | Out-File -Encoding utf8 -Append $outputFile
    Get-Content $file.FullName | Out-File -Encoding utf8 -Append $outputFile
    "`n" | Out-File -Encoding utf8 -Append $outputFile
}

Write-Host "All proof parts concatenated to $outputFile"

# Optional: PDF export (requires Pandoc)
# pandoc $outputFile -o ($outputFile -replace '.md$', '.pdf')
# Write-Host "PDF export complete."
