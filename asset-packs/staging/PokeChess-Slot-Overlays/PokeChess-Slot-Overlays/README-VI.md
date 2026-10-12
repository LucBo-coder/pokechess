# PokéChess — Viền trạng thái ô

Bốn PNG rời, không chữ/icon/nền ô:
- slot-selected.png: vàng, đang chọn.
- slot-equipped.png: xanh lá, đang trang bị.
- slot-locked.png: xám nét đứt, bị khóa.
- slot-disabled.png: xám liền, vô hiệu hóa.

Không vẽ lại panel hoặc ô vật phẩm. Đặt viền lên ô có sẵn. Dùng cho slot vật phẩm, trang bị, bench; không dùng trực tiếp cho ô hex.

## Các lớp
Nền ô có sẵn → icon vật phẩm/Pokémon → viền trạng thái → số lượng/badge.
Overlay chỉ trang trí: pointer-events:none, aria-hidden=true. Sự kiện vẫn thuộc slot gốc. Với locked/disabled, gameplay/UI phải chặn hành động tương ứng; đổi viền không tự chặn được thao tác.

## Quy tắc trạng thái
Chỉ hiển thị một viền chính: disabled > locked > selected > equipped > normal (không có overlay). Nếu món đang trang bị được chọn, dùng selected và thể hiện equipped bằng badge/chữ động riêng. Không chồng hai viền khác màu lên nhau. Khóa và disabled vẫn cần mô tả lý do bằng tooltip/tap, không chỉ dựa vào màu.

## Co giãn và căn chỉnh
Bốn nguồn cùng canvas 1254x1254 nhưng vùng viền và góc KHÔNG trùng tuyệt đối. Không chỉ đặt cả bốn img width:100% rồi tuyên bố đã fit. Manifest ghi opaque_bounds đo bằng alpha>=240 để hỗ trợ đo đạc, không phải crop hoặc 9-slice đã duyệt.
Cần căn vùng viền với vùng viền thật của inventory-slot.png đã có, không căn theo mép canvas. Chuẩn hóa chung một hình học góc rồi mới đóng băng các crop/slice. Ô vuông nên có cùng width và height; đề xuất thử 48,64,80,96 CSS px. Muốn giữ độ dày viền ở nhiều cỡ phải dùng 9-slice bỏ phần giữa. Nét đứt locked nên lặp cạnh nguyên bước pixel, không kéo dãn từng nét tùy ý. Không tự áp thông số slice của bộ button.

## Kiểm tra
Đã xem bốn hình không chữ/icon và đo PNG RGBA, kích thước, alpha. Locked/disabled có alpha=0 trong vùng giữa 1/3 ảnh. Selected/equipped có alpha 0–1/255 trong vùng đó, gần trong suốt nhưng chưa tuyệt đối. Còn mép alpha mềm và sai khác hình học; đây là bộ thiết kế overlay, chưa pixel-perfect. Chưa kiểm tra ghép trong game hoặc trên iPhone; nine_slice=null có chủ đích. File PNG được giữ nguyên, không chỉnh sửa bằng script.

## Không nằm trong gói
Không có icon ổ khóa/check, ảnh vật phẩm, panel mới, bộ HP hoặc code game. Các phần đã có tiếp tục dùng lại.
