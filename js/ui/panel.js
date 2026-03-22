// js/ui/panel.js — Side panel UI rendering for the home screen

import { MAPS, EVENT_DATA, MAP_DEFAULTS } from '../data.js';
import { MAIN_EVENT_NAMES } from '../api.js';
import { formatTime } from '../utils.js';

// --- Icon helpers (imported dynamically to avoid circular deps; passed in via init) ---
let _getEventImage = null;
let _getMainEventIcon = null;
let _getMinorEventIcon = null;

/**
 * Initialize panel with icon lookup functions from mapNodes module.
 * Call this once before using updateSidePanel.
 */
export function initPanel(getEventImage, getMainEventIcon, getMinorEventIcon) {
    _getEventImage = getEventImage;
    _getMainEventIcon = getMainEventIcon;
    _getMinorEventIcon = getMinorEventIcon;
}

let panelFading = false;

/**
 * Update the home side panel for a given map and show mode.
 * showMode: 'DEFAULT' | 'MAIN' | 'MINOR'
 */
export function updateSidePanel(mapId, animate, currentEvents, showMode = null) {
    const panel = document.getElementById('home-card');
    const upcomingPanel = document.getElementById('home-card-upcoming');
    if (!panel) return;

    const map = MAPS.find(m => m.id === mapId);
    if (!map) return;

    const events = currentEvents[mapId] || { main: null, minor: null };
    const defaults = MAP_DEFAULTS[mapId];
    const now = Date.now();

    // 1. Determine Primary Content (Current State)
    let primaryEvent = null;
    let isMinorMode = false;

    if (showMode === 'DEFAULT' || showMode === 'MINOR') {
        if (events.minor && events.minor.startTime <= now && events.minor.endTime > now) {
            primaryEvent = events.minor;
            isMinorMode = true;
        }
    } else if (events.main) {
        if (showMode === 'MAIN' || (events.main.startTime <= now && events.main.endTime > now)) {
            primaryEvent = events.main;
        }
    }

    // --- PRIMARY CARD DATA ---
    let topLabel = '';
    let mainTitle = '';
    let description = defaults ? defaults.description : '';
    let difficulty = defaults ? defaults.difficulty : 3;
    let imageSrc = _getEventImage(mapId, null);
    let modifiers = [];
    let multiplier = null;
    let endTime = null;
    let isFuture = false;

    if (primaryEvent) {
        topLabel = map.name;
        mainTitle = primaryEvent.name;
        imageSrc = _getEventImage(mapId, primaryEvent.name);

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
                ? (isMinorMode ? _getMinorEventIcon(primaryEvent.name) : _getMainEventIcon(primaryEvent.name))
                : null;
            if (iconSrc) {
                iconImg.src = iconSrc;
                iconImg.classList.remove('scale-up', 'scale-down', 'is-main-svg', 'is-matriarch');

                if (!isMinorMode && primaryEvent) {
                    if (primaryEvent.name === 'Matriarch') {
                        iconImg.classList.add('is-matriarch');
                    } else {
                        iconImg.classList.add('is-main-svg');
                    }
                }

                iconZone.style.display = 'block';
            } else {
                iconZone.style.display = 'none';
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

        // Primary Timer
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
        const upcomingWithin120Mins = allUpcoming.filter(item => (item.startTime - now) <= (120 * 60 * 1000));

        if (upcomingWithin120Mins.length > 0 && upcomingPanel) {
            upcomingPanel.style.display = 'flex';
            const upcomingList = document.getElementById('upcoming-events-list');
            if (upcomingList) {
                upcomingList.innerHTML = '';
                upcomingWithin120Mins.forEach(item => {
                    const isMain = MAIN_EVENT_NAMES.includes(item.name);
                    const iconSrc = isMain ? _getMainEventIcon(item.name) : _getMinorEventIcon(item.name);
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
        const body = panel.querySelector('.home-card-body');
        const imgWrap = panel.querySelector('.home-card-image-wrap');
        const iconZone = panel.querySelector('.home-card-icon-zone');

        if (body) body.classList.add('fade-out');
        if (imgWrap) imgWrap.classList.add('fade-out');
        if (iconZone) iconZone.classList.add('fade-out');

        // Preload the new image before fading in to prevent stale image flash
        const preload = new Image();
        preload.src = imageSrc;
        const onReady = () => {
            doUpdate();
            if (body) { body.classList.remove('fade-out'); body.classList.add('fade-in'); }
            if (imgWrap) { imgWrap.classList.remove('fade-out'); imgWrap.classList.add('fade-in'); }
            if (iconZone) { iconZone.classList.remove('fade-out'); iconZone.classList.add('fade-in'); }

            setTimeout(() => {
                if (body) body.classList.remove('fade-in');
                if (imgWrap) imgWrap.classList.remove('fade-in');
                if (iconZone) iconZone.classList.remove('fade-in');
                panelFading = false;
            }, 300);
        };

        setTimeout(() => {
            // If image already cached, fire immediately; otherwise wait for load (max 500ms)
            if (preload.complete) {
                onReady();
            } else {
                const timeout = setTimeout(onReady, 500); // fallback if image takes too long
                preload.onload = () => { clearTimeout(timeout); onReady(); };
                preload.onerror = () => { clearTimeout(timeout); onReady(); };
            }
        }, 200);
    } else {
        doUpdate();
    }
}
