#!/usr/bin/env python3
"""Bettet assets/*.webp in index.html ein, damit die App eine einzelne Datei bleibt."""
import base64, json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
assets = {p.stem: "data:image/webp;base64," + base64.b64encode(p.read_bytes()).decode()
          for p in sorted((root / "assets").glob("*.webp"))}
html = (root / "index.html").read_text(encoding="utf8")
html, n = re.subn(r"/\*ASSETS\*/.*?/\*END\*/", lambda _: "/*ASSETS*/" + json.dumps(assets) + "/*END*/", html, flags=re.S)
assert n == 1
(root / "index.html").write_text(html, encoding="utf8")
print(len(assets), "Grafiken eingebettet,", round(len(html) / 1024), "KB")
