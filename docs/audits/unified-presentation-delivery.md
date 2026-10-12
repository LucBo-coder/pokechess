# Unified presentation — kết quả triển khai

Ngày 12/10/2026. Audit trước chỉnh sửa: [unified-presentation-audit.md](unified-presentation-audit.md). Không commit/push; không đổi damage calculation, Pokémon IDs hoặc schema Classic/Expedition.

| Phase | Kết quả và file chính |
| --- | --- |
| 1–2 | `js/game_navigation.js`, `ui_menu.js`, `expedition/ui.js`: Play mở Classic/Expedition trong Main Menu. Bỏ switcher nổi khi chưa có run. Continue giữ active session, có fallback last-mode preference khi reload. Collection/Settings dùng hệ thống cũ; mode cards Việt/Anh. HUD Expedition hiển thị Act/node, Trainer HP vẫn lấy run thật. |
| 3 | `js/faction_health.js`, `battle_visual.js`, `ui_board.js`, `hex_preparation_info.js`, `hex_renderer.js`: green `#27C76F` cho color `w`, red `#EF4444` cho `b`, shield cyan `#38BDF8`. HP không đổi màu theo %. Phe chưa biết dùng màu neutral. ◆/▼ làm cue bổ sung; boss có viền vàng. |
| 4 | `js/pokemon_presentation.js`, `js/data/pokemon_sprite_manifest.js`, import script: explicit 1.036 internal IDs → external IDs/slug; 18 GIF local đúng form. Metadata adapter có validation, cache 200 mục, request coalescing, abort/timeout và local fallback; không fetch trong combat loop, không ghi vào save/balance. |
| 5 | `PokemonAnimations` trong presentation adapter: IDLE/MOVE/ATTACK/CAST/HIT/FAINT/STATUS/VICTORY. Priority/deadline theo combat tick; anticipation/impact/recovery của attack/cast; idle một pixel. Wrapper movement giữ HP/sprite cùng vị trí; các transform chỉ áp ảnh. FAINT giữ death cleanup authoritative cũ. |
| 6–7 | `js/skill_visuals.js`, `vfx_player.js`: data-driven move/custom-role mapping, fallback cho 18 hệ. Flamethrower, Water Gun, Thunderbolt, Vine Whip, Shadow Ball, Ice Beam, Psychic, Hyper Beam, Earthquake có sheet phù hợp. Impact theo damage event, projectile duration theo hit delay; thêm moveId vào damage event chỉ là metadata. Tên skill nguồn không còn bị đổi về tên class trong announcement. |
| 8–9 | Tái sử dụng presets, giới hạn VFX 24 sheets/80 lightweight objects và bounded floating text. Không thêm RAF/interval animation. Chỉ ghi faction styles khi ownership đổi, idle style khi pixel phase đổi. Menu font/width/grid được sửa sau khi xem ảnh thật; ưu tiên map và pixel rendering. |
| 10 | Không reset save; `pokechess_navigation_v1` riêng cho preference. Return Menu checkpoint Expedition trước khi mở, giữ combat object và modal pause guard; Continue không tải nhầm Classic. Page visibility dùng pause guard cũ, đổi GIF sang static khi pause/reduced motion. |
| 11 | Node, Edge browser workflows, viewport và asset validation được chạy; phạm vi cụ thể bên dưới. |

## Bằng chứng

- Full Node suite: `node --test tests/hex_combat.test.cjs tests/v43.test.cjs tests/expedition.test.cjs tests/species.test.cjs tests/presentation.test.cjs`. **85/85 pass**: 75 test trước đó cộng 10 test presentation.
- Test mới kiểm tra 1.036 mappings, hash/dimension 18 GIF; exact Mega/shiny/unknown fallbacks; API success/cache/coalescing, 404/offline/invalid/timeout; animation priority/expiry/idle/hidden; màu phe không phụ thuộc %HP; every move VFX có asset hợp lệ; Continue không tải Classic. API failure/success tests dùng fixture/mock fetch để tái lập; runtime không cần API online.
- `node tests/browser-smoke.cjs --screenshots`: Main Menu cards, Classic entry, Expedition entry, Continue active combat giữ object/node/tick; ba vòng mode switching giữ node/gold; HP màu phe tại 100/50/10%; ghost cleanup trong 3/6/12; legacy saves, equipment, recruitment, settings, VFX pause/mute/reduced motion và responsive cũ.
- Menu mới chụp ở desktop và 1366×768, 812×375. Các kiểm tra map/Info cũ tiếp tục phủ 390×844, 768/812/844 và desktop. Viewport Edge không được gọi là Safari.
- `node scripts/validate-visual-assets.cjs`: PNG, CSS URLs và item icons hiện có. GIF kiểm tra riêng trong presentation test.

Ảnh menu: `artifacts/visual-unified-main-menu.png`, `visual-unified-menu-1366.png`, `visual-unified-menu-812.png`. Ảnh combat: `visual-v43-combat-3.png`, `visual-v43-combat-6.png`, `visual-v43-combat-12.png`. JSON: `artifacts/unified-presentation-evidence.json`, `v50-expedition-evidence.json`, `v43-combat-evidence.json`.

## Giới hạn đã xác định

- Chỉ 16 form có GIF và hai shiny đã curated; những form khác dùng static icon với transform states. Không khẳng định toàn bộ 1.036 form có GIF hoặc sprite sheet riêng cho tám trạng thái.
- GIF idle có playback của trình duyệt; animation actions, VFX và recovery theo combat tick. Khi pause/hide/reduced motion, GIF đổi sang static; không dùng GIF để tính damage hoặc RNG.
- API adapter là metadata bổ sung có thể gọi theo nhu cầu. Production dùng snapshot/manifest local; không tự tải sprites từ URL tùy ý trong response API.
- Preset hiệu ứng thấp giữ fallback nhẹ; không hứa 60 FPS. Stress test xử lý 180 tick trong một lần evaluate chỉ đo chi phí simulation/render update, không phải FPS, pin hoặc memory leak của phiên chơi dài.
- Chưa chạy Safari iPhone/iPad thật, low-end device thật, soak test nhiều giờ hoặc GitHub Pages thật. Không khẳng định các gate này hoàn tất.
- Nguồn và quyền hình ảnh ghi trong [PROVENANCE.md](../../assets/pokemon/animated/PROVENANCE.md), dẫn [PokéAPI](https://pokeapi.co/docs/v2) và [PokeAPI/sprites](https://github.com/PokeAPI/sprites).
