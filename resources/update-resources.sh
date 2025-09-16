#!/bin/bash

# Resource Manifest Updater Script
# Automatically updates the manifest.json file with all .md files

echo "🔄 Updating resource manifest..."

# Check if Node.js is available
if command -v node &> /dev/null; then
    node update-manifest.js
else
    echo "❌ Node.js not found. Using fallback method..."
    
    # Fallback: simple bash script to update manifest
    cd "$(dirname "$0")"
    
    # Get all .md files (without extension)
    files=$(ls markdown/*.md 2>/dev/null | sed 's/markdown\///g' | sed 's/\.md$//g' | sort)
    
    if [ -z "$files" ]; then
        echo "❌ No markdown files found in markdown/ directory"
        exit 1
    fi
    
    # Create JSON array
    json_files="["
    first=true
    for file in $files; do
        if [ "$first" = true ]; then
            json_files="$json_files\"$file\""
            first=false
        else
            json_files="$json_files, \"$file\""
        fi
    done
    json_files="$json_files]"
    
    # Create manifest
    cat > manifest.json << EOF
{
  "files": $json_files,
  "lastUpdated": "$(date +%Y-%m-%d)",
  "description": "List of available markdown resources",
  "count": $(echo "$files" | wc -l)
}
EOF
    
    echo "✅ Updated manifest.json with $(echo "$files" | wc -l) resources"
    echo "$files" | sed 's/^/   - /'
fi

echo "🎉 Resource manifest updated successfully!"
