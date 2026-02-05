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

    const keys = getUniqueKeys(currentMap.id, currentRarity);

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
