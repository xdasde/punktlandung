#!/usr/bin/env python3
"""Bettet assets/*.webp in index.html ein und setzt die App-Version. Vor jedem Release ausführen."""
import base64, hashlib, json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
assets = {p.stem: "data:image/webp;base64," + base64.b64encode(p.read_bytes()).decode()
          for p in sorted((root / "assets").glob("*.webp"))}
html = (root / "index.html").read_text(encoding="utf8")
html, n = re.subn(r"/\*ASSETS\*/.*?/\*END\*/", lambda _: "/*ASSETS*/" + json.dumps(assets) + "/*END*/", html, flags=re.S)
assert n == 1
# Version aus dem Inhalt: jede Änderung löst bei installierten Apps ein Update aus
blank = re.sub(r"const APP_VERSION = '[^']*'", "const APP_VERSION = ''", html)
version = hashlib.sha1(blank.encode()).hexdigest()[:8]
html, n = re.subn(r"const APP_VERSION = '[^']*'", f"const APP_VERSION = '{version}'", html)
assert n == 1
(root / "index.html").write_text(html, encoding="utf8")
print(len(assets), "Grafiken eingebettet,", round(len(html) / 1024), "KB")
