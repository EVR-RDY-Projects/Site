// Version Selector Component
function createVersionSelector() {
	const selector = document.createElement("div");
	selector.className = "version-selector-nav";
	selector.innerHTML = `
    <div class="version-nav-container">
      <label for="version-nav-select" class="version-nav-label">Version:</label>
      <select id="version-nav-select" class="version-nav-dropdown" onchange="navigateToVersion()">
        <option value="">Select Version</option>
        <option value="index.html">Portfolio</option>
        <option value="index-collapsible.html">Collapsible Sections</option>
        <option value="index-progressive.html">Progressive Disclosure</option>
        <option value="index-tabbed.html">Tabbed Interface</option>
      </select>
    </div>
  `;
	return selector;
}

function navigateToVersion() {
	const select = document.getElementById("version-nav-select");
	if (select.value) {
		window.location.href = select.value;
	}
}

function initVersionSelector() {
	// Add version selector to the top-right corner
	const header = document.querySelector("header.hero");
	if (header) {
		const selector = createVersionSelector();
		header.style.position = "relative";
		header.appendChild(selector);

		// Set current page as selected
		const currentPage =
			window.location.pathname.split("/").pop() || "index.html";
		const select = document.getElementById("version-nav-select");
		if (select) {
			select.value = currentPage;
		}
	}
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initVersionSelector);
