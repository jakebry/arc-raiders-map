// js/app.js

// --- State ---
let currentMap = null;        // currently selected map object
let currentRarity = null;     // currently active rarity filter (null = all)
let selectedKey = null;       // currently selected key object
let leafletMap = null;        // Leaflet map instance
let markers = [];             // active Leaflet markers on the map
let currentLevel = null;      // 'upper' or 'lower' for maps with levels, null otherwise
let mapOverlay = null;        // reference to the active Leaflet imageOverlay
let mapOverlayUpper = null;   // upper level overlay (for alignment)
let mapOverlayLower = null;   // lower level overlay (for alignment)
let mapOffset = { x: 0, y: 0 }; // offset for aligning multi-level maps

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

    // Set permanent offset for Stella Montis alignment
    if (map.id === 'stella_montis') {
        mapOffset = { x: 881, y: -328 };
    } else {
        mapOffset = { x: 0, y: 0 };
    }

    showScreen('screen-map');
    initLeafletMap(map);
    renderLevelToggle();
    renderAlignmentControls();
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

    // Add dark space background for Stella Montis (space station)
    const container = leafletMap.getContainer();
    if (map.id === 'stella_montis') {
        container.classList.add('space-station');
    } else {
        container.classList.remove('space-station');
    }

    var config = getCurrentImageConfig();

    // Set max bounds to the full image (prevents panning outside)
    // For Stella Montis, use expanded bounds to allow alignment adjustment
    var imageBounds;
    if (map.id === 'stella_montis') {
        // Expanded bounds to allow movement in all directions for alignment
        imageBounds = L.latLngBounds([[-1000, -1000], [config.height + 1000, config.width + 1000]]);
    } else {
        imageBounds = L.latLngBounds([[0, 0], [config.height, config.width]]);
    }
    leafletMap.setMaxBounds(imageBounds);

    // For Stella Montis, load upper first (default), then lower in background
    if (map.id === 'stella_montis' && map.levels) {
        // Load upper level first (default view)
        var upperConfig = map.levels.upper;
        var upperBounds = [[mapOffset.y, mapOffset.x], [upperConfig.height + mapOffset.y, upperConfig.width + mapOffset.x]];
        var upperOpacity = currentLevel === 'upper' ? 1.0 : 0.25;
        mapOverlayUpper = L.imageOverlay(upperConfig.image, upperBounds, { opacity: upperOpacity }).addTo(leafletMap);

        mapOverlay = mapOverlayUpper; // For compatibility

        // After upper loads, load lower level in background and fade in
        mapOverlayUpper.on('load', function() {
            var lowerConfig = map.levels.lower;
            var lowerOpacity = currentLevel === 'lower' ? 1.0 : 0.25;

            // Start with opacity 0, will fade in after loading
            mapOverlayLower = L.imageOverlay(lowerConfig.image, [[0, 0], [lowerConfig.height, lowerConfig.width]], { opacity: 0 }).addTo(leafletMap);

            // Fade in lower layer after it loads
            mapOverlayLower.on('load', function() {
                setTimeout(() => {
                    if (mapOverlayLower) {
                        mapOverlayLower.setOpacity(lowerOpacity);
                    }
                }, 100);
            });
        });
    } else {
        // Single layer map
        var bounds = [[0, 0], [config.height, config.width]];
        mapOverlay = L.imageOverlay(config.image, bounds).addTo(leafletMap);
    }

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

        // For Stella Montis, allow zooming out much further for alignment
        if (map.id === 'stella_montis') {
            leafletMap.setMinZoom(-3);
        } else {
            leafletMap.setMinZoom(minZoom);
        }

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

// --- Alignment Controls (for Stella Montis) ---
function renderAlignmentControls() {
    const container = document.getElementById('alignment-controls');
    if (!container) return;

    // Hide alignment controls now that offset is locked in
    // Uncomment the line below to re-enable alignment mode
    // if (currentMap && currentMap.id === 'stella_montis') {
    if (false) {
        container.style.display = 'flex';
        container.innerHTML = `
            <div style="display: flex; gap: 8px; align-items: center; background: rgba(20,20,28,0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid #333;">
                <span style="font-size: 11px; color: #888;">OFFSET:</span>
                <span style="font-size: 12px; color: #60a5fa; font-family: monospace;">X: ${mapOffset.x}</span>
                <span style="font-size: 12px; color: #60a5fa; font-family: monospace;">Y: ${mapOffset.y}</span>
                <button id="btn-reset-offset" style="margin-left: 8px; padding: 4px 8px; font-size: 10px; background: rgba(40,40,50,0.8); border: 1px solid #444; color: #aaa; cursor: pointer; border-radius: 3px;">RESET</button>
                <button id="btn-export-offset" style="padding: 4px 8px; font-size: 10px; background: rgba(30,50,80,0.8); border: 1px solid #4a6fa5; color: #7aa3d8; cursor: pointer; border-radius: 3px;">EXPORT</button>
            </div>
            <div style="font-size: 10px; color: #666; margin-left: 8px;">Use Arrow Keys to adjust</div>
        `;

        document.getElementById('btn-reset-offset').addEventListener('click', () => {
            mapOffset = { x: 0, y: 0 };
            switchLevel(currentLevel);
        });

        document.getElementById('btn-export-offset').addEventListener('click', () => {
            console.clear();
            console.log('=== STELLA MONTIS MAP OFFSET ===');
            console.log(`mapOffset = { x: ${mapOffset.x}, y: ${mapOffset.y} };`);
            console.log('\n=== Copy the above and send to Claude ===');
            alert('Offset exported to console! Press F12 to view.');
        });
    } else {
        container.style.display = 'none';
    }
}

// --- Keyboard Controls for Map Alignment ---
// Disabled now that alignment is locked in. Uncomment to re-enable alignment mode.
document.addEventListener('keydown', (e) => {
    if (true) return; // Alignment locked in
    if (!currentMap || currentMap.id !== 'stella_montis') return;

    const step = e.shiftKey ? 10 : 1; // Hold Shift for bigger steps
    let changed = false;

    switch(e.key) {
        case 'ArrowLeft':
            mapOffset.x -= step;
            changed = true;
            break;
        case 'ArrowRight':
            mapOffset.x += step;
            changed = true;
            break;
        case 'ArrowUp':
            mapOffset.y -= step;
            changed = true;
            break;
        case 'ArrowDown':
            mapOffset.y += step;
            changed = true;
            break;
    }

    if (changed) {
        e.preventDefault();

        // Update upper layer position
        if (mapOverlayUpper && currentMap.levels) {
            var upperConfig = currentMap.levels.upper;
            var upperBounds = [[mapOffset.y, mapOffset.x], [upperConfig.height + mapOffset.y, upperConfig.width + mapOffset.x]];

            // Remove and recreate with new bounds
            mapOverlayUpper.remove();
            mapOverlayUpper = L.imageOverlay(upperConfig.image, upperBounds, { opacity: 0.7 }).addTo(leafletMap);
            mapOverlay = mapOverlayUpper;
        }

        renderAlignmentControls();
        renderMarkers();
    }
});

// --- Level Switching ---
function switchLevel(level) {
    currentLevel = level;
    selectedKey = null;

    // For Stella Montis with both layers visible, make active layer prominent
    if (currentMap.id === 'stella_montis' && mapOverlayUpper && mapOverlayLower) {
        // Active layer fully visible, inactive layer very faded
        if (level === 'upper') {
            mapOverlayUpper.setOpacity(1.0);
            mapOverlayLower.setOpacity(0.25);
        } else {
            mapOverlayUpper.setOpacity(0.25);
            mapOverlayLower.setOpacity(1.0);
        }
    }

    // Re-render UI (don't call fitBounds to keep position)
    renderLevelToggle();
    renderAlignmentControls();
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
            <img class="inventory-slot-icon" src="${key.icon}" alt="${key.name}" style="filter: drop-shadow(0 0 4px ${rarity.color});">
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
                <div class="marker-label" style="color: ${rarity.color};">
                    <div class="marker-label-name">${key.name}</div>
                    ${key.doorImage ? `<img class="marker-label-image" src="${key.doorImage}" alt="${key.name} door">` : ''}
                </div>
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
