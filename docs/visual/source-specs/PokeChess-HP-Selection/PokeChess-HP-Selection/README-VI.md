# PokéChess — Thanh HP và vòng chọn

## File đã tạo
- combat/hp_bars/hp-bar-frame.png: vỏ HP rỗng.
- combat/hp_bars/hp-bar-fill.png: phần máu xanh, không số.
- combat/selection/unit-selection-ring.png: vòng chọn vàng rỗng, không Pokémon.

Không tạo lại panel, HUD, nút hoặc slot. Không thay đổi gameplay.

## Ghép thanh HP
Thứ tự: nền track tối (màu phẳng do renderer vẽ) → phần máu nằm trong clip/mask → vỏ HP → số liệu động khi cần.
Tỷ lệ hiển thị = clamp(currentHP/maxHP,0,1) khi maxHP > 0; dữ liệu không hợp lệ phải xử lý riêng và tránh chia cho 0. Luôn lấy số liệu hiện tại từ game.
Giữ full-width texture fill; cắt vùng nhìn thấy từ trái sang phải theo tỷ lệ HP. Không co cả vỏ theo lượng máu và không thu nhỏ texture fill mỗi lần mất máu. 0% không vẽ fill, 100% không tràn viền. Track tối không có PNG riêng vì chỉ là màu phẳng.
Vỏ dùng 3-slice ngang sau khi cắt lề và xác định đầu mút; giữ chiều cao nhất quán. Không kéo cả PNG chứa lề vào kích thước thanh. Chiều rộng gợi ý thử 48–72 CSS px cho quân và 160–240 px cho bảng chi tiết, không phải thông số đã kiểm thử. Chỉ hiện số trên quân đang chọn/hover để tránh chồng chữ; bảng chi tiết luôn có số nếu UI yêu cầu.

## Điểm neo và lớp vẽ
Vòng chọn đặt dưới sprite, trên mặt đất. Căn tâm vòng theo điểm chân/ground anchor của unit; không căn theo mép dưới canvas sprite có padding. Dùng cùng phép biến đổi world-to-screen/camera với unit. Chiều rộng vòng đề xuất 65–80% bề rộng ô hex, giữ tỷ lệ ellipse tự nhiên sau crop; không tự đổi hitbox hoặc hình học hex.
HP có anchor riêng phía trên/dưới sprite theo layout đã chọn; không để HP thay vị trí theo từng frame animation có bounding box khác nhau. Không vẽ vòng chọn trên lớp icon/trạng thái. Khi unit bị xóa hoặc không còn selected, gỡ vòng tương ứng. Overlay không bắt click.

## Fit nhiều kích thước
Đo crop thật của ba PNG trước. opaque_bounds trong manifest chỉ là kết quả alpha>=240, không phải crop đã duyệt hoặc tọa độ clip lòng thanh. Vỏ và fill có kích thước khác nhau nên phải căn vào cùng inner track, không chồng width:100% là xong. Không dùng 9-slice của bộ button cho thanh HP.

## Kiểm tra và giới hạn
Đã xem từng ảnh để kiểm tra không chữ/Pokémon; đo kích thước, alpha và đường dẫn. Tâm vỏ HP và vòng chọn có alpha=0. Tâm fill alpha=253, chưa hoàn toàn opaque; nguồn còn mép mềm, lề lớn và chuyển sắc. Vòng có một số pixel mờ quanh lòng cần kiểm tra khi đặt lên map sáng/tối. Không gọi bộ này pixel-perfect hoặc production-ready. Chưa ghép thử trong game, chưa xác nhận alignment hay tương phản ở kích thước nhỏ. PNG giữ nguyên dữ liệu nguồn; manifest ghi nine_slice=null.

## Cần thử khi tích hợp
0/1/50/100% HP; maxHP=0 hoặc thiếu dữ liệu; nhiều quân đứng cạnh nhau; sprite khác kích thước; pan/zoom; đổi độ phân giải; unit được chọn/đổi mục tiêu/bị xóa. Chỉ kiểm tra hiển thị, không sửa công thức sát thương hoặc hồi máu.

## Phạm vi
Chưa có thanh shield, status icon, damage number hoặc animation. Chỉ bổ sung những phần đó nếu UI và cơ chế thực tế cần.
