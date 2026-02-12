// js/events.js — Live map events home screen logic

(function () {
    'use strict';

    // --- State ---
    let eventsData = [];          // raw API response data array
    let selectedMapId = 'dam';    // currently selected map on the home screen
    let timerInterval = null;     // 1-second countdown interval
    let refetchInterval = null;   // 5-minute re-fetch interval
    let panelFading = false;      // prevent rapid re-fade

    // --- Node positions (% based, relative to map container) ---
    const NODE_POSITIONS = {
        spaceport:     { left: '22%', top: '18%' },
        buried_city:   { left: '16%', top: '50%' },
        dam:           { left: '48%', top: '52%' },
        blue_gate:     { left: '65%', top: '48%' },
        stella_montis: { left: '68%', top: '20%' }
    };

    // --- Helpers ---

    /**
     * Convert API map name to internal map id
     */
    function apiMapToId(apiName) {
        return API_MAP_NAMES[apiName] || null;
    }

    /**
     * Get the MAPS entry by internal id
     */
    function getMapById(id) {
        return MAPS.find(m => m.id === id);
    }

    /**
     * Get currently active event for a map (now is between startTime and endTime)
     */
    function getCurrentEvent(mapId) {
        const now = Date.now();
        return eventsData.find(e => {
            const eid = apiMapToId(e.map);
            return eid === mapId && e.startTime <= now && e.endTime > now;
        }) || null;
    }

    /**
     * Get the next upcoming event for a map (startTime in the future)
     */
    function getUpcomingEvent(mapId) {
        const now = Date.now();
        const upcoming = eventsData
            .filter(e => apiMapToId(e.map) === mapId && e.startTime > now)
            .sort((a, b) => a.startTime - b.startTime);
        return upcoming[0] || null;
    }

    /**
     * Format milliseconds to "H:MM:SS"
     */
    function formatCountdown(ms) {
        if (ms <= 0) return '0:00:00';
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    /**
     * Get the best image for a map + event name combo.
     * Fallback chain: specific event image → map default image → map preview
     */
    function getEventImage(mapId, eventName) {
        if (eventName) {
            // Build kebab-case filename: "Electromagnetic Storm" -> "electromagnetic-storm"
            const kebab = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const specific = `images/events/${mapId}-${kebab}.jpg`;

            // We can't truly test file existence in the browser, so use a known list
            const knownImages = [
                'dam-husk-graveyard', 'dam-matriarch', 'dam-electromagnetic-storm',
                'spaceport-hidden-bunker', 'spaceport-matriarch', 'spaceport-default',
                'buried-city-night-raid', 'buried-city-cold-snap',
                'blue-gate-electromagnetic-storm', 'blue-gate-default'
            ];

            // Map IDs with hyphens for filename matching
            const fileMapId = mapId.replace(/_/g, '-');
            const fileKey = `${fileMapId}-${kebab}`;

            if (knownImages.includes(fileKey)) {
                return `images/events/${fileKey}.jpg`;
            }

            // Try map default image
            const defaultKey = `${fileMapId}-default`;
            if (knownImages.includes(defaultKey)) {
                return `images/events/${defaultKey}.jpg`;
            }
        }

        // Final fallback: map preview
        return `images/preview/${mapId}.jpg`;
    }

    /**
     * Get event info (static data) for an event name
     */
    function getEventInfo(eventName) {
        return EVENT_DATA[eventName] || null;
    }

    // --- Fetching ---

    async function fetchEvents() {
        try {
            const resp = await fetch('https://metaforge.app/api/arc-raiders/events-schedule');
            const json = await resp.json();
            if (json && Array.isArray(json.data)) {
                eventsData = json.data;
            }
        } catch (err) {
            console.warn('[Events] Failed to fetch events:', err);
        }
    }

    // --- Rendering ---

    /**
     * Render the 5 map nodes on the overhead map
     */
    function renderMapNodes() {
        const container = document.getElementById('map-nodes');
        if (!container) return;
        container.innerHTML = '';

        Object.keys(NODE_POSITIONS).forEach(mapId => {
            const pos = NODE_POSITIONS[mapId];
            const map = getMapById(mapId);
            if (!map) return;

            const current = getCurrentEvent(mapId);
            const upcoming = !current ? getUpcomingEvent(mapId) : null;

            const node = document.createElement('div');
            node.className = 'map-node' + (mapId === selectedMapId ? ' selected' : '');
            node.dataset.mapId = mapId;
            node.style.left = pos.left;
            node.style.top = pos.top;

            // Determine event label and timer text for the node
            let eventLabel = '';
            let timerText = '';
            if (current) {
                const info = getEventInfo(current.name);
                eventLabel = current.name;
                timerText = formatCountdown(current.endTime - Date.now());
            } else if (upcoming) {
                eventLabel = upcoming.name;
                timerText = 'in ' + formatCountdown(upcoming.startTime - Date.now());
            }

            node.innerHTML = `
                <div class="map-node-dot"></div>
                <div class="map-node-pulse"></div>
                <div class="map-node-label">
                    <span class="map-node-name">${map.name}</span>
                    ${eventLabel ? `<span class="map-node-event">${eventLabel}</span>` : ''}
                    ${timerText ? `<span class="map-node-timer" data-map-node-timer="${mapId}">${timerText}</span>` : ''}
                </div>
            `;

            // Hover / click to select
            node.addEventListener('mouseenter', () => selectMap(mapId));
            node.addEventListener('click', () => selectMap(mapId));

            container.appendChild(node);
        });
    }

    /**
     * Update the side panel with the selected map's event info
     */
    function updateSidePanel(mapId, animate) {
        const panel = document.getElementById('event-card');
        if (!panel) return;

        const map = getMapById(mapId);
        if (!map) return;

        const current = getCurrentEvent(mapId);
        const upcoming = !current ? getUpcomingEvent(mapId) : null;
        const event = current || upcoming;
        const eventInfo = event ? getEventInfo(event.name) : null;
        const defaults = MAP_DEFAULTS[mapId];

        // Determine values
        const mapName = map.name;
        const eventName = event ? event.name : 'No Active Event';
        const description = eventInfo ? eventInfo.description : (defaults ? defaults.description : '');
        const difficulty = eventInfo ? eventInfo.difficulty : (defaults ? defaults.difficulty : 3);
        const multiplier = eventInfo ? eventInfo.multiplier : null;
        const modifiers = eventInfo ? eventInfo.modifiers : [];
        const imageSrc = getEventImage(mapId, event ? event.name : null);

        // Timer
        let timerLabel = '';
        let timerValue = '—';
        if (current) {
            timerLabel = 'ENDS IN';
            timerValue = formatCountdown(current.endTime - Date.now());
        } else if (upcoming) {
            timerLabel = 'STARTS IN';
            timerValue = formatCountdown(upcoming.startTime - Date.now());
        }

        const doUpdate = () => {
            // Image
            const imgEl = document.getElementById('event-card-image');
            if (imgEl) imgEl.src = imageSrc;

            // Multiplier badge
            const multEl = document.getElementById('event-card-multiplier');
            if (multEl) {
                multEl.textContent = multiplier || '';
                multEl.style.display = multiplier ? 'flex' : 'none';
            }

            // Text
            const mapNameEl = document.getElementById('event-card-map-name');
            if (mapNameEl) mapNameEl.textContent = mapName;

            const eventNameEl = document.getElementById('event-card-event-name');
            if (eventNameEl) {
                eventNameEl.textContent = eventName;
                eventNameEl.classList.toggle('active-event', !!current);
                eventNameEl.classList.toggle('upcoming-event', !current && !!upcoming);
            }

            const descEl = document.getElementById('event-card-description');
            if (descEl) descEl.textContent = description;

            // Modifiers
            const modEl = document.getElementById('event-card-modifiers');
            if (modEl) {
                if (modifiers.length > 0) {
                    modEl.innerHTML = modifiers.map(m => `<span class="modifier-tag">${m}</span>`).join('');
                    modEl.style.display = 'flex';
                } else {
                    modEl.innerHTML = '';
                    modEl.style.display = 'none';
                }
            }

            // Difficulty pips
            const pipsEl = document.getElementById('difficulty-pips');
            if (pipsEl) {
                let pipsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    pipsHtml += `<span class="pip ${i <= difficulty ? 'filled' : ''}"></span>`;
                }
                pipsEl.innerHTML = pipsHtml;
            }

            // Timer
            const timerLabelEl = document.getElementById('timer-label');
            if (timerLabelEl) timerLabelEl.textContent = timerLabel;
            const timerValueEl = document.getElementById('timer-value');
            if (timerValueEl) timerValueEl.textContent = timerValue || '—';

            // Show/hide timer section
            const timerSection = document.getElementById('event-card-timer');
            if (timerSection) {
                timerSection.style.display = (current || upcoming) ? 'flex' : 'none';
            }
        };

        if (animate && !panelFading) {
            panelFading = true;
            const body = panel.querySelector('.event-card-body');
            const imgWrap = panel.querySelector('.event-card-image-wrap');
            if (body) body.classList.add('fade-out');
            if (imgWrap) imgWrap.classList.add('fade-out');

            setTimeout(() => {
                doUpdate();
                if (body) {
                    body.classList.remove('fade-out');
                    body.classList.add('fade-in');
                }
                if (imgWrap) {
                    imgWrap.classList.remove('fade-out');
                    imgWrap.classList.add('fade-in');
                }
                setTimeout(() => {
                    if (body) body.classList.remove('fade-in');
                    if (imgWrap) imgWrap.classList.remove('fade-in');
                    panelFading = false;
                }, 300);
            }, 200);
        } else {
            doUpdate();
        }
    }

    /**
     * Select a map: update node highlight + side panel
     */
    function selectMap(mapId) {
        if (mapId === selectedMapId && document.querySelector('.map-node.selected')) return;
        selectedMapId = mapId;

        // Update node selection states
        document.querySelectorAll('.map-node').forEach(n => {
            n.classList.toggle('selected', n.dataset.mapId === mapId);
        });

        updateSidePanel(mapId, true);
    }

    /**
     * Start the 1-second countdown timers
     */
    function startTimers() {
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            const now = Date.now();

            // Update side panel timer
            const current = getCurrentEvent(selectedMapId);
            const upcoming = !current ? getUpcomingEvent(selectedMapId) : null;

            const timerValueEl = document.getElementById('timer-value');
            const timerLabelEl = document.getElementById('timer-label');

            if (current) {
                const remaining = current.endTime - now;
                if (remaining <= 0) {
                    // Event expired — refresh display
                    renderMapNodes();
                    updateSidePanel(selectedMapId, true);
                    return;
                }
                if (timerLabelEl) timerLabelEl.textContent = 'ENDS IN';
                if (timerValueEl) timerValueEl.textContent = formatCountdown(remaining);
            } else if (upcoming) {
                const until = upcoming.startTime - now;
                if (until <= 0) {
                    // Event just started — refresh
                    renderMapNodes();
                    updateSidePanel(selectedMapId, true);
                    return;
                }
                if (timerLabelEl) timerLabelEl.textContent = 'STARTS IN';
                if (timerValueEl) timerValueEl.textContent = formatCountdown(until);
            } else {
                if (timerValueEl) timerValueEl.textContent = '—';
            }

            // Update all node timers
            document.querySelectorAll('[data-map-node-timer]').forEach(el => {
                const nodeMapId = el.dataset.mapNodeTimer;
                const cur = getCurrentEvent(nodeMapId);
                const up = !cur ? getUpcomingEvent(nodeMapId) : null;

                if (cur) {
                    const r = cur.endTime - now;
                    el.textContent = r > 0 ? formatCountdown(r) : '0:00:00';
                    if (r <= 0) {
                        // Will get cleaned up on next renderMapNodes
                        renderMapNodes();
                    }
                } else if (up) {
                    const u = up.startTime - now;
                    el.textContent = u > 0 ? 'in ' + formatCountdown(u) : '0:00:00';
                    if (u <= 0) {
                        renderMapNodes();
                    }
                }
            });
        }, 1000);
    }

    /**
     * Wire up the INSPECT button
     */
    function wireInspectButton() {
        const btn = document.getElementById('event-card-inspect-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const map = getMapById(selectedMapId);
            if (map && typeof enterMap === 'function') {
                enterMap(map);
            }
        });
    }

    // --- Init ---

    /**
     * Main entry: fetch events, render UI, start timers
     * Called from app.js DOMContentLoaded instead of renderMapCards()
     */
    async function initEventScreen() {
        await fetchEvents();

        renderMapNodes();
        updateSidePanel(selectedMapId, false);
        wireInspectButton();
        startTimers();

        // Re-fetch every 5 minutes
        if (refetchInterval) clearInterval(refetchInterval);
        refetchInterval = setInterval(async () => {
            await fetchEvents();
            renderMapNodes();
            updateSidePanel(selectedMapId, false);
        }, 5 * 60 * 1000);
    }

    // Expose globally
    window.initEventScreen = initEventScreen;

})();
