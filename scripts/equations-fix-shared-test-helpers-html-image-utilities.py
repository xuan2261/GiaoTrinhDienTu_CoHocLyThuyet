"""Shared plain-Python helpers for the equations-fix phase test suite.

These helpers are imported via importlib by test-phase-XX-*.py scripts because
Python module imports cannot resolve kebab-case filenames natively. Keep the
public surface (project_root, chapter_files, iter_imgs, load_mapping,
assert_or_exit) backwards compatible across all phase tests.
"""
import json
import re
import sys
from collections import namedtuple
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ImgInfo = namedtuple('ImgInfo', 'src alt in_figure container_tag')

ATTR_RE = re.compile(r'(\w+)="([^"]*)"')
IMG_TAG_RE = re.compile(r'<img\s+[^>]+>', re.IGNORECASE)


def project_root():
    return ROOT


def load_mapping():
    return json.loads(
        (ROOT / 'data/equation_mapping.json').read_text(encoding='utf-8')
    )


def chapter_files():
    return sorted((ROOT / 'chapters').rglob('*.html'))


def iter_imgs(html):
    for m in IMG_TAG_RE.finditer(html):
        tag = m.group(0)
        attrs = dict(ATTR_RE.findall(tag))
        pre = html[max(0, m.start() - 80):m.start()]
        in_figure = ('figure-container' in pre) or ('<figure' in pre)
        container = (
            'figure'
            if '<figure' in pre and 'figure-container' not in pre
            else 'div'
        )
        yield ImgInfo(
            src=attrs.get('src', ''),
            alt=attrs.get('alt', ''),
            in_figure=in_figure,
            container_tag=container,
        )


def assert_or_exit(cond, msg):
    if not cond:
        print(f'FAIL: {msg}')
        sys.exit(1)


def load_via_importlib(script_path, alias):
    """Load a kebab-case .py file as a Python module under `alias`."""
    import importlib.util

    spec = importlib.util.spec_from_file_location(alias, script_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod
