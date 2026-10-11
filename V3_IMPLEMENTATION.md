# PokéChess+ V3 — báo cáo triển khai

Đã tiếp tục Phase 3–10 theo yêu cầu tự động thực hiện. Các thay đổi dùng engine, UI, TypeSystem, TalismanSystem, SynergySystem và save slots sẵn có. Không thay dữ liệu Pokémon gốc hoặc bảng khắc hệ.

## Các phần đã thực hiện

| Phase | Hành vi | File chính |
| --- | --- | --- |
| 1–2, từ lượt trước | Công thức chung cho SETUP/BATTLE; Class áp dụng một lần; hệ tấn công theo ô Hex hiện tại, kỹ năng có thể chỉ định hệ; dual type, miễn nhiễm và true damage | `js/app.js`, `js/autochess/hex_bridge.js`, `js/type_system.js`, `js/autochess/hex_skill_info.js`, `js/ui_board.js`, `js/ui_shop.js`, `js/autochess/hex_view.js` |
| 3 | Inspector nằm sau bàn trong vùng cuộn, không che RECRUIT; bám ID khi di chuyển; HP/Mana/Shield/Phase/trait/status và tốc độ di chuyển thực tế | `style.css`, `js/autochess/hex_preparation_info.js` |
| 4 | Idle/walk/attack/cast/hit/death bằng CSS pixel; projectile theo hệ, critical hit, feedback khắc hệ; sát thương theo hit tick; hủy mục tiêu chết hoặc cận chiến rời tầm; projectile theo mục tiêu di chuyển; FX LOW; cleanup và pause | `js/autochess/hex_combat.js`, `js/autochess/hex_renderer.js`, `css/hex_combat.css`, `js/app.js` |
| 5 | Bắt buộc chọn 1/3 phần thưởng khác loại; trọng số và rarity theo Stage; Gold/Pokémon/Talisman/upgrade/healing/reroll/evolution item/trait; chặn nhận lại và chuyển Stage sớm | `js/roguelike_expansion.js`, `js/battle_combat.js`, `js/ui_shop.js` |
| 6 | Merchant, Shrine, Wild Encounter, Cursed Battlefield, Training, Treasure; giá/rủi ro rõ ràng; luôn có lựa chọn bỏ qua; không xen vào Stage chia hết cho 5 | `js/roguelike_expansion.js` |
| 7 | Berserker, Guardian, Vampiric, Arcane, Swift, Last Stand: trigger/cooldown/duration/stacking thực tế, chỉ báo và lưu trait trong inventory | `js/autochess/hex_traits.js`, `js/autochess/hex_combat.js`, `js/autochess/hex_renderer.js` |
| 8 | Armored/Summoner/Berserker/Elemental elite; tối đa 2 summon, không nhân Stage lần nữa; class synergy 2/4/6 và diversity 6/8 hệ, mở từ Stage 3; đếm species duy nhất; hiển thị buff trong SYN | `js/autochess/hex_traits.js`, `js/autochess/hex_bridge.js`, `js/ui_talisman.js` |
| 9 | Tổng kết ở Victory/Defeat/Draw: damage dealt/taken, healing, skills, MVP, thời gian, Gold và phần thưởng; giữ thống kê Pokémon đã chết | `js/autochess/hex_combat.js`, `js/roguelike_expansion.js` |
| 10 | Kiểm thử logic và Edge thực tế; tương thích save cũ; phục hồi thưởng/event đang chờ; lưu tiến hóa qua chọn thưởng; chặn callback tiến hóa của Stage cũ; free reroll được lưu sau khi dùng; quick deploy đủ 12 Pokémon trong 28 ô nhà | `tests/hex_combat.test.cjs`, `tests/browser-smoke.cjs`, `js/save_system.js`, `js/ui_menu.js`, `js/ui_board.js`, `js/ui_shop.js` |

`index.html` chỉ bổ sung hai module mới. Các file liệt kê phía trên cùng ảnh trong `artifacts/` là phạm vi thay đổi; dùng `git diff --stat` và `git status --short` để xem cả file mới.

## Quy tắc và giới hạn

- Giữ hệ số Stage/Mini Boss/Boss hiện có; elite không xuất hiện trên Stage Boss. Boss chính có Area Blast từ Phase 2; Mini Boss giữ Boss Strike.
- Nâng cấp run tối đa +40 HP, +12 ATK, +60 Speed trước hệ số Hex. Tối đa hai trait/Pokémon; Last Stand một lần/trận; Guardian shield tối đa 50% HP; tank shield tối đa Max HP; Mana tối đa 100; lifesteal synergy tối đa 30%.
- Event xác suất 40%, seed theo run/Stage. Lựa chọn và trạng thái đã nhận được lưu vào save hiện tại; tải lại slot hiện tại không nhận lại thưởng. Import một snapshot cũ là khôi phục run về thời điểm đó, không phải cơ chế chống chỉnh sửa save.
- Wounds lấy từ HP kết thúc trận của Pokémon đã triển khai, tối đa 50%; giảm HP khởi đầu trận sau. Healing giảm wounds. Inspector và HUD SETUP dùng HP này, không giả là đã hồi đầy.
- Thưởng Talisman chọn item có stat/type/reduction mà Hex sử dụng. Các hiệu ứng đặc biệt của item/element trong engine theo lượt cũ chưa được chuyển toàn bộ sang Hex; code cũ được giữ. Ví dụ mô tả Leftovers/Muscle Band vẫn có phần hiệu ứng theo lượt ngoài stat bonus. Không tuyên bố mọi hiệu ứng item cũ đã được kiểm thử trong Hex.
- Giới hạn 80 node VFX impact/projectile/burst đồng thời và FX LOW giảm các hiệu ứng đó. Chưa benchmark FPS trên điện thoại hoặc đội hình kín 56 ô; đây là giới hạn triển khai, không phải cam kết hiệu năng.

## Kiểm tra và bằng chứng

Chạy tại thư mục project, với Node và Edge đã cài; không cần cài package:

```powershell
node --test tests/hex_combat.test.cjs
node tests/browser-smoke.cjs --screenshots
node tests/browser-smoke.cjs --elements-only
node tests/browser-smoke.cjs --roguelike-only --screenshots
git diff --check
```

29 kiểm thử Node đạt. Loader đọc dữ liệu Pokémon và Talisman thật theo script trong HTML, gồm 1.036 species. Mô phỏng engine dùng tick thực, không thay kết quả thắng/thua để đạt assertion.

Browser smoke dùng HTTP server localhost, CDP và profile tạm riêng: kiểm tra Stage 1/5/10, actual startBattle với equipment, layout, di chuyển/selection, boss phase, pause/resume, restart/load/retry, save 2.8/V3, thưởng/event, tiến hóa, free reroll, quick deploy 12 unit và cleanup. Test thưởng chủ động loại enemy bằng damage event để kiểm tra UI chiến thắng; đó không phải bài đo tỷ lệ thắng. Các case engine mô phỏng riêng kiểm tra combat tự chạy đến kết thúc.

Ảnh UI: `artifacts/hex-setup.png`, `artifacts/hex-battle.png`, `artifacts/roguelike-reward.png`.

### Kết quả cân bằng có giới hạn

16 trận kiểm soát dùng bốn đội hình: cùng class, nhiều class, chuyên Grass và chuyên Fire, ở Stage 1/5/10/20. Tất cả kết thúc trong 180 giây, chỉ số hữu hạn, tổng damage summary khớp tổng damage event. Các đội hình không equipment/upgrades thua các đội địch đối xứng có Boss ở Stage 5 trở lên.

Thêm bảy mẫu dùng encounter generator và formation thật ở Stage 1/3/5/6/10/12/20, với seed cố định và đội hình nâng cấp có giới hạn. Mẫu Stage 1 dùng ba starter; các mẫu sau dùng đội đã tiến hóa/sáu slots. Các trận lần lượt kết thúc ở 12,9 / 6,5 / 8,0 / 9,5 / 22,8 / 17,1 / 32,0 giây, đúng lịch Boss và không tồn đọng hit queue. Các mẫu này đạt kiểm tra ổn định, nhưng không chứng minh đường tiến triển economy hoặc tỷ lệ thắng đã cân bằng hoàn toàn; cần playtest nhiều run để tinh chỉnh trọng số/phần thưởng. Không tăng hệ số HP/ATK địch để che vấn đề này.

### Các tài nguyên thiếu từ project hiện tại

Static smoke vẫn nhận 404 từ `/api/list-talismans`, `/api/list-pieces`, `/api/read-talisman`, `/api/read-piece`, `/assets/audio/tavern.mp3`, `/js/pieces/nidoran_m.js`. Đây là endpoint editor/asset/override đã thiếu trước thay đổi; dữ liệu species đóng gói vẫn tải. Các test browser đầy đủ kiểm tra không có asset thiếu mới và không có exception runtime.

## Review và rollback

Thay đổi chưa tự commit. Commit backup hiện tại là `0444a24` (`Backup PokeChess before V3 update`). Có thể xem patch bằng `git diff`; file mới xem trực tiếp vì chưa được Git track. Sao lưu patch và save JSON trước khi rollback, rồi chỉ khôi phục file mong muốn từ backup. Không dùng reset toàn bộ workspace nếu có chỉnh sửa riêng cần giữ. Để rollback module mới, phải bỏ cả script reference và hook liên quan; chỉ xóa một module sẽ để lại luồng UI không đầy đủ.
