# Unified mode UI, faction HP và animation — audit 12/10/2026

| Hệ thống thực tế | Quyết định | Thay đổi dự kiến |
| --- | --- | --- |
| `js/ui_menu.js`, Main Menu trong `index.html` | EXTEND | Play mở hai mode card; Continue giữ active session; Collection và Settings truy cập từ menu. |
| `js/expedition/session.js`, `ui.js` | REUSE/EXTEND | Dùng lifecycle/checkpoint hiện có; bỏ nút nổi khi không có run; menu không tự chuyển về Classic. |
| `RoguelikeUI`, HexCombat và modal pause guard | REUSE | Không thêm controller gameplay, damage system hoặc timer combat. Navigation đọc `ui.expeditionRun` làm nguồn mode. |
| `HexRenderer`, `UnitHealthBar`, `hex_preparation_info.js` | EXTEND | Màu phe dựa `unit.color`/`piece.color`, shield riêng; giữ lifecycle death đã kiểm thử. Texture HP hiện ép cùng màu nên phải gỡ riêng fill. |
| `HexRenderer.playAnimation` | REFACTOR | Thay restart class bằng state priority và deadline theo combat tick; chuyển động wrapper giữ HP/sprite cùng anchor. |
| `getPieceIconUrl`, embedded icon pack | REUSE | Local static fallback đúng form; không thay Mega bằng base. Lỗi tải ảnh hiện làm Pokémon biến mất. |
| SpeciesCatalog và PokéAPI | EXTEND | Explicit 1.036 mapping, curated animated assets local; adapter validate/cache/timeout/fallback. Metadata không thay balance. |
| `HexVfxPlayer`, manifest 92 sheet, assets VFX | REUSE/EXTEND | Move ID/slug và custom role mapping dùng sheets hiện có, impact theo damage event; không nhân đôi VFX loop. |
| CombatPresentation/FloatingCombatTextManager | REUSE | Presets, bounded labels, logs và status icons tiếp tục dùng hệ thống hiện tại. |
| CSS pixel design, compact drawers, safe areas | EXTEND | Mode cards và HUD đồng bộ component hiện có; giữ map ưu tiên. |
| SaveSystem/ExpeditionStore/Mastery/Astral | REUSE | Không đổi schema; preference navigation riêng; transient animation không lưu. |

Root causes: menu Continue chỉ đọc Classic latest slot; Expedition panel tạo switcher không có run; HP texture và CSS `!important` bỏ qua phe; nhiều CSS animation độc lập tranh transform; skill VFX chọn role và không tận dụng move ID; missing sprite ẩn ảnh hoàn toàn. Damage/HP authoritative đã qua engine event, ghost cleanup hiện có phải bảo toàn.

Triển khai tuần tự: navigation/menu → HUD/save safety → faction HP → sprite manifest/API → animation priority → skill mapping/event sync → regression/viewport. Không yêu cầu approval mới vì tài liệu yêu cầu audit rồi triển khai. Không commit/push. Safari thiết bị thật và benchmark thiết bị yếu cần báo đúng phạm vi thực chạy.
