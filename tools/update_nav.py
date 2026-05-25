"""
Synchronize index sidebar, PAGE_MAP, PAGE_ORDER, and breadcrumb map
from the generated chapter fragments.

Usage:
  python tools/update_nav.py
"""
import argparse
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")


ROMAN_TO_NUM = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10}
NUM_TO_ROMAN = {v: k for k, v in ROMAN_TO_NUM.items()}
CHAPTER_NAMES = {1: "Tĩnh học", 2: "Động học", 3: "Động lực học"}
CHAPTER_ICONS = {1: "①", 2: "②", 3: "③"}
LEGACY_ROUTE_MAP = {
    "ch1-8": "ch1-7",
    "ch1-8-1": "ch1-7-1",
    "ch1-8-2": "ch1-7-2",
    "ch2-8": "ch2-7",
    "ch2-8-1": "ch2-7-1",
    "ch2-8-2": "ch2-7-2",
}


def is_review_subsection(section, sub_title):
    return section["section"] == 7 and clean_title(sub_title) == "Câu hỏi ôn tập"


def clean_title(title):
    return re.sub(r"\s+", " ", str(title or "")).strip()


def read(path):
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def write(path, content):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)


def extract_title(path, kind):
    content = read(path)
    if kind == "section":
        match = re.search(r"<h2>(.*?)</h2>", content, re.S)
    else:
        match = re.search(r'class="l3-title">(.*?)</div>', content, re.S)
    if not match:
        return os.path.basename(path)
    return re.sub(r"<[^>]+>", "", match.group(1)).strip()


def scan_chapters(root):
    chapters_root = os.path.join(root, "chapters")
    chapters = {}
    for chapter in (1, 2, 3):
        chapter_dir = os.path.join(chapters_root, f"ch{chapter}")
        sections = {}
        if not os.path.isdir(chapter_dir):
            continue
        for name in os.listdir(chapter_dir):
            sec_match = re.fullmatch(r"muc-([IVXLC]+)\.html", name)
            sub_match = re.fullmatch(r"muc-([IVXLC]+)-(\d+)\.html", name)
            if sec_match:
                roman = sec_match.group(1)
                sec_num = ROMAN_TO_NUM[roman]
                sections.setdefault(sec_num, {"roman": roman, "title": "", "subs": {}})
                sections[sec_num]["title"] = extract_title(os.path.join(chapter_dir, name), "section")
            elif sub_match:
                roman = sub_match.group(1)
                sec_num = ROMAN_TO_NUM[roman]
                sub_num = int(sub_match.group(2))
                sections.setdefault(sec_num, {"roman": roman, "title": roman, "subs": {}})
                sections[sec_num]["subs"][sub_num] = extract_title(os.path.join(chapter_dir, name), "sub")
        chapters[chapter] = {
            "name": CHAPTER_NAMES[chapter],
            "sections": [sections[k] | {"section": k} for k in sorted(sections)],
        }
    return chapters


def gen_sidebar(chapters):
    lines = []
    for chapter, data in chapters.items():
        color = f"var(--ch{chapter})"
        lines.append(f"      <!-- ========== CHƯƠNG {chapter} ========== -->")
        lines.append('      <div class="nav-item">')
        lines.append(
            f'        <button class="nav-btn" onclick="togSub(this)"><span class="icon" style="color:{color}">{CHAPTER_ICONS[chapter]}</span>Chương {chapter}. {data["name"]}<span class="arrow">▶</span></button>'
        )
        lines.append('        <div class="sub-menu">')
        for section in data["sections"]:
            pid = f"ch{chapter}-{section['section']}"
            roman = section["roman"]
            title = section["title"]
            if section["subs"]:
                lines.append(
                    f'          <div class="l2-group"><a href="#" class="l2 has-sub" onclick="togL3(this);loadPage(\'{pid}\');return false">{roman}. {title}<span class="l2a">▶</span></a>'
                )
                lines.append('            <div class="l3-menu">')
                for sub_num, sub_title in sorted(section["subs"].items()):
                    if is_review_subsection(section, sub_title):
                        continue
                    lines.append(
                        f'              <a href="#" class="l3" onclick="loadPage(\'{pid}-{sub_num}\');return false">{sub_num}. {sub_title}</a>'
                    )
                lines.append("            </div>")
                lines.append("          </div>")
            else:
                lines.append(f'          <a href="#" class="l2" onclick="loadPage(\'{pid}\');return false">{roman}. {title}</a>')
        lines.append(f'          <a href="#" class="l2" onclick="loadPage(\'ch{chapter}-rev\');return false">❓ Câu hỏi ôn tập</a>')
        lines.append(f'          <a href="#" class="l2" onclick="loadPage(\'ch{chapter}-quiz\');return false">✅ Ôn tập trắc nghiệm</a>')
        lines.append("        </div>")
        lines.append("      </div>")
        lines.append("")
    return "\n".join(lines)


def page_ids(chapters):
    ids = ["home", "lnd"]
    for chapter, data in chapters.items():
        ids.append(f"ch{chapter}")
        for section in data["sections"]:
            sid = f"ch{chapter}-{section['section']}"
            ids.append(sid)
            for sub_num in sorted(section["subs"]):
                if is_review_subsection(section, section["subs"][sub_num]):
                    continue
                ids.append(f"{sid}-{sub_num}")
        ids.append(f"ch{chapter}-rev")
        ids.append(f"ch{chapter}-quiz")
    ids.extend(["authors", "refs"])
    return ids


def gen_page_order(chapters):
    ids = page_ids(chapters)
    lines = ["const PAGE_ORDER = ["]
    for idx in range(0, len(ids), 8):
        chunk = ids[idx:idx + 8]
        comma = "," if idx + 8 < len(ids) else ""
        lines.append("  " + ", ".join(f"'{item}'" for item in chunk) + comma)
    lines.append("];")
    return "\n".join(lines)


def gen_bc(chapters):
    lines = [
        "const BC = {",
        "  'home': 'Trang chủ',",
        "  'lnd': 'Lời nói đầu',",
        "  'authors': 'Tác giả',",
        "  'refs': 'Tài liệu tham khảo',",
    ]
    for chapter, data in chapters.items():
        lines.append(f"  'ch{chapter}': 'Chương {chapter} › {data['name']}',")
        for section in data["sections"]:
            sid = f"ch{chapter}-{section['section']}"
            lines.append(f"  '{sid}': 'Chương {chapter} › {section['roman']}. {section['title']}',")
            for sub_num, sub_title in sorted(section["subs"].items()):
                if is_review_subsection(section, sub_title):
                    continue
                lines.append(f"  '{sid}-{sub_num}': 'Chương {chapter} › {section['roman']} › {sub_num}. {sub_title}',")
        lines.append(f"  'ch{chapter}-rev': 'Chương {chapter} › Câu hỏi ôn tập',")
        lines.append(f"  'ch{chapter}-quiz': 'Chương {chapter} › Ôn tập trắc nghiệm',")
    lines.append("};")
    return "\n".join(lines)


def gen_page_map(chapters):
    lines = [
        "const PAGE_MAP = {",
        "  'home': null,",
        "  'lnd': 'chapters/loi-noi-dau.html',",
        "  'authors': 'chapters/tac-gia.html',",
        "  'refs': 'chapters/tai-lieu-tham-khao.html',",
    ]
    for chapter, data in chapters.items():
        lines.append("")
        lines.append(f"  // Chapter {chapter}")
        lines.append(f"  'ch{chapter}': 'chapters/ch{chapter}/index.html',")
        for section in data["sections"]:
            roman = section["roman"]
            sid = f"ch{chapter}-{section['section']}"
            lines.append(f"  '{sid}': 'chapters/ch{chapter}/muc-{roman}.html',")
            for sub_num, sub_title in sorted(section["subs"].items()):
                if is_review_subsection(section, sub_title):
                    continue
                lines.append(f"  '{sid}-{sub_num}': 'chapters/ch{chapter}/muc-{roman}-{sub_num}.html',")
        lines.append(f"  'ch{chapter}-rev': 'chapters/ch{chapter}/on-tap.html',")
        lines.append(f"  'ch{chapter}-quiz': 'chapters/ch{chapter}/trac-nghiem.html',")
    lines.append("};")
    return "\n".join(lines)


def gen_legacy_map():
    lines = ["const LEGACY_ROUTE_MAP = {"]
    for old, new in LEGACY_ROUTE_MAP.items():
        lines.append(f"  '{old}': '{new}',")
    lines.append("};")
    return "\n".join(lines)


def replace_block(content, pattern, replacement, label):
    new_content, count = re.subn(pattern, replacement, content, count=1)
    if count != 1:
        raise SystemExit(f"Could not replace {label}")
    return new_content


def update_index(root, chapters):
    path = os.path.join(root, "index.html")
    content = read(path)
    start = content.find("      <!-- ========== CHƯƠNG 1 ========== -->")
    end = content.find("      <!-- Tác giả & TLTK -->")
    if start == -1 or end == -1:
        raise SystemExit("Could not find sidebar chapter markers in index.html")
    content = content[:start] + gen_sidebar(chapters) + "\n" + content[end:]
    section_count = sum(len(data["sections"]) for data in chapters.values())
    sub_count = sum(len(section["subs"]) for data in chapters.values() for section in data["sections"])
    content = re.sub(
        r'(<div class="sc"><div class="sn">)[^<]+(</div><div class="sl">Phần</div></div>)',
        lambda m: f"{m.group(1)}{section_count}{m.group(2)}",
        content,
    )
    content = re.sub(
        r'(<div class="sc"><div class="sn">)[^<]+(</div><div class="sl">Tiểu mục</div></div>)',
        lambda m: f"{m.group(1)}{sub_count}{m.group(2)}",
        content,
    )
    write(path, content)


def update_app(root, chapters):
    path = os.path.join(root, "js", "app.js")
    content = read(path)
    content = replace_block(content, r"const BC = \{[\s\S]*?\};", gen_bc(chapters), "BC")
    content = replace_block(content, r"const PAGE_ORDER = \[[\s\S]*?\];", gen_page_order(chapters), "PAGE_ORDER")
    write(path, content)


def update_loader(root, chapters):
    path = os.path.join(root, "js", "loader.js")
    content = read(path)
    legacy = gen_legacy_map()
    if "const LEGACY_ROUTE_MAP" in content:
        content = replace_block(content, r"const LEGACY_ROUTE_MAP = \{[\s\S]*?\};", legacy, "LEGACY_ROUTE_MAP")
    else:
        content = content.replace("// ============================================\n// PAGE MAP", legacy + "\n\n// ============================================\n// PAGE MAP")
    content = replace_block(content, r"const PAGE_MAP = \{[\s\S]*?\n\};", gen_page_map(chapters), "PAGE_MAP")
    if "LEGACY_ROUTE_MAP[id]" not in content:
        content = content.replace(
            "async function loadPage(id) {\n",
            "async function loadPage(id) {\n  id = LEGACY_ROUTE_MAP[id] || id;\n",
        )
    write(path, content)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=os.getcwd())
    args = parser.parse_args()
    root = os.path.abspath(args.root)
    chapters = scan_chapters(root)
    update_index(root, chapters)
    update_app(root, chapters)
    update_loader(root, chapters)
    print("Navigation synchronized from generated fragments.")
    print(f"Pages: {len(page_ids(chapters))}")


if __name__ == "__main__":
    main()
