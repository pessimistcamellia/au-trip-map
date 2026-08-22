#!/usr/bin/env python3
"""把人工调研的类别／美食／停车资料合并进 trip-data.json，并把日级天气拆到每个行程点。

天气原文是「A／B／C 约 10-21°C；D 约 12-25°C」这种一段覆盖多地的写法，
直接整段挂到每个点上会让机场的天气里出现其它所有目的地。这里先按地名直配，
配不上的用坐标就近归属到最近的温度分段。
"""

from __future__ import annotations

import json
import math
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "src" / "data" / "trip-data.json"
EXTRAS_DIR = ROOT / "data" / "extras"

WEATHER_PREFIX = re.compile(r"^天气（[^）]*）：")
TEMPERATURE = re.compile(r"-?\d+\s*[-~－]\s*-?\d+\s*°C")
CLAUSE_SPLIT = re.compile(r"[；;，,。]")

VALID_CATEGORIES = {"attraction", "lodging", "transport", "restaurant", "market"}
VALID_FEES = {"free", "paid", "mixed", "unknown"}

# 天气分段里出现、但本身不是行程点的地名，用于就近归属。
GAZETTEER: Dict[str, Tuple[float, float]] = {
    "珀斯": (-31.9523, 115.8613),
    "卡弗舍姆": (-31.8753, 115.9747),
    "兰斯林": (-31.0167, 115.33),
    "塞万提斯": (-30.499, 115.065),
    "杰拉尔顿": (-28.776, 114.614),
    "格雷戈里港": (-28.195, 114.256),
    "卡尔巴里": (-27.711, 114.165),
    "天然桥": (-27.79, 114.13),
    "霍巴特": (-42.8826, 147.3257),
    "亚瑟港": (-43.14, 147.87),
    "塔斯曼半岛": (-43.05, 147.9),
    "特里阿布纳": (-42.508, 147.915),
    "科尔斯湾": (-42.125, 148.29),
    "比舍诺": (-41.873, 148.301),
    "朗塞斯顿": (-41.4332, 147.1441),
    "美丽角": (-41.16, 146.82),
    "摇篮山": (-41.64, 145.95),
    "德文波特": (-41.18, 146.365),
    "巴斯海峡": (-40.0, 145.5),
    "吉朗": (-38.1499, 144.3617),
    "安格尔西": (-38.406, 144.185),
    "艾瑞斯湾": (-38.465, 144.105),
    "洛恩": (-38.54, 143.975),
    "肯尼特河": (-38.665, 143.84),
    "阿波罗湾": (-38.755, 143.67),
    "大奥特韦国家公园": (-38.75, 143.55),
    "坎贝尔港": (-38.619, 142.995),
    "墨尔本": (-37.8136, 144.9631),
}


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFKC", value).lower()
    text = text.replace("’", "'").replace("‘", "'")
    return re.sub(r"[\s（）()·・／/,，、]", "", text)


def core_name(name: str) -> str:
    """去掉「（住宿）」「（镇）」这类用途后缀，只留地名主体。"""
    return re.sub(r"（(住宿|住宿区|镇|天气缓冲|塔州精神号)）", "", name).strip()


def haversine(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lat1, lng1 = math.radians(a[0]), math.radians(a[1])
    lat2, lng2 = math.radians(b[0]), math.radians(b[1])
    h = (
        math.sin((lat2 - lat1) / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2
    )
    return 2 * 6371 * math.asin(math.sqrt(h))


class WeatherSegment:
    def __init__(self, text: str) -> None:
        self.text = text.strip()
        match = TEMPERATURE.search(self.text)
        raw = re.sub(r"\s", "", match.group(0)) if match else None
        self.temperature = raw.replace("~", "-").replace("－", "-") if raw else None
        self.tokens = self._tokens()
        self.notes: List[str] = []

    def _tokens(self) -> List[str]:
        head = TEMPERATURE.split(self.text)[0]
        head = re.sub(r"(通常|常见|清晨|约|开放海岸|周边)", "", head)
        return [part.strip() for part in re.split(r"[／/]", head) if part.strip()]

    @property
    def note(self) -> str:
        tail = TEMPERATURE.split(self.text)[-1].strip("，,。；; ")
        parts = [part for part in [tail, *self.notes] if part]
        return "；".join(parts)


def split_weather(raw: str) -> Tuple[List[WeatherSegment], str]:
    """拆成若干「温度分段」与一段当日共同提示。

    温度分段之间夹着的补充说明（例如「但峡谷内无风晴天体感可明显更热」）挂回前一段，
    最后一个温度分段之后的内容才算当日共同提示，避免整段文字被丢弃。
    """
    if not raw:
        return [], ""
    body = WEATHER_PREFIX.sub("", raw).strip()
    if not TEMPERATURE.search(body):
        return [], body

    boundaries: List[int] = [0]
    for match in CLAUSE_SPLIT.finditer(body):
        boundaries.append(match.end())
    boundaries.append(len(body))
    clauses = [
        body[boundaries[index] : boundaries[index + 1]]
        for index in range(len(boundaries) - 1)
    ]
    last_temperature_index = max(
        index for index, clause in enumerate(clauses) if TEMPERATURE.search(clause)
    )

    segments: List[WeatherSegment] = []
    for index, clause in enumerate(clauses[: last_temperature_index + 1]):
        cleaned = clause.strip("；;，,。 ")
        if not cleaned:
            continue
        if TEMPERATURE.search(cleaned):
            segments.append(WeatherSegment(cleaned))
        elif segments:
            segments[-1].notes.append(cleaned)

    advisory = "".join(clauses[last_temperature_index + 1 :]).strip("；;，,。 ")
    return segments, advisory


def resolve_token(token: str, places_by_name: Dict[str, Tuple[float, float]]) -> Optional[Tuple[float, float]]:
    key = normalize(token)
    if not key:
        return None
    for name, coordinate in places_by_name.items():
        if key and (key in name or name in key):
            return coordinate
    for name, coordinate in GAZETTEER.items():
        if normalize(name) in key:
            return coordinate
    return None


def place_name_keys(place: Dict[str, Any]) -> List[str]:
    keys = [normalize(core_name(place["name"]))]
    if place.get("name_en"):
        english = place["name_en"].split(",")[0]
        keys.append(normalize(english))
    return [key for key in keys if key]


def match_segment(
    place: Dict[str, Any],
    segments: List[WeatherSegment],
    places_by_name: Dict[str, Tuple[float, float]],
) -> Tuple[Optional[WeatherSegment], str, str]:
    """返回（命中的温度分段、粒度、依据地名）。"""
    keys = place_name_keys(place)
    for segment in segments:
        for token in segment.tokens:
            token_key = normalize(token)
            if not token_key:
                continue
            if any(key in token_key or token_key in key for key in keys):
                return segment, "place", token

    if place.get("lat") is None or place.get("lng") is None:
        return (segments[0] if segments else None), "regional", ""

    origin = (place["lat"], place["lng"])
    best: Optional[Tuple[float, WeatherSegment, str]] = None
    for segment in segments:
        for token in segment.tokens:
            coordinate = resolve_token(token, places_by_name)
            if coordinate is None:
                continue
            distance = haversine(origin, coordinate)
            if best is None or distance < best[0]:
                best = (distance, segment, token)
    if best is not None:
        return best[1], "nearby", best[2]
    return (segments[0] if segments else None), "regional", ""


def build_weather(data: Dict[str, Any]) -> Dict[str, int]:
    places_by_name: Dict[str, Tuple[float, float]] = {}
    for place in data["places"]:
        if place.get("lat") is None or place.get("lng") is None:
            continue
        for key in place_name_keys(place):
            places_by_name.setdefault(key, (place["lat"], place["lng"]))

    day_weather = {day["day"]: day.get("weather", "") for day in data["days"]}
    stats = {"place": 0, "nearby": 0, "regional": 0, "none": 0}

    for place in data["places"]:
        raw = day_weather.get(place.get("day")) or place.get("weather") or ""
        segments, advisory = split_weather(raw)
        segment, granularity, basis = match_segment(place, segments, places_by_name)
        if segment is None:
            place["weatherDetail"] = None
            stats["none"] += 1
            continue
        place["weatherDetail"] = {
            "temperatureRange": segment.temperature,
            "granularity": granularity,
            "basis": basis,
            "note": segment.note,
            "dayAdvisory": advisory,
            "source": "长年气候参考，非逐日预报",
        }
        stats[granularity] += 1
    return stats


def clean_restaurant(raw: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": str(raw.get("name") or "").strip(),
        "nameEn": raw.get("nameEn") or None,
        "lat": raw.get("lat"),
        "lng": raw.get("lng"),
        "rating": raw.get("rating"),
        "ratingCount": raw.get("ratingCount"),
        "ratingSource": raw.get("ratingSource") or None,
        "ratingCheckedAt": raw.get("ratingCheckedAt") or None,
        "distance": raw.get("distance") or None,
        "priceLevel": raw.get("priceLevel") or None,
        "cuisine": raw.get("cuisine") or None,
        "recommended": str(raw.get("recommended") or "").strip(),
        "hours": raw.get("hours") or None,
        "sourceUrl": raw.get("sourceUrl") or None,
    }


def clean_lot(raw: Dict[str, Any]) -> Dict[str, Any]:
    fee = raw.get("fee") if raw.get("fee") in VALID_FEES else "unknown"
    return {
        "name": str(raw.get("name") or "").strip(),
        "nameEn": raw.get("nameEn") or None,
        "lat": raw.get("lat"),
        "lng": raw.get("lng"),
        "fee": fee,
        "feeNote": raw.get("feeNote") or None,
        "capacity": raw.get("capacity") or None,
        "surface": raw.get("surface") or None,
        "note": raw.get("note") or None,
    }


def load_extras() -> Tuple[Dict[str, Any], List[str]]:
    merged: Dict[str, Any] = {}
    problems: List[str] = []
    if not EXTRAS_DIR.exists():
        return merged, problems
    for path in sorted(EXTRAS_DIR.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            problems.append(f"{path.name} 解析失败：{error}")
            continue
        for place_id, entry in (payload.get("places") or {}).items():
            if place_id in merged:
                problems.append(f"{place_id} 在多个 extras 文件中重复")
            merged[place_id] = entry
    return merged, problems


def apply_extras(data: Dict[str, Any]) -> Dict[str, int]:
    extras, problems = load_extras()
    for problem in problems:
        print(f"  ! {problem}", file=sys.stderr)

    stats = {"category": 0, "food": 0, "parking": 0, "restaurants": 0, "lots": 0}
    known_ids = {place["id"] for place in data["places"]}
    for place_id in extras:
        if place_id not in known_ids:
            print(f"  ! extras 中的 {place_id} 不在行程数据里", file=sys.stderr)

    for place in data["places"]:
        entry = extras.get(place["id"]) or {}
        category = entry.get("category")
        if category in VALID_CATEGORIES:
            place["category"] = category
            stats["category"] += 1

        food = entry.get("food") or {}
        restaurants = [clean_restaurant(item) for item in (food.get("restaurants") or [])]
        restaurants = [item for item in restaurants if item["name"]]
        if food.get("summary") or restaurants:
            place["food"] = {
                "summary": str(food.get("summary") or "").strip(),
                "restaurants": restaurants,
            }
            stats["food"] += 1
            stats["restaurants"] += len(restaurants)

        parking = entry.get("parking") or {}
        lots = [clean_lot(item) for item in (parking.get("lots") or [])]
        lots = [item for item in lots if item["name"]]
        rules = [str(rule).strip() for rule in (parking.get("rules") or []) if str(rule).strip()]
        sources = [
            {"label": str(source.get("label") or "来源").strip(), "url": source["url"]}
            for source in (parking.get("sources") or [])
            if source.get("url")
        ]
        if parking.get("summary") or lots or rules:
            place["parking"] = {
                "summary": str(parking.get("summary") or "").strip(),
                "lots": lots,
                "rules": rules,
                "sources": sources,
            }
            stats["parking"] += 1
            stats["lots"] += len(lots)
    return stats


def main() -> int:
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    weather_stats = build_weather(data)
    extra_stats = apply_extras(data)
    DATA_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        "  天气归属：直配 {place} 个／就近 {nearby} 个／区域 {regional} 个／缺失 {none} 个".format(
            **weather_stats
        )
    )
    print(
        "  调研合并：类别 {category} 个／美食 {food} 个（{restaurants} 家）／停车 {parking} 个（{lots} 处）".format(
            **extra_stats
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
