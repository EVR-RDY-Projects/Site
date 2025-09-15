# Resources Directory

This directory contains markdown files that are dynamically loaded into the Resources & Documentation section of the website.

## Adding New Resources

To add a new resource:

1. **Create a new markdown file** in the `markdown/` subdirectory
2. **Add frontmatter metadata** at the top of the file:

```markdown
---
title: "Your Document Title"
description: "Brief description of the document"
type: "Document Type" (e.g., "White Paper", "Update", "Technical", "Case Study")
date: "Month YYYY" (e.g., "Jan 2025")
icon: "📄" (emoji icon for the tile)
---

# Your Document Title

Your content here...
```

3. **Update the resource list** (choose one method):

   **Method A: Automatic (Recommended)**
   - Run `./update-resources.sh` from the resources directory
   - This automatically scans for all .md files and updates `manifest.json`

   **Method B: Manual**
   - Edit `manifest.json` and add your filename to the `files` array

   **Method C: Fallback**
   - Edit `index.html` and add your filename to the `resourceFiles` array in `loadResources()`

## Supported Metadata Fields

- **title**: Display name for the resource tile
- **description**: Short description shown on the tile
- **type**: Category/type of document
- **date**: Publication or last update date
- **icon**: Emoji icon displayed on the tile

## Markdown Support

The system supports basic markdown formatting:

- Headers (# ## ###)
- **Bold text**
- *Italic text*
- Lists (- or * for unordered, 1. for ordered)
- Horizontal rules (---)

## File Naming Convention

- Use lowercase with hyphens: `my-document.md`
- Keep filenames descriptive but concise
- Avoid spaces and special characters

## Automation Tools

### Automatic Resource Discovery

The system now supports automatic resource discovery through a manifest file:

- **`manifest.json`**: Contains the list of available resources
- **`update-resources.sh`**: Script to automatically update the manifest
- **`update-manifest.js`**: Node.js script for more advanced manifest management

### Quick Start

```bash
# Add a new markdown file
echo "---
title: \"New Document\"
description: \"A new resource\"
type: \"Document\"
date: \"$(date +%b %Y)\"
icon: \"📄\"
---

# New Document
Content here..." > markdown/new-document.md

# Update the manifest automatically
cd resources
./update-resources.sh
```

## Example

```markdown
---
title: "Product Roadmap"
description: "Our 2025 product development timeline and milestones"
type: "Roadmap"
date: "Jan 2025"
icon: "🗺️"
---

# Product Roadmap 2025

## Q1 Goals
- Complete T.A.P.S. development
- Launch pilot program

## Q2 Goals
- Scale TacSOC operations
- Expand team
```
