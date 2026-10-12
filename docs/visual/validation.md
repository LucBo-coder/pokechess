# Validation — 2026-10-12

Executed locally:

- `node scripts/validate-visual-assets.cjs`: passed. 29 derived PNGs, source/derived dimensions, crop boundaries, slice extents, all new CSS image paths, 94 byte-identical local item sprites.
- `node --test tests/hex_combat.test.cjs`: 37/37 passed, including combat/equipment/type modifiers, targeting, moving units, bosses, rewards, legacy saves, localization and progression.
- `node tests/browser-smoke.cjs --screenshots`: passed in headless Microsoft Edge. Expanded the existing browser suite rather than adding tests that only mirror styles.

Browser assertions cover stage 1/5/10 displayed stats, moving-unit selection, live inspector updates, pinned selection, boss phases, pause/resume, restart/load/retry, purchase/recruit costs, original Bench node identity, recall all, placement, native drag/drop, auto arrangement, item purchase/equipment, Pokémon and item selling, representative legacy and current save round-trips, HP at 0/5/50/100% and invalid HP/maxHP, closing details without clearing combat selection, settings, language change and New Run confirmation/cancellation.

Viewports: desktop 1440×900, narrow 768×432, iPhone landscape dimensions 844×390, portrait 390×844. Assertions check inspector containment, visible battle action, no central scroll requirement, uniform hex scale, hex center hit-test after resize and inverse scale for Bench animations. Chromium touch injection at 844×390 opens unit details through the actual tap/click flow. Console runtime exceptions: none. No new missing local assets.

Actual browser screenshots:

- [Desktop Recruit/Shop](../../artifacts/visual-desktop-recruit-shop.png)
- [Desktop preparation/details](../../artifacts/visual-hex-setup.png)
- [Desktop combat](../../artifacts/visual-hex-battle.png)
- [768px drawer](../../artifacts/visual-768.png)
- [iPhone landscape battlefield](../../artifacts/visual-board-844.png)
- [iPhone landscape details](../../artifacts/visual-844.png)
- [Portrait battlefield](../../artifacts/visual-board-390.png)

Limits and existing issues:

- Approved reference screenshot is missing; cannot certify a visual match against it.
- Viewports/touch were emulated in Chromium; physical Safari/iPhone, actual safe-area notches and browser chrome were not tested.
- Source artwork still contains gradients/soft alpha. Slot perimeters are normalized but corner variation remains; arbitrary sizes and strict pixel-grid consistency are not certified. Unused slices remain pending/null.
- Existing item descriptions are English strings in the existing item definitions; this pass preserves those definitions and the existing localization system.
- Existing optional development endpoints return 404: `/api/list-talismans`, `/api/list-pieces`, `/api/read-talisman`, `/api/read-piece`. Existing `assets/audio/tavern.mp3` and `js/pieces/nidoran_m.js` are absent. Browser suite explicitly identifies these original omissions; no new image errors were introduced.
- Network fonts/audio/CDNs are blocked by the browser test to isolate local behavior. Missing BGM cannot be restored from the provided six visual packs.
- Legacy save checks use representative old snapshots in an isolated browser profile, not the user's real browser storage. Tests do not mutate the user's current save files.
- Separate branch: `visual/battlefield-assets`. The user's modified banner and all original ZIPs remain untouched; nothing has been committed or published.
