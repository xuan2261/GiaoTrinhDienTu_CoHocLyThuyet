"""Update quiz HTML pages to use the new JSON quiz data"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

BASE = r'd:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\chapters'

for ch in [1, 2, 3]:
    ch_names = {1: 'Tĩnh học', 2: 'Động học', 3: 'Động lực học'}
    hero_class = f'ch{ch}-hero'
    
    # Quiz page (ôn tập trắc nghiệm)
    quiz_html = f'''<div class="sh2"><span class="badge {hero_class}">Chương {ch} – {ch_names[ch]}</span>
  <h2>ÔN TẬP TRẮC NGHIỆM</h2>
</div>
<div class="l3-content">
  <div class="l3-title">Câu hỏi trắc nghiệm Chương {ch}</div>
  <p>Bộ đề gồm <strong>50 câu hỏi</strong> trắc nghiệm bao phủ toàn bộ nội dung chương. Chọn chế độ:</p>
  <ul>
    <li><strong>📋 Tất cả</strong>: Làm toàn bộ 50 câu</li>
    <li><strong>🎲 Random</strong>: 10 câu ngẫu nhiên mỗi lần</li>
  </ul>
  <div id="quiz-ch{ch}"></div>
  <script>
    if(typeof renderQuiz==='function')renderQuiz('quiz-ch{ch}','ch{ch}','all');
    else document.getElementById('quiz-ch{ch}').innerHTML='<p><em>Đang tải quiz engine...</em></p>';
  </script>
</div>'''
    
    path = os.path.join(BASE, f'ch{ch}', 'on-tap-trac-nghiem.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(quiz_html)
    print(f"  ✅ {path}")

    # Review questions page (câu hỏi ôn tập)
    review_html = f'''<div class="sh2"><span class="badge {hero_class}">Chương {ch} – {ch_names[ch]}</span>
  <h2>CÂU HỎI ÔN TẬP</h2>
</div>
<div class="l3-content">
  <div class="l3-title">Câu hỏi ôn tập Chương {ch}</div>
  <p>Trả lời các câu hỏi sau để ôn tập kiến thức chương:</p>
  <div id="quiz-review-ch{ch}"></div>
  <script>
    if(typeof renderQuiz==='function')renderQuiz('quiz-review-ch{ch}','ch{ch}','random');
    else document.getElementById('quiz-review-ch{ch}').innerHTML='<p><em>Đang tải...</em></p>';
  </script>
</div>'''
    
    path2 = os.path.join(BASE, f'ch{ch}', 'cau-hoi-on-tap.html')
    with open(path2, 'w', encoding='utf-8') as f:
        f.write(review_html)
    print(f"  ✅ {path2}")

print(f"\n✅ Quiz pages updated for all 3 chapters")
