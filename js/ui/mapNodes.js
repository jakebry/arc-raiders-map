// js/ui/mapNodes.js — Map node/marker/event rendering on the home screen overhead map

import { MAPS, EVENT_DATA, BLOB } from '../data.js';
import { MAIN_EVENT_NAMES } from '../api.js';
import { formatTime, getYellowVariant, setIconSrc } from '../utils.js';
import { enterMap } from '../app.js';

// --- Icon/image lookup functions ---
// Mappings are stored centrally in EVENT_DATA (data.js) to avoid duplication.

/**
 * Get the best image for a map + event name combo.
 * Fallback chain: EVENT_DATA image → map default image → map preview
 */
export function getEventImage(mapId, eventName) {
    if (eventName) {
        const entry = EVENT_DATA[eventName];
        if (entry && entry.image) return entry.image;
    }

    const mapDefaultImages = {
        'dam': `${BLOB}/images/events/Dam%20Battlegrounds.jpg`,
        'spaceport': `${BLOB}/images/events/Spaceport.jpg`,
        'blue_gate': `${BLOB}/images/events/Blue%20Gate.jpg`
    };
    if (mapDefaultImages[mapId]) return mapDefaultImages[mapId];

    return `${BLOB}/images/preview/${mapId}.jpg`;
}

/**
 * Get the circular main-event SVG icon URL for a given event name.
 * Appends a cache-bust query string to force SVG reload after updates.
 */
export function getMainEventIcon(eventName) {
    if (!eventName) return null;
    const entry = EVENT_DATA[eventName];
    const cacheBust = typeof window !== 'undefined' ? `?v=${Date.now()}` : '';
    if (entry && entry.mainIcon) return `${entry.mainIcon}${cacheBust}`;
    // Fallback: kebab-case filename guess
    const kebab = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${BLOB}/images/events/icons/${kebab}.svg${cacheBust}`;
}

/**
 * Get the white minor-event SVG icon URL for a given event name.
 */
export function getMinorEventIcon(eventName) {
    if (!eventName) return null;
    const entry = EVENT_DATA[eventName];
    if (entry && entry.minorIcon) return entry.minorIcon;
    // Fallback: kebab-case filename guess
    const kebab = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${BLOB}/images/events/icons/White%20Icons/${kebab}.svg`;
}

// --- Positions ---

// ─── Confirmed Map Positions ──────────────────────────────────────────────────
// All values are % of the home-map-wrapper (top = % of height, left = % of width).
// eventDelta is added to label to keep the event icon consistently offset at any scale.
export const POSITIONS = {
    dam: { marker: { top: 54.52, left: 53.90 }, label: { top: 48.84, left: 58.12 }, eventDelta: { top: 14.20, left: -1.30 }, eventLabel: { left: 60.02, top: 68.06 } },
    spaceport: { marker: { top: 13.17, left: 28.05 }, label: { top: 6.81, left: 31.66 }, eventDelta: { top: 14.93, left: -0.69 }, eventLabel: { left: 35.05, top: 28.03 } },
    buried_city: { marker: { top: 45.08, left: 14.84 }, label: { top: 39.45, left: 18.82 }, eventDelta: { top: 14.64, left: -1.00 }, eventLabel: { left: 20.92, top: 58.68 } },
    blue_gate: { marker: { top: 39.07, left: 74.15 }, label: { top: 33.41, left: 78.05 }, eventDelta: { top: 14.93, left: -1.07 }, eventLabel: { left: 80.26, top: 53.32 } },
    stella_montis: { marker: { top: 7.52, left: 74.18 }, label: { top: 0.92, left: 79.00 }, eventDelta: { top: 15.82, left: -1.99 }, eventLabel: { left: 79.68, top: 21.03 } },
};

// --- Shared state refs (set by home.js via initMapNodes) ---
let _getSelectedMapId = null;
let _getShowingEventDetails = null;
let _selectHomeMap = null;
let _getCurrentEvents = null;

/**
 * Initialize mapNodes with shared state accessors from home.js.
 */
export function initMapNodes(opts) {
    _getSelectedMapId = opts.getSelectedMapId;
    _getShowingEventDetails = opts.getShowingEventDetails;
    _selectHomeMap = opts.selectHomeMap;
    _getCurrentEvents = opts.getCurrentEvents;
}

// --- Double-click / double-tap helper ---
export function addDoubleActivate(el, mapId) {
    el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const map = MAPS.find(m => m.id === mapId);
        if (map) enterMap(map);
    });
    let lastTap = 0;
    el.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            e.preventDefault();
            const map = MAPS.find(m => m.id === mapId);
            if (map) enterMap(map);
        }
        lastTap = now;
    });
}

// --- Render functions ---

export function renderMapMarkers() {
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

export function renderMapEvents(onSelectMap) {
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

        const labelTopOffset = pos.eventLabel ? pos.eventLabel.top : (top + 4);
        const labelLeftOffset = pos.eventLabel ? pos.eventLabel.left : left;

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

        labelEl.style.position = 'absolute';
        updateResponsivePosition();
        window.addEventListener('resize', updateResponsivePosition);

        labelEl.style.transform = 'translate(-50%, 0)';
        labelEl.style.pointerEvents = 'none';
        labelEl.style.display = 'none';
        labelEl.style.zIndex = '21';

        labelEl.innerHTML = `
            <div class="special-event-label-container">
                <div class="map-node-label special-event-label" style="pointer-events: auto;">
                    <span class="node-text event-node-text"></span>
                </div>
                <span class="special-event-timer" style="pointer-events: auto;">--:--</span>
            </div>
        `;

        el.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                onSelectMap(map.id, 'MAIN');
            }
        });
        el.addEventListener('click', () => {
            onSelectMap(map.id, 'MAIN');
        });
        addDoubleActivate(el, map.id);

        const tagEl = labelEl.querySelector('.special-event-label');
        const timerEl = labelEl.querySelector('.special-event-timer');

        const onEnter = () => {
            if (window.innerWidth > 768) {
                el.classList.add('selected-highlight');
                onSelectMap(map.id, 'MAIN');
            }
        };
        const onClick = () => {
            el.classList.add('selected-highlight');
            onSelectMap(map.id, 'MAIN');
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

    renderEventHoverRegions(onSelectMap);
}

export function renderMapNodes(onSelectMap) {
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
                onSelectMap(map.id, 'DEFAULT');
            }
        });
        labelContainer.addEventListener('click', () => {
            onSelectMap(map.id, 'DEFAULT');
        });

        container.appendChild(node);
    });
}

export function updateMapNodes(currentEvents, selectedMapId, showingEventDetails, onSelectMap) {
    const now = Date.now();
    document.querySelectorAll('.map-node').forEach(node => {
        const mapId = node.dataset.mapId;
        const events = currentEvents[mapId] || { main: null, minor: null };

        const label = node.querySelector('.map-node-label');
        const labelIcon = node.querySelector('.node-label-icon');
        const specialContainer = document.querySelector(`#map-events .special-event-container[data-map-id="${mapId}"]`);
        const specialLabelWrapper = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${mapId}"]`);
        const specialIcon = specialContainer ? specialContainer.querySelector('.special-event-icon') : null;
        const specialTimer = specialLabelWrapper ? specialLabelWrapper.querySelector('.special-event-timer') : null;

        const isLabelActive = mapId === selectedMapId && (!showingEventDetails || showingEventDetails === 'DEFAULT' || showingEventDetails === 'MINOR');
        label.classList.toggle('active-node', isLabelActive);

        const mapMarkerElement = document.querySelector(`#map-markers .map-marker[data-map-id="${mapId}"]`);
        if (mapMarkerElement) {
            mapMarkerElement.classList.toggle('active-marker', isLabelActive);
        }

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

        // --- MAIN EVENT ---
        if (events.main) {
            const event = events.main;
            const iconSrc = getMainEventIcon(event.name);
            const isFuture = event.startTime > now;
            const timeLeft = isFuture ? event.startTime - now : event.endTime - now;

            if (specialContainer) specialContainer.style.display = 'block';
            if (specialLabelWrapper) specialLabelWrapper.style.display = 'block';

            if (iconSrc && specialIcon) setIconSrc(specialIcon, iconSrc);
            if (specialTimer) specialTimer.textContent = formatTime(Math.max(0, timeLeft));

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
                    if (eventLabel) eventLabel.classList.add('upcoming-label');
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
                    if (eventLabel) eventLabel.classList.remove('upcoming-label');
                }
            }
        } else {
            if (specialContainer) specialContainer.style.display = 'none';
            if (specialLabelWrapper) specialLabelWrapper.style.display = 'none';
        }

        // --- MINOR EVENT ---
        if (events.minor) {
            const event = events.minor;
            const iconSrc = getMinorEventIcon(event.name);
            const isFuture = event.startTime > now;
            const timeLeft = isFuture ? event.startTime - now : event.endTime - now;

            if (timeLeft > 0 && !isFuture && iconSrc) {
                labelIcon.src = iconSrc;
                labelIcon.style.display = 'inline-block';
                labelIcon.style.opacity = '1';
                labelIcon.classList.remove('upcoming-minor');
            } else {
                labelIcon.style.display = 'none';
                labelIcon.removeAttribute('src');
            }
        } else {
            labelIcon.style.display = 'none';
        }
    });

    requestAnimationFrame(() => {
        updateLines();
        positionUnifiedHoverRegions();
        positionEventHoverRegions();
    });
}

// --- Lines ---

export function updateLines() {
    const svg = document.getElementById('map-lines');
    if (!svg) return;
    const containerEl = document.querySelector('.home-map-wrapper');
    if (!containerEl) return;
    const cr = containerEl.getBoundingClientRect();

    svg.setAttribute('viewBox', `0 0 ${cr.width} ${cr.height}`);
    svg.innerHTML = '';

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

        const specialContainer = document.querySelector(`#map-events .special-event-container[data-map-id="${map.id}"]`);
        const specialLabelWrapper = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${map.id}"]`);
        if (specialContainer && specialContainer.style.display !== 'none' && specialLabelWrapper) {
            const icon = specialContainer.querySelector('.special-event-icon');
            const eventLabel = specialLabelWrapper.querySelector('.special-event-label');
            if (icon && eventLabel) {
                const ir = icon.getBoundingClientRect();
                const elr = eventLabel.getBoundingClientRect();

                const elabelCx = elr.left + elr.width / 2 - cr.left;
                const elabelCy = elr.top - cr.top;

                const iconCx = ir.left + ir.width / 2 - cr.left;
                const iconCy = ir.top + ir.height / 2 - cr.top;

                let intersectX = iconCx;
                let intersectY = iconCy;

                const dx = elabelCx - iconCx;
                const dy = elabelCy - iconCy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0.1) {
                    const r = ir.width / 2;
                    intersectX = iconCx + (dx / dist) * r;
                    intersectY = iconCy + (dy / dist) * r;
                } else {
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

// --- Unified hover regions ---

let unifiedHoverContainer = null;

export function renderUnifiedHoverRegions(onSelectMap) {
    const wrapper = document.querySelector('.home-map-wrapper');
    const tagsLayer = document.getElementById('map-tags');
    if (!wrapper || !tagsLayer) return;

    if (!unifiedHoverContainer) {
        unifiedHoverContainer = document.createElement('div');
        unifiedHoverContainer.id = 'map-hitboxes';
        unifiedHoverContainer.style.position = 'absolute';
        unifiedHoverContainer.style.inset = '0';
        unifiedHoverContainer.style.pointerEvents = 'none';
        unifiedHoverContainer.style.zIndex = '9';
        tagsLayer.appendChild(unifiedHoverContainer);
    } else {
        unifiedHoverContainer.innerHTML = '';
    }

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
        region.style.zIndex = '11';

        region.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                onSelectMap(map.id, 'DEFAULT');
            }
        });
        region.addEventListener('click', () => {
            onSelectMap(map.id, 'DEFAULT');
        });
        addDoubleActivate(region, map.id);

        unifiedHoverContainer.appendChild(region);
    });

    positionUnifiedHoverRegions();
}

export function positionUnifiedHoverRegions() {
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

        const pad = 10;
        const left = Math.min(mr.left, lr.left) - wr.left - pad;
        const top = Math.min(mr.top, lr.top) - wr.top - pad;
        const right = Math.max(mr.right, lr.right) - wr.left + pad;
        const bottom = Math.max(mr.bottom, lr.bottom) - wr.top + pad;

        region.style.left = `${left}px`;
        region.style.top = `${top}px`;
        region.style.width = `${Math.max(0, right - left)}px`;
        region.style.height = `${Math.max(0, bottom - top)}px`;
    });
}

// --- Event hover regions ---

let eventHoverContainer = null;
let currentEventHover = null;
const eventHoverLeaveTimers = Object.create(null);

export function renderEventHoverRegions(onSelectMap) {
    const wrapper = document.querySelector('.home-map-wrapper');
    const eventsLayer = document.getElementById('map-events');
    if (!wrapper || !eventsLayer) return;

    if (!eventHoverContainer) {
        eventHoverContainer = document.createElement('div');
        eventHoverContainer.id = 'event-hitboxes';
        eventHoverContainer.style.position = 'absolute';
        eventHoverContainer.style.inset = '0';
        eventHoverContainer.style.pointerEvents = 'none';
        eventHoverContainer.style.zIndex = '22';
        eventsLayer.appendChild(eventHoverContainer);
    } else {
        eventHoverContainer.innerHTML = '';
    }

    MAPS.forEach(map => {
        const iconEl = document.querySelector(`#map-events .special-event-container[data-map-id="${map.id}"]`);
        const labelWrap = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${map.id}"]`);
        if (!iconEl || iconEl.style.display === 'none' || !labelWrap || labelWrap.style.display === 'none') return;

        const region = document.createElement('div');
        region.dataset.mapId = map.id;
        region.style.position = 'absolute';
        region.style.pointerEvents = 'auto';
        region.style.background = 'transparent';
        region.style.zIndex = '22';

        region.addEventListener('mouseenter', () => {
            if (eventHoverLeaveTimers[map.id]) {
                clearTimeout(eventHoverLeaveTimers[map.id]);
                delete eventHoverLeaveTimers[map.id];
            }
            currentEventHover = map.id;
            onSelectMap(map.id, 'MAIN');
        }, { passive: true });
        region.addEventListener('mouseleave', () => {
            eventHoverLeaveTimers[map.id] = setTimeout(() => {
                if (currentEventHover === map.id) currentEventHover = null;
                delete eventHoverLeaveTimers[map.id];
            }, 120);
        }, { passive: true });
        region.addEventListener('click', () => {
            onSelectMap(map.id, 'MAIN');
        });

        eventHoverContainer.appendChild(region);
    });

    positionEventHoverRegions();
}

export function positionEventHoverRegions() {
    if (!eventHoverContainer) return;
    const wrapper = document.querySelector('.home-map-wrapper');
    if (!wrapper) return;
    const wr = wrapper.getBoundingClientRect();

    eventHoverContainer.querySelectorAll('div[data-map-id]').forEach(region => {
        const mapId = region.dataset.mapId;
        const iconEl = document.querySelector(`#map-events .special-event-container[data-map-id="${mapId}"] .special-event-visual`);
        const labelEl = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${mapId}"] .special-event-label`);
        const timerEl = document.querySelector(`#map-events .special-event-label-wrapper[data-map-id="${mapId}"] .special-event-timer`);
        if (!iconEl || !labelEl || !timerEl) return;

        const ir = iconEl.getBoundingClientRect();
        const lr = labelEl.getBoundingClientRect();
        const tr = timerEl.getBoundingClientRect();

        const pad = 16;
        const left = Math.min(ir.left, lr.left, tr.left) - wr.left - pad;
        const top = Math.min(ir.top, lr.top, tr.top) - wr.top - pad;
        const right = Math.max(ir.right, lr.right, tr.right) - wr.left + pad;
        const bottom = Math.max(ir.bottom, lr.bottom, tr.bottom) - wr.top + pad;

        region.style.left = `${left}px`;
        region.style.top = `${top}px`;
        region.style.width = `${Math.max(0, right - left)}px`;
        region.style.height = `${Math.max(0, bottom - top)}px`;
    });
}
