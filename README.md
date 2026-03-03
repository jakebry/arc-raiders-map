# 🗺️ Arc Raiders — Interactive Map

[![Live Site](https://img.shields.io/badge/🌐_Live_Map-arc--raiders--maps.com-blue?style=for-the-badge)](https://arc-raiders-maps.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made with Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)

> A free, open-source, community-driven interactive map for **Arc Raiders** — find every keycard, trace every locked door, track live map events, and plan your runs.

---

## ✨ Features

- 🎮 **Live Map Events** — Real-time event tracking with countdown timers, difficulty ratings, and modifier details powered by MetaForge API
- 🔑 **Keycard Locations** — Every keycard marked with precise map coordinates
- 🚪 **Door Connections** — See which keycard opens which locked door
- 🗺️ **5 Full Game Maps** — Dam Battlegrounds, Spaceport, Buried City, Blue Gate, Stella Montis
- 🔍 **Pan & Zoom** — Smooth Leaflet.js-powered navigation with deep zoom
- 📱 **Responsive** — Works on desktop and mobile with adaptive layouts
- 🎚️ **Multi-level Support** — Upper/lower floor toggle for Stella Montis
- ⏳ **Upcoming Events** — See what's coming next with per-event icons and timers

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=flat-square&logo=leaflet&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

## 🏗️ Architecture

```
index.html          — Single-page app with home screen + map view
js/
  data.js           — All maps, keys, events, rarities (single source of truth)
  app.js            — Leaflet map, markers, inventory UI
  home.js           — Home screen orchestrator
  api.js            — MetaForge API integration
  utils.js          — Shared helpers (timers, SVG processing)
  ui/
    panel.js        — Side panel rendering
    mapNodes.js     — Home screen map nodes + event display
css/
  styles.css        — Import orchestrator
  variables.css     — CSS custom properties + fonts
  layout.css        — Page structure + grid
  map.css           — Leaflet overrides + map UI
  components.css    — Cards, markers, panels, events
```

All static assets (images, fonts, icons) are served from **Vercel Blob CDN** — no local asset files in the repo.

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server (includes MetaForge API proxy)
npx vite

# Build for production
npm run build
```

## 🤝 Contributing

Contributions are welcome! Whether it's adding missing keycard locations, fixing marker positions, or improving the UI — check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This is a **fan-made project** and is not affiliated with, endorsed by, or connected to **Embark Studios** or the Arc Raiders team. All game assets, names, and imagery are property of their respective owners.

---

<p align="center">
  <strong><a href="https://arc-raiders-maps.com">🌐 Open the Live Map</a></strong>
</p>
