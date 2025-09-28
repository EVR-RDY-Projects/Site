# 📖 EVR:RDY Manifest Manager

The **EVR:RDY Manifest Manager** is a custom Google Docs add-on.  
It standardizes how we export files to PDF and manage the official `manifest.json`.

This allows us to provide site users with a selection of EVR:RDY documents they can read directly on the site.

---

## Installing the Add-on

Since this add-on is published privately for EVR:RDY:

1. Open any **Google Doc** in your **EVR:RDY Google Workspace account**.  
2. Go to the menu bar → **Extensions → Add-ons → Get add-ons**.  
3. In the Workspace Marketplace search bar, type:

   ```EVR:RDY Manifest Manager```

4. Select it, then click **Install**.  
5. Approve the permissions (Docs + Drive). These are required so the add-on can:  

   - Export PDFs into the shared **Site Documents** folder.  
   - Update the `manifest.json` file.  

6. Once installed, the add-on will appear under:
   - ```Extensions → EVR:RDY Manifest Manager```

⚠️ **Note:** The add-on is only available in EVR:RDY Workspace accounts.  
It will not appear in personal Gmail/Docs.

---

## What the Add-on Does

When enabled, the add-on creates a custom **EVR:RDY Manifest Manager** menu inside Google Docs:

  ```
  Extensions
    └─ EVR:RDY Manifest Manager
        ├─ Export to PDF
        └─ Manifest Actions
          ├─ Open Manifest Manager
          └─ Scan Resource Directory
  ```

### Export to PDF

- Exports the current Doc to PDF in the shared **Site Documents** folder.  
- Updates `manifest.json` with file metadata (title, created date, last edited date).  
- If it’s a new document, **Type** and **Description** are left blank.  
- The Manifest Manager sidebar will open so you can complete them.

### Manifest Actions → Open Manifest Manager

- Opens a sidebar where you can:
  - Select any document listed in the manifest.  
  - Edit its **Description**.  
  - Assign a **Type** (e.g., Charter, Policy, SOP, Report).  
  - Create a brand-new type if needed (it will be added to the master type list).  
- **Title**, **Created**, and **Last Edited** fields are read-only.

### Manifest Actions → Scan Resource Directory

- Scans the shared **Site Documents** folder:  
  - Adds new PDFs to the manifest if they aren’t listed.  
  - Flags manifest entries whose PDFs are missing, and asks if you want to remove them.  
- Shows a summary of what was added/removed.

---

## Typical Workflow

1. Draft your Doc in Google Docs.  
2. When ready, go to **EVR:RDY → Export to PDF**:  
   - The Doc is exported to PDF into **Site Documents**.  
   - A new manifest entry is created (or updated if it already exists).  
   - Sidebar opens if more metadata is required.  
3. Use the **Manifest Manager** sidebar to update Description/Type.  
4. Occasionally run **Scan Resource Directory** to ensure the manifest matches the actual files.  

---

## Why This Matters

- **Single source of truth**: `manifest.json` holds all document metadata.  
- **Website integration**: The EVR:RDY website uses this manifest to list and categorize documents.  
- **Consistency**: Ensures every exported file is tracked, categorized, and easy to find.
