# PokéChess+ — Batch 01: Bản thiết kế khung rời

8 PNG riêng, không có chữ, icon, số liệu hoặc nhân vật. File gốc từ công cụ tạo ảnh được giữ nguyên, chỉ đổi tên và phân thư mục.

## Ánh xạ
- panel-main: khung dùng chung cho bảng trái/phải.
- header-red: thanh tiêu đề đỏ cho hai bảng.
- tab-active / tab-inactive: nền tab vàng/xanh.
- inventory-slot: ô vật phẩm trống.
- recruit-row: nền hàng tuyển quân; gắn chân dung, tên, chỉ số và nút bằng các lớp khác.
- portrait-frame: khung chân dung trống.
- dialogue-frame: khung hội thoại ngang; gắn NPC và chữ riêng.

## Kiểm tra và giới hạn
Đã kiểm tra định dạng, kích thước, alpha và vùng bao nội dung từng PNG; đã xem ảnh để xác nhận không chữ và icon.
Đây là bản thiết kế, CHƯA phải bộ pixel-perfect dùng ngay trong game. Có chuyển sắc, mép bán trong suốt và độ dày viền chưa đồng nhất; portrait-frame có phần giữa tối không đều. Tab active/inactive chưa khớp hình học. Chưa cắt lề trong suốt hoặc chuẩn hóa kích thước native, chưa xác định 9-slice. Manifest để nine_slice=null có chủ đích.

## Hướng dẫn Codex
Không thay gameplay. Không kéo giãn toàn bộ ảnh vào panel. Chưa tự dùng border-image-slice mặc định. Cần chuẩn hóa pixel grid, màu phẳng, alpha và cặp tab trước, sau đó đo viền thật và thêm 9-slice metadata. Vùng visible_bounds trong manifest là bounding box alpha khác 0, không phải thông số 9-slice. Chữ đa ngôn ngữ, icon, portrait, giá và số liệu luôn là lớp động riêng.

## Phạm vi
Batch này chỉ có tám thiết kế khung nền đầu tiên. HUD, nút thao tác, icon, map và những khung mở rộng chưa được sản xuất trong gói này.
