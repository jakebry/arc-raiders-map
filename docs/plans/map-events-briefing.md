# Map Events Home Screen — Full Briefing for Claude Code

## What This Feature Is
We're replacing the simple map card grid homepage with an in-game style Map Selection screen. It looks like the actual Arc Raiders map selection UI — overhead map on the left with interactive nodes, side panel card on the right showing the currently selected map's live event details with countdown timers.

## What's Already Built (on feature/map-events branch)
- `js/events.js` — Full event system: API fetching, timers, node rendering, side panel updates
- `css/styles.css` — Dark atmospheric styling with orange/amber accents added at the bottom
- `index.html` — Updated screen-select with new layout, loads events.js
- `js/data.js` — Added EVENT_DATA, MAP_DEFAULTS, EVENT_IMAGES, API_MAP_NAMES constants
- `js/app.js` — Modified DOMContentLoaded to call initEventScreen() with renderMapCards() fallback
- `images/map-selection-bg.png` — Cropped overhead map from in-game screenshot (2850x1860)
- `images/events/` — 10 cropped event card images

## Data Source
**MetaForge API** (no auth, free, fast):
```
GET https://metaforge.app/api/arc-raiders/events-schedule
```
Returns: `{ data: [{ name: "Night Raid", map: "Buried City", icon: "url", startTime: 1770818400000, endTime: 1770822000000 }, ...] }`
- Events rotate in 1-hour blocks
- Fetched on page load + every 5 minutes
- Credit MetaForge in footer

## Map ID ↔ API Name Mapping
| API name | Internal ID |
|---|---|
| Dam | dam |
| Spaceport | spaceport |
| Buried City | buried_city |
| Blue Gate | blue_gate |
| Stella Montis | stella_montis |

## Key UX Details
1. **Hover to select** — hovering a map node selects it, side panel updates. Stays selected until you hover another node. On mobile: tap.
2. **Always one selected** — default is Dam Battlegrounds
3. **Side panel card** matches in-game style: event image, map name, event name, description, modifiers, difficulty pips, countdown timer, INSPECT button
4. **INSPECT button** calls existing `enterMap(map)` to go to the keycard map
5. **No event active** → show default map description
6. **API down** → graceful fallback, show defaults

## Event Screenshots Available (images/events/)
- dam-husk-graveyard.jpg, dam-matriarch.jpg, dam-electromagnetic-storm.jpg
- spaceport-hidden-bunker.jpg, spaceport-matriarch.jpg, spaceport-default.jpg
- buried-city-night-raid.jpg, buried-city-cold-snap.jpg
- blue-gate-electromagnetic-storm.jpg, blue-gate-default.jpg

For missing combos, fall back to map preview images (images/preview/*.jpg).

## Known Events
Husk Graveyard, Night Raid, Electromagnetic Storm, Hidden Bunker, Cold Snap, Matriarch, Harvester, Launch Tower Loot, Locked Gate, Bird City, Prospecting Probes, Lush Blooms (not in rotation), Uncovered Caches (not in rotation)

## Existing Codebase (DO NOT BREAK)
- `js/app.js` — Leaflet map, enterMap(), showScreen(), renderMapCards(), inventory, markers
- `js/data.js` — MAPS array, RARITIES, KEYS array with all keycard data
- The Leaflet interactive map (screen-map) must work exactly as before
- Pure vanilla JS, no frameworks, no build tools

## Node Positions on Background Image
Approximate % positions (left, top) on the map-selection-bg.png:
- Spaceport: 22%, 18%
- Buried City: 16%, 50%
- Dam Battlegrounds: 48%, 52%
- Blue Gate: 65%, 48%
- Stella Montis: 68%, 20%

These may need tweaking visually.

## What Still Needs Work
- Visual polish and tweaking to match the in-game aesthetic more closely
- Node positions may need adjustment
- Mobile responsiveness testing
- More event screenshots (Jake will capture these in-game over time)
- Some event descriptions (Harvester, Launch Tower Loot, Locked Gate, Bird City, Prospecting Probes) are approximations — update when we get real in-game text
