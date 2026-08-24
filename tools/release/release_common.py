"""Shared deterministic release helpers with no third-party dependencies."""
from __future__ import annotations

import hashlib
import json
import os
import posixpath
import re
import shutil
import stat
import zipfile
from datetime import datetime, timezone
from pathlib import Path

SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
GENERATED_FILES = {"release-manifest.json", "SHA256SUMS", "THIRD_PARTY_NOTICES.txt"}


def canonical_json(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def logical_path(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("logical path must be a non-empty string")
    normalized = value.replace("\\", "/")
    if normalized.startswith(("/", "//")) or re.match(r"^[A-Za-z]:", normalized):
        raise ValueError(f"absolute path is forbidden: {value}")
    normalized = posixpath.normpath(normalized)
    if normalized in (".", "..") or normalized.startswith("../"):
        raise ValueError(f"path escapes release root: {value}")
    return normalized


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def epoch_zip_datetime(epoch: int) -> tuple[int, int, int, int, int, int]:
    moment = datetime.fromtimestamp(epoch, tz=timezone.utc)
    if moment.year < 1980:
        raise ValueError("release epoch predates ZIP timestamp support")
    return (moment.year, moment.month, moment.day, moment.hour, moment.minute, moment.second // 2 * 2)


def enumerate_ship_list(root: Path, policy: dict) -> list[tuple[str, Path]]:
    entries: dict[str, Path] = {}
    for item in policy["shipList"]:
        rel = logical_path(item["path"])
        source = root.joinpath(*rel.split("/"))
        if item["kind"] == "file":
            if not source.is_file():
                raise ValueError(f"missing ship-list file: {rel}")
            entries[rel] = source
            continue
        if item["kind"] != "directory" or not source.is_dir():
            raise ValueError(f"missing ship-list directory: {rel}")
        for current, directories, files in os.walk(source, followlinks=False):
            directories.sort()
            files.sort()
            current_path = Path(current)
            for name in directories + files:
                candidate = current_path / name
                if candidate.is_symlink():
                    raise ValueError(f"symlink forbidden in release payload: {candidate.relative_to(root)}")
            for name in files:
                candidate = current_path / name
                relative = candidate.relative_to(root).as_posix()
                entries[logical_path(relative)] = candidate
    for required in policy["requiredPaths"]:
        if logical_path(required) not in entries:
            raise ValueError(f"missing required release path: {required}")
    return sorted(entries.items())


def copy_payload(entries: list[tuple[str, Path]], staging: Path) -> None:
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)
    for relative, source in entries:
        destination = staging.joinpath(*relative.split("/"))
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)


def payload_records(staging: Path, entries: list[tuple[str, Path]]) -> list[dict]:
    return [
        {"path": relative, "sizeBytes": (staging / relative).stat().st_size, "sha256": sha256_file(staging / relative)}
        for relative, _ in entries
    ]


def write_zip(staging: Path, archive: Path, epoch: int) -> None:
    timestamp = epoch_zip_datetime(epoch)
    files = sorted((path for path in staging.rglob("*") if path.is_file()), key=lambda path: path.relative_to(staging).as_posix())
    archive.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for source in files:
            relative = source.relative_to(staging).as_posix()
            info = zipfile.ZipInfo(relative, timestamp)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.flag_bits |= 0x800
            bundle.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
