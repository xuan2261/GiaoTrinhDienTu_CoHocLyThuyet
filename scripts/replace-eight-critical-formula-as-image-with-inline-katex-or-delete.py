"""Replace 6 / Delete 2 formula-as-image refs per OCR (Phase 02 of equations-fix plan).

Targets the 8 critical entries identified by
plans/260518-2100-fix-formula-image-and-dupes/reports/ocr-tiny-glyph-verification-2026-05-18.md.
6 raster images become inline KaTeX (\\vec T, \\vec R, \\vec v, \\vec P_2,
\\vec P_1, \\vec N, \\vec F); 2 (hinh-266, hinh-283) are deleted because the
adjacent paragraph already renders identical text.

Modes:
  --check       (default) report planned changes, write nothing
  --apply       write changes
  --backup      write *.bak.{timestamp} alongside each modified file
  --idempotent  exit 0 silently if every edit has already landed
"""
import argparse
import datetime
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EDITS = [
    {
        'name': 'ch1/muc-III-2 hinh-037 -> vec T',
        'file': 'chapters/ch1/muc-III-2.html',
        'action': 'replace',
        'old': (
            '<p>Phản lực của dây tác dụng lên phần khảo sát bao giờ cũng đặt vào '
            'chỗ buộc dây và hướng vào dây. Phản lực của dây được gọi là sức căng '
            'của dây, kí hiệu là</p>\n'
            '<div class="figure-container"><img src="images/ch1/hinh-037.png" '
            'alt="Hình minh họa chương 1" loading="lazy"></div>\n'
            '<p>. Trong trường hợp dây vòng qua vật thì phản lực dây hướng dọc '
            'dây và hướng ra đối với mặt cắt dây như hình 1.12.</p>'
        ),
        'new': (
            '<p>Phản lực của dây tác dụng lên phần khảo sát bao giờ cũng đặt vào '
            'chỗ buộc dây và hướng vào dây. Phản lực của dây được gọi là sức căng '
            'của dây, kí hiệu là <span class="math-tex">\\(\\vec T\\)</span>. '
            'Trong trường hợp dây vòng qua vật thì phản lực dây hướng dọc dây và '
            'hướng ra đối với mặt cắt dây như hình 1.12.</p>'
        ),
    },
    {
        'name': 'ch1/muc-III-3 hinh-039 -> vec R',
        'file': 'chapters/ch1/muc-III-3.html',
        'action': 'replace',
        'old': (
            '<p>Phản lực liên kết</p>\n'
            '<div class="figure-container"><img src="images/ch1/hinh-039.png" '
            'alt="Hình minh họa chương 1" loading="lazy"></div>\n'
            '<p>trong trường hợp này đi qua tâm của trục và có phương chiều chưa '
            'xác định như hình 1.13.</p>'
        ),
        'new': (
            '<p>Phản lực liên kết <span class="math-tex">\\(\\vec R\\)</span> '
            'trong trường hợp này đi qua tâm của trục và có phương chiều chưa '
            'xác định như hình 1.13.</p>'
        ),
    },
    {
        'name': 'ch3/muc-V-4 hinh-136 -> vec v',
        'file': 'chapters/ch3/muc-V-4.html',
        'action': 'replace',
        'old': (
            '<em>- Vật rắn chuyển động tịnh tiến</em>: Vật có khối lượng m '
            'chuyển động với véc tơ\n'
            '<div class="figure-container"><img src="images/ch3/hinh-136.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>\n'
            '. Trong trường hợp này các phân tử của vật đều có cùng véc tơ <em>v</em>, do đó:'
        ),
        'new': (
            '<em>- Vật rắn chuyển động tịnh tiến</em>: Vật có khối lượng m '
            'chuyển động với véc tơ <span class="math-tex">\\(\\vec v\\)</span>. '
            'Trong trường hợp này các phân tử của vật đều có cùng véc tơ <em>v</em>, do đó:'
        ),
    },
    {
        'name': 'ch3/muc-VII-1 hinh-240 (P2/P1) + hinh-241 (N)',
        'file': 'chapters/ch3/muc-VII-1.html',
        'action': 'replace',
        'old': (
            '<p>Các ngoại lực tác dụng lên cơ hệ gồm các trọng lực của trục mất cân bằng</p>\n'
            '<div class="figure-container"><img src="images/ch3/hinh-240.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>\n'
            '<p><sub>2</sub>, của vỏ động cơ</p>\n'
            '<div class="figure-container"><img src="images/ch3/hinh-240.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>\n'
            '<p><sub>1</sub> và phản lực của nền lên động cơ</p>\n'
            '<div class="figure-container"><img src="images/ch3/hinh-241.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>'
        ),
        'new': (
            '<p>Các ngoại lực tác dụng lên cơ hệ gồm các trọng lực của trục mất '
            'cân bằng <span class="math-tex">\\(\\vec P_2\\)</span>, của vỏ động '
            'cơ <span class="math-tex">\\(\\vec P_1\\)</span> và phản lực của '
            'nền lên động cơ <span class="math-tex">\\(\\vec N\\)</span>.</p>'
        ),
    },
    {
        'name': 'ch3/muc-VII-2 hinh-266 -> DELETE (duplicate text)',
        'file': 'chapters/ch3/muc-VII-2.html',
        'action': 'delete',
        'old': (
            '<p>Dây không dãn: a<sub>2</sub>= a<sub>1</sub></p>\n'
            '<div class="figure-container"><img src="images/ch3/hinh-266.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>\n'
        ),
        'new': '<p>Dây không dãn: a<sub>2</sub>= a<sub>1</sub></p>\n',
    },
    {
        'name': 'ch3/muc-VII-2 hinh-283 -> DELETE (duplicate text)',
        'file': 'chapters/ch3/muc-VII-2.html',
        'action': 'delete',
        'old': (
            '<p>Chiếu lên trục Ox: <em>P</em><sub><em>2</em></sub> '
            '<em>- T</em><sub><em>2</em></sub><em>=0</em>   (5)</p>\n'
            '<div class="figure-container"><img src="images/ch3/hinh-283.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>\n'
        ),
        'new': (
            '<p>Chiếu lên trục Ox: <em>P</em><sub><em>2</em></sub> '
            '<em>- T</em><sub><em>2</em></sub><em>=0</em>   (5)</p>\n'
        ),
    },
    {
        'name': 'ch3/muc-VII-2 hinh-289 -> vec F',
        'file': 'chapters/ch3/muc-VII-2.html',
        'action': 'replace',
        'old': (
            '<p><strong>Bài 2: </strong>Một rơ moóc chở hàng chuyển động trên '
            'đường ngang dưới tác dụng của lực</p>\n'
            '<div class="figure-container"><img src="images/ch3/hinh-289.png" '
            'alt="Hình minh họa chương 3" loading="lazy"></div>\n'
            '<p>nằm ngang, có giá trị không đổi. Thùng xe và vật liệu có giá trị M,'
        ),
        'new': (
            '<p><strong>Bài 2: </strong>Một rơ moóc chở hàng chuyển động trên '
            'đường ngang dưới tác dụng của lực '
            '<span class="math-tex">\\(\\vec F\\)</span> nằm ngang, có giá trị '
            'không đổi. Thùng xe và vật liệu có giá trị M,'
        ),
    },
]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true',
                   help='write *.bak.{timestamp} before apply')
    p.add_argument('--idempotent', action='store_true',
                   help='no-op if every edit already applied')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    file_states = {}
    skip_count = 0

    for edit in EDITS:
        rel = edit['file']
        path = ROOT / rel
        current = file_states.get(rel)
        if current is None:
            current = path.read_text(encoding='utf-8')
        count = current.count(edit['old'])

        if count == 0:
            if args.idempotent or edit['new'] in current:
                skip_count += 1
                continue
            print(f"[ERROR] {edit['name']}: pattern not found in {rel}")
            return 1

        if count != 1:
            print(f"[ERROR] {edit['name']}: pattern matches {count} times in {rel} (expected 1)")
            return 1

        new_content = current.replace(edit['old'], edit['new'], 1)
        file_states[rel] = new_content
        print(f"[{edit['action'].upper()}] {edit['name']}: 1 match")

    if not file_states:
        print(f'IDEMPOTENT: all {len(EDITS)} edits already applied (skipped {skip_count})')
        return 0

    if args.apply:
        for rel, content in file_states.items():
            path = ROOT / rel
            if args.backup:
                shutil.copy2(path, f'{path}.bak.{ts}')
            path.write_text(content, encoding='utf-8')
            print(f"WRITE {rel}")
    else:
        print(f"\nDry-run mode. Use --apply to write {len(file_states)} files "
              f"(skipped {skip_count}).")
    return 0


if __name__ == '__main__':
    sys.exit(main())
