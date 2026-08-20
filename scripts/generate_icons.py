#!/usr/bin/env python3
"""使用标准库生成无外部依赖的几何 PWA 图标。"""

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "icons"


def chunk(kind: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def save_icon(size: int, name: str, maskable: bool = False) -> None:
    sea = (23, 107, 135, 255)
    foam = (238, 246, 247, 255)
    dark = (16, 43, 52, 255)
    pixels = [[sea for _ in range(size)] for _ in range(size)]
    margin = int(size * (0.18 if maskable else 0.1))
    radius = size * 0.32
    center = size / 2

    for y in range(size):
        for x in range(size):
            if (x - center) ** 2 + (y - center) ** 2 < radius**2:
                pixels[y][x] = foam

    stroke = max(5, size // 34)
    left = int(size * 0.34)
    right = int(size * 0.66)
    top = int(size * 0.3)
    bottom = int(size * 0.7)
    mid = int(size * 0.53)
    for y in range(top, bottom):
        progress = (y - top) / max(1, bottom - top)
        inset = int(progress * size * 0.1)
        for x in range(left + inset, left + inset + stroke):
            pixels[y][x] = dark
        for x in range(right - inset - stroke, right - inset):
            pixels[y][x] = dark
    for y in range(mid, mid + stroke):
        for x in range(int(size * 0.41), int(size * 0.59)):
            pixels[y][x] = dark

    raw = b"".join(
        b"\x00" + b"".join(bytes(pixel) for pixel in row) for row in pixels
    )
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(
            b"IHDR",
            struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0),
        )
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    (OUTPUT / name).write_bytes(png)


OUTPUT.mkdir(parents=True, exist_ok=True)
save_icon(192, "icon-192.png")
save_icon(512, "icon-512.png")
save_icon(512, "icon-maskable-512.png", maskable=True)
print("icons=3")
