// Enhanced JavaScript for EVR:RDY
// Adds modern interactions, animations, and accessibility features

(function () {
	"use strict";

	// Progressive enhancement - always initialize core features
	// Enhanced features will be added if supported

	// Enhanced Intersection Observer for scroll-triggered animations
	function initScrollAnimations() {
		if (!window.IntersectionObserver) {
			// Fallback: show all animations immediately
			document.querySelectorAll('.animate-slide-up, .animate-slide-left, .animate-slide-right, .animate-fade-scale').forEach(element => {
				element.classList.add('animate-triggered');
			});
			return;
		}

		const observerOptions = {
			threshold: 0.1,
			rootMargin: "0px 0px -50px 0px",
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("animate-triggered");

					// Add staggered animations for grid items
					const gridItems = entry.target.querySelectorAll(
						".challenge-grid > div, .structure-card, .solution-card"
					);
					gridItems.forEach((item, index) => {
						setTimeout(() => {
							item.classList.add("animate-triggered");
						}, index * 100);
					});
				}
			});
		}, observerOptions);

		// Observe all animated elements
		document
			.querySelectorAll(
				".animate-slide-up, .animate-slide-left, .animate-slide-right, .animate-fade-scale"
			)
			.forEach((element) => {
				observer.observe(element);
			});
	}

	// Animated counters
	function initAnimatedCounters() {
		const counters = document.querySelectorAll(".counter");
		
		if (!window.IntersectionObserver) {
			// Fallback: animate counters immediately
			counters.forEach(counter => {
				const target = parseInt(counter.dataset.target);
				counter.textContent = target;
			});
			return;
		}

		const counterObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const counter = entry.target;
						const target = parseInt(counter.dataset.target);
						const duration = 2000;
						const increment = target / (duration / 16);
						let current = 0;

						const updateCounter = () => {
							current += increment;
							if (current < target) {
								counter.textContent = Math.floor(current);
								requestAnimationFrame(updateCounter);
							} else {
								counter.textContent = target;
							}
						};

						updateCounter();
						counterObserver.unobserve(counter);
					}
				});
			},
			{ threshold: 0.5 }
		);

		counters.forEach((counter) => counterObserver.observe(counter));
	}

	// Enhanced hover effects
	function initEnhancedHoverEffects() {
		// Add enhanced hover to all interactive elements
		document
			.querySelectorAll(
				".card, .challenge-card, .solution-card, .structure-card, .cta, .learn-more-btn"
			)
			.forEach((element) => {
				element.classList.add("enhanced-hover");
			});

		// Add 3D transforms to cards
		document
			.querySelectorAll(
				".card, .challenge-card, .solution-card, .structure-card"
			)
			.forEach((element) => {
				element.classList.add("transform-3d");
			});
	}

	// Particle background effects
	function initParticleEffects() {
		// Only add particle effects if backdrop-filter is supported
		if (window.CSS && window.CSS.supports && window.CSS.supports('backdrop-filter', 'blur(10px)')) {
			document.querySelectorAll(".hero, .mission-enhanced").forEach((element) => {
				element.classList.add("particle-bg");
			});
		}
	}

	// Parallax scrolling effect
	function initParallaxScrolling() {
		// Only add parallax if transform is well supported
		if (window.CSS && window.CSS.supports && window.CSS.supports('transform', 'translateY(10px)')) {
			window.addEventListener("scroll", () => {
				const scrolled = window.pageYOffset;
				const parallaxElements = document.querySelectorAll(".parallax");

				parallaxElements.forEach((element) => {
					const speed = element.dataset.speed || 0.5;
					const yPos = -(scrolled * speed);
					element.style.transform = `translateY(${yPos}px)`;
				});
			});
		}
	}

	// Dynamic color schemes
	function initDynamicColors() {
		const sections = document.querySelectorAll("section");
		const colorSchemes = [
			{ primary: "#a9d68a", secondary: "#b9baaf", accent: "#e5e4d8" },
			{ primary: "#3b82f6", secondary: "#1e40af", accent: "#dbeafe" },
			{ primary: "#10b981", secondary: "#047857", accent: "#d1fae5" },
			{ primary: "#f59e0b", secondary: "#d97706", accent: "#fef3c7" },
		];

		sections.forEach((section, index) => {
			const colorScheme = colorSchemes[index % colorSchemes.length];
			section.style.setProperty("--section-primary", colorScheme.primary);
			section.style.setProperty("--section-secondary", colorScheme.secondary);
			section.style.setProperty("--section-accent", colorScheme.accent);
		});
	}

	// Enhanced modal with better transitions
	function initEnhancedModal() {
		const modal = document.getElementById("products-modal");
		const modalContent = document.querySelector(".modal-content");

		if (modal && modalContent) {
			// Enhanced modal opening
			window.openProductsModal = function () {
				modal.style.display = "block";
				document.body.style.overflow = "hidden";

				// Animate modal in
				setTimeout(() => {
					modal.classList.add("show");
					modalContent.style.transform = "scale(1)";
					modalContent.style.opacity = "1";
				}, 10);
			};

			// Enhanced modal closing
			window.closeProductsModal = function () {
				modal.classList.remove("show");
				modalContent.style.transform = "scale(0.9)";
				modalContent.style.opacity = "0";

				setTimeout(() => {
					modal.style.display = "none";
					document.body.style.overflow = "auto";
				}, 300);
			};
		}
	}

	// Interactive R.A.I.D. framework diagram
	function initRAIDDiagram() {
		const raidSteps = document.querySelectorAll(".raid-step");
		const timelineContents = document.querySelectorAll(".timeline-content");

		raidSteps.forEach((step, index) => {
			step.addEventListener("click", () => {
				// Add active state
				raidSteps.forEach((s) => s.classList.remove("active"));
				step.classList.add("active");

				// Animate connection lines
				const connections = document.querySelectorAll(".raid-connection");
				connections.forEach((conn, i) => {
					if (i <= index) {
						conn.classList.add("active");
					} else {
						conn.classList.remove("active");
					}
				});

				// Show corresponding timeline content
				timelineContents.forEach((content) =>
					content.classList.remove("active")
				);
				const targetTimeline = document.getElementById(`timeline-${index + 1}`);
				if (targetTimeline) {
					targetTimeline.classList.add("active");
				}
			});
		});

		// Show first timeline by default
		if (timelineContents.length > 0) {
			timelineContents[0].classList.add("active");
		}
	}

	// Typewriter effect for key phrases
	function initTypewriterEffect() {
		const typewriterElements = document.querySelectorAll(".typewriter");
		typewriterElements.forEach((element) => {
			const text = element.textContent;
			element.textContent = "";
			element.style.borderRight = "2px solid var(--bright)";

			let i = 0;
			const typeWriter = () => {
				if (i < text.length) {
					element.textContent += text.charAt(i);
					i++;
					setTimeout(typeWriter, 100);
				} else {
					element.style.borderRight = "none";
				}
			};

			// Start typewriter when element is visible
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						typeWriter();
						observer.unobserve(entry.target);
					}
				});
			});
			observer.observe(element);
		});
	}

	// Original modal functions
	function initModal() {
		const modal = document.getElementById("products-modal");
		const modalContent = document.querySelector(".modal-content");

		if (modal && modalContent) {
			// Basic modal opening
			window.openProductsModal = function () {
				modal.style.display = "block";
				document.body.style.overflow = "hidden";
			};

			// Basic modal closing
			window.closeProductsModal = function () {
				modal.style.display = "none";
				document.body.style.overflow = "auto";
			};

			// Close modal when clicking outside
			window.onclick = function (event) {
				if (event.target === modal) {
					closeProductsModal();
				}
			};

			// Close modal with Escape key
			document.addEventListener("keydown", function (event) {
				if (event.key === "Escape" && modal.style.display === "block") {
					closeProductsModal();
				}
			});
		}
	}

	function initAccordion() {
		// Accordion behavior for product sections
		const productSections = document.querySelectorAll(".product-section");
		productSections.forEach((section) => {
			const header = section.querySelector(".product-header");
			if (header) {
				header.addEventListener("click", () => {
					// Close other sections
					productSections.forEach((otherSection) => {
						if (otherSection !== section) {
							otherSection.classList.remove("expanded");
						}
					});
					// Toggle current section
					section.classList.toggle("expanded");
				});
			}
		});
	}

	function initModalSectionScrolling() {
		// Modal section scrolling functionality
		window.openModalToSection = function (sectionId) {
			openProductsModal();
			setTimeout(() => {
				const section = document.getElementById(sectionId);
				if (section) {
					section.scrollIntoView({ behavior: "smooth", block: "center" });
					section.style.background = "rgba(169, 214, 138, 0.1)";
					setTimeout(() => {
						section.style.background = "";
					}, 2000);
				}
			}, 300);
		};
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
		// Always initialize core features first (works on all browsers)
		initSmoothScrolling();
		initFocusManagement();
		initThemeDetection();
		initModal();
		initAccordion();
		initModalSectionScrolling();
		initRAIDDiagram();

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia && window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		// Initialize enhanced features progressively
		if (!prefersReducedMotion) {
			// Basic animations that work on most browsers
			initEnhancedHoverEffects();
			initDynamicColors();
			
			// Advanced features with fallbacks
			if (window.IntersectionObserver) {
				try {
					initScrollAnimations();
					initAnimatedCounters();
					initTypewriterEffect();
				} catch (error) {
					console.warn("Some animation features failed:", error);
				}
			}
			
			// Modern features with graceful degradation
			if (window.CSS && window.CSS.supports && window.CSS.supports('backdrop-filter', 'blur(10px)')) {
				try {
					initParticleEffects();
					initParallaxScrolling();
					initEnhancedModal();
				} catch (error) {
					console.warn("Some modern features failed:", error);
				}
			}
		}

		// Initialize utility features
		try {
			initPerformanceOptimizations();
			initAccessibilityFeatures();
			initErrorHandling();
			initAnalytics();
		} catch (error) {
			console.warn("Some utility features failed:", error);
		}

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
