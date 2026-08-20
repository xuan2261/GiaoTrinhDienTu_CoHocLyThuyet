from __future__ import annotations

import argparse
import os
import shutil
import tempfile
from pathlib import Path

from PIL import Image

WORKSPACE = Path(__file__).resolve().parent
PROJECT_ROOT = WORKSPACE.parent
SOURCE_ROOT = WORKSPACE / "output"
DESTINATION_ROOT = PROJECT_ROOT / "assets" / "gifs"

EXPECTED_PATHS = (
    "ch1/hinh-1-06.gif",
    "ch1/hinh-1-09.gif",
    "ch1/hinh-1-28b.gif",
    "ch1/hinh-1-34.gif",
    "ch1/hinh-1-35.gif",
    "ch1/hinh-1-minh-hoa-02.gif",
    "ch2/hinh-2-07.gif",
    "ch2/hinh-2-09.gif",
    "ch2/hinh-2-15.gif",
    "ch2/hinh-2-16.gif",
    "ch2/hinh-2-22.gif",
    "ch2/hinh-2-26.gif",
    "ch2/hinh-2-34.gif",
    "ch3/hinh-3-06.gif",
    "ch3/hinh-3-10.gif",
    "ch3/hinh-3-11.gif",
    "ch3/hinh-3-17.gif",
    "ch3/hinh-3-20.gif",
    "ch3/hinh-3-21.gif",
    "ch3/hinh-3-22.gif",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def validate_gif(path: Path) -> None:
    require(path.is_file(), f"missing GIF: {path}")
    require(path.stat().st_size <= 12 * 1024 * 1024, f"GIF exceeds 12 MiB: {path}")

    with Image.open(path) as image:
        require(image.format == "GIF", f"not a GIF: {path}")
        require(bool(getattr(image, "is_animated", False)), f"not animated: {path}")
        require(image.n_frames == 60, f"expected 60 frames: {path}")
        require(image.info.get("loop") == 0, f"expected infinite loop metadata: {path}")
        require(max(image.size) <= 1200, f"edge exceeds 1200 px: {path}")
        durations: list[int | None] = []
        for frame_index in range(image.n_frames):
            image.seek(frame_index)
            durations.append(image.info.get("duration"))
        require(durations == [60] * 60, f"expected 60 ms per frame: {path}")


def validate_source() -> None:
    actual = {
        path.relative_to(SOURCE_ROOT).as_posix()
        for path in SOURCE_ROOT.glob("ch*/*.gif")
        if path.is_file()
    }
    expected = set(EXPECTED_PATHS)
    require(
        actual == expected,
        f"source set mismatch: missing={sorted(expected - actual)}, extra={sorted(actual - expected)}",
    )
    for relative in EXPECTED_PATHS:
        validate_gif(SOURCE_ROOT / relative)


def publish() -> None:
    validate_source()
    DESTINATION_ROOT.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(
        prefix=".gif-publish-", dir=DESTINATION_ROOT.parent
    ) as temporary:
        staged = Path(temporary)
        for relative in EXPECTED_PATHS:
            source = SOURCE_ROOT / relative
            staged_file = staged / relative
            staged_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, staged_file)

        for relative in EXPECTED_PATHS:
            destination = DESTINATION_ROOT / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            os.replace(staged / relative, destination)

    validate_published()
    total_mib = sum((DESTINATION_ROOT / path).stat().st_size for path in EXPECTED_PATHS) / (1024 * 1024)
    print(f"PASS published {len(EXPECTED_PATHS)} GIFs to assets/gifs ({total_mib:.2f} MiB)")


def validate_published() -> None:
    published = {
        path.relative_to(DESTINATION_ROOT).as_posix()
        for path in DESTINATION_ROOT.glob("ch*/*.gif")
        if path.is_file()
    }
    require(published == set(EXPECTED_PATHS), "published GIF set is incomplete")
    for relative in EXPECTED_PATHS:
        validate_gif(DESTINATION_ROOT / relative)


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish or validate the approved GIF asset set.")
    parser.add_argument("--check", action="store_true", help="validate published assets without writing")
    arguments = parser.parse_args()
    if arguments.check:
        validate_published()
        print(f"PASS validated {len(EXPECTED_PATHS)} published GIFs")
        return
    publish()


if __name__ == "__main__":
    main()
