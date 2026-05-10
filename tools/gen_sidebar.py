"""
Generate the correct sidebar HTML for index.html, plus PAGE_ORDER and BC for app.js.
Based on actual DOCX structure that was extracted.
"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

# The actual DOCX structure (from analysis):
CHAPTERS = {
    1: {
        'name': 'Tĩnh học',
        'sections': [
            ('I', 'Các khái niệm cơ bản', [
                (1, 'Vật rắn tuyệt đối'), (2, 'Trạng thái cân bằng'), (3, 'Lực'),
                (4, 'Mô men'), (5, 'Hệ lực'), (6, 'Ngẫu lực'),
                (7, 'Vật tự do và vật không tự do'), (8, 'Lực liên kết, lực hoạt động, phản lực liên kết')
            ]),
            ('II', 'Hệ tiên đề tĩnh học', [
                (1, 'Tiên đề 1: Cặp lực cân bằng'), (2, 'Tiên đề 2: Thêm hay bớt cặp lực cân bằng'),
                (3, 'Tiên đề 3: Hình bình hành lực'), (4, 'Tiên đề 4: Lực tương tác'),
                (5, 'Tiên đề 5: Tiên đề hóa rắn'), (6, 'Tiên đề 6: Giải phóng liên kết')
            ]),
            ('III', 'Phản lực liên kết thường gặp', [
                (1, 'Liên kết tựa'), (2, 'Liên kết dây mềm, thẳng'), (3, 'Liên kết bản lề'),
                (4, 'Liên kết gối'), (5, 'Liên kết gối cầu'), (6, 'Liên kết ngàm'), (7, 'Liên kết thanh')
            ]),
            ('IV', 'Đặc trưng cơ bản của hệ lực', [
                (1, 'Véc tơ chính'), (2, 'Mô men chính'), (3, 'Các dạng cơ bản')
            ]),
            ('V', 'Điều kiện cân bằng', [
                (1, 'Điều kiện CB hệ lực bất kỳ trong KG'), (2, 'Điều kiện CB hệ lực đặc biệt')
            ]),
            ('VI', 'Ma sát', [
                (1, 'Khái niệm'), (2, 'Phân loại ma sát')
            ]),
            ('VII', 'Trọng tâm', [
                (1, 'Khái niệm'), (2, 'Công thức tính trọng tâm'), (3, 'Tính chất và trọng tâm một số vật')
            ]),
            ('VIII', 'Bài tập', [
                (1, 'Phương pháp giải bài toán cân bằng'), (2, 'Bài tập có hướng dẫn'), (3, 'Bài tập tự làm')
            ]),
        ]
    },
    2: {
        'name': 'Động học',
        'sections': [
            ('I', 'Chuyển động của chất điểm', [
                (1, 'Khảo sát bằng véc tơ'), (2, 'Khảo sát bằng tọa độ Đề các'),
                (3, 'Khảo sát bằng tọa độ tự nhiên'), (4, 'Các dạng chuyển động đặc biệt')
            ]),
            ('II', 'Chuyển động cơ bản của vật rắn', [
                (1, 'Chuyển động tịnh tiến'), (2, 'Chuyển động quay quanh trục cố định')
            ]),
            ('III', 'Truyền động đơn giản', [
                (1, 'Vị trí truyền động'), (2, 'Một số loại truyền động')
            ]),
            ('IV', 'Hợp chuyển động điểm', [
                (1, 'Định nghĩa các loại chuyển động'), (2, 'Định lý hợp vận tốc và gia tốc')
            ]),
            ('V', 'Chuyển động song phẳng', [
                (1, 'Khái niệm và mô hình'), (2, 'Khảo sát chuyển động vật rắn'), (3, 'Khảo sát chuyển động các điểm')
            ]),
            ('VI', 'Chuyển động quay quanh 1 điểm cố định', []),
            ('VII', 'Bài tập', [
                (1, 'Tóm tắt lý thuyết'), (2, 'Bài tập có hướng dẫn'), (3, 'Bài tập tự làm')
            ]),
        ]
    },
    3: {
        'name': 'Động lực học',
        'sections': [
            ('I', 'Các khái niệm cơ bản', [
                (1, 'Vật thể'), (2, 'Lực'), (3, 'Hệ quy chiếu quán tính')
            ]),
            ('II', 'Các định luật cơ bản', [
                (1, 'ĐL quán tính'), (2, 'ĐL cơ bản ĐLH'), (3, 'ĐL tác dụng & phản tác dụng'),
                (4, 'ĐL tính độc lập giữa tác dụng lực'), (5, 'Tiên đề giải phóng liên kết')
            ]),
            ('III', 'Phương trình vi phân chuyển động', [
                (1, 'Dạng véc tơ'), (2, 'Dạng tọa độ Đề các')
            ]),
            ('IV', 'Hai bài toán cơ bản của ĐLH', [
                (1, 'Bài toán thuận'), (2, 'Bài toán ngược')
            ]),
            ('V', 'Các định lý tổng quát', [
                (1, 'Định lý chuyển động khối tâm'), (2, 'Định lý động lượng'),
                (3, 'Định lý mô men động lượng'), (4, 'Định lý động năng')
            ]),
            ('VI', 'Lý thuyết va chạm', [
                (1, 'Đặc điểm và giả thiết'), (2, 'Các định lý tổng quát áp dụng'), (3, 'Hai bài toán cơ bản')
            ]),
            ('VII', 'Bài tập', [
                (1, 'Tóm tắt lý thuyết'), (2, 'Bài tập có hướng dẫn'), (3, 'Bài tập tự làm')
            ]),
        ]
    }
}

ROMAN_TO_NUM = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8}
CH_ICONS = {1: '①', 2: '②', 3: '③'}
CH_COLORS = {1: 'var(--ch1)', 2: 'var(--ch2)', 3: 'var(--ch3)'}

# ============================================
# Generate sidebar HTML
# ============================================
print("<!-- ========== SIDEBAR CONTENT ========== -->")

for ch_num, ch_data in CHAPTERS.items():
    ch_name = ch_data['name']
    icon = CH_ICONS[ch_num]
    color = CH_COLORS[ch_num]
    
    print(f'      <!-- ========== CHƯƠNG {ch_num} ========== -->')
    print(f'      <div class="nav-item">')
    print(f'        <button class="nav-btn" onclick="togSub(this)"><span class="icon" style="color:{color}">{icon}</span>Chương {ch_num}. {ch_name}<span class="arrow">▶</span></button>')
    print(f'        <div class="sub-menu">')
    
    for roman, title, subs in ch_data['sections']:
        num = ROMAN_TO_NUM[roman]
        page_id = f'ch{ch_num}-{num}'
        
        if subs:
            print(f'          <div class="l2-group"><a href="#" class="l2 has-sub" onclick="togL3(this);loadPage(\'{page_id}\');return false">{roman}. {title}<span class="l2a">▶</span></a>')
            print(f'            <div class="l3-menu">')
            for sub_num, sub_title in subs:
                sub_page_id = f'ch{ch_num}-{num}-{sub_num}'
                print(f'              <a href="#" class="l3" onclick="loadPage(\'{sub_page_id}\');return false">{sub_num}. {sub_title}</a>')
            print(f'            </div>')
            print(f'          </div>')
        else:
            print(f'          <a href="#" class="l2" onclick="loadPage(\'{page_id}\');return false">{roman}. {title}</a>')
    
    print(f'          <a href="#" class="l2" onclick="loadPage(\'ch{ch_num}-rev\');return false">❓ Câu hỏi ôn tập</a>')
    print(f'          <a href="#" class="l2" onclick="loadPage(\'ch{ch_num}-quiz\');return false">✅ Ôn tập trắc nghiệm</a>')
    print(f'        </div>')
    print(f'      </div>')

# ============================================
# Generate PAGE_ORDER + BC for app.js
# ============================================
print("\n\n// ===== PAGE_ORDER =====")
order = ['home', 'lnd']
for ch_num, ch_data in CHAPTERS.items():
    order.append(f'ch{ch_num}')
    for roman, title, subs in ch_data['sections']:
        num = ROMAN_TO_NUM[roman]
        order.append(f'ch{ch_num}-{num}')
        for sub_num, _ in subs:
            order.append(f'ch{ch_num}-{num}-{sub_num}')
    order.append(f'ch{ch_num}-rev')
    order.append(f'ch{ch_num}-quiz')
order.extend(['authors', 'refs'])

print(f"const PAGE_ORDER = [")
# Print in chunks of 8
for i in range(0, len(order), 8):
    chunk = order[i:i+8]
    line = ', '.join(f"'{p}'" for p in chunk)
    comma = ',' if i + 8 < len(order) else ''
    print(f"  {line}{comma}")
print("];")

print(f"\n// ===== BC (breadcrumb) =====")
print("const BC = {")
ch_names = {1: 'Tĩnh học', 2: 'Động học', 3: 'Động lực học'}
print("  'home': 'Trang chủ',")
print("  'lnd': 'Lời nói đầu',")
print("  'authors': 'Tác giả',")
print("  'refs': 'Tài liệu tham khảo',")
for ch_num, ch_data in CHAPTERS.items():
    print(f"  'ch{ch_num}': 'Chương {ch_num} › {ch_names[ch_num]}',")
    for roman, title, subs in ch_data['sections']:
        num = ROMAN_TO_NUM[roman]
        short_title = title[:40]
        print(f"  'ch{ch_num}-{num}': 'Chương {ch_num} › {roman}. {short_title}',")
        for sub_num, sub_title in subs:
            short_sub = sub_title[:35]
            print(f"  'ch{ch_num}-{num}-{sub_num}': 'Chương {ch_num} › {roman} › {sub_num}. {short_sub}',")
    print(f"  'ch{ch_num}-rev': 'Chương {ch_num} › Câu hỏi ôn tập',")
    print(f"  'ch{ch_num}-quiz': 'Chương {ch_num} › Ôn tập trắc nghiệm',")
print("};")
