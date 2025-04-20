# Create a new devlog entry
# Usage: .\scripts\create-devlog-entry.ps1 -category "feature" -title "my-new-feature"

param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("feature", "fix", "refactor", "docs", "test", "perf", "devops", "security", "database", "ui", "api", "dependency")]
    [string]$category,
    
    [Parameter(Mandatory=$true)]
    [string]$title
)

# Format title for filename
$fileTitle = $title.ToLower() -replace '\s+', '-' -replace '[^a-z0-9\-]', ''

# Get current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm"
$humanDate = Get-Date -Format "yyyy-MM-dd HH:mm"

# Prepare the filename and path
$filename = "$timestamp-$category-$fileTitle.md"
$path = "project/devlogs/$filename"

# Format title for display (capitalize words)
$displayTitle = (Get-Culture).TextInfo.ToTitleCase($title.ToLower())

# Create file with template
@"
# [$category] $displayTitle

**Date:** $humanDate
**Author:** $(if ($env:USERNAME) { $env:USERNAME } else { "Your Name" })

## Changes Made
- 

## Decisions
- 

## Challenges
- 

## Next Steps
- 
"@ | Out-File -FilePath $path -Encoding utf8

Write-Host "Created new DEVLOG entry: $path"

# Update index
$indexPath = "project/DEVLOG_INDEX.md"
$indexContent = Get-Content -Path $indexPath -Raw
$entryLine = "| $humanDate | $category | [$displayTitle](./devlogs/$filename) | $(if ($env:USERNAME) { $env:USERNAME } else { "Your Name" }) |"

# Find the table section and add the new entry after the header row
$newIndexContent = $indexContent -replace "\| Date \| Category \| Title \| Author \|\r?\n\|---+\|---+\|---+\|---+\|(\r?\n)", "| Date | Category | Title | Author |`n|------|----------|-------|--------| `n$entryLine`n"

Set-Content -Path $indexPath -Value $newIndexContent

Write-Host "Updated index: $indexPath"
