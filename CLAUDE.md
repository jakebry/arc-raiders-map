# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive keycard map for Arc Raiders game. Single-page vanilla JS application that shows players where to find keycards and which doors they open across 5 game maps.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Leaflet.js (CDN), static deployment to Vercel.

## Development

### Local Development
```bash
# Start local server (Python 3)
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

### Deploy to Vercel
```bash
# Only deploy when feature is complete or moving to next task
vercel deploy --prod --yes
```

**Important:** Develop locally first. Do NOT deploy after every change.

## Architecture

### File Structure
- `index.html` - Single HTML file with two screens (map selection + map view)
- `js/data.js` - **Single source of truth** for all maps, keys, coordinates, rarities
- `js/app.js` - Application logic, Leaflet initialization, UI rendering
- `css/styles.css` - Dark tactical theme styling
- `images/maps/*.{jpg,png}` - High-res map images
- `images/keys/*.png` - Keycard icon images
- `images/doors/**/*.{jpg,webp}` - Door location screenshots organized by map

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
- **All keys visible on both levels** (no level filtering by design)
- Use `bringToFront()` to ensure active layer renders on top

**Space Station Maps**
- Dark background (`#000000`) instead of default (`#0a0a0f`)
- Feathered CSS mask edges via linear gradients
- Uses `.space-station` class on Leaflet container

### Data Structure

**MAPS array** - Map metadata
```javascript
{
  id: 'map_id',
  name: 'Display Name',
  image: 'path/to/full/map.jpg',
  preview: 'path/to/preview.jpg',
  width: 4896,    // Full image width including border
  height: 4540,   // Full image height including border
  border: 400     // Pixels of blurred extension on each side (0 for originals)
}
```

Multi-level maps add:
```javascript
levels: {
  upper: { image: 'path/to/upper.png', width: 5120, height: 3072 },
  lower: { image: 'path/to/lower.png', width: 4096, height: 3072 }
}
```

**KEYS array** - Keycard definitions
```javascript
{
  id: 'unique_id',
  map: 'map_id',
  name: 'Display Name',
  rarity: 'uncommon|rare|epic',
  coords: [y, x],           // Pixel coordinates on map image
  location: 'Description',
  doorImage: 'path/to/door.jpg',  // Optional
  icon: 'path/to/icon.png',
  level: 'upper|lower'      // Optional, for multi-level maps
}
```

**RARITIES array** - Rarity metadata
```javascript
{ id: 'uncommon', label: 'Uncommon', color: '#4ade80' }
{ id: 'rare',     label: 'Rare',     color: '#60a5fa' }
{ id: 'epic',     label: 'Epic',     color: '#CD3197' }  // Note: #CD3197, not purple
```

### State Management

Global state variables in `app.js`:
- `currentMap` - Currently selected map object
- `currentRarity` - Active rarity filter (null = all)
- `selectedKey` - Currently selected key object
- `leafletMap` - Leaflet map instance
- `markers` - Active Leaflet markers array
- `mapOverlayUpper` / `mapOverlayLower` - Multi-level map layers
- `currentLevel` - Active level for multi-level maps

## Adding New Content

### Add a Keycard
1. Add entry to `KEYS` array in `js/data.js`
2. Use image editor to find `[y, x]` pixel coordinates on map
3. Optionally add door image to `images/doors/[map_name]/`

### Add a Map
1. Add entry to `MAPS` array in `js/data.js`
2. Add map image to `images/maps/`
3. Add preview image to `images/preview/`
4. Add keys for that map to `KEYS` array

### Adjust Coordinates
1. Use "EXPORT COORDS" button in map view
2. Drag markers to correct positions
3. Click export - coordinates logged to console
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
- Border gradients don't transition smoothly - use opacity instead

## Memory/Notes

Additional project-specific notes available in Claude Code project memory.
