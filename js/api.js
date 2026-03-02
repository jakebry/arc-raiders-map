// js/api.js — API client for live event data

import { API_MAP_NAMES } from './data.js';

export const MAIN_EVENT_NAMES = [
    'Night Raid',
    'Electromagnetic Storm',
    'Cold Snap',
    'Locked Gate',
    'Hidden Bunker',
    'Hurricane'
];

/**
 * Fetch current and upcoming events from the API.
 * Returns a map of mapId -> { main, minor, allUpcoming } or null on failure.
 */
export async function fetchEvents() {
    const now = Date.now();
    const newEvents = {};

    try {
        let resultJson;
        try {
            // Use a relative same-origin path. In dev, Vite proxies this.
            // On Vercel, a rewrite proxies it. Avoids CORS everywhere.
            const response = await fetch('/api/arc-raiders/events-schedule');
            if (!response.ok) throw new Error('Network response was not ok');
            resultJson = await response.json();
        } catch (err) {
            console.error('Live API failed:', err);
            return null;
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

        return newEvents;
    } catch (error) {
        console.error('Error fetching events:', error);
        return null;
    }
}
