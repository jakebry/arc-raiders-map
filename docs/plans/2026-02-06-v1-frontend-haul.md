# V0.7.0 Frontend Haul - Implementation Plan

> **Execution:** Work through each task sequentially, getting user approval before moving to the next. All development done locally using `python3 -m http.server 8000`. Deploy to Vercel only when v0.7.0 is complete.

---

## Task 1: Custom Zoom Slider

**Goal:** Replace Leaflet's default +/- zoom buttons with a custom dark glass vertical slider in the bottom-left corner.

**Implementation:**
1. Disable Leaflet zoom control: `zoomControl: false` in map init
2. Create custom HTML zoom slider in `index.html`:
   ```html
   <div id="custom-zoom" class="custom-zoom">
     <input type="range" orient="vertical" min="-5" max="3" step="0.1" value="0">
   </div>
   ```
3. Position bottom-left with CSS (dark translucent glass background, vertical layout)
4. Add JS event listener to sync slider with `leafletMap.setZoom()`
5. Hide on mobile with `@media (max-width: 700px) { display: none; }`
6. Trackpad scroll and pinch zoom continue working (Leaflet default behavior)

**Files:** `index.html`, `js/app.js`, `css/styles.css`

**Technical notes:**
- Use `input[type="range"]` styled vertically
- Sync bidirectionally: slider changes zoom, zoom changes slider value
- Match the tactical theme with rgba backgrounds and subtle borders

---

## Task 2: Traveling Cyan Glow Hover Effect

**Goal:** Add animated traveling cyan border glow on hover for inventory slots and map markers.

**Effect details (from screenshots):**
- Bright cyan (#00d4ff or similar) glow that travels clockwise around the border
- Starts bottom-left, sweeps around continuously
- Concentrated glow (not spread across entire border at once)
- Loops infinitely during hover
- Layered with existing thick border + static glow

**Implementation:**
1. Use pseudo-element (`::before`) with animated conic-gradient or rotating linear-gradient
2. CSS `@keyframes` to rotate the gradient effect
3. Apply to `.inventory-slot:hover` and `.keycard-marker:hover .marker-icon-container`
4. Position pseudo-element behind the main element, slightly larger for border effect
5. Mask/clip to show only the border area

**Approach:**
```css
.inventory-slot::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: conic-gradient(from 0deg, transparent 0%, #00d4ff 20%, transparent 40%);
  border-radius: inherit;
  animation: rotateBorder 2s linear infinite;
  z-index: -1;
}

@keyframes rotateBorder {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**Files:** `css/styles.css`

**Alternative approach:** Use multiple box-shadows with animated positions if conic-gradient doesn't achieve the exact look.

---

## Task 3: Fix the Dots

**Goal:** Fix the vertically squished ellipse dots on map markers to be perfect circles.

**Problem diagnosis:**
- The `.marker-dot` has `width: 100%; height: 100%` inside a flex container with another sibling (`.marker-icon-container`)
- Flex layout is compressing the dot because both children compete for space in a 32×32 container
- The dot needs explicit dimensions and absolute positioning

**Implementation:**
1. Position `.marker-dot` absolutely within `.keycard-marker`
2. Give it explicit dimensions (e.g., `width: 8px; height: 8px;`)
3. Center it using `left: 50%; top: 50%; transform: translate(-50%, -50%);`
4. Ensure `border-radius: 50%` creates a perfect circle
5. Place it behind the icon container with `z-index: 0`

**Files:** `css/styles.css`

**Technical notes:**
- The dot is meant to show the precise location point while the icon provides the visual card
- Should be small but clearly visible (test at different zoom levels)

---

## Task 4: Fix Pin Drift on Zoom

**Goal:** Lock pins to exact pixel coordinates so they don't shift when zooming.

**Problem diagnosis:**
- `iconAnchor` must precisely match the visual center of the marker
- For unselected markers (32×32), anchor should be `[16, 16]`
- For selected markers (200×120), anchor should be `[100, 60]`
- Current code has these values, but the visual center might be off due to the dot/icon layout

**Implementation:**
1. After fixing the dot positioning (Task 3), re-verify that `iconAnchor` matches the actual visual center
2. Test by placing a marker, zooming in/out, and confirming it stays pixel-locked to the same map feature
3. Adjust `iconAnchor` values if drift persists

**Files:** `js/app.js` (renderMarkers function)

**Test cases:**
- Pick 3-4 pins across different maps
- Zoom from min to max zoom
- Verify pins stay locked to the same pixel coordinates

---

## Task 5: Revamp the Expansion Card

**Goal:** Redesign the selected key card to match the in-game design with description, instructions, weight, and value.

**Card layout (based on reference image):**
```
┌─────────────────────────────┐
│ 🔑 ACTIONS                  │ ← Header
├─────────────────────────────┤
│ [Icon] 🔑 KEY | EPIC        │ ← Icon + tags (rarity colored)
│                             │
│ BURIED CITY TOWN HALL KEY   │ ← Bold title
│                             │
│ [Door Photo]                │ ← Location image (if available)
│                             │
│ Description                 │ ← Section header
│ Unlocks the door to the...  │ ← From txt file
│                             │
│ Instructions                │ ← Section header (NEW)
│ The Buried City Town Hall...│ ← Extended gameplay info
│                             │
├─────────────────────────────┤
│ ⚖️ 0.25        💰 100       │ ← Weight | Value
└─────────────────────────────┘
```

**Data changes needed:**
- Add `description` field to all keys in `data.js` (copy from provided txt file)
- Add `instructions` field to all keys in `data.js`
- Add `weight` field (use `0.25` as default, can vary if user provides specifics)
- Add `value` field (use `100` as default)
- Note: Some keys (Raider Hatch, Spaceport Outskirts Bunker) aren't in the txt file - use placeholder or short generic text

**Implementation:**
1. Update `KEYS` array in `data.js` with new fields
2. Rewrite the marker HTML in `renderMarkers()` for selected state:
   - Header bar with "ACTIONS"
   - Icon + KEY tag + rarity tag
   - Bold title
   - Door image (if `key.doorImage` exists)
   - Description section
   - Instructions section
   - Footer with weight and value icons
3. Style the card in CSS to match the beige/tan game card aesthetic
4. Increase card size if needed (currently 200×120, may need wider/taller)

**Files:** `js/data.js`, `js/app.js`, `css/styles.css`

**Design notes:**
- Card background: Light beige/tan (#d4c4a8 or similar) to match game
- Text: Dark/black for contrast
- Rarity tag: Colored background matching rarity
- Keep it clean and readable

---

## Task 6: Verify Pin Placement

**Goal:** Manually verify all 32 keycard pins are in the correct positions.

**Process:**
1. Go through each of the 5 maps
2. Select each key and zoom in to verify the pin is on the correct door/location
3. User visually confirms accuracy
4. Adjust coordinates in `data.js` if any are off

**Files:** `js/data.js` (coordinate tweaks only)

**Checklist:**
- [ ] Dam Battlegrounds (6 keys: 4 regular + 2 hatches)
- [ ] Spaceport (7 keys: 5 regular + 2 hatches)
- [ ] Buried City (6 keys: 4 regular + 2 hatches)
- [ ] Blue Gate (7 keys: 5 regular + 2 hatches)
- [ ] Stella Montis (6 keys: 4 regular + 2 hatches)

---

## Task 7: Verify Starting Positions

**Goal:** Ensure each map loads at an appropriate scale and position.

**Check:**
- Map fills the viewport nicely without excessive black borders
- The `fitBounds` call with `contentBounds` (accounting for border) shows the full map
- Starting zoom level feels natural (not too zoomed in or out)

**Adjustments if needed:**
- Modify padding in `fitBounds()` call
- Adjust `minZoom` calculation if maps feel too restricted
- Per-map adjustments if one map needs special treatment

**Files:** `js/app.js` (initLeafletMap function)

**Verification:**
- [ ] Dam Battlegrounds - good initial view?
- [ ] Spaceport - good initial view?
- [ ] Buried City - good initial view?
- [ ] Blue Gate - good initial view?
- [ ] Stella Montis - good initial view (both levels)?

---

## Task 8: Remove Export Coords Button

**Goal:** Clean up debug/development UI elements once pins are finalized.

**Remove:**
1. "EXPORT COORDS" button from `index.html` (`#btn-export`)
2. Button click handler in `js/app.js`
3. `.btn-export` CSS styles
4. Alignment controls HTML (`#alignment-controls`)
5. Keyboard arrow key handler (already commented out but remove entirely)
6. `mapOffset` logic if not needed for Stella Montis (keep if it's the locked offset)

**Files:** `index.html`, `js/app.js`, `css/styles.css`

**Notes:**
- Keep the "BACK" button
- Keep the level toggle for Stella Montis
- Remove all developer-only UI

---

## Task 9: Card Expand/Collapse Animations

**Goal:** Add smooth animations for the expansion card appearing and disappearing.

**Animation specs:**
- **Expand-in:** Fade + scale (start at 0.8 scale, animate to 1.0 over 0.25s ease-out)
- **Collapse-out:** Reverse animation (fade out + scale down when deselected)
- Should feel snappy but polished

**Implementation:**
1. Add CSS transitions to `.marker-card`:
   ```css
   .marker-card {
     animation: expandIn 0.25s ease-out;
   }

   @keyframes expandIn {
     from {
       opacity: 0;
       transform: scale(0.8);
     }
     to {
       opacity: 1;
       transform: scale(1);
     }
   }
   ```
2. For collapse, either use a separate class or reverse the animation when the marker is deselected
3. Might need to track marker state in JS to trigger the animation properly

**Files:** `css/styles.css`, possibly `js/app.js`

**Alternative:** Use CSS transitions instead of animations for simpler in/out control.

---

## Task 10: Fix Zoom on Key Click

**Goal:** Reduce the auto-zoom when clicking a key to ~20% of current level.

**Current behavior:**
- `leafletMap.flyTo(key.coords, 2, { duration: 0.6 })`
- Zoom level 2 is very aggressive (too zoomed in)

**New behavior:**
- Reduce to zoom level ~0.4 to 0.6 (needs testing)
- Or calculate relative to current zoom: `currentZoom + 0.5` instead of fixed level
- Keep the smooth `flyTo` animation

**Implementation:**
1. Change the target zoom parameter in `selectKey()` function
2. Test with different maps to ensure it feels good across all map sizes
3. Option: Make it relative to current zoom so it feels natural from any starting zoom level

**Files:** `js/app.js` (selectKey function)

**Test:** Click keys at different starting zoom levels to ensure the target zoom feels consistent.

---

## Task 11: Home Page Redesign

**Goal:** Fresh, modern update to the map selection screen.

**Improvements:**
- Cleaner, more modern dark design (keep tactical theme but elevate it)
- Better card hover animations (perhaps lift + glow + border effect)
- Smooth selection transition when clicking into a map
- Possibly add a tagline or better title treatment
- Consider card layout improvements (larger cards? Better grid?)

**Design direction (TBD with user):**
- Keep "ARC RAIDERS" and "KEYCARD MAP" branding
- Enhance the map card hover effect (similar to the new inventory hover effect?)
- Add a fade/slide transition when entering a map
- Make the selection screen feel more "premium"

**Files:** `index.html`, `css/styles.css`, `js/app.js`

**Note:** This task has the most flexibility - will iterate with user on the exact design direction.

---

## Task 12: Fix Map Preview Cropping

**Goal:** Map selection preview images show more of the map edges (currently look too zoomed in).

**Problem:**
- Preview images in `images/preview/` may be cropped too tightly
- CSS `background-size: cover` + `aspect-ratio: 16/10` might be over-zooming
- Missing edges of the maps makes them hard to identify

**Solutions:**
- **Option A:** Regenerate preview images with more coverage (zoom out when taking screenshot)
- **Option B:** Change CSS to `background-size: contain` (will show full image but may have letterboxing)
- **Option C:** Adjust `aspect-ratio` or use explicit height to reduce cropping
- **Option D:** Use a different crop from the full map image (more zoomed out)

**Implementation:**
1. User to decide which option (regenerate images vs. CSS fix)
2. If CSS: try `background-size: contain` or adjust aspect ratio
3. If regenerate: create new previews at 400×300 with more map coverage

**Files:** `css/styles.css` and/or `images/preview/*.jpg`

**Note:** Preview images should give a clear sense of which map it is at a glance.

---

## Execution Checklist

- [ ] **Task 1:** Custom Zoom Slider
- [ ] **Task 2:** Traveling Cyan Glow Hover Effect
- [ ] **Task 3:** Fix the Dots
- [ ] **Task 4:** Fix Pin Drift on Zoom
- [ ] **Task 5:** Revamp the Expansion Card
- [ ] **Task 6:** Verify Pin Placement
- [ ] **Task 7:** Verify Starting Positions
- [ ] **Task 8:** Remove Export Coords Button
- [ ] **Task 9:** Card Expand/Collapse Animations
- [ ] **Task 10:** Fix Zoom on Key Click
- [ ] **Task 11:** Home Page Redesign
- [ ] **Task 12:** Fix Map Preview Cropping

---

## After v0.7.0 Complete

- Deploy to Vercel: `vercel deploy --prod --yes`
- Test on production
- Commit and tag: `git tag v0.7.0`
