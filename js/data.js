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
    { id: 'stella_montis', name: 'Stella Montis',     image: 'images/maps/stella_montis_upper_original.png', preview: 'images/preview/stella_montis.jpg', width: 4096, height: 3072, border: 0,
      levels: {
          upper: { image: 'images/maps/stella_montis_lower_original.png', width: 5120, height: 3072 },
          lower: { image: 'images/maps/stella_montis_upper_original.png', width: 4096, height: 3072 }
      }
    }
];

const RARITIES = [
    { id: 'uncommon', label: 'Uncommon', color: '#4ade80' },
    { id: 'rare',     label: 'Rare',     color: '#60a5fa' },
    { id: 'epic',     label: 'Epic',     color: '#c084fc' }
];

const KEYS = [
    { id: 'dam_surveillance',     map: 'dam',          name: 'Dam Surveillance Key',          rarity: 'uncommon', coords: [2142, 2121],  location: 'Water Treatment Control — Southwestern Hallway', doorImage: 'images/doors/dam_battlegrounds/surveillance_door.webp', icon: 'images/keys/dam_battlegrounds_key.png' },
    { id: 'dam_staff_room',       map: 'dam',          name: 'Dam Staff Room Key',            rarity: 'uncommon', coords: [2039, 2780],  location: 'Research & Administration — First Floor', doorImage: 'images/doors/dam_battlegrounds/staff_room_door.webp', icon: 'images/keys/dam_battlegrounds_key.png' },
    { id: 'dam_testing_annex',    map: 'dam',          name: 'Dam Testing Annex Key',         rarity: 'rare',     coords: [1596, 3270], location: 'Testing Annex — Ground Floor (Two Doors)', doorImage: 'images/doors/dam_battlegrounds/testing_annex_door.jpg', icon: 'images/keys/dam_battlegrounds_key.png' },
    { id: 'dam_control_tower',    map: 'dam',          name: 'Dam Control Tower Key',         rarity: 'epic',     coords: [2119, 2795],  location: 'Control Tower — Top Floor', doorImage: 'images/doors/dam_battlegrounds/control_tower_door.webp', icon: 'images/keys/dam_battlegrounds_key.png' },
    { id: 'sp_trench_tower',      map: 'spaceport',    name: 'Spaceport Trench Tower Key',    rarity: 'uncommon', coords: [3628, 2679], location: 'North or South Trench Tower (Between West/East Hangers)', doorImage: 'images/doors/spaceport/trench_tower_door.webp', icon: 'images/keys/spaceport_key.png' },
    { id: 'sp_warehouse',         map: 'spaceport',    name: 'Spaceport Warehouse Key',       rarity: 'uncommon', coords: [3777, 2244], location: 'Shipping Warehouse — Top of Catwalk', doorImage: 'images/doors/spaceport/warehouse_door.jpg', icon: 'images/keys/spaceport_key.png' },
    { id: 'sp_ground_control',    map: 'spaceport',    name: 'Spaceport Ground Control Key',  rarity: 'uncommon', coords: [2574, 2584],  location: 'Ground Control Tower — Upper Level', doorImage: 'images/doors/spaceport/control_tower_door.webp', icon: 'images/keys/spaceport_key.png' },
    { id: 'sp_container_storage', map: 'spaceport',    name: 'Spaceport Container Storage Key', rarity: 'rare',   coords: [2472, 3012], location: 'Container Storage — Top Floor Red Door', doorImage: 'images/doors/spaceport/container_storage_doors.jpg', icon: 'images/keys/spaceport_key.png' },
    { id: 'sp_outskirts_bunker',  map: 'spaceport',    name: 'Spaceport Outskirts Bunker Key',  rarity: 'rare',   coords: [4005, 2550],  location: 'Outskirts Bunker — Western Map Boundary', icon: 'images/keys/spaceport_key.png' },
    { id: 'bc_residential',       map: 'buried_city',  name: 'Buried City Residential Master Key', rarity: 'uncommon', coords: [2016, 1727], location: 'Plaza Rosa Area / Grandioso Apartments', doorImage: 'images/doors/buried_city/residential_grandioso.jpg', icon: 'images/keys/buried_city_key.png' },
    { id: 'bc_jkv',               map: 'buried_city',  name: 'Buried City JKV Employee Card',      rarity: 'uncommon', coords: [2744, 2771], location: 'Space Travel Building — Northeast Section', doorImage: 'images/doors/buried_city/jkv_access_door.webp', icon: 'images/keys/buried_city_key.png' },
    { id: 'bc_hospital',          map: 'buried_city',  name: 'Buried City Hospital Key',           rarity: 'rare',     coords: [3335, 2411], location: 'Hospital — Third Floor Northwest', doorImage: 'images/doors/buried_city/hospital_door.webp', icon: 'images/keys/buried_city_key.png' },
    { id: 'bc_town_hall',         map: 'buried_city',  name: 'Buried City Town Hall Key',          rarity: 'epic',     coords: [2394, 2587],  location: 'Town Hall — Northern Side Ground Level', doorImage: 'images/doors/buried_city/town_hall_entrance.webp', icon: 'images/keys/buried_city_key.png' },
    { id: 'bg_village',           map: 'blue_gate',    name: 'Blue Gate Village Key',              rarity: 'uncommon', coords: [2884, 1714], location: 'Village — House with Barred Front Door', doorImage: 'images/doors/blue_gate/village_door.jpg', icon: 'images/keys/blue_gate_key_variant_1.png' },
    { id: 'bg_patrol_car',        map: 'blue_gate',    name: 'Blue Gate Patrol Car Key',           rarity: 'uncommon', coords: [2234, 2621], location: 'Traffic Tunnel — Armored Patrol Car Rear Door', icon: 'images/keys/patrol_car_key.png' },
    { id: 'bg_comm_tower',        map: 'blue_gate',    name: 'Blue Gate Communication Tower Key',  rarity: 'rare',     coords: [2876, 3600],  location: 'Communication Tower — Underground Storage Room', doorImage: 'images/doors/blue_gate/comm_tower_door.webp', icon: 'images/keys/blue_gate_key_variant_2.png' },
    { id: 'bg_cellar',            map: 'blue_gate',    name: 'Blue Gate Cellar Key',               rarity: 'rare',     coords: [1184, 2080], location: 'Cellar South of Ruined Homestead', doorImage: 'images/doors/blue_gate/cellar_door_1.webp', icon: 'images/keys/blue_gate_key_variant_1.png' },
    { id: 'bg_confiscation',      map: 'blue_gate',    name: 'Blue Gate Confiscation Room Key',    rarity: 'epic',     coords: [2583, 2481], location: 'Headhouse — Underground Tunnel System', doorImage: 'images/doors/blue_gate/confiscation_door.jpg', icon: 'images/keys/blue_gate_key_variant_2.png' },
    { id: 'sm_assembly',          map: 'stella_montis', name: 'Stella Montis Assembly Admin Key',        rarity: 'uncommon', coords: [2149, 2377], location: 'Assembly — Central Corridor (Western Section)',            level: 'upper', doorImage: 'images/doors/stella_montis/assembly_admin_door.webp', icon: 'images/keys/stella_montis_key.png' },
    { id: 'sm_medical',           map: 'stella_montis', name: 'Stella Montis Medical Storage Key',       rarity: 'uncommon', coords: [2502, 2370], location: 'Medical Research — North Side',                        level: 'upper', doorImage: 'images/doors/stella_montis/medical_storage_door.webp', icon: 'images/keys/stella_montis_key.png' },
    { id: 'sm_archives',          map: 'stella_montis', name: 'Stella Montis Archives Key',              rarity: 'rare',     coords: [1639, 4049], location: 'Seed Vault — End of Tunnels', level: 'lower', doorImage: 'images/doors/stella_montis/archives_storage_door.jpg', icon: 'images/keys/stella_montis_key.png' },
    { id: 'sm_security',          map: 'stella_montis', name: 'Stella Montis Security Checkpoint Key',   rarity: 'epic',     coords: [2832, 2353], location: 'Lobby — Northern Section',            level: 'upper', doorImage: 'images/doors/stella_montis/security_locked_room.jpg', icon: 'images/keys/stella_montis_key.png' },
    { id: 'hatch_dam_1',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [750, 2696],  location: 'Sunroof Hatch — Trees Above Ben Welder\'s Sunroof', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_dam_2',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [2770, 3750], location: 'Spillway Hatch — South of Red Lakes Berm', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_sp_1',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3376, 3267],  location: 'West Elevator Hatch — West of Departure Building', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_sp_2',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2394, 2081], location: 'Central Elevator Hatch — East of Arrival Building', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_bc_1',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [2965, 1802],  location: 'Cargo Elevator Hatch', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_bc_2',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [3904, 1487],  location: 'Metro Station Hatch', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_bg_1',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2711, 2851], location: 'Airshaft Extraction Point', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_bg_2',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3039, 4164],  location: 'Airshaft Extraction Point', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_sm_1',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [1520, 3288],  location: 'Assembly Workshops Hatch — Bottom Right of Assembly',  level: 'upper', icon: 'images/keys/raider_hatch_key.png' },
    { id: 'hatch_sm_2',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [996, 3420], location: 'Sandbox B Hatch — Very South of Map',     level: 'lower', icon: 'images/keys/raider_hatch_key.png' }
];

// Helper: get rarity object by id
function getRarity(rarityId) {
    return RARITIES.find(r => r.id === rarityId);
}

// Helper: get keys for a specific map, optionally filtered by rarity and level
function getKeysForMap(mapId, rarityId = null, level = null) {
    // For stella_montis, ignore level filtering and show all keys on both levels
    const shouldFilterLevel = mapId !== 'stella_montis' && level;
    return KEYS.filter(k => k.map === mapId && (!rarityId || k.rarity === rarityId) && (!shouldFilterLevel || !k.level || k.level === level));
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
