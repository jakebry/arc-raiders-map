# Map Events Home Screen — Feature Spec

## Overview
Recreate the in-game Map Selection screen as our homepage. Shows an overhead map with all 5 map locations, each displaying their current active event with a live countdown timer. A side panel (always visible) shows details for the hovered/selected map.

## Data Source
- **MetaForge API**: `https://metaforge.app/api/arc-raiders/events-schedule`
- Returns JSON array: `{ name, map, icon, startTime, endTime }` (timestamps in ms)
- Events rotate in 1-hour blocks
- Fetch on page load + every 5 minutes
- No auth required

## UI Layout
- **Left ~70%**: Overhead map image with interactive map nodes
- **Right ~30%**: Side panel card (always visible, always one map selected)
- Default selected: Dam Battlegrounds (center of map)

## Map Nodes (5 main + Practice Range)
1. Dam Battlegrounds (center)
2. Spaceport (upper-left)
3. Buried City (left)
4. Blue Gate (center-right)
5. Stella Montis (upper-right)

## Interaction
- **Hover** over a map node → side panel updates to that map's current event
- Stays on last hovered map (no "deselect" state)
- On mobile: tap to select

## Side Panel Card (matches in-game style)
- Event preview image (screenshot from game, or placeholder)
- Map name (e.g. "DAM BATTLEGROUNDS")
- Event name (e.g. "HUSK GRAVEYARD")
- Description text
- Modifier bullet points
- Difficulty bar
- Countdown timer

## Event Data (from API + static descriptions)
Known events and their descriptions/modifiers:

### Husk Graveyard
- Desc: "Something has caused ARC machines to go down on their own in great amounts, leaving husks scattered around Topside."
- Modifier: Electrified First Wave husks

### Night Raid
- Desc: "Raiders have been finding especially good loot behind locked doors, and keys have been more plentiful."
- Modifiers: Fewer active Return Points, No active Raider Hatches, Increased loot value
- 2X multiplier

### Electromagnetic Storm
- Desc: "Lightning strikes batter the surface; frying electronics, disrupting ARC machines, and electrocuting unsuspecting Raiders."
- Modifiers: Fewer active Return Points, No active Raider Hatches, Increased loot value, Lightning strikes
- 2X multiplier

### Hidden Bunker
- Desc: "Someone has hacked the Outskirts Bunker's security system. Find the 4 buttons to unlock the doors."
- Modifiers: Fewer active Return Points, No active Raider Hatches, Activate Rooftop Antennas, Retrieve data from the bunker
- 2X multiplier

### Cold Snap
- Desc: "A cold front has swept in with snowfall, and a considerable drop in temperature."
- Modifiers: Harvest Candleberries, Increased loot value, Damaging cold
- 2X multiplier

### Matriarch
- Desc: "A Matriarch has been sighted nearby. Her children seem hell-bent on keeping her from harm."

### Harvester
- (Need screenshot/description)

### Launch Tower Loot
- (Need screenshot/description)

### Locked Gate
- (Need screenshot/description)

### Bird City
- (Need screenshot/description)

### Prospecting Probes
- (Need screenshot/description)

## Default Map Descriptions (no event active)
- Spaceport: "Acerra Spaceport is a majestic testament to humanity's past ambitions..."
- Blue Gate: "Once a steadfast symbol of defiant connection, the Blue Gate now serves as a daunting entryway..."
- Dam Battlegrounds: (need)
- Buried City: (need)
- Stella Montis: (need)

## Screenshots We Have
| Map | Event | File |
|---|---|---|
| Dam | Husk Graveyard | IMG_1901 |
| Dam | Matriarch | IMG_1908 |
| Dam | Electromagnetic Storm | IMG_1915 |
| Spaceport | Hidden Bunker | IMG_1906 |
| Spaceport | Matriarch | IMG_1899 |
| Spaceport | Default | IMG_1909 |
| Buried City | Night Raid | IMG_1905 |
| Buried City | Cold Snap | IMG_1913 |
| Blue Gate | Electromagnetic Storm | IMG_1904/1912 |
| Blue Gate | Default | IMG_1914 |

## Screenshots Still Needed
- Dam: Cold Snap, Harvester, Night Raid, Prospecting Probes, Default
- Spaceport: Cold Snap, Harvester, Launch Tower Loot, Electromagnetic Storm
- Buried City: Bird City, Prospecting Probes, Husk Graveyard, Electromagnetic Storm, Harvester, Default
- Blue Gate: Locked Gate, Harvester, Matriarch, Cold Snap, Husk Graveyard, Night Raid, Prospecting Probes
- Stella Montis: ALL (Night Raid, Electromagnetic Storm, Cold Snap, Default)

## Technical Notes
- Pure vanilla JS (no framework, consistent with existing codebase)
- Fetch MetaForge API client-side
- Countdown timers via setInterval (tick every second)
- Credit MetaForge as data source in footer
- Graceful fallback if API unavailable
