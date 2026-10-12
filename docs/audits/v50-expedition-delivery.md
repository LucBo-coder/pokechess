# V5.0 Expedition — triển khai và bằng chứng kiểm thử

Ngày 12/10/2026. Tiếp tục sau yêu cầu triển khai phần còn lại; không thay project hoặc định dạng save Classic 3.5.0.

## Phạm vi đã nối vào game

| Phase | Thay đổi |
| --- | --- |
| 1 | Lifecycle route → node/preparation → battle → reward → route; Trainer HP; defeat/victory; receipt riêng cho từng lần thử trùm. Pokémon đầy HP đầu encounter, không mất Pokémon khi thua. |
| 2 | Seed và RNG version 1, các luồng route/shop/event/reward/evolution/combat riêng. Ba Act, mỗi Act chín bước; đường nối hiển thị trực tiếp, boss cuối Act, điểm nghỉ có thể tiếp cận. |
| 3 | Battle/Elite dùng HexBridge/HexCombat cũ. Shop, Rest, Treasure và Challenge có luồng lựa chọn và checkpoint riêng. |
| 4 | Sáu Blessing giới hạn tầng; ba Talisman cả đội giới hạn ba bùa khác nhau; trang bị từng Pokémon dùng TALISMANS/EquipmentSystem hiện tại. Bonus đi qua getEffectivePieceStats; shield/mana dùng API combat và cap hiện có. |
| 5 | Bốn event có ID ổn định, nội dung Việt, chi phí, hậu quả, điều kiện hệ, điều kiện tiền/HP và mở starter. Choice được lưu trước khi áp dụng. |
| 6 | MVP có Elimination, Survival 30 giây, Elite Hunt. Objective được kiểm tra trong lifecycle combat; không quyết định thắng qua VFX. |
| 7 | Ba pool đối thủ, địa hình hỗ trợ khác nhau; Venusaur vùng độc, Tyranitar đá lở theo hàng, Mewtwo hút năng lượng. Telegraph cố định vào Hex trong 1,5 giây, dọn khi trùm chết/kết thúc/reset. Tái sử dụng phase, damage, status, shield và mana của engine. |
| 8 | Hồ sơ Expedition riêng, starter mở được chọn, lịch sử 50 run, XP species và individual có cap hiện tại; mở Ascension và bộ Hộ vệ khi thắng. Astral Legacy chỉ áp dụng ở Classic, không xóa hoặc chuyển đổi dữ liệu cũ. |
| 9 | Setup, route có đường nối, choice, build, kết quả, history, nhập/xuất/backup. HUD Trainer HP trong header; layout cuộn độc lập và safe area. Tái sử dụng Settings/VFX/audio có sẵn. |
| 10 | Node regression, 1.000 seed, combat thật, UI workflow, viewport và asset checks đã chạy; các release gate thủ công bên dưới chưa được xác nhận. |

## File và ownership

- `js/expedition/core.js`: model, generator, receipts và store.
- `js/expedition/session.js`: adapter giới hạn vào controller hiện có; checkpoint profile/run trước khi đổi màn hình.
- `js/expedition/content.js`: event registry, terrain, boss telegraph; renderer chỉ trình bày event.
- `js/expedition/objectives.js`: điều kiện thắng được xác minh bằng trạng thái combat.
- `js/expedition/ui.js`, `css/expedition.css`: UI tiếng Việt và responsive.
- `tests/expedition.test.cjs`: test state, persistence, actual engine và lỗi storage.

Save dùng `pokechess_expedition_v1:<profile>` và `:backup`. Profile chứa run riêng trong cùng một JSON envelope để result, XP, gold, choice, history được commit cùng nhau. Có kiểm tra revision để ngăn tab cũ ghi đè tab mới. Backup hợp lệ có thể khôi phục primary JSON hỏng mà không bị thay bằng primary hỏng.

Run đang combat khi đóng trang được tiếp tục ở preparation của đúng encounter, giữ formation/shop/RNG đã lưu. Đây là **restart encounter**, không phải resume ở đúng tick. Heal đầu encounter có receipt riêng, không được lặp khi restart. Classic slots, Astral store và Mastery store cũ không được Expedition ghi vào.

## Cấu hình thử nghiệm, chưa phải cân bằng cuối

Trainer HP 100; gold 10; starter mặc định 1/4/7; capacity đầu Act 3/5/7; cap tối đa giữ 12. Loss battle/challenge 10/15, elite 15, boss 20. Rest hồi 30%. Win +6/+8/+10 gold theo Act; lựa chọn thưởng vàng +8/+11/+14. Ascension tăng HP/ATK đối thủ theo cấu hình adapter.

Không coi các con số này là cân bằng đã chốt. Chưa có playtest chứng minh một run kéo dài 35–55 phút. Không nhập/chuyển đổi sức mạnh Astral cũ sang unlock mới; Classic giữ cây cũ, Expedition có unlock riêng.

## Hai lỗi combat đã xác minh và sửa

- Reapply Burn/Poison giữ lịch tick đang chạy thay vì lùi `nextTick` liên tục. Test áp lại mỗi 15 tick trong 120 tick: HP 1.000 → 988, một status announcement khi mới áp. Lượng damage mỗi tick không đổi.
- Né tránh của Equipment, Astral, Synergy và Bright Powder cộng vào một chance trước **một roll**, cap 75%. Ghost first dodge vẫn là hiệu ứng một lần như trước. Test 10.000 hit xác nhận đúng một roll/hit và tỷ lệ trong khoảng 73,5–76,5%. Lỗi trước đây cho phép nhiều roll độc lập vượt cap.
- Backup Classic đã bổ sung khóa Combat Display Settings; Journey schema không đổi.

## Bằng chứng đã chạy

Lệnh: `node --test tests/hex_combat.test.cjs tests/v43.test.cjs tests/expedition.test.cjs`.

16 test Expedition và 48 test hiện có. Trong đó: 1.000 seed route; restore RNG; reward/loss idempotency; retry boss; terminal states; storage quota; conflict revision; corrupted save recovery; failed profile switch; full HP/shield/Astral isolation; objective verification; DoT và evasion; event eligibility; hazard counterplay; evolution/instance identity/history; 12 encounter engine thật qua ba Act với Battle/Elite/Boss/Challenge.

Bổ sung dữ liệu có nguồn: chạy thêm `tests/species.test.cjs`, tổng **75/75 test pass**, gồm 11 test species và 18 trận 3/6/12 dùng model mới qua ba vùng. Edge xác nhận lựa chọn skill persist, khóa trong combat và Classic isolation. Ảnh `artifacts/visual-v50-species-skills.png`; chi tiết và công thức chuyển thể trong [báo cáo dữ liệu species](v50-species-source-report.md).

`node tests/browser-smoke.cjs --screenshots`: Edge headless kiểm tra hệ thống UI cũ và Expedition, viewport 812×375, 390×844; route SVG, save/resume và save Classic không thay đổi. Workflow test chủ động knockout đối thủ để kiểm tra màn hình kết quả; **không dùng workflow đó làm bằng chứng cân bằng hoặc chiến thắng tự nhiên**. Test engine thật nằm trong Node suite.

`node scripts/validate-visual-assets.cjs`: 29 visual PNG, CSS asset URLs và 94 item icons.

Ảnh: `artifacts/visual-v50-expedition-route.png`, `visual-v50-expedition-812.png`, `visual-v50-expedition-390.png`. Workflow JSON: `artifacts/v50-expedition-evidence.json`. Ảnh combat 3/6/12 và bằng chứng cleanup vẫn có ở artifacts V4.3.

## Release gates và giới hạn còn lại

- Chưa chạy Safari trên iPhone/iPad thật; viewport Edge không thay thế Safari.
- Chưa deploy hoặc xác minh URL GitHub Pages thật.
- Defense/Capture ngoài MVP; chưa có object/zone controller cho hai mục tiêu đó.
- Đã bổ sung snapshot PokéAPI có nguồn cho đủ 1.036 species/form, sáu chỉ số gốc và 249 move được chọn từ learnset. Expedition mới dùng model Vật lý/Đặc biệt và chọn skill trước trận; Classic và run cũ giữ model cũ. Đây là chuyển thể Auto Chess có hệ số công khai, chưa mô phỏng toàn bộ hiệu ứng move của game Pokémon. Xem [báo cáo dữ liệu species](v50-species-source-report.md).
- Event pack, BGM/cry riêng từng vùng và đánh giá cân bằng 35–55 phút chưa hoàn tất; audio tiếp tục dùng tài nguyên hiện có.
- Không tuyên bố V5.0 hoàn thành release toàn bộ chỉ dựa trên Node/Edge. Bản hiện tại là Expedition MVP có thể chơi và kiểm tra trong game.
