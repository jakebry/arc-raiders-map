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
    { id: 'stella_montis', name: 'Stella Montis',     image: 'images/maps/stella_montis_upper.jpg', preview: 'images/preview/stella_montis.jpg', width: 4896, height: 3872, border: 400,
      levels: {
          upper: { image: 'images/maps/stella_montis_upper.jpg', width: 4896, height: 3872 },
          lower: { image: 'images/maps/stella_montis_lower.jpg', width: 4896, height: 3258 }
      }
    }
];

const RARITIES = [
    { id: 'uncommon', label: 'Uncommon', color: '#4ade80' },
    { id: 'rare',     label: 'Rare',     color: '#60a5fa' },
    { id: 'epic',     label: 'Epic',     color: '#c084fc' }
];

const KEYS = [
    { id: 'dam_surveillance',     map: 'dam',          name: 'Dam Surveillance Key',          rarity: 'uncommon', coords: [3593, 3011],  location: 'Water Treatment Control — Southwestern Hallway' },
    { id: 'dam_staff_room',       map: 'dam',          name: 'Dam Staff Room Key',            rarity: 'uncommon', coords: [3577, 1169],  location: 'Research & Administration — First Floor' },
    { id: 'dam_testing_annex',    map: 'dam',          name: 'Dam Testing Annex Key',         rarity: 'rare',     coords: [2190, 823], location: 'Testing Annex — Ground Floor (Two Doors)' },
    { id: 'dam_control_tower',    map: 'dam',          name: 'Dam Control Tower Key',         rarity: 'epic',     coords: [3946, 1105],  location: 'Control Tower — Top Floor' },
    { id: 'sp_trench_tower',      map: 'spaceport',    name: 'Spaceport Trench Tower Key',    rarity: 'uncommon', coords: [2041, 4185], location: 'North or South Trench Tower (Between West/East Hangers)' },
    { id: 'sp_warehouse',         map: 'spaceport',    name: 'Spaceport Warehouse Key',       rarity: 'uncommon', coords: [4412, 1153], location: 'Shipping Warehouse — Top of Catwalk' },
    { id: 'sp_ground_control',    map: 'spaceport',    name: 'Spaceport Ground Control Key',  rarity: 'uncommon', coords: [2376, 2133],  location: 'Ground Control Tower — Upper Level' },
    { id: 'sp_container_storage', map: 'spaceport',    name: 'Spaceport Container Storage Key', rarity: 'rare',   coords: [914, 1380], location: 'Container Storage — Top Floor Red Door' },
    { id: 'sp_outskirts_bunker',  map: 'spaceport',    name: 'Spaceport Outskirts Bunker Key',  rarity: 'rare',   coords: [3610, 2108],  location: 'Outskirts Bunker — Western Map Boundary' },
    { id: 'bc_residential',       map: 'buried_city',  name: 'Buried City Residential Master Key', rarity: 'uncommon', coords: [877, 1964], location: 'Plaza Rosa Area / Grandioso Apartments' },
    { id: 'bc_jkv',               map: 'buried_city',  name: 'Buried City JKV Employee Card',      rarity: 'uncommon', coords: [2766, 3694], location: 'Space Travel Building — Northeast Section' },
    { id: 'bc_hospital',          map: 'buried_city',  name: 'Buried City Hospital Key',           rarity: 'rare',     coords: [917, 1971], location: 'Hospital — Third Floor Northwest' },
    { id: 'bc_town_hall',         map: 'buried_city',  name: 'Buried City Town Hall Key',          rarity: 'epic',     coords: [3603, 1578],  location: 'Town Hall — Northern Side Ground Level' },
    { id: 'bg_village',           map: 'blue_gate',    name: 'Blue Gate Village Key',              rarity: 'uncommon', coords: [1763, 1920], location: 'Village — House with Barred Front Door' },
    { id: 'bg_patrol_car',        map: 'blue_gate',    name: 'Blue Gate Patrol Car Key',           rarity: 'uncommon', coords: [1063, 2481], location: 'Traffic Tunnel — Armored Patrol Car Rear Door' },
    { id: 'bg_comm_tower',        map: 'blue_gate',    name: 'Blue Gate Communication Tower Key',  rarity: 'rare',     coords: [701, 4232],  location: 'Communication Tower — Underground Storage Room' },
    { id: 'bg_cellar',            map: 'blue_gate',    name: 'Blue Gate Cellar Key',               rarity: 'rare',     coords: [2084, 3334], location: 'Cellar South of Ruined Homestead' },
    { id: 'bg_confiscation',      map: 'blue_gate',    name: 'Blue Gate Confiscation Room Key',    rarity: 'epic',     coords: [1563, 2509], location: 'Headhouse — Underground Tunnel System' },
    { id: 'sm_assembly',          map: 'stella_montis', name: 'Stella Montis Assembly Admin Key',        rarity: 'uncommon', coords: [1405, 2427], location: 'Assembly — Central Corridor (Western Section)',            level: 'upper' },
    { id: 'sm_medical',           map: 'stella_montis', name: 'Stella Montis Medical Storage Key',       rarity: 'uncommon', coords: [1664, 2026], location: 'Medical Research — North Side',                        level: 'upper' },
    { id: 'sm_archives',          map: 'stella_montis', name: 'Stella Montis Archives Key',              rarity: 'rare',     coords: [1125, 1018], location: 'Seed Vault — End of Tunnels', level: 'lower' },
    { id: 'sm_security',          map: 'stella_montis', name: 'Stella Montis Security Checkpoint Key',   rarity: 'epic',     coords: [2004, 833], location: 'Lobby — Northern Section',            level: 'upper' },
    { id: 'hatch_dam_1',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [686, 2674],  location: 'Sunroof Hatch — Trees Above Ben Welder\'s Sunroof' },
    { id: 'hatch_dam_2',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [1565, 4253], location: 'Spillway Hatch — South of Red Lakes Berm' },
    { id: 'hatch_sp_1',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3745, 2647],  location: 'West Elevator Hatch — West of Departure Building' },
    { id: 'hatch_sp_2',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [1166, 2092], location: 'Central Elevator Hatch — East of Arrival Building' },
    { id: 'hatch_bc_1',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [2700, 1677],  location: 'Cargo Elevator Hatch' },
    { id: 'hatch_bc_2',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [3904, 1487],  location: 'Metro Station Hatch' },
    { id: 'hatch_bg_1',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2711, 2851], location: 'Airshaft Extraction Point' },
    { id: 'hatch_bg_2',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3039, 4164],  location: 'Airshaft Extraction Point' },
    { id: 'hatch_sm_1',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [1303, 2569],  location: 'Assembly Workshops Hatch — Bottom Right of Assembly',  level: 'upper' },
    { id: 'hatch_sm_2',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [928, 2247], location: 'Sandbox B Hatch — Very South of Map',     level: 'lower' }
];

// Helper: get rarity object by id
function getRarity(rarityId) {
    return RARITIES.find(r => r.id === rarityId);
}

// Helper: get keys for a specific map, optionally filtered by rarity and level
function getKeysForMap(mapId, rarityId = null, level = null) {
    return KEYS.filter(k => k.map === mapId && (!rarityId || k.rarity === rarityId) && (!level || !k.level || k.level === level));
}

// Helper: get unique keys for a map (collapses Raider Hatch duplicates into one list entry)
function getUniqueKeys(mapId, rarityId = null, level = null) {
    const keys = getKeysForMap(mapId, rarityId, level);
    const seen = new Set();
    return keys.filter(k => {
        if (seen.has(k.name)) return false;
        seen.add(k.name);
        return true;
    });
}
