"""Add the approved presentation specification to a copy of the outline DOCX.

Only word/document.xml and word/styles.xml gain inserted XML. Original XML bytes,
ZIP members, relationships, numbering and cached fields are otherwise retained.
Microsoft Word must update the existing TOC/fields and export the submission PDF.
"""

import argparse
import os
import re
import tempfile
import zipfile
from copy import copy
from pathlib import Path
from xml.parsers import expat
from xml.sax.saxutils import escape

from lxml import etree

if __package__:
    from .generate_scientific_report_docx import load_evidence, presentation_snapshot
else:
    from generate_scientific_report_docx import load_evidence, presentation_snapshot


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "DeCuongChiTietNop.docx"
DEFAULT_OUTPUT = ROOT / "DeCuongChiTietNop_DaChinhSua.docx"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}
TITLE = "QUY CÁCH TRÌNH BÀY GIÁO TRÌNH ĐIỆN TỬ"
APPENDIX = (
    "PHỤ LỤC – KẾT QUẢ RÀ SOÁT MỨC ĐỘ ĐÁP ỨNG YÊU CẦU "
    "ĐỐI VỚI GIÁO TRÌNH ĐIỆN TỬ"
)
HISTORY_TITLE = "HỒ SƠ LỊCH SỬ – RC2026.08.25, cập nhật 26/8/2026"
HISTORY_NOTE = (
    "Phụ lục này ghi kết quả đối với RC 2026.08.25 và bộ bằng chứng cập nhật "
    "ngày 26/8/2026. Đây là hồ sơ lịch sử của phiên bản được nêu, không đại diện "
    "trạng thái mọi phiên bản về sau. Kết quả rà soát mới phải được lập riêng "
    "hoặc cập nhật đồng bộ theo đúng gói, thời điểm và bằng chứng tương ứng; "
    "không tự suy chuyển trạng thái đạt, chưa đạt hoặc đã nghiệm thu. Các số liệu, "
    "trạng thái, hình minh chứng, mã kiểm tra và ma trận trong phụ lục được giữ "
    "nguyên để bảo toàn hồ sơ lịch sử, không được dùng như kết luận hiện hành."
)
QA_NOTE = (
    "Ghi chú làm rõ thẩm quyền: Đoạn trên được giữ nguyên như kiến nghị của hồ sơ "
    "RC 2026.08.25. QA đạt chỉ là điều kiện kỹ thuật; kể cả khi sổ kiểm tra ghi "
    "24/24 pass, kết quả đó không tự tạo thẩm quyền công bố bản cuối, phê duyệt "
    "sử dụng hoặc nghiệm thu. Thẩm định học thuật, đánh giá khả năng tiếp cận "
    "và quyết định phê duyệt/nghiệm thu phải do chủ thể có thẩm quyền thực hiện "
    "với hồ sơ của đúng phiên bản. Bảng hiện trạng tại QC.8 không thay thế "
    "quyết định này và không cập nhật trạng thái của phụ lục lịch sử."
)
REFERENCES = (
    "Nguyễn Phong Điền, Bài tập Cơ học kỹ thuật, NXB Bách khoa Hà Nội, Hà Nội 2023.",
    "Nguyễn Văn Khang, Cơ học kỹ thuật, NXB Bách khoa Hà Nội, Hà Nội 2024.",
    "Đỗ Sanh, Cơ học kỹ thuật tập 1, 2, NXB Bách khoa Hà Nội, Hà Nội 2024.",
    "Đỗ Sanh, Bài tập Cơ học kỹ thuật tập 1, 2, NXB Bách khoa Hà Nội, Hà Nội 2025.",
)
STYLE_PREFIX = "PresentationRevision_"

# Approved requirements, not a claim that all of them have shipped.
SECTIONS = (
    (
        "QC.1. Cấu trúc và trình bày nội dung",
        (
            "Giáo trình được tổ chức theo chương, mục và tiểu mục thống nhất với "
            "đề cương chuyên môn. Mỗi chương thể hiện mục tiêu học tập, nội dung "
            "lý thuyết, ví dụ, câu hỏi ôn tập, bài tập và tài liệu tham khảo phù hợp. "
            "Mỗi tài nguyên bổ trợ được đặt tại nội dung có liên quan, ghi rõ mục "
            "đích sử dụng; không bổ sung hiệu ứng chỉ để tăng số lượng phương tiện.",
            "Văn bản dùng Unicode tiếng Việt, phân cấp tiêu đề rõ ràng, thống nhất "
            "thuật ngữ, ký hiệu và hệ đơn vị. Công thức cần thể hiện đúng véc tơ, "
            "chỉ số, phân số và số công thức; ưu tiên biểu diễn toán học có cấu trúc "
            "khi chuyển đổi được và đã đối chiếu với nguồn. Hình, bảng có số, tên, "
            "chú thích, nguồn hoặc thông tin quyền sử dụng; không để chữ trong hình "
            "quá nhỏ hoặc mất nét khi phóng to. Không áp một cỡ chữ pixel cố định "
            "cho mọi thiết bị. Bản điện tử phải cho phép điều chỉnh chữ và bố cục "
            "phù hợp màn hình; bản Word/PDF theo mẫu trình bày được cơ sở phê duyệt.",
        ),
    ),
    (
        "QC.2. Hình tĩnh, hình ảnh động, video và âm thanh",
        (
            "Hình tĩnh dùng PNG/JPEG hoặc SVG phù hợp nguồn; có văn bản thay thế "
            "diễn đạt ý nghĩa, không chỉ ghi tên tệp. Hình động dùng để mô tả biến "
            "đổi, chuyển động hoặc trình tự; có lựa chọn xem hình tĩnh, tôn trọng "
            "chế độ giảm chuyển động và không làm mất thông tin chính khi tắt hiệu ứng.",
            "Video và âm thanh là phương án bổ sung, lựa chọn theo mục tiêu sư phạm "
            "và chỉ sản xuất khi được duyệt phạm vi. Quy trình gồm lập kịch bản và "
            "bảng phân cảnh; chuẩn bị mô hình/thí nghiệm; quay hoặc ghi màn hình; "
            "thu lời thuyết minh; dựng và đồng bộ; kiểm tra chuyên môn; xuất bản và "
            "thử trên môi trường sử dụng. Có thể dùng OBS để ghi hình, công cụ dựng "
            "video và FFmpeg để mã hóa; đây là lựa chọn triển khai, không phải công "
            "cụ đã được xác nhận sử dụng trong dự án.",
            "Định dạng phân phối đề xuất là MP4 với hình H.264 và âm thanh AAC; "
            "âm thanh độc lập có thể dùng MP3/AAC. Đây là lựa chọn tương thích cần "
            "kiểm tra trên thiết bị đích, không phải chuẩn đóng gói giáo trình hoặc "
            "yêu cầu pháp lý. Video có lời nói cần phụ đề được rà soát; âm thanh có "
            "bản chép lời; thông tin hình ảnh quan trọng không có trong lời nói cần "
            "có mô tả tương đương. Có điều khiển phát, dừng, âm lượng và không tự "
            "phát âm thanh. Tệp phục vụ ngoại tuyến phải được đóng gói cục bộ; "
            "liên kết ngoài không được là đường truy cập duy nhất tới nội dung bắt buộc.",
            "Mỗi học liệu ghi tối thiểu mã, bài/mục sử dụng, mục tiêu, tác giả/nguồn, "
            "quyền sử dụng, phiên bản, tệp nguồn, tệp xuất bản, nội dung thay thế và "
            "trạng thái duyệt. Phụ đề tự sinh hoặc nội dung do AI hỗ trợ phải được "
            "người biên soạn kiểm tra, đặc biệt tên đại lượng, đơn vị và quan hệ vật lý.",
        ),
    ),
    (
        "QC.3. Mô phỏng 2D, 3D và thuật ngữ 4D",
        (
            "Mỗi mô phỏng xác định bài toán, mục tiêu, giả thiết, hệ quy chiếu, "
            "đơn vị, tham số vào, đại lượng ra, miền áp dụng và điều kiện biên. "
            "Phần tính toán phải nhất quán với lý thuyết; biểu diễn hình học không "
            "được thay thế mô hình vật lý. Người học có thể thao tác những tham số "
            "phù hợp và quan sát kết quả, kèm chỉ dẫn diễn giải.",
            "Phương án hiện hành là biểu diễn 2D bằng SVG và JavaScript; mô phỏng "
            "3D tăng cường sử dụng Three.js/WebGL với hệ trục, vật thể, véc tơ và "
            "máy ảnh quan sát. Dựng mô hình theo quan hệ hình học của bài toán, "
            "nối với trạng thái tính toán, sau đó xây dựng bộ điều khiển và thông "
            "tin kết quả. Không xác nhận đã dùng Blender, Unity, Unreal hoặc mô "
            "hình glTF nếu không có tệp nguồn và quy trình thực hiện tương ứng. "
            "Khi 3D không khả dụng, duy trì nội dung và tương tác thiết yếu bằng 2D.",
            "Ưu tiên tên gọi mô phỏng 3D tương tác, có diễn biến theo thời gian "
            "khi phù hợp. Trong hồ sơ chỉnh sửa, nếu dùng 4D thì chỉ theo nghĩa "
            "quy ước ba chiều không gian và thời gian, tức 3D+t; không phải định "
            "dạng tệp, công nghệ riêng hay bốn chiều không gian. Đổi tham số của "
            "bài toán tĩnh học không tự động là 4D. Chỉ công bố mức đáp ứng khi "
            "đã có bài toán, chuỗi trạng thái/thời gian, thao tác và tiêu chí kiểm "
            "chứng tương ứng; không yêu cầu mọi bài đều làm 3D/4D.",
            "Quy trình kiểm tra gồm đối chiếu kết quả với nghiệm giải tích hoặc "
            "dữ liệu tham chiếu độc lập, thử trường hợp chuẩn và biên, kiểm tra "
            "đơn vị/dấu và thao tác người dùng. Bài động học/động lực học có diễn "
            "biến thời gian phải nêu cách tính theo thời gian và giới hạn sai số; "
            "không đồng nhất tốc độ vẽ hình với độ chính xác của phương pháp tính. "
            "Chuyên gia xác nhận giá trị vật lý và sư phạm trước khi kết luận chấp nhận.",
        ),
    ),
    (
        "QC.4. Điều hướng, tra cứu và tìm kiếm",
        (
            "Giáo trình có mục lục phân cấp, thông tin vị trí hiện tại, điều hướng "
            "trước/sau và liên kết giữa lý thuyết với học liệu. Tìm kiếm thực hiện "
            "trên chỉ mục nội dung cục bộ, hỗ trợ chữ tiếng Việt có dấu và không "
            "dấu; kết quả chỉ rõ bài/mục, trích đoạn và vị trí liên quan. Phải "
            "thông báo khi không có kết quả hoặc khi chỉ còn chế độ tìm theo mục lục.",
            "Phạm vi tìm kiếm là nội dung văn bản đã được lập chỉ mục. Tìm trong "
            "trình đọc PDF và tìm kiếm công thức theo ngữ nghĩa là chức năng riêng, "
            "không mặc nhiên có khi giáo trình hỗ trợ toàn văn. Khi sửa nội dung "
            "phải tạo lại chỉ mục và kiểm tra liên kết kết quả; không sử dụng chỉ "
            "mục lỗi thời. Quan sát cây làm việc không tự xóa finding của gói lịch sử.",
        ),
    ),
    (
        "QC.5. Đánh giá trực tiếp người học",
        (
            "Ở phạm vi tự học, giáo trình cung cấp câu hỏi có đáp án, phản hồi "
            "đúng/sai, giải thích và liên hệ với nội dung cần ôn tập. Ngân hàng "
            "câu hỏi cần có mã định danh, chương/mục, mục tiêu hoặc chuẩn đầu ra, "
            "mức độ, đáp án và tình trạng duyệt. Quy tắc tính điểm, xử lý câu "
            "chưa trả lời, làm lại và lưu kết quả phải rõ ràng. Ngưỡng đạt trong "
            "dữ liệu tự đánh giá là quy tắc kỹ thuật, không tự trở thành chuẩn "
            "đạt học phần được phê duyệt.",
            "Quy trình xây dựng câu hỏi gồm lập ma trận mục tiêu–nội dung–mức độ "
            "→ biên soạn câu hỏi và phản hồi → phản biện đáp án → tích hợp và "
            "kiểm tra chấm → thử nghiệm với người học → phân tích câu hỏi và "
            "chỉnh sửa. Bài tập mô phỏng có thể tổ chức theo trình tự dự đoán → "
            "thay đổi tham số → quan sát → giải thích; cần rubric do giảng viên "
            "duyệt nếu dùng để cho điểm. Đây là phương án hoạt động học tập, "
            "không phải chức năng tự chấm thao tác mô phỏng đã có.",
            "Phải phân biệt tự đánh giá cục bộ với đánh giá chính thức. Khi yêu "
            "cầu đánh giá chính thức, cần xác định danh tính người học, lưu kết "
            "quả đáng tin cậy, quy tắc thi/kiểm tra, phân quyền, bảo vệ dữ liệu "
            "và hệ thống quản lý điểm; tích hợp LMS là một phương án triển khai "
            "theo phạm vi được duyệt, không thể thay bằng localStorage. Tiến độ "
            "mở/đọc trang không đồng nghĩa mức độ nắm vững kiến thức; nếu khẳng "
            "định hiệu quả học tập phải có thiết kế đánh giá và dữ liệu người học phù hợp.",
        ),
    ),
    (
        "QC.6. Chuẩn đóng gói và phạm vi liên thông",
        (
            "Gói bàn giao chính là ứng dụng web tĩnh HTML/CSS/JavaScript, tài "
            "nguyên và thư viện cục bộ, phân phối bằng ZIP; giải nén và mở "
            "index.html hoặc triển khai trên máy chủ web. Gói kèm danh mục tệp, "
            "phiên bản, mã kiểm tra SHA-256, thông tin nguồn/giấy phép và hướng "
            "dẫn sử dụng. ZIP là cách phân phối, HTML là nền tảng nội dung; "
            "hai yếu tố này không đồng nghĩa gói SCORM. Gói ứng viên không đồng "
            "nghĩa nghiệm thu bản cuối.",
            "QTI 3 phục vụ trao đổi câu hỏi/bài kiểm tra giữa các hệ thống hỗ "
            "trợ; Common Cartridge 1.4 phục vụ đóng gói và trao đổi cấu trúc/nội "
            "dung khóa học. Phạm vi kiểm cục bộ và các giới hạn hiện tại được "
            "ghi riêng tại QC.8. Kiểm adapter/gói cục bộ không chứng minh đã "
            "nhập/chạy trên LMS đích hoặc đã đồng bộ điểm.",
            "SCORM 1.2 hoặc một edition SCORM 2004 là phương án khi có yêu cầu "
            "giao tiếp nội dung–LMS để theo dõi học tập, chưa triển khai trong "
            "phạm vi hiện tại. Chỉ chọn phiên bản sau khi biết LMS đích và yêu "
            "cầu completion/score/resume. Nếu cơ sở yêu cầu SCORM, cần xây "
            "dựng manifest và gói đúng phiên bản, kết nối API runtime cho các "
            "chức năng được yêu cầu, ánh xạ hoàn thành/đạt/điểm/tiếp tục học "
            "và kiểm tra nhập–mở–học–lưu–mở lại trên LMS đích. Chỉ tải một ZIP "
            "lên LMS không chứng minh tích hợp SCORM hoặc ghi nhận điểm.",
            "xAPI mô tả trao đổi sự kiện học tập; cmi5 quy định cách dùng xAPI "
            "trong bối cảnh LMS. Đây là phương án chưa triển khai, cần LMS/LRS, "
            "hồ sơ người học, quyền riêng tư và bằng chứng chạy thực tế. Không "
            "gọi xAPI riêng lẻ là định dạng ZIP thay thế SCORM. Không buộc triển "
            "khai đồng thời QTI, Common Cartridge, SCORM và cmi5 nếu nhu cầu "
            "không yêu cầu; mọi mở rộng phải có quyết định phạm vi riêng.",
        ),
    ),
    (
        "QC.7. Khả năng tiếp cận và kiểm soát chất lượng",
        (
            "Thiết kế hỗ trợ bàn phím, focus nhìn thấy, độ tương phản, phóng "
            "to và bố cục trên màn hình hẹp; cung cấp nội dung thay thế cho "
            "hình/âm thanh/video và phương án giảm chuyển động. Dùng WCAG 2.2 "
            "làm tài liệu tham chiếu về thiết kế và đánh giá phù hợp phạm vi. "
            "Kiểm tra tự động, một lần quan sát giao diện hoặc đủ phụ đề "
            "không tạo ra chứng nhận tuân thủ toàn bộ WCAG.",
            "Chất lượng phải được kiểm tra ở ba lớp riêng: đúng nội dung "
            "chuyên môn; đúng chức năng/kỹ thuật; phù hợp hoạt động học tập. "
            "Hồ sơ bàn giao ghi rõ phạm vi, người kiểm, phiên bản, kết quả, "
            "lỗi còn mở và người phê duyệt. Khi cập nhật, sửa nguồn biên soạn "
            "hoặc dữ liệu có thẩm quyền, tái tạo đầu ra và kiểm lại phần bị "
            "ảnh hưởng; không vá rời bản sinh tự động khiến Word và web lệch nhau. "
            "QA đạt là điều kiện kỹ thuật, không thay phê duyệt hoặc nghiệm thu.",
        ),
    ),
)

PIPELINES = (
    (
        "Pipeline nội dung hiện có",
        "CoHocLyThuyet_Full_New.docx → phân tích cấu trúc, kiểm ánh xạ công thức "
        "và dữ liệu tham chiếu → tools/extract_docx.py → chapters/ và images/ "
        "→ tools/update_nav.py → tools/bundle_pages.py → tools/build_content_manifest.py "
        "và tools/validate_content_manifest.py → tools/build_search_index.py "
        "→ tools/audit.py. Câu hỏi được biên soạn trong data/quiz-*.json và tạo "
        "trang bằng tools/gen_quiz_pages.py; mô phỏng là mã/đặc tả riêng. "
        "Không phải mọi nội dung đa phương tiện đều tự sinh từ Word.",
    ),
    (
        "Pipeline GIF hiện có",
        "Chọn hình và ý nghĩa vật lý → dựng hình học và chuyển động bằng "
        "gif-conversion-workspace/generate-gifs.py → xem các khung đại diện/contact "
        "sheet → duyệt chuyên môn và kiểm tệp → gif-conversion-workspace/publish-gifs.py "
        "→ assets/gifs/ → ánh xạ và nút GIF/PNG. Không coi đây là quá trình "
        "biến một hình bất kỳ thành mô phỏng đúng vật lý bằng một thao tác tự động.",
    ),
    (
        "Pipeline mô phỏng",
        "Bài toán và mô hình → hàm tính/trạng thái → hình 2D hoặc hình học 3D "
        "→ điều khiển, giá trị hiển thị và thời gian khi có → đối chiếu nghiệm, "
        "biên và tính tương đương 2D/3D → tích hợp bài → lưu bằng chứng. "
        "Giữ phương trình và ngữ nghĩa chung giữa 2D/3D; một mô hình đẹp "
        "không đủ là mô phỏng đúng.",
    ),
    (
        "Pipeline video/âm thanh — phương án bổ sung",
        "Mục tiêu → kịch bản/lời đọc → chuẩn bị mô hình hoặc thí nghiệm → ghi "
        "hình/thu âm → dựng và đồng bộ → phụ đề/bản chép lời/mô tả → duyệt "
        "cơ học và quyền sử dụng → mã hóa → tích hợp player và kiểm ngoại "
        "tuyến. Chỉ thực hiện sau khi được duyệt phạm vi. Có thể ghi màn "
        "hình mô phỏng đã kiểm đúng để giải thích một hiện tượng; video "
        "chỉ ghi một diễn biến lựa chọn, không thay tương tác đổi tham số.",
    ),
    (
        "Pipeline đóng gói hiện có",
        "Nội dung đã đồng bộ → policy/danh sách tệp cho phép → staging → "
        "manifest, SHA-256, thông tin thư viện → kiểm staging → ZIP → kiểm "
        "ZIP → gói ứng viên. Công cụ sở hữu chuỗi đóng gói là "
        "tools/release/release.py. Phê duyệt và review độc lập là bước "
        "riêng; ZIP tạo thành công không chứng minh gói ứng viên đã được chấp nhận.",
    ),
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def paragraph(text, style="Body", page_break=False):
    page = '<w:pageBreakBefore/>' if page_break else ""
    return (
        f'<w:p><w:pPr><w:pStyle w:val="{STYLE_PREFIX}{style}"/>{page}</w:pPr>'
        f'<w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>'
    )


def new_styles(normal_id):
    definitions = (
        ("Title", "0", "center", "30", True, False, "0", "200"),
        ("Heading", "1", "left", "27", True, False, "240", "100"),
        ("Body", None, "both", "26", False, False, "0", "100"),
        ("Note", None, "both", "24", False, True, "80", "120"),
        ("Table", None, "left", "21", False, False, "0", "60"),
        ("Pipeline", None, "left", "26", True, False, "160", "80"),
    )
    result = []
    for suffix, level, align, size, bold, italic, before, after in definitions:
        style_id = STYLE_PREFIX + suffix
        keep = '<w:keepNext/><w:keepLines/>' if level is not None or suffix == "Pipeline" else ""
        outline = f'<w:outlineLvl w:val="{level}"/>' if level is not None else ""
        result.append(
            f'<w:style w:type="paragraph" w:customStyle="1" w:styleId="{style_id}">'
            f'<w:name w:val="{style_id}"/><w:basedOn w:val="{normal_id}"/>'
            f'<w:next w:val="{STYLE_PREFIX}Body"/><w:qFormat/><w:pPr>{keep}'
            '<w:numPr><w:numId w:val="0"/></w:numPr>'
            f'<w:spacing w:before="{before}" w:after="{after}" w:line="276" w:lineRule="auto"/>'
            f'<w:ind w:left="0" w:right="0" w:firstLine="0"/><w:jc w:val="{align}"/>'
            f'{outline}</w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" '
            'w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>'
            f'<w:b w:val="{int(bold)}"/><w:bCs w:val="{int(bold)}"/>'
            f'<w:i w:val="{int(italic)}"/><w:iCs w:val="{int(italic)}"/>'
            f'<w:color w:val="000000"/><w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
            '<w:lang w:val="vi-VN"/></w:rPr></w:style>'
        )
    return "".join(result).encode("utf-8")


def table(headers, rows, width):
    require(isinstance(headers, list) and len(headers) == 3, "expected three shared table headers")
    require(all(isinstance(item, str) for item in headers), "table headers must be formatted strings")
    require(isinstance(rows, list) and rows, "missing shared table rows")
    require(
        all(isinstance(row, list) and len(row) == 3 and all(isinstance(cell, str) for cell in row) for row in rows),
        "shared table rows must contain three formatted strings",
    )
    widths = [width * 18 // 100, width * 42 // 100]
    widths.append(width - sum(widths))
    borders = "".join(
        f'<w:{side} w:val="single" w:sz="4" w:color="808080"/>'
        for side in ("top", "left", "bottom", "right", "insideH", "insideV")
    )
    margins = "".join(f'<w:{side} w:w="100" w:type="dxa"/>' for side in ("top", "left", "bottom", "right"))
    result = [
        f'<w:tbl><w:tblPr><w:tblW w:w="{width}" w:type="dxa"/>'
        f'<w:jc w:val="left"/><w:tblBorders>{borders}</w:tblBorders>'
        f'<w:tblLayout w:type="fixed"/><w:tblCellMar>{margins}</w:tblCellMar></w:tblPr>',
        '<w:tblGrid>' + "".join(f'<w:gridCol w:w="{col}"/>' for col in widths) + '</w:tblGrid>',
    ]
    for index, row in enumerate([headers] + rows):
        result.append('<w:tr><w:trPr><w:cantSplit/>' + ('<w:tblHeader/>' if index == 0 else '') + '</w:trPr>')
        for cell, col in zip(row, widths):
            shading = '<w:shd w:val="clear" w:fill="E7E6E6"/>' if index == 0 else ""
            bold = '<w:rPr><w:b/><w:bCs/></w:rPr>' if index == 0 else ""
            keep_next = '<w:keepNext/>' if index == 0 else ""
            result.append(
                f'<w:tc><w:tcPr><w:tcW w:w="{col}" w:type="dxa"/>{shading}'
                '<w:vAlign w:val="top"/></w:tcPr>'
                f'<w:p><w:pPr><w:pStyle w:val="{STYLE_PREFIX}Table"/>{keep_next}</w:pPr>'
                f'<w:r>{bold}<w:t xml:space="preserve">{escape(cell)}</w:t></w:r></w:p></w:tc>'
            )
        result.append('</w:tr>')
    result.append('</w:tbl>')
    return "".join(result)


def presentation_content(snapshot, width):
    require(isinstance(snapshot["basis"], str), "shared basis must be a formatted string")
    result = [paragraph(TITLE, "Title", page_break=True)]
    result.append(paragraph(
        "Phần này xác định yêu cầu và phương án biên soạn trong phạm vi được "
        "phê duyệt, không thay đổi ba chương chuyên môn. Các yêu cầu không "
        "mặc nhiên là trạng thái đã đạt. Video, âm thanh và mở rộng liên thông "
        "LMS chỉ là phương án bổ sung khi có quyết định phạm vi và bằng chứng "
        "thực hiện tương ứng. Hiện trạng được tách riêng tại QC.8; phụ lục "
        "RC2026.08.25 phía sau là hồ sơ lịch sử.", "Note"
    ))
    for heading, paragraphs in SECTIONS:
        result.append(paragraph(heading, "Heading"))
        result.extend(paragraph(text) for text in paragraphs)
    result.append(paragraph("QC.8. Hiện trạng và phạm vi cam kết", "Heading"))
    result.append(paragraph(snapshot["basis"], "Note"))
    result.append(table(snapshot["headers"], snapshot["rows"], width))
    result.append(paragraph("QC.9. Quy trình xây dựng, workflow và pipeline", "Heading"))
    result.append(paragraph(
        "Workflow là luồng tổ chức công việc, duyệt và bàn giao; pipeline "
        "là chuỗi biến đổi kỹ thuật từ nguồn sang hiện vật. Bảng dưới đây "
        "xác định đầu ra, trách nhiệm đề xuất và điều kiện chuyển bước; "
        "không phải xác nhận toàn bộ các bước đã hoàn tất."
    ))
    result.append(table(snapshot["workflowHeaders"], snapshot["workflowRows"], width))
    for heading, text in PIPELINES:
        result.append(paragraph(heading, "Pipeline"))
        result.append(paragraph(text))
    return "".join(result).encode("utf-8")


def body_spans(xml):
    """Return body-child byte boundaries without reserializing original XML."""
    stack = []
    spans = []
    active = None
    parser = expat.ParserCreate(namespace_separator="}")

    def start(name, attributes):
        nonlocal active
        if len(stack) == 2 and stack[-1] == W + "}body":
            active = {"name": name, "start": parser.CurrentByteIndex}
        stack.append(name)

    def end(name):
        nonlocal active
        if len(stack) == 3 and stack[-2] == W + "}body":
            position = parser.CurrentByteIndex
            if xml[position:position + 2] == b"</":
                finish = xml.index(b">", position) + 1
            else:
                # Expat places a self-closing end event after its '/>'.
                finish = position
            active.update(close=position, end=finish)
            spans.append(active)
            active = None
        stack.pop()

    parser.StartElementHandler = start
    parser.EndElementHandler = end
    parser.Parse(xml, True)
    return spans


def inserted_bytes(source, additions):
    """Apply only gap insertions; every pre-existing byte is retained."""
    result = []
    cursor = 0
    for position, payload in sorted(additions, key=lambda item: item[0]):
        require(cursor <= position <= len(source), "invalid XML insertion position")
        result.extend((source[cursor:position], payload))
        cursor = position
    result.append(source[cursor:])
    return b"".join(result)


def text_of(node):
    return "".join(node.xpath(".//w:t/text()", namespaces=NS)).strip()


def xml_tree(data):
    parser = etree.XMLParser(resolve_entities=False, no_network=True)
    return etree.fromstring(data, parser)


def unique_paragraph(body, value):
    matches = [node for node in body.findall("w:p", NS) if text_of(node) == value]
    require(len(matches) == 1, f"expected exactly one body paragraph: {value}")
    return matches[0]


def page_width(body, insertion_index):
    # The next section-ending sectPr governs the insertion's page geometry.
    sections = []
    for child in list(body)[insertion_index:]:
        if child.tag == f"{{{W}}}sectPr":
            sections.append(child)
        else:
            sections.extend(child.findall(".//w:sectPr", NS))
    require(sections, "missing governing section properties")
    section = sections[0]
    size, margins = section.find("w:pgSz", NS), section.find("w:pgMar", NS)
    require(size is not None and margins is not None, "missing page geometry")
    width = int(size.get(f"{{{W}}}w")) - sum(
        int(margins.get(f"{{{W}}}{key}", "0")) for key in ("left", "right", "gutter")
    )
    require(width > 0, "invalid usable page width")
    return width


def revise_xml(document_xml, styles_xml, snapshot):
    document, styles = xml_tree(document_xml), xml_tree(styles_xml)
    require(document.prefix == styles.prefix == "w", "unsupported Word namespace prefix")
    body = document.find("w:body", NS)
    require(body is not None, "missing Word document body")
    children = list(body)
    spans = body_spans(document_xml)
    require(len(children) == len(spans), "ambiguous body XML boundaries")
    require(
        all(node.tag == "{" + span["name"] for node, span in zip(children, spans)),
        "body XML boundaries do not match parsed elements",
    )
    require(not any(text_of(node) == TITLE for node in body.findall("w:p", NS)), "outline already revised")
    references_heading = unique_paragraph(body, "TÀI LIỆU THAM KHẢO")
    appendix = unique_paragraph(body, APPENDIX)
    start, stop = children.index(references_heading), children.index(appendix)
    require(start < stop, "appendix precedes references")
    between = children[start + 1:stop]
    require(all(node.tag == f"{{{W}}}p" for node in between), "unexpected block between references and appendix")
    require(tuple(text_of(node) for node in between if text_of(node)) == REFERENCES, "four reference anchors differ")
    require(not any(node.findall(".//w:sectPr", NS) for node in between), "section break interrupts insertion anchors")
    unique_paragraph(body, "III.2. Kết luận và đề nghị")
    conclusions = [
        node for node in children[stop + 1:]
        if node.tag == f"{{{W}}}p" and "24/24 pass" in text_of(node)
        and text_of(node).startswith("Candidate 2026.08.25")
        and "công bố bản cuối" in text_of(node)
    ]
    require(len(conclusions) == 1, "missing or ambiguous historical QA/publication paragraph")
    conclusion = conclusions[0]
    previous = conclusion.getprevious()
    require(previous is not None and text_of(previous) == "III.2. Kết luận và đề nghị", "historical QA paragraph moved")
    toc_instructions = document.xpath('//w:instrText[contains(text(), "TOC")]/text()', namespaces=NS)
    require(len(toc_instructions) == 1, "missing or ambiguous TOC instruction")
    toc = toc_instructions[0]
    require(
        re.search(r'\bTOC\b', toc) and re.search(r'\\o\s+"1-3"', toc) and re.search(r'\\u(?:\s|$)', toc),
        "TOC does not include outline levels 1–3; update its instruction explicitly before revision",
    )
    normal_styles = styles.xpath('//w:style[@w:type="paragraph" and @w:default="1"]', namespaces=NS)
    require(len(normal_styles) == 1, "missing unique default paragraph style")
    normal_id = normal_styles[0].get(f"{{{W}}}styleId")
    require(not normal_styles[0].findall(".//w:numPr", NS), "default paragraph style has automatic numbering")
    require(
        not any(node.get(f"{{{W}}}styleId", "").startswith(STYLE_PREFIX) for node in styles.findall("w:style", NS)),
        "revision styles already exist",
    )
    title_span = spans[stop]
    require(document_xml[title_span["close"]:title_span["end"]] == b"</w:p>", "unexpected appendix closing tag")
    history_run = (
        '<w:r><w:br/><w:t xml:space="preserve">' + escape(HISTORY_TITLE) + '</w:t></w:r>'
    ).encode("utf-8")
    updated_document = inserted_bytes(document_xml, [
        (title_span["start"], presentation_content(snapshot, page_width(body, stop))),
        (title_span["close"], history_run),
        (title_span["end"], paragraph(HISTORY_NOTE, "Note").encode("utf-8")),
        (spans[children.index(conclusion)]["end"], paragraph(QA_NOTE, "Note").encode("utf-8")),
    ])
    style_close = styles_xml.rfind(b"</w:styles>")
    require(style_close >= 0, "missing styles closing tag")
    updated_styles = inserted_bytes(styles_xml, [(style_close, new_styles(normal_id))])
    xml_tree(updated_document)
    xml_tree(updated_styles)
    return {"word/document.xml": updated_document, "word/styles.xml": updated_styles}


def revise_outline(input_path, output_path):
    input_path, output_path = Path(input_path).resolve(), Path(output_path).resolve()
    require(input_path.is_file(), f"missing outline source: {input_path}")
    require(input_path != output_path, "output must not overwrite the input DOCX")
    if output_path.exists():
        require(not os.path.samefile(input_path, output_path), "output aliases the source DOCX")
    protected_sources = (
        DEFAULT_INPUT,
        ROOT / "BaoCao_KhoaHoc_GiaoTrinhDienTu_CoHocLyThuyet.docx",
        ROOT / "CoHocLyThuyet_Full_New.docx",
    )
    for source in protected_sources:
        require(output_path != source.resolve(), "output must not overwrite an original DOCX")
        if output_path.exists() and source.exists():
            require(not os.path.samefile(source, output_path), "output aliases an original DOCX")
    require(output_path.parent.is_dir(), "output directory must already exist")
    snapshot = presentation_snapshot(load_evidence())
    with zipfile.ZipFile(input_path) as source:
        require(len(source.namelist()) == len(set(source.namelist())), "duplicate DOCX package parts")
        replacements = revise_xml(source.read("word/document.xml"), source.read("word/styles.xml"), snapshot)
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(prefix="outline-revision-", suffix=".docx", dir=output_path.parent, delete=False) as temporary:
                temp_path = Path(temporary.name)
            with zipfile.ZipFile(temp_path, "w") as target:
                target.comment = source.comment
                for member in source.infolist():
                    # ZipFile mutates header_offset; preserve the source member for verification.
                    target.writestr(copy(member), replacements[member.filename] if member.filename in replacements else source.read(member))
            # Check the completed package before atomically exposing the copy.
            with zipfile.ZipFile(temp_path) as target:
                require(target.testzip() is None, "corrupt revised DOCX package")
                require(target.namelist() == source.namelist(), "DOCX package part inventory changed")
                require(target.comment == source.comment, "DOCX package comment changed")
                for member in source.infolist():
                    if member.filename not in replacements:
                        require(target.read(member.filename) == source.read(member), f"unrelated package part changed: {member.filename}")
            os.replace(temp_path, output_path)
            temp_path = None
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Create a revised presentation-specification copy of the outline, preserving the original DOCX.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="Original outline DOCX (default: DeCuongChiTietNop.docx).")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Revised copy (default: DeCuongChiTietNop_DaChinhSua.docx).")
    args = parser.parse_args()
    try:
        output = revise_outline(args.input, args.output)
    except (ValueError, OSError, KeyError, zipfile.BadZipFile, etree.XMLSyntaxError, expat.ExpatError) as error:
        parser.exit(1, f"Outline revision failed: {error}\n")
    print(f"Created revised copy: {output}")
    print("Changed package parts: word/document.xml; word/styles.xml")
    print("Original DOCX preserved. Update TOC/fields in Microsoft Word and inspect pagination/tables before PDF export.")


if __name__ == "__main__":
    main()
