from __future__ import annotations

import hashlib
import json
import re
import struct
from pathlib import Path, PurePosixPath

REMOTE_RE = re.compile(r"(?:https?:)?//", re.IGNORECASE)
DEPENDENCY_RE = re.compile(r"(?:src|href|data-gif-src)=[\"']([^\"']+)[\"']", re.IGNORECASE)


def fail(message: str) -> None:
    raise ValueError(message)


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"cannot read JSON {path}: {error}")
    if not isinstance(value, dict):
        fail(f"JSON root must be an object: {path}")
    return value


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def require_text(value, label: str) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"missing {label}")
    return value


def unique(items: list[dict], key: str, label: str) -> set[str]:
    values = [item.get(key) for item in items]
    require(all(isinstance(value, str) and value for value in values), f"missing {label} {key}")
    require(len(values) == len(set(values)), f"duplicate {label} IDs")
    return set(values)


def repository_path(root: Path, logical: str) -> Path:
    require_text(logical, "logical path")
    require("\\" not in logical and not logical.startswith("/"), f"invalid logical path: {logical}")
    pure = PurePosixPath(logical.split("#", 1)[0])
    require(".." not in pure.parts, f"path escapes repository: {logical}")
    path = (root / Path(*pure.parts)).resolve()
    require(root == path or root in path.parents, f"path escapes repository: {logical}")
    return path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_file(root: Path, record: dict, label: str) -> Path:
    logical = require_text(record.get("path"), f"{label} path")
    path = repository_path(root, logical)
    require(path.is_file(), f"missing referenced file: {logical}")
    expected_hash = require_text(record.get("sha256"), f"{label} hash")
    require(re.fullmatch(r"[0-9a-f]{64}", expected_hash) is not None, f"invalid hash: {logical}")
    require(sha256(path) == expected_hash, f"stale hash: {logical}")
    if "bytes" in record:
        require(record["bytes"] == path.stat().st_size, f"stale size: {logical}")
    return path


def html_dependencies(root: Path, logical_html: str) -> set[str]:
    html_path = repository_path(root, logical_html)
    text = html_path.read_text(encoding="utf-8-sig")
    dependencies: set[str] = set()
    base = PurePosixPath(logical_html).parent
    for match in DEPENDENCY_RE.finditer(text):
        value = match.group(1)
        if value.startswith(("data:", "#")):
            continue
        require(REMOTE_RE.search(value) is None, f"remote dependency: {logical_html} -> {value}")
        normalized = str(PurePosixPath(base, value))
        parts: list[str] = []
        for part in PurePosixPath(normalized).parts:
            if part == "..":
                require(bool(parts), f"path escapes repository: {value}")
                parts.pop()
            elif part != ".":
                parts.append(part)
        dependency = "/".join(parts)
        require(repository_path(root, dependency).is_file(), f"missing prototype dependency: {dependency}")
        dependencies.add(dependency)
    return dependencies


def require_anchor(root: Path, record: dict, label: str) -> None:
    anchor = record.get("anchor")
    if anchor is None:
        return
    require_text(anchor, f"{label} anchor")
    path = repository_path(root, record["path"])
    text = path.read_text(encoding="utf-8-sig")
    pattern = re.compile(rf"\bid=[\"']{re.escape(anchor)}[\"']")
    require(pattern.search(text) is not None, f"missing fallback anchor: {record['path']}#{anchor}")


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()[:24]
    require(data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR", f"fallback is not PNG: {path}")
    return struct.unpack(">II", data[16:24])
