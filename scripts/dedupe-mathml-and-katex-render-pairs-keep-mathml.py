"""Deduplicate MathML+KaTeX render pairs in chapter HTML (Phase 03 Front A).

Handles conservative, proven-equivalent pairs that render an equation twice (once as
mathml-inline, once as KaTeX math-tex span). Keeps the MathML and removes the
adjacent KaTeX span — preserves screen-reader semantics (MathML accessible),
matches the dominant rendering used across 645/702 mapping rows.

Modes:
  --check       (default) report planned changes, write nothing
  --apply       write changes
  --backup      write *.bak.{timestamp} alongside modified files
  --idempotent  exit 0 silently if already deduped (used by extract_docx
                post-processor to keep re-extract clean)
"""
import argparse
import datetime
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = sorted((ROOT / 'chapters').rglob('*.html'))

# A pair may use either legacy span or modern div wrappers. Only whitespace
# can separate duplicate representations; punctuation/prose is preserved.
MATH = r'(?P<math><(?P<mtag>span|div) class="mathml-(?:inline|block)">\s*<math\b[^>]*>.*?</math>\s*</(?P=mtag)>)'
TEX = r'(?P<tex><(?P<ttag>span|div) class="math-tex(?:-block)?">\\(?P<opening>\[|\()(?P<formula>.*?)\\(?P<closing>\]|\))</(?P=ttag)>)'
PAIR_FORWARD = re.compile(MATH + r'(?P<gap>\s*)' + TEX, re.DOTALL)
PAIR_REVERSE = re.compile(TEX + r'(?P<gap>\s*)' + MATH, re.DOTALL)


def simple_mathml_tex(fragment):
    """Recognize only a small, lossless algebra subset; fail closed otherwise.

    Adjacency alone does not prove equations equivalent. In particular, retain
    different formulas and unsupported MathML rather than silently delete them.
    """
    try:
        root = ET.fromstring(re.search(r'<math\b.*?</math>', fragment, re.DOTALL).group())
        def serialize(node):
            namespace, _, tag = node.tag.rpartition('}')
            if namespace and namespace != '{http://www.w3.org/1998/Math/MathML':
                raise ValueError('foreign namespace')
            if not namespace: tag = node.tag
            allowed = {'math': {'display'}, 'mover': {'accent'}, 'mo': {'stretchy'}}.get(tag, set())
            if set(node.attrib) - allowed:
                raise ValueError('unsupported semantic attributes')
            if tag == 'math' and node.get('display', 'inline') not in ('inline', 'block'):
                raise ValueError('unsupported display')
            if tag == 'mover' and node.get('accent', 'true') != 'true':
                raise ValueError('non-accent over operator')
            if tag == 'mo' and node.get('stretchy', 'true') not in ('true', 'false'):
                raise ValueError('unsupported operator')
            if node.tail and node.tail.strip(): raise ValueError('mixed text tail')
            if tag in ('math', 'mrow'):
                if node.text and node.text.strip(): raise ValueError('mixed MathML content')
                return ''.join(serialize(child) for child in node)
            if tag in ('mi', 'mn', 'mo') and len(node) == 0:
                value = (node.text or '').strip()
                if tag == 'mi' and not re.fullmatch(r'[A-Za-z]', value):
                    raise ValueError('unsupported identifier')
                if tag == 'mn' and not re.fullmatch(r'[0-9]+(?:\.[0-9]+)?', value):
                    raise ValueError('unsupported number')
                if tag == 'mo' and value not in ('+', '-', '=', '<', '>', '→', '(', ')'):
                    raise ValueError('unsupported operator')
                return value
            if tag == 'mover' and len(node) == 2 and serialize(node[1]) == '→':
                if node.text and node.text.strip(): raise ValueError('mixed accent content')
                return r'\vec{' + serialize(node[0]) + '}'
            raise ValueError('unsupported MathML')
        return serialize(root)
    except (ET.ParseError, ValueError, AttributeError):
        return None


def dedupe(html):
    def replace(match):
        if (match['opening'], match['closing']) not in (('[', ']'), ('(', ')')):
            return match.group(0)
        actual = simple_mathml_tex(match.group('math'))
        expected = re.sub(r'\s+', '', match.group('formula'))
        return match.group('math') if actual is not None and actual == expected else match.group(0)
    while True:
        new = PAIR_FORWARD.sub(replace, html)
        new = PAIR_REVERSE.sub(replace, new)
        if new == html:
            return new
        html = new


# Compatibility for existing checker/imports; all representations now use the
# same conservative equivalence policy.
dedupe_div_blocks = dedupe


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true')
    p.add_argument('--idempotent', action='store_true')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    files_changed = 0
    total_pairs = 0
    for path in TARGETS:
        original = path.read_text(encoding='utf-8')
        new = original
        # Loop to fixed point in case of overlapping matches
        for _ in range(5):
            cand = dedupe(new)
            if cand == new:
                break
            new = cand
        if new == original:
            continue
        explicit_pairs = len(re.findall(r'class="math-tex(?:-block)?"', original)) - len(re.findall(r'class="math-tex(?:-block)?"', new))
        total_pairs += explicit_pairs
        files_changed += 1
        rel = str(path.relative_to(ROOT)).replace('\\', '/')
        if args.apply:
            if args.backup:
                shutil.copy2(path, f'{path}.bak.{ts}')
            path.write_text(new, encoding='utf-8')
            print(f'WRITE {rel}: removed {explicit_pairs} duplicate pair(s)')
        else:
            print(f'WOULD REMOVE {explicit_pairs} from {rel}')

    if args.idempotent and files_changed == 0:
        print('IDEMPOTENT: 0 duplicate pairs (already clean)')
        return 0
    print(f'\nFiles {("changed" if args.apply else "to change")}: {files_changed} | total pairs: {total_pairs}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
