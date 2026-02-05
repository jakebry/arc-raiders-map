// Randomize keycard coordinates for draggable positioning
const fs = require('fs');

const MAPS_CONFIG = {
    dam: { width: 4896, height: 4540, border: 400 },
    spaceport: { width: 4896, height: 4896, border: 400 },
    buried_city: { width: 4896, height: 4896, border: 400 },
    blue_gate: { width: 4896, height: 3872, border: 400 },
    stella_montis_upper: { width: 4896, height: 3872, border: 400 },
    stella_montis_lower: { width: 4896, height: 3258, border: 400 }
};

function randomCoord(mapId, level = null) {
    let config;
    if (mapId === 'stella_montis') {
        config = level === 'lower' ? MAPS_CONFIG.stella_montis_lower : MAPS_CONFIG.stella_montis_upper;
    } else {
        config = MAPS_CONFIG[mapId];
    }

    const minY = config.border;
    const maxY = config.height - config.border;
    const minX = config.border;
    const maxX = config.width - config.border;

    const y = Math.floor(Math.random() * (maxY - minY) + minY);
    const x = Math.floor(Math.random() * (maxX - minX) + minX);

    return [y, x];
}

// Read the current data.js
const dataPath = './js/data.js';
let content = fs.readFileSync(dataPath, 'utf8');

// Extract KEYS array
const keysMatch = content.match(/const KEYS = \[([\s\S]*?)\];/);
if (!keysMatch) {
    console.error('Could not find KEYS array');
    process.exit(1);
}

const keysContent = keysMatch[1];
const keyLines = keysContent.split('\n').filter(line => line.trim().startsWith('{'));

const newKeyLines = keyLines.map(line => {
    // Extract map id and level
    const mapMatch = line.match(/map: '([^']+)'/);
    const levelMatch = line.match(/level: '([^']+)'/);

    if (!mapMatch) return line;

    const mapId = mapMatch[1];
    const level = levelMatch ? levelMatch[1] : null;

    // Generate random coords
    const newCoords = randomCoord(mapId, level);

    // Replace coords in the line
    const newLine = line.replace(/coords: \[[^\]]+\]/, `coords: [${newCoords[0]}, ${newCoords[1]}]`);

    return newLine;
});

// Reconstruct KEYS array
const newKeysContent = newKeyLines.join('\n');
const newContent = content.replace(
    /const KEYS = \[([\s\S]*?)\];/,
    `const KEYS = [\n${newKeysContent}\n];`
);

fs.writeFileSync(dataPath, newContent);
console.log('✅ Randomized all keycard coordinates!');
