# Bàn giao UI/UX và skill presentation

Đã triển khai các phase sau xác nhận của người dùng, bao gồm lượt chỉnh cấu trúc theo phản hồi ảnh. Audit gốc ở [Phase 0](ui-skill-phase-0.md); audit/bố cục mới ở [layout revision](layout-revision.md).

## Theo từng phase

| Phase | File/component chính | Thay đổi và logic | Kiểm thử / giới hạn |
|---|---|---|---|
| 0 — Audit | `docs/audits/ui-skill-phase-0.md` | Lập bản đồ DOM, combat, identity, save và asset; không sửa gameplay trong audit | Baseline và kiến trúc được ghi riêng; kết quả cũ không đại diện bản cuối |
| 1 — Layout | `js/battle_visual.js`, `css/battle_visual.css`, `js/ui_shop.js`, `index.html` | Di chuyển chính node cũ: Bench phải, Recruitment dưới map; header chung, toolbar trên map, Chiến đấu trong shop; card Bench chọn để xem Info, một nút triển khai/thu quân | Browser kiểm tra tuyển/mua/bán/triển khai/thu quân, drag, formation và hit-test. Khóa đổi chỉ chặn thao tác đổi nhầm, không giữ offer qua ải |
| 2 — Design system | `css/battle_visual.css`, `locales/*`, `js/i18n.js`, `js/ui_talisman.js`, `js/meta_progression.js` | Font hệ thống hỗ trợ tiếng Việt/offline, spacing/layer/focus chung, skin từ asset được cung cấp, phân biệt Túi/Shop/Hệ; Astral trên navigation | 29 ảnh UI/map và 94 icon kiểm tra nguồn/kích thước; tiếng Việt/Anh đổi được; không đổi node ID/effect của Astral |
| 3 — Notification | `js/notifications.js`, `js/ui_menu.js` | Dùng chung showToast/addLog; tối đa một toast và 200 log, dedupe/timer/nút đóng, vùng riêng dưới header có giới hạn chiều cao | Spam toast/log, toast dài ở mọi viewport không che map/nút; log không ghi vào journey save |
| 4 — Skill metadata | `js/autochess/hex_skill_info.js`, `hex_traits.js` | Bổ sung ID/category/target/energy/cooldown/cast time/effect/VFX/SFX cho active/basic/passive hiện có; describe lấy giá trị runtime | Node 38/38, gồm điều kiện blocked cast và không mất mana. Giữ phạm vi active cũ không giới hạn khoảng cách; không thêm gate combat mới |
| 5 — Skill UI/feedback | `hex_preparation_info.js`, `hex_renderer.js`, `js/vfx_player.js`, `js/vfx_manifest.js`, `assets/visual/combat-vfx.json`, `js/audio.js` | Info bốn tab, icon/basic/active/damage/mana/cooldown/windup/trạng thái; VFX theo tick, giới hạn 24 hiệu ứng, fallback CSS; SFX throttle/8 voice, tôn trọng mute/volume | 92 sheet decode; playback/pause/reduced motion/cleanup; gallery kiểm tra frame kết thúc trong suốt và biên ảnh. Không tạo ability mới từ tên artwork |
| 6 — Responsive/accessibility | `js/ui_accessibility.js`, `battle_visual.js`, CSS, viewport `index.html` | Drawer mobile, iPhone landscape layout riêng, shop thu gọn mặc định, nút chạm 44px, modal Settings bằng bánh răng, keyboard/focus trap/Esc, reduced motion | Desktop, tablet 768×1024, 768×432, iPhone 812×375/844×390 và portrait 390×844; keyboard Enter/Tab và touch giả lập đạt. Chưa kiểm tra Safari/iPhone vật lý |
| 7 — Save compatibility | `js/save_system.js`, Settings | Schema journey 3.5.0 giữ nguyên; một storage backup và restore có rollback; import kiểm tra trước khi ghi/backup trước overwrite; settings dùng namespace riêng | Cả 3 slot ải 50–52 giữ identity, instanceId, trang bị, XP mastery, Astral/run upgrade sau hai lần load và page reload; rollback hai lần đạt. Không chạy migration vì không đổi schema |
| 8 — Testing | `tests/hex_combat.test.cjs`, `tests/game-context.cjs`, `tests/browser-smoke.cjs`, `scripts/validate-visual-assets.cjs` | Kiểm tra engine + thực trình duyệt local bằng profile tạm, không ghi đè profile browser của người dùng | 38/38 Node; browser đạt, không runtime exception hay asset local thiếu; 29 UI assets/94 icons đạt |
| 9 — Delivery | Báo cáo này, `docs/visual/vfx-gallery.html`, `artifacts/visual-*.png` | Bàn giao nguồn/manifest/script tái xuất/gallery và ảnh desktop/mobile | Bản local, chưa publish/deploy |

## Nghiệm thu 20 tình huống

| # | Tình huống | Bằng chứng đạt |
|---|---|---|
| 1 | Save cũ | Browser load legacy/current; Node safe defaults |
| 2 | Đúng Hex | 56 cell, identity và vị trí sau load; hit-test/scale |
| 3–4 | Deploy/recall | Browser thao tác Bench và board, giữ instanceId |
| 5 | Info | Chọn card/Hex, bốn tab, Enter, touch |
| 6–7 | Talisman còn/đầy slot | Trang bị thành công; đầy slot không tiêu charge/di chuyển; banner và cancel |
| 8–10 | Mua đủ/thiếu vàng, sân đầy | Mua trừ đúng giá; thiếu vàng không thêm unit; đầy sân vẫn tuyển dự bị, chặn deploy |
| 11–12 | Tự xếp / Battle | Browser formation/drag/start combat, không có nút Tự xếp trùng |
| 13 | Basic damage | Node range, windup, pipeline damage và mitigation |
| 14 | Active | Node mana/cooldown/alive/target, blocked cast không mất mana |
| 15 | Passive | Node sáu trait damage/heal/mana/shield, cooldown và chống stacking |
| 16 | VFX/SFX | Browser tick pause, dedupe, cap, mute/0 volume, cleanup |
| 17 | Toast | Bounds dưới header/trước map/nút, cả thông báo dài và mobile |
| 18 | Log | 300 record giữ tối đa 200, dedupe |
| 19 | Console/resource | Browser runtime exceptions = 0, missing local assets = 0 |
| 20 | Responsive | Các viewport nêu trên, toolbar trong màn, map scale đều, battle luôn trong màn; shop mở rộng 812×375 vẫn còn map |

## VFX, âm thanh và dữ liệu

Ba HTML nguồn được duyệt có 92 asset độc nhất; attachment Batch 1 thứ hai là bản trùng. `scripts/export-vfx.cjs` tái xuất PNG/manifest, giữ nguồn trong `asset-packs/vfx-source`. `docs/audits/vfx-quality.json` lưu QC **nguồn**: một số loop có frame lặp, vài effect chạm biên hoặc thiếu frame trắng cuối. Export xử lý trường hợp đó bằng margin 32px/anchor tương ứng và frame trắng cuối cho one-shot; frame lặp hợp lệ trong loop không bị xóa. Browser kiểm tra bản export. Các signature/boss/status artwork có trong gallery; chỉ sự kiện combat thực sự tồn tại mới được map vào runtime, không thêm gameplay chỉ vì có sprite.

SFX tiếp tục dùng SoundManager tổng hợp sẵn. `scripts/build-bgm.py` tạo `assets/audio/tavern.wav` từ giai điệu thủ tục để thay tài nguyên MP3 thiếu; đã kiểm tra gate WebAudio nhưng chưa nghe xác nhận qua loa/tai nghe. UI dùng font local để không phụ thuộc Google Fonts.

`js/custom_moves.js`/`js/talisman_core.js` chỉ tự gọi editor GET API khi `window.POKECHESS_EDITOR_API` được bật trước khi load các script; web static dùng fallback local. Khả năng editor không bị xóa. Save cũ và Pokémon ID không được đổi bởi presentation layer.

## Lệnh kiểm tra và ảnh

```text
node --test tests/hex_combat.test.cjs
node scripts/validate-visual-assets.cjs
node tests/browser-smoke.cjs --screenshots
```

Ảnh: [desktop](../../artifacts/visual-desktop-recruit-shop.png), [iPhone landscape](../../artifacts/visual-board-812.png), [shop mở rộng](../../artifacts/visual-iphone-recruit-expanded.png), [portrait](../../artifacts/visual-board-390.png), [Settings](../../artifacts/visual-settings-modal.png), [VFX](../../artifacts/visual-overhaul-skill-playback.png), [gallery](../../artifacts/visual-overhaul-vfx-gallery.png).

Giới hạn nghiệm thu: mobile là Chromium viewport/touch giả lập; cần kiểm tra Safari và safe area trên iPhone thật. Profile ải cao là fixture kiểm thử, không phải hành trình chơi thủ công 50 ải. Âm thanh mới cần nghe thực tế. Không thay đổi engine targeting, damage, cooldown hoặc economy trong lượt sửa layout này.
