// js/home.js — Home screen orchestrator (imports from focused modules)

import { MAPS, EVENT_DATA, MAP_DEFAULTS, API_MAP_NAMES, BLOB } from './data.js';
import { enterMap, renderMapCards } from './app.js';
import { fetchEvents, MAIN_EVENT_NAMES } from './api.js';
import { formatTime } from './utils.js';
import { initPanel, updateSidePanel } from './ui/panel.js';
import {
    renderMapMarkers,
    renderMapEvents,
    renderMapNodes,
    renderUnifiedHoverRegions,
    updateMapNodes,
    updateLines,
    positionUnifiedHoverRegions,
    positionEventHoverRegions,
    getEventImage,
    getMainEventIcon,
    getMinorEventIcon
} from './ui/mapNodes.js';

// Initialize panel with icon lookup functions
initPanel(getEventImage, getMainEventIcon, getMinorEventIcon);

// --- State ---
let selectedMapId = 'dam';
let showingEventDetails = null; // 'MAIN', 'MINOR', 'DEFAULT', or null
let panelFading = false;
let sidePanelOpenedAt = 0;
let currentEvents = {}; // Map of mapId -> { main, minor, allUpcoming }
let timerInterval = null;
let eventFetchInterval = null;

// --- Helpers ---

function getMapById(id) {
    return MAPS.find(m => m.id === id);
}

// --- Core interaction ---

function selectHomeMap(mapId, mode) {
    if (mapId !== selectedMapId) {
        selectedMapId = mapId;
        if (!mode) mode = 'DEFAULT';
    }
    showingEventDetails = mode;

    // Bottom Cards
    document.querySelectorAll('#map-cards .map-card').forEach(card => {
        card.classList.toggle('home-selected', card.dataset.mapId === mapId);
    });

    updateMapNodes(currentEvents, selectedMapId, showingEventDetails, selectHomeMap);
    updateSidePanel(mapId, true, currentEvents, mode);

    // Open drawer on mobile
    const sidePanel = document.getElementById('home-side-panel');
    if (sidePanel && window.innerWidth <= 768) {
        sidePanelOpenedAt = Date.now();
        sidePanel.classList.add('open');
    }
}

// --- API fetch with UI feedback ---

async function doFetchEvents() {
    const result = await fetchEvents();
    if (result !== null) {
        currentEvents = result;
        // Hide any API failure message on success
        const errEl = document.getElementById('events-api-error');
        if (errEl) errEl.style.display = 'none';
    } else {
        // Show non-intrusive error message
        let errEl = document.getElementById('events-api-error');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.id = 'events-api-error';
            errEl.textContent = 'Live event data unavailable';
            errEl.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);' +
                'background:rgba(0,0,0,0.6);color:#ccc;font-size:11px;padding:4px 10px;' +
                'border-radius:4px;pointer-events:none;z-index:50;white-space:nowrap;';
            const wrapper = document.querySelector('.home-map-wrapper') || document.body;
            wrapper.appendChild(errEl);
        }
        errEl.style.display = 'block';
    }

    updateMapNodes(currentEvents, selectedMapId, showingEventDetails, selectHomeMap);
    if (selectedMapId) {
        updateSidePanel(selectedMapId, false, currentEvents, showingEventDetails);
    }
}

// --- Timers ---

function updateTimers() {
    const now = Date.now();

    updateMapNodes(currentEvents, selectedMapId, showingEventDetails, selectHomeMap);

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
                timerSection.style.display = 'none';
                doFetchEvents();
            }
        } else if (timerSection.dataset.startTime) {
            const start = parseInt(timerSection.dataset.startTime, 10);
            const left = start - now;
            if (left > 0) {
                timerValue.textContent = 'STARTS IN ' + formatTime(left);
            } else {
                doFetchEvents();
            }
        }
    }

    // Update upcoming timers
    document.querySelectorAll('.upcoming-timer').forEach(upTimer => {
        if (upTimer.dataset.startTime) {
            const start = parseInt(upTimer.dataset.startTime, 10);
            const left = start - now;
            if (left > 0) {
                upTimer.textContent = 'STARTS IN ' + formatTime(left);
            } else {
                doFetchEvents();
            }
        }
    });
}

// --- Wiring ---

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

function wireMapCardHovers() {
    let hoverTimeout = null;
    document.querySelectorAll('#map-cards .map-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768 && card.dataset.mapId) {
                // Debounce the heavy work (updateMapNodes, updateSidePanel)
                if (hoverTimeout) cancelAnimationFrame(hoverTimeout);
                hoverTimeout = requestAnimationFrame(() => {
                    selectHomeMap(card.dataset.mapId, 'DEFAULT');
                });
            }
        });
    });
}

// --- Init ---

function initHomeScreen() {
    // 1. Render
    if (typeof renderMapCards === 'function') renderMapCards();
    renderMapNodes(selectHomeMap);
    renderMapMarkers();
    renderMapEvents(selectHomeMap);
    renderUnifiedHoverRegions(selectHomeMap);
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
        if (Date.now() - sidePanelOpenedAt < 100) return;
        const sidePanel = document.getElementById('home-side-panel');
        if (sidePanel && sidePanel.classList.contains('open') && !sidePanel.contains(e.target)) {
            sidePanel.classList.remove('open');
        }
    });

    // Swipe-to-close
    const swipePanel = document.getElementById('home-side-panel');
    if (swipePanel) {
        let touchStartY = 0;
        let isSwiping = false;

        swipePanel.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = swipePanel.getBoundingClientRect();
            if (touch.clientY - rect.top < 60) {
                touchStartY = touch.clientY;
                isSwiping = true;
            }
        }, { passive: true });

        swipePanel.addEventListener('touchmove', () => {}, { passive: true });

        swipePanel.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndY - touchStartY > 100) {
                swipePanel.classList.remove('open');
            }
            isSwiping = false;
        }, { passive: true });
    }

    document.addEventListener('mobileMapSelected', (e) => {
        selectHomeMap(e.detail.mapId, 'DEFAULT');
    });

    // 2. Select Default
    updateSidePanel(selectedMapId, false, currentEvents, null);
    document.querySelectorAll('.map-node').forEach(n => n.classList.toggle('active-node', n.dataset.mapId === selectedMapId));
    document.querySelectorAll('.map-card').forEach(c => c.classList.toggle('home-selected', c.dataset.mapId === selectedMapId));

    // 3. Start Data Fetch
    doFetchEvents();

    // 4. Timers
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimers, 1000);

    // 5. Poll API every 5 mins
    if (eventFetchInterval) clearInterval(eventFetchInterval);
    eventFetchInterval = setInterval(doFetchEvents, 5 * 60 * 1000);
}

export { initHomeScreen };
