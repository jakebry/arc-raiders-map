# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive keycard map for Arc Raiders game. Single-page vanilla JS application that shows players where to find keycards and which doors they open across 5 game maps. Also displays live in-game events from the MetaForge API on a home screen.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Leaflet.js (CDN), Vite (dev server), static deployment to Vercel.

## Development

### Local Development
```bash
# Start Vite dev server (includes API proxy to MetaForge)
npx vite

# Open browser
open http://localhost:5173
```

### Deploy to Vercel
```bash
# Only deploy when feature is complete or moving to next task
vercel deploy --prod --yes
```

**Important:** Develop locally first. Do NOT deploy after every change.

## Assets

All images and fonts are served from **Vercel Blob** — there are no local `images/` or `fonts/` directories in the repo.

- Blob base URL: `https://4avhgicb5hfji3xg.public.blob.vercel-storage.com`
- A `BLOB` constant is defined at the top of each JS file that references blob assets
- Blob URLs are public and don't require authentication — `.env.local` is only needed for uploading new blobs

## Architecture

### File Structure
```
index.html              — Single HTML file with home screen + map view screens
js/
  data.js               — Single source of truth for maps, keys, events, coordinates
  app.js                — Interactive map logic (Leaflet, markers, key selection)
  home.js               — Home screen: overhead map, event panel, MetaForge API
css/
  styles.css            — Entry point (imports below)
  variables.css         — CSS variables, @font-face declarations (fonts from Blob)
  layout.css            — Page layout, screens, home layout
  map.css               — Leaflet map, markers, inventory bar
  components.css        — Home screen components (cards, nodes, events)
docs/
  plans/                — Feature planning documents
vite.config.js          — Vite dev server config with MetaForge API proxy
vercel.json             — Vercel rewrite rules (proxies /api/arc-raiders/... to MetaForge)
```

### Key Concepts

**Leaflet.js with CRS.Simple**
- Uses pixel coordinates `[y, x]` not geographic `[lat, lng]`
- Maps are rendered as image overlays with pan/zoom
- Each map can have different dimensions (width/height/border in `MAPS`)

**Coordinate System**
- All coordinates in `js/data.js` are `[y, x]` in pixel space
- Border extension: Most maps have 400px blurred border added to original images
- Coordinates are relative to the full extended image (original + border)
- Original map content sits at `[border, border]` to `[height-border, width-border]`

**Multi-Level Maps (Stella Montis)**
- Has both upper and lower levels with separate images
- Wiki image files were **mislabeled** (upper/lower filenames are swapped)
- In `data.js`: `upper` config uses `lower_original.png`, `lower` config uses `upper_original.png`
- Fixed alignment offset: `{ x: -882, y: 328 }`
- Both layers load progressively: upper first, lower fades in
- Active level: 100% opacity, inactive: 25% opacity
- **All keys visible on both levels** (user preference, not a bug)
- Use `bringToFront()` to ensure active layer renders on top

**Space Station Maps**
- Dark background (`#000000`) instead of default (`#0a0a0f`)
- Feathered CSS mask edges via linear gradients
- Uses `.space-station` class on Leaflet container

**Live Events (Home Screen)**
- MetaForge API is proxied via Vite in dev and Vercel rewrites in prod
- `home.js` fetches `/api/arc-raiders/events-schedule` and displays active/upcoming events
- Event icons and images are served from Vercel Blob

### Data Structure

**MAPS array** — Map metadata
```javascript
{
  id: 'map_id',
  name: 'Display Name',
  image: `${BLOB}/images/maps/map.jpg`,
  preview: `${BLOB}/images/preview/preview.jpg`,
  width: 4896,    // Full image width including border
  height: 4540,   // Full image height including border
  border: 400     // Pixels of blurred extension on each side (0 for originals)
}
```

Multi-level maps add:
```javascript
levels: {
  upper: { image: `${BLOB}/images/maps/upper.png`, width: 5120, height: 3072 },
  lower: { image: `${BLOB}/images/maps/lower.png`, width: 4096, height: 3072 }
}
```

**KEYS array** — Keycard definitions
```javascript
{
  id: 'unique_id',
  map: 'map_id',
  name: 'Display Name',
  rarity: 'uncommon|rare|epic',
  coords: [y, x],           // Pixel coordinates on map image
  location: 'Description',
  doorImage: `${BLOB}/images/doors/...`,  // Optional
  icon: `${BLOB}/images/keys/...`,
  level: 'upper|lower'      // Optional, for multi-level maps
}
```

**RARITIES array** — Rarity metadata
```javascript
{ id: 'uncommon', label: 'Uncommon', color: '#4ade80' }
{ id: 'rare',     label: 'Rare',     color: '#60a5fa' }
{ id: 'epic',     label: 'Epic',     color: '#CD3197' }  // Note: #CD3197, not purple
```

### State Management

Global state variables in `app.js`:
- `currentMap` — Currently selected map object
- `currentRarity` — Active rarity filter (null = all)
- `selectedKey` — Currently selected key object
- `leafletMap` — Leaflet map instance
- `markers` — Active Leaflet markers array
- `mapOverlayUpper` / `mapOverlayLower` — Multi-level map layers
- `currentLevel` — Active level for multi-level maps

## Adding New Content

### Add a Keycard
1. Add entry to `KEYS` array in `js/data.js`
2. Upload the icon/door image to Vercel Blob if needed
3. Use image editor to find `[y, x]` pixel coordinates on map

### Add a Map
1. Upload map/preview images to Vercel Blob
2. Add entry to `MAPS` array in `js/data.js`
3. Add keys for that map to `KEYS` array

### Adjust Coordinates
1. Use "EXPORT COORDS" button in map view
2. Drag markers to correct positions
3. Click export — coordinates logged to console
4. Copy logged coordinates to `js/data.js`

## Styling Conventions

**Dark Tactical Theme**
- Background: `#0a0a0f` (or `#000000` for space stations)
- Text: `#c8c8d0` (muted), `#e8e8f0` (headings)
- Borders: `#222230`, `#2a2a35`
- Accent: `#4a6fa5` (blue)
- Rarity colors: green/blue/pink as CSS variables

**Animation**
- Use `0.25s ease` for smooth transitions
- Transform with `transform-origin` for proper scaling
- Opacity + scale for morphing effects (not width/height)
- Border thickness changes: use `border-width` transitions

**Inventory Slots**
- Thick bottom border (10px) when active/hover
- Concave corner at bottom-left via pseudo-element
- Radial gradient glow from `15% 85%` position
- All borders 2-3px except bottom which is 10px

## Common Patterns

**Rendering Flow**
1. User selects map → `enterMap(map)`
2. `initLeafletMap()` creates Leaflet instance
3. `renderInventory()` builds bottom key slots
4. `renderMarkers()` places pins on map
5. User clicks key → `selectKey(key)` zooms + shows detail

**Layer Management (Multi-Level)**
```javascript
// Always call bringToFront() after opacity changes
mapOverlayUpper.setOpacity(1.0);
mapOverlayLower.setOpacity(0.25);
mapOverlayUpper.bringToFront();  // Ensure active layer on top
```

**Marker States**
- Default: Small dot with square icon container
- Selected: Larger with label + door image
- Hover: Morphs to selected state via opacity/scale

## Known Issues & Quirks

- Stella Montis image files have swapped filenames (intentional workaround in code)
- Space station maps need special CSS masking for feathered edges
- All Stella Montis keys show on both levels (user preference, not a bug)
- Leaflet layer ordering is addition-based, use `bringToFront()` to reorder
- Border gradients don't transition smoothly — use opacity instead
