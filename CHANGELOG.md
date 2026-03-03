# Changelog

## [Unreleased]

### Changed
- Migrated all assets (images, fonts) to Vercel Blob; removed local `images/` and `fonts/` directories
- Added `BLOB` constant to JS files to eliminate repetitive blob base URLs
- Switched dev server from Python http.server to Vite (includes MetaForge API proxy)
- Removed dead `renderFilterBar()` function from app.js

### Added
- Live map events home screen with MetaForge API integration
- Upcoming events panel with per-event icons, timers, and difficulty display
- Mobile-responsive drawer for event details

## [1.0.0] — 2026-02-11

### Added
- Interactive Leaflet.js map with pan & zoom
- Keycard and locked door markers with connections
- 5 game maps: Dam Battlegrounds, Spaceport, Buried City, Blue Gate, Stella Montis
- Multi-level support for Stella Montis
- Map selector sidebar
- Responsive mobile layout
- Deployed to Vercel
