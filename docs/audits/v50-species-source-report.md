# V5.0 — dữ liệu species và skill có nguồn

Ngày 12/10/2026. Triển khai theo yêu cầu kết hợp dữ liệu hiện có với wiki. Không thay ID Pokémon, combat lifecycle, save Classic hoặc các tài nguyên pixel art.

## Nguồn và độ phủ

- [PokéAPI v2](https://pokeapi.co/docs/v2): base stats, Pokémon/species mapping, learnsets, move power, type, category, accuracy, target và tên tiếng Anh.
- [Snapshot CSV](https://github.com/PokeAPI/pokeapi/tree/c80757193bd0889054e36f4209762360bdaa4b95/data/v2/csv): revision `c80757193bd0889054e36f4209762360bdaa4b95`. Catalog lưu URL và SHA-256 của cả bảy bảng nguồn. Script nhập chỉ đọc dữ liệu, không thực thi mã tải về.
- [Bulbapedia: Charizard](https://bulbapedia.bulbagarden.net/wiki/Charizard_(Pok%C3%A9mon)) dùng đối chiếu stats base/Mega X/Mega Y; [Move category](https://bulbapedia.bulbagarden.net/wiki/Damage_category) và [Damage](https://bulbapedia.bulbagarden.net/wiki/Damage) dùng đối chiếu ý nghĩa Physical/Special.

| Form | HP | ATK | DEF | Sp.ATK | Sp.DEF | SPD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Charizard | 78 | 84 | 78 | 109 | 85 | 100 |
| Mega Charizard X | 78 | 130 | 111 | 130 | 85 | 100 |
| Mega Charizard Y | 78 | 104 | 78 | 159 | 115 | 100 |

`js/data/species_catalog.js` chứa đủ **1.036 ID hiện có**, gồm 11 ID Mega. ID số được ánh xạ qua National species ID và default Pokémon; không coi PokeAPI Pokémon ID là National ID. Mega dùng slug form riêng. Không đổi ID save.

Mỗi species có tối đa ba skill đủ điều kiện từ learnset ở version group mới nhất có dữ liệu. Form không có learnset riêng dùng learnset base species, được ghi rõ bằng `learnsetPokemonId`. Lựa chọn ưu tiên STAB, category phù hợp ATK/Sp.ATK và power; có lựa chọn category còn lại khi khả dụng. Đây là bộ skill thiết kế cho Auto Chess, không phải move signature chính thức hoặc move đã học theo level của từng cá thể.

Snapshot có **249 move**. Move gây damage có power cố định trong khoảng 30–120; lọc một số move trì hoãn/tự hủy/đặc thù. Species không có move damage đủ điều kiện dùng status skill. Không giả định tất cả hiệu ứng phụ của move đều được engine hỗ trợ. Game dùng file local, không gọi wiki/API trong trận. Có thể tái tạo bằng `node scripts/import-species-data.cjs` với kết nối mạng.

## Chuyển thể combat và tác động cân bằng

`js/species_combat.js` là adapter vào HexCombat hiện tại. HP, attack anchor, attack speed, movement, scaling, class AI, equipment, mastery, type effectiveness, shield và death resolution tiếp tục qua pipeline cũ. Sáu stats nguồn hiển thị trong Info; HP/SPD nguồn chưa thay trực tiếp HP/speed của game.

Với `A` là damage anchor hiện tại và `C` là category:

- Hệ số tấn công: `clamp(stat[C] / mean(ATK, Sp.ATK), 0.65, 1.5)`.
- Hệ số phòng thủ: `clamp(1 / (1 + 0.35 × (DEF[C] / 85 − 1)), 0.65, 1.25)`.
- Damage attack/skill trước pipeline cũ được nhân hai hệ số trên đúng một lần. Basic attack dùng Physical; skill dùng category và hệ của move.
- Skill giữ mana/cooldown hiện tại; multiplier class được nhân `clamp(power / 90, 0.6, 1.25)`. Multiplier skill chung 0.65 của engine vẫn áp đúng một lần.
- Move nhắm nhóm đối thủ chuyển thành tối đa ba mục tiêu trong một Hex; move khác gây damage một mục tiêu. Boss giữ mechanic/skill riêng; stats defense/attack ratios vẫn áp dụng.
- True damage và DoT không nhân model mới. Choice Specs +15% chỉ áp skill Special trong model mới; Classic giữ hành vi cũ.

Các hệ số này là quyết định cân bằng Auto Chess, **không phải công thức main-series**. ATK/Sp.ATK cực lệch bị giới hạn; phòng thủ không gây giảm damage vô hạn. Một hit có thể thay đổi đáng kể so với model cũ; chưa kết luận thời gian run hoặc mọi build cân bằng.

Status skill có conversion riêng: Harden/Amnesia tăng DEF phù hợp 30% trong sáu giây; Cosmic Power hỗ trợ hai DEF; Toxic dùng Poison hiện tại; String Shot tăng movement interval 30% rồi khôi phục base, không nhân chồng; Teleport sang Hex liền kề trống xa đối thủ; Transform/Sketch sao chép battle-local ratios/skill phù hợp, không ghi đè species/HP/save. Cosmic Power và Amnesia là handler dự phòng, không bảo đảm có trong tập skill được chọn hiện tại. Mọi conversion đều nêu trong Info.

## UI và tương thích

Pokémon Info hiển thị sáu stats nguồn trong Tổng quan, category/type/power/description và tối đa ba lựa chọn trong Kỹ năng. Lựa chọn chỉ mở trước trận, lưu vào cá thể bằng `selectedSpeciesMoveId`; lựa chọn hết hợp lệ sau tiến hóa tự fallback sang skill mặc định của form mới. Tên move dùng tiếng Anh từ nguồn; nhãn, description và status có tiếng Việt/Anh.

Run mới có `speciesCombatVersion: 1`; run cũ thiếu trường này hoặc version 0 tiếp tục model cũ. Đây là discriminator versioned của model combat trong envelope Expedition v1; không thay schema Classic hoặc ép chuyển run đang chơi. Version không hỗ trợ bị từ chối khi nhập profile. Không cộng lại stats khi render, mở Info, equip hoặc load.

## Kiểm thử thực hiện

- 11 test mới: đủ 1.036 ID; Mega stats; matching ATK/DEF category; mana/cooldown; status expiry/reapply; save selection; old-run/Classic isolation; Choice Specs; mọi lựa chọn skill có thể cast qua engine; temporary Transform/defense.
- 18 trận engine hoàn chỉnh: 3v3, 6v6, 12v12 × ba vùng × battle/boss. Xác nhận kết thúc hợp lệ và HP/damage hữu hạn. Kết quả từng trận: `artifacts/v50-species-combat-evidence.json`. Đây là trận simulation, không phải playtest 35–55 phút.
- Edge browser smoke: chọn skill qua nút Info, persist, model vào combat, khóa lựa chọn trong trận, save Classic không đổi. Bằng chứng `artifacts/v50-expedition-evidence.json`; kiểm tra route responsive và ghost HP bar 3/6/12 tiếp tục chạy.
- Ảnh thực tế của tab Kỹ năng: `artifacts/visual-v50-species-skills.png`. Bộ regression đã chạy đạt **75/75 test**.
- Full regression: `node --test tests/hex_combat.test.cjs tests/v43.test.cjs tests/expedition.test.cjs tests/species.test.cjs`; asset check: `node scripts/validate-visual-assets.cjs`.

Chưa kiểm thử Safari thiết bị thật, GitHub Pages thật hoặc thời lượng run. BGM/cry vùng và event pack mở rộng vẫn là công việc riêng; dữ liệu wiki không tự cung cấp tài nguyên audio để đưa vào game. V5.0 vẫn là Expedition MVP có dữ liệu species và combat conversion mới, chưa phải full release.
