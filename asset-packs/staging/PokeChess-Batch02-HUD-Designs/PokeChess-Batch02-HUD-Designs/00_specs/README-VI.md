# PokéChess+ — Batch 02: HUD trống

7 thiết kế riêng, 10 file PNG: khung logo, stage, mẫu compact dùng chung, hành trình, chọn ngôn ngữ, nền ô số, dropdown. Ba file currency/team/menu là bản sao chính xác của compact để dễ ánh xạ, không phải ba thiết kế mới.

Tất cả không chữ, không số, không icon. Không có logo hoặc mũi tên gắn sẵn. Ảnh gốc được giữ nguyên byte, đặt tên và chia thư mục. Đây là gói thiết kế HUD, không phải toàn bộ UI.

## Đã kiểm tra
PNG mở được; đo kích thước và alpha; xem từng ảnh để xác nhận không chữ/icon; các đường dẫn manifest tồn tại. File ZIP được kiểm tra CRC.

## Giới hạn thực tế
Đây vẫn là bản thiết kế, chưa sẵn sàng tích hợp pixel-perfect. Ảnh có chuyển sắc nhẹ và mép bán trong suốt; còn nhiều lề ngoài. Tỷ lệ hình vẽ sinh ra không hoàn toàn theo tỷ lệ yêu cầu. proposed_display_size chỉ là kích thước bố cục đề xuất, KHÔNG phải kích thước file, KHÔNG kéo giãn ảnh trực tiếp tới kích thước đó. nine_slice=null vì chưa chuẩn hóa và kiểm thử co giãn. Chỉ trạng thái normal được xuất; hover/pressed/disabled chưa có.

## Hướng dẫn Codex
1. Đọc asset-manifest.json và ui-component-mapping.json.
2. Chuẩn hóa vùng nội dung, kích thước native và viền trước khi tích hợp; kiểm tra thủ công thay vì dùng alpha_bounds làm 9-slice vì có pixel alpha mờ ngoài viền.
3. Giữ nguyên gameplay, sự kiện và hệ thống dịch.
4. Gắn icon, chữ và số thành lớp độc lập. Logo là lớp riêng.
5. Ngôn ngữ dài được phép giãn vùng chữ; dropdown là panel riêng và danh sách HTML động.
6. Currency, Team, Menu có cùng geometry. Có thể dùng một file compact trong code để tránh tải trùng.
7. Chưa tuyên bố 9-slice đúng hoặc responsive đã kiểm thử; cần kiểm tra trên game thật.

## Tiếp theo
Nhóm icon rời chưa nằm trong gói này. Không sử dụng đường dẫn icon giả.
