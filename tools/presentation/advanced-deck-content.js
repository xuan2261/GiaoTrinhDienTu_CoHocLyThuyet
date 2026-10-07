'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const candidate = json('data/release-candidate.json');
const summary = json(candidate.summaryPath);
const acceptance = json('data/acceptance-report.json');
const sim2 = require('../../js/sim2/sim2-route-manifest');
const sim3 = require('../../js/sim3/sim3-route-manifest');
const pilotIds = new Set(sim3.map(r => r.id));
const gifCount = json(path.posix.join(path.posix.dirname(candidate.summaryPath), summary.manifest.path)).files.filter(f => /\.gif$/i.test(f.path)).length;
const signoffs = json('data/academic_signoffs.json').records.length;
const pagesBytes = fs.statSync(path.join(root, 'js/pages.js')).size;
const ledgerBytes = fs.statSync(path.join(root, 'data/academic_review_ledger.json')).size;
const A = 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets';
const currentA = 'assets/designs/bao-cao-hoi-dong-nang-cao-33-slides/assets';
const currentCaption = 'Giao diện đang chạy — ảnh chụp ngày 05/10/2026.';
const simulationNames = {
  'ch1-1-3':'Véc tơ lực: điểm đặt, phương và độ lớn',
  'ch1-1-4':'Mô men lực và cánh tay đòn',
  'ch1-1-5':'Thu gọn hệ lực phẳng: lực tổng hợp và mô men',
  'ch1-1-6':'Ngẫu lực và mô men ngẫu lực',
  'ch1-2-3':'Hình bình hành của hai lực đồng quy',
  'ch1-1-8':'Phản lực liên kết và sơ đồ lực tác dụng',
  'ch1-3-2':'Lực căng dây và ràng buộc một chiều',
  'ch1-3-6':'Phản lực và mô men tại ngàm',
  'ch1-5-3':'Nón ma sát trên mặt nghiêng',
  'ch1-6-3':'Trọng tâm hình ghép và hình khoét',
  'ch2-1-1':'Quỹ đạo, vận tốc và gia tốc chất điểm',
  'ch2-1-3':'Phương tiếp tuyến, pháp tuyến và bán kính cong',
  'ch2-2-2':'Quay quanh trục: vận tốc và gia tốc góc',
  'ch2-3-2':'Truyền động bánh răng, đai và puli',
  'ch2-4-4':'Hợp chuyển động và gia tốc Coriolis',
  'ch2-5-2':'Tâm vận tốc tức thời',
  'ch2-5-3':'Phân bố vận tốc trên vật rắn',
  'ch3-2-2':'Định luật hai Newton: lực, khối lượng và gia tốc',
  'ch3-2-3':'Định luật ba Newton: lực và phản lực',
  'ch3-1-3':'Hệ quy chiếu quán tính và phi quán tính',
  'ch3-3-1':'Giải phương trình chuyển động bằng phương pháp số',
  'ch3-5-2':'Định lý động lượng và xung lượng',
  'ch3-5-3':'Bảo toàn mô men động lượng',
  'ch3-5-4':'Định lý động năng: công và năng lượng',
  'ch3-6-2':'Va chạm và hệ số phục hồi'
};
const meta = {
  title: 'Giáo trình điện tử Cơ học lý thuyết',
  subtitle: 'Kiến trúc · Chất lượng · Tác động',
  authors: ['Tiến sĩ Nguyễn Lê Văn — Chủ biên', 'Thạc sĩ Đinh Văn Tứ — Biên soạn', 'Thạc sĩ Bùi Thanh Xuân — Biên soạn'],
  institution: 'Học viện Hải quân', date: '05/10/2026',
  repository: 'https://github.com/xuan2261/GiaoTrinhDienTu_CoHocLyThuyet',
  onlineUrl: 'https://xuan2261.github.io/GiaoTrinhDienTu_CoHocLyThuyet/',
  editorialNotes: [
    'Bộ báo cáo gồm 1 trang mã truy cập mở đầu và 33 chủ đề theo tài liệu. Hai trang dự phòng nằm ở trang 33–34.',
    'Không sử dụng tỷ lệ minh họa 73%, điểm 8,2/10 hay tuyên bố tám nhóm kiểm tra đều đạt như kết quả đã đo.',
    `Kết quả kiểm tra chất lượng được trích từ sổ ngày ${acceptance.generatedAt.slice(0,10)}: ${acceptance.gateSummary.pass} đạt, ${acceptance.gateSummary.fail} chưa đạt, ${acceptance.gateSummary.blocked} chưa thể đánh giá; không phải lần kiểm tra sản phẩm mới.`,
    '10 bản mô phỏng không gian bổ sung cho 25 vị trí mô phỏng phẳng, không phải 35 bài độc lập. Nguồn mô phỏng hiện tại còn chờ thẩm định lại.',
    'Các mốc lộ trình, chỉ số đánh giá, lợi ích và xác suất rủi ro là đề xuất, không phải cam kết được phê duyệt hoặc kết quả nghiên cứu người học.',
    'Dùng phông Arial để tránh thay phông trên máy trình chiếu. Không dựng biểu trưng giả khi chưa có biểu trưng chính thức.',
    'Ảnh giao diện hiện tại chụp ngày 05/10/2026 chỉ minh họa giao diện đang chạy; không thay đổi kết quả kiểm tra lịch sử hoặc tình trạng nghiệm thu.'
  ]
};
const slides = [];
function add(section, title, subtitle, layout, content, takeaway, sources, notes) {
  slides.push({id:slides.length+1,section,title,subtitle,layout,...content,takeaway,sources,notes});
}
const card = (title, body, color) => ({title,body,...(color ? {color}: {})});
const qa = `Sổ ${acceptance.generatedAt.slice(0,10)}: ${acceptance.gateSummary.pass} đạt / ${acceptance.gateSummary.fail} chưa đạt / ${acceptance.gateSummary.blocked} chưa thể đánh giá.`;
add('Truy cập trực tuyến','Trải nghiệm giáo trình trực tuyến','Quét mã truy cập bằng điện thoại để mở giáo trình.','qr',{
  url:meta.onlineUrl,image:`${A}/qr-code-online-textbook.png`
},'Kết nối mạng để truy cập trực tuyến; giữ bản ngoại tuyến khi cần.', [meta.onlineUrl,`${A}/qr-code-online-textbook.png`],[
  `Kính mời hội đồng quét mã truy cập để mở giáo trình trực tuyến tại ${meta.onlineUrl}`,
  'Có thể dùng máy ảnh điện thoại hoặc ứng dụng quét mã. Trang mã truy cập được đặt trước phần báo cáo để người nghe truy cập học liệu trong lúc theo dõi.'
]);
add('Mở đầu','GIÁO TRÌNH ĐIỆN TỬ\nCƠ HỌC LÝ THUYẾT',meta.subtitle,'cover',{},
  'Báo cáo hiện trạng, bằng chứng và lộ trình hoàn thiện — không thay quyết định nghiệm thu.',
  ['NghienCuuLamSlideMoi.txt','data/acceptance-report.json','chapters/tac-gia.html'],[
    'Kính thưa hội đồng, báo cáo này đánh giá giáo trình điện tử Cơ học lý thuyết phục vụ đào tạo tại Học viện Hải quân. Nội dung tập trung vào kiến trúc triển khai, chất lượng có bằng chứng và giá trị giáo dục cần tiếp tục kiểm chứng.',
    'Sản phẩm có hiện vật kỹ thuật và quy trình kiểm tra, nhưng chưa được đồng nhất với chấp nhận học thuật. Số liệu gắn với nguồn cụ thể; kế hoạch được phân biệt với kết quả đã đạt.'
]);
add('Mở đầu','Tóm tắt điều hành','Bốn con số phạm vi; ba kết luận để hội đồng ra quyết định.','metrics',{
  metrics:[{value:String(summary.staging.fileCount),label:'tệp trong gói',detail:'Gói đề nghị 02/09/2026'},{value:String(sim2.length),label:'vị trí mô phỏng phẳng',detail:'Lớp biểu diễn cơ sở'},{value:String(sim3.length),label:'bản mô phỏng không gian',detail:'Bổ sung trên cùng bài'},{value:'8',label:'nhóm kiểm tra chất lượng',detail:'24 điều kiện thực tế'}],
  cards:[card('Kỹ thuật','Có hiện vật ngoại tuyến.'),card('Học thuật','Chưa đủ ký duyệt.','red'),card('Chuyển giao','Có hướng tái sử dụng.','green')]
},'Phạm vi không phải chất lượng; chạy được không đồng nghĩa đã được nghiệm thu.',
['release/2026.09.02-candidate/release-summary.json','js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/acceptance-report.json'],[
  `Bốn con số gồm ${summary.staging.fileCount} tệp trong gói đề nghị phát hành, ${sim2.length} vị trí mô phỏng phẳng, ${sim3.length} bản không gian bổ sung và tám nhóm kiểm tra. Tám nhóm không phải tám điều kiện đã đạt: ${qa}`,
  'Có cơ sở kỹ thuật cho triển khai ngoại tuyến, chưa đủ chấp nhận học thuật chính thức và có khả năng tái sử dụng quy trình cho môn khác. Chuyển giao vẫn cần thí điểm; không suy ra hiệu quả học tập hoặc chi phí bằng không.'
]);
add('Mở đầu','Lộ trình báo cáo — 25 phút','1 trang mã truy cập · 30 trang nội dung · 1 trang hỏi–đáp · 2 trang dự phòng.','table',{
  headers:['Phần','Trọng tâm','Thời lượng'],rows:[['1','Phương pháp luận đánh giá','3 phút'],['2','Tổng quan dự án','3 phút'],['3','Kiến trúc và tính năng','8 phút'],['4','Chất lượng và bằng chứng','5 phút'],['5','So sánh và đánh giá','4 phút'],['6','Tác động và khuyến nghị','2 phút']]
},'Dành thêm 5–10 phút cho hỏi–đáp; phụ lục chỉ mở khi cần đào sâu.', ['NghienCuuLamSlideMoi.txt'],[
  'Báo cáo chính gồm sáu khối với tổng thời gian mục tiêu 25 phút. Mở đầu và kết luận được lồng vào các khối thay vì cộng thêm thời gian.',
  'Trang mã truy cập mở đầu là trang 1. Sau trang 31 là trang hỏi–đáp. Trang 33 và 34 là dự phòng về vòng đời tải bài và danh mục đầy đủ mô phỏng.'
]);
add('Mở đầu','Vì sao ngoại tuyến là quan trọng?','Thiết kế cho điều kiện kết nối bị hạn chế, không dựa vào tỷ lệ khảo sát giả định.','cards',{
  cards:[card('Điều kiện triển khai','Không mặc định mạng luôn sẵn sàng.'),card('Hướng giải quyết','Phân phối tài nguyên cục bộ; mở trang đầu.'),card('Giới hạn dữ liệu','Chưa có khảo sát thiết bị của đơn vị.','red')]
},'Ưu tiên dùng không mạng là lựa chọn theo bối cảnh; phải thử trên thiết bị thực.', ['README.md','docs/deployment-guide.md','NghienCuuLamSlideMoi.txt'],[
  'Bài học không nên phụ thuộc dịch vụ từ xa ở mỗi phiên học. Tài nguyên cục bộ hướng tới điều kiện này; gói có thể phân phối qua thiết bị lưu trữ di động hoặc máy chủ chỉ cung cấp tệp. Trang đầu là index.html.',
  'Tỷ lệ 73% trong tài liệu chỉ là minh họa, không phải bằng chứng về đơn vị. Chưa có căn cứ khẳng định 100% tính năng vượt qua thử nghiệm trên mọi thiết bị. Cần khảo sát và chạy thử độc lập trước khi mở rộng.'
]);
add('Phương pháp luận','Phương pháp đánh giá','Bốn bước phân biệt thiết kế, thực thi, bằng chứng và chuẩn đối chiếu.','steps',{
  steps:[{title:'Phân tích tĩnh',body:'Đọc mã nguồn và tài liệu hướng dẫn.'},{title:'Thử vận hành',body:'Thử mở tệp, qua mạng và trên máy đích.'},{title:'Đối chiếu bằng chứng',body:'Gắn ảnh chụp, dấu kiểm tra tệp và phiên bản.'},{title:'So sánh chuẩn',body:'Đối chiếu tiếp cận và trao đổi học liệu.'}]
},'Chỉ kết luận trong phạm vi đã kiểm tra và đúng phiên bản nguồn.', ['README.md','data/evidence-registry.json','data/acceptance-report.json','data/simulation-current-revalidation.json'],[
  'Đọc mã và tài liệu để xác định thiết kế, quan sát trong điều kiện thực tế, rồi kiểm đầu ra, dấu thời gian và dấu kiểm tra tệp để tránh dùng ảnh cũ chứng minh mã mới.',
  'Chuẩn tiếp cận nội dung số, trao đổi câu hỏi và trao đổi gói học liệu là khung đối chiếu, không phải chứng nhận tự động. Báo cáo sử dụng hồ sơ đã lưu; việc xuất bộ trình chiếu không phải chạy lại toàn bộ kiểm tra chất lượng. Nguồn mô phỏng mới còn chờ kiểm lại.'
]);
add('Phương pháp luận','Sáu tiêu chí đánh giá','Dùng bằng chứng và trạng thái thay cho điểm số chưa được thẩm định.','table',{
  headers:['Tiêu chí','Bằng chứng hoặc trạng thái'],rows:[['Kiến trúc','Có phân lớp và tài nguyên cục bộ'],['Tính năng','Có tìm kiếm, câu hỏi và mô phỏng'],['Chất lượng',`${acceptance.gateSummary.pass} đạt; ${acceptance.gateSummary.fail} chưa đạt; ${acceptance.gateSummary.blocked} chưa thể đánh giá`],['Khả năng tiếp cận','Có kiểm tự động; chưa thể đánh giá độc lập'],['Sẵn sàng phát hành','Gói đề nghị; chưa chấp nhận cuối cùng'],['Chuyển giao','Đề xuất thí điểm môn khác']]
},'Không dùng 8,2/10 làm kết luận khi chưa có tiêu chí chấm và người đánh giá.', ['data/acceptance-report.json','data/presentation-specification.json','docs/system-architecture.md'],[
  'Sáu tiêu chí giữ nguyên ý định đánh giá: kiến trúc, tính năng, chất lượng, tiếp cận, phát hành và chuyển giao. Mỗi tiêu chí nối với hiện vật hoặc trạng thái kiểm tra, không thay bằng điểm số chưa có quy trình chấm.',
  'Các điểm 8, 9, 10 và tổng 8,2 trong đề xuất chưa phải kết quả khảo sát hoặc đánh giá độc lập. Không chấm chất lượng tuyệt đối khi sổ còn chưa đạt và chưa thể đánh giá. Hội đồng có thể phê duyệt tiêu chí chấm và tổ chức đánh giá riêng.'
]);
add('Phương pháp luận','Nguồn dữ liệu và bằng chứng','Tám tuyến tra cứu, mỗi tuyến có chức năng riêng.','table',{
  headers:['Nguồn','Vai trò'],rows:[['Tài liệu hướng dẫn','Phạm vi và cách vận hành'],['Hồ sơ kỹ thuật','Kiến trúc, triển khai và giới hạn'],['Hồ sơ phát hành','Gói đề nghị và dấu kiểm tra tệp'],['Danh mục bằng chứng','Các hiện vật kiểm chứng'],['Dữ liệu quản lý','Danh mục, sổ thẩm định và trạng thái'],['Định nghĩa phép kiểm','Hành vi cần kiểm tra'],['Công cụ tạo học liệu','Quy trình tạo và kiểm đầu ra'],['Lịch sử mã nguồn','Phiên bản và thay đổi']]
},'Định nghĩa một phép kiểm tra không chứng minh phép kiểm tra đó đã đạt.', ['README.md','data/evidence-registry.json','data/acceptance-report.json'],[
  'Mã nguồn chỉ ra cơ chế; danh mục chỉ ra phạm vi; hồ sơ thực thi cho biết kết quả trên một phiên bản và môi trường cụ thể. Nguồn tra cứu gồm README.md, docs/, release/, data/evidence-registry.json, data/, tests/ và tools/.',
  'Lịch sử mã nguồn không tự chứng minh chất lượng. Phải kiểm kết quả, dấu kiểm tra tệp và liên kết với gói được báo cáo. Ảnh ngày 05/10/2026 minh họa giao diện đang chạy, không chứng minh toàn bộ chất lượng hoặc thay kết quả lịch sử.'
]);
add('Tổng quan','Tổng quan dự án','Một giáo trình tĩnh cho ba chương Cơ học lý thuyết.','image',{
  image:`${currentA}/current-home.png`,caption:currentCaption,
  cards:[card('Nội dung','Tĩnh học · Động học · Động lực học.'),card('Cách triển khai','Trang đọc và thư viện được đóng gói cục bộ.'),card('Nguồn chuẩn','Tài liệu biên soạn và dữ liệu đã chọn lọc.')]
},'Đọc học liệu không cần dịch vụ xử lý máy chủ; bảo trì vẫn cần đầu mối kỹ thuật.', ['README.md','CoHocLyThuyet_Full_New.docx','data/presentation-specification.json'],[
  'Sản phẩm là giáo trình tĩnh với ba chương. Nguồn văn bản chuẩn là CoHocLyThuyet_Full_New.docx; bảng tra cứu và dữ liệu kiểm tra được quản lý riêng dưới data. Khi đọc gói phát hành, người học không cần công cụ cài đặt dành cho lập trình viên hay dịch vụ xử lý riêng trên máy chủ.',
  'Ảnh trang đầu chụp giao diện đang chạy ngày 05/10/2026. Tài nguyên ngoại tuyến, tạo nội dung, mô phỏng và truy vết là các đặc điểm thiết kế. Thư viện hiển thị công thức, mô phỏng và tài liệu được đóng gói cục bộ; sửa tài liệu biên soạn vẫn cần kỹ thuật tái tạo và kiểm đầu ra.'
]);
add('Tổng quan','Phạm vi: giáo trình, không phải hệ thống quản lý học tập','Ranh giới rõ về tài khoản, sổ điểm và đồng bộ.','table',{
  headers:['Trong phạm vi hiện vật','Ngoài phạm vi hiện tại'],rows:[['Đọc học liệu và tìm kiếm cục bộ','Tài khoản và đồng bộ qua máy chủ'],['Câu hỏi, tiến độ, ghi chú cá nhân','Sổ điểm có danh tính trên máy chủ'],['25 vị trí phẳng; 10 bản không gian','Mô phỏng không gian cho mọi vị trí'],['Trình đọc tài liệu nội tuyến','Tìm kiếm và chú thích trong tài liệu'],['Quy trình kiểm và sổ thẩm định','Nghiệm thu học thuật mặc định'],['Gói trao đổi học liệu thử nghiệm','Theo dõi hoạt động học theo chuẩn đầy đủ']]
},'Gói nén không phải hệ thống quản lý học tập; dữ liệu tự học không phải sổ điểm chính thức.', ['README.md','data/presentation-specification.json','data/lms-targets.json'],[
  'Giáo trình hỗ trợ tự học nhưng chưa có danh tính người học hoặc đồng bộ tập trung. Cần phân biệt với hệ thống quản lý học tập có tài khoản, sổ điểm và quản trị đào tạo.',
  'Có bản dẫn xuất trao đổi câu hỏi phiên bản 3 và gói học liệu chung phiên bản 1.4 ở mức thí điểm. Chưa triển khai đầy đủ các chuẩn theo dõi hoạt động học, chưa chứng minh liên thông trên hệ thống quản lý học tập thật. Giữ giới hạn này trong bàn giao.'
]);
add('Tổng quan','Kiến trúc năm lớp','Phân tách giao diện, tải bài, tương tác, nội dung và dữ liệu.','table',{
  headers:['Lớp','Thành phần','Trách nhiệm'],rows:[['Giao diện','Trang đầu, kiểu trình bày, điều hướng','Hiển thị và lựa chọn cách đọc'],['Tải bài','Bộ tải và tập nội dung cục bộ','Tìm bài, nạp nội dung, mở tương tác'],['Tương tác','Mô phỏng, tài liệu, câu hỏi','Thao tác và giải phóng tài nguyên'],['Học liệu','Chương, hình và ảnh động','Nội dung học và minh họa'],['Dữ liệu','Danh mục và hồ sơ bằng chứng','Cấu trúc, truy vết và thẩm định']]
},'Phân lớp giúp xác định nơi sửa và kiểm; thay bộ mô phỏng vẫn có thể gây tác động.', ['docs/system-architecture.md','js/loader.js','README.md'],[
  'Năm lớp là cách trình bày trách nhiệm: giao diện, tải bài, tương tác, học liệu và dữ liệu. Thành phần nguồn gồm index.html, css/, app.js, loader.js, pages.js, chapters/, images/ và data/.',
  'Các lớp vẫn có quy ước liên kết. Thay bộ mô phỏng hoặc cấu trúc dữ liệu có thể ảnh hưởng bộ tải và nội dung. Phải kiểm khởi tạo, giải phóng tài nguyên, điều hướng và dữ liệu; không tuyên bố thay độc lập tuyệt đối.'
]);
add('Kiến trúc và tính năng','Ưu tiên dùng không mạng: cơ chế và bằng chứng','Tài nguyên cục bộ; kết luận gắn với máy và gói đã thử.','image',{
  image:`${currentA}/current-search.png`,caption:currentCaption,
  cards:[card('Không cần xử lý máy chủ','Đọc và tìm học liệu trong gói cục bộ.'),card('Thư viện cục bộ','Không bắt buộc tải thư viện từ mạng.'),card('Cần kiểm máy đích','Mở tệp, thiết bị lưu trữ, mạng và dự phòng.','red')]
},'Ngoại tuyến là đặc tính thiết kế; 100% tính năng cần bộ bằng chứng đầy đủ.', ['README.md','release/2026.09.02-candidate/technical-smoke.md','data/acceptance-report.json'],[
  'Gói độc lập có nội dung và thư viện cục bộ; có thể mở tệp hoặc qua máy chủ cung cấp tệp. Ảnh tìm kiếm ngày 05/10/2026 minh họa giao diện trực tuyến đang chạy, không chứng minh ngoại tuyến đã đạt. Hồ sơ release/2026.09.02-candidate/technical-smoke.md có giới hạn theo thời điểm và gói.',
  'Không cam kết mọi tính năng chạy trên mọi trình duyệt. Cần kiểm đường dẫn, bộ nhớ trình duyệt, trình đọc tài liệu, mô phỏng và phương án dự phòng trên máy trình chiếu. Điều kiện chạy thử độc lập vẫn chưa thể đánh giá trong hồ sơ.'
]);
add('Kiến trúc và tính năng','Mô phỏng phẳng và không gian: chiến lược hai tầng','10 bản không gian tăng cường trải nghiệm trên những vị trí phẳng đã có.','image',{
  image:`${currentA}/current-simulation-space.png`,caption:currentCaption,
  cards:[card('25 vị trí phẳng','Lớp cơ sở; không cần đồ họa không gian.'),card('10 bản không gian','Tùy chọn thí điểm trên cùng bài, không phải 35 bài.'),card('Dự phòng và giới hạn','Thiếu hỗ trợ thì về bản phẳng; nguồn mới cần kiểm lại.','red')]
},'Không cộng 25 + 10 thành 35 bài; bước thời gian 1/60 giây không phải tốc độ khung hình đã đo.', ['js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/simulation-current-revalidation.json','README.md'],[
  '25 vị trí có lớp mô phỏng phẳng bằng hình véc tơ; mười vị trí có tùy chọn không gian cần hỗ trợ đồ họa của trình duyệt. Hai cách biểu diễn cùng chủ đề không phải 35 bài. Khi bản không gian lỗi, thiết kế giữ hoặc chuyển về bản phẳng. Ảnh không gian ngày 05/10/2026 minh họa giao diện đang chạy, không hoàn tất thẩm định độc lập.',
  'Tài liệu hướng dẫn mô tả bước thời gian cố định 1/60 giây và chỉ vẽ lại khi cần. Đây là thiết kế, không phải kết quả đo 60 khung hình mỗi giây. Nguồn mô phỏng gần đây có thay đổi và còn chờ kiểm lại; ảnh và kết quả đạt lịch sử không xác nhận mã mới.'
]);
add('Kiến trúc và tính năng','Sáu tính năng học tập tương tác','Hỗ trợ tự học; không đồng nhất với quản lý đào tạo có danh tính.','image',{
  image:`${currentA}/current-quiz.png`,caption:currentCaption,
  cards:[card('Tìm kiếm · Thuật ngữ','Tìm có dấu/không dấu; tra nghĩa ngay trong bài.'),card('Câu hỏi · Tiến độ','Chọn chương, trộn câu, lưu lượt làm; theo dõi đọc.'),card('Đánh dấu · Ghi chú','Lưu bài cần xem lại và ghi chú trên trình duyệt.')]
},'Dữ liệu thuộc trình duyệt; có thể mất hoặc không đi theo thiết bị lưu trữ di động.', ['README.md','js/quiz-state.js','js/progress.js','js/notes.js','js/glossary.js'],[
  'Sáu tính năng gồm tìm kiếm, câu hỏi tự kiểm tra, tiến độ, đánh dấu bài, ghi chú và tra thuật ngữ. Tìm kiếm dùng chỉ mục cục bộ; câu hỏi có chọn phạm vi, trộn câu và khôi phục lượt làm. Ảnh ngày 05/10/2026 cho thấy câu hỏi và phản hồi ngay sau khi chọn câu trả lời đúng; không chứng minh tất cả thao tác đã đạt kiểm tra.',
  'Điểm câu hỏi và lượt đọc chưa chứng minh đạt chuẩn đầu ra. Bộ nhớ trình duyệt không tự đồng bộ giữa máy, có thể mất khi xóa dữ liệu hoặc đổi hồ sơ trình duyệt. Cần hướng dẫn lưu giữ và chuyển dữ liệu cá nhân.'
]);
add('Kiến trúc và tính năng','Tài liệu nội tuyến: giữ ngữ cảnh học','Cửa sổ đọc chuyên dụng thay vì chuyển người học ra khỏi bài.','image',{
  image:`${currentA}/current-pdf.png`,caption:currentCaption,
  cards:[card('Ngữ cảnh','Thiết kế giữ bài và vị trí điều hướng.'),card('Thao tác','Chuyển trang, phóng to, tải và đóng.'),card('Giới hạn','Chưa tìm kiếm, ảnh thu nhỏ hay chú thích.','red')]
},'Mở tài liệu cần kiểm cả hiển thị lẫn trạng thái khi đóng cửa sổ.', ['README.md','js/pdf-viewer.js','data/acceptance-report.json'],[
  'Trình đọc tài liệu mở nội tuyến, nạp tài nguyên khi cần. Thiết kế cho phép chuyển hoặc nhập trang, phóng to, tải xuống, đóng bằng phím thoát hoặc nút quay lại của trình duyệt trong khi giữ ngữ cảnh bài.',
  `Ảnh chụp giao diện đang chạy ngày 05/10/2026, không phải lần kiểm thử đầy đủ. Điều kiện phát hành trình đọc tài liệu chưa đạt trong sổ ngày ${acceptance.generatedAt.slice(0,10)}. Không nâng thao tác thiết kế thành cam kết đã đạt; tìm kiếm, ảnh thu nhỏ và chú thích chưa nằm trong hiện vật.`
]);
add('Kiến trúc và tính năng','Ảnh động với phương án dự phòng','Dùng ảnh động khi phù hợp, giữ ảnh tĩnh khi cần.','steps',{
  steps:[{title:`${gifCount} ảnh động`,body:'Danh mục kiểm soát tài nguyên.'},{title:'Ảnh tĩnh cơ sở',body:'Giữ hình để đọc và đối chiếu.'},{title:'Giảm chuyển động',body:'Ưu tiên ảnh tĩnh theo lựa chọn hệ điều hành.'},{title:'Khi ảnh động lỗi',body:'Có cơ chế chuyển về ảnh tĩnh.'}]
},'Có phương án dự phòng không đồng nghĩa mọi ảnh đã qua kiểm tra phát hành.', ['js/gif-figures.js','README.md','data/acceptance-report.json'],[
  `Danh mục quản lý ${gifCount} ảnh động cho các hình cơ học. Nút ảnh động đổi giữa ảnh động và ảnh tĩnh; lựa chọn giảm chuyển động của hệ điều hành định hướng dùng ảnh tĩnh. Dự phòng nhằm tránh mất hình minh họa khi ảnh động lỗi.`,
  `Đây là thiết kế và số lượng trong gói. Điều kiện phát hành ảnh động chưa đạt trong sổ ngày ${acceptance.generatedAt.slice(0,10)}. Cần kiểm lại tài nguyên, tình huống lỗi và thao tác trên bản đích. Không nhầm ảnh động với phim hoặc học liệu âm thanh.`
]);
add('Kiến trúc và tính năng','Khả năng tiếp cận: nói đúng giới hạn','Kiểm tự động là một phần; đánh giá thủ công độc lập là phần riêng.','image',{
  image:`${currentA}/current-mobile.png`,caption:currentCaption,
  cards:[card('Cơ chế hỗ trợ','Vùng đọc rõ, bàn phím, điểm chọn và giảm chuyển động.'),card('Kiểm tự động','Có kiểm tương phản và sắp xếp lại nội dung.'),card('Giới hạn kết luận','Chưa thể đánh giá thủ công độc lập; chưa chứng nhận.','red')]
},'Ảnh trên điện thoại không thay đánh giá tiếp cận thủ công hoặc xác nhận đạt chuẩn.', ['data/accessibility-baseline.json','data/acceptance-report.json','data/presentation-specification.json'],[
  'Các cơ chế tiếp cận và phép kiểm tự động chỉ phát hiện một phần vấn đề. Chúng không đánh giá hết ngữ nghĩa công thức, thao tác mô phỏng hoặc trải nghiệm trình đọc màn hình. Ảnh giao diện trên điện thoại ngày 05/10/2026 chỉ minh họa cách trình bày.',
  `Trong hồ sơ ngày ${acceptance.generatedAt.slice(0,10)}, điều kiện tiếp cận chưa đạt và đánh giá độc lập chưa thể thực hiện. Không tuyên bố chứng nhận tiêu chuẩn tiếp cận nội dung số phiên bản 2.2 mức hai. Cần đối chiếu từng tiêu chí, kiểm thủ công và lưu bằng chứng đúng bản nguồn.`
]);
add('Chất lượng và bằng chứng','Kiểm tra chất lượng: tám nhóm, 24 điều kiện','Khung nhóm để trình bày; không phải bảng tám nhóm đã đạt.','table',{
  headers:['Nhóm','Nội dung cần kiểm'],rows:[['Nội dung','Danh mục học liệu và đầu ra'],['Học thuật','Thẩm định và ký duyệt'],['Mô phỏng','Tính đúng và vận hành bản phát hành'],['Tiếp cận','Thao tác và khả năng đọc'],['Học liệu đa phương tiện','Phạm vi thí điểm và tài nguyên'],['Liên thông học tập','Trao đổi với hệ thống quản lý học tập'],['Tài liệu','Trình đọc trên bản phát hành'],['Phát hành','Gói bàn giao và điều kiện chấp nhận']]
},`${qa} Ba lần kiểm ổn định vẫn cần bằng chứng.`, ['package.json','data/qa-gates.json','data/acceptance-report.json'],[
  'Tám nhóm giúp hội đồng hiểu các loại rủi ro. Sổ kiểm tra chất lượng có 24 điều kiện. Không thay trạng thái bằng cách gộp tám hàng hoặc sửa lời thuyết minh. Các lệnh thực hiện được lưu trong package.json và điều kiện trong data/qa-gates.json.',
  `${qa} Kiểm ổn định ba lượt liên tiếp và kiểm lại nguồn mới cần bằng chứng. Chấp nhận cuối phải qua học thuật, tiếp cận và chạy thử độc lập; xuất được gói nén không chứng minh đạt các điều kiện này.`
]);
add('Chất lượng và bằng chứng','Thẩm định học thuật: chuỗi truy vết','Yêu cầu → mục tiêu học tập → học liệu → kiểm chứng → ký duyệt.','steps',{
  steps:[{title:'Yêu cầu',body:'Nguồn quy cách và căn cứ đào tạo.'},{title:'Mục tiêu học tập',body:'Có trạng thái thẩm định.'},{title:'Hiện vật',body:'Nội dung, câu hỏi và mô phỏng.'},{title:'Thẩm định và ký duyệt',body:'Người có thẩm quyền xác nhận.'}]
},`Sổ thẩm định ${ledgerBytes.toLocaleString('vi-VN')} byte; ${signoffs} bản ký — dữ liệu không thay phê duyệt.`, ['data/academic_review_ledger.json','data/academic_signoffs.json','data/learning-outcomes.json','data/acceptance-report.json'],[
  'Chuỗi truy vết nối căn cứ đào tạo và mục tiêu với nội dung, câu hỏi, mô phỏng và bằng chứng. Sổ ghi nội dung cần thẩm định và tình trạng; kích thước tệp không phản ánh chất lượng học thuật.',
  `Sổ data/academic_review_ledger.json có ${ledgerBytes} byte, data/academic_signoffs.json có ${signoffs} bản ghi. Điều kiện học thuật vẫn chưa thể đánh giá. Cần thẩm định độc lập, đúng thẩm quyền và phiên bản; dữ liệu mô tả mục tiêu không chứng minh người học đã đạt chuẩn đầu ra.`
]);
add('Chất lượng và bằng chứng','Phát hành: tái tạo và xác minh','Gói đề nghị lịch sử khác với mã nguồn đang thay đổi.','cards',{
  cards:[card('Gói ngày 02/09/2026',`${summary.staging.fileCount} tệp; gói nén 78,74 triệu byte.`),card('Dấu kiểm tra tệp','Đã đối chiếu gói nén với hồ sơ.','green'),card('Chưa chấp nhận cuối','Còn chưa đạt và chưa thể thẩm định.','red')]
},'Dấu kiểm tra xác nhận đúng tệp, không xác nhận học thuật hoặc mã mới đã đạt.', ['data/release-candidate.json','release/2026.09.02-candidate/release-summary.json','data/acceptance-report.json'],[
  `Mã gói trong hồ sơ: ${candidate.releaseVersion}; gói nén ${summary.package.sizeBytes} byte. Dấu kiểm tra đầy đủ: ${candidate.packageSha256}. Dấu kiểm tra đã được tính trực tiếp khi chuẩn bị báo cáo và khớp hồ sơ gói đề nghị.`,
  'Đối chiếu dấu kiểm tra chỉ xác nhận tệp đúng hồ sơ. Tái tạo cùng nội dung tệp cần điều kiện tạo gói cố định; phiên này không thay bằng chứng tái tạo lịch sử. Gói đề nghị chưa phải chấp nhận cuối; mã hiện tại đã thay đổi và cần kiểm riêng.'
]);
add('Chất lượng và bằng chứng','Tuyên bố nào, bằng chứng đó','Không dùng đường dẫn giả hoặc số đếm suy diễn.','table',{
  headers:['Tuyên bố','Nguồn kiểm chứng'],rows:[['372 tệp gói đề nghị','Số tệp trong báo cáo đóng gói'],['Dấu kiểm tra gói nén khớp','Đối chiếu tệp với hồ sơ phát hành'],['25 vị trí mô phỏng phẳng','Danh mục mô phỏng phẳng'],['10 bản không gian bổ sung','Danh mục mô phỏng không gian'],['24 điều kiện: 11 đạt, 9 chưa đạt, 4 chưa thể đánh giá','Sổ kết quả kiểm tra lịch sử'],['Nguồn mới chưa xác minh','Hồ sơ chờ kiểm lại mô phỏng'],['Ký duyệt học thuật','Sổ ký duyệt và điều kiện thẩm định']]
},'Lưu đường dẫn và dấu kiểm tra trong ghi chú để hội đồng truy lại.', ['release/2026.09.02-candidate/release-summary.json','data/release-candidate.json','js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/acceptance-report.json','data/simulation-current-revalidation.json'],[
  'Bản đồ kiểm chứng các con số chính: số tệp lấy từ báo cáo đóng gói, không đếm thư mục có nhiều bản gói. Danh mục mô phỏng là js/sim2/sim2-route-manifest.js và js/sim3/sim3-route-manifest.js; không suy từ tên tệp không có thật.',
  `Dấu kiểm tra gói là ${candidate.packageSha256}. Kết quả chất lượng gắn với thời điểm ${acceptance.generatedAt}. Khi dữ liệu cập nhật, dựng lại báo cáo từ nguồn, không sửa riêng số trên trang. Không dùng dấu kiểm tra hoặc ảnh gói cũ để kết luận vấn đề của nguồn mới đã được khắc phục.`
]);
add('So sánh và đánh giá','So sánh theo điều kiện triển khai','Giải pháp phục vụ mục đích khác nhau; không có lựa chọn tốt nhất tuyệt đối.','table',{
  headers:['Tiêu chí','Giáo trình này','Hệ thống quản lý học tập','Lớp học trực tuyến','Bản giấy'],rows:[['Ngoại tuyến','Gói cục bộ','Ứng dụng có điều kiện','Tệp tải trước','Có'],['Hạ tầng','Máy đọc','Trang mạng và máy chủ','Dịch vụ trực tuyến','In, lưu trữ'],['Danh tính, điểm','Không máy chủ','Có quản lý tập trung','Có nền tảng','Quản lý riêng'],['Mô phỏng','Phẳng và không gian','Tích hợp học liệu','Tích hợp hoặc liên kết','Không trực tiếp'],['Chi phí','Cần bảo trì','Cần vận hành','Tùy dịch vụ','Cần in ấn']]
},'Lợi thế là phân phối cục bộ; không tuyên bố giải pháp khác thiếu ngoại tuyến hay kiểm chất lượng.', ['README.md','https://docs.moodle.org/en/Moodle_app_offline_features','https://support.google.com/edu/classroom/answer/11015503?hl=en'],[
  'Cột hệ thống quản lý học tập đối chiếu Moodle; cột lớp học trực tuyến đối chiếu Google Classroom. Moodle có thể triển khai tại chỗ hoặc mạng nội bộ, ứng dụng hỗ trợ ngoại tuyến có điều kiện. Google Classroom trên điện thoại cho đọc thông báo, bài và sửa tài liệu tải trước theo tài liệu chính thức.',
  'Giáo trình không cần dịch vụ tập trung khi đọc gói, nhưng không thay tài khoản và sổ điểm của hệ thống quản lý học tập. Bản giấy và phần mềm đều có chi phí biên soạn, bảo trì và phân phối. Tài liệu Moodle tìm từ nguồn chính thức nhưng truy cập trực tiếp bị chặn, nên không mở rộng kết luận từng chức năng ngoại tuyến.'
]);
add('So sánh và đánh giá','Mười điểm mạnh, ba nhóm','Điểm mạnh thiết kế được phân biệt với kết quả thẩm định.','cards',{
  cards:[card('Kỹ thuật — 4','Ngoại tuyến; phân lớp; tạo học liệu; hai tầng mô phỏng.'),card('Học thuật — 3','Khung kiểm chất lượng; truy vết; sổ thẩm định.'),card('Người dùng — 3','Tiếp cận; tài liệu giữ ngữ cảnh; ảnh tĩnh dự phòng.')]
},'Cơ chế tạo nền tảng kiểm soát chất lượng, không thay kết quả kiểm tra.', ['README.md','docs/system-architecture.md','data/academic_review_ledger.json','data/qa-gates.json'],[
  'Bốn điểm kỹ thuật là tài nguyên cục bộ, phân lớp trách nhiệm, quy trình tạo nội dung và hai tầng mô phỏng. Ba điểm tổ chức chất lượng là khung kiểm tra, truy vết và sổ thẩm định. Ba điểm người dùng là tiếp cận, giữ ngữ cảnh tài liệu và ảnh tĩnh dự phòng.',
  'Không gọi kiểm tra cấp công nghiệp như chứng nhận. Điểm mạnh là cơ chế quan sát được để quản lý rủi ro; vẫn phải kiểm thực thi và bằng chứng chấp nhận. Chuyển giao cần thử trên học phần khác.'
]);
add('So sánh và đánh giá','Hạn chế theo mức ảnh hưởng','Ưu tiên chấp nhận học thuật và tính đúng của bản nguồn trước mở rộng.','cards',{
  cards:[card('Cao — 2','Chưa ký duyệt học thuật; chưa chạy hệ thống học tập đích.','red'),card('Trung bình — 4','Nguồn biên soạn; công cụ kiểm; không gian thí điểm; tài liệu.'),card('Thấp — 2',`Nội dung ${pagesBytes.toLocaleString('vi-VN')} byte; một số mục Chương 3 đã loại.`)]
},'Nguồn mô phỏng mới còn chờ kiểm lại; mức ảnh hưởng là đánh giá đề xuất.', ['data/acceptance-report.json','data/lms-targets.json','data/simulation-current-revalidation.json','README.md','js/pages.js'],[
  'Hai hạn chế cao là thiếu chấp nhận học thuật và bằng chứng liên thông trên hệ thống quản lý học tập thật. Bốn điểm trung bình là phụ thuộc tài liệu biên soạn, kiểm chất lượng cần công cụ kỹ thuật, mô phỏng không gian thí điểm và trình đọc chưa tìm kiếm, ảnh thu nhỏ, chú thích.',
  `Hai điểm còn lại là tập nội dung js/pages.js có ${pagesBytes} byte, tương đương ${(pagesBytes/1048576).toFixed(2)} đơn vị nhị phân với mỗi đơn vị bằng 1.048.576 byte, và bài tập Chương 3 phần VII, mục 4 đến 6 đã loại khỏi phạm vi. Phân hạng là đề xuất, chưa được đơn vị phê duyệt. Nguồn mô phỏng mới cần kiểm lại, không dùng như bản đạt đầy đủ.`
]);
add('So sánh và đánh giá','Năm rủi ro và cách xử lý','Ước lượng định tính để ưu tiên; chưa có dữ liệu xác suất.','table',{
  headers:['Rủi ro','Ảnh hưởng','Biện pháp'],rows:[['Tài liệu biên soạn thay đổi','Lệch nguồn và đầu ra','Tái tạo và kiểm nội dung'],['Thiếu hỗ trợ đồ họa không gian','Không dùng được bản không gian','Giữ bản phẳng và kiểm dự phòng'],['Nội dung lỗi thời','Sai học thuật','Thẩm định, phiên bản, ký duyệt'],['Tập nội dung lớn','Chậm tải ban đầu','Đo trên máy đích rồi tối ưu'],['Mất bộ nhớ trình duyệt','Mất dữ liệu tự học','Hướng dẫn lưu, chuyển; đề xuất sao lưu']]
},'Biện pháp dự kiến không phải tính năng đã có; chưa xác nhận xuất và nhập dữ liệu tự học.', ['README.md','data/academic_review_ledger.json','data/simulation-current-revalidation.json'],[
  'Năm rủi ro là lệch nội dung sau sửa nguồn, thiếu đồ họa không gian, học thuật lỗi thời, thời gian tải tập nội dung và mất dữ liệu cục bộ. Dự phòng và quy trình tạo học liệu cần kiểm thực thi; sao lưu là đề xuất mới.',
  'Chưa có thống kê xác suất. Tối ưu tập nội dung phải dựa vào thời gian mở và bộ nhớ trên máy đích. Không tuyên bố có xuất hoặc nhập dữ liệu tự học khi chưa có bằng chứng về giao diện và phạm vi dữ liệu.'
]);
add('Tác động và khuyến nghị','Tác động giáo dục cần kiểm chứng','Giá trị kỳ vọng đối với ba nhóm, không phải hiệu quả đã đo.','cards',{
  cards:[card('Học viên','Tìm bài, đọc ngoại tuyến, quan sát và tự kiểm tra.'),card('Giảng viên','Sửa nguồn; đối chiếu học liệu và câu hỏi.'),card('Nhà trường','Thí điểm triển khai và tái sử dụng quy trình.')]
},'Cần nghiên cứu người học để kết luận hiệu quả, chi phí và khả năng nhân rộng.', ['data/presentation-specification.json','data/learning-outcomes.json','README.md'],[
  'Học viên có thể tiếp cận học liệu khi hạn chế mạng và quan sát đại lượng khó thấy trong bản giấy. Nguồn biên soạn và truy vết hỗ trợ giảng viên cập nhật, nhưng tái tạo và kiểm chất lượng vẫn cần kỹ thuật.',
  'Phân phối cục bộ và tái sử dụng quy trình đáng thí điểm. Chưa có số liệu trước–sau, nhóm đối chứng hoặc tổng chi phí để kết luận tăng chất lượng đào tạo hay tiết kiệm. Cần kế hoạch đo lường riêng và bảo đảm quyền riêng tư người học.'
]);
add('Tác động và khuyến nghị','Sáu bài học có thể chuyển giao','Nguyên tắc thực hành, không phải kết luận từ thử nghiệm giáo dục.','cards',{
  cards:[card('01 · Ngoại tuyến','Không đánh đổi chất lượng vì thiếu mạng.'),card('02 · Tạo học liệu','Sửa nguồn rồi tái tạo đầu ra.'),card('03 · Truy vết','Thiết kế liên kết từ đầu.'),card('04 · Tiếp cận','Viết điều kiện kiểm rõ ràng.'),card('05 · Phát hành','Gắn phiên bản và dấu kiểm tra tệp.'),card('06 · Trung thực','Giữ trạng thái chưa đạt, chưa thể đánh giá.')]
},'Nhân rộng quy trình kiểm chứng trước khi nhân rộng số lượng tính năng.', ['README.md','docs/docx-sync-pipeline.md','data/acceptance-report.json'],[
  'Sáu bài học là giữ chất lượng trong kiến trúc ngoại tuyến, tự động hóa tái tạo, tạo truy vết sớm, có điều kiện tiếp cận rõ, quản lý phiên bản và trung thực về trạng thái.',
  'Đây là kinh nghiệm tổ chức dự án, không chứng minh mọi giáo trình phải dùng cùng công nghệ. Chuyển môn phải rà soát nguồn, cấu trúc, mô hình đặc thù và quyền dùng tài nguyên; quy trình tạo học liệu không bảo đảm chỉ thay nội dung là dùng được ngay.'
]);
add('Tác động và khuyến nghị','Lộ trình đề xuất: ba giai đoạn','Mốc tương đối từ khi kế hoạch được đơn vị phê duyệt.','cards',{
  cards:[card('0–3 tháng','Sửa chưa đạt; kiểm lại nguồn; thẩm định và chạy thử độc lập.'),card('3–6 tháng','Thử hệ thống học tập đích; mở không gian khi có giá trị sư phạm.'),card('6–12 tháng','Đo tải; nâng trình đọc tài liệu; thí điểm học phần khác.')]
},'Ưu tiên hoàn tất điều kiện chấp nhận; không mở rộng không gian chỉ để tăng số lượng.', ['data/acceptance-report.json','data/simulation-current-revalidation.json','data/lms-targets.json','NghienCuuLamSlideMoi.txt'],[
  'Ngắn hạn sửa vấn đề, kiểm nguồn mô phỏng hiện tại, thẩm định độc lập về học thuật và tiếp cận, chạy thử vận hành cơ bản và kiểm chu trình sửa rồi tái tạo tài liệu bằng Word. Thống nhất trách nhiệm và điều kiện kết thúc trước khi bắt đầu.',
  'Trung hạn thí điểm liên thông Moodle và Canvas, chọn vị trí mở rộng mô phỏng không gian theo nhu cầu sư phạm. Dài hạn đo hiệu năng, nâng trình đọc tài liệu và thử chuyển giao. Các mốc là đề xuất, chưa được cấp nguồn lực hoặc phê duyệt.'
]);
add('Tác động và khuyến nghị','Chỉ số đánh giá: hiện trạng và mục tiêu đề xuất','Mỗi mục tiêu cần cách đo, người xác nhận và bản nguồn.','table',{
  headers:['Chỉ số','Hiện trạng hồ sơ','Mục tiêu đề xuất','Mốc'],rows:[['Kiểm tra chất lượng','11/24 đạt','24/24, đủ bằng chứng','0–3 tháng'],['Thẩm định tiếp cận','Chưa thể đánh giá','Hoàn tất độc lập','0–3 tháng'],['Ký duyệt học thuật',`${signoffs} bản ghi`,'Đủ phạm vi duyệt','0–3 tháng'],['Mô phỏng','25 vị trí; 10 bản không gian','Giữ đúng; mở có căn cứ','3–6 tháng'],['Hệ thống học tập đích','Chưa có lần chạy','2 đích có bằng chứng','3–6 tháng'],['Học phần áp dụng','1 hiện vật','Thí điểm tới 3 môn','6–12 tháng']]
},'Mục tiêu không phải cam kết; 25 vị trí và 10 bản không gian không cộng thành 35 bài.', ['data/acceptance-report.json','data/academic_signoffs.json','data/lms-targets.json','js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js'],[
  `Hiện trạng chất lượng lấy từ hồ sơ ${acceptance.generatedAt}, không phải chạy lại nguồn mới. Mục tiêu 24/24 chỉ có giá trị khi đủ bằng chứng và điều kiện thẩm định, không phải sửa trạng thái dữ liệu.`,
  'Không đặt 40+ bài vì bản không gian tăng cường bản phẳng; trước hết giữ tính đúng. Hai hệ thống học tập và ba học phần là mục tiêu đề xuất để thảo luận nguồn lực. Tác động học tập cần chỉ số nghiên cứu riêng, không thay bằng đếm tài nguyên.'
]);
add('Tác động và khuyến nghị','Năm khuyến nghị cho hội đồng','Đề nghị thống nhất ưu tiên và điều kiện chuyển bước.','table',{
  headers:['Ưu tiên','Khuyến nghị'],rows:[['1 · Học thuật','Thẩm định độc lập, ký duyệt đúng thẩm quyền'],['2 · Tiếp cận','Kiểm thủ công, thiết bị và người dùng'],['3 · Liên thông','Thử hệ thống đích, lưu bằng chứng nhập và chạy'],['4 · Chuyển giao','Thí điểm môn khác với nguồn lực rõ'],['5 · Minh bạch','Không nâng trạng thái bằng lời thuyết minh']]
},'Đề nghị tiếp tục hoàn thiện có điều kiện, chưa đề nghị nghiệm thu cuối cùng.', ['data/acceptance-report.json','data/presentation-specification.json','NghienCuuLamSlideMoi.txt'],[
  'Hoàn thiện thẩm định độc lập về học thuật và tiếp cận; minh chứng trên hệ thống học tập đích thay vì chỉ có tệp trao đổi; chuyển giao qua thí điểm, không sao chép kỳ vọng giữa các môn.',
  'Sửa hồ sơ hoặc dựng trình chiếu không hoàn tất điều kiện chưa đạt hoặc chưa thể đánh giá. Đề nghị hội đồng ghi nhận hiện vật và thống nhất lộ trình hoàn thiện; chấp nhận cuối thuộc quy trình riêng của đơn vị.'
]);
add('Kết thúc','Kết luận: ba luận điểm','Có hiện vật kỹ thuật; cần thẩm định độc lập; có hướng chuyển giao.','cards',{
  cards:[card('Khả thi về thiết kế','Gói cục bộ và thành phần đọc tĩnh đã xây dựng.','green'),card('Chưa đủ chấp nhận','Kiểm chất lượng còn chưa đạt; chưa đủ thẩm định.','red'),card('Có hướng nhân rộng','Tái sử dụng quy trình qua thí điểm.')]
},'Tiếp tục đầu tư vào bằng chứng và thẩm định trước khi mở rộng phạm vi.', ['data/acceptance-report.json','data/simulation-current-revalidation.json','data/release-candidate.json'],[
  'Kiến trúc và gói phát hành cho thấy cơ sở kỹ thuật; hồ sơ chưa đủ chấp nhận học thuật; quy trình có thể là nền tảng chuyển giao sau thí điểm.',
  'Không chứng nhận mọi tính năng ngoại tuyến đã đạt hoặc hiệu quả giáo dục đã chứng minh. Cần kiểm bản nguồn hiện tại, sửa vấn đề và thẩm định độc lập để tạo bằng chứng hội đồng có thể kiểm lại.'
]);
add('Kết thúc','CẢM ƠN HỘI ĐỒNG\nHỎI–ĐÁP','Trao đổi về bằng chứng, phạm vi sử dụng và ưu tiên hoàn thiện.','closing',{
  cards:[card('Mã nguồn công khai','Có thể truy cập từ địa chỉ trong ghi chú.'),card('Trang dự phòng','33 · Vòng đời tải bài\n34 · Danh mục mô phỏng')]
},'Sẵn sàng đối chiếu nguồn; không suy đoán thay bằng chứng còn thiếu.', ['README.md','NghienCuuLamSlideMoi.txt'],[
  `Cảm ơn hội đồng. Xin nhận câu hỏi về kỹ thuật, học thuật và ưu tiên đầu tư. Địa chỉ mã nguồn: ${meta.repository}. Câu hỏi cần khảo sát hoặc kiểm chứng mới sẽ được ghi lại thay vì trả lời bằng ước lượng chưa có nguồn.`,
  'Hai trang dự phòng trình bày vòng đời tải bài và danh mục mô phỏng. Có thể mở khi cần làm rõ kiến trúc hoặc phạm vi; không coi là bằng chứng thành phần tương tác đã đạt trên nguồn mới.'
]);
add('Dự phòng cho hỏi–đáp','Chi tiết kiến trúc và vòng đời bài','Từ chọn bài, tải nội dung đến mở mô phỏng và chuyển bài.','image',{
  image:`${currentA}/current-simulation.png`,caption:currentCaption,
  cards:[card('Chọn và tải bài','Tìm nội dung trong gói cục bộ rồi đưa vào vùng đọc.'),card('Mở tương tác','Hiển thị công thức; khởi tạo mô phỏng theo bài.'),card('Chuyển nội dung','Dừng tác vụ; giải phóng đúng tài nguyên.')]
},'Chuyển bài phải tránh thao tác và tài nguyên còn sót; nguồn mới vẫn cần kiểm lại.', ['js/loader.js','js/pages.js','README.md','data/simulation-current-revalidation.json'],[
  'Bộ tải điều phối nội dung và tương tác. Từ bài được chọn, bộ tải tìm phần nội dung hoặc tập nội dung cục bộ, cập nhật vùng đọc, hiển thị công thức rồi khởi tạo mô phỏng tương ứng. Các quy ước liên kết trong js/loader.js và js/pages.js cần được kiểm khi điều hướng.',
  'Khi đổi bài cần dừng theo dõi sự kiện, theo dõi thay đổi và tác vụ vẽ lặp, rồi giải phóng phần tử thuộc mô phỏng. Cửa sổ tài liệu giữ bài là trạng thái riêng, tránh giải phóng nhầm. Ảnh ngày 05/10/2026 không thay kiểm lại vòng đời và dự phòng của nguồn mới.'
]);
add('Dự phòng cho hỏi–đáp','Danh mục đầy đủ mô phỏng','25 vị trí phẳng · đánh dấu 10 vị trí có bản không gian tăng cường.','routes',{
  columns:[1,2,3].map((chapter,index)=>({title:['Chương 1 · Tĩnh học (10)','Chương 2 · Động học (7)','Chương 3 · Động lực học (8)'][index],items:sim2.filter(r=>r.chapter===chapter).map(r=>`${simulationNames[r.id]}${pilotIds.has(r.id)?' [không gian]':''}`)}))
},'Bản không gian thuộc tập 25 vị trí; danh mục không chứng minh chất lượng mô hình.', ['js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/simulation-specifications.json'],[
  'Phụ lục liệt kê đủ 25 vị trí theo ba chương: 10 Tĩnh học, 7 Động học và 8 Động lực học. Ghi chú “có bản không gian” chỉ vị trí có tùy chọn thí điểm; tất cả vẫn thuộc tập bài mô phỏng phẳng. Tên diễn giải tiếng Việt chỉ dùng trong báo cáo, không sửa danh mục nguồn.',
  `Mười vị trí có bản không gian: ${sim3.map(r=>simulationNames[r.id]).join('; ')}. Phạm vi đọc trực tiếp từ danh mục; chất lượng mô hình, giả thiết và tính đúng phải xem đặc tả cùng bằng chứng đúng bản nguồn.`
]);
module.exports = {meta,slides};
