#!/usr/bin/env python3
"""Rebuild 每日主行程 rows in doc-content.md from days-raw.txt.

days-raw.txt is the authoritative per-day source; doc-content.md mirrors the
Feishu document, where each day is one 7-column table row.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "days-raw.txt"
DOC = ROOT / "doc-content.md"

SECTIONS = [
    "日期／区域",
    "行程规划",
    "住宿建议（含真实车宿地点）",
    "当日行程＋交通与时间",
    "重点体验",
    "预约与注意事项",
    "天气",
]


def parse_days(text: str) -> dict[int, dict[str, str]]:
    days: dict[int, dict[str, str]] = {}
    blocks = re.split(r"^=+$", text, flags=re.M)
    for block in blocks:
        m = re.search(r"^DAY (\d+)$", block, flags=re.M)
        if not m:
            continue
        day = int(m.group(1))
        sections: dict[str, str] = {}
        parts = re.split(r"^--- (.+?) ---$", block, flags=re.M)
        for name, body in zip(parts[1::2], parts[2::2]):
            sections[name.strip()] = body.strip()
        days[day] = sections
    return days


def to_cell(body: str) -> str:
    lines = [line.rstrip() for line in body.splitlines() if line.strip()]
    return "<br/>".join(lines)


def build_row(sections: dict[str, str]) -> str:
    cells = []
    for name in SECTIONS:
        if name not in sections:
            raise SystemExit(f"missing section: {name}")
        cells.append(to_cell(sections[name]))
    return "| " + " | ".join(cells) + " |"


def main() -> None:
    days = parse_days(RAW.read_text())
    doc = DOC.read_text()
    targets = [int(a) for a in sys.argv[1:]] or sorted(days)
    changed = 0
    for day in targets:
        sections = days[day]
        row = build_row(sections)
        label = to_cell(sections["日期／区域"]).split("<br/>")[0]
        pattern = re.compile(
            r"^\| " + re.escape(label) + r"<br/>.*$", flags=re.M
        )
        if not pattern.search(doc):
            raise SystemExit(f"day {day}: row not found for {label}")
        doc = pattern.sub(lambda _m: row.replace("\\", "\\\\"), doc, count=1)
        changed += 1
        print(f"day {day}: row rebuilt ({len(row)} chars)")
    DOC.write_text(doc)
    print(f"doc-content.md: {changed} row(s) updated")


if __name__ == "__main__":
    main()
