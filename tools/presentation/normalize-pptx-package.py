import os
import sys
import re
import tempfile
from pathlib import Path
import zipfile


FIXED_TIMESTAMP = b"2000-01-01T00:00:00Z"


def normalize_package_bytes(name: str, payload: bytes) -> bytes:
    if name == "docProps/core.xml":
        payload = re.sub(
            rb"(<dcterms:(?:created|modified)[^>]*>)[^<]*(</dcterms:(?:created|modified)>)",
            rb"\g<1>" + FIXED_TIMESTAMP + rb"\g<2>",
            payload,
        )
    if name == "ppt/notesMasters/notesMaster1.xml":
        payload = re.sub(rb'(<p14:creationId[^>]* val=")[0-9]+(")', rb"\g<1>1\g<2>", payload)
    return payload


def rewrite_deterministic_package(path: Path) -> None:
    package_temp = path.with_suffix(path.suffix + ".normalized")
    with zipfile.ZipFile(path, "r") as source:
        entries = [
            (name, normalize_package_bytes(name, source.read(name)))
            for name in sorted(source.namelist())
        ]
    with zipfile.ZipFile(package_temp, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as target:
        for name, payload in entries:
            info = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o600 << 16
            target.writestr(info, payload)
    os.replace(package_temp, path)


def normalize_presentation_package(path: Path) -> None:
    """Let PowerPoint rewrite its own notes-master relationships on Windows.

    PptxGenJS emits a presentation.xml ordering accepted by PowerPoint but rejected
    by strict Open XML validators. Moving notesMasterIdLst alone makes the package
    schema-valid but unreadable by PowerPoint because the related IDs also need an
    Office-level rewrite. A native SaveAs performs the complete repair atomically.
    """
    path = Path(path).resolve()
    if os.name != "nt":
        return

    import win32com.client

    fd, temporary_name = tempfile.mkstemp(suffix=".pptx", dir=path.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    temporary.unlink()

    app = None
    presentation = None
    try:
        app = win32com.client.DispatchEx("PowerPoint.Application")
        presentation = app.Presentations.Open(str(path), True, False, False)
        presentation.SaveAs(str(temporary), 24)
        presentation.Close()
        presentation = None
        app.Quit()
        app = None
        rewrite_deterministic_package(temporary)
        os.replace(temporary, path)
    finally:
        if presentation is not None:
            presentation.Close()
        if app is not None:
            app.Quit()
        if temporary.exists():
            temporary.unlink()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: normalize-pptx-package.py <presentation.pptx>")
    normalize_presentation_package(Path(sys.argv[1]))
