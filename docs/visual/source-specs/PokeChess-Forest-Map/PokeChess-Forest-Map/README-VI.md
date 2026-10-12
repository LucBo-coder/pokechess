# PokéChess — Verdant Forest

## Hai ảnh thật trong gói
- maps/forest/backgrounds/forest-background.png: nền cảnh rừng, bãi cỏ trống, cây đá ven rìa, suối và cầu ở dưới.
- maps/forest/ground/forest-grass-texture.png: texture cỏ riêng tùy chọn để mask vào mặt đất/ô hex.

Không Pokémon, không UI, không chữ và không lưới hex gắn cứng. Cây, đá, hoa, suối và cầu trong background đã ghép vào nền, chưa có sprite riêng hay animation; đây là nền cảnh tĩnh, không phải tileset môi trường đầy đủ. Không tạo collision hoặc hiệu ứng gameplay từ hình trang trí.

## Tích hợp tối thiểu
1. Vẽ background phía dưới bàn đấu. Giữ nguyên số hàng/cột, kiểu hex, tọa độ và luật chơi hiện có.
2. Lấy bounding box của TẤT CẢ đỉnh ô trong bàn hiện tại. Fit bounding box vào vùng cỏ bằng một hệ số scale chung cho hai trục, không đổi tỷ lệ hex.
3. Vùng an toàn đề xuất nằm trong x=18–82%, y=19–81% của background. Đây là vùng bảo thủ ước lượng bằng mắt, cần kiểm tra với grid thật, KHÔNG phải yêu cầu đổi kích thước bàn. Nếu quân/HP nhô ra, thêm lề trong vùng này.
4. Vẽ lưới hex và terrain overlay bằng renderer hiện có lên background. Chỉ dùng texture cỏ tùy chọn nếu cần phủ nền ô; không vẽ texture phủ kín cây/cầu.
5. Unit, HP, hiệu ứng, vòng chọn và tương tác tiếp tục là lớp riêng. Không thêm vòng chọn gắn cứng lên background.

## Fit màn hình
Contain ảnh vuông trong vùng map, giữ tỷ lệ 1:1; phần thừa ngoài ảnh dùng nền UI tối. Không dùng cover làm cắt bridge/cây mà quên hiệu chỉnh tọa độ. Phép biến đổi nền và bàn phải cùng hệ quy chiếu.
Với rect cỏ [rx,ry,rw,rh] và board bounds [bx,by,bw,bh]:
s=min(rw/bw,rh/bh)
tx=rx+(rw-s*bw)/2-s*bx
ty=ry+(rh-s*bh)/2-s*by
screen=(s*worldX+tx,s*worldY+ty). Input pointer dùng phép biến đổi ngược. Các tọa độ rect cần đổi từ normalized sang pixel hiển thị thực tế trước.
Đây là hướng dẫn view transform, không thay world coordinates/pathfinding. Nếu bàn trở nên quá nhỏ, cần giảm bề dày cảnh rìa hoặc dùng viewport pan/zoom; không ép mọi bàn bất kỳ vào cùng kích thước.

## Texture cỏ
Ảnh cỏ là tùy chọn, không bắt buộc dùng nếu nền đã đủ đẹp. Dùng một texture trải trên toàn board rồi clip theo vùng/hex để giữ tỉ lệ cỏ nhất quán. Chưa xác nhận seamless; không lặp texture rồi giả định không có đường nối. Không coi texture này là tile hex có kích thước chuẩn.

## Đã kiểm tra / giới hạn
Đã xem ảnh, kiểm tra không có UI/unit/grid và đo kích thước/định dạng. Nguồn vẫn có chuyển sắc và texture chi tiết; chưa chuẩn hóa native pixel grid. Chưa ghép với source game, chưa kiểm tra hit-test, crop trên iPhone hoặc độ đọc HP. Background có trang trí ven rìa nhô vào cỏ nên phải dùng vùng an toàn thực tế thay vì áp yêu cầu prompt 76% một cách máy móc. ZIP đã kiểm tra đọc được; các đường dẫn manifest tồn tại.
