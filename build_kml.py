#!/usr/bin/env python3
"""Generate layered KML for Google My Maps from itinerary.json."""
import json
import math
import re
from html import escape
from pathlib import Path
from xml.etree import ElementTree as ET

out_dir = Path.home() / "au-trip-map"
data = json.loads((out_dir / "itinerary.json").read_text())

ICON = "http://maps.google.com/mapfiles/kml/paddle/{}.png"
LODGING_ICON = "http://maps.google.com/mapfiles/kml/pal2/icon10.png"
# 住宿图标标记「当晚睡哪里」；d9-05 营位尚未下单，该状态由行程文字承载，不影响图标。
CONFIRMED_LODGING_IDS = {
    "d4-03",
    "d5-02",
    "d5-03",
    "d8-05",
    "d9-05",
    "d10-03",
    "d11-06",
    "d12-07",
}
# Iron Creek Bay Estate 只在 D5–6 图层保留一个地图点；其余日期仍在路书中展示。
KML_EXCLUDED_IDS = {"d6-04", "d7-02", "d8-00"}

# Max 10 folders including skip. Days merged where needed for My Maps limit.
LAYERS = [
    (
        "D2 9/25 珀斯→塞万提斯",
        "sty_d2",
        ICON.format("red-circle"),
        lambda p: p.get("day") == 2,
        "ff0000ff",
    ),
    (
        "D3 9/26 塞万提斯→卡尔巴里",
        "sty_d3",
        ICON.format("orange-circle"),
        lambda p: p.get("day") == 3,
        "ff0080ff",
    ),
    (
        "D4 9/27 卡尔巴里→珀斯",
        "sty_d4",
        ICON.format("ylw-circle"),
        lambda p: p.get("day") == 4,
        "ff00ffff",
    ),
    (
        "D5–6 9/28–29 霍巴特／塔斯曼岛当日团",
        "sty_d56",
        ICON.format("grn-circle"),
        lambda p: p.get("day") in (5, 6),
        "ff00ff00",
    ),
    (
        "D7 9/30 霍巴特／玛丽亚岛当日团",
        "sty_d7",
        ICON.format("ltblu-circle"),
        lambda p: p.get("day") == 7,
        "ffffff00",
    ),
    (
        "D8 10/1 霍巴特→酒杯湾→朗塞斯顿",
        "sty_d8",
        ICON.format("blu-circle"),
        lambda p: p.get("day") == 8,
        "ffff0000",
    ),
    (
        "D9–10 10/2–3 摇篮山／朗塞斯顿飞墨尔本",
        "sty_d910",
        ICON.format("purple-circle"),
        lambda p: p.get("day") in (9, 10),
        "ff800080",
    ),
    (
        "D11 10/4 墨尔本→十二门徒",
        "sty_d11",
        ICON.format("pink-circle"),
        lambda p: p.get("day") == 11,
        "ffc472ff",
    ),
    (
        "D12–13 10/5–6 大洋路东段／St Kilda／墨尔本",
        "sty_d1213",
        ICON.format("wht-circle"),
        lambda p: p.get("day") in (12, 13),
        "ff00a5ff",
    ),
    (
        "本次不看",
        "sty_skip",
        ICON.format("wht-blank"),
        lambda p: p.get("status") == "skip",
        "ff808080",
    ),
]


def short_label(p):
    name = p["name"]
    name = re.sub(r"（[^）]*）", "", name)
    name = name.replace("／", "/")
    if len(name) > 18:
        name = name[:17] + "…"
    if p["status"] == "skip":
        return f"跳过 {name}"
    day = p["day"]
    order = p.get("order_in_day")
    if order is None or order == 0:
        return f"D{day} {name}"
    return f"D{day}-{order} {name}"


def desc_html(p):
    parts = []
    if p.get("date"):
        day_s = f" · 第{p['day']}天" if p.get("day") else ""
        parts.append(f"<b>日期</b> {escape(p['date'])}{day_s}")
    if p.get("order_in_day") is not None:
        parts.append(f"<b>当日序号</b> {p['order_in_day']}")
    parts.append(f"<b>状态</b> {'本次要看' if p['status']=='visit' else '本次不看'}")
    if p.get("highlights"):
        parts.append(
            f"<b>看点</b><br/>{escape(p['highlights']).replace(chr(10), '<br/>')}"
        )
    if p.get("weather"):
        parts.append(
            f"<b>天气</b><br/>{escape(p['weather']).replace(chr(10), '<br/>')}"
        )
    if p.get("duration"):
        parts.append(f"<b>停留时长</b> {escape(p['duration'])}")
    if p.get("transport"):
        parts.append(f"<b>交通</b> {escape(p['transport'])}")
    if p.get("notes"):
        notes = escape(p["notes"]).replace("\n", "<br/>")
        parts.append(f"<b>备注</b><br/>{notes}")
    if p.get("name_en"):
        parts.append(f"<b>英文／检索名</b> {escape(p['name_en'])}")
    if p.get("geocode_source"):
        parts.append(f"<b>坐标来源</b> {escape(str(p['geocode_source']))}")
    return "<br/><br/>".join(parts)


def hav_km(a, b):
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    return 6371 * 2 * math.asin(math.sqrt(h))


def should_draw_line(coords):
    if len(coords) < 3:
        return False
    for i in range(len(coords) - 1):
        if hav_km(coords[i], coords[i + 1]) > 600:
            return False
    return True


def indent(elem, level=0):
    i = "\n" + level * "  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        for child in elem:
            indent(child, level + 1)
        if not child.tail or not child.tail.strip():
            child.tail = i
    if level and (not elem.tail or not elem.tail.strip()):
        elem.tail = i


def build_document(layers_subset, doc_name):
    kml = ET.Element("kml", xmlns="http://www.opengis.net/kml/2.2")
    doc = ET.SubElement(kml, "Document")
    ET.SubElement(doc, "name").text = doc_name

    style_ids = set()
    for _name, sid, icon, _filt, line_color in layers_subset:
        if sid in style_ids:
            continue
        style_ids.add(sid)
        style = ET.SubElement(doc, "Style", id=sid)
        icon_style = ET.SubElement(style, "IconStyle")
        ET.SubElement(icon_style, "scale").text = "1.0"
        ic = ET.SubElement(icon_style, "Icon")
        ET.SubElement(ic, "href").text = icon
        ls = ET.SubElement(doc, "Style", id=sid + "_line")
        lls = ET.SubElement(ls, "LineStyle")
        c = line_color
        if len(c) == 8:
            c = "7f" + c[2:]
        ET.SubElement(lls, "color").text = c
        ET.SubElement(lls, "width").text = "3"

    lodging_style = ET.SubElement(doc, "Style", id="sty_confirmed_lodging")
    lodging_icon_style = ET.SubElement(lodging_style, "IconStyle")
    ET.SubElement(lodging_icon_style, "scale").text = "1.0"
    lodging_icon = ET.SubElement(lodging_icon_style, "Icon")
    ET.SubElement(lodging_icon, "href").text = LODGING_ICON

    for folder_name, sid, _icon, filt, _line_color in layers_subset:
        folder = ET.SubElement(doc, "Folder")
        ET.SubElement(folder, "name").text = folder_name
        pts_in_folder = [
            p
            for p in data["places"]
            if p.get("lat") is not None
            and p.get("id") not in KML_EXCLUDED_IDS
            and filt(p)
        ]
        pts_in_folder.sort(
            key=lambda p: (
                p.get("day") or 99,
                p.get("order_in_day") if p.get("order_in_day") is not None else 99,
                p["name"],
            )
        )
        for p in pts_in_folder:
            pm = ET.SubElement(folder, "Placemark")
            ET.SubElement(pm, "name").text = short_label(p)
            style_id = (
                "sty_confirmed_lodging"
                if p.get("id") in CONFIRMED_LODGING_IDS
                else sid
            )
            ET.SubElement(pm, "styleUrl").text = f"#{style_id}"
            ET.SubElement(pm, "description").text = desc_html(p)
            pt = ET.SubElement(pm, "Point")
            ET.SubElement(pt, "coordinates").text = f"{p['lng']},{p['lat']},0"

        if folder_name != "本次不看":
            days = sorted({p["day"] for p in pts_in_folder if p.get("day")})
            for d in days:
                day_pts = [
                    p
                    for p in pts_in_folder
                    if p.get("day") == d
                    and p.get("order_in_day") is not None
                    and p["order_in_day"] > 0
                    # 仅串联每日主行程打点；愿望清单额外候选点不进折线
                    and str(p.get("id", "")).startswith("d")
                    and not str(p.get("id", "")).startswith("d5-hobart")
                    # Quest Savoy 是已订备选，只保留点位，不纳入当前行车折线。
                    and p.get("id") != "d5-02"
                ]
                day_pts.sort(key=lambda x: x["order_in_day"])
                coords = [(p["lat"], p["lng"]) for p in day_pts]
                if should_draw_line(coords):
                    ls_pm = ET.SubElement(folder, "Placemark")
                    ET.SubElement(ls_pm, "name").text = f"D{d} 当日路线"
                    ET.SubElement(ls_pm, "styleUrl").text = f"#{sid}_line"
                    ET.SubElement(ls_pm, "description").text = f"第{d}天按顺序串联（示意）"
                    line = ET.SubElement(ls_pm, "LineString")
                    ET.SubElement(line, "tessellate").text = "1"
                    ET.SubElement(line, "coordinates").text = " ".join(
                        f"{p['lng']},{p['lat']},0" for p in day_pts
                    )

        ET.SubElement(folder, "description").text = f"点位数：{len(pts_in_folder)}"

    indent(kml)
    return ET.tostring(kml, encoding="utf-8", xml_declaration=True)


def main():
    combined = build_document(LAYERS, data["trip"]["name"])
    (out_dir / "au-trip-map.kml").write_bytes(combined)

    layers_dir = out_dir / "layers"
    layers_dir.mkdir(exist_ok=True)
    # 只清理本脚本生成的图层，保留手工维护的集合点图层。
    preserved_layer_names = {"集合点_霍巴特跟团.kml"}
    for old in layers_dir.glob("*.kml"):
        if old.name in preserved_layer_names:
            continue
        old.unlink()
    for layer in LAYERS:
        safe = re.sub(r"[^\w\-]+", "_", layer[0], flags=re.UNICODE).strip("_")[:50]
        (layers_dir / f"{safe}.kml").write_bytes(build_document([layer], layer[0]))

    print("Wrote", out_dir / "au-trip-map.kml")
    print("layers:")
    for p in sorted(layers_dir.glob("*.kml")):
        print(" ", p)
    for folder_name, _sid, icon, filt, _lc in LAYERS:
        n = sum(1 for p in data["places"] if p.get("lat") is not None and filt(p))
        color = icon.rsplit("/", 1)[-1].replace(".png", "")
        print(f"LAYER\t{folder_name}\t{color}\t{n}")


if __name__ == "__main__":
    main()
