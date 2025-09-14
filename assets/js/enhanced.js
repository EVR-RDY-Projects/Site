// Once UI Enhanced JavaScript for EVR:RDY
// Adds modern interactions and accessibility features

(function () {
	"use strict";

	// Once UI Intersection Observer for animations
	function initScrollAnimations() {
		const observerOptions = {
			threshold: 0.1,
			rootMargin: "0px 0px -50px 0px",
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.style.opacity = "1";
					entry.target.style.transform = "translateY(0)";
				}
			});
		}, observerOptions);

		// Observe all cards for scroll animations
		document.querySelectorAll(".card").forEach((card) => {
			card.style.opacity = "0";
			card.style.transform = "translateY(20px)";
			card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
			observer.observe(card);
		});
	}

	// Once UI Smooth scrolling for anchor links
	function initSmoothScrolling() {
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener("click", function (e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute("href"));
				if (target) {
					target.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}
			});
		});
	}

	// Once UI Enhanced focus management
	function initFocusManagement() {
		// Add focus indicators for keyboard navigation
		document.addEventListener("keydown", function (e) {
			if (e.key === "Tab") {
				document.body.classList.add("keyboard-navigation");
			}
		});

		document.addEventListener("mousedown", function () {
			document.body.classList.remove("keyboard-navigation");
		});
	}

	// Once UI Theme detection and system preference
	function initThemeDetection() {
		// Check for system theme preference
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;

		// Add theme class to body for additional styling options
		if (prefersDark) {
			document.body.classList.add("theme-dark");
		} else {
			document.body.classList.add("theme-light");
		}

		// Listen for theme changes
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", (e) => {
				document.body.classList.toggle("theme-dark", e.matches);
				document.body.classList.toggle("theme-light", !e.matches);
			});
	}

	// Once UI Performance optimization
	function initPerformanceOptimizations() {
		// Lazy load images
		if ("IntersectionObserver" in window) {
			const imageObserver = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target;
						img.src = img.dataset.src || img.src;
						img.classList.remove("lazy");
						imageObserver.unobserve(img);
					}
				});
			});

			document.querySelectorAll("img[data-src]").forEach((img) => {
				imageObserver.observe(img);
			});
		}

		// Preload critical resources
		const criticalImages = [
			"assets/img/banner.png",
			"assets/img/background.png",
		];

		criticalImages.forEach((src) => {
			const link = document.createElement("link");
			link.rel = "preload";
			link.as = "image";
			link.href = src;
			document.head.appendChild(link);
		});
	}

	// Once UI Accessibility enhancements
	function initAccessibilityFeatures() {
		// Add skip link for keyboard users
		const skipLink = document.createElement("a");
		skipLink.href = "#main-content";
		skipLink.textContent = "Skip to main content";
		skipLink.className = "sr-only";
		skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--ink);
      color: var(--bright);
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `;

		skipLink.addEventListener("focus", function () {
			this.style.top = "6px";
		});

		skipLink.addEventListener("blur", function () {
			this.style.top = "-40px";
		});

		document.body.insertBefore(skipLink, document.body.firstChild);

		// Add main content ID
		const main = document.querySelector("main");
		if (main) {
			main.id = "main-content";
		}

		// Enhance form elements if any exist
		document.querySelectorAll("input, textarea, select").forEach((input) => {
			input.addEventListener("focus", function () {
				this.parentElement.classList.add("focused");
			});

			input.addEventListener("blur", function () {
				this.parentElement.classList.remove("focused");
			});
		});
	}

	// Once UI Error handling
	function initErrorHandling() {
		window.addEventListener("error", function (e) {
			console.error("EVR:RDY Enhanced Script Error:", e.error);
		});

		window.addEventListener("unhandledrejection", function (e) {
			console.error("EVR:RDY Unhandled Promise Rejection:", e.reason);
		});
	}

	// Once UI Analytics placeholder (replace with your analytics)
	function initAnalytics() {
		// Placeholder for analytics tracking
		// Replace with your preferred analytics solution

		// Track CTA clicks
		document.querySelectorAll(".cta").forEach((cta) => {
			cta.addEventListener("click", function () {
				// Analytics tracking code would go here
				console.log("CTA clicked:", this.href || this.textContent);
			});
		});

		// Track section views
		const sectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Analytics tracking code would go here
						console.log(
							"Section viewed:",
							entry.target.querySelector("h2")?.textContent
						);
					}
				});
			},
			{ threshold: 0.5 }
		);

		document.querySelectorAll(".card").forEach((card) => {
			sectionObserver.observe(card);
		});
	}

	// Initialize all features when DOM is ready
	function init() {
		// Check if we're in a reduced motion environment
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		if (!prefersReducedMotion) {
			initScrollAnimations();
		}

		initSmoothScrolling();
		initFocusManagement();
		initThemeDetection();
		initPerformanceOptimizations();
		initAccessibilityFeatures();
		initErrorHandling();
		initAnalytics();

		// Add loaded class to body for CSS transitions
		document.body.classList.add("loaded");
	}

	// Initialize when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	// Expose utilities for external use
	window.EVRRDY = {
		initScrollAnimations,
		initSmoothScrolling,
		initFocusManagement,
		initThemeDetection,
	};
})();
