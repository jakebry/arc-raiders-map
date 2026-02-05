// js/data.js
// All coordinates are [y, x] in pixel space matching each map's width/height.
// These are PLACEHOLDERS — refine once pin positions are verified on the real map images.

// border: pixels of blurred extension added on each side of the original map image.
// Coordinates inside KEYS are relative to the full (extended) image.
// The original map content sits at [border, border] to [height-border, width-border].
const MAPS = [
    { id: 'dam',           name: 'Dam Battlegrounds', image: 'images/maps/dam.jpg',           preview: 'images/preview/dam.jpg',           width: 4896, height: 4540, border: 400 },
    { id: 'spaceport',     name: 'Spaceport',         image: 'images/maps/spaceport.jpg',     preview: 'images/preview/spaceport.jpg',     width: 4896, height: 4896, border: 400 },
    { id: 'buried_city',   name: 'Buried City',       image: 'images/maps/buried_city.jpg',   preview: 'images/preview/buried_city.jpg',   width: 4896, height: 4896, border: 400 },
    { id: 'blue_gate',     name: 'Blue Gate',         image: 'images/maps/blue_gate.jpg',     preview: 'images/preview/blue_gate.jpg',     width: 4896, height: 3872, border: 400 },
    { id: 'stella_montis', name: 'Stella Montis',     image: 'images/maps/stella_montis.jpg', preview: 'images/preview/stella_montis.jpg', width: 4896, height: 6378, border: 400 }
];

const RARITIES = [
    { id: 'uncommon', label: 'Uncommon', color: '#4ade80' },
    { id: 'rare',     label: 'Rare',     color: '#60a5fa' },
    { id: 'epic',     label: 'Epic',     color: '#c084fc' }
];

const KEYS = [
    // --- Dam Battlegrounds ---
    { id: 'dam_surveillance',     map: 'dam',          name: 'Dam Surveillance Key',          rarity: 'uncommon', coords: [1222, 1600],  location: 'Water Treatment Control Room' },
    { id: 'dam_staff_room',       map: 'dam',          name: 'Dam Staff Room Key',            rarity: 'uncommon', coords: [948, 3200],  location: 'Control Tower — Staff Quarters' },
    { id: 'dam_utility',          map: 'dam',          name: 'Dam Utility Key',               rarity: 'uncommon', coords: [2591, 2200], location: 'Utility Room (Lower Level)' },
    { id: 'dam_testing_annex',    map: 'dam',          name: 'Dam Testing Annex Key',         rarity: 'rare',     coords: [2044, 3600], location: 'Testing Annex — Two Doors Inside' },
    { id: 'dam_control_tower',    map: 'dam',          name: 'Dam Control Center Tower Key',  rarity: 'epic',     coords: [857, 3000],  location: 'Control Tower — Upper Level Room' },

    // --- Spaceport ---
    { id: 'sp_trench_tower',      map: 'spaceport',    name: 'Spaceport Trench Tower Key',    rarity: 'uncommon', coords: [1800, 2000], location: 'North & South Trench Towers' },
    { id: 'sp_warehouse',         map: 'spaceport',    name: 'Spaceport Warehouse Key',       rarity: 'uncommon', coords: [3000, 3400], location: 'Shipping Warehouse — Upper Floors' },
    { id: 'sp_ground_control',    map: 'spaceport',    name: 'Spaceport Ground Control Key',  rarity: 'uncommon', coords: [1200, 2600],  location: 'Control Tower A6 — Upper Level' },
    { id: 'sp_container_storage', map: 'spaceport',    name: 'Spaceport Container Storage Key', rarity: 'rare',   coords: [1400, 3800], location: 'Container Storage — Top Floor Red Door' },
    { id: 'sp_outskirts_bunker',  map: 'spaceport',    name: 'Spaceport Outskirts Bunker Key',  rarity: 'rare',   coords: [3600, 1000],  location: 'Outskirts Bunker' },

    // --- Buried City ---
    { id: 'bc_residential',       map: 'buried_city',  name: 'Buried City Residential Master Key', rarity: 'uncommon', coords: [2000, 1800], location: 'Multiple Apartment Doors' },
    { id: 'bc_jkv',               map: 'buried_city',  name: 'Buried City JKV Employee Card',      rarity: 'uncommon', coords: [2400, 3000], location: 'Space Travel Building — Fourth Floor' },
    { id: 'bc_hospital',          map: 'buried_city',  name: 'Buried City Hospital Key',           rarity: 'rare',     coords: [1600, 3400], location: 'Hospital — Third Floor Room' },
    { id: 'bc_town_hall',         map: 'buried_city',  name: 'Buried City Town Hall Key',          rarity: 'epic',     coords: [1200, 2200],  location: 'Town Hall — Main Door' },

    // --- Blue Gate ---
    { id: 'bg_village',           map: 'blue_gate',    name: 'Blue Gate Village Key',              rarity: 'uncommon', coords: [2050, 1400], location: 'Old Village Building Entrance' },
    { id: 'bg_patrol_car',        map: 'blue_gate',    name: 'Blue Gate Patrol Car Key',           rarity: 'uncommon', coords: [2650, 2800], location: 'Patrol Car — Rear Door' },
    { id: 'bg_comm_tower',        map: 'blue_gate',    name: 'Blue Gate Communication Tower Key',  rarity: 'rare',     coords: [850, 3200],  location: 'Communication Tower — Locked Room' },
    { id: 'bg_cellar',            map: 'blue_gate',    name: 'Blue Gate Cellar Key',               rarity: 'rare',     coords: [2200, 1600], location: 'Village Building — Cellar Door' },
    { id: 'bg_confiscation',      map: 'blue_gate',    name: 'Blue Gate Confiscation Room Key',    rarity: 'epic',     coords: [1750, 3600], location: 'Tunnel Networks — Confiscation Room' },

    // --- Stella Montis ---
    { id: 'sm_assembly',          map: 'stella_montis', name: 'Stella Montis Assembly Admin Key',        rarity: 'uncommon', coords: [1300, 2200], location: 'Assembly Hallway — Locked Door' },
    { id: 'sm_medical',           map: 'stella_montis', name: 'Stella Montis Medical Storage Key',       rarity: 'uncommon', coords: [2350, 2600], location: 'Medical Storage Area' },
    { id: 'sm_archives',          map: 'stella_montis', name: 'Stella Montis Archives Key',              rarity: 'rare',     coords: [4320, 3400],  location: 'Seat Vault Area — Tunnel End Door (Lower Level)' },
    { id: 'sm_security',          map: 'stella_montis', name: 'Stella Montis Security Checkpoint Key',   rarity: 'epic',     coords: [1600, 1000],  location: 'Security Checkpoint Access Point' },

    // --- Special: Raider Hatch Key (multiple pins per map) ---
    { id: 'hatch_dam_1',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [1678, 1200],  location: 'Extraction Hatch — Swamp Edge' },
    { id: 'hatch_dam_2',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [3139, 2400], location: 'Extraction Hatch — East Ruins' },
    { id: 'hatch_sp_1',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [900, 1400],  location: 'Extraction Hatch — Launch Pad Area' },
    { id: 'hatch_sp_2',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3800, 3200], location: 'Extraction Hatch — South Terminal' },
    { id: 'hatch_bc_1',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [1000, 2600],  location: 'Extraction Hatch — Market Square' },
    { id: 'hatch_bc_2',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [3600, 1200],  location: 'Extraction Hatch — Sand Dunes' },
    { id: 'hatch_bg_1',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [1150, 3800], location: 'Extraction Hatch — Mountain Ridge' },
    { id: 'hatch_bg_2',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2500, 1000],  location: 'Extraction Hatch — Underground Exit' },
    { id: 'hatch_sm_1',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [700, 2800],  location: 'Extraction Hatch — Assembly Roof' },
    { id: 'hatch_sm_2',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [5020, 1800], location: 'Extraction Hatch — Lower Tunnels' }
];

// Helper: get rarity object by id
function getRarity(rarityId) {
    return RARITIES.find(r => r.id === rarityId);
}

// Helper: get keys for a specific map, optionally filtered by rarity
function getKeysForMap(mapId, rarityId = null) {
    return KEYS.filter(k => k.map === mapId && (!rarityId || k.rarity === rarityId));
}

// Helper: get unique keys for a map (collapses Raider Hatch duplicates into one list entry)
function getUniqueKeys(mapId, rarityId = null) {
    const keys = getKeysForMap(mapId, rarityId);
    const seen = new Set();
    return keys.filter(k => {
        if (seen.has(k.name)) return false;
        seen.add(k.name);
        return true;
    });
}
