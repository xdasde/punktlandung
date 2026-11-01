#!/usr/bin/env python3
"""Packt assets/*.webp nach icons.js und setzt die App-Version. Vor jedem Release ausführen."""
import base64, hashlib, json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
assets = {p.stem: "data:image/webp;base64," + base64.b64encode(p.read_bytes()).decode()
          for p in sorted((root / "assets").glob("*.webp"))}
icons = "const ASSETS = " + json.dumps(assets) + ";\n"
(root / "icons.js").write_text(icons, encoding="utf8")
html = (root / "index.html").read_text(encoding="utf8")
# Version aus dem Inhalt: jede Änderung löst bei installierten Apps ein Update aus
blank = re.sub(r"const APP_VERSION = '[^']*'|icons\.js\?v=\w+", "", html)
version = hashlib.sha1((blank + icons).encode()).hexdigest()[:8]
html, n = re.subn(r"const APP_VERSION = '[^']*'", f"const APP_VERSION = '{version}'", html)
html, m = re.subn(r"icons\.js\?v=\w+", f"icons.js?v={version}", html)
assert n == 1 and m == 1
(root / "index.html").write_text(html, encoding="utf8")
print(len(assets), "Grafiken,", round(len(icons) / 1024), "KB icons.js,", round(len(html) / 1024), "KB index.html, Version", version)
