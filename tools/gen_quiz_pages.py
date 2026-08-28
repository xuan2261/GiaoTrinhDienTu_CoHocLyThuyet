"""Generate canonical chapter quiz fragments without import-time writes."""
import argparse
import os
import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

CHAPTER_NAMES = {1: "Tĩnh học", 2: "Động học", 3: "Động lực học"}


def quiz_html(chapter):
    hero_class = f"ch{chapter}-hero"
    return f"""<div class="sh2"><span class="badge {hero_class}">Chương {chapter} – {CHAPTER_NAMES[chapter]}</span>
  <h2>ÔN TẬP TRẮC NGHIỆM</h2>
</div>
<div class="l3-content">
  <div class="l3-title">Câu hỏi trắc nghiệm Chương {chapter}</div>
  <p>Bộ đề gồm <strong>100 câu hỏi</strong> trắc nghiệm bao phủ toàn bộ nội dung chương. Chọn phạm vi và chế độ:</p>
  <ul>
    <li><strong>📋 Tất cả</strong>: Làm toàn bộ câu hỏi trong phạm vi đã chọn</li>
    <li><strong>🎲 Random</strong>: Tối đa 10 câu ngẫu nhiên trong phạm vi đã chọn</li>
  </ul>
  <div id="quiz-ch{chapter}"></div>
  <script>
    if(typeof renderQuiz==='function')renderQuiz('quiz-ch{chapter}','ch{chapter}','all');
    else document.getElementById('quiz-ch{chapter}').innerHTML='<p><em>Đang tải quiz engine...</em></p>';
  </script>
</div>"""


def write_canonical(path, content):
    fd, temporary = tempfile.mkstemp(prefix=f"{path.name}.", suffix=".tmp", dir=path.parent, text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        Path(temporary).replace(path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def generate_quiz_pages(root):
    root = Path(root).resolve()
    written = []
    for chapter in (1, 2, 3):
        chapter_dir = root / "chapters" / f"ch{chapter}"
        chapter_dir.mkdir(parents=True, exist_ok=True)
        canonical = chapter_dir / "trac-nghiem.html"
        write_canonical(canonical, quiz_html(chapter))
        obsolete = chapter_dir / "on-tap-trac-nghiem.html"
        obsolete.unlink(missing_ok=True)
        written.append(canonical)
    return written


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=Path.cwd())
    args = parser.parse_args(argv)
    for path in generate_quiz_pages(args.root):
        print(f"  generated {path}")


if __name__ == "__main__":
    main()
