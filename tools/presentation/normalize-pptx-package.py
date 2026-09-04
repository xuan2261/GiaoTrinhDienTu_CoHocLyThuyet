import os
import sys
import tempfile
from pathlib import Path


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
