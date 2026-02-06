#!/bin/bash

# Arc Raiders Door & Room Location Image Downloader
# Downloads high-quality door and room screenshots from community guides
# Created: 2026-02-05

echo "================================================"
echo "Arc Raiders Door Images Downloader"
echo "================================================"
echo ""

# Create directories if they don't exist
mkdir -p images/doors/blue_gate
mkdir -p images/doors/dam_battlegrounds
mkdir -p images/doors/buried_city
mkdir -p images/doors/stella_montis
mkdir -p images/doors/spaceport

echo "Downloading Blue Gate door images..."

# Blue Gate Confiscation Room Key
curl -L -o images/doors/blue_gate/confiscation_door.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/arc-raiders-blue-gate-confiscation-locked-room.jpg"
curl -L -o images/doors/blue_gate/confiscation_interior.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/arc-raiders-blue-gate-confiscation-key-loot-room.jpg"
curl -L -o images/doors/blue_gate/confiscation_security_wing.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/arc-raiders-blue-gate-confiscation-room-inside-the-security-wing.jpg"

# Blue Gate Village Key
curl -L -o images/doors/blue_gate/village_door.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/blue-gate-village-key-locked-door-arc-raiders.jpg"
curl -L -o images/doors/blue_gate/village_interior.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/blue-gate-village-key-loot-room-arc-raiders.jpg"

# Blue Gate Cellar
curl -L -o images/doors/blue_gate/cellar_door_1.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Blue-Gate-Cellar-Key.webp"
curl -L -o images/doors/blue_gate/cellar_door_2.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Blue-Gate-Cellar-Key-2.webp"

# Blue Gate Communication Tower
curl -L -o images/doors/blue_gate/comm_tower_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Blue-Gate-Communication-Tower-Key.webp"

echo "✓ Blue Gate images downloaded"
echo ""
echo "Downloading Dam Battlegrounds door images..."

# Dam Control Tower Key
curl -L -o images/doors/dam_battlegrounds/control_tower_pipe.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-control-tower-key-entering-pipe-1.jpg"
curl -L -o images/doors/dam_battlegrounds/control_tower_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Dam-Control-Tower-Key.webp"

# Dam Staff Room Key
curl -L -o images/doors/dam_battlegrounds/staff_room_entry.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-dam-staff-room-key-guide.jpg"
curl -L -o images/doors/dam_battlegrounds/staff_room_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Dam-Staff-Room-Key.webp"

# Dam Testing Annex Key
curl -L -o images/doors/dam_battlegrounds/testing_annex_entrance.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/where-to-use-the-dam-testing-annex-room-key-arc-raiders.jpg"
curl -L -o images/doors/dam_battlegrounds/testing_annex_door.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/testing-annex-door-leading-to-locked-room.jpg"
curl -L -o images/doors/dam_battlegrounds/testing_annex_interior.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/dam-testing-annex-room-arc-raiders.jpg"

# Dam Surveillance Key
curl -L -o images/doors/dam_battlegrounds/surveillance_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Dam-Surveillance-Key.webp"

echo "✓ Dam Battlegrounds images downloaded"
echo ""
echo "Downloading Buried City door images..."

# Buried City Hospital Key
curl -L -o images/doors/buried_city/hospital_entrance.jpeg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/img_0522.jpeg"
curl -L -o images/doors/buried_city/hospital_stairs.jpeg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/img_0523.jpeg"
curl -L -o images/doors/buried_city/hospital_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Buried-City-Hospital-Key.webp"

# Buried City JKV Employee Access Card
curl -L -o images/doors/buried_city/jkv_access_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Buried-City-JKV-Employee-Access-Card.webp"

# Buried City Residential Master Key
curl -L -o images/doors/buried_city/residential_main_street.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/12/buried-city-residential-master-key-door-1-arc-raiders.jpg"
curl -L -o images/doors/buried_city/residential_grandioso.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/12/buried-city-residential-master-key-door-2-arc-raiders.jpg"
curl -L -o images/doors/buried_city/residential_red_tower.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/buried-city-residential-master-key-red-tower-locked-room-arc-raiders.jpg"

# Buried City Town Hall Key
curl -L -o images/doors/buried_city/town_hall_entrance.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Buried-City-Town-Hall-Key.webp"

echo "✓ Buried City images downloaded"
echo ""
echo "Downloading Stella Montis door images..."

# Stella Montis Archives Key (complete walkthrough)
curl -L -o images/doors/stella_montis/archives_vent_entrance.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-stella-montis-archives-key-tunnel-entrance.jpg"
curl -L -o images/doors/stella_montis/archives_tunnel.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-stella-montis-secret-tunnel.jpg"
curl -L -o images/doors/stella_montis/archives_staircase.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-stella-montis.jpg"
curl -L -o images/doors/stella_montis/archives_entrance.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/how-to-use-the-arc-raiders-stella-montis-archives-key.jpg"
curl -L -o images/doors/stella_montis/archives_storage_door.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-stella-montis-archives-key-how-to-use-it.jpg"
curl -L -o images/doors/stella_montis/archives_interior.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-where-to-use-the-stella-montis-archives-key.jpg"

# Stella Montis Security Checkpoint Key
curl -L -o images/doors/stella_montis/security_barricade.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/stella-montis-security-checkpoint-arc-raiders.jpg"
curl -L -o images/doors/stella_montis/security_locked_room.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/stella-montis-security-checkpoint-locked-room-arc-raiders.jpg"
curl -L -o images/doors/stella_montis/security_interior.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2026/01/stella-montis-security-checkpoint-loot-room-unlocked-arc-raiders.jpg"

# Stella Montis Assembly Admin Key
curl -L -o images/doors/stella_montis/assembly_admin_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Stella-Montis-Assembly-Admin-Key.webp"

# Stella Montis Medical Storage Key
curl -L -o images/doors/stella_montis/medical_storage_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Stella-Montis-Medical-Storage-Key.webp"

echo "✓ Stella Montis images downloaded"
echo ""
echo "Downloading Spaceport door images..."

# Spaceport Container Storage Key
curl -L -o images/doors/spaceport/container_storage_building.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/where-to-use-the-spaceport-storage-container-key-arc-raiders.jpg"
curl -L -o images/doors/spaceport/container_storage_stairs.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/finding-the-spaceport-storage-container-location.jpg"
curl -L -o images/doors/spaceport/container_storage_doors.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/location-of-spaceport-storage-container-arc-raiders.jpg"

# Spaceport Control Tower Key
curl -L -o images/doors/spaceport/control_tower_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Spaceport-Control-Tower-Key.webp"

# Spaceport Trench Tower Key
curl -L -o images/doors/spaceport/trench_towers_buildings.jpg "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/12/south-and-north-trench-towers-spaceport-buildingsarc-raiders.jpg"
curl -L -o images/doors/spaceport/trench_tower_door.webp "https://www.eldorado.gg/blog/wp-content/uploads/2026/01/Spaceport-Trench-Tower-Key.webp"

# Spaceport Warehouse Key (complete set)
curl -L -o images/doors/spaceport/warehouse_entrance.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-spaceport-warehouse-key-walkthrough.jpg"
curl -L -o images/doors/spaceport/warehouse_staircase.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-spaceport-warehouse-key.jpg"
curl -L -o images/doors/spaceport/warehouse_path.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-spaceport-warehouse-key-how-to-locate-the-door.jpg"
curl -L -o images/doors/spaceport/warehouse_door.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-spaceport-warehouse-key-door.jpg"
curl -L -o images/doors/spaceport/warehouse_loot.jpg "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arc-raiders-spaceport-warehouse-loot.jpg"

echo "✓ Spaceport images downloaded"
echo ""
echo "================================================"
echo "✅ Download complete!"
echo "================================================"
echo ""
echo "Summary:"
echo "- Blue Gate: 8 images"
echo "- Dam Battlegrounds: 8 images"
echo "- Buried City: 8 images"
echo "- Stella Montis: 12 images"
echo "- Spaceport: 13 images"
echo ""
echo "Total: 49 high-quality door/room screenshots"
echo ""
echo "Images saved to:"
echo "  - images/doors/blue_gate/"
echo "  - images/doors/dam_battlegrounds/"
echo "  - images/doors/buried_city/"
echo "  - images/doors/stella_montis/"
echo "  - images/doors/spaceport/"
echo ""
