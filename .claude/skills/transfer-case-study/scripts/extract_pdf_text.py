#!/usr/bin/env python3
"""Extract text from a PDF without poppler/sharp tooling.

The legacy innerexplorer.com case-study PDFs are simple FlateDecode PDFs; this
decompresses their content streams and pulls the text-show operators (Tj/TJ).
Output is rough (kerning arrays leave artifacts) but complete enough to recover
every sentence, citation, and figure — including details the web page omits.

Usage: python3 extract_pdf_text.py <file.pdf> [max_chars]
"""

import re
import sys
import zlib


def extract(path: str) -> str:
    data = open(path, 'rb').read()
    out = []
    for stream in re.findall(rb'stream\r?\n(.*?)endstream', data, re.S):
        try:
            d = zlib.decompress(stream)
        except Exception:
            continue
        for m in re.findall(rb'\((.*?)(?<!\\)\)\s*Tj|\[(.*?)\]\s*TJ', d, re.S):
            chunk = m[0] or m[1]
            # Strip TJ kerning numbers between string segments, unescape parens.
            txt = re.sub(rb'\)\s*-?[\d.]+\s*\(', b'', chunk)
            txt = txt.replace(rb'\(', b'(').replace(rb'\)', b')').replace(rb'\\', b'\\')
            out.append(txt.decode('latin-1', 'ignore'))
    text = ' '.join(out)
    # PDFs with Type0/CIDFontType2 fonts store glyph indices, not ASCII, so the
    # regex pass yields nothing (hit on Goddard-MS.pdf, 2026-06). pypdf follows
    # the ToUnicode CMaps and recovers full text — fall back to it.
    if len(text.strip()) < 40:
        try:
            from pypdf import PdfReader

            return '\n'.join(p.extract_text() or '' for p in PdfReader(path).pages)
        except ImportError:
            sys.stderr.write(
                'No plain-text Tj/TJ operators found (likely CID-encoded fonts). '
                'Install the fallback: pip3 install --user pypdf\n'
            )
    return text


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    text = extract(sys.argv[1])
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else len(text)
    print(text[:limit])
