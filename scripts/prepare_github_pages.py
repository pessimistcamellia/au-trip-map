#!/usr/bin/env python3
from pathlib import Path

dist = Path("dist")
index = dist / "index.html"
if not index.exists():
    raise SystemExit("dist/index.html missing")
(dist / "404.html").write_bytes(index.read_bytes())
(dist / ".nojekyll").write_text("")
print("github-pages: wrote dist/404.html and dist/.nojekyll")
