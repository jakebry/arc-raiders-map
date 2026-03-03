// js/utils.js — Shared helper functions for home screen

// Cache for dynamically recolored yellow SVG variants (exact hex)
const ICON_YELLOW_CACHE = new Map(); // originalSrc -> blobUrl

export async function getYellowVariant(src) {
    if (!src) return null;
    if (ICON_YELLOW_CACHE.has(src)) return ICON_YELLOW_CACHE.get(src);
    try {
        const res = await fetch(src, { cache: 'no-store' });
        const text = await res.text();
        // NOTE: This regex-based SVG recoloring is brittle — it matches common
        // white color representations but may miss edge cases (e.g. currentColor,
        // HSL, or CSS variables). A more robust solution would be to pre-generate
        // yellow icon variants and upload them to Vercel Blob, then reference
        // the yellow URL directly without any runtime processing. Tracked for
        // future improvement.
        const yellow = '#febb12';
        let edited = text
            // style rules: fill/stroke white → yellow
            .replace(/fill\s*:\s*(?:#fff(?:fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*1(?:\.0+)?\s*\))/gi, `fill: ${yellow}`)
            .replace(/stroke\s*:\s*(?:#fff(?:fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*1(?:\.0+)?\s*\))/gi, `stroke: ${yellow}`)
            // attributes: fill/stroke="white/#fff" → yellow
            .replace(/fill=("|')(?:#fff(?:fff)?|white)("|')/gi, `fill="${yellow}"`)
            .replace(/stroke=("|')(?:#fff(?:fff)?|white)("|')/gi, `stroke="${yellow}"`);
        const blob = new Blob([edited], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        ICON_YELLOW_CACHE.set(src, url);
        return url;
    } catch (e) {
        console.warn('Yellow variant failed for', src, e);
        return null;
    }
}

export function setIconSrc(imgEl, url) {
    if (!imgEl || !url) return;
    if (!imgEl.dataset.originalSrc) imgEl.dataset.originalSrc = url;
    imgEl.src = url;
}

export function formatTime(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
