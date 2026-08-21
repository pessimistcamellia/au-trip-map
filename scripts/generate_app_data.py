#!/usr/bin/env python3
"""将权威 Markdown 与地图 JSON 转成前端静态数据。"""

from __future__ import annotations

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
                "_raw": {
                    "highlights": cells[4],
                    "booking": cells[5],
                    "weather": cells[6],
                },
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


def normalized(value: str) -> str:
    return re.sub(r"[\W_]+", "", value, flags=re.UNICODE).lower()


def place_aliases(place: dict) -> list[str]:
    values = [str(place.get("name", "")), str(place.get("name_en", "") or "")]
    aliases: set[str] = set()
    for value in values:
        for part in re.split(r"[／/（）()·,，]", value):
            candidate = normalized(
                re.sub(
                    r"机场周边营地|野生动物园|国家公园|游客中心|观景台|灯塔步道|"
                    r"雨林步道|住宿区|住宿|天气缓冲|机场|镇",
                    "",
                    part,
                )
            )
            if len(candidate) >= 3:
                aliases.add(candidate)
        candidate = normalized(value)
        if len(candidate) >= 3:
            aliases.add(candidate)
    return sorted(aliases, key=len, reverse=True)


def match_schedule_place(text: str, places: list[dict]) -> dict | None:
    haystack = normalized(text)
    matches: list[tuple[int, dict]] = []
    for place in places:
        score = max(
            (len(alias) for alias in place_aliases(place) if alias in haystack),
            default=0,
        )
        if score:
            matches.append((score, place))
    return max(matches, key=lambda item: item[0])[1] if matches else None


def matching_places(text: str, places: list[dict]) -> list[dict]:
    haystack = normalized(text)
    return [
        place
        for place in places
        if any(alias in haystack for alias in place_aliases(place))
    ]


def split_information(value: str) -> list[str]:
    chunks: list[str] = []
    for line in plain(value).splitlines():
        chunks.extend(
            chunk.strip()
            for chunk in re.split(r"(?<=[。；])", line)
            if chunk.strip()
        )
    return chunks


def assign_day_information(day: dict, day_places: list[dict]) -> None:
    for place in day_places:
        place["dayInfo"] = {
            "booking": [],
            "highlights": [],
            "weather": [],
            "links": [],
        }

    unassigned = {"booking": [], "highlights": [], "weather": [], "links": []}
    for field in ("booking", "highlights", "weather"):
        for line in plain(day[field]).splitlines():
            line_matches: list[dict] = []
            for chunk in split_information(line):
                matches = matching_places(chunk, day_places)
                if matches:
                    line_matches = matches
                elif line_matches:
                    matches = line_matches
                if not matches:
                    unassigned[field].append(chunk)
                    continue
                for place in matches:
                    place["dayInfo"][field].append(chunk)

    assigned_link_urls: set[str] = set()
    for raw_value in day["_raw"].values():
        for line in raw_value.split("<br/>"):
            matches = matching_places(line, day_places)
            if not matches:
                continue
            for link in links_in(line):
                assigned_link_urls.add(link["url"])
                for place in matches:
                    if link not in place["dayInfo"]["links"]:
                        place["dayInfo"]["links"].append(link)
    unassigned["links"] = [
        link for link in day["links"] if link["url"] not in assigned_link_urls
    ]

    day["unassigned"] = unassigned
    del day["_raw"]


def rhythm_title(text: str) -> str:
    title = re.split(r"[；。]", text, maxsplit=1)[0]
    return title[:30] + ("…" if len(title) > 30 else "")


def merge_time(first: str, last: str) -> str:
    if first == last:
        return first
    start = first.split("-", 1)[0]
    end = last.rsplit("-", 1)[-1]
    return f"{start}-{end}" if "-" in first or "-" in last else f"{first} / {last}"


def parse_rhythm(schedule: str, day_places: list[dict]) -> list[dict]:
    nodes: list[dict] = []
    used_place_ids: set[str] = set()
    for line in schedule.splitlines():
        match = re.match(
            r"^(?:【[^】]+】)?\s*(?:可选\s*)?([^：]{2,28})：\s*(.+)$",
            line.strip(),
        )
        if not match:
            continue
        time, text = match.groups()
        previous = nodes[-1] if nodes else None
        place = match_schedule_place(
            text,
            [
                candidate
                for candidate in day_places
                if candidate["id"] not in used_place_ids
            ],
        )
        if not place:
            repeated_place = match_schedule_place(text, day_places)
            if previous and repeated_place and previous["placeId"] == repeated_place["id"]:
                place = repeated_place
        node = {
            "id": f"rhythm-{len(nodes) + 1}",
            "order": len(nodes) + 1,
            "time": plain(time),
            "title": place["name"] if place else rhythm_title(plain(text)),
            "text": plain(text),
            "placeId": place["id"] if place else None,
            "sequence": place.get("sequence") if place else None,
            "priority": place.get("priority") if place else None,
            "lat": place.get("lat") if place else None,
            "lng": place.get("lng") if place else None,
        }
        if place and previous and previous["placeId"] == place["id"]:
            previous["time"] = merge_time(previous["time"], node["time"])
            previous["text"] += "\n" + node["text"]
            continue
        nodes.append(node)
        if place:
            used_place_ids.add(place["id"])
    for order, node in enumerate(nodes, start=1):
        node["id"] = f"rhythm-{order}"
        node["order"] = order
    return nodes


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

    days = parse_days(markdown)
    for day in days:
        day_places = sorted(
            [
            place
            for place in places
            if place.get("day") == day["day"] and place.get("status") == "visit"
            ],
            key=lambda place: place.get("order_in_day") or 999,
        )
        for sequence, place in enumerate(day_places, start=1):
            place["sequence"] = sequence
        day["rhythm"] = parse_rhythm(day["schedule"], day_places)
        assign_day_information(day, day_places)

    for place in places:
        place.setdefault("sequence", None)

    output = {
        "trip": {
            **itinerary["trip"],
            "startDate": "2026-09-24",
            "endDate": "2026-10-06",
            "timezone": "Australia/Hobart",
            "myMapsUrl": "https://www.google.com/maps/d/edit?mid=10eTWDmGzd0nwA4sFuDWaxVEcO5QP0_4",
            "sourceRevision": 444,
        },
        "days": days,
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
        f"links={sum(len(place['links']) for place in places)} "
        f"unassigned={sum(len(day['unassigned'][field]) for day in days for field in ('booking', 'highlights', 'weather'))}"
    )


if __name__ == "__main__":
    main()
