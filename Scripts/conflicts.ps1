Write-Host "Searching for merge conflicts in project files..." -ForegroundColor Cyan

$conflictMarkers = @("<<<<<<<", "=======", ">>>>>>>")
$foundConflicts = $false

Get-ChildItem -Path . -Include "*.json","*.ts","*.js","*.yml","*.yaml" -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|archive|dist|build|\.git" } | 
    ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            foreach ($marker in $conflictMarkers) {
                if ($content -match [regex]::Escape($marker)) {
                    if (-not $foundConflicts) {
                        Write-Host "`nFiles with merge conflicts:" -ForegroundColor Red
                        $foundConflicts = $true
                    }
                    Write-Host "  $($file.FullName)" -ForegroundColor Yellow
                    
                    # Show line numbers with conflicts
                    $lines = $content -split "`n"
                    for ($i = 0; $i -lt $lines.Count; $i++) {
                        if ($lines[$i] -match [regex]::Escape($marker)) {
                            Write-Host "    Line $($i + 1): $($lines[$i].Trim())" -ForegroundColor Red
                        }
                    }
                    break
                }
            }
        }
    }

if (-not $foundConflicts) {
    Write-Host "`nNo merge conflicts found in project files!" -ForegroundColor Green
} else {
    Write-Host "`nRun this script again after fixing conflicts to verify." -ForegroundColor Cyan
}