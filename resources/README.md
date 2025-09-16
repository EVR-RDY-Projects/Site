# Resources Directory

This directory contains markdown files that are dynamically loaded into the Resources & Documentation section of the website. The system automatically fetches and displays these resources using GitHub's raw content service.

## How It Works

The dynamic resource loading system:

1. **Fetches** the `manifest.json` file to get the list of available resources
2. **Loads** each markdown file from GitHub's raw content service
3. **Parses** frontmatter metadata to create resource tiles
4. **Displays** tiles in the Resources section with proper formatting

## Adding New Resources

### Step 1: Create the Markdown File

Create a new markdown file in the `markdown/` subdirectory with the following structure:

```markdown
---
title: "Your Document Title"
description: "Brief description of the document"
type: "Document Type"
date: "Month YYYY"
icon: "📄"
---

# Your Document Title

Your content here...
```

### Step 2: Update the Manifest

**Method A: Automatic (Recommended)**

```bash
cd resources
./update-resources.sh
```

**Method B: Manual**
Edit `manifest.json` and add your filename to the `files` array:

```json
{
  "files": ["sample-whitepaper", "ghost-node-whitepaper", "your-new-document"],
  "lastUpdated": "2025-01-15",
  "description": "List of available markdown resources",
  "count": 3
}
```

### Step 3: Commit and Push

```bash
git add resources/markdown/your-new-document.md resources/manifest.json
git commit -m "Add new resource: your-new-document"
git push
```

The resource will automatically appear on the website after the changes are pushed to GitHub!

## Adding Resources via GitHub Web Interface

You can also add new resources directly through the GitHub website without using local tools:

### Method 1: Create New File via GitHub

1. **Navigate to the repository** on GitHub: `https://github.com/EVR-RDY/Site`

2. **Go to the markdown directory**:
   - Click on `resources/` folder
   - Click on `markdown/` folder

3. **Create a new file**:
   - Click the "Add file" button → "Create new file"
   - Name the file: `your-document-name.md`

4. **Add the content** with proper frontmatter:

   ```markdown
   ---
   title: "Your Document Title"
   description: "Brief description of the document"
   type: "Document Type"
   date: "Jan 2025"
   icon: "📄"
   ---

   # Your Document Title

   Your content here...
   ```

5. **Commit the file**:
   - Scroll down to "Commit changes"
   - Add commit message: "Add new resource: your-document-name"
   - Click "Commit changes"

6. **Update the manifest**:
   - Navigate to `resources/manifest.json`
   - Click the pencil icon to edit
   - Add your filename to the `files` array
   - Update the `count` number
   - Commit the changes

### Method 2: Upload Existing File

1. **Navigate to the markdown directory** on GitHub

2. **Upload your file**:
   - Click "Add file" → "Upload files"
   - Drag and drop your `.md` file or click "choose your files"
   - Ensure the file has proper frontmatter

3. **Commit the upload**:
   - Add commit message: "Add new resource: filename"
   - Click "Commit changes"

4. **Update the manifest** (same as Method 1, step 6)

### Method 3: Edit Existing File

1. **Navigate to an existing markdown file** in the `markdown/` directory

2. **Click the pencil icon** to edit

3. **Make your changes** and commit:
   - Add commit message describing your changes
   - Click "Commit changes"

### GitHub Web Interface Benefits

- **No local setup required** - works from any computer with internet
- **Immediate preview** - see your markdown rendered on GitHub
- **Version control** - all changes are tracked automatically
- **Collaboration** - multiple people can add resources easily
- **Mobile friendly** - can add resources from mobile devices

### Important Notes for GitHub Web Interface

- **Frontmatter is required** - files without proper frontmatter won't display
- **File naming matters** - use lowercase with hyphens
- **Manifest must be updated** - don't forget to update `manifest.json`
- **Branch awareness** - ensure you're editing the correct branch (`feature/ui`)

## Required Frontmatter Fields

All markdown files **must** include these frontmatter fields:

- **title**: Display name for the resource tile
- **description**: Short description shown on the tile  
- **type**: Category/type of document (e.g., "White Paper", "Technical", "Update")
- **date**: Publication or last update date (e.g., "Jan 2025")
- **icon**: Emoji icon displayed on the tile (e.g., "📄", "🔒", "📊")

## Markdown Formatting Support

The system supports standard markdown formatting:

- **Headers**: `# ## ### ####`
- **Bold text**: `**bold**` or `__bold__`
- **Italic text**: `*italic*` or `_italic_`
- **Lists**:
  - Unordered: `- item` or `* item`
  - Ordered: `1. item`
- **Horizontal rules**: `---`
- **Line breaks**: Double space + enter or `\n\n`

## File Naming Convention

- Use lowercase with hyphens: `my-document.md`
- Keep filenames descriptive but concise
- Avoid spaces and special characters
- Examples: `cybersecurity-framework.md`, `ghost-node-whitepaper.md`

## Technical Details

### How Resources Are Loaded

1. **Manifest Fetch**: `https://raw.githubusercontent.com/EVR-RDY/Site/refs/heads/feature/ui/resources/manifest.json`
2. **Markdown Fetch**: `https://raw.githubusercontent.com/EVR-RDY/Site/refs/heads/feature/ui/resources/markdown/{filename}.md`
3. **Frontmatter Parsing**: Extracts metadata from YAML frontmatter
4. **Tile Creation**: Generates HTML tiles with metadata
5. **Modal Display**: Shows full content when clicked

### Automation Tools

- **`manifest.json`**: Contains the list of available resources
- **`update-resources.sh`**: Script to automatically update the manifest
- **`update-manifest.js`**: Node.js script for advanced manifest management

## Complete Example

Here's a complete example of a new resource file:

```markdown
---
title: "Product Roadmap 2025"
description: "Our comprehensive product development timeline and strategic milestones"
type: "Roadmap"
date: "Jan 2025"
icon: "🗺️"
---

# Product Roadmap 2025

## Executive Summary

This document outlines our strategic product development timeline for 2025, focusing on key milestones and deliverables.

## Q1 Goals

- **Complete T.A.P.S. Development**
  - Finalize SEER Sensor integration
  - Complete GHOST Node testing
  - Deploy RAMPART architecture

- **Launch Pilot Program**
  - Select 3 pilot customers
  - Deploy initial installations
  - Gather feedback and metrics

## Q2 Goals

- **Scale TacSOC Operations**
  - Expand team to 15 analysts
  - Implement AI triage system
  - Launch 24/7 monitoring

- **Market Expansion**
  - Target critical infrastructure sectors
  - Develop partner ecosystem
  - Increase market presence

## Success Metrics

- **Customer Acquisition**: 25+ new customers by Q4
- **Revenue Growth**: 300% increase over 2024
- **Team Expansion**: 50+ employees by year-end

---

*For questions about this roadmap, contact our product team at product@evr-rdy.com*
```

## Troubleshooting

### Resource Not Appearing

1. **Check frontmatter**: Ensure all required fields are present
2. **Verify manifest**: Confirm filename is in `manifest.json`
3. **Check console**: Look for fetch errors in browser console
4. **Validate markdown**: Ensure proper YAML frontmatter format

### Common Issues

- **Missing frontmatter**: Resources without proper frontmatter won't display
- **Invalid JSON**: Malformed `manifest.json` will cause loading failures
- **File not committed**: Resources must be committed and pushed to GitHub
- **Wrong branch**: Ensure files are on the correct branch (`feature/ui`)

## Quick Reference

### Adding Resources - Choose Your Method

| Method | Best For | Requirements |
|--------|----------|--------------|
| **Local Git** | Developers, frequent updates | Git installed, local repository |
| **GitHub Web** | Non-developers, occasional updates | GitHub account, web browser |
| **Upload via GitHub** | Existing documents | GitHub account, file ready |

### Essential Checklist

- [ ] Markdown file created in `resources/markdown/`
- [ ] Frontmatter includes all required fields
- [ ] Filename uses lowercase with hyphens
- [ ] `manifest.json` updated with new filename
- [ ] Changes committed and pushed to GitHub
- [ ] Resource appears on website

### Quick Links

- **Repository**: <https://github.com/EVR-RDY/Site>
- **Markdown Directory**: <https://github.com/EVR-RDY/Site/tree/feature/ui/resources/markdown>
- **Manifest File**: <https://github.com/EVR-RDY/Site/blob/feature/ui/resources/manifest.json>
- **Live Site**: <https://evrrdy.com>
