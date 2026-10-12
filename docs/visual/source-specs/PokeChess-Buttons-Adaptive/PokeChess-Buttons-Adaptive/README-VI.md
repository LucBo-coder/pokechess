# PokéChess — Nút dùng lại nhiều kích thước

## Có gì
- Hai PNG gốc không chữ/icon: xanh primary và đỏ danger.
- runtime/buttons.js: bộ vẽ canvas 9-slice, cắt vùng thừa lúc hiển thị, không sửa PNG gốc.
- runtime/buttons.css: nhãn động, focus bàn phím, hover/pressed/disabled.
- preview.html: ví dụ nút nhỏ/lớn, chữ Việt/Anh/Trung, nhãn dài và disabled.

## Dùng
Giữ nguyên cấu trúc thư mục. Mở preview.html để xem thử (hoặc phục vụ bằng local server).
Trong trang game, thêm CSS và script sau DOM chứa nút:

<link rel="stylesheet" href="runtime/buttons.css">
<button type="button" data-pixel-button="primary">Mua</button>
<button type="button" data-pixel-button="danger">Bắt đầu chiến đấu</button>
<script src="runtime/buttons.js"></script>

Gắn event gameplay cũ vào chính button như trước. Nhãn dùng hệ thống dịch có sẵn.
Với DOM mới, gọi PokeButtons.init(container). Nhãn sau khi init nằm trong .button-content; cập nhật nội dung ở đó, không xóa canvas. Framework như React/Vue nên chuyển renderer thành component với cleanup ResizeObserver/window resize khi unmount; bản script này dành cho DOM thuần, không nên mount/unmount hàng loạt mà không bổ sung cleanup.

## Quy tắc fit
- Mỗi góc hiển thị 8 CSS px; phần giữa co giãn, không kéo giãn toàn bộ hình.
- Kích thước chạm tối thiểu 44x44 CSS px. Nội dung cần rộng hơn thì nút phải tăng kích thước.
- Nút dài dùng width:100% hoặc kích thước của container; không khóa height.
- Nhãn được xuống dòng, có thể ngắt từ quá dài; không thu font tới mức khó đọc.
- Icon là img riêng trong button, kèm alt rỗng nếu chỉ trang trí. Nút chỉ icon cần aria-label.
- Disabled dùng thuộc tính disabled thật, không chỉ đổi màu.
- Hover chỉ áp dụng cho thiết bị có hover; focus-visible hỗ trợ bàn phím.
- Không dùng nút này cho panel, ô hex, progress bar hoặc control cần giữ tỷ lệ hình ảnh.
- Đây là hai ảnh normal; trạng thái tương tác là CSS, không có bộ PNG state riêng.

## Metadata nguồn và cắt
PNG gốc được giữ nguyên. Crop theo [x,y,width,height] trong runtime:
primary [68,120,2037,470], danger [65,115,2043,483].
Slice nguồn [left,top,right,bottom] = [128,96,128,96]. Đây là thông số khởi đầu cho adapter; cần xác nhận trực quan trong trình duyệt/game. Không áp border-image-slice=8 trực tiếp lên PNG nguồn.

## Đã kiểm tra / chưa kiểm tra
Đã xem hai ảnh không chữ/icon; đo kích thước PNG và alpha; kiểm tra cú pháp JS, đường dẫn và ZIP. Ảnh nguồn vẫn có chuyển sắc và mép mềm; không gọi là pixel-perfect native.
Kiểm tra trình duyệt tự động bị chặn do môi trường không có binary Chromium. Vì vậy chưa xác nhận trực quan 9-slice, overflow, click/keyboard hay responsive. Trang mẫu chuẩn bị các trường hợp cần thử ở 320, 844 và 1536 px, zoom 200%, nhãn dài và iPhone ngang.
Không cam kết fit mọi trường hợp tùy ý. Chưa sửa code game hay dữ liệu, chưa tích hợp vào repo.
