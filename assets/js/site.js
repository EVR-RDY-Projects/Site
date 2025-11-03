(function () {
	"use strict";

	// ===== Resources configuration (Google Drive) =====
	// Provide a public Drive FOLDER URL containing manifest.json and a readonly API key
	// Example: https://drive.google.com/drive/folders/1MTD10gAxWg_DXd02A9Sa76YNVMZfCCkO
	const DRIVE_FOLDER_URL =
		"https://drive.google.com/drive/folders/1A1KgRijSWJ6n2aebcU9PLUNYwIFX2Z7L?usp=sharing";
	const DRIVE_API_KEY = "AIzaSyAddfzyxbHim8oV10AmZNgXFTjSrcfbWLo";

	// Simple in-memory cache and prefetch helper
	let DRIVE_DOCS_CACHE = null;
	let DRIVE_DOCS_PROMISE = null;
	function prefetchDriveResources() {
		if (!DRIVE_DOCS_PROMISE) {
			DRIVE_DOCS_PROMISE = getDriveManifestDocuments()
				.then((docs) => {
					DRIVE_DOCS_CACHE = docs || [];
					return DRIVE_DOCS_CACHE;
				})
				.catch(() => {
					DRIVE_DOCS_CACHE = [];
					return DRIVE_DOCS_CACHE;
				});
		}
		return DRIVE_DOCS_PROMISE;
	}

	// Product Details Toggle Function (Accordion behavior)
	function toggleProductDetails(detailsId) {
		const details = document.getElementById(detailsId);
		const button = event.target;

		const allDetails = document.querySelectorAll(".product-details");
		const allButtons = document.querySelectorAll(".learn-more-btn");

		if (details.style.display === "block") {
			details.style.display = "none";
			if (button && button.dataset && button.dataset.originalText) {
				button.textContent = button.dataset.originalText;
			} else {
				button.textContent = button.textContent.replace(
					"Show Less",
					"Learn More"
				);
			}
		} else {
			allDetails.forEach((section) => {
				section.style.display = "none";
			});
			allButtons.forEach((btn) => {
				if (btn && btn.dataset && btn.dataset.originalText) {
					btn.textContent = btn.dataset.originalText;
				} else {
					btn.textContent = btn.textContent.replace("Show Less", "Learn More");
				}
			});
			details.style.display = "block";
			button.textContent = button.textContent.replace(
				"Learn More",
				"Show Less"
			);
		}
	}

	function resetAllProductExpansions() {
		const allDetails = document.querySelectorAll(".product-details");
		const allButtons = document.querySelectorAll(".learn-more-btn");
		allDetails.forEach((section) => {
			section.style.display = "none";
		});
		allButtons.forEach((btn) => {
			if (btn && btn.dataset && btn.dataset.originalText) {
				btn.textContent = btn.dataset.originalText;
			} else if (btn.textContent.includes("Show Less")) {
				btn.textContent = btn.textContent.replace("Show Less", "Learn More");
			}
		});
	}

	// Helper function to convert GitHub Pages URL to raw GitHub URL
	function getRawGitHubUrl(path) {
		console.log(`🌐 Current hostname: ${window.location.hostname}`);
		if (window.location.hostname === "evrrdy.com") {
			return `https://raw.githubusercontent.com/EVR-RDY/Site/main${path}`;
		}
		if (
			window.location.hostname === "127.0.0.1" ||
			window.location.hostname === "localhost" ||
			window.location.hostname.startsWith("192.168.") ||
			window.location.hostname.startsWith("10.") ||
			window.location.hostname.endsWith(".local")
		) {
			const localUrl = window.location.origin + path;
			console.log(`🏠 Using local development URL: ${localUrl}`);
			return localUrl;
		}
		const baseUrl =
			window.location.origin +
			window.location.pathname.replace("index.html", "");
		const parts = baseUrl.replace("https://", "").split("/");
		const username = parts[0].replace(".github.io", "");
		const repo = parts[1] || "";
		return `https://raw.githubusercontent.com/${username}/${repo}/main${path}`;
	}

	// Dynamic Resources Loading (prefers Drive manifest when configured)
	async function loadResources() {
		const resourcesContainer = document.getElementById("resources-grid");
		if (!resourcesContainer) {
			console.log("Resources container not found");
			return;
		}

		try {
			console.log("Starting loadResources()");
			resourcesContainer.innerHTML = "<p>Loading resources…</p>";

			// Add timeout to prevent hanging forever
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(
					() => reject(new Error("Resource loading timeout after 30 seconds")),
					30000
				);
			});

			const loadPromise = (async () => {
				let driveDocs = DRIVE_DOCS_CACHE;
				console.log("Initial cache check:", driveDocs);
				if (!driveDocs) {
					console.log("Cache empty, waiting for promise or prefetching...");
					if (DRIVE_DOCS_PROMISE) {
						console.log("Waiting for existing promise...");
						try {
							await DRIVE_DOCS_PROMISE;
							driveDocs = DRIVE_DOCS_CACHE;
							console.log("Promise resolved, cache now:", driveDocs);
						} catch (error) {
							console.error("Promise rejected:", error);
							driveDocs = null;
						}
					} else {
						console.log("No promise, calling prefetchDriveResources()...");
						try {
							await prefetchDriveResources();
							driveDocs = DRIVE_DOCS_CACHE;
							console.log("Prefetch completed, cache now:", driveDocs);
						} catch (error) {
							console.error("Prefetch failed:", error);
							driveDocs = null;
						}
					}
				}
				console.log("Drive docs loaded:", driveDocs?.length || 0);
				console.log("Drive docs data:", driveDocs);
				console.log("driveDocs type:", typeof driveDocs);
				console.log("Is driveDocs array?", Array.isArray(driveDocs));
				return driveDocs;
			})();

			let driveDocs = await Promise.race([loadPromise, timeoutPromise]);

			// Check if driveDocs is actually the full manifest object instead of just documents array
			if (driveDocs && !Array.isArray(driveDocs) && driveDocs.documents) {
				console.log(
					"driveDocs is full manifest object, extracting documents array"
				);
				driveDocs = driveDocs.documents;
				console.log("After extraction, driveDocs:", driveDocs);
				console.log("Is now array?", Array.isArray(driveDocs));
			}

			// If Drive failed, try loading from repository
			if (!driveDocs || !Array.isArray(driveDocs) || driveDocs.length === 0) {
				console.log("Drive failed or empty, trying repository fallback...");
				console.log("driveDocs value:", driveDocs);
				console.log("Is array?", Array.isArray(driveDocs));
				if (driveDocs && !Array.isArray(driveDocs)) {
					console.log(
						"driveDocs is not an array:",
						typeof driveDocs,
						driveDocs
					);
				}
				const files = await getResourceManifest();
				if (files && files.length) {
					console.log("Loading", files.length, "files from repository");
					resourcesContainer.innerHTML = "";
					for (const fileName of files) {
						try {
							const rawUrl = getRawGitHubUrl(
								`/resources/markdown/${fileName}.md`
							);
							const response = await fetch(rawUrl);
							if (!response.ok) continue;
							const markdownContent = await response.text();
							const resource = parseMarkdownMetadata(markdownContent, fileName);
							if (resource) {
								const tile = createResourceTile(resource);
								resourcesContainer.appendChild(tile);
							}
						} catch (error) {
							console.error("Failed to load", fileName, ":", error);
						}
					}
					return;
				}
			}

			if (driveDocs && Array.isArray(driveDocs) && driveDocs.length > 0) {
				console.log("Rendering", driveDocs.length, "Drive documents");
				console.log("Documents data:", driveDocs);
				resourcesContainer.innerHTML = "";
				let tilesCreated = 0;
				driveDocs.forEach((doc, index) => {
					try {
						console.log(
							`Creating tile ${index + 1}/${driveDocs.length} for document:`,
							doc
						);
						const tile = createDriveResourceTile(doc);
						if (tile) {
							resourcesContainer.appendChild(tile);
							tilesCreated++;
							console.log(
								`Tile ${index + 1} created and appended successfully`
							);
						} else {
							console.error(`Tile ${index + 1} was null or undefined`);
						}
					} catch (error) {
						console.error(
							`Error creating tile for document ${index + 1}:`,
							error
						);
						console.error("Document data:", doc);
					}
				});
				console.log(
					`Resources grid now has ${tilesCreated} tiles (expected ${driveDocs.length})`
				);
				if (tilesCreated === 0 && driveDocs.length > 0) {
					console.error("No tiles were created even though documents exist!");
					const errorMsg = document.createElement("p");
					errorMsg.textContent =
						"Failed to render resources. Check console for errors.";
					errorMsg.style.color = "var(--bright)";
					resourcesContainer.appendChild(errorMsg);
				}
			} else {
				console.log("No resources to display. driveDocs:", driveDocs);
				console.log("driveDocs is:", typeof driveDocs, driveDocs);
				const empty = document.createElement("p");
				empty.textContent = "No resources available.";
				resourcesContainer.innerHTML = "";
				resourcesContainer.appendChild(empty);
			}
		} catch (error) {
			console.error("Failed to load resources:", error);
			console.error("Error stack:", error.stack);
			const resourcesContainer = document.getElementById("resources-grid");
			if (resourcesContainer) {
				resourcesContainer.innerHTML = `<p style="color: var(--bright);">Failed to load resources. Error: ${
					error.message || error
				}. Check console for details.</p>`;
			}
		} finally {
			// Ensure we always update the UI, even if there was an error
			const resourcesContainer = document.getElementById("resources-grid");
			if (
				resourcesContainer &&
				resourcesContainer.innerHTML === "<p>Loading resources…</p>"
			) {
				console.warn(
					"loadResources completed but UI still shows loading. This indicates a logic error."
				);
				resourcesContainer.innerHTML =
					"<p style='color: var(--bright);'>No resources were loaded. Check console for errors.</p>";
			}
		}
	}

	async function getResourceManifest() {
		try {
			const rawUrl = getRawGitHubUrl("/resources/manifest.json");
			const response = await fetch(rawUrl);
			if (!response.ok) return null;
			const manifest = await response.json();
			return manifest.files || null;
		} catch (error) {
			console.log("No manifest file found, using fallback list");
			return null;
		}
	}

	async function getDriveManifestDocuments() {
		try {
			if (DRIVE_FOLDER_URL && DRIVE_API_KEY) {
				// First, try to list folder using API (may fail due to CORS/referrer restrictions)
				const folderIdMatch = DRIVE_FOLDER_URL.match(
					/folders\/([A-Za-z0-9_-]+)/
				);
				const folderId = folderIdMatch ? folderIdMatch[1] : "";
				if (!folderId) return null;

				let manifestFileId = null;
				let allFiles = [];

				try {
					const q = encodeURIComponent(
						`'${folderId}' in parents and trashed = false`
					);
					const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,modifiedTime,parents)&supportsAllDrives=true&includeItemsFromAllDrives=true&key=${DRIVE_API_KEY}`;
					const listRes = await fetch(listUrl, { cache: "no-store" });
					if (listRes.ok) {
						const list = await listRes.json();
						allFiles = (list && list.files) || [];
						let file = allFiles.find((f) => f.name === "manifest.json");
						if (!file)
							file = allFiles.find(
								(f) => (f.name || "").toLowerCase() === "manifest.json"
							);
						if (!file)
							file = allFiles.find(
								(f) =>
									(f.name || "").toLowerCase().startsWith("manifest") &&
									(f.mimeType || "").includes("json")
							);
						if (file && file.id) manifestFileId = file.id;
					}
				} catch (listError) {
					console.warn("Drive folder listing failed (likely CORS):", listError);
					// Fall through to try direct download if we know the manifest ID
				}

				// If we didn't get the manifest ID from listing, use known ID
				// (manifest.json file ID from the folder: 1OGvU_k5QmlGAvELnzgdikZO0g14JUBpG)
				if (!manifestFileId) {
					manifestFileId = "1OGvU_k5QmlGAvELnzgdikZO0g14JUBpG";
				}

				// Try public download URL first (bypasses API CORS issues for public files)
				let downloadUrl = `https://drive.google.com/uc?export=download&id=${manifestFileId}`;
				let res = await fetch(downloadUrl, {
					cache: "no-store",
					redirect: "follow",
				});

				// If public URL doesn't work or doesn't return JSON, try API download (may still hit CORS)
				if (!res.ok) {
					downloadUrl = `https://www.googleapis.com/drive/v3/files/${manifestFileId}?alt=media&key=${DRIVE_API_KEY}`;
					res = await fetch(downloadUrl, { cache: "no-store" });
				} else {
					const contentType = res.headers.get("content-type");
					if (
						contentType &&
						!contentType.includes("application/json") &&
						!contentType.includes("text/plain")
					) {
						// Public URL may redirect or return HTML, try API version
						downloadUrl = `https://www.googleapis.com/drive/v3/files/${manifestFileId}?alt=media&key=${DRIVE_API_KEY}`;
						res = await fetch(downloadUrl, { cache: "no-store" });
					}
				}

				if (!res.ok) {
					console.warn(
						"Failed to download manifest.json from Drive:",
						res.status,
						res.statusText
					);
					return null;
				}

				const json = await res.json();
				if (json && Array.isArray(json.documents)) return json.documents;
				if (json && json.files && Array.isArray(json.files)) {
					// Handle case where manifest has "files" array instead of "documents"
					return json.files.map((fileId) => ({ id: fileId }));
				}
				return null;
			}
			return null;
		} catch (e) {
			console.warn("Drive manifest fetch failed:", e);
			return null;
		}
	}

	function parseMarkdownMetadata(markdownContent, resourceId) {
		const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---/);
		if (!frontmatterMatch) return null;
		const frontmatter = frontmatterMatch[1];
		const metadata = {};
		frontmatter.split("\n").forEach((line) => {
			const match = line.match(/^(\w+):\s*["']?([^"']*)["']?$/);
			if (match) {
				metadata[match[1]] = match[2];
			}
		});
		return {
			id: resourceId,
			title: metadata.title || "Document",
			description: metadata.description || "No description available",
			type: metadata.type || "Document",
			date: metadata.date || "Unknown",
			icon: metadata.icon || "📄",
			content: markdownContent,
		};
	}

	function createResourceTile(resource) {
		const tile = document.createElement("div");
		tile.className = "resource-tile";
		tile.onclick = () => expandResource(resource);
		tile.innerHTML = `
			<div class="resource-icon">${resource.icon}</div>
			<h3>${resource.title}</h3>
			<p>${resource.description}</p>
			<div class="resource-meta">
				<span class="resource-type">${resource.type}</span>
				<span class="resource-date">${resource.date}</span>
			</div>
		`;
		return tile;
	}

	function createDriveResourceTile(doc) {
		console.log("createDriveResourceTile called with:", doc);
		console.log("Document structure check:", {
			id: doc?.id,
			title: doc?.title,
			shareURL: doc?.shareURL,
			shareUrl: doc?.shareUrl,
			hasShareUrl: !!(doc?.shareURL || doc?.shareUrl),
		});
		if (!doc) {
			console.error("createDriveResourceTile: doc is null or undefined");
			return null;
		}
		const tile = document.createElement("div");
		tile.className = "resource-tile";
		tile.onclick = () => expandDriveResource(doc);
		const icon = "📄";

		// Format date from ISO string to readable format
		let date = "";
		if (doc.lastEdited) {
			try {
				const dateObj = new Date(doc.lastEdited);
				date = dateObj.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				});
			} catch (e) {
				date = doc.lastEdited;
			}
		} else if (doc.creationDate) {
			try {
				const dateObj = new Date(doc.creationDate);
				date = dateObj.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				});
			} catch (e) {
				date = doc.creationDate;
			}
		}

		const type = doc.type || "Document";
		const title = doc.title || "Document";
		const description = doc.description || "";

		console.log("Tile data - title:", title, "type:", type, "date:", date);

		tile.innerHTML = `
			<div class="resource-icon">${icon}</div>
			<h3>${escapeHtml(title)}</h3>
			<p>${escapeHtml(description)}</p>
			<div class="resource-meta">
				<span class="resource-type">${escapeHtml(type)}</span>
				<span class="resource-date">${escapeHtml(date)}</span>
			</div>
		`;
		console.log("Created tile HTML:", tile.innerHTML.substring(0, 100) + "...");
		return tile;
	}

	function escapeHtml(str) {
		return String(str).replace(
			/[&<>"']/g,
			(s) =>
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;",
				}[s])
		);
	}

	// Resources Modal Functionality
	function openResourcesModal() {
		const modal = document.getElementById("resources-modal");
		if (modal) {
			modal.classList.add("show");
			document.body.style.overflow = "hidden";
			loadResources();
		}
	}
	function closeResourcesModal() {
		const modal = document.getElementById("resources-modal");
		const expandedResource = document.getElementById("expanded-resource");
		if (modal) {
			modal.classList.remove("show");
			document.body.style.overflow = "auto";
			if (expandedResource) {
				expandedResource.classList.remove("show");
			}
		}
	}

	// Team Modal Functionality
	function openTeamModal() {
		const modal = document.getElementById("team-modal");
		if (modal) {
			modal.classList.add("show");
			document.body.style.overflow = "hidden";
		}
	}
	function closeTeamModal() {
		const modal = document.getElementById("team-modal");
		if (modal) {
			modal.classList.remove("show");
			document.body.style.overflow = "auto";
		}
	}

	function expandResource(resource) {
		const expandedResource = document.getElementById("expanded-resource");
		const contentElement = document.getElementById("expanded-resource-content");
		if (expandedResource && contentElement) {
			// Remove any previously injected direct embed and show content wrapper
			const directEmbedCard = expandedResource.querySelector(
				":scope > .glass-embed-card"
			);
			if (directEmbedCard) directEmbedCard.remove();
			const wrapper = expandedResource.querySelector(
				":scope > .expanded-resource-content"
			);
			if (wrapper) wrapper.style.display = "";
			loadMarkdownContent(resource.id, contentElement);
			expandedResource.classList.add("show");
			document.body.style.overflow = "hidden";
		}
	}

	async function expandDriveResource(doc) {
		const expandedResource = document.getElementById("expanded-resource");
		const contentElement = document.getElementById("expanded-resource-content");
		if (!doc || !doc.id || !expandedResource || !contentElement) return;
		// Hide the content wrapper; we'll render the iframe directly under overlay
		const wrapper = expandedResource.querySelector(
			":scope > .expanded-resource-content"
		);
		if (wrapper) wrapper.style.display = "none";

		// Security helpers
		const isAllowedEmbedUrl = (urlString) => {
			try {
				if (!urlString) return false;
				if (urlString.startsWith("blob:")) return true;
				const u = new URL(urlString);
				const allowedHosts = new Set(["drive.google.com", "docs.google.com"]);
				return allowedHosts.has((u.hostname || "").toLowerCase());
			} catch (_) {
				return false;
			}
		};

		const buildEmbedShell = (src, kind) => {
			const old = expandedResource.querySelector(":scope > .glass-embed-card");
			if (old) old.remove();
			const shell = document.createElement("div");
			shell.className = "glass-embed-card";
			const iframe = document.createElement("iframe");
			iframe.className = "glass-embed-iframe";
			iframe.setAttribute("allow", "fullscreen");
			iframe.setAttribute("referrerpolicy", "no-referrer");
			if (kind === "drive") {
				iframe.setAttribute(
					"sandbox",
					"allow-scripts allow-same-origin allow-popups allow-downloads"
				);
			} else {
				iframe.setAttribute("sandbox", "allow-downloads");
			}
			iframe.src = src;
			shell.appendChild(iframe);
			return shell;
		};
		const directShareUrl = doc.shareUrl || doc.shareURL;
		if (directShareUrl) {
			const previewUrl = directShareUrl.replace("/view", "/preview");
			if (!isAllowedEmbedUrl(previewUrl)) {
				if (wrapper) wrapper.style.display = "";
				contentElement.innerHTML = "<p>Blocked non-allowed embed URL.</p>";
			} else {
				const shell = buildEmbedShell(previewUrl, "drive");
				expandedResource.appendChild(shell);
			}
			expandedResource.classList.add("show");
			document.body.style.overflow = "hidden";
			return;
		}
		try {
			contentElement.innerHTML = "<p>Loading document…</p>";
			let fileId = doc.id;
			let resourceKey = doc.resourceKey || "";
			const shareUrlSeed = doc.shareUrl || doc.shareURL;
			if (shareUrlSeed) {
				try {
					const idMatch = shareUrlSeed.match(/\/d\/([A-Za-z0-9_-]+)/);
					if (idMatch && idMatch[1]) fileId = idMatch[1];
					const rkMatch = shareUrlSeed.match(/[?&]resourcekey=([^&]+)/i);
					if (rkMatch && rkMatch[1])
						resourceKey = decodeURIComponent(rkMatch[1]);
				} catch (_) {}
			}
			let metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name,resourceKey,shortcutDetails/targetId,shortcutDetails/targetMimeType,shortcutDetails/targetResourceKey&supportsAllDrives=true&key=${DRIVE_API_KEY}`;
			if (resourceKey)
				metaUrl += `&resourceKey=${encodeURIComponent(resourceKey)}`;
			const metaRes = await fetch(metaUrl, { cache: "no-store" });
			if (!metaRes.ok) throw new Error("metadata-failed");
			const meta = await metaRes.json();
			let mime = (meta.mimeType || "").toLowerCase();
			let name = meta.name || doc.title || "";
			resourceKey = meta.resourceKey || resourceKey || "";
			if (
				mime === "application/vnd.google-apps.shortcut" &&
				meta.shortcutDetails
			) {
				fileId = meta.shortcutDetails.targetId || fileId;
				mime = (meta.shortcutDetails.targetMimeType || "").toLowerCase();
				resourceKey = meta.shortcutDetails.targetResourceKey || resourceKey;
			}
			const appendParams = (url) => {
				const u = new URL(url);
				u.searchParams.set("supportsAllDrives", "true");
				if (resourceKey) u.searchParams.set("resourceKey", resourceKey);
				return u.toString();
			};
			let downloadUrl = "";
			if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
				downloadUrl = appendParams(
					`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE_API_KEY}`
				);
			} else if (mime.startsWith("application/vnd.google-apps.")) {
				downloadUrl = appendParams(
					`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf&key=${DRIVE_API_KEY}`
				);
			} else {
				downloadUrl = appendParams(
					`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE_API_KEY}`
				);
			}
			const res = await fetch(downloadUrl, { cache: "no-store" });
			if (!res.ok) throw new Error("download-failed");
			const blob = await res.blob();
			const blobUrl = URL.createObjectURL(blob);
			const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
			const shell2 = buildEmbedShell(blobUrl, "blob");
			expandedResource.appendChild(shell2);
		} catch (e) {
			contentElement.innerHTML = "<p>Failed to load document.</p>";
		}
		expandedResource.classList.add("show");
		document.body.style.overflow = "hidden";
	}

	function closeExpandedResource() {
		const expandedResource = document.getElementById("expanded-resource");
		if (expandedResource) {
			expandedResource.classList.remove("show");
			document.body.style.overflow = "auto";
			// Remove any injected direct embed and restore content wrapper
			const directEmbed = expandedResource.querySelector(
				":scope > .glass-embed-card"
			);
			if (directEmbed) directEmbed.remove();
			const contentWrapper = expandedResource.querySelector(
				":scope > .expanded-resource-content"
			);
			if (contentWrapper) contentWrapper.style.display = "";
		}
	}

	async function loadMarkdownContent(resourceId, contentElement) {
		try {
			const rawUrl = getRawGitHubUrl(`/resources/markdown/${resourceId}.md`);
			const response = await fetch(rawUrl);
			if (!response.ok) {
				contentElement.innerHTML = "<p>Content not found.</p>";
				return;
			}
			const markdownContent = await response.text();
			const resource = parseMarkdownMetadata(markdownContent, resourceId);
			if (resource) {
				const contentWithoutFrontmatter = markdownContent.replace(
					/^---\n[\s\S]*?\n---\n/,
					""
				);
				const htmlContent = convertMarkdownToHtml(contentWithoutFrontmatter);
				contentElement.innerHTML = htmlContent;
			} else {
				contentElement.innerHTML = "<p>Failed to parse content.</p>";
			}
		} catch (error) {
			console.error("Failed to load markdown content:", error);
			contentElement.innerHTML = "<p>Error loading content.</p>";
		}
	}

	function convertMarkdownToHtml(markdown) {
		if (typeof marked !== "undefined") {
			marked.setOptions({
				breaks: true,
				gfm: true,
				sanitize: false,
				smartLists: true,
				smartypants: true,
			});
			const renderer = new marked.Renderer();
			renderer.link = function (href, title, text) {
				const isExternal =
					href.startsWith("http") && !href.includes(window.location.hostname);
				const target = isExternal
					? ' target="_blank" rel="noopener noreferrer"'
					: "";
				const titleAttr = title ? ` title="${title}"` : "";
				return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
			};
			marked.setOptions({ renderer });
			return marked.parse(markdown);
		} else {
			console.warn("marked.js not loaded, using fallback markdown parser");
			return markdown
				.replace(/^# (.*$)/gim, "<h1>$1</h1>")
				.replace(/^## (.*$)/gim, "<h2>$1</h2>")
				.replace(/^### (.*$)/gim, "<h3>$1</h3>")
				.replace(/^#### (.*$)/gim, "<h4>$1</h4>")
				.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
				.replace(/\*(.*?)\*/g, "<em>$1</em>")
				.replace(/`([^`]+)`/g, "<code>$1</code>")
				.replace(/\n\n/g, "</p><p>")
				.replace(/\n/g, "<br>");
		}
	}

	function openProductsModal() {
		const modal = document.getElementById("products-modal");
		console.log("Opening modal:", modal);
		if (modal) {
			modal.classList.add("show");
			document.body.style.overflow = "hidden";
		} else {
			console.error("Modal element not found");
		}
	}

	function openModalToSection(sectionId) {
		const modal = document.getElementById("products-modal");
		const targetSection = document.getElementById(sectionId);
		if (modal && targetSection) {
			modal.classList.add("show");
			document.body.style.overflow = "hidden";
			setTimeout(() => {
				const modalContent = modal.querySelector(".modal-content");
				const modalBody = modal.querySelector(".modal-body");
				const sectionTop = targetSection.offsetTop;
				const modalBodyTop = modalBody.offsetTop;
				const scrollPosition = sectionTop - modalBodyTop - 20;
				modalContent.scrollTo({ top: scrollPosition, behavior: "smooth" });
				targetSection.style.transition = "all 0.3s ease";
				targetSection.style.background = "rgba(169, 214, 138, 0.2)";
				targetSection.style.border = "2px solid var(--bright)";
				setTimeout(() => {
					targetSection.style.background = "";
					targetSection.style.border = "";
				}, 3000);
			}, 100);
		} else {
			console.error("Modal or target section not found");
		}
	}

	function closeProductsModal() {
		const modal = document.getElementById("products-modal");
		console.log("Closing modal:", modal);
		if (modal) {
			modal.classList.remove("show");
			document.body.style.overflow = "auto";
			resetAllProductExpansions();
		}
	}

	document.addEventListener("DOMContentLoaded", function () {
		const productsModal = document.getElementById("products-modal");
		prefetchDriveResources();

		// Load resources if on resources page
		if (document.getElementById("resources-grid")) {
			loadResources();
		}

		document.querySelectorAll(".learn-more-btn").forEach((btn) => {
			if (!btn.dataset.originalText) {
				btn.dataset.originalText = btn.textContent.trim();
			}
		});
		if (productsModal) {
			const observer = new MutationObserver((mutations) => {
				for (const m of mutations) {
					if (m.type === "attributes" && m.attributeName === "class") {
						if (!productsModal.classList.contains("show")) {
							resetAllProductExpansions();
						}
					}
				}
			});
			observer.observe(productsModal, {
				attributes: true,
				attributeFilter: ["class"],
			});
		}

		// Enhanced functionality initialization
		// Back to top button
		window.addEventListener("scroll", handleBackToTopVisibility);

		// Keyboard navigation improvements
		document.addEventListener("keydown", function (e) {
			// Alt + T for back to top
			if (e.altKey && e.key === "t") {
				e.preventDefault();
				scrollToTop();
			}
		});

		// Improve focus management for modals
		const modals = document.querySelectorAll(".modal");
		modals.forEach((modal) => {
			modal.addEventListener("show", function () {
				const firstFocusable = modal.querySelector(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				if (firstFocusable) {
					setTimeout(() => firstFocusable.focus(), 100);
				}
			});
		});
	});

	// Close modals when clicking outside of them
	window.onclick = function (event) {
		const productsModal = document.getElementById("products-modal");
		const resourcesModal = document.getElementById("resources-modal");
		const teamModal = document.getElementById("team-modal");
		const architectureModal = document.getElementById("architecture-modal");
		const expandedResource = document.getElementById("expanded-resource");
		if (
			productsModal &&
			productsModal.classList.contains("show") &&
			event.target === productsModal
		) {
			closeProductsModal();
		}
		if (
			resourcesModal &&
			resourcesModal.classList.contains("show") &&
			event.target === resourcesModal
		) {
			closeResourcesModal();
		}
		if (
			teamModal &&
			teamModal.classList.contains("show") &&
			event.target === teamModal
		) {
			closeTeamModal();
		}
		if (
			architectureModal &&
			architectureModal.classList.contains("show") &&
			event.target === architectureModal
		) {
			closeArchitectureDiagram();
		}
	};

	// Prevent default navigation on solution links so '#' doesn't jump page
	document.addEventListener("click", function (e) {
		const link =
			e.target && e.target.closest && e.target.closest("a.solution-link");
		if (link) {
			e.preventDefault();
		}
	});

	// Close modals with Escape key
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			const productsModal = document.getElementById("products-modal");
			const resourcesModal = document.getElementById("resources-modal");
			const teamModal = document.getElementById("team-modal");
			const architectureModal = document.getElementById("architecture-modal");
			const expandedResource = document.getElementById("expanded-resource");
			if (expandedResource && expandedResource.classList.contains("show")) {
				closeExpandedResource();
			} else if (
				architectureModal &&
				architectureModal.classList.contains("show")
			) {
				closeArchitectureDiagram();
			} else if (resourcesModal && resourcesModal.classList.contains("show")) {
				closeResourcesModal();
			} else if (teamModal && teamModal.classList.contains("show")) {
				closeTeamModal();
			} else if (productsModal && productsModal.classList.contains("show")) {
				closeProductsModal();
			}
		}
	});

	// Progressive Disclosure Functionality for main page (non-modal)
	function toggleDetails(detailsId) {
		const details = document.getElementById(detailsId);
		const button = event.target;
		if (details.classList.contains("expanded")) {
			details.classList.remove("expanded");
			if (button.textContent.includes("Hide")) {
				if (button.textContent.includes("Timeline")) {
					button.textContent = "View Full Timeline";
				}
			}
		} else {
			const allExpandableDetails = document.querySelectorAll(
				".expandable-details.expanded"
			);
			allExpandableDetails.forEach((expandedDetail) => {
				if (expandedDetail.id !== detailsId) {
					expandedDetail.classList.remove("expanded");
					const closedButton = document.querySelector(
						`[onclick="toggleDetails('${expandedDetail.id}')"]`
					);
					if (closedButton) {
						if (closedButton.textContent.includes("Hide Timeline")) {
							closedButton.textContent = "View Full Timeline";
						}
					}
				}
			});
			details.classList.add("expanded");
			if (button.textContent.includes("View Full Timeline")) {
				button.textContent = "Hide Timeline";
			}
			setTimeout(() => {
				details.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		}
	}

	// Update year
	const yearEl = document.getElementById("y");
	if (yearEl) {
		yearEl.textContent = new Date().getFullYear();
	}

	// Architecture Diagram Modal Functionality
	function openArchitectureDiagram() {
		const modal = document.getElementById("architecture-modal");
		if (modal) {
			modal.classList.add("show");
			document.body.style.overflow = "hidden";
		}
	}

	function closeArchitectureDiagram() {
		const modal = document.getElementById("architecture-modal");
		if (modal) {
			modal.classList.remove("show");
			document.body.style.overflow = "auto";
		}
	}

	// Expose functions globally to support inline attribute handlers in HTML
	window.openResourcesModal = openResourcesModal;
	window.closeResourcesModal = closeResourcesModal;
	window.openTeamModal = openTeamModal;
	window.closeTeamModal = closeTeamModal;
	window.openProductsModal = openProductsModal;
	window.closeProductsModal = closeProductsModal;
	window.openModalToSection = openModalToSection;
	window.toggleProductDetails = toggleProductDetails;
	window.resetAllProductExpansions = resetAllProductExpansions;
	window.expandResource = expandResource;
	window.expandDriveResource = expandDriveResource;
	window.closeExpandedResource = closeExpandedResource;
	window.prefetchDriveResources = prefetchDriveResources;
	window.loadResources = loadResources;
	window.toggleDetails = toggleDetails;
	window.openArchitectureDiagram = openArchitectureDiagram;
	window.closeArchitectureDiagram = closeArchitectureDiagram;
})();
// Back to Top Button Functionality
function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
}

function handleBackToTopVisibility() {
	const backToTopBtn = document.getElementById("back-to-top");
	if (backToTopBtn) {
		if (window.pageYOffset > 300) {
			backToTopBtn.classList.add("visible");
		} else {
			backToTopBtn.classList.remove("visible");
		}
	}
}

// Loading States
function showLoadingOverlay() {
	const overlay = document.getElementById("loading-overlay");
	if (overlay) {
		overlay.classList.add("show");
	}
}

function hideLoadingOverlay() {
	const overlay = document.getElementById("loading-overlay");
	if (overlay) {
		overlay.classList.remove("show");
	}
}

// Enhanced Resources Loading with Loading State
async function loadResourcesWithLoading() {
	try {
		showLoadingOverlay();
		await loadResources();
	} finally {
		setTimeout(hideLoadingOverlay, 500); // Small delay for better UX
	}
}

// Collapsible Sections
function toggleCollapsible(sectionId) {
	const section = document.getElementById(sectionId);
	if (section) {
		section.classList.toggle("expanded");
	}
}

// Enhanced Modal Opening with Loading
function openResourcesModalEnhanced() {
	const modal = document.getElementById("resources-modal");
	if (modal) {
		modal.classList.add("show");
		document.body.style.overflow = "hidden";
		loadResourcesWithLoading();
	}
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
	const section = document.getElementById(sectionId);
	if (section) {
		section.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	}
}

// Keyboard handler for collapsible sections
function handleCollapsibleKeydown(event, sectionId) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		toggleCollapsible(sectionId);
	}
}

// Expose new functions globally
window.scrollToTop = scrollToTop;
window.toggleCollapsible = toggleCollapsible;
window.scrollToSection = scrollToSection;
window.openResourcesModalEnhanced = openResourcesModalEnhanced;
window.handleCollapsibleKeydown = handleCollapsibleKeydown;
