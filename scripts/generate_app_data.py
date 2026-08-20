#!/usr/bin/env python3
"""将权威 Markdown 与地图 JSON 转成前端静态数据。"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src" / "data" / "trip-data.json"


def links_in(value: str) -> list[dict[str, str]]:
    return [
        {"label": label, "url": url}
        for label, url in re.findall(r"\[([^\]]+)\]\((https?://[^)]+)\)", value)
    ]


def plain(value: str) -> str:
    value = re.sub(r"<span[^>]*>", "", value)
    value = value.replace("</span>", "").replace("<br/>", "\n")
    value = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r"\1", value)
    value = re.sub(r"</?[^>]+>", "", value)
    value = (
        value.replace("**", "")
        .replace("  \n", "\n")
        .replace("—", "-")
        .replace("–", "-")
    )
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def parse_days(markdown: str) -> list[dict]:
    rows = []
    in_daily = False
    for line in markdown.splitlines():
        if line == "# 每日主行程":
            in_daily = True
            continue
        if in_daily and line.startswith("## 车宿统一判断标准"):
            break
        if not in_daily or not line.startswith("| **"):
            continue
        cells = line.strip("|").split("|")
        if len(cells) != 7:
            continue
        date_match = re.search(r"(\d{1,2})/(\d{1,2})\s+周(.)", cells[0])
        if not date_match:
            continue
        month, day, weekday = date_match.groups()
        iso_date = f"2026-{int(month):02d}-{int(day):02d}"
        day_number = (int(month) == 9 and int(day) - 23) or int(day) + 7
        rows.append(
            {
                "day": day_number,
                "date": iso_date,
                "weekday": f"周{weekday}",
                "region": plain(cells[0].split("<br/>")[-1]),
                "route": plain(cells[1]),
                "lodging": plain(cells[2]),
                "schedule": plain(cells[3]),
                "highlights": plain(cells[4]),
                "booking": plain(cells[5]),
                "weather": plain(cells[6]),
                "links": links_in(line),
            }
        )
    return rows


def parse_sections(value: str) -> dict[str, str]:
    labels = {
        "【愿望清单·景点／自然】": "nature",
        "【愿望清单·人文】": "culture",
        "【愿望清单·本次建议】": "suggestion",
        "【人文／文化】": "culture",
        "【人文】": "culture",
        "【本次建议】": "suggestion",
    }
    sections: dict[str, str] = {"practical": ""}
    pattern = "(" + "|".join(re.escape(label) for label in labels) + ")"
    parts = re.split(pattern, value)
    sections["practical"] = plain(parts[0])
    for index in range(1, len(parts), 2):
        sections[labels[parts[index]]] = plain(parts[index + 1])
    return sections


def place_priority(place: dict) -> str:
    text = " ".join(
        str(place.get(key, ""))
        for key in ("name", "highlights", "duration", "notes")
    )
    if place["status"] == "skip":
        return "skip"
    if "可选" in text or "二选一" in text or "可取消" in text:
        return "optional"
    return "main"


def main() -> None:
    markdown = (ROOT / "doc-content.md").read_text()
    itinerary = json.loads((ROOT / "itinerary.json").read_text())
    wishlist = json.loads((ROOT / "wishlist-raw.json").read_text())

    places = []
    for place in itinerary["places"]:
        enriched = dict(place)
        enriched["priority"] = place_priority(place)
        enriched["sections"] = parse_sections(place.get("notes", ""))
        enriched["links"] = links_in(
            " ".join(
                str(place.get(key, ""))
                for key in ("highlights", "weather", "notes")
            )
        )
        for key in ("highlights", "weather", "duration", "transport", "notes"):
            enriched[key] = plain(str(place.get(key, "")))
        places.append(enriched)

    output = {
        "trip": {
            **itinerary["trip"],
            "startDate": "2026-09-24",
            "endDate": "2026-10-06",
            "timezone": "Australia/Hobart",
            "myMapsUrl": "https://www.google.com/maps/d/edit?mid=10eTWDmGzd0nwA4sFuDWaxVEcO5QP0_4",
            "sourceRevision": 444,
        },
        "days": parse_days(markdown),
        "places": places,
        "wishlistCount": len(wishlist),
        "carStayStandard": plain((ROOT / "carstay-section.md").read_text()),
        "animals": plain((ROOT / "animal-section.md").read_text()),
        "pending": [
            "Tower Hill 与 Warrnambool 是否彻底放弃",
            "Loch Ard Gorge 是否固定保留",
            "关键住宿、交通和门票的实际预订状态",
            "租车合同是否允许在持牌营地内睡车",
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(
        f"days={len(output['days'])} places={len(places)} "
        f"links={sum(len(place['links']) for place in places)}"
    )


if __name__ == "__main__":
    main()
