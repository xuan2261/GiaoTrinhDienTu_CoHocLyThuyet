"""Render the native PDF contact sheet and package only portable council artifacts.

Run after advanced-build-deck.js and advanced-export-deck.ps1:
    python tools/presentation/advanced-preview-deck.py

Requires the installed PyMuPDF (fitz) and Pillow packages. The archive uses an
explicit allowlist, so full-size previews and source/evidence scripts stay out.
"""

from __future__ import annotations

import argparse
import math
import os
import sys
import tempfile
import zipfile
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = REPOSITORY_ROOT / "assets/designs/bao-cao-hoi-dong-nang-cao-33-slides"
ARCHIVE_NAME = "bao-cao-hoi-dong-nang-cao-33-slides.zip"
GRID_NAME = "thumbnail-grid.png"
COLUMNS = 4
NAVY = "#102A43"
ORANGE = "#E87924"
PAPER = "#EDF2F7"
WHITE = "#FFFFFF"


def positive_integer(value: str) -> int:
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("Value must be a positive integer.")
    return number


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--pptx-name", default="bao-cao-hoi-dong-nang-cao.pptx")
    parser.add_argument("--pdf-name", default="bao-cao-hoi-dong-nang-cao.pdf")
    parser.add_argument("--html-name", default="presentation-slides.html")
    parser.add_argument("--guide-name", default="huong-dan-thuyet-trinh.md")
    parser.add_argument("--handout-name", default="handout-in-an-hoi-dong.html")
    parser.add_argument(
        "--handout-pdf",
        type=Path,
        help="Optional handout PDF inside the output directory. If omitted, include handout-in-an-hoi-dong.pdf only when it exists.",
    )
    parser.add_argument("--expected-slides", type=positive_integer, default=34)
    parser.add_argument("--thumbnail-width", type=positive_integer, default=320)
    parser.add_argument("--font", type=Path, help="Path to an Arial TrueType font; otherwise find installed Arial.")
    return parser.parse_args()


def artifact_path(directory: Path, name: str, suffix: str) -> Path:
    relative = Path(name)
    if relative.is_absolute() or ".." in relative.parts or relative.suffix.lower() != suffix:
        raise ValueError(f"Expected an output-relative {suffix} artifact path, received {name!r}.")
    path = (directory / relative).resolve()
    if not path.is_relative_to(directory):
        raise ValueError(f"Artifact must remain inside the output directory: {name}")
    if not path.is_file() or path.stat().st_size == 0:
        raise FileNotFoundError(f"Required artifact is missing or empty: {path}")
    return path


def find_arial(explicit: Path | None) -> Path:
    if explicit is not None:
        path = explicit.expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Arial font does not exist: {path}")
        return path
    windows = Path(os.environ.get("WINDIR", "C:/Windows"))
    candidates = (
        windows / "Fonts/arial.ttf",
        Path("/Library/Fonts/Arial.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/usr/share/fonts/truetype/msttcorefonts/Arial.ttf"),
        Path("/usr/share/fonts/truetype/msttcorefonts/arial.ttf"),
    )
    for path in candidates:
        if path.is_file():
            return path
    raise FileNotFoundError("Arial is not installed at a standard font location. Supply --font /path/to/arial.ttf.")


def render_contact_sheet(pdf: Path, target: Path, font_path: Path, width: int, expected_slides: int) -> int:
    padding = 24
    gap = 16
    header_height = 70
    label_height = 30
    title_font = ImageFont.truetype(str(font_path), 23)
    label_font = ImageFont.truetype(str(font_path), 16)

    with fitz.open(pdf) as document:
        if document.needs_pass:
            raise ValueError(f"Cannot preview a password-protected PDF: {pdf}")
        count = document.page_count
        if count != expected_slides:
            raise ValueError(f"Expected {expected_slides} PDF pages, received {count}; refusing to package an incomplete deck.")
        page_heights = []
        for page in document:
            if page.rect.width <= 0 or page.rect.height <= 0:
                raise ValueError(f"PDF page {page.number + 1} has invalid dimensions.")
            page_heights.append(max(1, round(width * page.rect.height / page.rect.width)))
        image_height = max(page_heights)
        tile_height = image_height + label_height
        rows = math.ceil(count / COLUMNS)
        sheet_width = padding * 2 + COLUMNS * width + (COLUMNS - 1) * gap
        sheet_height = header_height + padding + rows * tile_height + (rows - 1) * gap
        with Image.new("RGB", (sheet_width, sheet_height), PAPER) as sheet:
            drawing = ImageDraw.Draw(sheet)
            drawing.rectangle((0, 0, sheet_width, header_height), fill=NAVY)
            drawing.rectangle((0, header_height - 4, sheet_width, header_height), fill=ORANGE)
            drawing.text((padding, 21), f"BÁO CÁO HỘI ĐỒNG  |  {count} TRANG", font=title_font, fill=WHITE)
            for index, page in enumerate(document):
                column = index % COLUMNS
                row = index // COLUMNS
                left = padding + column * (width + gap)
                top = header_height + padding + row * (tile_height + gap)
                drawing.rectangle((left, top, left + width - 1, top + tile_height - 1), fill=WHITE)
                # Supersample before resizing for legible small text without full-size preview files.
                scale = width * 1.5 / page.rect.width
                pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csRGB, alpha=False)
                with Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples) as raster:
                    with raster.resize((width, page_heights[index]), Image.Resampling.LANCZOS) as thumbnail:
                        image_top = top + (image_height - thumbnail.height) // 2
                        sheet.paste(thumbnail, (left, image_top))
                drawing.line((left, top + image_height, left + width - 1, top + image_height), fill=PAPER, width=1)
                drawing.text((left + 10, top + image_height + 6), f"Trang {index + 1:02d}", font=label_font, fill=NAVY)
            sheet.save(target, format="PNG", optimize=True)
    return count


def package_artifacts(directory: Path, paths: list[Path], grid: Path, target: Path) -> None:
    entries = [(path, path.relative_to(directory).as_posix()) for path in paths]
    entries.append((grid, GRID_NAME))
    names = [name for _, name in entries]
    if len(set(names)) != len(names):
        raise ValueError("The artifact list contains duplicate archive paths.")
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path, name in entries:
            archive.write(path, arcname=name)


def main() -> None:
    args = parse_arguments()
    directory = args.output_dir.expanduser().resolve()
    if not directory.is_dir():
        raise FileNotFoundError(f"Output directory not found: {directory}. Run advanced-build-deck.js first.")
    pptx = artifact_path(directory, args.pptx_name, ".pptx")
    pdf = artifact_path(directory, args.pdf_name, ".pdf")
    artifacts = [
        pptx,
        pdf,
        artifact_path(directory, args.html_name, ".html"),
        artifact_path(directory, args.guide_name, ".md"),
        artifact_path(directory, args.handout_name, ".html"),
    ]
    if args.handout_pdf is not None:
        handout = args.handout_pdf.expanduser()
        if handout.is_absolute():
            handout = handout.resolve().relative_to(directory)
        artifacts.append(artifact_path(directory, str(handout), ".pdf"))
    elif (directory / "handout-in-an-hoi-dong.pdf").exists():
        artifacts.append(artifact_path(directory, "handout-in-an-hoi-dong.pdf", ".pdf"))
    font = find_arial(args.font)
    grid = directory / GRID_NAME
    package = directory / ARCHIVE_NAME
    # Stage both outputs so errors never leave a truncated PNG or ZIP behind.
    with tempfile.TemporaryDirectory(prefix=".advanced-preview-", dir=directory) as temporary:
        temporary_directory = Path(temporary)
        staged_grid = temporary_directory / GRID_NAME
        staged_package = temporary_directory / ARCHIVE_NAME
        count = render_contact_sheet(pdf, staged_grid, font, args.thumbnail_width, args.expected_slides)
        # Archive the new grid under its final portable filename, not the staging directory.
        package_artifacts(directory, artifacts, staged_grid, staged_package)
        os.replace(staged_grid, grid)
        os.replace(staged_package, package)
    print(f"Rendered {count} PDF pages into a {COLUMNS}-column Arial contact sheet: {grid}")
    print(f"Packaged {len(artifacts) + 1} portable artifacts: {package}")
    for path in artifacts:
        print(f"  {path.relative_to(directory).as_posix()}")
    print(f"  {GRID_NAME}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError, fitz.FileDataError, zipfile.BadZipFile) as error:
        print(f"advanced-preview-deck: {error}", file=sys.stderr)
        raise SystemExit(1) from error
