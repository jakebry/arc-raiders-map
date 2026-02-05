// js/app.js

// --- State ---
let currentMap = null;        // currently selected map object
let currentRarity = null;     // currently active rarity filter (null = all)
let selectedKey = null;       // currently selected key object
let leafletMap = null;        // Leaflet map instance
let markers = [];             // active Leaflet markers on the map
let currentLevel = null;      // 'upper' or 'lower' for maps with levels, null otherwise
let mapOverlay = null;        // reference to the active Leaflet imageOverlay

// --- DOM References ---
const screenSelect = document.getElementById('screen-select');
const screenMap    = document.getElementById('screen-map');
const mapCardsEl   = document.getElementById('map-cards');
const btnBack      = document.getElementById('btn-back');
const btnExport    = document.getElementById('btn-export');
const filterBarEl  = document.getElementById('filter-bar');
const inventorySlotsEl = document.getElementById('inventory-slots');
const leafletMapEl = document.getElementById('leaflet-map');

// --- Helpers ---
function getCurrentImageConfig() {
    if (currentMap.levels && currentLevel) {
        return currentMap.levels[currentLevel];
    }
    return { image: currentMap.image, width: currentMap.width, height: currentMap.height };
}

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
    currentLevel = map.levels ? 'upper' : null;
    showScreen('screen-map');
    initLeafletMap(map);
    renderLevelToggle();
    renderFilterBar();
    renderInventory();
}

// --- Leaflet Map ---
function initLeafletMap(map) {
    if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
    }

    leafletMap = L.map('leaflet-map', {
        crs: L.CRS.Simple,
        zoom: 0,
        minZoom: -5,  // Will be overridden dynamically
        maxZoom: 3,
        zoomControl: true,
        attributionControl: false,
        maxBoundsViscosity: 1.0  // Hard bounds (not elastic)
    });

    var config = getCurrentImageConfig();

    // Set max bounds to the full image (prevents panning outside)
    var imageBounds = L.latLngBounds([[0, 0], [config.height, config.width]]);
    leafletMap.setMaxBounds(imageBounds);

    mapOverlay = L.imageOverlay(config.image, [[0, 0], [config.height, config.width]]).addTo(leafletMap);

    // Fit the original map content (inside the blurred border) to the viewport.
    // Short delay ensures the container has rendered and has a valid size.
    var contentBounds = L.latLngBounds(
        [map.border, map.border],
        [config.height - map.border, config.width - map.border]
    );
    setTimeout(() => {
        leafletMap.invalidateSize();

        // Calculate minimum zoom to prevent black areas from showing
        var container = leafletMap.getContainer();
        var containerWidth = container.offsetWidth;
        var containerHeight = container.offsetHeight;
        var scaleNeeded = Math.max(containerWidth / config.width, containerHeight / config.height);
        var minZoom = Math.log2(scaleNeeded);
        leafletMap.setMinZoom(minZoom);

        leafletMap.fitBounds(contentBounds, { padding: [10, 10] });
    }, 100);
}

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
        renderInventory();
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
            renderInventory();
            renderMarkers();
        });
        filterBarEl.appendChild(pill);
    });
}

// --- Level Toggle (Stella Montis upper/lower) ---
function renderLevelToggle() {
    const el = document.getElementById('level-toggle');
    el.innerHTML = '';
    if (!currentMap || !currentMap.levels) return;

    ['upper', 'lower'].forEach(level => {
        const btn = document.createElement('button');
        btn.className = 'filter-pill' + (currentLevel === level ? ' active' : '');
        btn.style.setProperty('--pill-color', '#7a9cc6');
        btn.textContent = level.toUpperCase();
        btn.addEventListener('click', () => switchLevel(level));
        el.appendChild(btn);
    });
}

// --- Level Switching ---
function switchLevel(level) {
    currentLevel = level;
    selectedKey = null;

    // Swap the map overlay
    if (mapOverlay) mapOverlay.remove();
    var config = getCurrentImageConfig();

    // Update max bounds for new image dimensions
    var imageBounds = L.latLngBounds([[0, 0], [config.height, config.width]]);
    leafletMap.setMaxBounds(imageBounds);

    mapOverlay = L.imageOverlay(config.image, [[0, 0], [config.height, config.width]]).addTo(leafletMap);

    // Recalculate minimum zoom for new image dimensions
    var container = leafletMap.getContainer();
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight;
    var scaleNeeded = Math.max(containerWidth / config.width, containerHeight / config.height);
    var minZoom = Math.log2(scaleNeeded);
    leafletMap.setMinZoom(minZoom);

    // Re-fit to new content bounds
    var contentBounds = L.latLngBounds(
        [currentMap.border, currentMap.border],
        [config.height - currentMap.border, config.width - currentMap.border]
    );
    leafletMap.fitBounds(contentBounds, { padding: [10, 10] });

    // Re-render everything
    renderLevelToggle();
    renderFilterBar();
    renderInventory();
    renderMarkers();
}

// --- Inventory Bar ---
function renderInventory() {
    inventorySlotsEl.innerHTML = '';

    const keys = getUniqueKeys(currentMap.id, currentRarity, currentLevel);

    // Sort by rarity: uncommon, rare, epic
    const rarityOrder = { 'uncommon': 0, 'rare': 1, 'epic': 2 };
    keys.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

    keys.forEach(key => {
        const rarity = getRarity(key.rarity);
        const slot = document.createElement('div');
        slot.className = 'inventory-slot' + (selectedKey && selectedKey.name === key.name ? ' active' : '');
        slot.style.setProperty('--slot-color', rarity.color);
        slot.innerHTML = `
            <img class="inventory-slot-icon" src="images/keys/placeholder.svg" alt="${key.name}">
            <div class="inventory-slot-rarity"></div>
        `;
        slot.addEventListener('click', () => selectKey(key));
        slot.title = key.name;
        inventorySlotsEl.appendChild(slot);
    });
}

// --- Back Button ---
btnBack.addEventListener('click', () => {
    if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
    }
    showScreen('screen-select');
});

// --- Export Coordinates Button ---
btnExport.addEventListener('click', () => {
    console.clear();
    console.log('=== CURRENT COORDINATES ===\n');

    KEYS.forEach(key => {
        console.log(`{ id: '${key.id}', coords: [${key.coords[0]}, ${key.coords[1]}] },`);
    });

    console.log('\n=== Copy the above and paste to update data.js ===');
    alert('Coordinates exported to console! Press F12 to view.');
});

// --- Markers ---
function renderMarkers() {
    // Remove old markers
    markers.forEach(m => m.remove());
    markers = [];

    const keys = getKeysForMap(currentMap.id, currentRarity, currentLevel);

    keys.forEach(key => {
        const rarity = getRarity(key.rarity);
        const isSelected = selectedKey && selectedKey.id === key.id;

        const icon = L.divIcon({
            className: 'keycard-marker' + (isSelected ? ' selected' : ''),
            html: `
                <div class="marker-dot" style="background-color: ${rarity.color}; box-shadow: 0 0 8px ${rarity.color};"></div>
                <div class="marker-label" style="color: ${rarity.color};">${key.name}</div>
            `,
            iconSize: [isSelected ? 24 : 16, isSelected ? 24 : 16],
            iconAnchor: [isSelected ? 12 : 8, isSelected ? 12 : 8]
        });

        const marker = L.marker(key.coords, {
            icon,
            draggable: true  // Make markers draggable
        })
            .addTo(leafletMap)
            .on('click', () => selectKey(key))
            .on('dragend', (e) => {
                const newPos = e.target.getLatLng();
                const newCoords = [Math.round(newPos.lat), Math.round(newPos.lng)];

                // Update the key object in memory
                key.coords = newCoords;

                // Log to console for easy copying
                console.log(`{ id: '${key.id}', coords: [${newCoords[0]}, ${newCoords[1]}] }`);

                // If this key is selected, update the detail panel
                if (selectedKey && selectedKey.id === key.id) {
                    selectedKey.coords = newCoords;
                }
            });

        markers.push(marker);
    });
}

// --- Key Selection ---
function selectKey(key) {
    selectedKey = key;

    // Zoom and pan to the selected key
    leafletMap.flyTo(key.coords, 2, { duration: 0.6 });

    // Re-render inventory and markers to update active states
    renderInventory();
    renderMarkers();
}

// --- Init on page load ---
document.addEventListener('DOMContentLoaded', () => {
    renderMapCards();
});
