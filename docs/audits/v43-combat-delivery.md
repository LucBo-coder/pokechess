# PokéChess+ V4.3 — Combat clarity và extensions A–F

Ngày: 12/10/2026. Triển khai trên source hiện có sau xác nhận Phase 0 của hai tài liệu. Các thay đổi layout, recruitment, Info, VFX và Save Profiles đã có được giữ lại.

## Audit và cách tích hợp vào phase plan

| Ưu tiên | Root cause trong source | Thay đổi đã triển khai |
| --- | --- | --- |
| A / lifecycle | HP chuẩn bị là DOM con trực tiếp của `.square`; combat HP là DOM con của sprite. CSS cũ không loại HP chuẩn bị mới khi combat bắt đầu. | Ẩn riêng indicator chuẩn bị trong combat, không dựa vào sprite có nhìn thấy hay không. |
| A / cleanup | `removeSprite` xóa Map trước khi animation kết thúc, nhưng không có fallback. `killUnit` có thể phát death lặp; callback cũ có thể tạo lại sprite. | Death idempotent theo owning unit, xóa pending hits; visual ALIVE → FAINTING → REMOVED; cleanup 450ms dự phòng; chặn spawn unit chết/stale; cleanup VFX theo owner. |
| B / clarity | Heal, status, crit và skill text chưa có giới hạn toàn trận. Chỉ damage xóa label cũ. Class/trait tên dài luôn hiện. Boss phase có thể chạy cả sheet lẫn CSS burst. | Manager tập trung, bỏ label class/trait thường trực, icon trạng thái, không nhân đôi boss burst. |
| B / layout | Name và action chia cột hẹp, warning combat lặp ở mọi card, Info tab không có kích thước đồng đều. | Bench 40px / identity co giãn / action 70px; tên ellipsis với tên đầy đủ trong tooltip/Info; khóa gọn; tab 4 cột; equipment row có preview riêng. |
| C / equipment | Đã có 93 item và hệ Talisman/save; thiếu Unequip/preview và nhiều hook Hex. | Adapter EquipmentSystem dùng cùng IDs, bag và equip API; Unequip trả đúng một charge; preview cùng phép tính live; nối hook hiện hữu. |
| D / Astral | 249 node; nhiều mô tả khác getter thực tế hoặc hứa hiệu ứng chưa nối combat. Có 57 minor description không khớp getter trong audit. | Registry theo node, mô tả từ actual contract, source trace; không thay species base; thêm runtime có cooldown/cap; milestone có ghi rõ thay đổi cân bằng bên dưới. |
| E / diagnostic | Breakdown tổng hợp có sẵn nhưng khó truy modifier theo nguồn. | `PokeChessDiagnostics.trace(roguelikeUI, item)` chỉ qua console; catalog toàn bộ 249 node/93 item. |
| F / validation | Screenshot đơn lẻ không chứng minh lifecycle hay combat load. | Node regression + engine battles + DOM ownership, expiry, cleanup và profile reload qua Edge headless. |

Pipeline damage chính, tọa độ Hex, targeting, deployment, stage schedule, Pokémon IDs và schema Save `3.5.0` được giữ. Các proc Equipment/Astral mới là mở rộng gameplay có chủ đích; presentation không tính damage/death.

## Combat presentation

- Sprite, HP 3px, mana 2px, shield và tối đa ba status icon + overflow count. Title hiển thị tên và thời gian còn lại. Class/detail truy cập qua Info.
- FloatingCombatTextManager: lifetime 650ms có timeout độc lập với combat pause; gộp số cùng unit/kind trong 120ms; tối đa hai label/unit; desktop 24, compact 12. Ưu tiên boss, skill, crit, damage, minor event.
- Normal attack không hiện skill name. Announcement lặp được hạn chế theo kind/text; status thường dùng icon. Crit và số damage vẫn là hai label riêng nếu đủ budget.
- Tối giản / Cân bằng / Chi tiết; năm toggle riêng cho numbers, skill, status, HP/mana và effects. Đổi setting cập nhật indicator ngay, kể cả combat dừng.
- Preference ở `pokechess_combat_display_v1`, ngoài Journey save. Cân bằng mặc định. Vietnamese và English.
- Nhật ký có thể đóng/mở từ header; gom damage/heal trong 200ms, giới hạn 200 entry. Khi log đóng không dựng lại 200 DOM row cho từng hit. Ghi cast, status, knockout, boss phase; không ghi normal attack name.

## Equipment và Astral: thay đổi cân bằng cần biết

Không tạo database item thứ hai. Giữ 93 IDs, giá, flat stats, Evolution Stones và Mega/Talisman category gốc. Adapter cung cấp category, rarity, restrictions, modifiers, caps, triggers và save mapping. Evolution consumable không chiếm slot battle mới.

Hook Hex mới gồm Quick Claw second hit (25%, cooldown 1s), Iron Ball push, Float Stone movement, Eject Button, Destiny Knot, Sticky Barb, Shed Shell, Smoke Ball, Starf/Custap, Balloon, Ring Target và Safety Goggles. Proc source `equipment` không tự gọi lại on-hit. Ring Target chỉ bỏ immunity 0; Safety Goggles chặn mage area có flag; Balloon dùng **element đã resolve** của hit, không đoán lại từ vị trí caster. Những field-damage hệ thống chưa phát event không được bịa thêm.

Astral catalog: 19 connector, 156 passive, 17 utility, 34 triggered và 23 milestone. Existing flat getter values giữ nguyên; tooltip phản ánh số thực tế thay vì tự đổi tất cả để chạy theo mô tả cũ. Runtime thêm shield đầu trận, hồi phục, poison, dodge, freeze/paralyze/hex, critical chain, phản damage/shield, first hit và Swarm. Cooldown theo combat ticks; poison max 5 stacks; swarm max 3; overheal max 25% HP đầu trận; shield cap Max HP; evasion cap 75%. Reflection/proc dùng source riêng để không đệ quy. Temporary Swarm/Hex hết hạn đúng tick và reset theo combat instance.

23 node chưa có modifier/hook được chuẩn hóa thành milestone +4 HP, hoặc +1 ATK nếu statKey là atk, trước chuyển đổi Hex. Đây là **thay đổi cân bằng**, không phải khẳng định đã hiện thực nguyên văn mọi mô tả legacy. Danh sách:

`m_notable_1`, `m_notable_5`, `w_root`, `w_conn_1`, `w_notable_4`, `w_reroll_2`, `w_spine_1`, `w_spine_2`, `a_conn_1`, `a_notable_1`, `a_syn_1`, `a_syn_2`, `a_spine_1`, `r_talisman_1`, `r_conn_1`, `r_notable_4`, `r_talisman_2`, `r_talisman_3`, `r_notable_5`, `r_drop_1`, `r_drop_2`, `r_spine_1`, `normal_notable_2`.

Utility như thêm slot, gold, reroll, cards, crit, champion vẫn đi qua MetaProgression hiện có. Unlock adjacency/point cost/load/respec dùng API cũ. Connector mở đường, không được mô tả là buff stat. Không thêm persistent state cho cooldown; không cần migration save.

Catalog máy đọc: [v43-modifier-catalog.json](v43-modifier-catalog.json). Regenerate bằng `node scripts/audit-v43.cjs`. Trace console có base/form/class/equipment/mastery/Astral/stage/synergy/terrain/temporary/final. Field `capped` của node flat hiện false vì các flat node không có cap; runtime caps ghi trong contract, không giả vờ có telemetry per-hit đầy đủ.

## Kiểm thử và bằng chứng

`node --test tests/hex_combat.test.cjs tests/v43.test.cjs`: **48/48**. Gồm regression damage, skill, boss, stage/rewards, mastery, save defaults, immunity, shield, pause, death/pending hit, registry 249 node, save mapping 93 item, Unequip, Balloon skill element, proc recursion/expiry, và engine 3v3/6v6/12v12 thực sự chạy đến kết thúc.

`node tests/browser-smoke.cjs --screenshots`: Edge headless; kiểm tra buy/sell/recruit/equip, identity, deployment/drag/recall, full slots, modal/settings/language/keyboard, ba profile stage cao qua load hai lần và reload thật, backup/import rollback, 92 VFX sheet decode/boundary, local assets, viewport desktop/tablet/iPhone, hit-test resize/touch. Clarity fixture chạy 180 engine ticks rồi burst multi-hit/heal/status/skill; có mage AoE và boss. Kiểm tra mỗi bar thuộc live unit, death không tái tạo bar, reset không còn overlay, text hết hạn khi pause và mode preference không ghi Journey.

Evidence: [v43-combat-evidence.json](../../artifacts/v43-combat-evidence.json). Giới hạn nhãn đo được 3v3 ≤24, 6v6 ≤24, 12v12 =24. Thời gian batch tick chỉ là đo headless, **không phải cam kết FPS trên điện thoại**.

Ảnh sau sửa: [3v3](../../artifacts/visual-v43-combat-3.png), [6v6](../../artifacts/visual-v43-combat-6.png), [12v12](../../artifacts/visual-v43-combat-12.png). Ảnh [baseline text tái hiện](../../artifacts/visual-v43-before-text-reconstruction.png) dùng fallback tạo label cũ trên fixture hiện tại; **không phải screenshot nguyên bản trước chỉnh sửa**. [Baseline evidence](../../artifacts/v43-before-text-evidence.json) ghi số unit/label; audit trước triển khai đã đo 102/204/408 label với burst bốn lần cho 3/6/12 mỗi bên.

Giới hạn xác minh: chưa chạy Safari/iOS thật, chưa deploy/kiểm thử live GitHub Pages, chưa có đánh giá win-rate/balance dài hạn của toàn bộ build. Responsive Edge là bằng chứng layout trong viewport, không thay thế Safari. Không có revival API hiện hành để báo revive thành công. Code không tạo subsystem revive mới.
