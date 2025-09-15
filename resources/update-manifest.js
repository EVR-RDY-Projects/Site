#!/usr/bin/env node

/**
 * Resource Manifest Updater
 *
 * This script automatically updates the manifest.json file with all .md files
 * found in the markdown directory.
 *
 * Usage:
 *   node update-manifest.js
 *
 * Or add to package.json scripts:
 *   "update-resources": "node resources/update-manifest.js"
 */

const fs = require("fs");
const path = require("path");

const markdownDir = path.join(__dirname, "markdown");
const manifestPath = path.join(__dirname, "manifest.json");

function updateManifest() {
	try {
		// Read all .md files from the markdown directory
		const files = fs
			.readdirSync(markdownDir)
			.filter((file) => file.endsWith(".md"))
			.map((file) => file.replace(".md", ""))
			.sort(); // Sort alphabetically

		// Create manifest object
		const manifest = {
			files: files,
			lastUpdated: new Date().toISOString().split("T")[0],
			description: "List of available markdown resources",
			count: files.length,
		};

		// Write manifest file
		fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

		console.log(`✅ Updated manifest.json with ${files.length} resources:`);
		files.forEach((file) => console.log(`   - ${file}.md`));
		console.log(`📅 Last updated: ${manifest.lastUpdated}`);
	} catch (error) {
		console.error("❌ Error updating manifest:", error.message);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	updateManifest();
}

module.exports = { updateManifest };
