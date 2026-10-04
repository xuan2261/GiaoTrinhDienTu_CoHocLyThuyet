"""Apply reviewed web errata without changing the archival DOCX/PDF.

The exact audited input (after proven duplicate removal) is required. All entries
are checked before any write. Unknown regenerated content fails closed, requiring
an explicit review/rebase of the errata instead of silently reviving old errors.
"""
from __future__ import annotations
import argparse, hashlib, importlib.util, json
from pathlib import Path, PurePosixPath
ROOT = Path(__file__).resolve().parents[1]
MANIFEST = 'data/content-errata-20261002.json'

def digest(text): return hashlib.sha256(text.encode('utf-8')).hexdigest()

def deduplicate(root, text):
    spec = importlib.util.spec_from_file_location('errata_dedupe', root/'scripts/dedupe-mathml-and-katex-render-pairs-keep-mathml.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.dedupe(text)

def confined_file(root, relative, directory=None):
    if not isinstance(relative, str) or not relative or "\\" in relative:
        raise ValueError('Invalid errata path')
    logical = PurePosixPath(relative)
    if logical.is_absolute() or any(part in ('', '.', '..') for part in relative.split('/')) or ':' in relative:
        raise ValueError(f'Invalid errata path: {relative}')
    path = (root / relative).resolve()
    boundary = root / directory if directory else root
    if boundary not in path.parents:
        raise ValueError(f'Invalid errata path: {relative}')
    return path

def validate_source(root, manifest, actual_source=None):
    root = Path(root).resolve()
    if manifest.get('schemaVersion') != 1: raise ValueError('Unsupported errata schema')
    source = confined_file(root, manifest['source']['path'])
    if actual_source is not None and Path(actual_source).resolve() != source:
        raise ValueError('Actual DOCX input differs from the errata-bound archival source')
    if hashlib.sha256(source.read_bytes()).hexdigest() != manifest['source']['sha256']:
        raise ValueError('DOCX source changed; review/rebase web errata before extraction')

def prepare(root, manifest):
    root = Path(root).resolve()
    validate_source(root, manifest)
    pending = []
    seen = set()
    for entry in manifest['entries']:
        rel = entry['path']
        path = confined_file(root, rel, 'chapters')
        if rel in seen:
            raise ValueError(f'Invalid/duplicate errata path: {rel}')
        seen.add(rel)
        original = path.read_text(encoding='utf-8')
        if digest(original) == entry['correctedSha256']: continue
        candidate = deduplicate(root, original)
        if digest(candidate) != entry['auditedSha256']:
            raise ValueError(f'Unknown content for {rel}; errata not applied, review required')
        for change in entry['changes']:
            before, after = change['before'], change['after']
            if not before or candidate.count(before) != 1:
                raise ValueError(f'Non-unique errata anchor in {rel}')
            candidate = candidate.replace(before, after, 1)
        if digest(candidate) != entry['correctedSha256']:
            raise ValueError(f'Errata output hash mismatch in {rel}')
        pending.append((path,candidate))
    return pending

def apply(root, manifest, write=False):
    pending = prepare(root,manifest)
    if write:
        for path,text in pending: path.write_text(text,encoding='utf-8',newline='\n')
    return len(pending)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=ROOT)
    parser.add_argument('--apply',action='store_true')
    parser.add_argument('--check',action='store_true')
    parser.add_argument('--idempotent',action='store_true')
    args=parser.parse_args()
    manifest=json.loads((args.root/MANIFEST).read_text(encoding='utf-8'))
    count=apply(args.root,manifest,args.apply)
    print(f'Web errata: {count} fragment(s) '+('corrected' if args.apply else 'require application')+'; independent academic acceptance remains pending')
    return 0 if args.apply or count==0 else 1

if __name__=='__main__':
    try: raise SystemExit(main())
    except (ValueError,KeyError,OSError) as e: raise SystemExit(f'Web errata: FAIL: {e}')
