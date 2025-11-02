# EVR:RDY Website

Modern, static website built with Astro for the EVR:RDY Defensive Operations Group.

## 🚀 Tech Stack

- **Astro** - Static Site Generator
- **GitHub Pages** - Static hosting
- **GitHub Actions** - CI/CD deployment

## 📁 Project Structure

```
/
├── public/           # Static assets (images, JS, etc.)
├── src/
│   ├── assets/      # CSS and JavaScript source files
│   ├── components/  # Reusable Astro components
│   ├── layouts/     # Page layouts
│   └── pages/       # Site pages (routes)
├── resources/        # Resources content for dynamic loading
└── astro.config.mjs  # Astro configuration
```

## 🧞 Commands

| Command                | Action                                            |
| :--------------------- | :------------------------------------------------ |
| `npm install`          | Install dependencies                              |
| `npm run dev`          | Start dev server at `localhost:4321`              |
| `npm run build`        | Build production site to `./dist/`                |
| `npm run preview`      | Preview production build locally                  |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check`  |

## 🚢 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

### Manual Deployment

1. Build the site: `npm run build`
2. The built site is in `./dist/`
3. Deploy `./dist/` to your hosting provider

## 📝 Key Features

- ✅ Fully static output (100% GitHub Pages compatible)
- ✅ Modern UI/UX with glassmorphism effects
- ✅ Responsive design (mobile-first)
- ✅ Accessibility features (WCAG 2.1 AA)
- ✅ Team member modals
- ✅ Dynamic resources loading
- ✅ Google Drive integration with repository fallback

## 🌐 Custom Domain

Configured for `evrrdy.com` via GitHub Pages settings.

## 📄 License

© 2025 EVR:RDY Defensive Operations Group LLC
