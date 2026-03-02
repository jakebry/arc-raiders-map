// js/app.js

import { MAPS, RARITIES, KEYS, getRarity, getUniqueKeys, getKeysForMap } from './data.js';

const BLOB = 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com';

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
const screenMap = document.getElementById('screen-map');
const mapCardsEl = document.getElementById('map-cards');
const btnBack = document.getElementById('btn-back');
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
        card.dataset.mapId = map.id;
        card.innerHTML = `
            <div class="map-card-img" style="background-image: url('${map.preview}')"></div>
            <div class="map-card-label">${map.name}</div>
        `;
        card.addEventListener('click', () => {
            // Only navigate on desktop, on mobile open drawer
            if (window.innerWidth <= 768) {
                // Ensure the global selectHomeMap function from home.js is called
                document.dispatchEvent(new CustomEvent('mobileMapSelected', { detail: { mapId: map.id } }));
            } else {
                enterMap(map);
            }
        });
        // Mobile double-tap to go straight to inspect
        let lastTap = 0;
        card.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                e.preventDefault();
                enterMap(map);
            }
            lastTap = now;
        });
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
        mapOffset = { x: -882, y: 328 };
    } else {
        mapOffset = { x: 0, y: 0 };
    }

    showScreen('screen-map');
    initLeafletMap(map);
    renderLevelToggle();
    renderInventory();
    renderMarkers();
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
        zoomControl: false,  // Disable default zoom control
        attributionControl: false,
        maxBoundsViscosity: 0.85  // Slightly elastic for smooth flyTo transitions
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
        // No max bounds for Stella Montis - allow free panning across both layers
        imageBounds = null;
    } else {
        // Add padding to max bounds so flyTo animations don't snap at edges
        var pad = Math.max(config.width, config.height) * 0.15;
        imageBounds = L.latLngBounds([[-pad, -pad], [config.height + pad, config.width + pad]]);
    }
    if (imageBounds) leafletMap.setMaxBounds(imageBounds);

    // Click on map background deselects the current key
    leafletMap.on('click', (e) => {
        if (selectedKey) {
            deselectKey();
        }
    });

    // Sync zoom slider when map zoom changes (trackpad scroll, pinch, etc.)
    leafletMap.on('zoomend', () => {
        updateZoomSlider();
        if (markers.length > 0) resolveMarkerCollisions();
    });
    leafletMap.on('moveend', () => {
        if (markers.length > 0) resolveMarkerCollisions();
    });

    // For Stella Montis, load upper first (default), then lower in background
    if (map.id === 'stella_montis' && map.levels) {
        // Load upper level first (default view)
        var upperConfig = map.levels.upper;
        var upperBounds = [[mapOffset.y, mapOffset.x], [upperConfig.height + mapOffset.y, upperConfig.width + mapOffset.x]];
        var upperOpacity = currentLevel === 'upper' ? 1.0 : 0.25;
        mapOverlayUpper = L.imageOverlay(upperConfig.image, upperBounds, { opacity: upperOpacity }).addTo(leafletMap);

        mapOverlay = mapOverlayUpper; // For compatibility

        // After upper loads, load lower level in background and fade in
        mapOverlayUpper.on('load', function () {
            var lowerConfig = map.levels.lower;
            var lowerOpacity = currentLevel === 'lower' ? 1.0 : 0.25;

            // Start with opacity 0, will fade in after loading
            mapOverlayLower = L.imageOverlay(lowerConfig.image, [[0, 0], [lowerConfig.height, lowerConfig.width]], { opacity: 0 }).addTo(leafletMap);

            // Fade in lower layer after it loads
            mapOverlayLower.on('load', function () {
                setTimeout(() => {
                    if (mapOverlayLower) {
                        mapOverlayLower.setOpacity(lowerOpacity);
                        // Upper is default, so bring it to front
                        if (currentLevel === 'upper' && mapOverlayUpper) {
                            mapOverlayUpper.bringToFront();
                        }
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
    var contentBounds;
    if (map.id === 'stella_montis' && map.levels) {
        // Combined bounds of both layers for proper centering
        var upperConfig = map.levels.upper;
        var lowerConfig = map.levels.lower;
        var minLat = Math.min(0, mapOffset.y);
        var minLng = Math.min(0, mapOffset.x);
        var maxLat = Math.max(lowerConfig.height, upperConfig.height + mapOffset.y);
        var maxLng = Math.max(lowerConfig.width, upperConfig.width + mapOffset.x);
        contentBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
    } else {
        contentBounds = L.latLngBounds(
            [map.border, map.border],
            [config.height - map.border, config.width - map.border]
        );
    }
    setTimeout(() => {
        leafletMap.invalidateSize();

        // Calculate minimum zoom to prevent black areas from showing
        var container = leafletMap.getContainer();
        var containerWidth = container.offsetWidth;
        var containerHeight = container.offsetHeight;
        var scaleNeeded = Math.max(containerWidth / config.width, containerHeight / config.height);
        var minZoom = Math.log2(scaleNeeded);

        // Allow zooming out a bit past the calculated minimum for smooth flyTo animations
        if (map.id === 'stella_montis') {
            leafletMap.setMinZoom(-3);
        } else {
            leafletMap.setMinZoom(minZoom - 0.5);
        }

        if (map.id === 'stella_montis') {
            // Manual center and zoom for Stella Montis - show full map
            leafletMap.setView([1800, 1700], -1.8);
        } else {
            leafletMap.fitBounds(contentBounds, { padding: [10, 10] });
        }

        // Update zoom slider to match initial zoom
        updateZoomSlider();

        // Render markers after map is ready
        renderMarkers();
    }, 100);
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

    // For Stella Montis with both layers visible, make active layer prominent
    if (currentMap.id === 'stella_montis' && mapOverlayUpper && mapOverlayLower) {
        // Active layer fully visible, inactive layer very faded
        if (level === 'upper') {
            mapOverlayUpper.setOpacity(1.0);
            mapOverlayLower.setOpacity(0.25);
            mapOverlayUpper.bringToFront();  // Bring active layer to top
        } else {
            mapOverlayUpper.setOpacity(0.25);
            mapOverlayLower.setOpacity(1.0);
            mapOverlayLower.bringToFront();  // Bring active layer to top
        }
    }

    // Re-render UI (don't call fitBounds to keep position)
    renderLevelToggle();
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

        // Sync hover with map marker
        slot.addEventListener('mouseenter', () => {
            const marker = markers.find(m => m.options.keyId === key.id);
            if (marker) {
                const markerEl = marker.getElement();
                if (markerEl) markerEl.classList.add('hotbar-hovered');
            }
        });
        slot.addEventListener('mouseleave', () => {
            const marker = markers.find(m => m.options.keyId === key.id);
            if (marker) {
                const markerEl = marker.getElement();
                if (markerEl) markerEl.classList.remove('hotbar-hovered');
            }
        });

        inventorySlotsEl.appendChild(slot);
    });
}

// --- Custom Zoom Control ---
const zoomSlider = document.getElementById('zoom-slider');
const zoomInBtn = document.querySelector('.zoom-in');
const zoomOutBtn = document.querySelector('.zoom-out');

function updateZoomSlider() {
    if (leafletMap && zoomSlider) {
        zoomSlider.value = leafletMap.getZoom();
    }
}

if (zoomSlider) {
    // Slider change updates map zoom
    zoomSlider.addEventListener('input', (e) => {
        if (leafletMap) {
            leafletMap.setZoom(parseFloat(e.target.value));
        }
    });
}

if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        if (leafletMap) {
            leafletMap.zoomIn(0.5);
        }
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        if (leafletMap) {
            leafletMap.zoomOut(0.5);
        }
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

// --- Markers ---
function renderMarkers() {
    // Remove old markers
    markers.forEach(m => m.remove());
    markers = [];

    const keys = getKeysForMap(currentMap.id, currentRarity, currentLevel);

    keys.forEach(key => {
        const rarity = getRarity(key.rarity);
        const isSelected = selectedKey && selectedKey.id === key.id;

        const markerIconHtml = `
                <div class="marker-dot" style="background-color: ${rarity.color}; box-shadow: 0 0 8px ${rarity.color};"></div>
                <div class="marker-icon-container" style="color: ${rarity.color}; border-color: ${rarity.color}; box-shadow: 0 0 12px ${rarity.color}, 0 2px 8px rgba(0, 0, 0, 0.6);">
                    <img class="marker-icon" src="${key.icon}" alt="${key.name}" style="filter: drop-shadow(0 0 3px ${rarity.color});">
                </div>`;

        const icon = L.divIcon({
            className: 'keycard-marker' + (isSelected ? ' selected' : ''),
            html: isSelected ? `
                <div class="marker-dot" style="background-color: ${rarity.color}; box-shadow: 0 0 8px ${rarity.color};"></div>
                <div class="marker-icon-container selected-icon-grow" style="color: ${rarity.color}; border-color: ${rarity.color}; --slot-color: ${rarity.color};">
                    <img class="marker-icon" src="${key.icon}" alt="${key.name}" style="filter: drop-shadow(0 0 3px ${rarity.color});">
                </div>
                <div class="marker-card-anchor">
                    <div class="marker-card">
                        <div class="marker-card-tags${rarity.id === 'epic' ? ' rarity-epic' : ''}">
                            <span class="marker-card-tag-box" style="background-color: ${rarity.color};"><img class="tag-key-icon" src="${BLOB}/images/icons/key.svg" alt="Key" style="transform: scaleX(-1); filter: ${rarity.id === 'epic' ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.05)'};"></span>
                            <span class="marker-card-tag-box" style="background-color: ${rarity.color};">KEY</span>
                            <span class="marker-card-tag-box" style="background-color: ${rarity.color};">${rarity.label.toUpperCase()}</span>
                        </div>
                        <div class="marker-card-title">${key.name}</div>
                        <div class="marker-card-body">
                            ${key.doorImage ? `<img class="marker-card-door" src="${key.doorImage}" alt="${key.name} door">` : ''}
                            <div class="marker-card-section">
                                <div class="marker-card-section-title">Description</div>
                                <div class="marker-card-section-text">${key.description}</div>
                            </div>
                            ${key.instructions ? `<div class="marker-card-section">
                                <div class="marker-card-section-title">Instructions</div>
                                <div class="marker-card-section-text instructions-text">${key.instructions}</div>
                            </div>` : ''}
                        </div>
                        <div class="marker-card-footer">
                            <span><img src="${BLOB}/images/icons/weight.svg" alt="Weight"> ${key.weight}</span>
                            <div class="footer-divider"></div>
                            <span><img src="${BLOB}/images/icons/currency.svg" alt="Value"> ${key.value}</span>
                        </div>
                    </div>
                </div>
            ` : markerIconHtml,
            iconSize: [45, 68],
            iconAnchor: [22.5, 68]
        });

        const marker = L.marker(key.coords, {
            icon,
            draggable: false,  // Markers locked in place
            keyId: key.id  // Store key ID for hover sync
        })
            .addTo(leafletMap)
            .on('click', () => selectKey(key))
            .on('mouseover', () => {
                // Highlight corresponding inventory slot
                const slots = document.querySelectorAll('.inventory-slot');
                const slotIndex = getUniqueKeys(currentMap.id, currentRarity, currentLevel)
                    .sort((a, b) => {
                        const rarityOrder = { 'uncommon': 0, 'rare': 1, 'epic': 2 };
                        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
                    })
                    .findIndex(k => k.id === key.id);
                if (slotIndex >= 0 && slots[slotIndex]) {
                    slots[slotIndex].classList.add('hotbar-hovered');
                }
            })
            .on('mouseout', () => {
                // Remove highlight from inventory slot
                const slots = document.querySelectorAll('.inventory-slot');
                slots.forEach(slot => slot.classList.remove('hotbar-hovered'));
            })

        markers.push(marker);
    });

    // Collision detection: offset overlapping icons
    resolveMarkerCollisions();
}

function resolveMarkerCollisions() {
    const markerPositions = markers.map(marker => {
        const pos = leafletMap.latLngToContainerPoint(marker.getLatLng());
        return { marker, pos, offsetX: 0 };
    });

    // Check each pair of markers
    for (let i = 0; i < markerPositions.length; i++) {
        for (let j = i + 1; j < markerPositions.length; j++) {
            const a = markerPositions[i];
            const b = markerPositions[j];

            const dx = b.pos.x - a.pos.x;
            const dy = b.pos.y - a.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If markers are too close (within 50px), offset them horizontally
            if (distance < 50 && Math.abs(dy) < 30) {
                const offset = 25;
                if (dx > 0) {
                    b.offsetX += offset;
                    a.offsetX -= offset;
                } else {
                    b.offsetX -= offset;
                    a.offsetX += offset;
                }
            }
        }
    }

    // Apply offsets
    markerPositions.forEach(({ marker, offsetX }) => {
        if (offsetX !== 0) {
            const el = marker.getElement();
            if (el) {
                const iconContainer = el.querySelector('.marker-icon-container');
                if (iconContainer) {
                    iconContainer.style.transform = `translateX(calc(-50% + ${offsetX}px))`;
                }
            }
        }
    });
}

// --- Key Selection ---
let preSelectView = null; // stores {center, zoom} before selection

function selectKey(key) {
    // If clicking the same key, deselect
    if (selectedKey && selectedKey.id === key.id) {
        deselectKey();
        return;
    }

    // Save current view for restoring on deselect
    if (!selectedKey) {
        preSelectView = {
            center: leafletMap.getCenter(),
            zoom: leafletMap.getZoom()
        };
    }

    selectedKey = key;

    // Zoom in slightly from current zoom, offset pin to center-left
    const currentZoom = leafletMap.getZoom();
    const targetZoom = Math.min(currentZoom + 0.3, leafletMap.getMaxZoom());
    const targetPoint = leafletMap.project(key.coords, targetZoom);
    // Shift so pin ends up ~30% from left edge (card opens right)
    const container = leafletMap.getContainer();
    const offsetX = container.offsetWidth * 0.15;
    targetPoint.x += offsetX;
    const targetLatLng = leafletMap.unproject(targetPoint, targetZoom);
    leafletMap.flyTo(targetLatLng, targetZoom, { duration: 0.5 });

    renderInventory();
    renderMarkers();
}

function deselectKey() {
    selectedKey = null;

    // Restore previous view
    if (preSelectView) {
        leafletMap.flyTo(preSelectView.center, preSelectView.zoom, { duration: 0.5 });
        preSelectView = null;
    }

    renderInventory();
    renderMarkers();
}

export { enterMap, renderMapCards };
