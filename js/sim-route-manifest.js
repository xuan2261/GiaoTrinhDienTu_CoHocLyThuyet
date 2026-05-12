/**
 * P1 58-route objective manifest.
 * Checkpoints removed (simple-lab architecture).
 */
(function() {
'use strict';

const direct = ['direct-manipulation', 'drag-handle', 'touch-handle'];

window.SIM_ROUTE_MANIFEST = {
  // Ch1 Statics (25 P1)
  'ch1-1-3': { objective: 'Nhận diện điểm đặt, phương chiều và độ lớn của véc tơ lực.', interaction: direct },
  'ch1-1-4': { objective: 'Quan sát quan hệ giữa lực, cánh tay đòn và mô men quanh điểm mốc.', interaction: direct },
  'ch1-1-5': { objective: 'Thu gọn hệ lực phẳng thành hợp lực và mô men tương đương.', interaction: direct },
  'ch1-1-6': { objective: 'Khảo sát ngẫu lực và mô men ngẫu lực khi đổi khoảng cách hai lực.', interaction: direct },
  'ch1-1-8': { objective: 'Chọn phản lực liên kết phù hợp với ràng buộc của vật.', interaction: direct },
  'ch1-2-1': { objective: 'Dựng hai lực cân bằng cùng đường tác dụng và ngược chiều.', interaction: direct },
  'ch1-2-3': { objective: 'Dựng hình bình hành lực và đọc hợp lực của hai lực đồng quy.', interaction: direct },
  'ch1-2-6': { objective: 'Dựng sơ đồ vật thể tự do sau khi giải phóng liên kết.', interaction: direct },
  'ch1-3-1': { objective: 'Xác định phản lực pháp tuyến tại liên kết tựa.', interaction: direct },
  'ch1-3-2': { objective: 'Xác định lực căng dây theo điều kiện dây chỉ chịu kéo.', interaction: direct },
  'ch1-3-3': { objective: 'Phân biệt phản lực bản lề và các thành phần phản lực tương ứng.', interaction: direct },
  'ch1-3-4': { objective: 'Dựng phản lực gối di động và gối cố định theo phương ràng buộc.', interaction: direct },
  'ch1-3-6': { objective: 'Quan sát phản lực và mô men ngàm khi tải thay đổi vị trí.', interaction: direct },
  'ch1-3-7': { objective: 'Kiểm tra điều kiện thanh hai lực cùng phương và ngược chiều.', interaction: direct },
  'ch1-4-1': { objective: 'Tổng hợp véc tơ chính của hệ lực không gian.', interaction: direct },
  'ch1-4-2': { objective: 'Tính mô men chính của hệ lực không gian quanh điểm hoặc trục.', interaction: direct },
  'ch1-4-4': { objective: 'Kiểm tra điều kiện cân bằng của hệ lực không gian.', interaction: direct },
  'ch1-5-1': { objective: 'Phân rã lực tiếp xúc thành phản lực pháp tuyến và lực ma sát.', interaction: direct },
  'ch1-5-2': { objective: 'So sánh trạng thái ma sát nghỉ, trượt và lăn.', interaction: direct },
  'ch1-5-3': { objective: 'Khảo sát nón ma sát và điều kiện trượt trên mặt nghiêng.', interaction: direct },
  'ch1-5-4': { objective: 'Kiểm tra điều kiện tự hãm của cơ cấu nêm hoặc vít.', interaction: direct },
  'ch1-6-2': { objective: 'Tính trọng tâm hình ghép bằng trung bình trọng số diện tích.', interaction: direct },
  'ch1-6-3': { objective: 'Xác định trọng tâm khi có đối xứng, phần ghép hoặc phần khoét.', interaction: direct },
  'ch1-7-1': { objective: 'Thực hành quy trình giải bài tập tĩnh học theo từng bước.', interaction: direct },
  'ch1-7-2': { objective: 'Đối chiếu kết quả số trong bài tập tĩnh học.', interaction: direct },

  // Ch2 Kinematics (15 P1)
  'ch2-1-1': { objective: 'Khảo sát quỹ đạo chất điểm cùng véc tơ vận tốc và gia tốc.', interaction: direct },
  'ch2-1-2': { objective: 'Đồng bộ chuyển động với đồ thị tọa độ, vận tốc và gia tốc.', interaction: direct },
  'ch2-1-3': { objective: 'Phân tích tọa độ tự nhiên với tiếp tuyến, pháp tuyến và bán kính cong.', interaction: direct },
  'ch2-1-4': { objective: 'So sánh các dạng chuyển động đặc biệt bằng preset motion.', interaction: direct },
  'ch2-2-2': { objective: 'Khảo sát chuyển động quay quanh trục cố định.', interaction: direct },
  'ch2-3-2': { objective: 'Quan sát truyền động bánh răng, đai và puli theo tỉ số tốc độ.', interaction: direct },
  'ch2-4-1': { objective: 'Thiết lập bài toán hợp chuyển động trong hệ quy chiếu động.', interaction: direct },
  'ch2-4-2': { objective: 'Phân biệt chuyển động tuyệt đối, tương đối và kéo theo.', interaction: direct },
  'ch2-4-3': { objective: 'Dựng tam giác vận tốc trong bài toán hợp vận tốc.', interaction: direct },
  'ch2-4-4': { objective: 'Hiển thị gia tốc Coriolis khi có quay và chuyển động tương đối.', interaction: direct },
  'ch2-5-1': { objective: 'Khảo sát chuyển động song phẳng của vật rắn.', interaction: direct },
  'ch2-5-2': { objective: 'Xác định tâm vận tốc tức thời của vật rắn phẳng.', interaction: direct },
  'ch2-5-3': { objective: 'Phân bố vận tốc của điểm thuộc vật rắn chuyển động phẳng.', interaction: direct },
  'ch2-7-1': { objective: 'Thực hành giải bài tập động học theo các bước gợi ý.', interaction: direct },
  'ch2-7-2': { objective: 'Đối chiếu kết quả số trong bài tập động học.', interaction: direct },

  // Ch3 Dynamics (18 P1)
  'ch3-1-2': { objective: 'Liên hệ lực tác dụng với chuyển động của chất điểm.', interaction: direct },
  'ch3-1-3': { objective: 'So sánh hệ quy chiếu quán tính và phi quán tính.', interaction: direct },
  'ch3-2-1': { objective: 'Minh họa định luật quán tính khi tổng lực bằng không.', interaction: direct },
  'ch3-2-2': { objective: 'Kiểm chứng định luật II Newton F = m.a.', interaction: direct },
  'ch3-2-3': { objective: 'Quan sát cặp lực tác dụng và phản tác dụng theo định luật III Newton.', interaction: direct },
  'ch3-2-5': { objective: 'Dựng dynamic FBD cho bài toán có liên kết.', interaction: direct },
  'ch3-3-1': { objective: 'Giải phương trình vi phân chuyển động của chất điểm.', interaction: direct },
  'ch3-3-2': { objective: 'Khảo sát phương trình vi phân chuyển động của cơ hệ.', interaction: direct },
  'ch3-4-1': { objective: 'Giải bài toán thuận động lực học từ lực đã biết.', interaction: direct },
  'ch3-4-2': { objective: 'Giải bài toán ngược từ chuyển động yêu cầu.', interaction: direct },
  'ch3-5-1': { objective: 'Áp dụng định lý chuyển động khối tâm.', interaction: direct },
  'ch3-5-2': { objective: 'Áp dụng định lý động lượng và xung lượng.', interaction: direct },
  'ch3-5-3': { objective: 'Khảo sát mô men động lượng và bảo toàn mô men động lượng.', interaction: direct },
  'ch3-5-4': { objective: 'Kiểm chứng định lý động năng trong chuyển động có lực tác dụng.', interaction: direct },
  'ch3-6-2': { objective: 'Mô phỏng va chạm với hệ số phục hồi e.', interaction: direct },
  'ch3-6-3': { objective: 'Giải bài toán va chạm đàn hồi, mềm hoặc xiên.', interaction: direct },
  'ch3-7-1': { objective: 'Chọn định lý động lực học phù hợp cho bài tập.', interaction: direct },
  'ch3-7-2': { objective: 'Đối chiếu kết quả số trong bài tập động lực học.', interaction: direct },
};

})();
