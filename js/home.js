// js/home.js — Home screen logic (map overview + side panel + events)

import { MAPS, EVENT_DATA, MAP_DEFAULTS, API_MAP_NAMES, getRarity, getUniqueKeys } from './data.js';
import { enterMap, renderMapCards } from './app.js';

// --- State ---
let selectedMapId = 'dam';
let panelFading = false;
let sidePanelOpenedAt = 0;
let currentEvents = {}; // Map of mapId -> event object
let timerInterval = null;
let eventFetchInterval = null;
let showingEventDetails = null; // 'MAIN', 'MINOR', or null

const MAIN_EVENT_NAMES = [
    'Night Raid',
    'Electromagnetic Storm',
    'Cold Snap',
    'Locked Gate',
    'Hidden Bunker',
    'Hurricane'
];

// --- Helpers ---
// Cache for dynamically recolored yellow SVG variants (exact hex)
const ICON_YELLOW_CACHE = new Map(); // originalSrc -> blobUrl

async function getYellowVariant(src) {
    if (!src) return null;
    if (ICON_YELLOW_CACHE.has(src)) return ICON_YELLOW_CACHE.get(src);
    try {
        const res = await fetch(src, { cache: 'no-store' });
        const text = await res.text();
        const yellow = '#febb12';
        let edited = text
            // style rules: fill/stroke white → yellow
            .replace(/fill\s*:\s*(?:#fff(?:fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*1(?:\.0+)?\s*\))/gi, `fill: ${yellow}`)
            .replace(/stroke\s*:\s*(?:#fff(?:fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*1(?:\.0+)?\s*\))/gi, `stroke: ${yellow}`)
            // attributes: fill/stroke="white/#fff" → yellow
            .replace(/fill=("|')(?:#fff(?:fff)?|white)("|')/gi, `fill="${yellow}"`)
            .replace(/stroke=("|')(?:#fff(?:fff)?|white)("|')/gi, `stroke="${yellow}"`);
        const blob = new Blob([edited], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        ICON_YELLOW_CACHE.set(src, url);
        return url;
    } catch (e) {
        console.warn('Yellow variant failed for', src, e);
        return null;
    }
}

function setIconSrc(imgEl, url) {
    if (!imgEl || !url) return;
    if (!imgEl.dataset.originalSrc) imgEl.dataset.originalSrc = url;
    imgEl.src = url;
}
// --- Helpers ---

function getMapById(id) {
    return MAPS.find(m => m.id === id);
}

// Double-click (desktop) or double-tap (mobile) to immediately inspect a map
function addDoubleActivate(el, mapId) {
    el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const map = getMapById(mapId);
        if (map) enterMap(map);
    });
    let lastTap = 0;
    el.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            e.preventDefault();
            const map = getMapById(mapId);
            if (map) enterMap(map);
        }
        lastTap = now;
    });
}

/**
 * Get the best image for a map + event name combo.
 * Fallback chain: specific event image → map default image → map preview
 */
function getEventImage(mapId, eventName) {
    if (eventName) {
        const eventImages = {
            'Bird City': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Bird%20City.jpg',
            'Cold Snap': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Cold%20Snap.jpg',
            'Electromagnetic Storm': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/ElectroMagnetic%20Storm.jpg',
            'Harvester': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Harvester.jpg',
            'Hidden Bunker': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Hidden%20Bunker.jpg',
            'Hurricane': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Hurricane.jpg',
            'Husk Graveyard': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Husk%20Graveyard.jpg',
            'Launch Tower Loot': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Launch%20Tower%20Loot.jpg',
            'Locked Gate': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Locked%20Gate.jpg',
            'Lush Blooms': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Lush%20Blooms.jpg',
            'Matriarch': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Matriarch.jpg',
            'Night Raid': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Night%20Raid.jpg',
            'Prospecting Probes': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Prospecting%20Probes.jpg',
            'Uncovered Caches': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/UncoveredCaches.jpg'
        };
        if (eventImages[eventName]) return eventImages[eventName];
    }

    const mapDefaults = {
        'dam': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Dam%20Battlegrounds.jpg',
        'spaceport': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Spaceport.jpg',
        'blue_gate': 'https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/Blue%20Gate.jpg'
    };
    if (mapDefaults[mapId]) return mapDefaults[mapId];

    return `https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/preview/${mapId}.jpg`;
}

function getMainEventIcon(eventName) {
    if (!eventName) return null;
    const nameMap = {
        'Cold Snap': 'arc_map_icons_Cold Snap Icon.svg',
        'Electromagnetic Storm': 'arc_map_icons_ElectroMagnetic Strorm Icon.svg',
        'Harvester': 'arc_map_icons_Harvester Icon.svg',
        'Hidden Bunker': 'arc_map_icons_Hidden Bunker Icon.svg',
        'Hurricane': 'Hurricane in circle.svg',
        'Husk Graveyard': 'arc_map_icons_Husk Graveyard Icon.svg',
        'Launch Tower Loot': 'LaunchTowerLoot Circle Icon_Launch Tower Loot Icon.svg',
        'Locked Gate': 'arc_map_icons_Locked Gate Icon.svg',
        'Lush Blooms': 'arc_map_icons_Lush Blooms Icon.svg',
        'Matriarch': 'arc_map_icons_Matriarch Icon.svg',
        'Night Raid': 'arc_map_icons_Night Raid Icon.svg',
        'Prospecting Probes': 'arc_map_icons_Prospecting Probes Icon.svg',
        'Bird City': 'arc_map_icons_Bird City Icon.svg',
        'Uncovered Caches': 'UncoveredCaches_Uncovered Caches Icon.svg'
    };
    const filename = nameMap[eventName];
    // Force cache bust to guarantee updated SVGs load
    const cacheBust = typeof window !== 'undefined' ? `?v=${Date.now()}` : '';
    if (filename) return `https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/icons/${filename}${cacheBust}`;

    const kebab = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/icons/${kebab}.svg${cacheBust}`;
}

function getMinorEventIcon(eventName) {
    if (!eventName) return null;
    const nameMap = {
        'Cold Snap': 'ColdSnap.svg',
        'Electromagnetic Storm': 'ElectromagneticStorm.svg',
        'Harvester': 'Harvester.svg',
        'Hidden Bunker': 'HiddenBunker.svg',
        'Hurricane': 'Hurricane white icon.svg',
        'Husk Graveyard': 'HuskGraveyard.svg',
        'Launch Tower Loot': 'Launch Tower Loot White Logo.svg',
        'Lush Blooms': 'LushBlooms.svg',
        'Matriarch': 'MatriarchIcon.svg',
        'Night Raid': 'NightRaid.svg',
        'Prospecting Probes': 'ProspectingProbes.svg',
        'Bird City': 'Bird City.svg',
        'Uncovered Caches': 'UncoveredCachesWhite Icon_Uncovered Caches Icon.svg'
    };
    const filename = nameMap[eventName];
    if (filename) return `https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/icons/White%20Icons/${filename}`;

    const kebab = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `https://4avhgicb5hfji3xg.public.blob.vercel-storage.com/images/events/icons/White%20Icons/${kebab}.svg`;
}

function formatTime(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- API Client ---

async function fetchEvents() {
    const now = Date.now();
    const newEvents = {};

    try {
        // Try fetching live data
        let resultJson;
        try {
            // Use a relative same-origin path. In dev, Vite proxies this.
            // On Vercel, a rewrite proxies it. Avoids CORS everywhere.
            const response = await fetch('/api/arc-raiders/events-schedule');
            if (!response.ok) throw new Error('Network response was not ok');
            resultJson = await response.json();
        } catch (err) {
            console.error('Live API failed:', err);
            return;
        }

        if (resultJson.data && Array.isArray(resultJson.data)) {
            // Group by map
            const mapEvents = {};
            resultJson.data.forEach(evt => {
                const internalMapId = API_MAP_NAMES[evt.map];
                if (internalMapId) {
                    if (!mapEvents[internalMapId]) mapEvents[internalMapId] = [];
                    mapEvents[internalMapId].push(evt);
                }
            });

            // Select best Main and best Minor event for each map
            Object.keys(mapEvents).forEach(mapId => {
                const events = mapEvents[mapId];
                const mains = events.filter(e => MAIN_EVENT_NAMES.includes(e.name));
                const minors = events.filter(e => !MAIN_EVENT_NAMES.includes(e.name));

                const twoHoursFromNow = now + (120 * 60 * 1000);
                const getBest = (list) => {
                    // 1. Active
                    const active = list.find(e => e.startTime <= now && e.endTime > now);
                    if (active) return active;
                    // 2. Upcoming (sorted by start time) - grab the next one, no matter how far away
                    return list.filter(e => e.startTime > now).sort((a, b) => a.startTime - b.startTime)[0];
                };

                const allUpcoming = events
                    .filter(e => e.startTime > now && e.startTime <= twoHoursFromNow)
                    .sort((a, b) => a.startTime - b.startTime);

                newEvents[mapId] = {
                    main: getBest(mains),
                    minor: getBest(minors),
                    allUpcoming: allUpcoming
                };
            });
        }
        currentEvents = newEvents;
        updateMapNodes();
        // Update panel if something is selected
        if (selectedMapId) {
            updateSidePanel(selectedMapId, false);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        // Even if everything fails, we should ensure UI is clean
        updateMapNodes();
    }
}

// --- Overhead Map Nodes ---

// ─── Confirmed Map Positions ──────────────────────────────────────────────────
// All values are % of the home-map-wrapper (top = % of height, left = % of width).
// eventDelta is added to label to keep the event icon consistently offset at any scale.

const POSITIONS = {
    dam: { marker: { top: 54.52, left: 53.90 }, label: { top: 48.84, left: 58.12 }, eventDelta: { top: 14.20, left: -1.30 }, eventLabel: { left: 60.02, top: 68.06 } },
    spaceport: { marker: { top: 13.17, left: 28.05 }, label: { top: 6.81, left: 31.66 }, eventDelta: { top: 14.93, left: -0.69 }, eventLabel: { left: 35.05, top: 28.03 } },
    buried_city: { marker: { top: 45.08, left: 14.84 }, label: { top: 39.45, left: 18.82 }, eventDelta: { top: 14.64, left: -1.00 }, eventLabel: { left: 20.92, top: 58.68 } },
    blue_gate: { marker: { top: 39.07, left: 74.15 }, label: { top: 33.41, left: 78.05 }, eventDelta: { top: 14.93, left: -1.07 }, eventLabel: { left: 80.26, top: 53.32 } },
    stella_montis: { marker: { top: 7.52, left: 74.18 }, label: { top: 0.92, left: 79.00 }, eventDelta: { top: 15.82, left: -1.99 }, eventLabel: { left: 79.68, top: 21.03 } },
};

function renderMapMarkers() {
    const container = document.getElementById('map-markers');
    if (!container) return;
    container.innerHTML = '';

    MAPS.forEach(map => {
        if (!map.overheadCoords) return;
        const pos = POSITIONS[map.id];
        if (!pos) return;

        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.dataset.mapId = map.id;
        marker.style.top = pos.marker.top + '%';
        marker.style.left = pos.marker.left + '%';

        const dot = document.createElement('div');
        dot.className = 'map-marker-dot';
        marker.appendChild(dot);

        container.appendChild(marker);
    });
}

function renderMapEvents() {
    const container = document.getElementById('map-events');
    if (!container) return;
    container.innerHTML = '';

    MAPS.forEach(map => {
        if (!map.overheadCoords) return;
        const pos = POSITIONS[map.id];
        if (!pos) return;

        const top = pos.label.top + pos.eventDelta.top;
        const left = pos.label.left + pos.eventDelta.left;

        const el = document.createElement('div');
        el.className = 'special-event-container';
        el.dataset.mapId = map.id;
        el.style.position = 'absolute';
        el.style.top = top + '%';
        el.style.left = left + '%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.display = 'none';
        el.style.pointerEvents = 'auto';

        el.innerHTML = `
            <div class="special-event-visual">
                <img class="special-event-icon" src="" alt="">
            </div>
        `;

        const labelEl = document.createElement('div');
        labelEl.className = 'special-event-label-wrapper';
        labelEl.dataset.mapId = map.id;

        // Use the eventLabel's exact percentages if they exist, otherwise roughly offset from the icon
        const labelTopOffset = pos.eventLabel ? pos.eventLabel.top : (top + 4);
        const labelLeftOffset = pos.eventLabel ? pos.eventLabel.left : left;

        // Per-map mobile offsets: [labelLeft, labelTop, iconLeft, iconTop]
        const MOBILE_OFFSETS = {
            stella_montis: [  0, -6,   0, -6],
            spaceport:     [  0,  0,   0,  0],
            buried_city:   [  0,  0,   0,  0],
            dam:           [  0,  0,   0,  0],
            blue_gate:     [  0,  0,   0,  0],
        };

        const updateResponsivePosition = () => {
            let currentLabelLeft = labelLeftOffset;
            let currentLabelTop  = labelTopOffset;
            let currentIconLeft  = left;
            let currentIconTop   = top;

            if (window.innerWidth <= 800) {
                const off = MOBILE_OFFSETS[map.id];
                if (off) {
                    currentLabelLeft += off[0];
                    currentLabelTop  += off[1];
                    currentIconLeft  += off[2];
                    currentIconTop   += off[3];
                }
            }

            labelEl.style.top  = currentLabelTop  + '%';
            labelEl.style.left = currentLabelLeft + '%';
            el.style.top       = currentIconTop   + '%';
            el.style.left      = currentIconLeft  + '%';
        };

        // Initial set
        labelEl.style.position = 'absolute';
        updateResponsivePosition();

        // Listen for resize to adjust avoiding collisions dynamically
        window.addEventListener('resize', updateResponsivePosition);

        labelEl.style.transform = 'translate(-50%, 0)'; // Center horizontally
        labelEl.style.pointerEvents = 'none';
        labelEl.style.display = 'none';
        labelEl.style.zIndex = '21';

        labelEl.innerHTML = `
            <div class="special-event-label-container" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <div class="map-node-label special-event-label" style="pointer-events: auto;">
                    <span class="node-text event-node-text"></span>
                </div>
                <span class="special-event-timer" style="pointer-events: auto;">--:--</span>
            </div>
        `;


        el.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                showingEventDetails = 'MAIN';
                selectHomeMap(map.id, 'MAIN');
            }
        });
        el.addEventListener('click', () => {
            showingEventDetails = 'MAIN';
            selectHomeMap(map.id, 'MAIN');
        });
        addDoubleActivate(el, map.id);

        // Wire hover on the actual interactive children (tag + timer)
        const tagEl = labelEl.querySelector('.special-event-label');
        const timerEl = labelEl.querySelector('.special-event-timer');

        const onEnter = () => {
            if (window.innerWidth > 768) {
                // Sync highlight without movement
                el.classList.add('selected-highlight');
                showingEventDetails = 'MAIN';
                selectHomeMap(map.id, 'MAIN');
            }
        };
        const onClick = () => {
            el.classList.add('selected-highlight');
            showingEventDetails = 'MAIN';
            selectHomeMap(map.id, 'MAIN');
        };
        const onLeave = () => {
            if (window.innerWidth > 768) {
                el.classList.remove('selected-highlight');
            }
        };

        if (tagEl) {
            tagEl.addEventListener('mouseenter', onEnter);
            tagEl.addEventListener('mouseleave', onLeave);
            tagEl.addEventListener('click', onClick);
            addDoubleActivate(tagEl, map.id);
        }
        if (timerEl) {
            timerEl.addEventListener('mouseenter', onEnter);
            timerEl.addEventListener('mouseleave', onLeave);
            timerEl.addEventListener('click', onClick);
            addDoubleActivate(timerEl, map.id);
        }

        container.appendChild(el);
        container.appendChild(labelEl);
    });

    // Build unified hover regions for event icon + event label
    renderEventHoverRegions();
}

function updateLines() {
    const svg = document.getElementById('map-lines');
    if (!svg) return;
    const containerEl = document.querySelector('.home-map-wrapper');
    if (!containerEl) return;
    const cr = containerEl.getBoundingClientRect();

    svg.setAttribute('viewBox', `0 0 ${cr.width} ${cr.height}`);
    svg.innerHTML = '';

    // Make the main card 20% smaller vertically than the map height
    const cardHeight = cr.height * 0.8;
    const mainCard = document.getElementById('home-card');
    if (mainCard) mainCard.style.height = `${cardHeight}px`;

    const sidePanel = document.getElementById('home-side-panel');
    if (sidePanel) sidePanel.style.setProperty('--card-height', `${cardHeight}px`);

    MAPS.forEach(map => {
        if (!map.overheadCoords) return;

        const marker = document.querySelector(`#map-markers .map-marker[data-map-id="${map.id}"]`);
        const node = document.querySelector(`#map-tags .map-node[data-map-id="${map.id}"]`);
        if (!marker || !node) return;

        const label = node.querySelector('.map-node-label');
        if (!label) return;

        const mr = marker.getBoundingClientRect();
        const lr = label.getBoundingClientRect();

        const markerCx = mr.left + mr.width / 2 - cr.left;
        const markerCy = mr.top + mr.height / 2 - cr.top;
        const labelCx = lr.left + lr.width / 2 - cr.left;
        const labelCy = lr.bottom - cr.top;

        // Start point on the marker circle's edge, aimed at label bottom-center
        const angle = Math.atan2(labelCy - markerCy, labelCx - markerCx);
        const radius = mr.width / 2;
        const x1 = markerCx + Math.cos(angle) * radius;
        const y1 = markerCy + Math.sin(angle) * radius;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', labelCx);
        line.setAttribute('y2', labelCy);
        line.setAttribute('stroke', 'rgba(255,255,255,0.45)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);

        // Map events line
        const specialContainer = document.querySelector(`#map-events .special-event-container[data-map-id="${map.id}"]`);
        const specialLabelWrapper = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${map.id}"]`);
        if (specialContainer && specialContainer.style.display !== 'none' && specialLabelWrapper) {
            const icon = specialContainer.querySelector('.special-event-icon');
            const eventLabel = specialLabelWrapper.querySelector('.special-event-label');
            if (icon && eventLabel) {
                const ir = icon.getBoundingClientRect();
                const elr = eventLabel.getBoundingClientRect();

                // Target point on the label (center-top)
                const elabelCx = elr.left + elr.width / 2 - cr.left;
                const elabelCy = elr.top - cr.top;

                // Icon center
                const iconCx = ir.left + ir.width / 2 - cr.left;
                const iconCy = ir.top + ir.height / 2 - cr.top;

                // Calculate intersection with the icon's circular edge
                // We find the nearest point on the edge of the circular icon to the label's center-top
                let intersectX = iconCx;
                let intersectY = iconCy;

                const dx = elabelCx - iconCx;
                const dy = elabelCy - iconCy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Avoid division by zero
                if (dist > 0.1) {
                    const radius = ir.width / 2; // Assuming the icon box is roughly square

                    intersectX = iconCx + (dx / dist) * radius;
                    intersectY = iconCy + (dy / dist) * radius;
                } else {
                    // Fallback to bottom center if perfectly aligned
                    intersectY = iconCy + ir.height / 2;
                }

                const eventLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                eventLine.setAttribute('x1', intersectX);
                eventLine.setAttribute('y1', intersectY);
                eventLine.setAttribute('x2', elabelCx);
                eventLine.setAttribute('y2', elabelCy);
                eventLine.setAttribute('stroke', 'rgba(255,255,255,0.45)');
                eventLine.setAttribute('stroke-width', '1.5');
                eventLine.setAttribute('stroke-linecap', 'round');
                svg.appendChild(eventLine);
            }
        }
    });
}

// ──────────────────────────────────────────────────────────────────────────────

function renderMapNodes() {
    const container = document.getElementById('map-tags');
    if (!container) return;
    container.innerHTML = '';

    MAPS.forEach(map => {
        if (!map.overheadCoords) return;
        const pos = POSITIONS[map.id];
        if (!pos) return;

        const node = document.createElement('div');
        node.className = 'map-node';
        node.dataset.mapId = map.id;

        const updateNodePosition = () => {
            let topOffset = pos.label.top;
            let leftOffset = pos.label.left;

            // Adjust Stella Montis title tag to not overlap Blue Gate on smaller screens
            if (window.innerWidth <= 800 && map.id === 'stella_montis') {
                leftOffset -= 5;
                topOffset -= 5;
            }

            node.style.top = topOffset + '%';
            node.style.left = leftOffset + '%';
        };

        node.style.position = 'absolute';
        updateNodePosition();
        window.addEventListener('resize', updateNodePosition);

        node.innerHTML = `
            <div class="map-node-label-container">
                <div class="map-node-label">
                    <span class="node-text">${map.name.toUpperCase()}</span>
                    <img class="node-label-icon" src="" alt="" style="display:none;">
                </div>
            </div>
        `;

        const labelContainer = node.querySelector('.map-node-label-container');
        labelContainer.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                showingEventDetails = 'DEFAULT';
                selectHomeMap(map.id, 'DEFAULT');
            }
        });
        labelContainer.addEventListener('click', () => {
            showingEventDetails = 'DEFAULT';
            selectHomeMap(map.id, 'DEFAULT');
        });

        container.appendChild(node);
    });
}

// --- Unified hover/click regions (make tag+marker one interactive area) ---
let unifiedHoverContainer = null;

function renderUnifiedHoverRegions() {
    const wrapper = document.querySelector('.home-map-wrapper');
    const tagsLayer = document.getElementById('map-tags');
    if (!wrapper || !tagsLayer) return;

    // Create or reset container for hover regions
    if (!unifiedHoverContainer) {
        unifiedHoverContainer = document.createElement('div');
        unifiedHoverContainer.id = 'map-hitboxes';
        unifiedHoverContainer.style.position = 'absolute';
        unifiedHoverContainer.style.inset = '0';
        unifiedHoverContainer.style.pointerEvents = 'none';
        // Place above markers and under special events/labels (labels have their own hover too)
        unifiedHoverContainer.style.zIndex = '9';
        tagsLayer.appendChild(unifiedHoverContainer);
    } else {
        unifiedHoverContainer.innerHTML = '';
    }

    // Create a region per map that spans the union of the label and marker boxes
    MAPS.forEach(map => {
        if (!map.overheadCoords) return;
        const markerEl = document.querySelector(`#map-markers .map-marker[data-map-id="${map.id}"]`);
        const labelEl = document.querySelector(`#map-tags .map-node[data-map-id="${map.id}"] .map-node-label`);
        if (!markerEl || !labelEl) return;

        const region = document.createElement('div');
        region.className = 'map-hover-region';
        region.dataset.mapId = map.id;
        region.style.position = 'absolute';
        region.style.pointerEvents = 'auto';
        region.style.background = 'transparent';
        // Above labels so it keeps the hover active when traversing blank space
        region.style.zIndex = '11';

        // Interactions: treat as the same hover/click as the label
        region.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                showingEventDetails = 'DEFAULT';
                selectHomeMap(map.id, 'DEFAULT');
            }
        });
        region.addEventListener('click', () => {
            showingEventDetails = 'DEFAULT';
            selectHomeMap(map.id, 'DEFAULT');
        });
        addDoubleActivate(region, map.id);

        unifiedHoverContainer.appendChild(region);
    });

    // Position once now, and let resize handler keep it in sync
    positionUnifiedHoverRegions();
}

function positionUnifiedHoverRegions() {
    if (!unifiedHoverContainer) return;
    const wrapper = document.querySelector('.home-map-wrapper');
    if (!wrapper) return;
    const wr = wrapper.getBoundingClientRect();

    unifiedHoverContainer.querySelectorAll('.map-hover-region').forEach(region => {
        const mapId = region.dataset.mapId;
        const markerEl = document.querySelector(`#map-markers .map-marker[data-map-id="${mapId}"]`);
        const labelEl = document.querySelector(`#map-tags .map-node[data-map-id="${mapId}"] .map-node-label`);
        if (!markerEl || !labelEl) return;

        const mr = markerEl.getBoundingClientRect();
        const lr = labelEl.getBoundingClientRect();

        // Union rectangle with some padding to make the traversal forgiving
        const pad = 10; // px
        const left = Math.min(mr.left, lr.left) - wr.left - pad;
        const top = Math.min(mr.top, lr.top) - wr.top - pad;
        const right = Math.max(mr.right, lr.right) - wr.left + pad;
        const bottom = Math.max(mr.bottom, lr.bottom) - wr.top + pad;

        // right/left/top/bottom are already relative to wrapper; simple difference
        const width = Math.max(0, right - left);
        const height = Math.max(0, bottom - top);

        region.style.left = `${left}px`;
        region.style.top = `${top}px`;
        region.style.width = `${width}px`;
        region.style.height = `${height}px`;
    });
}

function updateMapNodes() {
    const now = Date.now();
    document.querySelectorAll('.map-node').forEach(node => {
        const mapId = node.dataset.mapId;
        const events = currentEvents[mapId] || { main: null, minor: null };

        // Elements
        const label = node.querySelector('.map-node-label');
        const labelIcon = node.querySelector('.node-label-icon'); // Inline minor icon
        const specialContainer = document.querySelector(`#map-events .special-event-container[data-map-id="${mapId}"]`);
        const specialLabelWrapper = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${mapId}"]`);
        const specialIcon = specialContainer ? specialContainer.querySelector('.special-event-icon') : null;
        const specialTimer = specialLabelWrapper ? specialLabelWrapper.querySelector('.special-event-timer') : null;

        // Only highlight label if map is selected AND we are NOT focusing on the main event icon
        const isLabelActive = mapId === selectedMapId && (!showingEventDetails || showingEventDetails === 'DEFAULT' || showingEventDetails === 'MINOR');
        label.classList.toggle('active-node', isLabelActive);

        const mapMarkerElement = document.querySelector(`#map-markers .map-marker[data-map-id="${mapId}"]`);
        if (mapMarkerElement) {
            mapMarkerElement.classList.toggle('active-marker', isLabelActive);
        }

        // Highlight special container and label wrapper only if focusing on main event
        const eventLabelEl = specialLabelWrapper ? specialLabelWrapper.querySelector('.special-event-label') : null;
        if (showingEventDetails === 'MAIN' && mapId === selectedMapId) {
            specialContainer?.classList.add('selected-highlight');
            specialLabelWrapper?.classList.add('selected-highlight');
            eventLabelEl?.classList.add('selected-highlight');
        } else {
            specialContainer?.classList.remove('selected-highlight');
            specialLabelWrapper?.classList.remove('selected-highlight');
            eventLabelEl?.classList.remove('selected-highlight');
        }

        // Ensure icon color matches exact timer yellow when highlighted
        // Active events: yellow on highlight (full opacity via CSS/class)
        // Upcoming events: yellow on highlight but remain semi-transparent (opacity via CSS)
        if (specialContainer && specialIcon) {
            const highlighted = specialContainer.classList.contains('selected-highlight');
            const orig = specialIcon.dataset.originalSrc || specialIcon.src;
            if (highlighted) {
                getYellowVariant(orig).then(url => {
                    if (url && specialContainer.classList.contains('selected-highlight')) {
                        specialIcon.src = url;
                    }
                });
            } else if (specialIcon.src !== orig) {
                specialIcon.src = orig;
            }
        }

        // --- MAIN EVENT RENDERING ---
        if (events.main) {
            const event = events.main;
            const iconSrc = getMainEventIcon(event.name);
            const isFuture = event.startTime > now;
            const timeLeft = isFuture ? event.startTime - now : event.endTime - now;

            // Always show if it exists (active or upcoming)
            if (specialContainer) specialContainer.style.display = 'block';
            if (specialLabelWrapper) specialLabelWrapper.style.display = 'block';

            if (iconSrc && specialIcon) setIconSrc(specialIcon, iconSrc);
            if (specialTimer) specialTimer.textContent = formatTime(Math.max(0, timeLeft)); // Avoid negative

            const specialLabelText = specialLabelWrapper ? specialLabelWrapper.querySelector('.event-node-text') : null;
            if (specialLabelText) {
                specialLabelText.textContent = event.name.toUpperCase();
            }

            if (isFuture) {
                if (specialContainer) {
                    specialContainer.classList.add('upcoming');
                    specialContainer.classList.remove('active');
                }

                if (specialLabelWrapper) {
                    specialLabelWrapper.classList.add('upcoming');
                    specialLabelWrapper.classList.remove('active');
                    const eventLabel = specialLabelWrapper.querySelector('.special-event-label');
                    if (eventLabel) {
                        eventLabel.classList.add('upcoming-label');
                    }
                }
            } else {
                if (specialContainer) {
                    specialContainer.classList.add('active');
                    specialContainer.classList.remove('upcoming');
                }

                if (specialLabelWrapper) {
                    specialLabelWrapper.classList.add('active');
                    specialLabelWrapper.classList.remove('upcoming');
                    const eventLabel = specialLabelWrapper.querySelector('.special-event-label');
                    if (eventLabel) {
                        eventLabel.classList.remove('upcoming-label');
                    }
                }
            }
        } else {
            if (specialContainer) specialContainer.style.display = 'none';
            if (specialLabelWrapper) specialLabelWrapper.style.display = 'none';
        }

        // --- MINOR EVENT RENDERING ---
        if (events.minor) {
            const event = events.minor;
            const iconSrc = getMinorEventIcon(event.name);
            const isFuture = event.startTime > now;
            const timeLeft = isFuture ? event.startTime - now : event.endTime - now;

            if (timeLeft > 0 && !isFuture && iconSrc) {
                // Inline Icon
                labelIcon.src = iconSrc;
                labelIcon.style.display = 'inline-block';
                labelIcon.style.opacity = '1';
                labelIcon.classList.remove('upcoming-minor');
            } else {
                labelIcon.style.display = 'none';
                // Clear src so CSS :has rules don't treat hidden icons as present
                labelIcon.removeAttribute('src');
            }
        } else {
            labelIcon.style.display = 'none';
        }
    });

    // Update the tether lines and the unified hover regions since label widths may have changed
    requestAnimationFrame(() => {
        updateLines();
        positionUnifiedHoverRegions();
        positionEventHoverRegions();
    });
}

// --- Side Panel ---

// showMode: 'DEFAULT', 'MAIN', 'MINOR'
// 'DEFAULT' -> Map Info (or Minor if present?) user said 'hover title... show different' implies Title=Map or Title=Minor?
// Let's assume Title=Minor if Minor exists, else Map.


function updateSidePanel(mapId, animate, showMode = null) {
    // Simplified: Primary Card = Active Event OR Default Map
    // Secondary Card = Upcoming Event

    const panel = document.getElementById('home-card');
    const upcomingPanel = document.getElementById('home-card-upcoming');
    if (!panel) return;

    const map = getMapById(mapId);
    if (!map) return;

    const events = currentEvents[mapId] || { main: null, minor: null };
    const defaults = MAP_DEFAULTS[mapId];
    const now = Date.now();

    // 1. Determine Primary Content (Current State)
    let primaryEvent = null;
    let isMinorMode = false;

    // If showMode is explicitly 'DEFAULT' (e.g. from hovering the label), check for a minor event first
    if (showMode === 'DEFAULT' || showMode === 'MINOR') {
        if (events.minor && events.minor.startTime <= now && events.minor.endTime > now) {
            primaryEvent = events.minor;
            isMinorMode = true;
        }
    } else if (events.main) {
        // If explicitly hovering main event icon, or if there's an active main event, show it
        if (showMode === 'MAIN' || (events.main.startTime <= now && events.main.endTime > now)) {
            primaryEvent = events.main;
        }
    }

    // If hovering specific mode, override?
    // User said independent hover. If hovering ICON (Main), show Main details?
    // Actually user said: "Main card should be just Buried City plain [if default]... but then I like having that Bird City upcoming card there too."
    // Let's stick to: Primary = Active Main OR Default. Secondary = Upcoming Main.

    // However, if we hover the UPCOMING icon, maybe we want to see details?
    // The previous logic used 'showMode'. Let's see if we need it.
    // If showMode === 'MAIN' (hovering icon), and it's UPCOMING, maybe we highlight the upcoming card?
    // For now, let's implement the split first.

    // --- PRIMARY CARD DATA ---
    let topLabel = '';
    let mainTitle = '';
    let description = defaults ? defaults.description : '';
    let difficulty = defaults ? defaults.difficulty : 3;
    let imageSrc = getEventImage(mapId, null);
    let modifiers = [];
    let multiplier = null;
    let endTime = null;
    let isFuture = false;

    // Primary Data Population
    if (primaryEvent) {
        // Active Event: Map is context (small), Event is headline (big)
        topLabel = map.name;
        mainTitle = primaryEvent.name;

        // Use event specific banner if available, otherwise it falls back to map default
        imageSrc = getEventImage(mapId, primaryEvent.name);

        const staticData = EVENT_DATA[primaryEvent.name];
        if (staticData) {
            description = staticData.description;
            modifiers = staticData.modifiers || [];
            difficulty = staticData.difficulty || difficulty;
            multiplier = staticData.multiplier;
        }
        endTime = primaryEvent.endTime;
        isFuture = primaryEvent.startTime > now;
    } else {
        // Default: Status is context (small), Map is headline (big)
        topLabel = 'NO ACTIVE MAP CONDITION';
        mainTitle = map.name;
    }

    const doUpdate = () => {
        // --- PRIMARY CARD ---
        const imgEl = document.getElementById('home-card-image');
        if (imgEl && imgEl.src !== imageSrc) imgEl.src = imageSrc;

        document.getElementById('home-card-map-name').textContent = topLabel;
        document.getElementById('home-card-event-name').textContent = mainTitle;
        document.getElementById('home-card-description').textContent = description;

        // Modifiers
        const modEl = document.getElementById('home-card-modifiers');
        if (modEl) {
            if (modifiers.length > 0) {
                modEl.innerHTML = modifiers.map(m => `<li class="modifier-item">${m}</li>`).join('');
                modEl.style.display = 'flex';
            } else {
                modEl.style.display = 'none';
            }
        }

        // Event icon
        const iconZone = document.getElementById('home-card-icon-zone');
        const iconImg = document.getElementById('home-card-icon');
        if (iconZone && iconImg) {
            const iconSrc = primaryEvent
                ? (isMinorMode ? getMinorEventIcon(primaryEvent.name) : getMainEventIcon(primaryEvent.name))
                : null;
            if (iconSrc) {
                iconImg.src = iconSrc;

                // Clear any previous CSS scaling modifiers
                iconImg.classList.remove('scale-up', 'scale-down', 'is-main-svg', 'is-matriarch');

                // Conditionally apply scaling modifiers based on event needs for side panel
                if (!isMinorMode && primaryEvent) {
                    if (primaryEvent.name === 'Matriarch') {
                        iconImg.classList.add('is-matriarch');
                    } else {
                        // All other Main SVGs need expansion to fill the 48px circle due to their native transparent padding
                        iconImg.classList.add('is-main-svg');
                    }
                }

                iconZone.style.display = 'block';
            } else {
                iconZone.style.display = 'none';
            }
        }

        // Difficulty
        const pipsEl = document.getElementById('difficulty-pips');
        if (pipsEl) {
            let pipsHtml = '';
            for (let i = 1; i <= 5; i++) {
                pipsHtml += `<span class="pip ${i <= difficulty ? 'filled' : ''}"></span>`;
            }
            pipsEl.innerHTML = pipsHtml;
        }

        // Primary Timer (Only if active event)
        const timerSection = document.getElementById('home-card-timer');
        const doublePointsTag = document.getElementById('home-card-double-points');
        if (primaryEvent) {
            timerSection.style.display = 'flex';
            if (isFuture) {
                timerSection.classList.remove('active');
                timerSection.dataset.startTime = primaryEvent.startTime;
                delete timerSection.dataset.endTime;
                document.getElementById('timer-value').textContent = 'STARTS IN ' + formatTime(primaryEvent.startTime - now);
                if (doublePointsTag) doublePointsTag.style.display = 'none';
            } else {
                timerSection.classList.add('active');
                timerSection.dataset.endTime = endTime;
                delete timerSection.dataset.startTime;
                document.getElementById('timer-value').textContent = formatTime(endTime - now);

                // Show double points tag ONLY for events with 2X multiplier
                if (multiplier === '2X' && doublePointsTag) {
                    doublePointsTag.style.display = 'flex';
                } else if (doublePointsTag) {
                    doublePointsTag.style.display = 'none';
                }
            }
        } else {
            timerSection.style.display = 'none';
            timerSection.classList.remove('active');
            delete timerSection.dataset.endTime;
            delete timerSection.dataset.startTime;
            if (doublePointsTag) doublePointsTag.style.display = 'none';
        }

        // --- SECONDARY CARD (Upcoming) ---
        const allUpcoming = events.allUpcoming || [];
        // Filter upcoming events to only show those starting within the next 120 minutes (2 hours)
        const upcomingWithin120Mins = allUpcoming.filter(item => (item.startTime - now) <= (120 * 60 * 1000));

        if (upcomingWithin120Mins.length > 0 && upcomingPanel) {
            upcomingPanel.style.display = 'flex';
            const upcomingList = document.getElementById('upcoming-events-list');
            if (upcomingList) {
                upcomingList.innerHTML = '';
                upcomingWithin120Mins.forEach(item => {
                    const isMain = MAIN_EVENT_NAMES.includes(item.name);
                    const iconSrc = isMain ? getMainEventIcon(item.name) : getMinorEventIcon(item.name);
                    const startsIn = item.startTime - now;

                    const row = document.createElement('div');
                    row.className = 'upcoming-body upcoming-item';
                    row.style.borderBottom = '1px solid rgba(26, 20, 16, 0.08)';

                    row.innerHTML = `
                        <img class="upcoming-icon" src="${iconSrc || ''}" alt="">
                        <div class="upcoming-info">
                            <div class="upcoming-name">${item.name}</div>
                            <div class="upcoming-timer" data-start-time="${item.startTime}">STARTS IN ${formatTime(startsIn)}</div>
                        </div>
                    `;
                    upcomingList.appendChild(row);
                });

                const lastItem = upcomingList.lastElementChild;
                if (lastItem) lastItem.style.borderBottom = 'none';
            }
        } else if (upcomingPanel) {
            upcomingPanel.style.display = 'none';
        }
    };

    if (animate && !panelFading) {
        panelFading = true;
        // animate existing card
        const body = panel.querySelector('.home-card-body');
        const imgWrap = panel.querySelector('.home-card-image-wrap');
        const iconZone = panel.querySelector('.home-card-icon-zone'); // ADDED

        if (body) body.classList.add('fade-out');
        if (imgWrap) imgWrap.classList.add('fade-out');
        if (iconZone) iconZone.classList.add('fade-out'); // ADDED

        setTimeout(() => {
            doUpdate();
            if (body) { body.classList.remove('fade-out'); body.classList.add('fade-in'); }
            if (imgWrap) { imgWrap.classList.remove('fade-out'); imgWrap.classList.add('fade-in'); }
            if (iconZone) { iconZone.classList.remove('fade-out'); iconZone.classList.add('fade-in'); } // ADDED

            setTimeout(() => {
                if (body) body.classList.remove('fade-in');
                if (imgWrap) imgWrap.classList.remove('fade-in');
                if (iconZone) iconZone.classList.remove('fade-in'); // ADDED
                panelFading = false;
            }, 300);
        }, 200);
    } else {
        doUpdate();
    }
}

function updateTimers() {
    const now = Date.now();

    // Update nodes
    updateMapNodes();

    // Update primary timer
    const timerSection = document.getElementById('home-card-timer');
    const timerValue = document.getElementById('timer-value');
    if (timerSection) {
        if (timerSection.dataset.endTime) {
            const end = parseInt(timerSection.dataset.endTime, 10);
            const left = end - now;
            if (left > 0) {
                timerValue.textContent = formatTime(left);
            } else {
                // Timer expired, re-fetch?
                timerSection.style.display = 'none';
                fetchEvents(); // Refresh data
            }
        } else if (timerSection.dataset.startTime) {
            const start = parseInt(timerSection.dataset.startTime, 10);
            const left = start - now;
            if (left > 0) {
                timerValue.textContent = 'STARTS IN ' + formatTime(left);
            } else {
                // Started! Refresh.
                fetchEvents();
            }
        }
    }

    // Update upcoming timers
    const upcomingTimers = document.querySelectorAll('.upcoming-timer');
    upcomingTimers.forEach(upTimer => {
        if (upTimer.dataset.startTime) {
            const start = parseInt(upTimer.dataset.startTime, 10);
            const left = start - now;
            if (left > 0) {
                upTimer.textContent = 'STARTS IN ' + formatTime(left);
            } else {
                fetchEvents();
            }
        }
    });
}

// --- Interaction ---

function wireInspectButton() {
    const btn = document.getElementById('home-card-inspect-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const map = getMapById(selectedMapId);
        if (map && typeof enterMap === 'function') {
            enterMap(map);
        }
    });
}

function selectHomeMap(mapId, mode) {
    // mode: 'DEFAULT', 'EVENT', or null

    // If mapID changed, we update everything.
    // If same mapID but different mode, we just update panel.

    if (mapId !== selectedMapId) {
        selectedMapId = mapId;
        // Reset mode to default if switching maps? 
        // Or preserve if hovering special icon?
        // Usually switching maps implies default view first.
        if (!mode) mode = 'DEFAULT';
    }

    // Bottom Cards
    document.querySelectorAll('#map-cards .map-card').forEach(card => {
        card.classList.toggle('home-selected', card.dataset.mapId === mapId);
    });

    // Overhead Nodes logic moved to updateMapNodes for updates
    updateMapNodes();

    updateSidePanel(mapId, true, mode);

    // Open drawer on mobile
    const sidePanel = document.getElementById('home-side-panel');
    if (sidePanel && window.innerWidth <= 768) {
        sidePanelOpenedAt = Date.now();
        sidePanel.classList.add('open');
    }
}

function wireMapCardHovers() {
    document.querySelectorAll('#map-cards .map-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768 && card.dataset.mapId) {
                selectHomeMap(card.dataset.mapId, 'DEFAULT');
            }
        });
    });
}

// --- Init ---

function initHomeScreen() {
    // 1. Initial Render
    if (typeof renderMapCards === 'function') renderMapCards();
    renderMapNodes();
    renderMapMarkers();
    renderMapEvents();
    renderUnifiedHoverRegions();
    requestAnimationFrame(updateLines);
    window.addEventListener('resize', () => {
        updateLines();
        positionUnifiedHoverRegions();
        positionEventHoverRegions();
    });
    wireMapCardHovers();
    wireInspectButton();

    const closeBtn = document.getElementById('mobile-close-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const sidePanel = document.getElementById('home-side-panel');
            if (sidePanel) sidePanel.classList.remove('open');
        });
    }

    // Tap-outside-to-close on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        // Ignore the click that just opened the panel (same event bubbling up)
        if (Date.now() - sidePanelOpenedAt < 100) return;
        const sidePanel = document.getElementById('home-side-panel');
        if (sidePanel && sidePanel.classList.contains('open') && !sidePanel.contains(e.target)) {
            sidePanel.classList.remove('open');
        }
    });

    // Swipe-to-close: drag down from top of drawer to dismiss
    const swipePanel = document.getElementById('home-side-panel');
    if (swipePanel) {
        let touchStartY = 0;
        let isSwiping = false;

        swipePanel.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = swipePanel.getBoundingClientRect();
            // Only initiate swipe from top 60px of the panel
            if (touch.clientY - rect.top < 60) {
                touchStartY = touch.clientY;
                isSwiping = true;
            }
        }, { passive: true });

        swipePanel.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            // Prevent pull-to-refresh while swiping
        }, { passive: true });

        swipePanel.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            const touchEndY = e.changedTouches[0].clientY;
            const delta = touchEndY - touchStartY;
            if (delta > 100) {
                swipePanel.classList.remove('open');
            }
            isSwiping = false;
        }, { passive: true });
    }

    document.addEventListener('mobileMapSelected', (e) => {
        selectHomeMap(e.detail.mapId, 'DEFAULT');
    });

    // 2. Select Default
    // (Assuming renderMapCards creates the DOM, wait a tick or just update)
    updateSidePanel(selectedMapId, false);
    document.querySelectorAll('.map-node').forEach(n => n.classList.toggle('active-node', n.dataset.mapId === selectedMapId));
    document.querySelectorAll('.map-card').forEach(c => c.classList.toggle('home-selected', c.dataset.mapId === selectedMapId));

    // 3. Start Data Fetch
    fetchEvents();

    // 4. Start Timers
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimers, 1000);

    // 5. Poll API every 5 mins
    if (eventFetchInterval) clearInterval(eventFetchInterval);
    eventFetchInterval = setInterval(fetchEvents, 5 * 60 * 1000);
}

export { initHomeScreen };

// --- Unified hover for Events (icon + icon title tag) ---
let eventHoverContainer = null;
let currentEventHover = null; // mapId currently hovered via unified region
const eventHoverLeaveTimers = Object.create(null);

function renderEventHoverRegions() {
    const wrapper = document.querySelector('.home-map-wrapper');
    const eventsLayer = document.getElementById('map-events');
    if (!wrapper || !eventsLayer) return;

    if (!eventHoverContainer) {
        eventHoverContainer = document.createElement('div');
        eventHoverContainer.id = 'event-hitboxes';
        eventHoverContainer.style.position = 'absolute';
        eventHoverContainer.style.inset = '0';
        eventHoverContainer.style.pointerEvents = 'none';
        // Above event icon/labels to bridge gaps
        eventHoverContainer.style.zIndex = '22';
        eventsLayer.appendChild(eventHoverContainer);
    } else {
        eventHoverContainer.innerHTML = '';
    }

    MAPS.forEach(map => {
        const iconEl = document.querySelector(`#map-events .special-event-container[data-map-id="${map.id}"]`);
        const labelWrap = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id=\"${map.id}\"]`);
        if (!iconEl || iconEl.style.display === 'none' || !labelWrap || labelWrap.style.display === 'none') return;

        const region = document.createElement('div');
        region.dataset.mapId = map.id;
        region.style.position = 'absolute';
        region.style.pointerEvents = 'auto';
        region.style.background = 'transparent';
        region.style.zIndex = '22';

        region.addEventListener('mouseenter', () => {
            // Cancel any pending leave for this map
            if (eventHoverLeaveTimers[map.id]) {
                clearTimeout(eventHoverLeaveTimers[map.id]);
                delete eventHoverLeaveTimers[map.id];
            }
            currentEventHover = map.id;
            showingEventDetails = 'MAIN';
            selectHomeMap(map.id, 'MAIN');
        }, { passive: true });
        region.addEventListener('mouseleave', () => {
            // Debounce leave to prevent flicker across small gaps
            eventHoverLeaveTimers[map.id] = setTimeout(() => {
                if (currentEventHover === map.id) currentEventHover = null;
                // If leaving the region and not immediately entering again, clear MAIN focus
                if (showingEventDetails === 'MAIN') {
                    showingEventDetails = null;
                    updateMapNodes();
                }
                delete eventHoverLeaveTimers[map.id];
            }, 120);
        }, { passive: true });
        region.addEventListener('click', () => {
            showingEventDetails = 'MAIN';
            selectHomeMap(map.id, 'MAIN');
        });

        eventHoverContainer.appendChild(region);
    });

    positionEventHoverRegions();
}

function positionEventHoverRegions() {
    if (!eventHoverContainer) return;
    const wrapper = document.querySelector('.home-map-wrapper');
    if (!wrapper) return;
    const wr = wrapper.getBoundingClientRect();

    eventHoverContainer.querySelectorAll('div[data-map-id]').forEach(region => {
        const mapId = region.dataset.mapId;
        const iconEl = document.querySelector(`#map-events .special-event-container[data-map-id=\"${mapId}\"] .special-event-visual`);
        const labelEl = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id=\"${mapId}\"] .special-event-label`);
        const timerEl = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id=\"${mapId}\"] .special-event-timer`);
        if (!iconEl || !labelEl || !timerEl) return;

        const ir = iconEl.getBoundingClientRect();
        const lr = labelEl.getBoundingClientRect();
        const tr = timerEl.getBoundingClientRect();

        const pad = 16;
        const left = Math.min(ir.left, lr.left, tr.left) - wr.left - pad;
        const top = Math.min(ir.top, lr.top, tr.top) - wr.top - pad;
        const right = Math.max(ir.right, lr.right, tr.right) - wr.left + pad;
        const bottom = Math.max(ir.bottom, lr.bottom, tr.bottom) - wr.top + pad;

        const width = Math.max(0, right - left);
        const height = Math.max(0, bottom - top);

        region.style.left = `${left}px`;
        region.style.top = `${top}px`;
        region.style.width = `${width}px`;
        region.style.height = `${height}px`;
    });
}
