'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const A = 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets';
const REPORT = 'BaoCao_KhoaHoc_GiaoTrinhDienTu_CoHocLyThuyet_DaChinhSua.docx';
const OUTLINE = 'DeCuongChiTietNop_DaChinhSua.docx';
const loadJson = relativePath => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));

const contentManifest = loadJson('data/content-manifest.json');
const acceptance = loadJson('data/acceptance-report.json');
const releaseCandidate = loadJson('data/release-candidate.json');
const releaseSummary = loadJson(releaseCandidate.summaryPath);
const candidateManifestPath = path.posix.join(path.posix.dirname(releaseCandidate.summaryPath), releaseSummary.manifest.path);
const candidateManifest = loadJson(candidateManifestPath);
const lmsTargets = loadJson('data/lms-targets.json');
const academicSignoffs = loadJson('data/academic_signoffs.json');
const learningOutcomes = loadJson('data/learning-outcomes.json');
const equationMapping = loadJson('data/equation_mapping.json');
const simulationSpecifications = loadJson('data/simulation-specifications.json').specifications;
const sim3Reviews = loadJson('data/sim3-pedagogical-reviews.json').reviews;
const quizBanks = [1, 2, 3].map(chapter => loadJson(`data/quiz-ch${chapter}.json`));
const quizCounts = quizBanks.map(bank => bank.items.length);
const quizCount = quizCounts.reduce((total, count) => total + count, 0);
const gifCount = candidateManifest.files.filter(file => path.posix.extname(file.path).toLowerCase() === '.gif').length;
const mediaExtensions = ['.aac', '.aif', '.aiff', '.avi', '.flac', '.m4a', '.m4v', '.mkv', '.mov', '.mp3', '.mp4', '.mpeg', '.mpg', '.ogg', '.ogv', '.opus', '.wav', '.webm', '.wma'];
const inventoriedMediaCount = candidateManifest.files.filter(file => mediaExtensions.includes(path.posix.extname(file.path).toLowerCase())).length;

const routes = contentManifest.routes;
const chapterCounts = [1, 2, 3].map(chapter => routes.filter(route => route.routeId === `ch${chapter}` || route.routeId.startsWith(`ch${chapter}-`)).length);
const supportingRoutes = routes.length - chapterCounts.reduce((sum, count) => sum + count, 0);
const figureCount = new Set(routes.flatMap(route => route.figureRefs || [])).size;
const equationOccurrenceCount = routes.reduce((sum, route) => sum + (route.equationRefs || []).length, 0);
const formatMb = bytes => new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(bytes / 1_000_000);
const formatMib = bytes => new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(bytes / 1_048_576);
const shortHash = hash => `${hash.slice(0, 12)}…${hash.slice(-10)}`;

const authors = [
  'TS Nguyễn Lê Văn — Chủ biên',
  'ThS Đinh Văn Tứ — Tham gia biên soạn',
  'ThS Bùi Thanh Xuân — Tham gia biên soạn',
];

const outcomeDescriptions = {
  'lo-course-foundation': 'Nhận diện cấu trúc học phần và nguồn học liệu',
  'lo-ch1-statics': 'Phân tích lực, mô men, liên kết và cân bằng',
  'lo-ch2-kinematics': 'Xác định đại lượng và quan hệ chuyển động',
  'lo-ch3-dynamics': 'Giải bài toán lực, động lượng, năng lượng và va chạm',
};
const outcomeLabels = {
  'lo-course-foundation': 'Định hướng học phần',
  'lo-ch1-statics': 'Tĩnh học',
  'lo-ch2-kinematics': 'Động học',
  'lo-ch3-dynamics': 'Động lực học',
};
const outcomeVerbs = {
  'lo-course-foundation': 'nhận diện',
  'lo-ch1-statics': 'phân tích',
  'lo-ch2-kinematics': 'xác định',
  'lo-ch3-dynamics': 'giải',
};
const outcomeConditions = {
  'lo-course-foundation': 'Khi sử dụng và điều hướng giáo trình điện tử',
  'lo-ch1-statics': 'Với một bài toán tĩnh học vật rắn',
  'lo-ch2-kinematics': 'Với dữ liệu chuyển động của chất điểm hoặc vật rắn',
  'lo-ch3-dynamics': 'Với một hệ cơ học và các giả thiết đã nêu',
};
const outcomeCriteria = {
  'lo-course-foundation': 'nhận diện cấu trúc học phần và nguồn học liệu của cả ba chương',
  'lo-ch1-statics': 'phân tích lực, mô men, liên kết, cân bằng, ma sát và trọng tâm bằng nội dung Chương 1',
  'lo-ch2-kinematics': 'xác định đại lượng động học và quan hệ chuyển động bằng nội dung Chương 2',
  'lo-ch3-dynamics': 'giải quan hệ lực, động lượng, năng lượng và va chạm bằng nội dung Chương 3',
};

const gateLabels = {
  'academic-review-currentness': 'Thẩm định học thuật độc lập',
  'accessibility-independent-review': 'Đánh giá khả năng tiếp cận độc lập',
  'release-independent-smoke': 'Chạy thử độc lập trên thiết bị thật',
  'word-standalone-roundtrip': 'Đối sánh vòng lặp Word độc lập',
};

const gateEvidence = {
  'academic-review-currentness': 'Quyết định học thuật do chuyên gia/đơn vị thẩm định ký',
  'accessibility-independent-review': 'Biên bản kiểm tra trình đọc màn hình, bàn phím và khả năng hiển thị lại khi phóng to',
  'release-independent-smoke': 'Phiếu chạy file:// và HTTP trên thiết bị thật',
  'word-standalone-roundtrip': 'Biên bản đối sánh mức giữ nguyên nội dung và định dạng của tệp Word',
};
const failedGateLabels = {
  'gif-release': 'Ảnh động và ảnh dự phòng',
  'media-pilot': 'Gói đa phương tiện thử nghiệm',
  'pdf-release': 'Trình đọc PDF và gói phát hành',
  'phase-08-accessibility': 'Kiểm tra khả năng tiếp cận tự động',
  'quiz-browser': 'Câu hỏi trên trình duyệt',
  'sim-mount': 'Khởi tạo và hiển thị mô phỏng',
  'sim-physics': 'Bộ kiểm tra vật lý mô phỏng',
  'sim-release': 'Bộ kiểm tra phát hành mô phỏng',
  'sim3-pilot': 'Mô phỏng 3D thử nghiệm',
};

const academicSignoffRecords = Array.isArray(academicSignoffs.records) ? academicSignoffs.records : [];
const signedOutcomeIds = new Set(
  academicSignoffRecords
    .map(record => record.learningOutcomeId || record.outcomeId || record.subjectId)
    .filter(Boolean),
);
const academicSignoffCount = academicSignoffRecords.length;
const provisionalOutcomeCount = learningOutcomes.learningOutcomes.filter(outcome => (
  outcome.status === 'provisional' || outcome.authorityStatus === 'provisional'
)).length;
const allOutcomesProvisional = provisionalOutcomeCount === learningOutcomes.learningOutcomes.length;
const academicReviewGate = acceptance.gates.find(gate => gate.gateId === 'academic-review-currentness');
const academicReviewStatus = academicReviewGate ? academicReviewGate.status : 'not-run';
const academicStatusSummary = {
  total: learningOutcomes.learningOutcomes.length,
  pass: signedOutcomeIds.size,
  fail: 0,
  blocked: learningOutcomes.learningOutcomes.length - signedOutcomeIds.size,
  notRun: 0,
};
const blockedGates = acceptance.gates.filter(gate => gate.status === 'blocked');
const failedGates = acceptance.gates.filter(gate => gate.status === 'fail');
const observedDates = acceptance.gates.map(gate => gate.observedAt.slice(0, 10));
const snapshotDate = [...new Set(observedDates)].sort((left, right) => (
  observedDates.filter(date => date === right).length - observedDates.filter(date => date === left).length
))[0];
const latestEvidenceDate = [...observedDates].sort().at(-1);
const findQuiz = id => {
  for (const bank of quizBanks) {
    const item = bank.items.find(candidate => candidate.id === id);
    if (item) return item;
  }
  throw new Error(`Representative quiz item not found: ${id}`);
};
const representativeQuizItems = [
  ['Tĩnh học', findQuiz('quiz-ch1-005'), 'Cường độ lực và khoảng cách vuông góc'],
  ['Động học', findQuiz('quiz-ch2-026'), 'Kéo theo quay và vrel ≠ 0'],
  ['Động lực học', findQuiz('quiz-ch3-018'), 'Dính vào nhau, cùng vận tốc'],
].map(([label, item, conciseAnswer]) => [label, item.question, conciseAnswer, item.sourceRef]);
const samplePresentations = [
  {
    id: 'ch1-6-3',
    chapter: 'Tĩnh học',
    route: 'ch1-6-3',
    title: 'Tọa độ trọng tâm diện tích',
    formula: 'x̄ = Σ(Aᵢxᵢ)/ΣAᵢ; ȳ = Σ(Aᵢyᵢ)/ΣAᵢ',
    check: 'Phần khoét dùng diện tích có dấu âm trong phép tính.',
    image: `${A}/sim-live-ch1-6-3.png`,
    diagram: `${A}/so-do-trong-tam.svg`,
    source: 'tests/sim2-ch1-physics.test.js',
  },
  {
    id: 'ch2-4-4',
    chapter: 'Động học',
    route: 'ch2-4-4',
    title: 'Thành phần gia tốc Coriolis',
    formula: 'aCor = 2(ω × vrel)',
    magnitudeFormula: '|aCor| = 2ω|vrel| khi ω ⟂ vrel',
    check: 'Trường hợp phẳng: ω ⟂ vrel nên |aCor| = 2ω|vrel|. Đây là một thành phần, không phải toàn bộ gia tốc.',
    image: `${A}/sim-live-ch2-4-4.png`,
    diagram: `${A}/so-do-coriolis.svg`,
    source: 'tests/sim2-ch2-physics.test.js',
  },
  {
    id: 'ch3-6-2',
    chapter: 'Động lực học',
    route: 'ch3-6-2',
    title: 'Va chạm thẳng một chiều',
    formula: 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
    check: 'Với 0 ≤ e ≤ 1; tổng động lượng bảo toàn khi xung lực ngoài theo phương va chạm không đáng kể.',
    image: `${A}/sim-live-ch3-6-2.png`,
    diagram: `${A}/so-do-va-cham.svg`,
    source: 'tests/sim2-ch3-physics.test.js',
  },
];

const meta = {
  title: 'Báo cáo kết quả xây dựng Giáo trình điện tử Cơ học lý thuyết',
  subject: 'Báo cáo kết quả xây dựng học liệu số phục vụ Hội đồng',
  authors,
  request: 'Đề nghị Hội đồng ghi nhận việc đã xây dựng hiện vật và cho ý kiến hoàn thiện; không đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành',
  totalTime: '12:00',
  sessionTime: '15:00',
  bufferTime: '3:00',
};

const slides = [
  {
    id: 1,
    type: 'cover',
    time: '0:45',
    speaker: 'Nguyễn Lê Văn',
    title: 'Kết quả xây dựng\nGiáo trình điện tử\nCơ học lý thuyết',
    kicker: 'GIÁO TRÌNH ĐIỆN TỬ CƠ HỌC LÝ THUYẾT',
    takeaway: 'Báo cáo sản phẩm đã xây dựng, giá trị hỗ trợ dạy–học có thể quan sát và các nội dung xin góp ý.',
    sourceId: 'KQ-TONG-QUAN',
    image: `${A}/img-01-trang-chu-desktop-1440x1000.png`,
    illustrations: samplePresentations.map(sample => ({
      label: sample.chapter,
      image: sample.diagram.replace(/\.svg$/, '.png'),
    })),
    script: [
      'Nhóm tác giả báo cáo kết quả xây dựng Giáo trình điện tử Cơ học lý thuyết.',
      'Nội dung tập trung vào hiện vật đã xây dựng, cách tổ chức học tập, ba ca đối chiếu khoa học và những điểm cần Hội đồng góp ý.',
    ],
    sources: [`${REPORT}#1.3–1.4`, `${OUTLINE}#QC.8`, 'README.md', 'data/content-manifest.json'],
  },
  {
    id: 2,
    type: 'problemSolution',
    time: '0:55',
    speaker: 'Nguyễn Lê Văn',
    title: 'Từ kiến thức trừu tượng đến thao tác tự học',
    takeaway: 'Nội dung → quan sát → thao tác → phản hồi: thiết kế giúp người học đối chiếu quan hệ cơ học trong cùng ngữ cảnh.',
    sourceId: 'KQ-NHU-CAU',
    problems: [
      ['Quan hệ vectơ khó quan sát', 'Dấu, chiều và giả thiết cần được đặt gần công thức'],
      ['Hình tĩnh không thể hiện biến thiên', 'Cần thấy đại lượng thay đổi khi tham số thay đổi'],
      ['Tự học cần phản hồi', 'Người học cần tự đối chiếu lựa chọn và xem lại nội dung'],
      ['Tài nguyên cần được kết nối', 'Bài học, mô phỏng, câu hỏi và PDF nên ở cùng môi trường'],
    ],
    solutions: [
      ['Đặt biểu diễn cạnh nhau', 'Đặt hình, công thức, giả thiết và đơn vị cùng ngữ cảnh'],
      ['Cho phép thao tác', 'Thay đổi tham số và xem giá trị hiển thị theo mô hình'],
      ['Tự kiểm tra có giải thích', 'Phản hồi lựa chọn và dẫn về phần kiến thức liên quan'],
      ['Một luồng học thống nhất', 'Kết nối nội dung, mô phỏng, câu hỏi và tài liệu đối chiếu'],
    ],
    script: [
      'Bốn điểm này là nhu cầu mà nhóm tác giả dùng để định hướng thiết kế học liệu.',
      'Đây là cơ sở thiết kế, không phải tuyên bố rằng hiệu quả học tập đã được chứng minh.',
    ],
    sources: [`${REPORT}#1.3`, `${OUTLINE}#QC.1–QC.5`, 'README.md', 'data/content-manifest.json', 'data/simulation-specifications.json'],
  },
  {
    id: 3,
    type: 'coverage',
    time: '0:55',
    speaker: 'Nguyễn Lê Văn',
    title: 'Một học liệu số cho ba mạch kiến thức',
    takeaway: 'Số liệu mô tả phạm vi hiện vật: Tĩnh học, Động học, Động lực học; không tự chứng minh chất lượng hay hiệu quả học tập.',
    sourceId: 'KQ-QUY-MO',
    metrics: [
      [String(routes.length), 'mục/trang hiển thị'],
      [String(figureCount), 'tham chiếu hình duy nhất'],
      [equationOccurrenceCount.toLocaleString('vi-VN'), 'tham chiếu công thức'],
      [String(quizCount), 'câu tự kiểm tra'],
    ],
    chapters: [
      [String(chapterCounts[0]), 'Tĩnh học', 'Lực, mô men, cân bằng, ma sát và trọng tâm'],
      [String(chapterCounts[1]), 'Động học', 'Chuyển động điểm, vật rắn và hợp chuyển động'],
      [String(chapterCounts[2]), 'Động lực học', 'Lực, động lượng, năng lượng và va chạm'],
    ],
    supportingRoutes,
    image: `${A}/hinh-100-he-luc-khong-gian.png`,
    script: [
      'Kết quả tổng thể là một học liệu số gồm các mục và trang hiển thị cho ba mạch kiến thức chính của học phần.',
      `Manifest ghi ${routes.length} mục/trang hiển thị: ${chapterCounts[0]} thuộc Chương 1, ${chapterCounts[1]} thuộc Chương 2, ${chapterCounts[2]} thuộc Chương 3 và ${supportingRoutes} mục bổ trợ.`,
    ],
    sources: [`${REPORT}#1.2–1.4`, `${OUTLINE}#QC.1; QC.8`, 'data/content-manifest.json', 'data/quiz-ch1.json', 'data/quiz-ch2.json', 'data/quiz-ch3.json'],
  },
  {
    id: 4,
    type: 'journey',
    time: '1:00',
    speaker: 'Nguyễn Lê Văn',
    title: 'Vòng học hỗ trợ tự học',
    takeaway: 'Thiết kế hướng tới vòng học gồm định hướng, nội dung, quan sát hoặc thao tác, tự kiểm tra và điều chỉnh.',
    sourceId: 'KQ-VONG-HOC',
    steps: [
      ['01', 'Định hướng', 'Xác định nội dung và nhiệm vụ học tập'],
      ['02', 'Học nội dung', 'Đọc lý thuyết, công thức, hình và giả thiết'],
      ['03', 'Quan sát', 'Xem hoặc thay đổi tham số trong mô phỏng'],
      ['04', 'Tự kiểm tra', 'Nhận phản hồi ngay sau khi chọn câu trả lời'],
      ['05', 'Điều chỉnh', 'Quay lại nội dung; lưu tiến độ, ghi chú và dấu trang'],
    ],
    image: `${A}/img-01-trang-chu-desktop-1440x1000.png`,
    script: [
      'Thiết kế hướng tới một vòng học thay vì chỉ trình bày nội dung theo tuyến.',
      'Khả năng vận hành xuyên suốt và hiệu quả đối với người học chưa được xác nhận; câu hỏi tự kiểm tra không phải phép đo chính thức về mức đạt chuẩn đầu ra.',
    ],
    sources: [`${REPORT}#1.3; 2.3; 2.6`, `${OUTLINE}#QC.4–QC.5`, 'data/learning-outcomes.json', 'data/content-learning-map.json', 'data/quiz-learning-map.json', 'README.md'],
  },
  {
    id: 5,
    type: 'qrExperience',
    time: '0:45',
    speaker: 'Nguyễn Lê Văn',
    title: 'Trải nghiệm hiện vật',
    takeaway: 'Mã QR mở bản web để trình diễn; bản web chưa được chứng minh đồng nhất với ứng viên đang kiểm tra.',
    sourceId: 'KQ-TRAI-NGHIEM',
    url: 'https://xuan2261.github.io/GiaoTrinhDienTu_CoHocLyThuyet/',
    qrImage: `${A}/qr-code-online-textbook.png`,
    image: `${A}/qr-code-online-textbook.png`,
    features: [
      ['01', 'Đọc nội dung', 'Xem cấu trúc ba chương, hình, công thức và tài liệu đối chiếu'],
      ['02', 'Quan sát mô phỏng', 'Thay đổi tham số và xem giá trị hiển thị theo mô hình'],
      ['03', 'Tự kiểm tra', 'Làm câu hỏi và nhận phản hồi trong cùng môi trường'],
      ['04', 'Giới hạn', 'Chưa chứng minh đồng nhất với ứng viên đang kiểm tra; không thay thế kiểm tra gói ứng viên'],
    ],
    script: [
      'Kính mời Hội đồng quét mã để xem bản web dùng cho trình diễn.',
      'Bản web chưa được chứng minh đồng nhất với ứng viên đang kiểm tra; việc trình diễn không thay thế kiểm tra gói ứng viên qua file hoặc HTTP.',
    ],
    sources: [`${REPORT}#1.4; 4.1`, `${OUTLINE}#QC.8`, 'README.md', 'data/content-manifest.json'],
  },
  {
    id: 6,
    type: 'scientificSample',
    time: '0:40',
    speaker: 'Đinh Văn Tứ',
    title: 'Ca đối chiếu khoa học 1 · Trọng tâm diện tích',
    takeaway: 'Với hình phẳng ghép, tọa độ trọng tâm diện tích được tính từ tổng mô men diện tích; phần khoét dùng diện tích có dấu âm.',
    sourceId: 'KQ-KHOA-HOC-1',
    image: samplePresentations[0].image,
    sample: samplePresentations[0],
    reviewBoundary: 'Ca minh họa · chưa thẩm định độc lập',
    diagram: samplePresentations[0].diagram,
    script: ['Ca Tĩnh học đặt sơ đồ, công thức và giá trị hiển thị cạnh nhau; ca này chưa thẩm định độc lập.', 'Hội đồng có thể đối chiếu bằng tính đối xứng, giới hạn tọa độ và phép cộng diện tích có dấu của hình cụ thể.'],
    sources: [`${REPORT}#3.2–3.4`, `${OUTLINE}#QC.3`, 'data/simulation-specifications.json', samplePresentations[0].source],
  },
  {
    id: 7,
    type: 'scientificSample',
    time: '0:40',
    speaker: 'Đinh Văn Tứ',
    title: 'Ca đối chiếu khoa học 2 · Gia tốc Coriolis',
    takeaway: 'Mô phỏng thể hiện aCor = 2(ω × vrel); aCor, ω và vrel đều là vectơ. Đây không phải toàn bộ gia tốc.',
    sourceId: 'KQ-KHOA-HOC-2',
    image: samplePresentations[1].image,
    sample: samplePresentations[1],
    reviewBoundary: 'Ca minh họa · chưa thẩm định độc lập',
    diagram: samplePresentations[1].diagram,
    script: ['Ca Động học cho phép đối chiếu chiều của omega, vận tốc tương đối và tích có hướng; ca này chưa thẩm định độc lập.', 'Trong mô hình phẳng đang xét, omega vuông góc với vận tốc tương đối nên độ lớn là 2ω|vrel|; trường hợp tổng quát phải nhân thêm sin của góc giữa hai vectơ. Đây là thành phần Coriolis, không phải toàn bộ gia tốc.'],
    sources: [`${REPORT}#3.2–3.4`, `${OUTLINE}#QC.3`, 'data/simulation-specifications.json', samplePresentations[1].source],
  },
  {
    id: 8,
    type: 'scientificSample',
    time: '0:40',
    speaker: 'Đinh Văn Tứ',
    title: 'Ca đối chiếu khoa học 3 · Va chạm thẳng một chiều',
    takeaway: 'Trong mô hình va chạm thẳng một chiều thụ động, tổng động lượng được bảo toàn khi xung lực ngoài theo phương va chạm không đáng kể.',
    sourceId: 'KQ-KHOA-HOC-3',
    image: samplePresentations[2].image,
    sample: samplePresentations[2],
    reviewBoundary: 'Ca minh họa · chưa thẩm định độc lập',
    diagram: samplePresentations[2].diagram,
    script: ['Ca Động lực học đặt tổng động lượng, vận tốc có dấu và hệ số phục hồi trong cùng một tình huống; ca này chưa thẩm định độc lập.', 'Phát biểu chỉ áp dụng cho mô hình va chạm thẳng một chiều thụ động với xung lực ngoài theo phương va chạm không đáng kể.'],
    sources: [`${REPORT}#3.2–3.4`, `${OUTLINE}#QC.3`, 'data/simulation-specifications.json', samplePresentations[2].source],
  },
  {
    id: 9,
    type: 'demoMain',
    time: '1:30',
    speaker: 'Bùi Thanh Xuân',
    title: 'Minh họa thao tác · Mô men của lực',
    takeaway: 'Trong ca cố định θ = 90°, với F = 50 N và d⊥ = 4,00 m, M_O = +200 N·m nếu quy ước ngược chiều kim đồng hồ là dương.',
    sourceId: 'KQ-THAO-TAC',
    image: `${A}/img-04-mo-men-ch1-1-4-1440x1000.png`,
    formula: 'M_O = Fd⊥ = rF sin90° = +200 N·m',
    steps: [
      ['00:00–00:15', 'Mở bài', 'Chương 1 › Mô men của lực'],
      ['00:15–00:30', 'Xác định hình học', 'Điểm O cố định; θ = 90°; d⊥ là khoảng cách vuông góc'],
      ['00:30–01:00', 'Thay đổi cánh tay đòn', 'Giữ F = 50 N; kéo điểm đặt lực đến d⊥ = 4,00 m'],
      ['01:00–01:15', 'Đọc kết quả', 'F = 50 N → M_O = +200 N·m'],
      ['01:15–01:30', 'Đối chiếu nguồn', 'Mở PDF cục bộ, đối chiếu công thức rồi quay lại bài'],
    ],
    script: ['Điểm O và phương lực được giữ cố định; đặt F bằng 50 N rồi kéo điểm đặt lực đến d vuông góc bằng 4 mét để đọc mô men dương 200 N·m.', 'Mở PDF cục bộ để đối chiếu công thức rồi quay lại bài; mô phỏng không minh họa đổi θ hoặc đổi dấu mô men.'],
    sources: [`${REPORT}#3.2; 4.1`, `${OUTLINE}#QC.3`, `${A}/img-04-mo-men-ch1-1-4-1440x1000.png`, 'js/sim2/sims/ch1/ch1-1-4.js', 'data/simulation-specifications.json', 'CoHocLyThuyet.pdf'],
  },
  {
    id: 10,
    type: 'methodology',
    time: '0:55',
    speaker: 'Bùi Thanh Xuân',
    title: 'Từ nguồn chuẩn đến gói có thể kiểm tra',
    takeaway: 'Tạo hiện vật → kiểm chứng → phê duyệt: ba việc riêng, có đầu ra để đối chiếu.',
    sourceId: 'KQ-PHUONG-PHAP',
    nodes: ['Chốt mục tiêu', 'Thiết kế mô hình', 'Sản xuất, tích hợp', 'Kiểm tra, chỉnh sửa', 'Đóng gói, xin duyệt'],
    cards: [
      ['Mô phỏng · Phụ lục 20', `${simulationSpecifications.length} vị trí 2D; ${sim3Reviews.length} trong số đó có 3D thử nghiệm. Mô hình → trạng thái → hình → đối chiếu nghiệm.`],
      ['Đa phương tiện · Phụ lục 21', `${gifCount} GIF có PNG dự phòng. Video/âm thanh là phương án bổ sung sau khi duyệt phạm vi, không phải kết quả đã làm.`],
      ['Đóng gói · Phụ lục 22', 'Web tĩnh và tài nguyên cục bộ → ZIP, phiên bản, SHA-256. Kiểm gói không thay kiểm trên LMS hoặc phê duyệt.'],
      ['Tra cứu, tự đánh giá · Phụ lục 23', `Chỉ mục tiếng Việt và ${quizCount} câu phản hồi cục bộ hỗ trợ tự học; không phải sổ điểm hay bằng chứng đạt đầu ra.`],
    ],
    notice: 'Luồng tổ chức đề xuất; thử người học và phê duyệt độc lập chưa được xác nhận hoàn tất.',
    script: [
      'Sơ đồ gom quy trình thành năm nhóm việc, không xác nhận mọi bước đã hoàn tất: chủ biên chốt phạm vi, chuyên gia duyệt mô hình, kỹ thuật tạo hiện vật và QA lưu bằng chứng đúng gói.',
      'Pipeline kỹ thuật bắt đầu từ nguồn và dữ liệu có thẩm quyền: nội dung Word được trích xuất rồi đối chiếu; câu hỏi, GIF và mô phỏng được biên soạn hoặc sản xuất riêng, không tự sinh hết từ Word.',
      'Phụ lục 20–23 giải thích mô phỏng, đa phương tiện, đóng gói và tra cứu/tự đánh giá. Sau kiểm tra còn phải thử người học theo kế hoạch, tiếp thu chỉnh sửa và trình đơn vị có thẩm quyền; demo không thay các bước này.',
    ],
    sources: [`${REPORT}#1.3–1.5; 2.5–2.8; 3.1–3.3`, `${OUTLINE}#QC.1–QC.9`, 'data/simulation-specifications.json', 'data/sim3-pedagogical-reviews.json', 'data/quiz-ch1.json', 'data/quiz-ch2.json', 'data/quiz-ch3.json', candidateManifestPath],
  },
  {
    id: 11,
    type: 'resultLimits',
    time: '1:00',
    speaker: 'Bùi Thanh Xuân',
    title: 'Kết quả đã có và giới hạn còn lại',
    takeaway: 'Hiện vật mức ứng viên đã hình thành; vận hành xuyên suốt, hiệu quả học tập, xác nhận học thuật và phát hành chưa được xác nhận.',
    sourceId: 'KQ-VA-GIOI-HAN',
    results: [
      ['Hiện vật', 'Học liệu số cho ba mạch kiến thức đã được xây dựng ở mức ứng viên'],
      ['Cấu trúc', 'Nội dung, mô phỏng và tự kiểm tra đã được bố trí trong cùng học liệu'],
      ['Đối chiếu', 'Có dữ liệu phạm vi và ba ca minh họa để Hội đồng xem xét'],
    ],
    limitations: [
      'Chưa có ký xác nhận học thuật độc lập trong hồ sơ hiện hành.',
      `${provisionalOutcomeCount}/${learningOutcomes.learningOutcomes.length} chuẩn đầu ra vẫn là dự kiến sơ bộ.`,
      'Chưa có dữ liệu chứng minh hiệu quả học tập đối với người học.',
      `${acceptance.gateSummary.fail} phép kiểm tra trong snapshot dừng vì môi trường thiếu Chromium; ${acceptance.gateSummary.blocked} thẩm định hoặc kiểm tra độc lập chưa thể thực hiện.`,
    ],
    script: ['Báo cáo phân biệt hiện vật đã được xây dựng ở mức ứng viên với những nội dung chưa đủ bằng chứng.', 'Ba ca chỉ là ví dụ để Hội đồng đối chiếu, chưa phải bằng chứng chấp nhận học thuật; trạng thái phát hành được trình bày tại phụ lục.'],
    sources: [`${REPORT}#1.4; 5.2; 6.3`, `${OUTLINE}#QC.7–QC.8`, 'data/academic_signoffs.json', 'data/learning-outcomes.json', 'data/acceptance-report.json'],
  },
  {
    id: 12,
    type: 'conditions',
    time: '1:00',
    speaker: 'Bùi Thanh Xuân',
    title: 'Bốn nội dung xin ý kiến góp ý',
    takeaway: 'Nhóm tác giả xin góp ý dựa trên các ca khoa học, vòng học, điều kiện–tiêu chí đầu ra và ba câu hỏi đại diện đang hiển thị.',
    sourceId: 'KQ-XIN-Y-KIEN',
    conditions: [
      ['01', 'Tính đúng khoa học', 'Công thức, giả thiết, đơn vị, mô hình và giới hạn áp dụng'],
      ['02', 'Cách tổ chức học', 'Trình tự nội dung, mức dễ hiểu, thao tác và phản hồi'],
      ['03', 'Đầu ra và câu hỏi', 'Xem điều kiện và tiêu chí tại Phụ lục 14; xem ba câu hỏi đại diện bên dưới'],
      ['04', 'Nội dung cần hoàn thiện', 'Điểm cần sửa, bổ sung minh chứng hoặc điều chỉnh cách trình bày'],
    ],
    quizExamples: representativeQuizItems,
    nextStep: 'Ý kiến của Hội đồng là căn cứ để nhóm tác giả tiếp tục chỉnh sửa và hoàn thiện sản phẩm.',
    script: ['Nhóm tác giả xin góp ý theo bốn nhóm để việc tiếp thu rõ ràng và có thể kiểm tra lại.', 'Điều kiện và tiêu chí của bốn đầu ra nằm tại Phụ lục 14; ba câu hỏi đại diện chỉ là mẫu để góp ý, không chứng minh mức đạt chuẩn đầu ra.'],
    sources: [`${REPORT}#1.3; 2.3; 6.2`, `${OUTLINE}#QC.3; QC.5; QC.7`, 'data/learning-outcomes.json', 'data/quiz-ch1.json', 'data/quiz-ch2.json', 'data/quiz-ch3.json', 'data/academic_signoffs.json'],
  },
  {
    id: 13,
    type: 'decision',
    time: '1:15',
    speaker: 'Nguyễn Lê Văn',
    title: 'Đề nghị ghi nhận việc xây dựng hiện vật',
    takeaway: 'Đề nghị ghi nhận việc đã xây dựng hiện vật và cho ý kiến; không đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành.',
    sourceId: 'KQ-DE-NGHI',
    decisionCards: [
      ['GHI NHẬN VIỆC XÂY DỰNG', 'Hiện vật học liệu số cho ba mạch kiến thức đã được tạo lập ở mức ứng viên.'],
      ['CHO Ý KIẾN CHUYÊN MÔN', 'Góp ý về tính đúng khoa học, cách tổ chức học và mức dễ hiểu.'],
      ['ĐỊNH HƯỚNG HOÀN THIỆN', 'Nêu các nội dung cần sửa, bổ sung hoặc tiếp tục kiểm chứng.'],
    ],
    minuteText: 'Dự thảo biên bản: Hội đồng ghi nhận nhóm tác giả đã xây dựng hiện vật giáo trình điện tử ở mức ứng viên và đề nghị tiếp thu ý kiến để hoàn thiện; phiên họp này không kết luận chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành.',
    script: ['Nhóm tác giả kính đề nghị Hội đồng ghi nhận việc đã xây dựng hiện vật giáo trình điện tử và cho ý kiến cụ thể để tiếp tục hoàn thiện.', 'Phiên này không đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành sản phẩm.'],
    sources: [`${REPORT}#1.4–1.5; 6.5`, `${OUTLINE}#QC.7–QC.9`, 'data/academic_signoffs.json', 'data/learning-outcomes.json', 'data/acceptance-report.json'],
  },
  {
    id: 14,
    type: 'outcomes',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Bốn chuẩn đầu ra dự kiến',
    takeaway: 'Bốn chuẩn đầu ra đang được dùng làm khung liên kết nội dung; toàn bộ vẫn ở trạng thái sơ bộ và chưa có ký xác nhận.',
    sourceId: 'PL-CHUAN-DAU-RA',
    outcomes: learningOutcomes.learningOutcomes.map(outcome => [
      outcomeLabels[outcome.id],
      `${outcome.title} · ${outcomeVerbs[outcome.id]}`,
      `Điều kiện: ${outcomeConditions[outcome.id]}. Tiêu chí: ${outcomeCriteria[outcome.id]}.`,
      'sơ bộ',
    ]),
    notice: 'Sơ bộ · không có ngoại lệ đánh giá được khai báo · cần cơ sở đào tạo xác nhận trước bản cuối.',
    script: ['Dùng khi Hội đồng cần xem nội dung và trạng thái của từng chuẩn đầu ra dự kiến.', `Hồ sơ hiện hành có ${academicSignoffCount} ký xác nhận; cả bốn chuẩn còn sơ bộ và không có ngoại lệ đánh giá được khai báo.`],
    sources: [`${REPORT}#Ma trận chuẩn đầu ra`, `${OUTLINE}#QC.5; QC.8`, 'data/learning-outcomes.json', 'data/academic_signoffs.json'],
  },
  {
    id: 15,
    type: 'validation',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Phạm vi của ba ca đối chiếu khoa học',
    takeaway: 'Ba ca đối chiếu khoa học, mỗi chương một ca, là mẫu để xem xét sâu; chưa được thẩm định độc lập và không đại diện cho toàn bộ học liệu.',
    sourceId: 'PL-BA-CA-KHOA-HOC',
    layers: [
      ['1', 'Mẫu được chọn', 'Mỗi chương một ca đối chiếu khoa học để xem xét sâu'],
      ['2', 'Nội dung kiểm tra', 'Công thức, giả thiết, đơn vị, dấu và giới hạn'],
      ['3', 'Phạm vi kết luận', 'Không suy rộng kết quả sang mọi mục và mọi bài'],
      ['4', 'Ý kiến chuyên gia', 'Ghi rõ phần đã xem và đề nghị chỉnh sửa'],
    ],
    limitations: ['Ảnh chụp khi mô phỏng đang chạy chỉ ghi một trạng thái, không bao phủ mọi tham số', 'Kiểm thử kỹ thuật không tự xác nhận diễn giải sư phạm', 'Ba ca chưa được thẩm định độc lập và không phải nghiên cứu hiệu quả học tập'],
    script: ['Dùng để ngăn suy rộng quá mức từ ba ca minh họa.', 'Mọi kết luận phải ghi rõ phạm vi đã xem và những phần chưa được lấy mẫu.'],
    sources: [`${REPORT}#3.4`, `${OUTLINE}#QC.3; QC.7`, 'data/simulation-specifications.json', 'data/academic_signoffs.json'],
  },
  {
    id: 16,
    type: 'gateDetails',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Tình trạng hồ sơ học thuật',
    takeaway: `Hiện có ${academicSignoffCount} hồ sơ ký xác nhận; các nội dung học thuật vẫn chờ thẩm định và ghi nhận có thẩm quyền.`,
    sourceId: 'PL-HO-SO-HOC-THUAT',
    rows: [
      ['Ký xác nhận chuẩn đầu ra', `${academicSignoffCount}/${learningOutcomes.learningOutcomes.length}`, 'Xác nhận hoặc sửa từng chuẩn đầu ra dự kiến', 'data/academic_signoffs.json'],
      ['Đánh giá tính đúng khoa học', 'Chờ thẩm định', 'Ghi phạm vi, nội dung đã xem, nhận xét và đề nghị', 'academic-review-currentness'],
      ['Đánh giá cách tổ chức học', 'Chưa có mục ghi nhận', 'Xem vòng học, cách giải thích và phản hồi tự kiểm tra', 'learning-outcomes + academic records'],
      ['Ý kiến của Hội đồng', 'Chưa có mục ghi nhận', 'Ghi kết quả được công nhận và nội dung cần hoàn thiện', 'academic record'],
    ],
    script: ['Dùng như checklist hồ sơ còn phải tạo hoặc hoàn tất.', 'Không đánh dấu hoàn tất nếu chỉ có kiểm thử tự động hoặc trình diễn hiện vật.'],
    sources: [`${REPORT}#Ma trận chuẩn đầu ra; 6.2`, `${OUTLINE}#QC.7–QC.8`, 'data/academic_signoffs.json', 'data/learning-outcomes.json', 'data/acceptance-report.json'],
  },
  {
    id: 17,
    type: 'artifact',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Trạng thái kỹ thuật và phát hành',
    takeaway: `Snapshot lịch sử: ${acceptance.gateSummary.total} cổng, ${acceptance.gateSummary.pass} đạt · ${acceptance.gateSummary.fail} không đạt · ${acceptance.gateSummary.blocked} chưa thể thực hiện. Nền ${snapshotDate}; cập nhật ${latestEvidenceDate}; không phải QA mới.`,
    sourceId: 'PL-TRANG-THAI-KY-THUAT',
    releaseVersion: releaseCandidate.releaseVersion,
    packageSha256: releaseCandidate.packageSha256,
    snapshotDate,
    latestEvidenceDate,
    metrics: [
      [String(acceptance.gateSummary.pass), 'điều kiện đạt'],
      [String(acceptance.gateSummary.fail), 'điều kiện không đạt'],
      [String(acceptance.gateSummary.blocked), 'chưa thể thực hiện'],
    ],
    hashes: [
      ['Quyết định hiện hành', 'Không chấp thuận phát hành'],
      ['Snapshot nền', snapshotDate],
      ['Cập nhật gần nhất', latestEvidenceDate],
      ['Bản đang kiểm tra', releaseCandidate.releaseVersion],
    ],
    failureQualification: `${acceptance.gateSummary.fail} trạng thái “không đạt” trong snapshot đều do môi trường thiếu Chromium nên Playwright không khởi động được; đây không phải bằng chứng rằng các kiểm tra vật lý hoặc chức năng tương ứng đã thất bại.`,
    derivatives: [
      ['QTI 3', path.basename(releaseCandidate.derivatives.find(item => item.path.includes('qti3')).path), 'Gói thử nghiệm câu hỏi; không phải bằng chứng nhập thành công vào LMS'],
      ['Common Cartridge 1.4', path.basename(releaseCandidate.derivatives.find(item => item.path.includes('common-cartridge')).path), 'Gói nội dung web; không phải bằng chứng nhập thành công vào LMS'],
    ],
    script: ['Phụ lục này chỉ dùng khi Hội đồng hỏi về trạng thái kỹ thuật và phát hành; đây là snapshot lịch sử, quyết định hiện hành vẫn không chấp thuận phát hành.', `Snapshot nền ngày ${snapshotDate} ghi ${acceptance.gateSummary.pass} điều kiện đạt, ${acceptance.gateSummary.fail} không đạt và ${acceptance.gateSummary.blocked} chưa thể thực hiện; bằng chứng mô phỏng được làm mới ngày ${latestEvidenceDate}, không đồng nghĩa toàn bộ ${acceptance.gateSummary.total} cổng đã chạy lại.`],
    sources: [`${REPORT}#1.4; 2.8; 5.1–5.2`, `${OUTLINE}#QC.6; QC.8`, 'data/acceptance-report.json', 'data/release-candidate.json', 'evidence/command-captures'],
  },
  {
    id: 18,
    type: 'releaseGates',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Kiểm tra dừng và hồ sơ còn bị chặn',
    takeaway: `Snapshot lịch sử ghi ${acceptance.gateSummary.fail} trạng thái không đạt do thiếu Chromium; ${acceptance.gateSummary.blocked} nội dung độc lập cần đúng người và đúng bằng chứng.`,
    sourceId: 'PL-DIEU-KIEN-KY-THUAT',
    failedRows: failedGates.map(gate => [
      failedGateLabels[gate.gateId] || gate.gateId,
      'DỪNG DO MÔI TRƯỜNG',
      gate.gateId === 'sim-physics'
        ? 'Thiếu Chromium ở bước trình duyệt; không được diễn giải là các phép kiểm tra vật lý đã thất bại'
        : 'Nhật ký ghi Playwright không tìm thấy Chromium; cần chạy lại trong môi trường đủ trình duyệt',
      gate.gateId,
    ]),
    rows: blockedGates.map(gate => [gateLabels[gate.gateId] || gate.gateId, 'CHƯA THỂ THỰC HIỆN', gateEvidence[gate.gateId] || path.basename(gate.artifact), gate.gateId]),
    script: ['Dùng khi cần giải thích đầy đủ chín trạng thái không đạt và bốn nội dung chưa thể thực hiện.', 'Phân biệt lỗi môi trường chạy kiểm thử với thất bại của phép kiểm tra; không coi việc trình diễn là bằng chứng thay thế.'],
    sources: [`${REPORT}#1.4; 5.2; 6.2`, `${OUTLINE}#QC.7–QC.8`, 'data/acceptance-report.json'],
  },
  {
    id: 19,
    type: 'qa',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Hỏi đáp ngắn theo dữ liệu hiện hành',
    takeaway: 'Trả lời đúng phạm vi dữ liệu; phân biệt kết quả xây dựng, ý kiến học thuật và trạng thái phát hành.',
    sourceId: 'PL-HOI-DAP',
    questions: [
      ['Sản phẩm đã được chấp nhận học thuật chưa?', `Chưa. Có ${academicSignoffCount} ký xác nhận và thẩm định học thuật chưa hoàn tất.`],
      ['Bốn chuẩn đầu ra đã chính thức chưa?', `Chưa. ${provisionalOutcomeCount}/${learningOutcomes.learningOutcomes.length} chuẩn vẫn là dự kiến sơ bộ.`],
      ['Ba ca đối chiếu khoa học cho thấy điều gì?', 'Cho phép đối chiếu mẫu về mô hình, công thức và giá trị hiển thị; không đại diện cho toàn bộ học liệu.'],
      ['Hội đồng được đề nghị làm gì?', 'Ghi nhận việc đã xây dựng hiện vật và cho ý kiến để nhóm tác giả hoàn thiện.'],
      ['Báo cáo này có đề nghị phát hành không?', 'Không. Trạng thái phát hành được trình bày riêng tại Slide 17–18.'],
      ['Khi nào có thể cập nhật kết luận?', `Học thuật: chỉ khi có bằng chứng được ủy quyền. Phát hành: chỉ sau khi chạy lại đủ ${acceptance.gateSummary.total} điều kiện, không còn “không đạt”, “chưa thể thực hiện” hoặc “chưa chạy”.`],
    ],
    script: ['Dùng khi cần trả lời nhanh mà không vượt quá dữ liệu.', 'Nếu câu hỏi đòi kết luận ngoài phạm vi nguồn đã dẫn, ghi nhận để Hội đồng yêu cầu thêm minh chứng.'],
    sources: [`${REPORT}#1.4; 6.2–6.5`, `${OUTLINE}#QC.7–QC.8`, 'data/academic_signoffs.json', 'data/learning-outcomes.json', 'data/acceptance-report.json'],
  },
  {
    id: 20,
    type: 'methodology',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Mô phỏng từ mô hình đến kiểm chứng',
    takeaway: 'Mô hình đúng trước, hình trực quan sau; kiểm nghiệm và biên trước kết luận.',
    sourceId: 'PL-PP-MO-PHONG',
    nodes: ['Bài toán, giả thiết', 'Tính toán, trạng thái', 'Hình 2D / 3D', 'Thao tác, thời gian', 'Đối chiếu, tích hợp'],
    cards: [
      ['2D là lớp cơ sở', `${simulationSpecifications.length} vị trí 2D bằng SVG/JavaScript; tham số, hình và giá trị hiển thị dùng cùng trạng thái tính toán.`],
      ['3D là lớp thử nghiệm', `${sim3Reviews.length} vị trí trong số đó có Three.js/WebGL; không cộng thành ${simulationSpecifications.length + sim3Reviews.length} bài. Lỗi khởi tạo/vẽ 3D phải báo và về Sim2.`],
      ['4D chỉ theo nghĩa 3D+t', 'Chỉ dùng khi có diễn biến thời gian và tiêu chí kiểm. Đổi tham số tĩnh không tự động là 4D; nhịp vẽ không chứng minh sai số tính.'],
      ['Kiểm mô hình trước kết luận', 'Đối chiếu nghiệm độc lập, trường hợp chuẩn/biên, đơn vị, dấu và tương đương 2D/3D; chuyên gia duyệt giá trị vật lý, sư phạm.'],
    ],
    notice: '3D vẫn là thử nghiệm; kiểm kỹ thuật không thay thẩm định khoa học–sư phạm độc lập.',
    script: [
      'Chuyên gia nêu bài toán, giả thiết, hệ quy chiếu, tham số và miền áp dụng trước khi kỹ thuật nối hàm tính/trạng thái với hình học, điều khiển và giá trị hiển thị.',
      'Sim2 là đường cơ sở. Sim3 dựng trục, vật thể, quỹ đạo và vectơ bằng Three.js từ trạng thái bài toán; không có căn cứ nói đã dùng Blender, Unity, Unreal hay nguồn glTF.',
      'Đồng hồ fixed-step 1/60 s là nhịp cập nhật, không phải phương pháp tính áp dụng chung. RK4 chỉ dùng cho bài toán ODE phù hợp. Chỉ gọi 3D+t khi có chuỗi trạng thái theo thời gian; thử nghiệm 3D chưa được phê duyệt sư phạm độc lập.',
    ],
    sources: [`${REPORT}#1.3–1.5; 3.1–3.3`, `${OUTLINE}#QC.3; QC.8–QC.9`, 'data/simulation-specifications.json', 'data/sim3-pedagogical-reviews.json'],
  },
  {
    id: 21,
    type: 'methodology',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · GIF hiện có, video và âm thanh đề xuất',
    takeaway: 'GIF đã có; video và âm thanh chỉ là phương án bổ sung sau khi duyệt phạm vi.',
    sourceId: 'PL-PP-DA-PHUONG-TIEN',
    nodes: ['Mục tiêu, kịch bản', 'Dựng / ghi, thu âm', 'Khung hình / dựng', 'Duyệt, thay thế', 'Xuất, kiểm ngoại tuyến'],
    cards: [
      ['GIF · đã có tài nguyên', `${gifCount} GIF: dựng hình học/chuyển động bằng Python → khung hình → duyệt → xuất bản. PNG dự phòng hỗ trợ giảm chuyển động và lỗi tải.`],
      ['Video/âm thanh · kiểm kê giới hạn', `${inventoriedMediaCount} tệp trong danh mục gói ứng viên theo các đuôi đã kiểm kê. Bốn pilot đa phương tiện không phải bốn video; GIF không phải video.`],
      ['Bổ sung sau khi duyệt phạm vi', 'Kịch bản/lời đọc → ghi hình/thu âm → dựng, đồng bộ → duyệt cơ học, quyền dùng → MP4/H.264 + AAC; OBS/FFmpeg là lựa chọn đề xuất.'],
      ['Tiếp cận và ngoại tuyến', 'Phụ đề, bản chép lời, mô tả tương đương; người biên soạn kiểm thuật ngữ/đơn vị. Phát theo yêu cầu, không tự phát âm; đóng gói cục bộ.'],
    ],
    notice: 'Chưa ghi nhận video/âm thanh theo phạm vi kiểm kê; không đổi kết luận QA vì thêm thuyết minh.',
    script: [
      `Kiểm kê chỉ bao phủ danh mục gói ứng viên và ${mediaExtensions.length} đuôi: ${mediaExtensions.join(', ')}; không kết luận về mọi định dạng hoặc tệp ngoài danh mục.`,
      'GIF dùng PNG tham chiếu rồi dựng lại hình học/chuyển động bằng generate-gifs.py, xem contact sheet, duyệt vật lý/nhãn/trình tự rồi publish-gifs.py. Tài nguyên hiện diện không có nghĩa cổng GIF đã đạt.',
      'Video và âm thanh là nhánh đề xuất riêng. Ghi màn hình một mô phỏng đã kiểm đúng chỉ lưu một diễn biến được chọn, không thay thao tác đổi tham số. Phụ đề tự sinh phải được kiểm; xuất tệp và thử player trên thiết bị đích sau duyệt, không tính bốn prototype Chương 1 thành video.',
    ],
    sources: [`${REPORT}#1.3–1.5; 2.2; 2.5`, `${OUTLINE}#QC.2; QC.8–QC.9`, candidateManifestPath, 'data/media-pilot-manifest.json'],
  },
  {
    id: 22,
    type: 'methodology',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Gói web độc lập và giới hạn LMS',
    takeaway: 'Tạo ZIP ≠ kiểm LMS ≠ phê duyệt; mỗi bước cần bằng chứng riêng.',
    sourceId: 'PL-PP-DONG-GOI-LMS',
    nodes: ['Nguồn đã đồng bộ', 'Tập hợp tệp cho phép', 'Danh mục, mã kiểm', 'Kiểm tệp / ZIP', 'Gói ứng viên'],
    cards: [
      ['Gói chính · web tĩnh', 'HTML/CSS/JavaScript, thư viện và tài nguyên cục bộ; giải nén mở index.html hoặc dùng máy chủ web. ZIP không đồng nghĩa SCORM.'],
      ['QTI 3 / CC 1.4 · kiểm cục bộ', `QTI: câu một lựa chọn, tối đa ${lmsTargets.stages.qti3.maximumValidationItems} mục đã kiểm; CC 1.4: static webcontent. Kiểm adapter không chứng minh nhập/chạy hay lưu điểm LMS.`],
      ['SCORM / xAPI / cmi5 · chưa có', 'SCORM và xAPI/cmi5 chưa triển khai. Cần LMS/LRS đích, profile, danh tính/quyền riêng tư và minh chứng thực thi trước mở rộng.'],
      ['Phiên bản và thẩm quyền', 'Danh mục, SHA-256, nguồn/giấy phép và hướng dẫn gắn đúng gói. Sửa nguồn → tái tạo; lưu lịch sử. Phê duyệt độc lập là bước riêng.'],
    ],
    notice: 'Snapshot lịch sử vẫn không chấp thuận phát hành; sửa slide không tạo QA mới hoặc chứng minh liên thông.',
    script: [
      'tools/release/release.py sở hữu staging, danh mục, SHA-256, thông tin thư viện, kiểm staging và ZIP. Web tĩnh là nền tảng; ZIP là phương tiện phân phối, không tự tạo giao tiếp runtime với LMS.',
      `QTI 3 và Common Cartridge 1.4 ở mức adapter-validated; trạng thái liên thông là ${lmsTargets.status}, chưa có LMS đích hay bằng chứng nhập/chạy. QTI chỉ kiểm tối đa ${lmsTargets.stages.qti3.maximumValidationItems} câu một lựa chọn, không tuyên bố chuyển đủ ${quizCount} câu.`,
      'Nếu cần SCORM phải chọn edition theo LMS và yêu cầu completion/score/resume, xây manifest và runtime API rồi kiểm nhập–mở–học–lưu–mở lại. xAPI là trao đổi sự kiện; cmi5 là profile dùng trong LMS, không gọi xAPI là định dạng ZIP thay SCORM. Không bắt buộc triển khai mọi chuẩn khi nhu cầu không yêu cầu.',
    ],
    sources: [`${REPORT}#1.4–1.5; 2.3; 2.8`, `${OUTLINE}#QC.6; QC.8–QC.9`, 'data/lms-targets.json', 'data/release-candidate.json', 'data/acceptance-report.json'],
  },
  {
    id: 23,
    type: 'methodology',
    backup: true,
    time: 'backup',
    speaker: 'Nhóm tác giả',
    title: 'Phụ lục · Tra cứu và tự đánh giá đúng phạm vi',
    takeaway: 'Tra cứu và phản hồi hỗ trợ tự học; không thay đánh giá chuẩn đầu ra.',
    sourceId: 'PL-PP-TRA-CUU-DANH-GIA',
    nodes: ['Nội dung, mục tiêu', 'Chỉ mục / câu hỏi', 'Tra cứu / trả lời', 'Trích đoạn / phản hồi', 'Ôn lại, chỉnh sửa'],
    cards: [
      ['Tìm kiếm văn bản cục bộ', 'Tạo chỉ mục từ bài; hỗ trợ tiếng Việt có dấu/không dấu và đoạn liên quan. Không mặc nhiên tìm công thức ngữ nghĩa hoặc trong PDF.'],
      ['Tự kiểm tra trên trình duyệt', `${quizCount} câu có phản hồi đúng/sai và giải thích; kết quả/tiến độ lưu cục bộ, chưa có danh tính, sổ điểm hoặc đồng bộ LMS.`],
      ['Biên soạn và rà soát câu hỏi', 'Ma trận mục tiêu–nội dung–mức độ → câu hỏi/đáp án/phản hồi → phản biện → kiểm chấm → thử người học → phân tích, chỉnh sửa.'],
      ['Nếu dùng để đánh giá chính thức', 'Cần danh tính, lưu kết quả tin cậy, phân quyền và bảo vệ dữ liệu. Bài mô phỏng cho điểm cần rubric giảng viên duyệt, chưa tự chấm thao tác.'],
    ],
    notice: 'Số câu, lượt đọc không chứng minh đạt đầu ra hay hiệu quả học tập; thử người học chưa được xác nhận.',
    script: [
      'tools/build_search_index.py tạo chỉ mục, js/search.js xử lý truy vấn và route/anchor; khi chỉ mục không khả dụng có thông báo tìm theo mục lục. Sửa nội dung phải tái tạo chỉ mục và kiểm liên kết, không tự xóa finding của gói lịch sử.',
      'Câu hỏi được biên soạn riêng, có mục tiêu, đáp án và phản hồi; cần phản biện chuyên môn và thử người học trước kết luận chất lượng ngân hàng. Ngưỡng 70% trong dữ liệu là quy tắc kỹ thuật tự đánh giá, không phải chuẩn đạt học phần.',
      'Hoạt động mô phỏng có thể đi theo dự đoán → đổi tham số → quan sát → giải thích. Nếu chấm phải dùng rubric đã duyệt; localStorage và tiến độ mở trang không thay danh tính, điểm tin cậy hoặc dữ liệu nghiên cứu hiệu quả học tập.',
    ],
    sources: [`${REPORT}#1.3–1.5; 2.3; 2.6–2.7`, `${OUTLINE}#QC.4–QC.5; QC.8–QC.9`, 'data/quiz-ch1.json', 'data/quiz-ch2.json', 'data/quiz-ch3.json', 'data/learning-outcomes.json'],
  },
];
module.exports = {
  meta,
  slides,
  evidence: {
    contentManifest,
    acceptance,
    releaseCandidate,
    releaseSummary,
    academicSignoffs,
    learningOutcomes,
  },
};
