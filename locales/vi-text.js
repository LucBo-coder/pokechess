'use strict';
window.PokeChessVietnameseText = {
 'Cannot reroll pieces during battle! Finish the battle first.':'Không thể làm mới Tuyển quân trong trận. Hãy hoàn thành trận trước.',
 'Cannot sell pieces during battle!':'Không thể bán Pokémon trong trận.',
 'Please select a piece from your bench or board to sell!':'Hãy chọn Pokémon trên sân hoặc dự bị để bán.',
 'Cannot sell talismans during combat!':'Không thể bán Talisman trong trận.',
 'Talisman bag is empty!':'Túi Talisman đang trống.',
 'Please select a talisman in your bag to sell!':'Hãy chọn Talisman trong túi để bán.',
 'Cannot reroll talismans during combat!':'Không thể làm mới cửa hàng Talisman trong trận.',
 'You need at least 3 Gold to reroll the talisman shop!':'Cần 3 vàng để làm mới cửa hàng Talisman.',
 'Cannot purchase talismans during combat!':'Không thể mua Talisman trong trận.',
 'Can only equip talismans during the preparation phase!':'Chỉ có thể trang bị Talisman trong giai đoạn chuẩn bị.',
 'Invalid target unit!':'Pokémon mục tiêu không hợp lệ.',
 'Bench is empty!':'Danh sách dự bị đang trống.',
 'Click RECRUIT tab to get Pokemon.':'Tuyển Pokémon tại panel Tuyển quân bên dưới.',
 'Talisman bag is empty.':'Túi Talisman đang trống.',
 'Visit the [SHOP] tab to buy new talismans!':'Mở tab Cửa hàng để mua Talisman.',
 'Battle in progress!':'Trận đấu đang diễn ra!',
 'Talisman shop is temporarily closed.':'Cửa hàng Talisman tạm khóa trong trận.',
 'Sold out of talismans.':'Đã hết Talisman.',
 'Click REROLL to find new talismans!':'Nhấn Làm mới để tìm Talisman khác.',
 'Select a piece from your bench or board to sell':'Chọn Pokémon trên sân hoặc dự bị để bán',
 'Select a talisman in bag to sell':'Chọn Talisman trong túi để bán',
 'Cannot sell talismans during combat':'Không thể bán Talisman trong trận',
 'Talisman bag is empty':'Túi Talisman đang trống',
 'EQUIPPED':'ĐÃ TRANG BỊ','SPELL':'VẬT PHẨM DÙNG','USE':'DÙNG','EQUIP':'TRANG BỊ','CANCEL':'HỦY','SELL':'BÁN',
 'NO ACTIVE TRAITS':'CHƯA CÓ CỘNG HƯỞNG',
 'Deploy Pokémon onto the board to activate trait synergies!':'Đưa Pokémon ra sân để kích hoạt cộng hưởng hệ.',
 'Deployed:':'Trên sân:','Combat Speed':'Tốc độ chiến đấu','Max Evolution Stage':'Tiến hóa tối đa',
 '5 Evolution Stone Branches':'5 nhánh tiến hóa bằng đá','Evolves using Items':'Tiến hóa bằng vật phẩm',
 'Trainer Management System':'Quản lý hành trình','PROMOTION EVOLUTION':'TIẾN HÓA','CONFIRM':'XÁC NHẬN',
 'You defeated the enemy army!':'Bạn đã đánh bại đội hình đối phương!',
 'All your Pokémon fell in battle.':'Tất cả Pokémon của bạn đã bị hạ.',
 'All remaining pieces fell into the abyss!':'Các Pokémon còn lại đã bị hạ!',
 'Your squad was retained. Rearrange and try again!':'Đội hình được giữ lại. Hãy sắp xếp lại và thử lần nữa.',
 'Recruit New Pokémon':'Tuyển Pokémon mới','Background Music':'Âm thanh nền','Music Volume':'Âm lượng',
 'Toggle Music (Press M)':'Bật / tắt âm thanh (M)','Upgrade squad deployment capacity':'Nâng sức chứa đội hình',
 'Recall all deployed Pokémon back to bench':'Đưa toàn bộ Pokémon trên sân về dự bị',
 'Commence battle for this round':'Bắt đầu trận đấu','Select a Pokémon to sell':'Chọn Pokémon để bán',
 'Open Game Menu / Save Vault (ESC)':'Mở Menu / Hồ sơ lưu (Esc)',
 'Removed from Starter Squad':'Đã bỏ khỏi đội khởi đầu','Must keep at least 1 starter in squad!':'Đội khởi đầu phải có ít nhất một Pokémon.'
};
window.PokeChessVietnamesePatterns = [
 [/You need at least (\d+) Gold to (?:reroll recruitment cards|recruit this piece|purchase this talisman)!/g,'Không đủ vàng: cần $1 vàng.'],
 [/Not enough gold! Need (\d+)g to recruit (.+)\./g,'Không đủ vàng! Cần $1 vàng để tuyển $2.'],
 [/Rerolled piece recruitment cards for (\d+)g\./g,'Đã làm mới Tuyển quân với $1 vàng.'],
 [/Rerolled talisman shop for (\d+) Gold\./g,'Đã làm mới cửa hàng Talisman với $1 vàng.'],
 [/Bought (.+) for (\d+)g!/g,'Đã tuyển $1 với $2 vàng.'],
 [/Recruited (.+) to bench \(FREE\)!/g,'Đã nhận $1 vào dự bị miễn phí.'],
 [/Sold (.+) for \+(\d+)g\./g,'Đã bán $1, nhận $2 vàng.'],
 [/Sold \[(.+)\] for \+(\d+) Gold\./g,'Đã bán [$1], nhận $2 vàng.'],
 [/Purchased \[(.+)\] for (\d+) Gold!/g,'Đã mua [$1] với $2 vàng.'],
 [/Equipped \[(.+)\] to (.+)! \((\d+)\/(\d+) uses remaining\)/g,'Đã gắn [$1] cho $2. Còn $3/$4 lượt dùng.'],
 [/\[(.+)\] has been completely depleted\./g,'[$1] đã hết lượt dùng.'],
 [/This Pokémon already has \[(.+)\] equipped!/g,'Pokémon này đã được gắn [$1]. Hãy chọn trang bị khác.'],
 [/\[(.+)\] can only be equipped to: (.+)!/g,'[$1] chỉ có thể gắn cho: $2. Hãy chọn Pokémon phù hợp.'],
 [/Saved to Slot (\d+) \(Stage (\d+)\)!/g,'Đã lưu vào hồ sơ $1 (ải $2).'],
 [/Loaded Game: Stage (\d+) \((\d+)g\)/g,'Đã tải hành trình: ải $1, $2 vàng.'],
 [/Failed to save to Slot (\d+)/g,'Không thể lưu vào hồ sơ $1. Hãy xuất bản lưu và kiểm tra dung lượng trình duyệt.'],
 [/Slot (\d+) is empty!/g,'Hồ sơ $1 chưa có bản lưu.'],
 [/Deleted Save Slot (\d+)/g,'Đã xóa hồ sơ $1.'],
 [/Skill tree reset! Refunded (\d+) points\./g,'Đã hoàn lại $1 điểm thiên phú.'],
 [/New starter unlocked: (.+)!/g,'Đã mở Pokémon khởi đầu mới: $1!'],
 [/NEW STARTER UNLOCKED: (.+)!/g,'ĐÃ MỞ POKÉMON KHỞI ĐẦU: $1!'],
 [/ACTIVE TRAITS \((\d+)\)/g,'CỘNG HƯỞNG ĐANG BẬT ($1)'],[/IN PROGRESS \((\d+)\)/g,'CỘNG HƯỞNG CHƯA ĐỦ ($1)'],
 [/TALISMANS IN BAG \((\d+)\)/g,'TALISMAN TRONG TÚI ($1)'],[/TIER (\d+)/g,'BẬC $1'],[/SELL \+(\d+)/g,'BÁN +$1'],
 [/Any Pokémon/g,'Mọi Pokémon'],[/Any Stage 3 or Legendary Pokémon/g,'Pokémon cấp tiến hóa 3 hoặc huyền thoại'],
 [/compatible Pokémon/g,'Pokémon tương thích'],[/ \(#(\d+)\) only/g,' (#$1)'],
 [/Removed (.+) from squad\./g,'Đã bỏ $1 khỏi đội.'],[/Added (.+) to Starter Squad!/g,'Đã thêm $1 vào đội khởi đầu!'],
 [/Evolution: Max Stage/g,'Tiến hóa: tối đa'],[/Evolution:/g,'Tiến hóa:'],[/Talismans/g,'Trang bị'],
 [/Attack element depends on Hex position/g,'Hệ tấn công phụ thuộc vị trí Hex'],[/ATK/g,'Công'],[/SPD/g,'Tốc độ'],
 [/Max HP/g,'HP tối đa'],[/Single use\./g,'Dùng một lần.']
];

Object.assign(PokeChessVietnameseText, {'REROLL':'LÀM MỚI','Any Pokémon':'Mọi Pokémon','SPELL':'VẬT PHẨM DÙNG','EQUIPPED':'ĐÃ TRANG BỊ'});
Object.assign(PokeChessVietnameseText, {
 'Deploy pieces to begin battle!':'Hãy đưa Pokémon ra sân trước khi bắt đầu trận.',
 'Deploy at least 1 piece to the board to begin the battle!':'Hãy đưa ít nhất một Pokémon ra sân để bắt đầu trận.',
 '⚡ Auto Battle started! AI playing...':'⚡ Đã bắt đầu chiến đấu tự động.',
 'Not enough Skill Points! Defeat stages to earn more.':'Không đủ điểm thiên phú. Hãy thắng thêm ải để nhận điểm.',
 'Must connect to an adjacent allocated node!':'Hãy học một nút liền kề trước.',
 'Click one of your pieces (on the board or bench) to apply talisman!':'Chọn Pokémon trên sân hoặc dự bị để dùng Talisman.',
 'Finish battle to recruit units!':'Hãy hoàn thành trận để tiếp tục tuyển quân.',
 'Copied Account No: 100873549564 (VietinBank)':'Đã sao chép số tài khoản: 100873549564 (VietinBank)',
 'Account No: 100873549564 (VietinBank)':'Số tài khoản: 100873549564 (VietinBank)'
});
Object.assign(PokeChessVietnameseText,{'FREE':'MIỄN PHÍ','HEX BATTLE':'CHIẾN ĐẤU HEX','YOUR TURN':'LƯỢT CỦA BẠN','ENEMY TURN':'LƯỢT ĐỐI PHƯƠNG'});
PokeChessVietnamesePatterns.push(
 [/to all Pokémon|to all units/g,'cho cả đội'],[/to Starter Pokémon|to Starter/g,'cho Pokémon khởi đầu'],[/to all elemental types/g,'cho mọi hệ'],[/to all elemental attacks/g,'cho mọi đòn hệ'],
 [/Critical Strike Chance/g,'tỷ lệ chí mạng'],[/ to (\w+) Pokémon/g,' cho Pokémon $1'],[/ & /g,' và '],
 [/\bNormal\b/gi,'Thường'],[/\bFire\b/gi,'Hỏa'],[/\bWater\b/gi,'Thủy'],[/\bGrass\b/gi,'Thảo'],[/\bElectric\b/gi,'Điện'],[/\bIce\b/gi,'Băng'],
 [/\bFighting\b/gi,'Giác đấu'],[/\bPoison\b/gi,'Độc'],[/\bGround\b/gi,'Đất'],[/\bFlying\b/gi,'Bay'],[/\bPsychic\b/gi,'Siêu linh'],[/\bBug\b/gi,'Côn trùng'],
 [/\bRock\b/gi,'Đá'],[/\bGhost\b/gi,'Ma'],[/\bDragon\b/gi,'Rồng'],[/\bSteel\b/gi,'Thép'],[/\bDark\b/gi,'Bóng tối'],[/\bFairy\b/gi,'Tiên'],
 [/REROLL \((\d+)/g,'LÀM MỚI ($1'],[/REROLL/g,'LÀM MỚI'],[/\bSPELL\b/g,'VẬT PHẨM DÙNG'],[/\bEQUIPPED\b/g,'ĐÃ TRANG BỊ'],
 [/\bBranches\b/g,'nhánh'],[/Needs (.+) to evolve/g,'Cần $1 để tiến hóa'],[/Evolution: Needs/g,'Tiến hóa: cần'],[/battles/g,'trận'],[/Item Branches/g,'nhánh vật phẩm'],
 [/(.+) cannot evolve using (.+)!/g,'$1 không thể tiến hóa bằng $2. Hãy chọn Pokémon tương thích.']
);
PokeChessVietnamesePatterns.push(
 [/Board is full \((\d+)\/(\d+) units\)\. Click a piece on the board to swap, or upgrade slot capacity!/g,'Đã đủ $1/$2 quân trên sân. Chọn Pokémon trên sân để đổi chỗ hoặc nâng sức chứa.'],
 [/\+(\d+) Skill Point! \(Total: (\d+)\)/g,'+$1 điểm thiên phú! Tổng: $2.'],
 [/(.+) evolved into (.+)!/g,'$1 đã tiến hóa thành $2!'],
 [/Sell \[(.+)\] for (\d+) Gold/g,'Bán [$1] với $2 vàng']
);
PokeChessVietnamesePatterns.push([/STAGE (\d+)/g,'ẢI $1'],[/Attack type (\d+)/g,'Hệ đánh thứ $1'],[/\(or type 1\)/g,'(hoặc hệ thứ nhất)'],[/\bCost:/g,'Giá:']);
