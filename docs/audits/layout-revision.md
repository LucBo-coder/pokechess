# Audit và bố cục UI — phản hồi kiểm thử

## Audit

Các panel đã ở đúng khu vực nhưng CSS cũ vẫn áp chiều rộng/chiều cao của layout trước: header có nhóm điều khiển lớn, nút Đổi chịu quy tắc rộng toàn panel, card Bench cao 110px và nút Chiến đấu nằm trong một hàng riêng. Settings dạng details không có cấu trúc modal. Toast có quy tắc position/transform chồng nhau, dễ bị cắt khi thông báo dài. Battlefield cần giữ một phép scale chung để không làm sai tọa độ.

## Bố cục triển khai

- Desktop: header chung gồm logo, Stage/Gold/Team, Menu, Nhật ký, bánh răng và Astral. Bên trái là Túi/Shop trang bị/Cộng hưởng có tab riêng; Astral không còn nằm trong panel Túi. Bench cuộn bên phải.
- Trung tâm: toolbar Thu quân/Tự xếp/nâng sức chứa/Hiệu ứng ngay trên Battlefield. Map nhận phần không gian còn lại. Recruitment nằm dưới map, header nhỏ chứa Đổi, Khóa đổi, Thu gọn và Chiến đấu; các offer có cùng kích thước, sprite/tên/giá/trạng thái.
- iPhone landscape: header một hàng, toolbar chạm 44px; Túi/Bench dạng drawer. Shop thu gọn mặc định, nút Chiến đấu luôn ở header của shop. Không thu nhỏ toàn app; chỉ Hex Battlefield dùng scale chung.
- Settings: modal có Âm thanh, Hiển thị, Điều khiển, Ngôn ngữ và Hồ sơ; đóng bằng nút, nền hoặc Esc. Focus được giữ trong modal.
- Thông báo: tối đa một toast, vùng riêng ngay dưới header, chiều cao giới hạn và nội dung dài cuộn; safe area theo viewport. Không đè map/nút. Nhật ký tối đa 200 mục.
- Bench: chọn card mở Info và chọn identity để triển khai; chỉ một nút Triển khai/Thu quân. Việc thu quân chuyển sang nút rõ ràng, tránh thu quân khi chỉ muốn xem Info.
- Info: tab Kỹ năng sử dụng metadata và runtime combat hiện có, hiện đòn cơ bản/active, hệ, sát thương, năng lượng, cooldown, windup và trạng thái năng lượng/hồi chiêu.

Khóa đổi là chốt UI ngăn đổi nhầm trong màn hiện tại, **không** giữ offer qua ải và không thêm field vào save. Combat, giá tuyển quân, sinh offer, ID/instanceId, profile và schema save không thay đổi bởi lần chỉnh layout này.

## Phạm vi kiểm thử

Đã chạy `node --test tests/hex_combat.test.cjs`: 38/38 đạt. `node scripts/validate-visual-assets.cjs`: 29 PNG UI/map và 94 icon đạt. `node tests/browser-smoke.cjs --screenshots`: đạt, không runtime exception hay local asset thiếu.

Browser kiểm tra keyboard Info/focus trap, shop lock không tiêu vàng, một nút Tự xếp/Hiệu ứng, một thao tác mỗi card Bench, Settings năm nhóm, Astral tách Túi, toast dài không che map/nút, save cả ba slot sau reload, scale/hit-test/drag/touch. Viewport: desktop, 768×1024, 768×432, 812×375, 844×390, 390×844; shop iPhone mở rộng vẫn có map và nút Chiến đấu trong màn.

Browser dùng Edge/Chromium local với profile tạm; kích thước iPhone được mô phỏng, không thay thế kiểm thử Safari trên thiết bị thật. Xem [bàn giao đầy đủ](ui-skill-delivery.md) và ảnh liên kết trong báo cáo.
