# Arc Raiders Keycard Map - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive, dark-themed single-page website where players select a map and key card to see exactly where the door is located, with zoom/pan map navigation.

**Architecture:** Single-page vanilla JS app with two screens (map selection and map view) toggled via JS. Leaflet.js renders the zoomable/draggable map image with colored marker pins. All map and key data is hardcoded in `js/data.js`. No backend, no database, no build step. Deployed as a static site to Vercel.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Leaflet.js (via CDN), high-res map images (placeholder images used initially — see Task 9 for swapping in real screenshots and refining pin coordinates).

---

## Key Data Reference

Before building, here is the source data for all keys. Coordinates are placeholder `[y, x]` values assuming a 4096×4096 image. These MUST be refined in Task 9 once real map images are in place.

### Rarity Colors
| Rarity   | Color Name | Hex       |
|----------|------------|-----------|
| Uncommon | Green      | `#4ade80` |
| Rare     | Blue       | `#60a5fa` |
| Epic     | Purple     | `#c084fc` |

### Keys by Map

**Dam Battlegrounds (5 keys)**
| Key Name                      | Rarity   | Door Location                              | Placeholder [y, x] |
|-------------------------------|----------|--------------------------------------------|---------------------|
| Dam Surveillance Key          | Uncommon | Water Treatment Control Room               | [900, 1200]         |
| Dam Staff Room Key            | Uncommon | Control Tower — Staff Quarters (lockers)   | [600, 2800]         |
| Dam Utility Key               | Uncommon | Utility Room (lower level)                 | [2400, 1800]        |
| Dam Testing Annex Key         | Rare     | Testing Annex — two doors inside           | [1800, 3200]        |
| Dam Control Center Tower Key  | Epic     | Control Tower — Upper Level Room           | [500, 2600]         |

**Spaceport (5 keys)**
| Key Name                        | Rarity   | Door Location                              | Placeholder [y, x] |
|---------------------------------|----------|--------------------------------------------|---------------------|
| Spaceport Trench Tower Key      | Uncommon | North & South Trench Towers (8 doors)      | [1400, 1600]        |
| Spaceport Warehouse Key         | Uncommon | Shipping Warehouse — Upper Floors          | [2600, 3000]        |
| Spaceport Ground Control Key    | Uncommon | Control Tower A6 — Upper Level             | [800, 2200]         |
| Spaceport Container Storage Key | Rare     | Container Storage — Top Floor Red Door     | [1000, 3400]        |
| Spaceport Outskirts Bunker Key  | Rare     | Outskirts Bunker                           | [3200, 600]         |

**Buried City (4 keys)**
| Key Name                          | Rarity   | Door Location                              | Placeholder [y, x] |
|-----------------------------------|----------|--------------------------------------------|---------------------|
| Buried City Residential Master Key| Uncommon | Multiple Apartment Doors                   | [1600, 1400]        |
| Buried City JKV Employee Card     | Uncommon | Space Travel Building — Fourth Floor       | [2000, 2600]        |
| Buried City Hospital Key          | Rare     | Hospital — Third Floor Room                | [1200, 3000]        |
| Buried City Town Hall Key         | Epic     | Town Hall — Main Door                      | [800, 1800]         |

**Blue Gate (5 keys)**
| Key Name                          | Rarity   | Door Location                              | Placeholder [y, x] |
|-----------------------------------|----------|--------------------------------------------|---------------------|
| Blue Gate Village Key             | Uncommon | Old Village Building Entrance              | [2200, 1000]        |
| Blue Gate Patrol Car Key          | Uncommon | Patrol Car — Rear Door (quest reward key)  | [3000, 2400]        |
| Blue Gate Communication Tower Key | Rare     | Communication Tower — Locked Room          | [600, 2800]         |
| Blue Gate Cellar Key              | Rare     | Village Building — Cellar Door             | [2400, 1200]        |
| Blue Gate Confiscation Room Key   | Epic     | Tunnel Networks — Confiscation Room        | [1800, 3200]        |

**Stella Montis (4 keys)**
| Key Name                            | Rarity   | Door Location                              | Placeholder [y, x] |
|-------------------------------------|----------|--------------------------------------------|---------------------|
| Stella Montis Assembly Admin Key    | Uncommon | Assembly Hallway — Locked Door             | [1200, 1800]        |
| Stella Montis Medical Storage Key   | Uncommon | Medical Storage Area                       | [2600, 2200]        |
| Stella Montis Archives Key          | Rare     | Seat Vault Area — Tunnel End Door          | [900, 3000]         |
| Stella Montis Security Checkpoint Key| Epic    | Security Checkpoint Access Point           | [1600, 600]         |

**Special Key (all maps)**
| Key Name        | Rarity | Door Location                                        | Placeholder [y, x] |
|-----------------|--------|------------------------------------------------------|---------------------|
| Raider Hatch Key| Rare   | Extraction hatches scattered around each map         | shown per-map       |

> **Note on Raider Hatch Key:** This key is crafted or purchased (not looted). It opens extraction hatches at multiple locations per map. For each map, include 2–3 hatch pin locations. These are approximate and should be refined in Task 9.

---

### Task 1: Project Setup & HTML Skeleton

**Files:**
- Create: `index.html`
- Create: `css/styles.css` (empty)
- Create: `js/data.js` (empty)
- Create: `js/app.js` (empty)

**Step 1: Create index.html**

This is the single HTML file for the entire app. It includes both screens (map selection and map view). Only one is visible at a time — JS toggles them. Leaflet CSS/JS loaded via CDN. No build step.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Arc Raiders — Keycard Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="css/styles.css" />
</head>
<body>

    <!-- SCREEN 1: Map Selection -->
    <div id="screen-select" class="screen active">
        <div class="select-header">
            <h1>ARC RAIDERS</h1>
            <p class="subtitle">KEYCARD MAP</p>
        </div>
        <div id="map-cards" class="map-grid">
            <!-- Cards injected by JS from data.js -->
        </div>
    </div>

    <!-- SCREEN 2: Map View -->
    <div id="screen-map" class="screen">
        <div id="map-ui-overlay">
            <button id="btn-back" class="btn-back">← BACK</button>
            <div id="filter-bar" class="filter-bar">
                <!-- Rarity filter pills injected by JS -->
            </div>
        </div>
        <div id="map-container">
            <div id="leaflet-map"></div>
        </div>
        <div id="key-panel" class="key-panel">
            <div id="key-list">
                <!-- Key list items injected by JS -->
            </div>
            <div id="key-detail" class="key-detail hidden">
                <!-- Populated when a key is selected -->
            </div>
        </div>
    </div>

    <script src="js/data.js"></script>
    <script src="js/app.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</body>
</html>
```

**Step 2: Verify the file renders**

Open `index.html` in a browser. You should see a blank dark page (once styles are added) or just the raw HTML structure. No errors in the browser console.

**Step 3: Commit**

```bash
git add index.html css/styles.css js/data.js js/app.js
git commit -m "feat: project skeleton with HTML structure and empty asset files"
```

---

### Task 2: Hardcode All Map & Key Data

**Files:**
- Modify: `js/data.js`

**Step 1: Write the data file**

This is the single source of truth for the entire app. Every map, every key, all coordinates live here. Nothing else in the app should define game data.

```javascript
// js/data.js
// All coordinates are [y, x] in pixel space assuming 4096x4096 map images.
// These are PLACEHOLDERS — refine in Task 9 once real map images are in place.

const MAPS = [
    { id: 'dam',          name: 'Dam Battlegrounds',  image: 'images/maps/dam.jpg',          preview: 'images/preview/dam.jpg' },
    { id: 'spaceport',    name: 'Spaceport',          image: 'images/maps/spaceport.jpg',    preview: 'images/preview/spaceport.jpg' },
    { id: 'buried_city',  name: 'Buried City',        image: 'images/maps/buried_city.jpg',  preview: 'images/preview/buried_city.jpg' },
    { id: 'blue_gate',    name: 'Blue Gate',          image: 'images/maps/blue_gate.jpg',    preview: 'images/preview/blue_gate.jpg' },
    { id: 'stella_montis',name: 'Stella Montis',      image: 'images/maps/stella_montis.jpg',preview: 'images/preview/stella_montis.jpg' }
];

const RARITIES = [
    { id: 'uncommon', label: 'Uncommon', color: '#4ade80' },
    { id: 'rare',     label: 'Rare',     color: '#60a5fa' },
    { id: 'epic',     label: 'Epic',     color: '#c084fc' }
];

const KEYS = [
    // --- Dam Battlegrounds ---
    { id: 'dam_surveillance',     map: 'dam',          name: 'Dam Surveillance Key',          rarity: 'uncommon', coords: [900, 1200],  location: 'Water Treatment Control Room' },
    { id: 'dam_staff_room',       map: 'dam',          name: 'Dam Staff Room Key',            rarity: 'uncommon', coords: [600, 2800],  location: 'Control Tower — Staff Quarters' },
    { id: 'dam_utility',          map: 'dam',          name: 'Dam Utility Key',               rarity: 'uncommon', coords: [2400, 1800], location: 'Utility Room (Lower Level)' },
    { id: 'dam_testing_annex',    map: 'dam',          name: 'Dam Testing Annex Key',         rarity: 'rare',     coords: [1800, 3200], location: 'Testing Annex — Two Doors Inside' },
    { id: 'dam_control_tower',    map: 'dam',          name: 'Dam Control Center Tower Key',  rarity: 'epic',     coords: [500, 2600],  location: 'Control Tower — Upper Level Room' },

    // --- Spaceport ---
    { id: 'sp_trench_tower',      map: 'spaceport',    name: 'Spaceport Trench Tower Key',    rarity: 'uncommon', coords: [1400, 1600], location: 'North & South Trench Towers' },
    { id: 'sp_warehouse',         map: 'spaceport',    name: 'Spaceport Warehouse Key',       rarity: 'uncommon', coords: [2600, 3000], location: 'Shipping Warehouse — Upper Floors' },
    { id: 'sp_ground_control',    map: 'spaceport',    name: 'Spaceport Ground Control Key',  rarity: 'uncommon', coords: [800, 2200],  location: 'Control Tower A6 — Upper Level' },
    { id: 'sp_container_storage', map: 'spaceport',    name: 'Spaceport Container Storage Key',rarity: 'rare',    coords: [1000, 3400], location: 'Container Storage — Top Floor Red Door' },
    { id: 'sp_outskirts_bunker',  map: 'spaceport',    name: 'Spaceport Outskirts Bunker Key',rarity: 'rare',     coords: [3200, 600],  location: 'Outskirts Bunker' },

    // --- Buried City ---
    { id: 'bc_residential',       map: 'buried_city',  name: 'Buried City Residential Master Key', rarity: 'uncommon', coords: [1600, 1400], location: 'Multiple Apartment Doors' },
    { id: 'bc_jkv',               map: 'buried_city',  name: 'Buried City JKV Employee Card',      rarity: 'uncommon', coords: [2000, 2600], location: 'Space Travel Building — Fourth Floor' },
    { id: 'bc_hospital',          map: 'buried_city',  name: 'Buried City Hospital Key',           rarity: 'rare',     coords: [1200, 3000], location: 'Hospital — Third Floor Room' },
    { id: 'bc_town_hall',         map: 'buried_city',  name: 'Buried City Town Hall Key',          rarity: 'epic',     coords: [800, 1800],  location: 'Town Hall — Main Door' },

    // --- Blue Gate ---
    { id: 'bg_village',           map: 'blue_gate',    name: 'Blue Gate Village Key',              rarity: 'uncommon', coords: [2200, 1000], location: 'Old Village Building Entrance' },
    { id: 'bg_patrol_car',        map: 'blue_gate',    name: 'Blue Gate Patrol Car Key',           rarity: 'uncommon', coords: [3000, 2400], location: 'Patrol Car — Rear Door' },
    { id: 'bg_comm_tower',        map: 'blue_gate',    name: 'Blue Gate Communication Tower Key',  rarity: 'rare',     coords: [600, 2800],  location: 'Communication Tower — Locked Room' },
    { id: 'bg_cellar',            map: 'blue_gate',    name: 'Blue Gate Cellar Key',               rarity: 'rare',     coords: [2400, 1200], location: 'Village Building — Cellar Door' },
    { id: 'bg_confiscation',      map: 'blue_gate',    name: 'Blue Gate Confiscation Room Key',    rarity: 'epic',     coords: [1800, 3200], location: 'Tunnel Networks — Confiscation Room' },

    // --- Stella Montis ---
    { id: 'sm_assembly',          map: 'stella_montis',name: 'Stella Montis Assembly Admin Key',   rarity: 'uncommon', coords: [1200, 1800], location: 'Assembly Hallway — Locked Door' },
    { id: 'sm_medical',           map: 'stella_montis',name: 'Stella Montis Medical Storage Key',  rarity: 'uncommon', coords: [2600, 2200], location: 'Medical Storage Area' },
    { id: 'sm_archives',          map: 'stella_montis',name: 'Stella Montis Archives Key',         rarity: 'rare',     coords: [900, 3000],  location: 'Seat Vault Area — Tunnel End Door' },
    { id: 'sm_security',          map: 'stella_montis',name: 'Stella Montis Security Checkpoint Key',rarity: 'epic',   coords: [1600, 600],  location: 'Security Checkpoint Access Point' },

    // --- Special: Raider Hatch Key (multiple pins per map) ---
    { id: 'hatch_dam_1',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [1400, 800],  location: 'Extraction Hatch — Swamp Edge' },
    { id: 'hatch_dam_2',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [3000, 2000], location: 'Extraction Hatch — East Ruins' },
    { id: 'hatch_sp_1',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [500, 1000],  location: 'Extraction Hatch — Launch Pad Area' },
    { id: 'hatch_sp_2',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3400, 2800], location: 'Extraction Hatch — South Terminal' },
    { id: 'hatch_bc_1',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [600, 2200],  location: 'Extraction Hatch — Market Square' },
    { id: 'hatch_bc_2',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [3200, 800],  location: 'Extraction Hatch — Sand Dunes' },
    { id: 'hatch_bg_1',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [1000, 3400], location: 'Extraction Hatch — Mountain Ridge' },
    { id: 'hatch_bg_2',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2800, 600],  location: 'Extraction Hatch — Underground Exit' },
    { id: 'hatch_sm_1',           map: 'stella_montis',name: 'Raider Hatch Key',               rarity: 'rare', coords: [400, 2400],  location: 'Extraction Hatch — Assembly Roof' },
    { id: 'hatch_sm_2',           map: 'stella_montis',name: 'Raider Hatch Key',               rarity: 'rare', coords: [3000, 1400], location: 'Extraction Hatch — Lower Tunnels' }
];

// Helper: get rarity object by id
function getRarity(rarityId) {
    return RARITIES.find(r => r.id === rarityId);
}

// Helper: get keys for a specific map, optionally filtered by rarity
function getKeysForMap(mapId, rarityId = null) {
    return KEYS.filter(k => k.map === mapId && (!rarityId || k.rarity === rarityId));
}

// Helper: get unique key names for a map (collapses Raider Hatch duplicates)
function getUniqueKeyNames(mapId, rarityId = null) {
    const keys = getKeysForMap(mapId, rarityId);
    const seen = new Set();
    return keys.filter(k => {
        if (seen.has(k.name)) return false;
        seen.add(k.name);
        return true;
    });
}
```

**Step 2: Verify no syntax errors**

Open `index.html` in a browser. Open the browser console (F12 → Console). You should see zero errors related to data.js.

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat: hardcode all map and key data with placeholder coordinates"
```

---

### Task 3: Map Selection Screen (Landing Page)

**Files:**
- Modify: `js/app.js`
- Modify: `css/styles.css`

**Step 1: Write app.js — map selection logic**

This renders the map selection cards from `MAPS` data and handles clicking into a map.

```javascript
// js/app.js

// --- State ---
let currentMap = null;        // currently selected map object
let currentRarity = null;     // currently active rarity filter (null = all)
let selectedKey = null;       // currently selected key object
let leafletMap = null;        // Leaflet map instance
let markers = [];             // active Leaflet markers on the map

// --- DOM References ---
const screenSelect = document.getElementById('screen-select');
const screenMap    = document.getElementById('screen-map');
const mapCardsEl   = document.getElementById('map-cards');
const btnBack      = document.getElementById('btn-back');
const filterBarEl  = document.getElementById('filter-bar');
const keyListEl    = document.getElementById('key-list');
const keyDetailEl  = document.getElementById('key-detail');
const leafletMapEl = document.getElementById('leaflet-map');

// --- Screen Switchers ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- Map Selection Screen ---
function renderMapCards() {
    mapCardsEl.innerHTML = '';
    MAPS.forEach(map => {
        const card = document.createElement('div');
        card.className = 'map-card';
        card.innerHTML = `
            <div class="map-card-img" style="background-image: url('${map.preview}')"></div>
            <div class="map-card-label">${map.name}</div>
        `;
        card.addEventListener('click', () => enterMap(map));
        mapCardsEl.appendChild(card);
    });
}

// --- Enter a Map ---
function enterMap(map) {
    currentMap = map;
    currentRarity = null;
    selectedKey = null;
    showScreen('screen-map');
    initLeafletMap(map);
    renderFilterBar();
    renderKeyList();
}

// --- Back Button ---
btnBack.addEventListener('click', () => {
    if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
    }
    showScreen('screen-select');
});

// --- Init on page load ---
document.addEventListener('DOMContentLoaded', () => {
    renderMapCards();
});
```

**Step 2: Add placeholder preview images**

Create 5 simple colored placeholder images (one per map) so the cards have something to show. These can be 400×300 solid color images created with any tool, or even just rely on the CSS background-color fallback. For now, just ensure the cards render with the map name visible even without images.

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: map selection screen renders cards from data and switches screens"
```

---

### Task 4: Leaflet Map View

**Files:**
- Modify: `js/app.js` — add `initLeafletMap()` function

**Step 1: Add the Leaflet initialization function to app.js**

Append this below the existing code in app.js (before the DOMContentLoaded listener, or after — just keep it organized). This sets up Leaflet with a simple CRS (no geographic projection) so a single large image is the map.

```javascript
// --- Leaflet Map ---
const MAP_SIZE = 4096; // assumed pixel size of map images (square)

function initLeafletMap(map) {
    if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
    }

    leafletMap = L.map('leaflet-map', {
        crs: L.CRS.Simple,
        center: [MAP_SIZE / 2, MAP_SIZE / 2],
        zoom: 0,
        minZoom: -2,
        maxZoom: 3,
        zoomControl: true,
        attributionControl: false
    });

    L.imageOverlay(map.image, [[0, 0], [MAP_SIZE, MAP_SIZE]]).addTo(leafletMap);

    leafletMap.setView([MAP_SIZE / 2, MAP_SIZE / 2], 0);

    renderMarkers();
}
```

**Step 2: Add a placeholder map image**

Place a single 4096×4096 solid dark gray image at `images/maps/dam.jpg` (or any map id) to verify the map layer renders. You can create one with any image editor or use the OS screenshot tool cropped and resized.

**Step 3: Verify**

Open the site, click any map card. You should see a dark gray square that you can zoom into and drag around. No pins yet — that's next.

**Step 4: Commit**

```bash
git add js/app.js images/maps/
git commit -m "feat: Leaflet map view initializes and renders image layer"
```

---

### Task 5: Rarity Filters & Key List Panel

**Files:**
- Modify: `js/app.js` — add `renderFilterBar()` and `renderKeyList()`

**Step 1: Add filter and key list rendering to app.js**

```javascript
// --- Rarity Filter Bar ---
function renderFilterBar() {
    filterBarEl.innerHTML = '';

    // "All" pill
    const allPill = document.createElement('button');
    allPill.className = 'filter-pill' + (currentRarity === null ? ' active' : '');
    allPill.textContent = 'ALL';
    allPill.addEventListener('click', () => {
        currentRarity = null;
        selectedKey = null;
        renderFilterBar();
        renderKeyList();
        renderMarkers();
    });
    filterBarEl.appendChild(allPill);

    // One pill per rarity
    RARITIES.forEach(rarity => {
        const pill = document.createElement('button');
        pill.className = 'filter-pill' + (currentRarity === rarity.id ? ' active' : '');
        pill.style.setProperty('--pill-color', rarity.color);
        pill.textContent = rarity.label.toUpperCase();
        pill.addEventListener('click', () => {
            currentRarity = rarity.id;
            selectedKey = null;
            renderFilterBar();
            renderKeyList();
            renderMarkers();
        });
        filterBarEl.appendChild(pill);
    });
}

// --- Key List Panel ---
function renderKeyList() {
    keyListEl.innerHTML = '';
    keyDetailEl.classList.add('hidden');

    const keys = getUniqueKeyNames(currentMap.id, currentRarity);

    keys.forEach(key => {
        const rarity = getRarity(key.rarity);
        const item = document.createElement('div');
        item.className = 'key-item' + (selectedKey && selectedKey.name === key.name ? ' active' : '');
        item.style.setProperty('--key-color', rarity.color);
        item.innerHTML = `
            <span class="key-item-dot"></span>
            <span class="key-item-name">${key.name}</span>
        `;
        item.addEventListener('click', () => selectKey(key));
        keyListEl.appendChild(item);
    });
}
```

**Step 2: Verify**

Open the site, click a map. You should see the filter pills (ALL, UNCOMMON, RARE, EPIC) and a list of key names below the map. Clicking a filter pill should change the list. No zoom-to-pin yet — that's Task 6.

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: rarity filter pills and key list panel render and filter correctly"
```

---

### Task 6: Pin Rendering & Key Selection Logic

**Files:**
- Modify: `js/app.js` — add `renderMarkers()` and `selectKey()`

**Step 1: Add marker and selection logic to app.js**

```javascript
// --- Markers ---
function renderMarkers() {
    // Remove old markers
    markers.forEach(m => m.remove());
    markers = [];

    const keys = getKeysForMap(currentMap.id, currentRarity);

    keys.forEach(key => {
        const rarity = getRarity(key.rarity);
        const isSelected = selectedKey && selectedKey.id === key.id;

        const icon = L.divIcon({
            className: 'keycard-marker' + (isSelected ? ' selected' : ''),
            html: `<div class="marker-dot" style="background-color: ${rarity.color}; box-shadow: 0 0 8px ${rarity.color};"></div>`,
            iconSize: [isSelected ? 24 : 16, isSelected ? 24 : 16],
            iconAnchor: [isSelected ? 12 : 8, isSelected ? 12 : 8]
        });

        const marker = L.marker(key.coords, { icon })
            .addTo(leafletMap)
            .on('click', () => selectKey(key));

        markers.push(marker);
    });
}

// --- Key Selection ---
function selectKey(key) {
    selectedKey = key;

    // Zoom and pan to the selected key
    leafletMap.flyTo(key.coords, 2, { duration: 0.6 });

    // Show detail popup
    const rarity = getRarity(key.rarity);
    keyDetailEl.innerHTML = `
        <div class="key-detail-header">
            <span class="key-detail-dot" style="background-color: ${rarity.color};"></span>
            <span class="key-detail-name">${key.name}</span>
        </div>
        <div class="key-detail-rarity" style="color: ${rarity.color};">${rarity.label.toUpperCase()}</div>
        <div class="key-detail-location">${key.location}</div>
    `;
    keyDetailEl.classList.remove('hidden');

    // Re-render list and markers to update active states
    renderKeyList();
    renderMarkers();
}
```

**Step 2: Verify**

Open the site, enter a map. You should see colored dots on the map. Click a dot or a key name in the list — the map should fly/zoom to it, the detail panel should appear, and the selected marker should grow larger. Clicking a different key switches selection.

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: pins render on map, key selection zooms to door and shows detail panel"
```

---

### Task 7: Full Dark Tactical Styling

**Files:**
- Modify: `css/styles.css`

**Step 1: Write the full stylesheet**

This is where the site gets its Arc Raiders feel. Dark backgrounds, glowing accents, tactical UI chrome.

```css
/* css/styles.css */

/* --- Reset & Base --- */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #0a0a0f;
    color: #c8c8d0;
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    letter-spacing: 0.05em;
    user-select: none;
    -webkit-user-select: none;
}

/* --- Screens --- */
.screen {
    position: absolute;
    inset: 0;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.screen.active {
    display: flex;
    opacity: 1;
}

/* =============================================
   SCREEN 1: MAP SELECTION
   ============================================= */
#screen-select {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
        radial-gradient(ellipse at 50% 0%, rgba(30, 30, 45, 0.8) 0%, transparent 70%),
        #0a0a0f;
    padding: 40px 20px;
}

.select-header {
    text-align: center;
    margin-bottom: 48px;
}
.select-header h1 {
    font-size: 2.8rem;
    font-weight: 700;
    letter-spacing: 0.35em;
    color: #e8e8f0;
    text-shadow: 0 0 40px rgba(100, 140, 255, 0.2);
}
.select-header .subtitle {
    font-size: 0.95rem;
    letter-spacing: 0.6em;
    color: #555;
    margin-top: 8px;
}

.map-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    max-width: 900px;
    width: 100%;
}

.map-card {
    background: #131318;
    border: 1px solid #222230;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
    display: flex;
    flex-direction: column;
}
.map-card:hover {
    border-color: #4a6fa5;
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(74, 111, 165, 0.25);
}
.map-card-img {
    width: 100%;
    aspect-ratio: 16 / 10;
    background-size: cover;
    background-position: center;
    background-color: #1a1a22; /* fallback if no image */
}
.map-card-label {
    padding: 14px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: #b8b8c8;
    text-transform: uppercase;
    border-top: 1px solid #1e1e28;
}

/* =============================================
   SCREEN 2: MAP VIEW
   ============================================= */
#screen-map {
    flex-direction: row;
}

/* --- Map Container (takes remaining space) --- */
#map-container {
    flex: 1;
    position: relative;
    min-width: 0;
}
#leaflet-map {
    width: 100%;
    height: 100%;
    background: #0a0a0f;
}

/* --- Top UI Overlay (back button + filters) --- */
#map-ui-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: linear-gradient(to bottom, rgba(10, 10, 15, 0.85) 0%, transparent 100%);
    pointer-events: none;
}
#map-ui-overlay > * {
    pointer-events: auto;
}

.btn-back {
    background: rgba(20, 20, 28, 0.8);
    border: 1px solid #333340;
    color: #999;
    padding: 6px 14px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.82rem;
    letter-spacing: 0.1em;
    transition: border-color 0.2s, color 0.2s;
}
.btn-back:hover {
    border-color: #4a6fa5;
    color: #fff;
}

/* --- Rarity Filter Pills --- */
.filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.filter-pill {
    background: rgba(20, 20, 28, 0.85);
    border: 1px solid #333340;
    color: #777;
    padding: 5px 14px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    transition: all 0.2s;
}
.filter-pill:hover {
    border-color: var(--pill-color, #4a6fa5);
    color: var(--pill-color, #fff);
}
.filter-pill.active {
    border-color: var(--pill-color, #4a6fa5);
    color: var(--pill-color, #fff);
    background: rgba(20, 20, 28, 0.95);
    box-shadow: 0 0 10px color-mix(in srgb, var(--pill-color, #4a6fa5) 30%, transparent);
}

/* --- Key Panel (right side) --- */
#key-panel {
    width: 240px;
    min-width: 240px;
    background: rgba(12, 12, 18, 0.92);
    border-left: 1px solid #1e1e28;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

#key-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
}
#key-list::-webkit-scrollbar { width: 4px; }
#key-list::-webkit-scrollbar-track { background: transparent; }
#key-list::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 2px; }

.key-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.15s;
}
.key-item:hover {
    background: rgba(74, 111, 165, 0.1);
}
.key-item.active {
    background: rgba(74, 111, 165, 0.18);
    border-left: 3px solid var(--key-color);
}
.key-item-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--key-color);
    box-shadow: 0 0 6px var(--key-color);
    flex-shrink: 0;
}
.key-item-name {
    font-size: 0.82rem;
    color: #aaa;
    line-height: 1.3;
}
.key-item.active .key-item-name {
    color: #fff;
}

/* --- Key Detail (bottom of panel when a key is selected) --- */
#key-detail {
    border-top: 1px solid #1e1e28;
    padding: 18px;
    background: rgba(8, 8, 12, 0.95);
}
#key-detail.hidden {
    display: none;
}
.key-detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}
.key-detail-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 8px currentColor;
}
.key-detail-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #e0e0e8;
}
.key-detail-rarity {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    margin-bottom: 8px;
}
.key-detail-location {
    font-size: 0.82rem;
    color: #888;
    line-height: 1.4;
}

/* --- Leaflet Overrides --- */
.leaflet-container {
    background: #0a0a0f;
}
.leaflet-control-zoom {
    background: rgba(20, 20, 28, 0.85) !important;
    border-color: #2a2a35 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
    border-radius: 6px !important;
}
.leaflet-control-zoom a {
    color: #999 !important;
    border-bottom-color: #2a2a35 !important;
    line-height: 28px !important;
}
.leaflet-control-zoom a:hover {
    background: rgba(74, 111, 165, 0.2) !important;
    color: #fff !important;
}

/* --- Markers --- */
.keycard-marker {
    display: flex;
    align-items: center;
    justify-content: center;
}
.marker-dot {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.15);
    animation: pulse 2s infinite;
}
.keycard-marker.selected .marker-dot {
    border-color: rgba(255,255,255,0.5);
    animation: pulse-selected 1.5s infinite;
    width: 100%;
    height: 100%;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.6; }
}
@keyframes pulse-selected {
    0%, 100% { opacity: 1; box-shadow: 0 0 12px currentColor; }
    50%      { opacity: 0.8; box-shadow: 0 0 20px currentColor; }
}
```

**Step 2: Verify visually**

Open the site. The selection screen should be dark with glowing card hover effects. Entering a map should show the tactical UI — dark panel on the right, filter pills at the top, pulsing colored dots on the map. Check that everything is readable and the vibe feels right.

**Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: full dark tactical stylesheet — selection screen, map view, pins, panel"
```

---

### Task 8: Mobile Responsiveness

**Files:**
- Modify: `css/styles.css` — append mobile media queries
- Modify: `index.html` — minor structural tweak for mobile key panel

**Step 1: Append mobile styles to styles.css**

On mobile, the key panel slides up from the bottom as a collapsible drawer. The map takes the full screen.

```css
/* --- Mobile --- */
@media (max-width: 700px) {
    .map-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    #screen-map {
        flex-direction: column;
    }

    #map-container {
        flex: 1;
        min-height: 0;
    }

    #key-panel {
        width: 100%;
        min-width: unset;
        max-height: 45vh;
        border-left: none;
        border-top: 1px solid #1e1e28;
        overflow-y: auto;
        flex-direction: column;
    }

    #key-list {
        max-height: 200px;
    }

    #map-ui-overlay {
        padding: 8px 12px;
    }

    .select-header h1 {
        font-size: 1.8rem;
    }
}

@media (max-width: 400px) {
    .map-grid {
        grid-template-columns: 1fr;
    }
}
```

**Step 2: Verify on mobile**

Open the site in a browser and use DevTools to simulate a phone viewport (e.g. 375px wide). The map cards should stack, and on the map view the key panel should sit below the map. Verify scrolling and usability.

**Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: mobile-responsive layout — key panel moves below map on small screens"
```

---

### Task 9: Swap In Real Map Images & Refine Pin Coordinates

**Files:**
- Replace: `images/maps/*.jpg` — high-res map screenshots from the game
- Replace: `images/preview/*.jpg` — cropped/resized previews (400×300) for map cards
- Modify: `js/data.js` — update all `coords` values to match actual door positions on real images

**Step 1: Obtain map images**

Source high-res map screenshots from the game or from community resources. Each image should be as high-res as possible (ideally 4096px on the longest side). Save them as:
- `images/maps/dam.jpg`
- `images/maps/spaceport.jpg`
- `images/maps/buried_city.jpg`
- `images/maps/blue_gate.jpg`
- `images/maps/stella_montis.jpg`

Create preview crops (400×300) for the selection screen cards in `images/preview/`.

**Step 2: Update MAP_SIZE if needed**

If your images are not exactly 4096×4096, update the `MAP_SIZE` constant in `app.js` to match the actual image pixel dimensions. All images should be the same size, or each map object in `MAPS` can have its own `size` property.

**Step 3: Refine pin coordinates**

Open each map image in an image viewer that shows pixel coordinates (any image editor). For each key, find the door location visually and note the `[y, x]` pixel coordinates. Update `js/data.js` with the real values.

This is a manual process — go map by map, key by key.

**Step 4: Verify**

Load each map in the browser. Zoom in on each pin and confirm it's sitting on the correct door. Adjust any that are off.

**Step 5: Commit**

```bash
git add images/ js/data.js
git commit -m "feat: add real map images and refine all pin coordinates"
```

---

### Task 10: Deploy to Vercel

**Files:**
- None — just a deploy command

**Step 1: Deploy**

Run the Vercel deploy from this project. Vercel will detect it as a static site (no build step needed) and serve `index.html` as the root.

**Step 2: Verify production**

Open the deployed URL on both desktop and mobile. Run through the full flow:
1. See map selection screen
2. Click each map — map loads, pins appear
3. Click rarity filters — list and pins update
4. Click a key — map flies to pin, detail panel appears
5. Back button returns to map selection

**Step 3: Commit any final tweaks and tag**

```bash
git tag v1.0.0
```

---

## Post-Launch Notes

- **Adding a new key:** Just add one entry to the `KEYS` array in `js/data.js`. Place the pin coordinate by checking the image in an editor. Done.
- **Adding a new map:** Add to `MAPS`, add the image files, add the keys for that map. No code changes needed beyond the data file.
- **Raider Hatch pin locations:** These are approximate and community-sourced. Update them as players report more accurate positions.
