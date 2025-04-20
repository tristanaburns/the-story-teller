#!/bin/bash
# Create a new devlog entry
# Usage: ./scripts/create-devlog-entry.sh feature "My New Feature"

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <category> \"<title>\""
    echo "Categories: feature, fix, refactor, docs, test, perf, devops, security, database, ui, api, dependency"
    exit 1
fi

# Validate category
category="$1"
valid_categories=("feature" "fix" "refactor" "docs" "test" "perf" "devops" "security" "database" "ui" "api" "dependency")
valid_category=false

for valid in "${valid_categories[@]}"; do
    if [ "$category" = "$valid" ]; then
        valid_category=true
        break
    fi
done

if [ "$valid_category" = false ]; then
    echo "Error: Invalid category '$category'"
    echo "Valid categories: ${valid_categories[*]}"
    exit 1
fi

# Format title
title="$2"
file_title=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-z0-9]/-/g' -e 's/--*/-/g' -e 's/^-//' -e 's/-$//')

# Get current timestamp
timestamp=$(date +"%Y-%m-%d-%H-%M")
human_date=$(date +"%Y-%m-%d %H:%M")

# Prepare the filename and path
filename="${timestamp}-${category}-${file_title}.md"
path="project/devlogs/${filename}"

# Format title for display (capitalize words)
display_title=$(echo "$title" | sed -e 's/\<./\U&/g')

# Create file with template
cat > "$path" << EOF
# [$category] $display_title

**Date:** $human_date
**Author:** ${USER:-"Your Name"}

## Changes Made
- 

## Decisions
- 

## Challenges
- 

## Next Steps
- 
EOF

echo "Created new DEVLOG entry: $path"

# Update index
index_path="project/DEVLOG_INDEX.md"
entry_line="| $human_date | $category | [$display_title](./devlogs/$filename) | ${USER:-"Your Name"} |"

# Find the table section and add the new entry after the header row
awk -v entry="$entry_line" '
  /\| Date \| Category \| Title \| Author \|/ { 
    print $0; 
    getline; 
    print $0; 
    print entry; 
    next; 
  } 
  { print $0 }
' "$index_path" > "${index_path}.tmp" && mv "${index_path}.tmp" "$index_path"

echo "Updated index: $index_path"

# Make script executable
chmod +x "$0"
