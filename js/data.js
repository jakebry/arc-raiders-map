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
    { id: 'epic',     label: 'Epic',     color: '#CD3197' }
];

const KEYS = [
    { id: 'dam_surveillance',     map: 'dam',          name: 'Dam Surveillance Key',          rarity: 'uncommon', coords: [2142, 2121],  location: 'Water Treatment Control — Southwestern Hallway', doorImage: 'images/doors/dam_battlegrounds/surveillance_door.webp', icon: 'images/keys/dam_battlegrounds_key.png',
        description: 'Unlocks a door in the Water Treatment Control building in The Dam.',
        instructions: 'Surveillance Key opens a room in Water Treatment Control, a building in the southwest of the map, on the edge of the swamps. To enter the room, go northwest from the Water Treatment Elevator extraction, then go down to the door on the building\'s south side. Enter it and turn right, go through the alarm gate, and turn right again. It\'s the door opposite the camera. Even on its own, this location usually has decent loot and can even spawn a weapon crate. The room, however, does not always spawn something decent. It has a chance for a weapon crate spawn, but funnily enough, you have a higher chance of finding a better gun inside the lockers in this room.',
        weight: 0.25, value: 100 },
    { id: 'dam_staff_room',       map: 'dam',          name: 'Dam Staff Room Key',            rarity: 'uncommon', coords: [2039, 2780],  location: 'Research & Administration — First Floor', doorImage: 'images/doors/dam_battlegrounds/staff_room_door.webp', icon: 'images/keys/dam_battlegrounds_key.png',
        description: 'Unlocks a door in the Research and Administration building on Dam Battlegrounds.',
        instructions: 'It\'s on the first floor of the building. You can get there virtually from any side of the building, except east and south. It\'s the door opposite the western entrance. The entrance is usually guarded by a Bombardier or a Bastion. The loot here is usually subpar, so if you\'re disappointed by what you got, you can get out of the room, turn left, and go up on the rappel inside the elevator shaft. The second floor of this building usually has quite decent staff spawning there, especially if you\'re looking for Trinkets or Medical loot.',
        weight: 0.25, value: 100 },
    { id: 'dam_testing_annex',    map: 'dam',          name: 'Dam Testing Annex Key',         rarity: 'rare',     coords: [1596, 3270], location: 'Testing Annex — Ground Floor (Two Doors)', doorImage: 'images/doors/dam_battlegrounds/testing_annex_door.jpg', icon: 'images/keys/dam_battlegrounds_key.png',
        description: 'Unlocks a door in the Testing Annex on Dam Battlegrounds.',
        instructions: 'It\'s in the name. Go to the southeast side of the map. The location has an extraction available close to it, and because of it, the second floor or the roof of the building is often occupied by campers by the end of the round. It\'s quite a popular place, so be extra careful when looting it. One special thing about this key is that it can open one of the two doors that are located on the ground floor of the building. You can quickly reach the doors by going through the parking lot entrance, facing the Control Tower. It\'s often guarded by a Rocketeer or a Leaper.',
        weight: 0.25, value: 100 },
    { id: 'dam_control_tower',    map: 'dam',          name: 'Dam Control Tower Key',         rarity: 'epic',     coords: [2119, 2795],  location: 'Control Tower — Top Floor', doorImage: 'images/doors/dam_battlegrounds/control_tower_door.webp', icon: 'images/keys/dam_battlegrounds_key.png',
        description: 'Unlocks a door inside Control Tower on Dam Battlegrounds.',
        instructions: 'The Dam Control Tower Key opens a room that\'s often the cause of the most raider deaths on Dam Battlegrounds. No wonder, as it\'s one of the best Dam Battlegrounds key room locations. If you want to open the room, first of all, you have to be lucky with your spawn. Secondly, you need to rush towards the room as fast as you can, as other people with the key are already running there fullspeed. Thirdly, you need to take at least a couple of grenades and mines. This room has only one exit, which is frequently camped if you didn\'t bother to take mines with you to signal the presence of the enemy. This room has lots of great loot, with rare materials and weapons spawning here. Sometimes it also spawns a security locker, and if you go outside one of the windows locked by the roller shutters, you can find a raider stash. It\'s on the very top of the building. You can get there by rappelling up the elevator shaft. Watch out for Turrets that often guard the shaft.',
        weight: 0.25, value: 100 },
    { id: 'sp_trench_tower',      map: 'spaceport',    name: 'Spaceport Trench Tower Key',    rarity: 'uncommon', coords: [3628, 2679], location: 'North or South Trench Tower (Between West/East Hangers)', doorImage: 'images/doors/spaceport/trench_tower_door.webp', icon: 'images/keys/spaceport_key.png',
        description: 'Unlocks a door to the Trench Towers in Spaceport.',
        instructions: 'Accesses a tower overlooking trench routes. Strong positional advantage but heavily contested.',
        weight: 0.25, value: 100 },
    { id: 'sp_warehouse',         map: 'spaceport',    name: 'Spaceport Warehouse Key',       rarity: 'uncommon', coords: [3777, 2244], location: 'Shipping Warehouse — Top of Catwalk', doorImage: 'images/doors/spaceport/warehouse_door.jpg', icon: 'images/keys/spaceport_key.png',
        description: 'Unlocks a door in the Shipping Warehouse in Spaceport.',
        instructions: 'Grants access to large indoor loot zones. Warehouses are noisy to loot and frequently patrolled.',
        weight: 0.25, value: 100 },
    { id: 'sp_ground_control',    map: 'spaceport',    name: 'Spaceport Ground Control Key',  rarity: 'uncommon', coords: [2574, 2584],  location: 'Ground Control Tower — Upper Level', doorImage: 'images/doors/spaceport/control_tower_door.webp', icon: 'images/keys/spaceport_key.png',
        description: 'Unlocks a door to the Ground Control Tower in Spaceport.',
        instructions: 'Provides access to high-ground interiors with valuable loot. High visibility makes prolonged looting dangerous.',
        weight: 0.25, value: 100 },
    { id: 'sp_container_storage', map: 'spaceport',    name: 'Spaceport Container Storage Key', rarity: 'rare',   coords: [2472, 3012], location: 'Container Storage — Top Floor Red Door', doorImage: 'images/doors/spaceport/container_storage_doors.jpg', icon: 'images/keys/spaceport_key.png',
        description: 'Unlocks a door in the Container Storage in Spaceport.',
        instructions: 'Used on shipping containers containing loot caches. Containers are exposed and easy to third-party.',
        weight: 0.25, value: 100 },
    { id: 'sp_outskirts_bunker',  map: 'spaceport',    name: 'Spaceport Outskirts Bunker Key',  rarity: 'rare',   coords: [4005, 2550],  location: 'Outskirts Bunker — Western Map Boundary', icon: 'images/keys/spaceport_key.png',
        description: 'Unlocks a bunker in the western outskirts of Spaceport.',
        instructions: 'Remote location with high-value loot. Long travel time makes extraction risky.',
        weight: 0.25, value: 100 },
    { id: 'bc_residential',       map: 'buried_city',  name: 'Buried City Residential Master Key', rarity: 'uncommon', coords: [2016, 1727], location: 'Plaza Rosa Area / Grandioso Apartments', doorImage: 'images/doors/buried_city/residential_grandioso.jpg', icon: 'images/keys/buried_city_key.png',
        description: 'Unlocks certain apartment doors in Buried City.',
        instructions: 'There are two places where you can use this key, and unlike with the Testing Annex Key, they\'re not in each other\'s vicinity. The first area where you can use the key is located west of the Plaza Rosa. It\'s the building right next to it, under the Main Street name on the map. The second area is in the northern building of Grandioso Apartments. Head to the very first floor. If you go down the elevator shaft, turn right and go into the door leading to the room. Inside, you\'ll see a locked door, which you can unlock with this key. Our personal recommendation: it\'s always worth unlocking the Grandioso Apartments room.',
        weight: 0.25, value: 100 },
    { id: 'bc_jkv',               map: 'buried_city',  name: 'Buried City JKV Employee Card',      rarity: 'uncommon', coords: [2744, 2771], location: 'Space Travel Building — Northeast Section', doorImage: 'images/doors/buried_city/jkv_access_door.webp', icon: 'images/keys/buried_city_key.png',
        description: 'Unlocks a door in the J Kozma Ventures company building in Buried City.',
        instructions: 'Description of this access card is unusually cryptic for a green key. You have to go to the Space Travel building and reach its 4th floor. There, you\'ll find a locked room.',
        weight: 0.25, value: 100 },
    { id: 'bc_hospital',          map: 'buried_city',  name: 'Buried City Hospital Key',           rarity: 'rare',     coords: [3335, 2411], location: 'Hospital — Third Floor Northwest', doorImage: 'images/doors/buried_city/hospital_door.webp', icon: 'images/keys/buried_city_key.png',
        description: 'Unlocks a door in the Hospital in Buried City.',
        instructions: 'Finding this room is pretty easy. If you enter through the entrance facing the Library, turn left and walk straight until you face the room, often guarded by a Turret. Turn left, and you\'ll see a locked door. The loot in this room is quite good and will be especially useful if you\'re upgrading your Medical Station in the Workshop. Don\'t forget to loot all areas of the Hospital as even without the key, it often has something nice to offer.',
        weight: 0.25, value: 100 },
    { id: 'bc_town_hall',         map: 'buried_city',  name: 'Buried City Town Hall Key',          rarity: 'epic',     coords: [2394, 2587],  location: 'Town Hall — Northern Side Ground Level', doorImage: 'images/doors/buried_city/town_hall_entrance.webp', icon: 'images/keys/buried_city_key.png',
        description: 'Unlocks a door to the Town Hall in Buried City.',
        instructions: 'The Buried City Town Hall Key unlocks not just a room but a whole building. This is one of the biggest values you can get out of a key purely from the volume of the loot you can find here. It\'s one of the top keys to use in ARC Raiders. Honestly, not much to say, as it\'s clearly one of the best, if not the best keycard in ARC Raiders. It\'s often a center for PvP, but it\'s a pretty open area, which you can easily protect once you\'re inside.',
        weight: 0.25, value: 100 },
    { id: 'bg_village',           map: 'blue_gate',    name: 'Blue Gate Village Key',              rarity: 'uncommon', coords: [2884, 1714], location: 'Village — House with Barred Front Door', doorImage: 'images/doors/blue_gate/village_door.jpg', icon: 'images/keys/blue_gate_key_variant_1.png',
        description: 'Unlocks a door to one of the old village buildings on Blue Gate.',
        instructions: 'This room has got to be a joke. It\'s a key room with poor loot even during the Night Raids. There\'s 1 weapon crate spawn here and a decent amount of lockers/cupboards. Nothing too interesting. It\'s very safe, though, as not a lot of players try to open this door.',
        weight: 0.25, value: 100 },
    { id: 'bg_patrol_car',        map: 'blue_gate',    name: 'Blue Gate Patrol Car Key',           rarity: 'uncommon', coords: [2234, 2621], location: 'Traffic Tunnel — Armored Patrol Car Rear Door', icon: 'images/keys/patrol_car_key.png',
        description: 'Unlocks the rear door of a patrol car on Blue Gate.',
        instructions: 'The key that doesn\'t even explain which map it is used on. You can figure it out only by reading the conditions of one of the quests later in the game, which Tian Wen gives you. The patrol cars are these big armored army vehicles you can find inside the tunnel. The key can fit any of them. There\'s not a lot of loot to find inside, but it\'s a nice source of weapon farming.',
        weight: 0.25, value: 100 },
    { id: 'bg_comm_tower',        map: 'blue_gate',    name: 'Blue Gate Communication Tower Key',  rarity: 'rare',     coords: [2876, 3600],  location: 'Communication Tower — Underground Storage Room', doorImage: 'images/doors/blue_gate/comm_tower_door.webp', icon: 'images/keys/blue_gate_key_variant_2.png',
        description: 'Unlocks the communication tower door at Blue Gate.',
        instructions: 'It\'s on the ground floor of the Pilgrim\'s Peak, at the far end of the location, next to the elevator shaft. There\'s a lot of electrical loot here, which is useful for consumables, but no big drops in the room. Very reliable, but a bit unsatisfying.',
        weight: 0.25, value: 100 },
    { id: 'bg_cellar',            map: 'blue_gate',    name: 'Blue Gate Cellar Key',               rarity: 'rare',     coords: [1184, 2080], location: 'Cellar South of Ruined Homestead', doorImage: 'images/doors/blue_gate/cellar_door_1.webp', icon: 'images/keys/blue_gate_key_variant_1.png',
        description: 'Unlocks certain cellar doors near the Blue Gate.',
        instructions: 'Used on a locked cellar near the Olive Grove on the west side of the map. The room contains high-value loot like weapons, blueprints, grenades, and healing items. The area is usually quiet but visible to players moving west from the Ancient Fort. Audio awareness is critical due to grenade risk.',
        weight: 0.25, value: 100 },
    { id: 'bg_confiscation',      map: 'blue_gate',    name: 'Blue Gate Confiscation Room Key',    rarity: 'epic',     coords: [2583, 2481], location: 'Headhouse — Underground Tunnel System', doorImage: 'images/doors/blue_gate/confiscation_door.jpg', icon: 'images/keys/blue_gate_key_variant_2.png',
        description: 'Unlock a door to the confiscated foods area in the Blue Gate tunnels.',
        instructions: 'This Epic keycard opens a room inside the underground area of the Blue Gate. The easiest way you can get there is by hugging the left wall of the Checkpoint when going inside this big tunnel. The one that\'s guarded by a Bastion or a Bombardier. Hug the wall until you see a small set of stairs. Go up, turn left, and you\'ll see the door. Be wary, as there are way too many players waiting for you to open this area. A very hot zone for PvP.',
        weight: 0.25, value: 100 },
    { id: 'sm_assembly',          map: 'stella_montis', name: 'Stella Montis Assembly Admin Key',        rarity: 'uncommon', coords: [2512, 1080], location: 'Assembly — Central Corridor (Western Section)',            level: 'upper', doorImage: 'images/doors/stella_montis/assembly_admin_door.webp', icon: 'images/keys/stella_montis_key.png',
        description: 'Unlocks a door in Assembly in Stella Montis.',
        instructions: 'Grants access to restricted admin rooms. Loot is good, but routes in and out are predictable.',
        weight: 0.25, value: 100 },
    { id: 'sm_medical',           map: 'stella_montis', name: 'Stella Montis Medical Storage Key',       rarity: 'uncommon', coords: [1852, -364], location: 'Medical Research — North Side',                        level: 'upper', doorImage: 'images/doors/stella_montis/medical_storage_door.webp', icon: 'images/keys/stella_montis_key.png',
        description: 'Unlocks a door in Medical Research in Stella Montis.',
        instructions: 'Provides access to healing-focused loot rooms. Often checked by players preparing for extended raids.',
        weight: 0.25, value: 100 },
    { id: 'sm_archives',          map: 'stella_montis', name: 'Stella Montis Archives Key',              rarity: 'rare',     coords: [2032, 3684], location: 'Seed Vault — End of Tunnels', level: 'lower', doorImage: 'images/doors/stella_montis/archives_storage_door.jpg', icon: 'images/keys/stella_montis_key.png',
        description: 'Unlocks a door in the Archives in Stella Montis.',
        instructions: 'Used to access archive rooms containing data-related loot. Interiors are tight and easy to camp.',
        weight: 0.25, value: 100 },
    { id: 'sm_security',          map: 'stella_montis', name: 'Stella Montis Security Checkpoint Key',   rarity: 'epic',     coords: [2482, 2496], location: 'Lobby — Northern Section',            level: 'upper', doorImage: 'images/doors/stella_montis/security_locked_room.jpg', icon: 'images/keys/stella_montis_key.png',
        description: 'Unlocks a door in the Security Checkpoint in Stella Montis.',
        instructions: 'Used at security checkpoints controlling movement through Stella Montis. These are natural choke points and highly dangerous.',
        weight: 0.25, value: 100 },
    { id: 'hatch_dam_1',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [750, 2696],  location: 'Sunroof Hatch — Trees Above Ben Welder\'s Sunroof', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_dam_2',          map: 'dam',          name: 'Raider Hatch Key',               rarity: 'rare', coords: [2770, 3750], location: 'Spillway Hatch — South of Red Lakes Berm', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_sp_1',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3376, 3267],  location: 'West Elevator Hatch — West of Departure Building', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_sp_2',           map: 'spaceport',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2394, 2081], location: 'Central Elevator Hatch — East of Arrival Building', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_bc_1',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [2965, 1802],  location: 'Cargo Elevator Hatch', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_bc_2',           map: 'buried_city',  name: 'Raider Hatch Key',               rarity: 'rare', coords: [3904, 1487],  location: 'Metro Station Hatch', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_bg_1',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [2711, 2851], location: 'Airshaft Extraction Point', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_bg_2',           map: 'blue_gate',    name: 'Raider Hatch Key',               rarity: 'rare', coords: [3039, 4164],  location: 'Airshaft Extraction Point', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_sm_1',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [1520, 3288],  location: 'Assembly Workshops Hatch — Bottom Right of Assembly',  level: 'upper', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
    { id: 'hatch_sm_2',           map: 'stella_montis', name: 'Raider Hatch Key',              rarity: 'rare', coords: [996, 3420], location: 'Sandbox B Hatch — Very South of Map',     level: 'lower', icon: 'images/keys/raider_hatch_key.png',
        description: 'Unlocks a raider hatch for quick extraction.',
        instructions: 'Provides access to emergency extraction hatches. Use for quick exits when under pressure.',
        weight: 0.25, value: 100 },
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
