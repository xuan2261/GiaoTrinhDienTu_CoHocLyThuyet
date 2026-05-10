"""
Synchronize chapter images from the source DOCX.

This project needs image extraction and HTML figure placement to stay in sync,
so this command delegates to the main DOCX extractor in write mode.

Usage:
  python tools/extract_all_images.py --input CoHocLyThuyet_Full_New.docx
"""
import argparse
import os
import sys
from types import SimpleNamespace

sys.stdout.reconfigure(encoding="utf-8")

import extract_docx


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="CoHocLyThuyet_Full_New.docx")
    parser.add_argument("--output", default=os.getcwd())
    args = parser.parse_args()

    print("Image sync uses tools/extract_docx.py to keep figures and fragments aligned.")
    extract_docx.extract(SimpleNamespace(input=args.input, output=args.output, write=True))


if __name__ == "__main__":
    main()
