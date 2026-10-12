# Battle visual integration

## Project audit and inputs

Static HTML/CSS and vanilla JavaScript, entry point `index.html`. Serve the repository root using `python -m http.server 8000`, then open http://localhost:8000. No package manager or build step. README contains only the project name; no workspace AGENTS.md found.

All six requested ZIPs exist at the repository root (not originally in `asset-packs/`). Extracted into `asset-packs/staging/<pack>/<pack>/`. Original ZIPs are unchanged. Original specifications and sample button adapter are copied under `docs/visual/source-specs/<pack>/`. No approved layout screenshot was supplied or found: placement follows the written request, visual matching against that reference remains pending.

Existing user modification to `assets/ui/banner_stage.png` is preserved. Work is on the separate branch `visual/battlefield-assets`; initial sandbox restrictions required an escalated Git call to create it. No user changes were reset.

## Components and assets

| Component | Existing DOM/controller | Assets used |
| --- | --- | --- |
| PixelPanel | `talismanView`, `marketView`, Bench, inspector | panel-main |
| Panel title | panel-title, hex-inspector-header | header-red |
| PixelButton | native buttons in header/arena/panels | button-primary, button-danger; hover/pressed/disabled via CSS |
| PixelTab | talisman tabs, Pokémon tabs | tab-active, tab-inactive |
| HUD | statStage/statGold/statDeployed/statMaxSlots | hud-logo-frame, hud-stage-frame, hud-currency-frame, hud-team-frame, hud-compact-frame |
| ItemSlot | talisman-icon in ui_talisman.js | inventory-slot; selected/equipped/locked/disabled overlays |
| RecruitCard | rewardCardsGrid / ui_shop.js | recruit-row; existing Pokémon, stat and type images |
| Bench | inventorySlots, moved intact below board | recruit-row; existing inventory/state/handlers, equipment text badge |
| SynergyRow | SynergySystem.renderSynergyPanel / HexTraits | shared panel; existing type icons and computed values |
| UnitDetails | HexPreparationInfo, now child of pokemonPanel | shared panel/header, native expandable descriptions, live stats and HP |
| UnitHealthBar | HexRenderer and preparation inspector/board | dark CSS track, hp-bar-fill clipped at full width, hp-bar-frame with horizontal caps |
| Selected unit | existing selection classes | unit-selection-ring below sprite at fixed ground anchor |
| Battlefield | HexView, HexRenderer, board-wrapper | forest-background |

Retained but unused: portrait-frame (baked artifact in its center), dialogue-frame (dialogue outside this pass), forest-grass-texture (seamless unverified), hud-value-inset, hud-dropdown-frame, hud-language-frame, hud-journey-frame, hud-menu-frame (existing menu/select controls retained). All retained derivatives are real files in the aggregate manifest; unused slice values remain null.

## Source-derived assets

`scripts/prepare-visual-assets.ps1` crops at alpha >=128, resizes with nearest-neighbor into `assets/visual/{ui,combat,maps}/`, and records source/derived dimensions and crop rectangles. Cropping is independent of slice selection. Panel caps are 6px, buttons 9px, tabs and slots 8px on their respective normalized PNGs; HP uses horizontal 4px source caps. Slots are normalized to a common 64px square perimeter before compositing; source corner variations and soft alpha remain a limitation. Source contact sheet: `artifacts/visual-source-sheet.png`.

Skins use native CSS border-image, without importing the sample canvas adapter. This avoids its uncollected ResizeObservers/window listeners and stale canvases when price/labels are replaced. The board has one page-lifetime ResizeObserver; no per-card observers. Decorative imagery is CSS or pointer-events:none. Native disabled and keyboard focus remain active. Existing localization dictionaries receive only presentation labels.

Source gradients and partially transparent edges remain: this is an integrated source-derived skin, not a claim that the artwork is a strict flat-palette pixel master. Slice validation is limited to the captured viewport sizes. Unverified maximum sizes are null.

## Coordinates, interactions and state

All 56 pointy hex cells retain their existing 36×42 dimensions, row spacing, squares and world coordinates. Fit measures all cell vertex extrema, adds sprite/HP clearance and applies one uniform CSS scale to the complete board frame. Desktop contains the entire square forest. Compact screens enlarge/crop the decorative perimeter; the transformed candidate clearing is intersected with visible viewport bounds before fitting the board. Background offsets and clipping are explicitly included in the view transform. The DOM inverse transform supplies native click/drag/drop hit-testing; HexRenderer still derives local positions from transformed cell rectangles.

Bench is the original inventory node; there is no duplicate roster. Pokémon selection opens the right inspector; closing it preserves combat selection. Mobile uses Bag/Recruit drawers; the primary battle action remains visible. Volume, language and the existing confirmed New Run action live in Settings. Portrait layouts use the responsive screen rather than the legacy blocking rotation overlay. Main menu, save vault and talent tree are not redesigned.

Two pre-existing UI defects found during interaction checks were repaired: concurrent recall animation callbacks now remove the matching inventory ID instead of a stale array index; bag selling now returns for a missing item index instead of returning for every valid item. Prices, eligibility, formulas, combat, AI, roster, talent data, save schema and progression are unchanged.

## Existing sprite inventory

Pokémon portraits: `assets/pokemon/`, local sprite repository under ignored `sprites/`. Type icons: `assets/elements/`. Stat icons: `assets/ui/{hp,atk,spd,coin,slot}.png`. Item definitions referenced missing `assets/items/`; 94 existing local item sprites were copied there byte-for-byte. Provenance is recorded in `item-icon-sources.json`, avoiding a dependency on the ignored sprite directory at runtime. The missing Bench equipment seal was replaced with a dynamic text badge.

## Changed files

| Files | Purpose |
| --- | --- |
| index.html | Load the final stylesheet and presentation module |
| css/battle_visual.css, js/battle_visual.js | Native skins, responsive layout/settings/drawers, original Bench relocation and board fit |
| js/autochess/hex_preparation_info.js | Right inspector, tap/focus access, return to Recruit and health display |
| js/autochess/hex_renderer.js | Finite HP ratio and clipping, closed inspector stays closed |
| js/autochess/hex_view.js | Keyboard access to existing hex cells |
| js/app.js, js/ui_menu.js | Correct animation scale at native viewport; delegate board fitting and localize confirmation |
| js/ui_board.js, js/ui_shop.js, js/ui_talisman.js, js/battle_ai.js | Presentation labels/HP, shared-node visibility, equipment badge and UI callback/guard repairs |
| locales/en-US.js, locales/vi-VN.js | Presentation-only translations |
| scripts/*, tests/browser-smoke.cjs | Asset validation and meaningful browser regression checks |
| assets/visual/*, assets/items/*, docs/visual/*, artifacts/visual-* | Derived imagery, provenance, specs, mapping and real browser captures |

See `validation.md` for the executed checks and limits.
