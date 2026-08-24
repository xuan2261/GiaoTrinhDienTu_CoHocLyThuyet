"""Shared deterministic parsing, path and hash helpers for content manifests."""
import hashlib
import json
import os
import re

SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
ABSOLUTE_PATH_RE = re.compile(r"^(?:[A-Za-z]:[\\/]|/|\\\\)")


def sha256_bytes(value):
    return hashlib.sha256(value).hexdigest()


def sha256_file(path):
    with open(path, "rb") as fh:
        return sha256_bytes(fh.read())


def canonical_json(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def normalize_logical_path(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("logical path must be a non-empty string")
    value = value.replace("\\", "/")
    if ABSOLUTE_PATH_RE.match(value):
        raise ValueError(f"absolute logical path is forbidden: {value}")
    parts = value.split("/")
    if any(not part or part in (".", "..") for part in parts):
        raise ValueError(f"invalid logical path: {value}")
    return value


def repo_path(root, logical_path):
    normalized = normalize_logical_path(logical_path)
    target = os.path.abspath(os.path.join(root, *normalized.split("/")))
    if os.path.commonpath((os.path.abspath(root), target)) != os.path.abspath(root):
        raise ValueError(f"path escapes repository: {logical_path}")
    return target


def read_text(path):
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def parse_quoted_map(source, name, value_pattern=r"[^']*"):
    match = re.search(rf"const\s+{re.escape(name)}\s*=\s*\{{(?P<body>.*?)^\}};", source, re.MULTILINE | re.DOTALL)
    if not match:
        raise ValueError(f"cannot locate {name}")
    entries = re.findall(rf"'([^']+)'\s*:\s*'({value_pattern})'", match.group("body"))
    keys = [key for key, _value in entries]
    duplicates = sorted({key for key in keys if keys.count(key) > 1})
    if duplicates:
        raise ValueError(f"duplicate route id in {name}: {', '.join(duplicates)}")
    return dict(entries)


def parse_page_map(source):
    match = re.search(r"const\s+PAGE_MAP\s*=\s*\{(?P<body>.*?)^\};", source, re.MULTILINE | re.DOTALL)
    if not match:
        raise ValueError("cannot locate PAGE_MAP")
    entries = re.findall(r"'([^']+)'\s*:\s*(null|'([^']*)')", match.group("body"))
    keys = [key for key, _raw, _path in entries]
    duplicates = sorted({key for key in keys if keys.count(key) > 1})
    if duplicates:
        raise ValueError(f"duplicate route id in PAGE_MAP: {', '.join(duplicates)}")
    page_map = {}
    for key, raw, path in entries:
        if raw == "null":
            page_map[key] = None
        elif not path:
            raise ValueError(f"blank PAGE_MAP path for route {key}")
        else:
            page_map[key] = normalize_logical_path(path)
    return page_map


def parse_page_order(source):
    match = re.search(r"const\s+PAGE_ORDER\s*=\s*\[(?P<body>.*?)\];", source, re.DOTALL)
    if not match:
        raise ValueError("cannot locate PAGE_ORDER")
    routes = re.findall(r"'([^']+)'", match.group("body"))
    duplicates = sorted({route for route in routes if routes.count(route) > 1})
    if duplicates:
        raise ValueError(f"duplicate route id in PAGE_ORDER: {', '.join(duplicates)}")
    return routes


def parse_bundle_pages(source):
    routes = re.findall(r'^PAGES\["([^"]+)"\]\s*=', source, re.MULTILINE)
    duplicates = sorted({route for route in routes if routes.count(route) > 1})
    if duplicates:
        raise ValueError(f"duplicate route id in PAGES: {', '.join(duplicates)}")
    return routes


def parse_sim2_route_ids(source):
    """Return canonical Sim2 route IDs from its UMD manifest without importing it."""
    ids = re.findall(r"\{\s*id:\s*'([a-z0-9]+(?:-[a-z0-9]+)*)'", source)
    if not ids:
        raise ValueError("cannot locate Sim2 route IDs")
    duplicates = sorted({route for route in ids if ids.count(route) > 1})
    if duplicates:
        raise ValueError(f"duplicate Sim2 route id: {', '.join(duplicates)}")
    return ids


def assert_sorted(values, label):
    if values != sorted(values):
        raise ValueError(f"{label} must be sorted deterministically")
