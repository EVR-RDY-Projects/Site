class OverlayReveal extends HTMLElement {
	static get observedAttributes() {
		return ["fit", "mode"];
	}
	constructor() {
		super();
		this._onScroll = this._onScroll.bind(this);
		this._onResize = this._onResize.bind(this);
		this._onShadowClick =
			this._onShadowClick && this._onShadowClick.bind
				? this._onShadowClick.bind(this)
				: (e) => this._onOverlayClick(e);
		this._onInnerScroll =
			this._onInnerScroll && this._onInnerScroll.bind
				? this._onInnerScroll.bind(this)
				: (e) => this._updateHintState();
		this._resizeScheduled = false;
		this._progress = 0;
		this._compactMode = false;
		this._animationSpeed = 1;
		this._overlayApplied = false;
		this._scrollDirection = "down";
		this._lastScrollY = 0;
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const cssHref =
			this.getAttribute("css") || "/assets/css/overlay-reveal.css";
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = cssHref;

		const root = document.createElement("div");
		root.className = "or-root";
		root.innerHTML = `
		      <div class="or-primary">
		        <slot name="primary"></slot>
		      </div>
		      <div class="or-overlay" part="overlay">
		        <div class="or-overlay-fade">
		          <slot name="overlay"></slot>
		        </div>
		      </div>
		      <div class="or-scroll-hint" part="scroll-hint">Scroll</div>
		    `;

		this.shadowRoot.append(link, root);

		// Capture clicks in shadow to ensure slotted links are handled
		this.shadowRoot.addEventListener("click", this._onShadowClick, {
			capture: true,
		});

		// Initialize CSS vars
		this._setProgress(0);

		// Listeners
		window.addEventListener("scroll", this._onScroll, { passive: true });
		window.addEventListener("resize", this._onResize, { passive: true });
		window.addEventListener("orientationchange", this._onResize, {
			passive: true,
		});

		// Inner wheel/touch handlers to allow page scroll when inner reaches ends
		this.addEventListener("wheel", (e) => this._onInnerWheel(e), {
			passive: false,
		});
		this.addEventListener("touchstart", (e) => this._onTouchStart(e), {
			passive: true,
		});
		this.addEventListener("touchmove", (e) => this._onTouchMove(e), {
			passive: false,
		});

		// Observe inner overlay scrolling to update hint state precisely
		const overlayFade = root.querySelector(".or-overlay-fade");
		if (overlayFade) {
			overlayFade.addEventListener("scroll", this._onInnerScroll, {
				passive: true,
			});
			// Ensure solution links fire in shadow DOM
			overlayFade.addEventListener("click", (e) => this._onOverlayClick(e));
		}

		// First layout
		this._checkCompactMode();
		this._syncToPrimaryGrid();
		this._setProgress(this._calculateProgress());
		this._ensureFit();
		this._applyPrimaryOnlyIfNeeded();
	}
	_isPrimaryOnly() {
		const modeAttr = (this.getAttribute("mode") || "").toLowerCase();
		return (
			modeAttr === "primary" ||
			modeAttr === "primary-only" ||
			modeAttr === "off"
		);
	}
	_applyPrimaryOnlyIfNeeded() {
		if (!(this._isPrimaryOnly && this._isPrimaryOnly())) return;
		this.style.setProperty("--or-overlay-translate-y", "100%");
		this.style.setProperty("--or-primary-opacity", "1");
		this.style.setProperty("--or-overlay-opacity", "0");
		this.style.setProperty("--or-overlay-visibility", "hidden");
		this.style.setProperty("--or-overlay-pe", "none");
		this.classList.remove(
			"or-inner-scroll",
			"or-scrollable",
			"or-hint-visible",
			"or-dir-up",
			"or-dir-down"
		);
		this._overlayApplied = false;
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "fit" && oldValue !== newValue) {
			this._ensureFit();
		}
		if (name === "mode" && oldValue !== newValue) {
			this._applyPrimaryOnlyIfNeeded();
		}
	}

	disconnectedCallback() {
		window.removeEventListener("scroll", this._onScroll);
		window.removeEventListener("resize", this._onResize);
		window.removeEventListener("orientationchange", this._onResize);
	}

	// Public API: programmatically set overlay progress (0..1)
	set progress(v) {
		this._setProgress(v);
	}
	get progress() {
		return this._progress;
	}

	_clamp(v, min, max) {
		return Math.max(min, Math.min(max, v));
	}

	_setProgress(p) {
		if (this._isPrimaryOnly && this._isPrimaryOnly()) {
			this._progress = 0;
			this.style.setProperty("--or-overlay-translate-y", "100%");
			this.style.setProperty("--or-primary-opacity", "1");
			this.style.setProperty("--or-overlay-opacity", "0");
			this.style.setProperty("--or-overlay-visibility", "hidden");
			this.style.setProperty("--or-overlay-pe", "none");
			this.classList.remove(
				"or-inner-scroll",
				"or-scrollable",
				"or-hint-visible",
				"or-dir-up",
				"or-dir-down"
			);
			this._overlayApplied = false;
			return;
		}
		this._progress = this._clamp(p, 0, 1);
		const adjusted = Math.min(1, this._progress * this._animationSpeed);
		// Ease to front-load completion before borders reach edges
		const easePower = this._compactMode ? 2.6 : 2.0;
		let finalProgress = 1 - Math.pow(1 - adjusted, easePower);
		if (this._compactMode && this._progress > 0.5)
			finalProgress = Math.min(1, finalProgress * 1.35);
		if (!this._compactMode && this._progress > 0.6)
			finalProgress = Math.min(1, finalProgress * 1.2);

		const translateY = 100 - finalProgress * 100;
		this.style.setProperty("--or-overlay-translate-y", translateY + "%");
		this.style.setProperty(
			"--or-primary-opacity",
			(1 - finalProgress).toFixed(2)
		);
		this.style.setProperty("--or-overlay-opacity", finalProgress.toFixed(2));
		this.style.setProperty(
			"--or-overlay-visibility",
			finalProgress > 0 ? "visible" : "hidden"
		);
		this.style.setProperty(
			"--or-overlay-pe",
			finalProgress > 0 ? "auto" : "none"
		);

		// Allow inner scrolling only when fully applied (but never in fit modes)
		const justApplied = !this._overlayApplied && finalProgress >= 0.85;
		const justRemoved =
			this._overlayApplied &&
			this._scrollDirection === "up" &&
			finalProgress <= 0.05;
		if (justApplied) {
			// Enable inner scroll only when not in fit-like modes
			if (!this._isFitMode()) {
				this.classList.add("or-inner-scroll");
			} else {
				this.classList.remove("or-inner-scroll");
			}
			this._overlayApplied = true;
			this._ensureFit(finalProgress);
			this._updateScrollableHint();
			this._updateHintState();
		} else if (justRemoved) {
			this.classList.remove("or-inner-scroll");
			this._overlayApplied = false;
			this.style.minHeight = "";
			this.classList.remove("or-scrollable");
		}

		// Continuously enforce fit as progress changes
		this._ensureFit(finalProgress);

		// Hide hint as soon as overlay starts retracting (moving away from extremes)
		// i.e., whenever progress is decreasing from fully-applied state
		if (
			this._overlayApplied &&
			this._scrollDirection === "up" &&
			finalProgress < 0.85
		) {
			this.classList.remove("or-hint-visible", "or-dir-up", "or-dir-down");
		}
	}

	_isFitMode() {
		const fitAttr = (this.getAttribute("fit") || "scroll").toLowerCase();
		return (
			fitAttr === "fit" ||
			fitAttr === "expand" ||
			fitAttr === "grow" ||
			fitAttr === "auto"
		);
	}

	_ensureFit(progressHint) {
		const fitAttr = (this.getAttribute("fit") || "scroll").toLowerCase();
		const expandModes = new Set(["expand", "fit", "grow", "auto"]);
		if (!expandModes.has(fitAttr)) {
			this.style.minHeight = "";
			return;
		}
		const primaryEl = this.shadowRoot.querySelector(".or-primary");
		const overlayEl = this.shadowRoot.querySelector(".or-overlay");
		const overlayContent = this.shadowRoot.querySelector(".or-overlay-fade");
		if (!primaryEl || !overlayEl || !overlayContent) return;
		const primaryHeight = Math.ceil(primaryEl.scrollHeight || 0);
		const overlayHeight = Math.ceil(overlayContent.scrollHeight || 0);
		let p;
		if (typeof progressHint === "number") p = this._clamp(progressHint, 0, 1);
		else p = this._overlayApplied ? 1 : 0;
		const interpolated = Math.max(
			primaryHeight,
			Math.round(primaryHeight + (overlayHeight - primaryHeight) * p)
		);
		// Only grow; do not shrink during animation
		const currentMin = parseFloat(this.style.minHeight || "0") || 0;
		if (interpolated > currentMin) this.style.minHeight = interpolated + "px";
	}

	_calculateProgress() {
		// Determine progress based on host position relative to viewport center
		this._checkCompactMode();
		const rect = this.getBoundingClientRect();
		const viewportH = window.innerHeight;
		const viewportW = window.innerWidth;
		const sectionTop = rect.top;
		const sectionBottom = rect.bottom;
		const sectionHeight = rect.height;

		let viewportCenter;
		let effectiveHeight;
		const isMobile = viewportW <= 768;
		const isSmallMobile = viewportW <= 480;

		if (this._compactMode) {
			viewportCenter = viewportH * 0.3; // 30% from top
			effectiveHeight = Math.min(sectionHeight, viewportH * 0.8);
		} else {
			if (isSmallMobile) viewportCenter = viewportH * 0.4; // 40%
			else if (isMobile) viewportCenter = viewportH * 0.45; // 45%
			else viewportCenter = viewportH / 2;
			effectiveHeight = sectionHeight;
		}

		// If overlay is applied and we're still scrolling down, keep at 1
		if (
			this._overlayApplied &&
			this._scrollDirection === "down" &&
			sectionTop <= viewportCenter
		) {
			return 1;
		}

		// Allow reverse animation when scrolling up past center
		if (sectionTop > viewportCenter) return 0;
		if (sectionBottom < viewportCenter) return 1;

		const distanceFromTop = viewportCenter - sectionTop;
		const progress = distanceFromTop / effectiveHeight;
		return this._clamp(progress, 0, 1);
	}

	_onScroll() {
		if (this._isPrimaryOnly && this._isPrimaryOnly()) return;
		const currentY = window.scrollY;
		const newDir = currentY > this._lastScrollY ? "down" : "up";
		if (newDir !== this._scrollDirection) this._scrollDirection = newDir;
		this._setProgress(this._calculateProgress());
		// When fully applied and fit=expand, ensure size while user scrolls inside overlay
		this._ensureFit(this._progress);
		this._updateScrollableHint();
		this._lastScrollY = currentY;
	}

	_atScrollExtents(el, deltaY) {
		if (!el) return true;
		if (deltaY > 0) {
			return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
		}
		if (deltaY < 0) {
			return el.scrollTop <= 0;
		}
		return false;
	}

	_getScrollableTargetFromEvent(evt) {
		const overlayFade =
			this.shadowRoot && this.shadowRoot.querySelector(".or-overlay-fade");
		if (!overlayFade) return null;
		const path = evt && evt.composedPath ? evt.composedPath() : [];
		for (let i = 0; i < path.length; i++) {
			const node = path[i];
			if (node === overlayFade || node === this) break;
			if (node && node instanceof HTMLElement) {
				const cs = getComputedStyle(node);
				const canOverflowY =
					cs.overflowY === "auto" || cs.overflowY === "scroll";
				if (canOverflowY && node.scrollHeight > node.clientHeight + 1) {
					return node;
				}
			}
		}
		return overlayFade;
	}

	_onInnerWheel(e) {
		if (!this._overlayApplied) return;
		if (this._isPrimaryOnly && this._isPrimaryOnly()) return;
		if (this._isFitMode()) return; // in fit mode, let the page handle scroll entirely
		const deltaY = e.deltaY;
		const target = this._getScrollableTargetFromEvent(e);
		if (!target) return;
		const atEnds = this._atScrollExtents(target, deltaY);
		// Let the browser handle inner scrolling by default; block bubbling so page doesn't scroll.
		if (!atEnds) {
			e.stopPropagation();
		} else {
			// At the ends: nudge the page scroll in the intended direction
			try {
				window.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
			} catch (_) {
				window.scrollTo(0, window.scrollY + deltaY);
			}
		}
		// Update hint direction and visibility based on wheel intent
		if (deltaY > 0) {
			this.classList.add("or-dir-down");
			this.classList.remove("or-dir-up");
		} else if (deltaY < 0) {
			this.classList.add("or-dir-up");
			this.classList.remove("or-dir-down");
		}
		this._updateHintState();
	}

	_onTouchStart(e) {
		this._touchStartY =
			e.touches && e.touches.length ? e.touches[0].clientY : 0;
	}

	_onTouchMove(e) {
		if (!this._overlayApplied) return;
		if (this._isPrimaryOnly && this._isPrimaryOnly()) return;
		if (this._isFitMode()) return; // in fit mode, let the page handle scroll entirely
		const target = this._getScrollableTargetFromEvent(e);
		if (!target) return;
		const currentY = e.touches && e.touches.length ? e.touches[0].clientY : 0;
		const deltaY =
			this._touchStartY !== undefined ? this._touchStartY - currentY : 0;
		const atEnds = this._atScrollExtents(target, deltaY);
		if (!atEnds) {
			e.stopPropagation();
			// On iOS Safari, preventDefault is needed to stop body scroll while inner scrolls
			if (typeof e.cancelable !== "boolean" || e.cancelable) e.preventDefault();
		} else {
			// At ends, allow page to scroll by nudging it
			const step = deltaY;
			if (Math.abs(step) > 0) {
				window.scrollTo(0, window.scrollY + step);
			}
		}
		// Update hint direction and visibility based on gesture intent
		if (deltaY > 0) {
			this.classList.add("or-dir-down");
			this.classList.remove("or-dir-up");
		} else if (deltaY < 0) {
			this.classList.add("or-dir-up");
			this.classList.remove("or-dir-down");
		}
		this._updateHintState();
	}

	_onResize() {
		if (this._resizeScheduled) return;
		this._resizeScheduled = true;
		requestAnimationFrame(() => {
			this._checkCompactMode();
			this._setProgress(this._calculateProgress());
			this._syncToPrimaryGrid();
			requestAnimationFrame(() => this._syncToPrimaryGrid());
			this._ensureFit(this._progress);
			this._updateScrollableHint();
			this._updateHintState();
			this._resizeScheduled = false;
		});
	}

	_checkCompactMode() {
		const viewportH = window.innerHeight;
		const viewportW = window.innerWidth;
		const rect = this.getBoundingClientRect();
		const sectionH = rect.height;
		const spaceAbove = rect.top;
		const spaceBelow = viewportH - rect.bottom;
		const totalSpace = spaceAbove + sectionH + spaceBelow;
		const minRequired = sectionH * 1.2;
		const needs =
			totalSpace < minRequired ||
			viewportH < 600 ||
			viewportW < 400 ||
			spaceAbove < sectionH * 0.3 ||
			spaceBelow < sectionH * 0.3;
		this._compactMode = needs;
		if (needs) {
			const ratio = totalSpace / minRequired;
			this._animationSpeed = Math.max(3.0, Math.min(6.0, 1 / ratio));
		} else {
			this._animationSpeed = 1;
		}
	}

	_syncToPrimaryGrid() {
		// If a primary grid exists inside the slotted primary, copy spacing to vars
		const assigned = this.shadowRoot
			.querySelector('slot[name="primary"]')
			.assignedElements({ flatten: true });
		const primaryRoot = assigned && assigned[0] ? assigned[0] : null;
		if (!primaryRoot) return;
		const primaryGrid = primaryRoot.querySelector(
			"[data-or-grid], .challenge-grid"
		);
		if (!primaryGrid) return;
		const cs = window.getComputedStyle(primaryGrid);
		this.style.setProperty("--or-grid-gap", cs.getPropertyValue("gap"));
		this.style.setProperty("--or-grid-mt", cs.getPropertyValue("margin-top"));
		this.style.setProperty(
			"--or-grid-mb",
			cs.getPropertyValue("margin-bottom")
		);
	}

	_updateScrollableHint() {
		// In fit or primary-only mode, never show the scroll hint
		if (this._isFitMode() || (this._isPrimaryOnly && this._isPrimaryOnly())) {
			this.classList.remove(
				"or-scrollable",
				"or-hint-visible",
				"or-dir-up",
				"or-dir-down"
			);
			return;
		}
		const overlayFade =
			this.shadowRoot && this.shadowRoot.querySelector(".or-overlay-fade");
		if (!overlayFade) return;
		const canScroll = overlayFade.scrollHeight > overlayFade.clientHeight + 1;
		if (this._overlayApplied && canScroll) this.classList.add("or-scrollable");
		else this.classList.remove("or-scrollable");
	}

	_getOverlayFade() {
		return this.shadowRoot && this.shadowRoot.querySelector(".or-overlay-fade");
	}

	_updateHintState() {
		// In fit or primary-only mode, hint is always hidden
		if (this._isFitMode() || (this._isPrimaryOnly && this._isPrimaryOnly())) {
			this.classList.remove("or-hint-visible", "or-dir-up", "or-dir-down");
			return;
		}
		const overlayFade = this._getOverlayFade();
		if (!overlayFade || !this._overlayApplied) {
			this.classList.remove("or-hint-visible", "or-dir-up", "or-dir-down");
			return;
		}
		const canScroll = overlayFade.scrollHeight > overlayFade.clientHeight + 1;
		if (!canScroll) {
			this.classList.remove("or-hint-visible", "or-dir-up", "or-dir-down");
			return;
		}
		const atTop = overlayFade.scrollTop <= 0;
		const atBottom =
			overlayFade.scrollTop + overlayFade.clientHeight >=
			overlayFade.scrollHeight - 1;
		this.classList.remove("or-dir-up", "or-dir-down", "or-hint-visible");
		if (atTop) {
			this.classList.add("or-dir-down", "or-hint-visible");
		} else if (atBottom) {
			this.classList.add("or-dir-up", "or-hint-visible");
		}
	}

	_onInnerScroll() {
		this._updateHintState();
	}

	_onOverlayClick(e) {
		const anchor =
			(e.composedPath && e.composedPath().find
				? e
						.composedPath()
						.find(
							(n) =>
								n &&
								n.tagName === "A" &&
								n.classList &&
								n.classList.contains("solution-link")
						)
				: null) ||
			(e.target && e.target.closest && e.target.closest("a.solution-link"));
		if (!anchor) return;
		// Prevent default and bubble to page-level handler (index.html)
		e.preventDefault();
		// If index handler isn't present (embedded usage), try to call window.openModalToSection
		const href = anchor.getAttribute("onclick") || "";
		// Extract section id from onclick="openModalToSection('id')"
		const match = href.match(/openModalToSection\(['\"]([^'\"]+)['\"]\)/);
		if (match && typeof window.openModalToSection === "function") {
			window.openModalToSection(match[1]);
		}
	}
}

customElements.define("overlay-reveal", OverlayReveal);
