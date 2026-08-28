"""Phase 01 source-derived release-baseline assertions (plain Python, no pytest).

The historical 117 HTML files / 127 image references were only migration evidence:
the intentional Section VII cleanup leaves 114 fragments and 126 references today.
They must never decide whether this source-derived gate passes or fails.
"""
import argparse
import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
HELPERS = HERE / 'equations-fix-shared-test-helpers-html-image-utilities.py'
CONTENT_MANIFEST_UTILS = HERE.parent / 'tools' / 'content_manifest_utils.py'

spec = importlib.util.spec_from_file_location('eq_test_helpers', HELPERS)
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
manifest_spec = importlib.util.spec_from_file_location('content_manifest_utils', CONTENT_MANIFEST_UTILS)
manifest_utils = importlib.util.module_from_spec(manifest_spec)
manifest_spec.loader.exec_module(manifest_utils)

chapter_files = helpers.chapter_files
iter_imgs = helpers.iter_imgs
project_root = helpers.project_root

PAGES_ENTRY = re.compile(r'^PAGES\["([^"]+)"\]\s*=', re.MULTILINE)
REVIEW_SUBSECTION_TITLE = 'Câu hỏi ôn tập'

# These DOCX-generated review fragments are intentionally not runtime routes.
# Their canonical routed successors are `on-tap.html`; obsolete quiz fragments
# are deleted by tools/gen_quiz_pages.py after canonical writes succeed.
NON_ROUTED_REVIEW_FRAGMENTS = {
    'chapters/ch1/cau-hoi-on-tap.html': 'DOCX review source retained; ch1-rev routes on-tap.html.',
    'chapters/ch2/cau-hoi-on-tap.html': 'DOCX review source retained; ch2-rev routes on-tap.html.',
    'chapters/ch3/cau-hoi-on-tap.html': 'DOCX review source retained; ch3-rev routes on-tap.html.',
}

# Historical formula-as-image migration evidence only. Phase 02 removes these
# references; their presence is intentionally not an acceptance condition here.
HISTORICAL_FORMULA_IMAGE_REFERENCES = (
    ('ch1/muc-III-2.html', 'images/ch1/hinh-037.png'),
    ('ch1/muc-III-3.html', 'images/ch1/hinh-039.png'),
    ('ch3/muc-V-4.html', 'images/ch3/hinh-136.png'),
    ('ch3/muc-VII-1.html', 'images/ch3/hinh-240.png'),
    ('ch3/muc-VII-1.html', 'images/ch3/hinh-241.png'),
    ('ch3/muc-VII-2.html', 'images/ch3/hinh-266.png'),
    ('ch3/muc-VII-2.html', 'images/ch3/hinh-283.png'),
    ('ch3/muc-VII-2.html', 'images/ch3/hinh-289.png'),
)


def normalized_title(title):
    return re.sub(r'\s+', ' ', str(title or '')).strip()


def manifest_routes(root):
    manifest = json.loads((root / 'tools' / 'docx_site_manifest.json').read_text(encoding='utf-8'))
    routes = {
        'lnd': 'chapters/loi-noi-dau.html',
        'authors': 'chapters/tac-gia.html',
        'refs': 'chapters/tai-lieu-tham-khao.html',
    }
    for chapter_data in manifest['chapters']:
        chapter = chapter_data['chapter']
        chapter_prefix = f'ch{chapter}'
        routes[chapter_prefix] = f'chapters/{chapter_prefix}/index.html'
        for section in chapter_data['sections']:
            section_number = section['section']
            roman = section['roman']
            route_prefix = f'{chapter_prefix}-{section_number}'
            routes[route_prefix] = f'chapters/{chapter_prefix}/muc-{roman}.html'
            for subsection in section['subsections']:
                if (
                    section_number == 7
                    and normalized_title(subsection['title']) == REVIEW_SUBSECTION_TITLE
                ):
                    continue
                subsection_number = subsection['subsection']
                routes[f'{route_prefix}-{subsection_number}'] = (
                    f'chapters/{chapter_prefix}/muc-{roman}-{subsection_number}.html'
                )
        routes[f'{chapter_prefix}-rev'] = f'chapters/{chapter_prefix}/on-tap.html'
        routes[f'{chapter_prefix}-quiz'] = f'chapters/{chapter_prefix}/trac-nghiem.html'
    return routes




def find_duplicates(values):
    return sorted(value for value, count in Counter(values).items() if count > 1)


def relative(root, path):
    return path.relative_to(root).as_posix()


def audit(root):
    errors = []
    expected_routes = manifest_routes(root)
    loader_text = (root / 'js' / 'loader.js').read_text(encoding='utf-8')
    try:
        page_map = manifest_utils.parse_page_map(loader_text)
        page_map_entries = list(page_map.items())
    except ValueError as exc:
        errors.append(str(exc))
        page_map = {}
        page_map_entries = []
    if page_map.get('home') is not None:
        errors.append('PAGE_MAP home route must be null')
    for route_id, expected_path in expected_routes.items():
        actual_path = page_map.get(route_id)
        if actual_path != expected_path:
            errors.append(
                f'manifest route mismatch for {route_id}: expected {expected_path}, got {actual_path}'
            )

    expected_route_ids = set(expected_routes) | {'home'}
    extra_route_ids = sorted(set(page_map) - expected_route_ids)
    if extra_route_ids:
        errors.append(f'orphan PAGE_MAP route ID(s): {", ".join(extra_route_ids)}')

    routed_paths = [fragment for route_id, fragment in page_map_entries if route_id != 'home' and fragment]
    duplicate_paths = find_duplicates(routed_paths)
    if duplicate_paths:
        errors.append(f'duplicate routed fragment path(s): {", ".join(duplicate_paths)}')

    routed_path_set = set(routed_paths)
    for fragment in sorted(routed_path_set):
        if not (root / fragment).is_file():
            errors.append(f'missing routed fragment: {fragment}')

    chapter_paths = {relative(root, path) for path in chapter_files(root)}
    allowed_non_routed = set(NON_ROUTED_REVIEW_FRAGMENTS)
    missing_policy_paths = sorted(allowed_non_routed - chapter_paths)
    if missing_policy_paths:
        errors.append(f'non-routed review policy path(s) missing: {", ".join(missing_policy_paths)}')
    orphan_fragments = sorted(chapter_paths - routed_path_set - allowed_non_routed)
    if orphan_fragments:
        errors.append(f'orphan chapter fragment(s): {", ".join(orphan_fragments)}')

    bundle_keys = PAGES_ENTRY.findall((root / 'js' / 'pages.js').read_text(encoding='utf-8'))
    duplicate_bundle_keys = find_duplicates(bundle_keys)
    if duplicate_bundle_keys:
        errors.append(f'duplicate bundle key(s): {", ".join(duplicate_bundle_keys)}')
    bundle_key_set = set(bundle_keys)
    routed_key_set = {route_id for route_id, fragment in page_map.items() if fragment}
    missing_bundle_keys = sorted(routed_key_set - bundle_key_set)
    orphan_bundle_keys = sorted(bundle_key_set - routed_key_set)
    if missing_bundle_keys or orphan_bundle_keys:
        errors.append(
            'bundle/PAGE_MAP mismatch: '
            f'missing bundle key(s) [{", ".join(missing_bundle_keys)}]; '
            f'orphan bundle key(s) [{", ".join(orphan_bundle_keys)}]'
        )

    referenced_images = set()
    for chapter_path in chapter_files(root):
        for image in iter_imgs(chapter_path.read_text(encoding='utf-8')):
            source = image.src.split('?', 1)[0].split('#', 1)[0]
            if source.startswith('images/'):
                referenced_images.add(source)
    for source in sorted(referenced_images):
        if not (root / source).is_file():
            errors.append(f'missing referenced local image: {source}')
    image_files = {
        relative(root, path)
        for path in (root / 'images').rglob('*')
        if path.is_file()
    }
    orphan_images = sorted(image_files - referenced_images)
    if orphan_images:
        errors.append(f'orphan image file(s): {", ".join(orphan_images)}')
    return errors, len(chapter_paths), len(referenced_images)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=project_root(), help='project root (for fixture tests)')
    args = parser.parse_args()
    root = args.root.resolve()
    errors, fragment_count, image_count = audit(root)
    if errors:
        for error in errors:
            print(f'FAIL: {error}')
        sys.exit(1)
    print(
        f'PASS: source-derived baseline complete ({fragment_count} chapter fragments, '
        f'{image_count} referenced local images)'
    )


if __name__ == '__main__':
    main()
