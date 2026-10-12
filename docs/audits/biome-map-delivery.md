# Biome maps & elemental surfaces — audit and delivery

## Audit before implementation

The app is a static HTML/JavaScript application, with no root package/build command. Serve the repository over HTTP and open `index.html`. HexView creates 56 pointy-top cells (8 × 7), 36 × 42 logical pixels, alternating 18px row offsets and 31.5px row spacing. BattleVisual.fitBoard derives the bounds from these cells and scales the board uniformly into the background's central clearing. Pointer and drag/drop handling belong to the existing cells. No geometry or combat code was changed.

Forest is a 1024 × 1024 CSS background on `.board-wrapper`. No map registry or persistent elemental cell gameplay exists. Expedition has regional effects and boss telegraphs; these are combat mechanics, not permanent Fire/Ice/Poison terrain. Their timings, damage and regions remain intact. Explicit route `biome` metadata takes precedence if supplied; the current three region definitions do not specify it. No automatic rotation was invented.

Unit sprites and indicators belong to HexRenderer, with existing death cleanup and tick-driven presentation. Static icons and curated animated sprites retain their size/position. Existing VfxPlayer/CombatPresentation/SkillVisuals handle pixel sheets and bounded text; they are reused, with no new render loop. Fire/Ice/Poison skill sheets remain the existing assets. FactionHealth keeps allied green #27C76F, enemy/boss red #EF4444 and shield cyan #38BDF8 independently of the map.

## Source and visual review

Archive found at `C:\Users\pc\Downloads\PokeChess-Biomes-Elements-01.zip`. Wrapper: `PokeChess-Biomes-Elements-01/`. All six required assets exist. Original extraction remains outside the repository under `%TEMP%/pokechess-biomes-elements-01-audit/`; the ZIP and staging are not imported. PNG files are copied unchanged. SHA-256, dimensions and alpha formats are recorded in `assets/visual/biomes-manifest.json`, including the unchanged Forest hash.

| ZIP path beneath wrapper | Imported path | Size / format | Review |
| --- | --- | --- | --- |
| maps/volcano/backgrounds/volcano-background.png | assets/visual/maps/volcano-background.png | 1254 × 1254 RGB | Same top-down composition; central basalt is calm; lava confined to perimeter |
| maps/ice_cavern/backgrounds/ice_cavern-background.png | assets/visual/maps/ice_cavern-background.png | 1254 × 1254 RGB | Flat central clearing; brighter cyan perimeter; dark HP tracks preserve contrast |
| maps/swamp/backgrounds/swamp-background.png | assets/visual/maps/swamp-background.png | 1254 × 1254 RGB | Closest Forest composition; darker olive/purple palette |
| hex/elements/fire/hex-fire.png | assets/visual/hex/hex-fire.png | 1254 × 1254 RGBA | Pointy top; bright perimeter softened by presentation opacity |
| hex/elements/ice/hex-ice.png | assets/visual/hex/hex-ice.png | 1254 × 1254 RGBA | Pointy top; irregular source edges masked by existing hex polygon |
| hex/elements/poison/hex-poison.png | assets/visual/hex/hex-poison.png | 1254 × 1254 RGBA | Pointy top; irregular source edges masked; purple accent remains distinct |

All actual source images were inspected against Forest before import. They are usable as backgrounds and clipped preview surfaces, without requiring a perspective/composition redraw. They are **not** certified as identical native pixel density or seamless tiles: detail is denser than Forest, and tile outlines differ. Runtime uses pixelated rendering, a uniform square background fit and the authoritative cell polygon. Surfaces use a centered square image at 125% cell width, with no independent axis stretching, 65% opacity and 25% during interaction. No bitmap transformations, new artwork, filters or replacements were generated. Uniform-border/seamless artwork would require a separately approved art pass.

The supplied manifest identifies its source as OpenAI imagegen using Forest as reference, and supplies no exclusivity or third-party licence certification. This delivery uses only the user's supplied assets; it does not generate replacement art or claim additional rights.

## Implementation

`js/battlefield_biomes.js` provides four stable map IDs and three element asset registrations. Images load through a shared Promise cache with an 8-second timeout; failed images are remembered. Background failures/obsolete IDs resolve to Forest, and a request generation token prevents old loads from overwriting newer choices. Forest remains the initial CSS background throughout loading.

The compact toolbar selectors are preparation-only, support Vietnamese/English through the existing language listener, and disable during combat. Preference `pokechess_biome_v1` is separate from Journey and save profiles; absent/obsolete values default to Forest. A switch changes the background URL and a presentation attribute. CSS uses a neutral translucent floor on the three new maps instead of the old opaque Forest grass; Forest and placement colors are preserved. It neither constructs a combat engine nor resets units, formation, shop or rewards.

“Xem ô → Lửa / Băng / Độc” previews cells 49–51. Each surface is a pointer-transparent child of an existing cell and clipped to its polygon. It sits below interaction borders, sprites, indicators and effects. Preview is cleared on battle entry and never modifies combat terrain, stats or saves. `renderBoard` restores surfaces through the existing render path; no extra board or animation loop exists.

Code: `index.html`, `css/battlefield_biomes.css`, `js/battlefield_biomes.js`; data: six PNGs and `assets/visual/biomes-manifest.json`; verification: `tests/biomes.test.cjs`, extended `tests/browser-smoke.cjs`.

## Usage

Serve the repository root, for example `python -m http.server 8000`, then open `http://localhost:8000`. In preparation, select **Map → Rừng / Núi lửa / Hang băng / Đầm lầy** on the toolbar. **Xem ô → Lửa / Băng / Độc** shows all three textures; **Tắt** removes them. They are visual previews, with no terrain bonuses. Active combat locks these selectors. An explicit Expedition route biome, when present, locks manual map selection.

## Verification

- Executed `node --test tests/hex_combat.test.cjs tests/v43.test.cjs tests/expedition.test.cjs tests/species.test.cjs tests/presentation.test.cjs tests/biomes.test.cjs`: **91/91 passed**. Includes actual 3v3/6v6/12v12 engine battles, death cleanup, save/profile regression, asset hashes, invalid preferences, cached failures, request races and preview cleanup.
- Executed `node scripts/validate-visual-assets.cjs`: existing 29 manifested PNGs, CSS asset URLs and 94 icons passed. The six new PNGs are separately verified by biome tests; this command's 29 count does not include them.
- Executed `node tests/browser-smoke.cjs --screenshots` in actual headless Edge: **passed**. All three new maps × five viewports (1920×1080, 1366×768, 1280×720, 768×432, 812×375) retain all 56 cell rectangles, pointer hit targets, formation and combat-engine identity relative to Forest. All textures decode. Browser image-load failure was exercised with an invalid PNG data URL and fed through the background loader cache: Forest fallback passed. Preview cleanup and active-combat lock passed.
- The same browser run passed Classic/Expedition, recruitment/equipment, legacy/current saves, drag/drop, resize/touch detail interactions, HUD/Bench/settings and actual 3v3/6v6/12v12 rendering checks. HP faction colors, no ghost bars and bounded floating labels (maximum 24 in the 12v12 fixture) passed. No local asset request was missing and no uncaught JavaScript exception was recorded. This is bounded fixture evidence, not a long-session or FPS benchmark.
- The first browser run stopped at a sprite-image readiness assertion during an existing Expedition screenshot. The screenshot helper now waits for newly replaced local image nodes as well as decode promises; the full second run passed. This failure was not counted as a successful run.
- Visual evidence: `artifacts/biomes-evidence.json` records 15 biome/viewport checks; `artifacts/visual-biome-forest-{width}.png` is the unchanged-art reference, and `visual-biome-volcano-{width}.png`, `visual-biome-ice_cavern-{width}.png`, `visual-biome-swamp-{width}.png` include all three preview textures. Twenty screenshots cover all four maps at matching viewport sizes. Desktop and landscape images were inspected after integration; new maps use the neutral floor, with no perspective shift or overlap of textures onto adjacent cells.
- Physical iPhone Safari, actual GitHub Pages deployment and a performance/60-FPS benchmark were **not executed**. The 812×375 result is Edge viewport emulation, not a Safari claim. No commit, push or deployment was made.

### Screenshot references

[Forest 1366](../../artifacts/visual-biome-forest-1366.png) · [Volcano 1366](../../artifacts/visual-biome-volcano-1366.png) · [Ice Cavern 1366](../../artifacts/visual-biome-ice_cavern-1366.png) · [Swamp 1366](../../artifacts/visual-biome-swamp-1366.png)

[Ice landscape 812](../../artifacts/visual-biome-ice_cavern-812.png) · [Swamp landscape 812](../../artifacts/visual-biome-swamp-812.png)

## Follow-up: selectors clipped on narrow laptops

The initial geometry tests did not assert that the selectors themselves fit inside the toolbar. A new assertion reproduced overflow at 1280px; narrower desktop layouts could push the Map selector outside the clipped board view. The toolbar inherited `flex-shrink: 0`, and the combined controls exceeded the center panel width. The biome stylesheet now lets the toolbar shrink and wrap, keeping the two selectors grouped. Its cache version is bumped to 5.0.5.

Executed the full Edge browser smoke with screenshots after the fix: passed, including selector bounds at 1920, 1366, 1280, **1150**, 768 and 812px. The evidence now contains 18 biome/viewport combinations and 24 matched screenshots. Map switching still preserves formation, hit targets and engine identity; combat regression checks passed. Asset validation and `git diff --check` also passed. This fix is local; no deployment was performed.

[Visible selectors at 1150px](../../artifacts/visual-biome-forest-1150.png)
