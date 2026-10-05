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
const meta = {
  title: 'Giáo trình điện tử Cơ học lý thuyết',
  subtitle: 'Kiến trúc · Chất lượng · Tác động',
  authors: ['TS Nguyễn Lê Văn — Chủ biên', 'ThS Đinh Văn Tứ — Biên soạn', 'ThS Bùi Thanh Xuân — Biên soạn'],
  institution: 'Học viện Hải quân', date: '05/10/2026',
  repository: 'https://github.com/xuan2261/GiaoTrinhDienTu_CoHocLyThuyet',
  onlineUrl: 'https://xuan2261.github.io/GiaoTrinhDienTu_CoHocLyThuyet/',
  editorialNotes: [
    'Bộ mới gồm 1 trang QR mở đầu và 33 chủ đề theo tài liệu. Hai trang dự phòng nằm ở slide 33–34.',
    'Không sử dụng tỷ lệ minh họa 73%, điểm 8,2/10 hay tuyên bố QA 8/8 đạt như kết quả đã đo.',
    `QA được trích từ sổ ngày ${acceptance.generatedAt.slice(0,10)}: ${acceptance.gateSummary.pass} pass, ${acceptance.gateSummary.fail} fail, ${acceptance.gateSummary.blocked} blocked; không phải lần kiểm tra sản phẩm mới.`,
    '10 bản 3D bổ sung cho 25 vị trí 2D, không phải 35 bài độc lập. Thẩm định nguồn mô phỏng hiện tại còn pending.',
    'Các mốc roadmap, KPI, lợi ích và xác suất rủi ro là đề xuất, không phải cam kết được phê duyệt hoặc kết quả nghiên cứu người học.',
    'Dùng Arial để tránh thay font trên máy trình chiếu. Không dựng biểu trưng giả khi chưa có logo chính thức.'
  ]
};
const slides = [];
function add(section, title, subtitle, layout, content, takeaway, sources, notes) {
  slides.push({id:slides.length+1,section,title,subtitle,layout,...content,takeaway,sources,notes});
}
const card = (title, body, color) => ({title,body,...(color ? {color}: {})});
const qa = `Sổ ${acceptance.generatedAt.slice(0,10)}: ${acceptance.gateSummary.pass} pass / ${acceptance.gateSummary.fail} fail / ${acceptance.gateSummary.blocked} blocked.`;
add('Truy cập trực tuyến','Trải nghiệm giáo trình trực tuyến','Quét QR bằng điện thoại để mở phiên bản web.','qr',{
  url:meta.onlineUrl,image:`${A}/qr-code-online-textbook.png`
},'Kết nối Internet để truy cập web; giữ bản ngoại tuyến khi cần.', [meta.onlineUrl,`${A}/qr-code-online-textbook.png`],[
  `Kính mời hội đồng quét mã QR để mở giáo trình trực tuyến tại ${meta.onlineUrl}`,
  'Có thể dùng camera điện thoại hoặc ứng dụng quét QR. Trang QR được đặt trước phần báo cáo để người nghe truy cập học liệu trong lúc theo dõi.'
]);
add('Mở đầu','GIÁO TRÌNH ĐIỆN TỬ\nCƠ HỌC LÝ THUYẾT',meta.subtitle,'cover',{},
  'Báo cáo hiện trạng, bằng chứng và lộ trình hoàn thiện — không thay quyết định nghiệm thu.',
  ['NghienCuuLamSlideMoi.txt','data/acceptance-report.json','chapters/tac-gia.html'],[
    'Kính thưa hội đồng, báo cáo này đánh giá giáo trình điện tử Cơ học lý thuyết được xây dựng phục vụ đào tạo tại Học viện Hải quân. Nội dung tập trung vào ba trục: kiến trúc triển khai, chất lượng có bằng chứng và giá trị giáo dục cần tiếp tục kiểm chứng.',
    'Luận điểm xuyên suốt là sản phẩm có hiện vật kỹ thuật và quy trình kiểm tra, nhưng chưa được đồng nhất với chấp nhận học thuật. Những số liệu trong báo cáo được gắn với nguồn cụ thể; phần kế hoạch được phân biệt với kết quả đã đạt.'
]);
add('Mở đầu','Tóm tắt điều hành','Bốn con số phạm vi; ba kết luận để hội đồng ra quyết định.','metrics',{
  metrics:[{value:String(summary.staging.fileCount),label:'tệp trong gói',detail:'Candidate 02/09'},{value:String(sim2.length),label:'vị trí Sim2',detail:'Lớp cơ sở SVG'},{value:String(sim3.length),label:'bản Sim3',detail:'Bổ sung cho Sim2'},{value:'8',label:'nhóm QA',detail:'24 cổng thực tế'}],
  cards:[card('Kỹ thuật','Có hiện vật ngoại tuyến.'),card('Học thuật','Chưa đủ ký duyệt.','red'),card('Chuyển giao','Có hướng tái sử dụng.','green')]
},'Phạm vi không phải chất lượng; chạy được không đồng nghĩa đã được nghiệm thu.',
['release/2026.09.02-candidate/release-summary.json','js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/acceptance-report.json'],[
  `Bốn con số gồm ${summary.staging.fileCount} tệp trong gói ứng viên, ${sim2.length} vị trí mô phỏng 2D, ${sim3.length} bản 3D bổ sung và tám nhóm kiểm tra để tổ chức trình bày. Tám nhóm không phải tám cổng đã đạt: ${qa}`,
  'Ba kết luận là có cơ sở kỹ thuật cho triển khai ngoại tuyến, chưa đủ điều kiện chấp nhận học thuật chính thức và có khả năng tái sử dụng quy trình cho môn khác. Giá trị chuyển giao vẫn cần thí điểm; không suy ra hiệu quả học tập hoặc chi phí bằng không.'
]);
add('Mở đầu','Lộ trình báo cáo — 25 phút','1 trang QR · 30 slide nội dung · 1 trang hỏi–đáp · 2 trang dự phòng.','table',{
  headers:['Phần','Trọng tâm','Thời lượng'],rows:[['1','Phương pháp luận đánh giá','3 phút'],['2','Tổng quan dự án','3 phút'],['3','Kiến trúc và tính năng','8 phút'],['4','Chất lượng và bằng chứng','5 phút'],['5','So sánh và đánh giá','4 phút'],['6','Tác động và khuyến nghị','2 phút']]
},'Dành thêm 5–10 phút cho Q&A; phụ lục chỉ mở khi cần đào sâu.', ['NghienCuuLamSlideMoi.txt'],[
  'Báo cáo chính được phân bổ theo sáu khối với tổng thời gian mục tiêu 25 phút. Mở đầu và kết luận được lồng vào các khối thay vì cộng thêm ngoài ngân sách thời gian.',
  'Trang QR mở đầu là slide 1. Sau slide 31 là trang hỏi–đáp. Hai trang 33 và 34 là dự phòng: chi tiết vòng đời tải bài và danh mục đầy đủ mô phỏng.'
]);
add('Mở đầu','Vì sao ngoại tuyến là quan trọng?','Thiết kế cho điều kiện kết nối bị hạn chế, không dựa vào tỷ lệ khảo sát giả định.','cards',{
  cards:[card('Điều kiện triển khai','Không mặc định Internet luôn sẵn sàng.'),card('Hướng giải quyết','Phân phối tài nguyên cục bộ; mở index.html.'),card('Giới hạn dữ liệu','Chưa có khảo sát thiết bị của đơn vị.','red')]
},'Offline-first là lựa chọn theo bối cảnh sử dụng; phải thử trên thiết bị thực.', ['README.md','docs/deployment-guide.md','NghienCuuLamSlideMoi.txt'],[
  'Trong môi trường kết nối hạn chế, bài học không nên phụ thuộc vào việc truy cập dịch vụ từ xa ở mỗi phiên học. Kiến trúc tài nguyên cục bộ của dự án hướng tới tình huống này; gói có thể được phân phối qua USB hoặc máy chủ tĩnh.',
  'Tỷ lệ 73% trong tài liệu chỉ là minh họa, nên không được dùng làm bằng chứng về đơn vị. Tương tự, chưa có căn cứ trong phiên biên tập này để khẳng định 100% tính năng đã vượt qua thử nghiệm trên mọi thiết bị. Cần khảo sát và chạy thử độc lập trước khi mở rộng.'
]);
add('Phương pháp luận','Phương pháp đánh giá','Bốn bước phân biệt thiết kế, thực thi, bằng chứng và chuẩn đối chiếu.','steps',{
  steps:[{title:'Phân tích tĩnh',body:'Đọc nguồn, README và tài liệu.'},{title:'Kiểm chứng động',body:'Thử file://, HTTP và máy đích.'},{title:'Đối chiếu bằng chứng',body:'Gắn capture, hash và phiên bản.'},{title:'So sánh chuẩn',body:'WCAG, QTI và Cartridge.'}]
},'Chỉ kết luận trong phạm vi đã kiểm tra và đúng phiên bản nguồn.', ['README.md','data/evidence-registry.json','data/acceptance-report.json','data/simulation-current-revalidation.json'],[
  'Bước một xác định hệ thống được thiết kế như thế nào từ mã và tài liệu. Bước hai quan sát nó chạy trong các điều kiện thực tế. Bước ba kiểm tra đầu ra, dấu thời gian và hash của bằng chứng để tránh lấy ảnh bản cũ chứng minh cho mã mới.',
  'Bước bốn dùng chuẩn ngành làm khung đối chiếu, không phải chứng nhận tự động. Báo cáo này sử dụng hồ sơ kiểm tra đã lưu; việc dựng và kiểm bộ slide không phải lần chạy lại toàn bộ QA của sản phẩm. Nguồn mô phỏng mới vẫn có trạng thái revalidation pending.'
]);
add('Phương pháp luận','Sáu tiêu chí đánh giá','Dùng bằng chứng và trạng thái thay cho điểm số chưa được thẩm định.','table',{
  headers:['Tiêu chí','Bằng chứng hoặc trạng thái'],rows:[['Kiến trúc','Có phân lớp và tài nguyên cục bộ'],['Tính năng','Có tìm kiếm, quiz và mô phỏng'],['Chất lượng QA',`${acceptance.gateSummary.pass} pass; ${acceptance.gateSummary.fail} fail; ${acceptance.gateSummary.blocked} blocked`],['Khả năng tiếp cận','Có kiểm tự động; review độc lập bị chặn'],['Sẵn sàng phát hành','Candidate; chưa chấp nhận cuối cùng'],['Chuyển giao','Đề xuất thí điểm môn khác']]
},'Không dùng 8,2/10 làm kết luận độc lập khi chưa có rubric và người chấm.', ['data/acceptance-report.json','data/presentation-specification.json','docs/system-architecture.md'],[
  'Sáu tiêu chí giữ nguyên ý định đánh giá của tài liệu: kiến trúc, tính năng, chất lượng, tiếp cận, phát hành và chuyển giao. Mỗi tiêu chí được nối với hiện vật hoặc trạng thái kiểm tra thay vì một thang điểm có vẻ chính xác nhưng chưa có quy trình chấm.',
  'Các điểm 8, 9, 10 và tổng 8,2 trong bản đề xuất chưa phải kết quả khảo sát hoặc đánh giá độc lập. Đặc biệt không thể chấm QA tuyệt đối khi sổ hiện có fail và blocked. Hội đồng có thể phê duyệt rubric và tổ chức đánh giá riêng sau báo cáo này.'
]);
add('Phương pháp luận','Nguồn dữ liệu và bằng chứng','Tám tuyến tra cứu, mỗi tuyến có chức năng riêng.','table',{
  headers:['Nguồn','Vai trò'],rows:[['README.md','Phạm vi và đường dẫn vận hành'],['docs/','Kiến trúc, triển khai và giới hạn'],['release/','Gói ứng viên và SHA-256'],['data/evidence-registry.json','Danh mục bằng chứng'],['data/','Manifest, ledger và trạng thái'],['tests/','Định nghĩa hành vi cần kiểm tra'],['tools/','Nguồn pipeline và công cụ'],['Git history','Phiên bản và lịch sử thay đổi']]
},'Định nghĩa một phép kiểm tra không chứng minh phép kiểm tra đó đã pass.', ['README.md','data/evidence-registry.json','data/acceptance-report.json'],[
  'Các nguồn được chia theo chức năng để người nghe có thể kiểm lại tuyên bố. Mã nguồn chỉ ra cơ chế; manifest chỉ ra phạm vi; hồ sơ thực thi mới cho biết kết quả trên một phiên bản và môi trường cụ thể.',
  'Lịch sử Git giúp nhận diện thay đổi, không tự chứng minh chất lượng. Tương tự, tồn tại tests hoặc thư mục evidence chưa đủ: phải kiểm kết quả, hash và ràng buộc với gói đang báo cáo. Các ảnh giao diện dùng trong bộ này được ghi rõ là minh họa lịch sử.'
]);
add('Tổng quan','Tổng quan dự án','Một giáo trình tĩnh cho ba chương Cơ học lý thuyết.','cards',{
  cards:[card('Nội dung','Tĩnh học · Động học · Động lực học.'),card('Công nghệ','HTML, CSS, JavaScript; thư viện cục bộ.'),card('Nguồn chuẩn','DOCX và dữ liệu curated bổ trợ.')]
},'Không cần backend cho đọc học liệu; bảo trì và QA vẫn cần đầu mối kỹ thuật.', ['README.md','CoHocLyThuyet_Full_New.docx','data/presentation-specification.json'],[
  'Sản phẩm là giáo trình điện tử tĩnh với ba chương. Nguồn narrative chuẩn là CoHocLyThuyet_Full_New.docx; một số bảng tra cứu và dữ liệu kiểm tra được quản lý riêng dưới data. Runtime phát hành không cần npm hoặc một backend phục vụ từng người học.',
  'Các khác biệt đáng chú ý là tài nguyên ngoại tuyến, quy trình tạo nội dung, mô phỏng và khả năng truy vết. Không gọi đây là hệ thống không có dependency: KaTeX, Three.js và PDF.js là thư viện đóng gói cục bộ. Việc tác giả sửa DOCX không loại bỏ vai trò của kỹ thuật trong tái tạo và kiểm tra.'
]);
add('Tổng quan','Phạm vi: giáo trình, không phải LMS','Ranh giới rõ để tránh kỳ vọng sai về tài khoản, sổ điểm và đồng bộ.','table',{
  headers:['Trong phạm vi hiện vật','Ngoài phạm vi hiện tại'],rows:[['Đọc học liệu và tìm kiếm cục bộ','Backend, tài khoản, cloud sync'],['Quiz, tiến độ, ghi chú cá nhân','Sổ điểm có danh tính trên máy chủ'],['25 vị trí Sim2; 10 bản Sim3','3D cho toàn bộ vị trí'],['Trình đọc PDF nội tuyến','PDF search và annotation'],['Pipeline QA và academic ledger','Nghiệm thu học thuật mặc định'],['QTI/Cartridge thử nghiệm','SCORM, xAPI/cmi5 hoàn chỉnh']]
},'Gói ZIP không phải LMS; dữ liệu tự học cục bộ không phải sổ điểm chính thức.', ['README.md','data/presentation-specification.json','data/lms-targets.json'],[
  'Bảng này tách những hiện vật có trong dự án khỏi khả năng mà một LMS thường cung cấp. Giáo trình có hỗ trợ tự học, nhưng không có danh tính người học hoặc cơ chế đồng bộ tập trung trong phạm vi hiện tại.',
  'Có các bản dẫn xuất QTI 3 và Common Cartridge 1.4 ở mức pilot. Điều đó không có nghĩa SCORM, xAPI hay cmi5 đã được triển khai, cũng không chứng minh liên thông trên LMS thật. Giới hạn này cần được duy trì trong hồ sơ bàn giao và khuyến nghị sử dụng.'
]);
add('Tổng quan','Kiến trúc năm lớp','Phân tách giao diện, tải bài, runtime, nội dung và dữ liệu.','table',{
  headers:['Lớp','Thành phần','Trách nhiệm'],rows:[['Shell','index.html, css/, app.js','UI, theme, điều hướng'],['Loader','loader.js, pages.js','Route, fragment, mount'],['Runtime','Sim2, Sim3, PDF, quiz','Tương tác và vòng đời'],['Content','chapters/, images/, GIF','Học liệu và hình minh họa'],['Data','data/ và hồ sơ evidence','Schema, truy vết, review']]
},'Phân lớp giúp xác định nơi sửa và nơi kiểm; không đảm bảo thay engine không có tác động.', ['docs/system-architecture.md','js/loader.js','README.md'],[
  'Năm lớp ở đây là cách trình bày kiến trúc để hội đồng thấy các trách nhiệm chính. Shell điều khiển giao diện; loader tải bài; runtime quản lý mô phỏng, PDF và quiz; content chứa học liệu; data giữ các cấu trúc và hồ sơ kiểm chứng.',
  'Phân lớp tạo điều kiện bảo trì nhưng các lớp vẫn có hợp đồng liên kết. Thay engine mô phỏng hoặc schema có thể ảnh hưởng loader và nội dung. Vì vậy phải kiểm các điểm mount, dispose, route và dữ liệu thay vì tuyên bố có thể thay độc lập tuyệt đối.'
]);
add('Kiến trúc và tính năng','Offline-first: cơ chế và phép chứng minh','Tài nguyên đóng gói cục bộ; kết luận phải gắn với máy và gói đã thử.','cards',{
  cards:[card('Không backend','Đọc gói tĩnh từ index.html.'),card('Không CDN bắt buộc','Thư viện có trong lib/.'),card('Cần kiểm máy đích','file://, USB, HTTP và fallback.','red')]
},'Ngoại tuyến là đặc tính thiết kế; 100% tính năng cần bộ bằng chứng đầy đủ.', ['README.md','release/2026.09.02-candidate/technical-smoke.md','data/acceptance-report.json'],[
  'Gói standalone có tài nguyên nội dung và thư viện cục bộ. Cơ chế này tránh yêu cầu gọi CDN trong quá trình đọc và cho phép mở bằng file:// hoặc máy chủ tĩnh. Hồ sơ technical-smoke của candidate là bằng chứng có giới hạn theo thời điểm và gói.',
  'Không suy từ cơ chế sang cam kết mọi tính năng chạy trên mọi trình duyệt. Cần kiểm đường dẫn tương đối, localStorage, PDF, mô phỏng và fallback trên máy trình chiếu. Gate smoke độc lập vẫn bị chặn trong hồ sơ; báo cáo giữ trạng thái đó.'
]);
add('Kiến trúc và tính năng','Sim2 và Sim3: chiến lược hai tầng','10 bản 3D tăng cường trải nghiệm trên những vị trí 2D đã có.','table',{
  headers:['Tiêu chí','Sim2','Sim3'],rows:[['Phạm vi','25 vị trí cơ sở','10 bản bổ sung'],['Công nghệ','SVG-first','Three.js / WebGL'],['Vai trò','Canonical','Pilot tùy chọn'],['Đồ họa GPU','Không đòi hỏi WebGL','Cần WebGL'],['Khi lỗi 3D','Giữ lớp 2D','Fallback về Sim2'],['Trạng thái nguồn mới','Cần revalidation','Cần revalidation']]
},'Không cộng 25 + 10 thành 35 bài; bước thời gian 1/60 s không phải đo FPS.', ['js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/simulation-current-revalidation.json','README.md'],[
  'Sim2 là lớp cơ sở trên 25 vị trí. Mười vị trí trong số đó có tùy chọn Sim3; đây là hai cách biểu diễn cùng chủ đề chứ không phải 35 bài khác nhau. Lựa chọn 3D cần giá trị sư phạm rõ và phương án dự phòng khi không có WebGL.',
  'README mô tả fixed-step 1/60 giây và demand rendering của Sim3. Đây là thông tin thiết kế, không phải kết quả đo 60fps trên thiết bị. Nguồn mô phỏng được cập nhật trên GitHub gần đây và trạng thái kiểm lại hiện pending, nên ảnh và pass lịch sử không được dùng xác nhận mã mới.'
]);
add('Kiến trúc và tính năng','Sáu tính năng học tập tương tác','Hỗ trợ tự học; không đồng nhất với quản lý đào tạo có danh tính.','table',{
  headers:['Tính năng','Cơ chế hoặc dữ liệu'],rows:[['Tìm kiếm','Chỉ mục cục bộ; có dấu/không dấu'],['Quiz','Phạm vi chương, ngẫu nhiên, lưu attempt'],['Tiến độ','Theo dõi đọc trong localStorage'],['Bookmark','Đánh dấu bài trên trình duyệt'],['Ghi chú','Dữ liệu cá nhân cục bộ'],['Thuật ngữ','Tooltip và nội dung tra cứu']]
},'Dữ liệu thuộc trình duyệt; phải giải thích rủi ro mất hoặc không chuyển theo USB.', ['README.md','js/quiz-state.js','js/progress.js','js/notes.js','js/glossary.js'],[
  'Sáu tính năng tạo vòng tự học: tìm bài, tương tác, làm câu hỏi và ghi nhận tiến độ. Tìm kiếm dùng chỉ mục văn bản cục bộ; quiz có chọn phạm vi và khôi phục lượt làm; tiến độ, bookmark, ghi chú sử dụng bộ nhớ trình duyệt.',
  'Điểm số quiz và lượt đọc chưa chứng minh chuẩn đầu ra đã đạt. Dữ liệu localStorage không tự đồng bộ giữa máy, có thể mất khi xóa dữ liệu hoặc đổi hồ sơ trình duyệt. Đơn vị triển khai cần hướng dẫn riêng về lưu giữ và chuyển dữ liệu cá nhân.'
]);
add('Kiến trúc và tính năng','PDF nội tuyến: giữ ngữ cảnh học','Dialog chuyên dụng thay vì chuyển người học ra khỏi bài.','image',{
  image:`${A}/img-06-pdf-viewer-1440x1000.png`,caption:'Ảnh giao diện lịch sử — không xác nhận trạng thái QA hiện tại.',
  cards:[card('Ngữ cảnh','Thiết kế giữ route và bài học.'),card('Thao tác','Trang, zoom, tải, Escape/Back.'),card('Giới hạn','Chưa search, thumbnail, annotation.','red')]
},'Mở PDF cần kiểm cả hiển thị lẫn trạng thái khi đóng dialog.', ['README.md','js/pdf-viewer.js','data/acceptance-report.json'],[
  'Trình đọc PDF được mở nội tuyến và nạp tài nguyên khi người dùng cần. Thiết kế cho phép chuyển trang, nhập trang, zoom, tải xuống và đóng bằng Escape hoặc Browser Back trong khi giữ ngữ cảnh bài.',
  'Ảnh trên slide là ảnh đã có trong kho, không phải lần kiểm thử mới. Gate PDF-release đang fail trong sổ lịch sử; vì vậy các thao tác được mô tả như phạm vi thiết kế, không nâng thành cam kết kiểm thử toàn bộ đã pass. Tìm kiếm, thumbnail và annotation PDF chưa nằm trong hiện vật.'
]);
add('Kiến trúc và tính năng','GIF với phương án dự phòng','Progressive enhancement: ảnh động khi phù hợp, ảnh tĩnh khi cần.','steps',{
  steps:[{title:`${gifCount} GIF`,body:'Danh mục được kiểm soát bởi manifest.'},{title:'PNG cơ sở',body:'Giữ hình tĩnh để đọc và đối chiếu.'},{title:'Giảm chuyển động',body:'Ưu tiên PNG theo lựa chọn hệ điều hành.'},{title:'Khi GIF lỗi',body:'Runtime có đường fallback ảnh tĩnh.'}]
},'Có fallback không đồng nghĩa mọi ảnh đã qua kiểm tra phát hành.', ['js/gif-figures.js','README.md','data/acceptance-report.json'],[
  `Manifest quản lý ${gifCount} GIF được chọn cho các hình cơ học. Nút ảnh động cho phép đổi giữa GIF và PNG; prefers-reduced-motion định hướng sử dụng ảnh tĩnh. Cơ chế dự phòng hướng đến việc không làm người học mất hình minh họa khi ảnh động lỗi.`,
  'Đây là quan sát thiết kế và số lượng trong gói. Gate gif-release vẫn fail trong hồ sơ đã lưu, nên cần kiểm lại tài nguyên, tình huống lỗi và thao tác người dùng trên bản đích. Không nhầm GIF với video hoặc học liệu âm thanh.'
]);
add('Kiến trúc và tính năng','Khả năng tiếp cận: nói đúng giới hạn','Kiểm tự động là một phần; đánh giá thủ công độc lập là phần riêng.','cards',{
  cards:[card('Đã có cơ chế','Landmark, focus, bàn phím và reduced-motion.'),card('Có bộ kiểm','axe, tương phản và reflow tự động.'),card('Chưa đủ kết luận','Review độc lập bị chặn; không tuyên bố WCAG.','red')]
},'Có test không phải pass; pass tự động không thay đối chiếu WCAG đầy đủ.', ['data/accessibility-baseline.json','data/acceptance-report.json','data/presentation-specification.json'],[
  'Dự án có các cơ chế hướng tới khả năng tiếp cận và các phép kiểm tự động. Các phép kiểm có thể phát hiện một phần vấn đề, nhưng không đánh giá hết ngữ nghĩa công thức, thao tác với mô phỏng hoặc trải nghiệm trình đọc màn hình.',
  'Hồ sơ lưu gate phase-08-accessibility là fail và gate review độc lập là blocked. Không dùng ngôn ngữ chứng nhận WCAG 2.2 AA. Muốn kết luận mức đáp ứng cần đối chiếu từng tiêu chí áp dụng, kiểm thủ công và lưu bằng chứng đúng bản nguồn.'
]);
add('Chất lượng và bằng chứng','QA: tám nhóm, 24 cổng thực tế','Khung nhóm để trình bày; không phải bảng tám cổng đã đạt.','table',{
  headers:['Nhóm','Lệnh hoặc hướng kiểm'],rows:[['Nội dung','test:content-manifest'],['Học thuật','validate:academic-review'],['Mô phỏng','test:sim:release'],['Tiếp cận','test:accessibility'],['Media pilot','validate:media-pilot'],['LMS','test:lms'],['PDF','test:pdf:release'],['Phát hành','test:release']]
},`${qa} Soak: yêu cầu ba lần liên tiếp, không tự coi đã hoàn tất.`, ['package.json','data/qa-gates.json','data/acceptance-report.json'],[
  'Tám nhóm này giúp hội đồng hiểu các loại rủi ro được bao phủ. Sổ QA thực tế có 24 cổng. Không thể thay trạng thái của sổ bằng cách gộp thành tám hàng hoặc bằng sửa lời thuyết minh.',
  `${qa} Các lần soak ba lượt liên tiếp và revalidation nguồn mới là yêu cầu cần có bằng chứng. Approval cuối phải đi qua các điều kiện học thuật, tiếp cận và chạy thử độc lập, không được suy ra từ việc công cụ build xuất được ZIP.`
]);
add('Chất lượng và bằng chứng','Academic review: chuỗi truy vết','Yêu cầu → mục tiêu học tập → học liệu → kiểm chứng → ký duyệt.','steps',{
  steps:[{title:'Yêu cầu',body:'Nguồn quy cách và căn cứ đào tạo.'},{title:'Learning outcome',body:'Mục tiêu có trạng thái thẩm định.'},{title:'Hiện vật',body:'Content, quiz và mô phỏng.'},{title:'Review và signoff',body:'Người có thẩm quyền xác nhận.'}]
},`Ledger ${ledgerBytes.toLocaleString('vi-VN')} byte; ${signoffs} bản ký trong sổ — dữ liệu không thay phê duyệt.`, ['data/academic_review_ledger.json','data/academic_signoffs.json','data/learning-outcomes.json','data/acceptance-report.json'],[
  'Chuỗi truy vết nối căn cứ đào tạo và mục tiêu với nội dung, quiz, mô phỏng và bằng chứng. Ledger giúp ghi lại nội dung cần review và tình trạng, chứ bản thân kích thước tệp không phản ánh chất lượng học thuật.',
  `Ledger đo được ${ledgerBytes} byte và sổ academic_signoffs có ${signoffs} bản ghi. Gate học thuật vẫn bị chặn. Cần review độc lập, đúng thẩm quyền và đúng phiên bản; không được tự ghi nhận đạt chuẩn đầu ra bằng tồn tại metadata LO.`
]);
add('Chất lượng và bằng chứng','Release: tái tạo và xác minh','Gói ứng viên lịch sử phải được phân biệt với mã nguồn đang thay đổi.','cards',{
  cards:[card(candidate.releaseVersion,`${summary.staging.fileCount} tệp; ZIP 78,74 MB.`),card('SHA-256','Đã đối chiếu hash ZIP với hồ sơ.','green'),card('Chưa final','Còn gate fail và review bị chặn.','red')]
},'Hash xác nhận đúng byte của gói, không xác nhận học thuật hoặc mã mới đã đạt.', ['data/release-candidate.json','release/2026.09.02-candidate/release-summary.json','data/acceptance-report.json'],[
  `Gói ứng viên là ${candidate.releaseVersion}, ZIP ${summary.package.sizeBytes} byte. SHA-256 đầy đủ: ${candidate.packageSha256}. Hash đã được tính trực tiếp khi chuẩn bị báo cáo và khớp sổ ứng viên.`,
  'Xác minh hash chỉ xác nhận tệp đúng như hồ sơ. Tái tạo cùng byte cần chạy build với điều kiện cố định; phiên này không thay bằng chứng reproducibility lịch sử. Candidate không phải final acceptance, và mã nguồn hiện tại đã có thay đổi cần kiểm lại riêng.'
]);
add('Chất lượng và bằng chứng','Tuyên bố nào, bằng chứng đó','Không dùng đường dẫn giả hoặc số đếm suy diễn.','table',{
  headers:['Tuyên bố','Nguồn kiểm chứng'],rows:[['372 tệp gói candidate','release-summary.json → staging.fileCount'],['SHA-256 ZIP khớp','Tính hash ZIP và so release-candidate.json'],['25 vị trí Sim2','sim2-route-manifest.js'],['10 bản Sim3 bổ sung','sim3-route-manifest.js'],['24 cổng; 11/9/4','acceptance-report.json'],['Nguồn mới chưa xác minh','simulation-current-revalidation.json'],['Academic signoff','academic_signoffs.json và gate review']]
},'Lưu toàn bộ đường dẫn và hash trong Notes để hội đồng truy lại.', ['release/2026.09.02-candidate/release-summary.json','data/release-candidate.json','js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/acceptance-report.json','data/simulation-current-revalidation.json'],[
  'Slide này là bản đồ kiểm chứng cho các con số chính. Số tệp lấy từ staging.fileCount của summary, không lấy bằng ls ở thư mục chứa nhiều bản gói. Danh mục mô phỏng nằm ở hai manifest JavaScript thực tế, không phải routes.json.',
  `Hash gói candidate là ${candidate.packageSha256}. Kết quả QA được gắn với snapshot ${acceptance.generatedAt}. Khi dữ liệu được cập nhật, dựng lại báo cáo từ nguồn thay vì sửa số riêng trên slide. Không dùng hash hay ảnh gói cũ để đóng finding của nguồn mới.`
]);
add('So sánh và đánh giá','So sánh theo điều kiện triển khai','Các giải pháp phục vụ mục đích khác nhau; không có lựa chọn tốt nhất tuyệt đối.','table',{
  headers:['Tiêu chí','Giáo trình này','Moodle','Classroom','Bản giấy'],rows:[['Ngoại tuyến','Gói cục bộ','App có điều kiện','Tệp tải trước','Có'],['Hạ tầng','Máy đọc','Site / máy chủ','Dịch vụ Google','In, lưu trữ'],['Danh tính, điểm','Không server','Có LMS','Có nền tảng','Quản lý riêng'],['Mô phỏng','Có 2D / 3D','Tích hợp học liệu','Tích hợp/liên kết','Không trực tiếp'],['Chi phí','Cần bảo trì','Cần vận hành','Tùy dịch vụ','Cần in ấn']]
},'Lợi thế là phân phối cục bộ; không tuyên bố đối thủ không có offline hoặc QA.', ['README.md','https://docs.moodle.org/en/Moodle_app_offline_features','https://support.google.com/edu/classroom/answer/11015503?hl=en'],[
  'Bảng so sánh tập trung vào điều kiện sử dụng và phạm vi, không chấm điểm sản phẩm khác. Moodle có thể triển khai tại chỗ hoặc trong LAN và ứng dụng có tính năng offline có điều kiện. Google Classroom trên iOS/Android cho đọc thông báo, bài và sửa tài liệu đã tải trước theo tài liệu chính thức.',
  'Giáo trình này không cần dịch vụ tập trung khi đọc gói, nhưng không thay chức năng LMS về tài khoản và sổ điểm. Cả bản giấy lẫn phần mềm đều có chi phí biên soạn, bảo trì và phân phối; không dùng zero-cost. Tài liệu Moodle được tìm thấy qua nguồn chính thức nhưng truy cập trực tiếp bị chặn, nên không mở rộng kết luận về từng chức năng offline.'
]);
add('So sánh và đánh giá','Mười điểm mạnh, ba nhóm','Điểm mạnh thiết kế được phân biệt với kết quả thẩm định.','cards',{
  cards:[card('Kỹ thuật — 4','Ngoại tuyến; phân lớp; pipeline; hai tầng mô phỏng.'),card('Học thuật — 3','Khung QA; truy vết; ledger review.'),card('Người dùng — 3','Tiếp cận; PDF giữ ngữ cảnh; GIF fallback.')]
},'Các cơ chế tạo nền tảng kiểm soát chất lượng, không thay kết quả kiểm tra.', ['README.md','docs/system-architecture.md','data/academic_review_ledger.json','data/qa-gates.json'],[
  'Bốn điểm kỹ thuật là tài nguyên cục bộ, phân lớp trách nhiệm, pipeline nội dung và hai tầng mô phỏng. Ba điểm tổ chức chất lượng là khung QA, liên kết truy vết và ledger review. Ba điểm người dùng là cơ chế tiếp cận, giữ ngữ cảnh PDF và fallback GIF.',
  'Không gọi QA cấp công nghiệp như một chứng nhận hoặc mặc định chất lượng tuyệt đối. Những điểm mạnh là cơ chế quan sát được giúp quản lý rủi ro; vẫn phải kiểm lại thực thi và xem bằng chứng chấp nhận. Khả năng chuyển giao cần thử trên học phần khác.'
]);
add('So sánh và đánh giá','Hạn chế theo mức ảnh hưởng','Ưu tiên đề xuất: chấp nhận học thuật và tính đúng của bản nguồn trước mở rộng.','cards',{
  cards:[card('Cao — 2','Chưa ký duyệt học thuật; chưa chạy LMS đích.','red'),card('Trung bình — 4','DOCX; môi trường QA; Sim3 pilot; PDF giới hạn.'),card('Thấp — 2',`Bundle ${(pagesBytes/1048576).toFixed(2)} MiB; một số mục Chương 3 đã loại.`)]
},'Nguồn mô phỏng mới còn pending; mức ảnh hưởng là đánh giá đề xuất.', ['data/acceptance-report.json','data/lms-targets.json','data/simulation-current-revalidation.json','README.md','js/pages.js'],[
  'Hai hạn chế ưu tiên cao là thiếu chấp nhận học thuật chính thức và thiếu bằng chứng chạy liên thông LMS thật. Bốn điểm trung bình gồm phụ thuộc nguồn DOCX, QA cần bộ công cụ dev, phạm vi Sim3 pilot và PDF chưa search/thumbnail/annotation.',
  `Hai điểm còn lại là bundle pages.js ${pagesBytes} byte và các mục bài tập Chương 3 VII-4 đến VII-6 đã loại khỏi phạm vi. Phân hạng này là đề xuất biên tập, chưa phải đánh giá rủi ro được đơn vị phê duyệt. Nguồn mô phỏng mới còn cần kiểm lại nên không được sử dụng như bản đạt đầy đủ.`
]);
add('So sánh và đánh giá','Năm rủi ro và cách xử lý','Ước lượng định tính để ưu tiên; chưa có dữ liệu xác suất.','table',{
  headers:['Rủi ro','Ảnh hưởng','Biện pháp'],rows:[['DOCX thay đổi','Lệch nguồn–đầu ra','Tái tạo và kiểm nội dung'],['WebGL không hỗ trợ','Không dùng được 3D','Giữ Sim2 và kiểm fallback'],['Nội dung lỗi thời','Sai học thuật','Review, phiên bản, signoff'],['Bundle lớn','Chậm tải ban đầu','Đo trên máy đích rồi tối ưu'],['Mất localStorage','Mất dữ liệu tự học','Hướng dẫn lưu/chuyển, thiết kế backup']]
},'Biện pháp dự kiến không phải tính năng đã có; không tự nhận export/import JSON.', ['README.md','data/academic_review_ledger.json','data/simulation-current-revalidation.json'],[
  'Năm rủi ro gồm lệch nội dung sau sửa DOCX, thiếu WebGL, học thuật lỗi thời, thời gian tải bundle và mất dữ liệu cục bộ. Biện pháp đã có về thiết kế như fallback và pipeline cần kiểm thực thi; biện pháp mới như backup phải được ghi là đề xuất.',
  'Chưa có thống kê xác suất nên không trình bày Cao/Trung bình/Thấp như số liệu đo. Tối ưu bundle phải dựa vào thời gian mở và mức sử dụng bộ nhớ trên máy đích. Không tuyên bố đã có export/import JSON khi chưa có bằng chứng về giao diện và phạm vi dữ liệu đó.'
]);
add('Tác động và khuyến nghị','Tác động giáo dục cần kiểm chứng','Giá trị kỳ vọng đối với ba nhóm, không phải hiệu quả đã đo.','cards',{
  cards:[card('Học viên','Đọc ngoại tuyến; quan sát mô hình; tự kiểm tra.'),card('Giảng viên','Sửa nguồn; đối chiếu học liệu và câu hỏi.'),card('Nhà trường','Thí điểm triển khai và tái sử dụng pipeline.')]
},'Cần nghiên cứu người học để kết luận hiệu quả, chi phí và khả năng nhân rộng.', ['data/presentation-specification.json','data/learning-outcomes.json','README.md'],[
  'Đối với học viên, giá trị kỳ vọng là tiếp cận học liệu trong điều kiện hạn chế kết nối và quan sát những đại lượng cơ học khó thấy trong trang giấy. Đối với giảng viên, nguồn DOCX và truy vết hỗ trợ cập nhật, nhưng tái tạo và QA vẫn cần phối hợp kỹ thuật.',
  'Đối với nhà trường, khả năng phân phối cục bộ và tái sử dụng quy trình là hướng đáng thí điểm. Chưa có số liệu trước–sau, nhóm đối chứng hoặc tổng chi phí sở hữu để kết luận tăng chất lượng đào tạo hay tiết kiệm tiền. Cần kế hoạch đo lường riêng, bảo đảm quyền riêng tư người học.'
]);
add('Tác động và khuyến nghị','Sáu bài học có thể chuyển giao','Nguyên tắc thực hành, không phải kết luận tổng quát từ thử nghiệm giáo dục.','cards',{
  cards:[card('01 · Offline','Không đánh đổi chất lượng vì thiếu mạng.'),card('02 · Pipeline','Sửa nguồn rồi tái tạo đầu ra.'),card('03 · Truy vết','Thiết kế liên kết từ đầu.'),card('04 · Tiếp cận','Viết điều kiện kiểm rõ ràng.'),card('05 · Release','Gắn phiên bản và hash.'),card('06 · Trung thực','Giữ nguyên fail, blocked và giới hạn.')]
},'Nhân rộng quy trình kiểm chứng trước khi nhân rộng số lượng tính năng.', ['README.md','docs/docx-sync-pipeline.md','data/acceptance-report.json'],[
  'Sáu bài học là lựa chọn thiết kế rút ra từ hiện vật: giữ chất lượng trong kiến trúc ngoại tuyến, tự động hóa tái tạo, tạo truy vết sớm, có điều kiện tiếp cận rõ, quản lý phiên bản và trung thực về trạng thái.',
  'Đây là kinh nghiệm tổ chức dự án, không chứng minh mọi giáo trình phải dùng cùng công nghệ. Khi chuyển sang môn khác phải rà soát nguồn, cấu trúc, mô hình đặc thù và quyền sử dụng tài nguyên; pipeline không đảm bảo thay nội dung là dùng được ngay.'
]);
add('Tác động và khuyến nghị','Roadmap đề xuất: ba giai đoạn','Mốc tương đối từ khi kế hoạch được đơn vị phê duyệt.','cards',{
  cards:[card('0–3 tháng','Sửa fail; revalidate; review học thuật, tiếp cận, smoke, Word.'),card('3–6 tháng','Thử Moodle/Canvas; mở 3D khi có giá trị sư phạm.'),card('6–12 tháng','Đo tải; nâng PDF; thí điểm học phần khác.')]
},'Ưu tiên đóng điều kiện chấp nhận; không mở rộng 3D chỉ để tăng số lượng.', ['data/acceptance-report.json','data/simulation-current-revalidation.json','data/lms-targets.json','NghienCuuLamSlideMoi.txt'],[
  'Giai đoạn ngắn hạn tập trung sửa các finding, kiểm nguồn mô phỏng hiện tại và hoàn thiện review độc lập, bao gồm học thuật, tiếp cận, smoke và Word round-trip. Cần thống nhất người chịu trách nhiệm và điều kiện kết thúc trước khi bắt đầu.',
  'Trung hạn thí điểm liên thông trên hai nền tảng đích và lựa chọn chỗ mở rộng Sim3 theo nhu cầu sư phạm. Dài hạn gồm đo hiệu năng, nâng trải nghiệm PDF và thử chuyển giao. Những mốc này là đề xuất, không phải tiến độ đã được cấp nguồn lực hoặc phê duyệt.'
]);
add('Tác động và khuyến nghị','KPI: baseline và mục tiêu đề xuất','Mỗi mục tiêu cần định nghĩa cách đo, người xác nhận và bản nguồn.','table',{
  headers:['Chỉ số','Baseline hồ sơ','Mục tiêu đề xuất','Mốc'],rows:[['QA thực tế','11/24 pass','24/24, đủ evidence','0–3 tháng'],['Review tiếp cận','Blocked','Hoàn tất độc lập','0–3 tháng'],['Academic signoff',`${signoffs} bản ghi`,'Đủ phạm vi duyệt','0–3 tháng'],['Mô phỏng','25 vị trí; 10 3D','Giữ đúng; mở có căn cứ','3–6 tháng'],['LMS đích','Chưa có run','2 đích có evidence','3–6 tháng'],['Học phần áp dụng','1 hiện vật','Thí điểm tới 3 môn','6–12 tháng']]
},'Mục tiêu không phải cam kết; 25 vị trí và 10 bản 3D không cộng thành 35 bài.', ['data/acceptance-report.json','data/academic_signoffs.json','data/lms-targets.json','js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js'],[
  `Baseline QA lấy từ snapshot ${acceptance.generatedAt}; không phải kết quả chạy lại nguồn mới. Mục tiêu 24/24 chỉ có giá trị khi đủ ràng buộc bằng chứng và điều kiện review, không phải đơn giản sửa trạng thái trong JSON.`,
  'Chỉ số mở rộng mô phỏng không đặt 40+ bài vì 3D là bản tăng cường của 2D; trước hết giữ tính đúng rồi mới mở rộng. Các mục tiêu về hai LMS và ba học phần là đề xuất để thảo luận nguồn lực. Tác động học tập cần một chỉ số nghiên cứu riêng, không thay bằng đếm tài nguyên.'
]);
add('Tác động và khuyến nghị','Năm khuyến nghị cho hội đồng','Đề nghị thống nhất ưu tiên và điều kiện chuyển bước.','table',{
  headers:['Ưu tiên','Khuyến nghị'],rows:[['1 · Học thuật','Review độc lập và signoff đúng thẩm quyền'],['2 · Tiếp cận','Kiểm thủ công, thiết bị và người dùng'],['3 · Liên thông','Thử LMS đích, ghi bằng chứng nhập/chạy'],['4 · Chuyển giao','Thí điểm môn khác với nguồn lực rõ'],['5 · Minh bạch','Không nâng trạng thái bằng lời thuyết minh']]
},'Đề nghị tiếp tục hoàn thiện có điều kiện, chưa đề nghị nghiệm thu cuối cùng.', ['data/acceptance-report.json','data/presentation-specification.json','NghienCuuLamSlideMoi.txt'],[
  'Khuyến nghị thứ nhất và thứ hai là hoàn thiện review độc lập về học thuật và khả năng tiếp cận. Khuyến nghị thứ ba yêu cầu minh chứng thực tế trên LMS đích thay vì chỉ có tệp chuẩn. Thứ tư là chuyển giao qua thí điểm, không sao chép kỳ vọng giữa các môn.',
  'Khuyến nghị cuối giữ nguyên nguyên tắc trung thực về giới hạn. Sửa hồ sơ hoặc dựng slide không đóng được gate fail hay blocked. Đề nghị hội đồng ghi nhận hiện vật và thống nhất lộ trình hoàn thiện; quyền chấp nhận cuối cùng thuộc quy trình riêng của đơn vị.'
]);
add('Kết thúc','Kết luận: ba luận điểm','Có hiện vật kỹ thuật; cần review độc lập; có hướng chuyển giao.','cards',{
  cards:[card('Khả thi về thiết kế','Gói cục bộ và runtime tĩnh đã được xây dựng.','green'),card('Chưa đủ chấp nhận','QA còn fail; review vẫn bị chặn.','red'),card('Có hướng nhân rộng','Tái sử dụng quy trình qua thí điểm.')]
},'Tiếp tục đầu tư vào bằng chứng và thẩm định trước khi mở rộng phạm vi.', ['data/acceptance-report.json','data/simulation-current-revalidation.json','data/release-candidate.json'],[
  'Ba luận điểm khép lại báo cáo: kiến trúc và gói phát hành cho thấy có cơ sở kỹ thuật, hồ sơ hiện tại chưa đủ chấp nhận học thuật, và quy trình có thể là nền tảng chuyển giao sau thí điểm.',
  'Kết luận không phải chứng nhận mọi tính năng ngoại tuyến đã pass hoặc hiệu quả giáo dục đã được chứng minh. Hành động thiết thực là kiểm bản nguồn hiện tại, sửa finding và tổ chức review độc lập để tạo bằng chứng mà hội đồng có thể kiểm lại.'
]);
add('Kết thúc','CẢM ƠN HỘI ĐỒNG\nQ & A','Trao đổi về bằng chứng, phạm vi sử dụng và ưu tiên hoàn thiện.','closing',{
  cards:[card('Kho mã nguồn','github.com/xuan2261/\nGiaoTrinhDienTu_CoHocLyThuyet'),card('Trang dự phòng','33 · Vòng đời tải bài\n34 · Danh mục mô phỏng')]
},'Sẵn sàng đối chiếu nguồn; không suy đoán thay bằng chứng còn thiếu.', ['README.md','NghienCuuLamSlideMoi.txt'],[
  'Cảm ơn hội đồng đã lắng nghe. Tôi xin nhận các câu hỏi về căn cứ kỹ thuật, phạm vi học thuật và cách ưu tiên đầu tư. Những câu hỏi cần số liệu khảo sát hoặc kiểm chứng mới sẽ được ghi lại thay vì trả lời bằng ước lượng chưa có nguồn.',
  'Hai trang dự phòng tiếp theo trình bày vòng đời loader và danh mục tất cả vị trí mô phỏng. Có thể mở chúng khi cần làm rõ kiến trúc hoặc phạm vi; không trình bày như bằng chứng runtime đã pass ở bản nguồn mới.'
]);
add('Dự phòng cho Q&A','Chi tiết kiến trúc và vòng đời bài','PAGE_MAP, fragment, render toán, mount và dispose.','table',{
  headers:['Bước','Cơ chế và điều kiện'],rows:[['Nhận route','Chuẩn hóa pageId; tra ánh xạ bài'],['Tải fragment','Dùng bundle cục bộ hoặc tải HTML'],['Cập nhật bài','Gắn nội dung vào vùng đọc'],['Render toán','KaTeX và nội dung công thức'],['Mount mô phỏng','Tra SIM_MAP theo base route'],['Rời bài','Dispose để giải phóng tài nguyên']]
},'Vòng đời phải chống listener, RAF và DOM còn sót khi đổi route.', ['js/loader.js','js/pages.js','README.md','data/simulation-current-revalidation.json'],[
  'Loader đóng vai trò điều phối nội dung và runtime. Từ route, nó tìm fragment hoặc nội dung bundle rồi cập nhật bài. Công thức được render và mô phỏng được mount theo base route. Hợp đồng SIM_MAP trả về factory với dispose là điểm cần kiểm khi điều hướng.',
  'Khi đổi bài phải giải phóng listener, observer, RAF và DOM thuộc mô phỏng. PDF giữ route là một đường trạng thái riêng cần kiểm để không dispose nhầm. Đây là giải thích mã thiết kế; nguồn mới cần bằng chứng revalidation về vòng đời và fallback, không được coi các capture cũ là xác nhận.'
]);
add('Dự phòng cho Q&A','Danh mục đầy đủ mô phỏng','25 vị trí Sim2 · ký hiệu 3D đánh dấu 10 bản tăng cường trên cùng bài.','routes',{
  columns:[1,2,3].map((chapter,index)=>({title:['Chương 1 · Tĩnh học (10)','Chương 2 · Động học (7)','Chương 3 · Động lực học (8)'][index],items:sim2.filter(r=>r.chapter===chapter).map(r=>`${r.id} · ${r.name}${pilotIds.has(r.id)?' [3D]':''}`)}))
},'Bản 3D nằm trong tập 25 vị trí; danh mục không chứng minh đạt chất lượng mô hình.', ['js/sim2/sim2-route-manifest.js','js/sim3/sim3-route-manifest.js','data/simulation-specifications.json'],[
  'Phụ lục liệt kê đầy đủ 25 vị trí cơ sở theo ba chương: 10 Tĩnh học, 7 Động học và 8 Động lực học. Ký hiệu 3D chỉ những vị trí có bản Three.js thử nghiệm; tất cả vẫn thuộc tập bài 2D.',
  `Mười vị trí có Sim3: ${sim3.map(r=>`${r.id} — ${sim2.find(s=>s.id===r.id).name}`).join('; ')}. Phạm vi được đọc trực tiếp từ manifest; chất lượng mô hình, giả thiết và tính đúng phải xem đặc tả và evidence đúng bản nguồn.`
]);
module.exports = {meta,slides};
