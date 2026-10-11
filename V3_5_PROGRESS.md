# PokéChess+ V3.5 — tiến độ triển khai

Project hiện có và các thay đổi V3.0 được giữ lại. Chưa commit. Báo cáo này phân biệt chức năng đã chạy với phần còn phải hoàn thiện; không đánh dấu toàn bộ V3.5 đã hoàn thành.

## Combat và cửa hàng

Đã đọc và sửa `app.js`, `hex_bridge.js`, `hex_combat.js`, `synergy_system.js`, `meta_progression.js`, `trees/core_tree.js`, `trees/fire_tree.js`, `ui_shop.js`, `ui_talisman.js`, `ui_board.js`, `ui_menu.js`. Đối chiếu hiệu ứng với `talisman_core.js`, các định nghĩa trang bị và `battle_combat.js`.

- Astral và các bonus HP/ATK/Speed/Electric của đội người chơi không còn tăng chỉ số địch.
- Crit Astral vào đòn đánh thật; các bonus ATK core bị thiếu được nối lại. Chosen Champion tính một lần trước quy đổi Hex và theo Starter qua tiến hóa nhờ `starterSpeciesId`.
- Fire notable tính đúng +15 HP như mô tả; Fire keystone dùng hiệu ứng sát thương có điều kiện và thiêu đốt, thay cho +HP/+ATK không được mô tả.
- Cửa hàng dùng số lựa chọn, giảm giá, lượt đổi miễn phí mỗi Stage và sức chứa trang bị của Astral. Lượt miễn phí riêng không tiêu hao lượt nhận từ phần thưởng. Không mua nâng sức chứa quá 12.
- `hex_effects.js` gắn vào luồng sát thương/hồi phục hiện có: Muscle Band, Metronome, Black Belt, Expert Belt, Choice Specs, Charcoal, Mystic Water phần sát thương, Flame Orb, Toxic Orb một phần, Focus Sash/Band, hồi sinh, Leftovers, Shell Bell, Dragon Fang, Wise Glasses, Big Root, Sitrus Berry, Weakness Policy, phản đòn, Red Card, Divine Shield, Bright Powder, né Ghost/Flying, Fairy heal và Lum Berry chống trạng thái DOT mới. Protective Pads bỏ giảm sát thương khi đánh thường và ngăn phản đòn.
- Flat ATK/HP của hiệu ứng dùng hệ số Hex hiện có. Với hiệu ứng theo lượt được chuyển trong đợt này, một chu kỳ hồi phục/DOT là một giây. Giới hạn hồi sinh/sống sót và cooldown được lưu trên unit của trận, không lên inventory.
- `unit.statBreakdown` cho biết chỉ số gốc, class, equipment/synergy/Astral, quy đổi Hex, Stage/Boss, bonus tạm và chỉ số kết quả. Có thể xem qua console trên unit của `roguelikeUI.hexCombat`.

**Phase 1 vẫn cần hoàn thiện:** các hiệu ứng đặc biệt còn lại của trang bị/cây nguyên tố chưa được chuyển hết. Ví dụ Quick Claw, Eject Button, trạng thái riêng của nhiều constellation, buff/aura core còn thiếu. Các getter cũ của nhiều cây nguyên tố vẫn có số khác mô tả; không tuyên bố mọi node/trang bị đã đồng bộ. Strike First còn cần chuyển giới hạn “round đầu” sang thời gian thực. Không thay bảng tương khắc hay hệ số Stage/Boss để che các khoảng trống này.

## Ngôn ngữ

`locales/vi-VN.js`, `locales/en-US.js`, `js/i18n.js` cung cấp `t(key, params)`, fallback tiếng Anh, fallback tùy chọn, escape HTML, định dạng số, lưu lựa chọn và cập nhật DOM. Tiếng Việt là mặc định. ID gameplay, ID item/species, khóa save và tên Pokémon giữ nguyên.

Đã nối menu chính, nhiều nút tĩnh, nhãn header, hướng dẫn Hex, tutorial tương tác, Pokémon Info, class/kỹ năng, trait/trạng thái, lựa chọn thưởng/event, tổng kết trận, một phần shop và VFX vào catalog. Có bộ chọn ngôn ngữ. Dùng font dự phòng hỗ trợ dấu và cho phép ngắt dòng ở các vùng đã dịch.

**Phase 3 và QA toàn bộ ngôn ngữ chưa hoàn tất:** mô tả/tên node của 19 cây Astral, tên/mô tả mọi trang bị, UI Starter/Save động, một số tooltip, dialog, log và thông báo legacy còn tiếng Anh. Bản lưu cũ chỉ chứa tiêu đề thưởng không có payload cũng có thể giữ tiêu đề tiếng Anh. Chưa có bằng chứng rằng tất cả màn hình đều không tràn chữ hoặc không lộ tiếng Anh. Không đổi số gameplay trong quá trình dịch.

## Hai lớp Mastery

`js/mastery.js` quản lý tinh thông loài và kinh nghiệm cá thể, dùng các hook của combat hiện có.

- Species Mastery: theo hồ sơ lưu, tối đa cấp 30; lưu XP, cấp, mốc, chuyên môn và biến thể kỹ năng được mở. Mốc 5/10/15/20/25/30 mở chuyên môn, biến thể hoàn năng lượng, đặc tính nâng cao, biến thể hồi chiêu, hiệu ứng nâng cao, danh hiệu.
- Individual Mastery: `instanceId` theo hành trình, XP tối đa 5.000, bậc novice/trained/veteran/elite/ace, một chuyên môn, một biến thể và tối đa một đặc tính nâng cao. ID theo inventory đi qua bench/board và save. Đã sửa `autoArrangePlayerFormation` làm mất `invId`.
- XP chỉ được tính khi combat đã kết thúc và xác minh kết quả từ trạng thái engine. Tính tham gia, gây/gánh sát thương, hồi phục, lá chắn và kết quả; unit dự bị/triệu hồi không được thưởng. Thống kê hồi phục ghi cho người hồi, không ghi thành công của người nhận.
- Receipt `runBest` ngăn nhận lại XP Stage đã ghi trong cùng hành trình, kể cả tải snapshot cũ. XP cá thể được khôi phục từ receipt. Thua/hòa vẫn có XP lần đầu; retry cùng Stage không cộng lại. Stage thấp hơn một nửa Stage cao nhất của hồ sơ chỉ nhận 25% XP. Mỗi cá thể tối đa 60 XP/trận; một loài tối đa 45 XP/trận dù triển khai nhiều bản sao.
- Tiến hóa giữ ID/XP/bậc cá thể; dùng tinh thông riêng của loài mới. Chuyên môn/biến thể chưa mở của loài mới không tạo hiệu ứng. Ditto dùng loài thật để tính Mastery, không dùng Pokémon sao chép. Inspector dùng vai trò/kỹ năng thật của unit khi hình dạng hiển thị khác.
- Chuyên môn Tấn công/Phòng thủ dùng hook kỹ năng: Charizard thiêu đốt/lan sang một mục tiêu ở cấp 25, hoặc giảm sát thương có điều kiện và sống sót với cooldown 60 giây; Venusaur độc/hồi đồng đội; Blastoise và fallback phòng thủ bảo vệ đồng đội gần. Fallback tấn công cường hóa một đòn thường có thời hạn. Mọi proc hồi chiêu, DOT không cộng dồn vô hạn.
- Biến thể thứ nhất hoàn 10 năng lượng khi chuyên môn kích hoạt; biến thể thứ hai giảm hồi chiêu proc từ 12 xuống 10 giây. Cấp 15 chọn Guardian/Vampiric dùng code trait hiện có; cấp 25 lá chắn có thể bảo vệ hai đồng đội. Không sửa base stats theo cấp Mastery.
- Inspector có XP/bậc/chuyên môn/biến thể/đặc tính/mốc kế tiếp. Menu có bộ sưu tập tìm kiếm các Pokémon và tiến trình của hồ sơ. Chỉ đổi lựa chọn chuyên môn trong SETUP.

Đây là bộ chuyên môn ban đầu và fallback cho các loài khác; chưa có cân bằng riêng cho mọi Pokémon. Chưa benchmark bộ sưu tập hơn 1.000 dòng trên điện thoại. `runBest` và receipt cá thể tăng theo số hành trình; không xóa receipt cũ vì sẽ cho phép cộng XP lại khi tải backup.

## Save compatibility

Giữ `chess_plus_save_slot_` và ba ô lưu. Save mới có version `3.5.0`, thêm `masteryProfile`, `instanceId`, `individualMastery`, `starterSpeciesId`. Bản 2.8/3.0 thiếu các trường này nhận mặc định, không reset Stage.

Receipt bổ sung nằm ở `pokechess_mastery_profiles_v1`; lựa chọn ngôn ngữ ở `pokechess_language`. Save và export JSON mang cả dữ liệu Mastery; export kết hợp receipt của hồ sơ vào snapshot. Ghi vào một ô khác là sao chép tiến trình hiện tại sang ô đó và kết hợp với tiến trình đã có ở ô đích; không xóa ô nguồn. New Journey giữ tinh thông hồ sơ đang dùng và tạo lại các cá thể. Astral vẫn dùng khóa meta cũ toàn cục, không bị thay thế bởi Mastery.

## Kiểm tra và cân bằng

```powershell
node --test tests/hex_combat.test.cjs
node tests/browser-smoke.cjs --screenshots
node tests/browser-smoke.cjs --elements-only
node tests/browser-smoke.cjs --roguelike-only --screenshots
node tests/mastery-balance.cjs
git diff --check
```

37 kiểm thử Node kiểm tra regression V3.0 và các trường hợp Astral, equipment, locale, XP rollback/idempotency, bench/summon, tiến hóa, Ditto, shield/heal/cooldown mới. Loader dùng dữ liệu species/item/tree thật, chia sẻ trong `tests/game-context.cjs`.

Browser kiểm tra ngôn ngữ, persistence, chọn chuyên môn, tìm kiếm bộ sưu tập, chỉ số Stage 1/5/10, moving selection, inspector, boss phase, pause/load/retry, thưởng/event, save cũ và tiến hóa. Profile Edge tạm riêng. Có một lần Edge không mở được cổng gỡ lỗi; chạy lại bài kiểm tra nguyên tố đã đạt.

`artifacts/mastery-balance.json` chứa **264 trận mô phỏng thật**, 8 Stage (1/10/25/50/75/100/125/150), 8 đội hình, 3 seed; thêm đối chứng tắt Mastery/equipment/Astral cho đội highMastery. Tất cả kết thúc trong 180 giây, chỉ số hữu hạn, đúng lịch boss, không còn hit chờ.

Mẫu Stage 150: đội phòng thủ thắng 3/3, highMastery thắng 2/3, lowMastery thắng 1/3, tấn công và chuyên Fire thắng 0/3. Các đội được dựng với roster/upgrades/gear/Mastery ghi rõ trong script, không phải kết quả chơi một hành trình từ Stage 1. Ba seed không đủ khẳng định win rate toàn game. Chênh lệch các bài đối chứng không phải các phần sát thương có thể cộng lại. Chưa đo boss spike với các Stage liền trước/sau, chưa mô phỏng economy/recruitment đủ hành trình, chưa có cơ sở để nerf boss.

## Công việc chưa hoàn tất

1. Hoàn thiện Phase 1 cho các node/item còn thiếu và kiểm tra sai lệch mô tả của các constellation còn lại.
2. Hoàn thiện Phase 3: dịch toàn bộ UI/data hiển thị, gồm tooltip/canvas/dialog/log; cập nhật runtime cho các vùng đó.
3. Mở rộng kiểm thử specialize/variant/từng nhánh và kiểm thử migration nhiều profile, export/import trên máy mới, các nhánh tiến hóa thật trên browser.
4. Hoàn thiện Phase 10/11 bằng playtest economy, mẫu lớn hơn, đo boss spike và QA mọi màn hình ở cả hai ngôn ngữ.

Những việc này không cần xin lại phê duyệt; người dùng đã cho phép tiếp tục các phase. Báo cáo giữ trạng thái chưa hoàn tất để lượt làm việc tiếp theo có thể tiếp tục đúng phạm vi.
