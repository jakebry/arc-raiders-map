# GEMINI.md

This file provides guidance to Google Antigravity / Gemini when working with code in this repository.

## Project Overview

Interactive keycard map for Arc Raiders game. Single-page vanilla JS application that shows players where to find keycards and which doors they open across 5 game maps. Live site: https://arc-raiders-maps.com

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Leaflet.js (CDN), static deployment to Vercel (auto-deploys from `main` branch).

**IMPORTANT:** Never push directly to `main`. Always use feature branches. `main` = production.

## Development

```bash
python3 -m http.server 8000
open http://localhost:8000
```

## Architecture

### File Structure
- `index.html` — Single HTML file with two screens (map selection + map view)
- `js/data.js` — Single source of truth for maps, keys, coordinates, rarities, AND event data
- `js/app.js` — Application logic, Leaflet initialization, UI rendering
- `js/events.js` — Map events home screen: API fetching, timers, node rendering, side panel
- `css/styles.css` — Dark tactical theme styling
- `images/maps/*.{jpg,png}` — High-res map images
- `images/events/*.jpg` — Event card preview images (cropped from in-game screenshots)
- `images/map-selection-bg.png` — Overhead map for home screen (2850x1860)
- `images/preview/*.jpg` — Map preview thumbnails
- `images/keys/*.png` — Keycard icons
- `images/doors/**/*.{jpg,webp}` — Door location screenshots

### Two Screens
1. **screen-select** — Map Events home screen (overhead map with live event timers)
2. **screen-map** — Interactive Leaflet keycard map (the core feature)

## Current Feature Branch: `feature/map-events`

### What It Is
Replacing the simple map card grid homepage with an in-game style Map Selection screen — overhead map on the left with 5 interactive nodes, side panel card on the right showing live event details with countdown timers.

### Data Source
**MetaForge API** (no auth required):
```
GET https://metaforge.app/api/arc-raiders/events-schedule
```
Returns: `{ data: [{ name, map, icon, startTime, endTime }, ...] }`
- Events rotate in 1-hour blocks (timestamps in Unix ms)
- Fetch on page load + every 5 minutes
- Credit MetaForge in footer

### Map ID ↔ API Name Mapping
| API "map" value | Internal id |
|---|---|
| Dam | dam |
| Spaceport | spaceport |
| Buried City | buried_city |
| Blue Gate | blue_gate |
| Stella Montis | stella_montis |

### UX Rules
- **Hover to select** — hovering a map node selects it and updates the side panel. Stays selected until another node is hovered. Mobile: tap.
- **Always one selected** — default is Dam Battlegrounds
- **Side panel card** matches in-game style: event image, map name, event name, description, modifiers, difficulty pips, countdown timer, INSPECT button
- **INSPECT button** calls `enterMap(map)` to enter the keycard map
- **No event active** → show default map description
- **API down** → graceful fallback with defaults

### Event Screenshots Available (`images/events/`)
- dam-husk-graveyard.jpg, dam-matriarch.jpg, dam-electromagnetic-storm.jpg
- spaceport-hidden-bunker.jpg, spaceport-matriarch.jpg, spaceport-default.jpg
- buried-city-night-raid.jpg, buried-city-cold-snap.jpg
- blue-gate-electromagnetic-storm.jpg, blue-gate-default.jpg

For missing map+event combos, fall back to preview images (`images/preview/*.jpg`).

### Known Events
Husk Graveyard, Night Raid, Electromagnetic Storm, Hidden Bunker, Cold Snap, Matriarch, Harvester, Launch Tower Loot, Locked Gate, Bird City, Prospecting Probes, Lush Blooms (not in rotation), Uncovered Caches (not in rotation)

### Full briefing
See `docs/plans/map-events-briefing.md` for complete event descriptions, modifiers, and implementation details.

## Key Concepts

**Leaflet.js with CRS.Simple**
- Uses pixel coordinates `[y, x]` not geographic `[lat, lng]`
- Maps rendered as image overlays with pan/zoom
- Each map has different dimensions (width/height/border in `MAPS`)

**Coordinate System**
- All coords in `js/data.js` are `[y, x]` in pixel space
- Border extension: most maps have 400px blurred border
- Coordinates relative to full extended image

**Multi-Level Maps (Stella Montis)**
- Upper and lower levels with separate images
- Wiki files were **mislabeled** (filenames swapped — intentional workaround in code)
- Fixed alignment offset: `{ x: -882, y: 328 }`

## Data Structures

**MAPS array** — `js/data.js`
```javascript
{ id: 'dam', name: 'Dam Battlegrounds', image: 'images/maps/dam.jpg', preview: 'images/preview/dam.jpg', width: 4896, height: 4540, border: 400 }
```

**KEYS array** — `js/data.js`
```javascript
{ id: 'dam_surveillance', map: 'dam', name: 'Dam Surveillance Key', rarity: 'uncommon', coords: [2137, 2127], location: '...', doorImage: '...', icon: '...' }
```

**EVENT_DATA** — `js/data.js` — Static event descriptions and modifiers
**MAP_DEFAULTS** — `js/data.js` — Default descriptions when no event is active
**EVENT_IMAGES** — `js/data.js` — Mapping of map+event to image paths

## Styling

- Dark theme: `#0a0a0f` background, `#c8c8d0` text
- Orange/amber accents for event timers and active states
- Rarity colors: green (uncommon), blue (rare), pink (epic)
- Animations: `0.25s ease` transitions
- Pure vanilla CSS, no preprocessors

## Rules

1. **Never push to main** — use feature branches, merge via PR
2. **Vanilla JS only** — no frameworks, no build tools
3. **Don't break the keycard map** — the Leaflet map (screen-map) must always work
4. **Test locally first** — `python3 -m http.server 8000`
5. **Cache busting** — update `?v=XX` on script/css tags when modifying
