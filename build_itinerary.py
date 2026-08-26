#!/usr/bin/env python3
"""Build itinerary.json from curated daily stops + Feishu wishlist."""
import json
import re
from datetime import date, timedelta
from pathlib import Path

out_dir = Path.home() / "au-trip-map"
wishes = json.loads((out_dir / "wishlist-raw.json").read_text())
existing_itinerary_path = out_dir / "itinerary.json"
existing_coordinates = {}
if existing_itinerary_path.exists():
    existing_places = json.loads(existing_itinerary_path.read_text()).get("places", [])
    existing_coordinates = {
        place["id"]: (
            place.get("lat"),
            place.get("lng"),
            place.get("geocode_source"),
        )
        for place in existing_places
    }
existing_coordinates.update(
    {
        "d4-03": (-31.943206, 115.9308002, "google_maps"),
        "d5-02": (-42.88223, 147.328943, "google_maps"),
        "d6-00": (-42.8833098, 147.3334905, "google_maps"),
        "d6-04": (-42.88223, 147.328943, "google_maps"),
        "d7-00": (-42.8830842, 147.3317785, "google_maps"),
        "d7-02": (-42.88223, 147.328943, "google_maps"),
        "d8-00": (-42.88223, 147.328943, "google_maps"),
        "d8-05": (-41.4451315, 147.1381985, "google_maps"),
        "d9-05": (-41.58018, 145.937834, "google_maps"),
        "d10-02": (-41.5453, 147.2139, "known"),
        "d10-03": (-37.694241, 144.874784, "google_maps"),
        "d11-01": (-38.6655, 143.1048, "known"),
        "d11-02": (-38.67, 143.1, "known"),
        "d11-03": (-38.619, 142.995, "known"),
        "d11-06": (-38.6353855, 143.1102845, "google_maps"),
        "d12-02": (-38.755, 143.67, "known"),
        "d12-03": (-38.665, 143.84, "known"),
        "d12-04": (-38.545, 143.975, "known"),
        "d12-09": (-38.475, 144.025, "known"),
        "d12-08": (-37.8648, 144.9731, "known"),
        "d12-07": (-37.8092243, 144.9627017, "google_maps"),
    }
)

base = date(2026, 9, 24)


def dstr(day: int) -> str:
    return (base + timedelta(days=day - 1)).isoformat()


days_txt = (out_dir / "days-raw.txt").read_text()
day_weather = {}
for i in range(1, 14):
    m = re.search(rf"DAY {i}\n(.+?)(?=\n\n\n=======|\Z)", days_txt, re.S)
    if not m:
        continue
    wm = re.search(r"--- 天气 ---\n(.+?)(?:\n\n|\Z)", m.group(1), re.S)
    day_weather[i] = wm.group(1).strip() if wm else ""

# (id, name_zh, name_en, day, order, highlights, duration, transport, notes)
visits = [
    (
        "d2-01",
        "珀斯机场",
        "Perth Airport, Western Australia",
        2,
        1,
        "入境、取行李、早餐与取车；本日行程起点。",
        "约3.5小时（入境取车）",
        "机场落地后取车",
        "04:20—07:45入境取车；之后驾车前往卡弗舍姆。",
    ),
    (
        "d2-02",
        "卡弗舍姆野生动物园",
        "Caversham Wildlife Park, Whiteman WA",
        2,
        2,
        "西澳原生动物集中展示、袋鼠喂食、袋熊与农场表演，以及考拉近距离体验；动物上午较活跃，09:00入园最合适。",
        "约3—4小时",
        "驾车约22公里自珀斯机场",
        "成人票AUD37/人；抱考拉另付AUD35/人，09:00纪念品店先到先得；12:00场，身高≥150cm。",
    ),
    (
        "d2-03",
        "兰斯林沙丘",
        "Lancelin Sand Dunes, Lancelin WA",
        2,
        3,
        "白色移动沙丘、流畅沙脊和开阔地平线；14:30以后侧光更有层次。",
        "约1小时",
        "驾车约135公里自卡弗舍姆",
        "步行免费；可租板。普通租车不要驶入沙地；若入境延误超60分钟优先删除本点。",
    ),
    (
        "d2-04",
        "尖峰石阵／南邦国家公园",
        "Pinnacles Desert, Nambung National Park WA",
        2,
        4,
        "黄沙中的密集石灰岩柱与海岸沙丘地质景观；最佳为日落前60—90分钟至蓝调。",
        "至日落后",
        "驾车约77公里自兰斯林",
        "标准车辆入园AUD17/车；Discovery Centre园内移动约2公里。日落后约20公里到塞万提斯入住。",
    ),
    (
        "d2-05",
        "塞万提斯（住宿）",
        "Cervantes, Western Australia",
        2,
        5,
        "当晚住宿／车宿 overnight。",
        "过夜",
        "驾车约20公里自尖峰石阵",
        "首选酒店/小屋；车宿候选RAC Cervantes Holiday Park或Nambung Station Stay，须确认允许车内过夜。",
    ),
    (
        "d3-01",
        "塞蒂斯湖",
        "Lake Thetis, Cervantes WA",
        3,
        1,
        "湖岸stromatolites（叠层石）及其“活着的古老生态系统”意义；清晨安静、光线柔和。",
        "约30分钟（可选）",
        "驾车约3公里",
        "可选短停；若前一晚疲劳则取消。免费无需预约。",
    ),
    (
        "d3-02",
        "杰拉尔顿海滨",
        "Geraldton Foreshore, Geraldton WA",
        3,
        2,
        "海滨草地、港口城市节奏与补给便利；中午只作恢复体力的轻松停留。",
        "约1.5小时",
        "驾车约221公里自塞万提斯",
        "午餐、加油和采购。",
    ),
    (
        "d3-03",
        "粉红湖",
        "Hutt Lagoon Lookout, Port Gregory WA",
        3,
        3,
        "高盐度、微藻与工业生产共同形成粉红或淡紫色湖面；晴天约11:00—15:00高太阳时颜色通常更明显。",
        "约1小时15分",
        "驾车约98+14公里经Port Gregory",
        "只在公共观景点；颜色不保证；不进入生产区或私人土地。",
    ),
    (
        "d3-04",
        "卡尔巴里（镇）",
        "Kalbarri, Western Australia",
        3,
        4,
        "镇内入住；傍晚可选红崖或天然桥看海岸夕照。",
        "过夜",
        "驾车约54公里自粉红湖",
        "首选镇内酒店；车宿仅镇内正规营地。红崖约5公里／天然桥约14公里，二选一。",
    ),
    (
        "d3-05",
        "红崖",
        "Red Bluff Lookout, Kalbarri WA",
        3,
        5,
        "高崖与层叠海岸线；最佳为日落前45—60分钟。",
        "约45—60分钟",
        "镇中心约5公里",
        "与Natural Bridge二选一；海崖强风时远离崖缘。",
    ),
    (
        "d4-01",
        "卡尔巴里天空步道",
        "Kalbarri Skywalk, Kalbarri National Park WA",
        4,
        1,
        "两座悬挑平台伸出默奇森峡谷上方；红色Tumblagooda sandstone峡谷尺度与河谷弯曲。",
        "约1小时",
        "驾车约38公里自卡尔巴里镇",
        "最佳日出后至08:30；入园费AUD17/车。",
    ),
    (
        "d4-02",
        "自然之窗",
        "Natures Window, Kalbarri National Park WA",
        4,
        2,
        "天然砂岩“窗框”把默奇森河弯道纳入画面；约1公里往返轻量短线。",
        "约1.5小时",
        "Skywalk约3公里",
        "高温或睡眠不足可取消；每人至少2—3升饮水。",
    ),
    (
        "d4-03",
        "Sweet Home Property（住宿）",
        "Sweet Home Property, 4A Wallace Street, Belmont WA 6104",
        4,
        3,
        "已确认的珀斯机场附近住宿；次日搭乘VA594前往霍巴特。",
        "过夜",
        "自卡尔巴里经杰拉尔顿南下约420公里",
        "9月27日入住、9月28日退房；按订单说明自助入住。",
    ),
    (
        "d5-01",
        "霍巴特机场",
        "Hobart Airport, Tasmania",
        5,
        1,
        "跨州航班落地；取行李后前往霍巴特CBD。",
        "约1小时",
        "维珍澳洲 VA594 珀斯→霍巴特",
        "09:50—16:00飞行；落地后前往Quest Savoy。",
    ),
    (
        "d5-02",
        "Quest Savoy（连住三晚）",
        "Quest Savoy, 38 Elizabeth Street, Hobart TAS 7000",
        5,
        2,
        "霍巴特CBD已确认住宿；步行可达两天跟团集合点。",
        "9月28日—10月1日连住三晚",
        "机场约18公里／25—35分钟",
        "同一房间连住三晚；地址38 Elizabeth Street。",
    ),
    (
        "d6-00",
        "Franklin Wharf（集合点）",
        "Franklin Wharf, Hobart TAS",
        6,
        1,
        "Tasman Island当日团的Hobart集合区域；最终位置以电子票为准。",
        "提前15分钟到达",
        "从Quest Savoy步行约4—7分钟",
        "选择含Hobart往返接送的产品。",
    ),
    (
        "d6-01",
        "塔斯曼岛海上巡游",
        "Tasman Island Cruises Booking Centre, Port Arthur TAS",
        6,
        2,
        "从海上看Cape Pillar、Tasman Island、海蚀拱门和海洞，寻找海豹、海豚、鲸类与海鸟。",
        "以旅行团订单为准",
        "Hobart往返当日团",
        "巡游、陆上停靠和用餐顺序以Klook／GetYourGuide电子票为准。",
    ),
    (
        "d6-02",
        "塔斯曼拱门／魔鬼厨房",
        "Tasman Arch, Tasman Peninsula TAS",
        6,
        3,
        "若旅行团包含此站，可看天然拱门、深沟和崖壁。",
        "以旅行团安排为准",
        "旅行团接送",
        "工程状态须临行复查。",
    ),
    (
        "d6-03",
        "棋盘石",
        "Tessellated Pavement, Eaglehawk Neck TAS",
        6,
        4,
        "若旅行团包含此站，可看岩层节理与盐风化形成的规则纹理。",
        "以旅行团安排为准",
        "旅行团接送",
        "湿滑或涨潮时只在高处观察。",
    ),
    (
        "d6-04",
        "Quest Savoy（返程住宿）",
        "Quest Savoy, 38 Elizabeth Street, Hobart TAS 7000",
        6,
        5,
        "旅行团送回霍巴特后继续入住同一房间。",
        "第2晚",
        "集合点步行返回",
        "不搬行李。",
    ),
    (
        "d7-00",
        "20 Davey Street（集合点）",
        "Tasmanian Travel and Information Centre, 20 Davey Street, Hobart TAS",
        7,
        1,
        "Maria Island当日团的Hobart集合区域；最终位置以电子票为准。",
        "提前15分钟到达",
        "从Quest Savoy步行约4—7分钟",
        "选择含Hobart—Triabunna往返接送的产品。",
    ),
    (
        "d7-01",
        "玛丽亚岛",
        "Darlington, Maria Island Tasmania",
        7,
        2,
        "Darlington草地观察袋熊、袋鼠和斑胸草雁；按潮汐走彩绘崖或化石崖二选一。",
        "全天",
        "Hobart往返旅行团＋渡轮",
        "自带午餐饮水；产品包含范围以订单为准。",
    ),
    (
        "d7-02",
        "Quest Savoy（返程住宿）",
        "Quest Savoy, 38 Elizabeth Street, Hobart TAS 7000",
        7,
        3,
        "旅行团送回霍巴特后继续入住同一房间。",
        "第3晚",
        "集合点步行返回",
        "收拾行李并确认10月1日自驾安排。",
    ),
    (
        "d8-00",
        "Quest Savoy（出发）",
        "Quest Savoy, 38 Elizabeth Street, Hobart TAS 7000",
        8,
        1,
        "退房后从霍巴特出发前往Freycinet。",
        "约06:00出发",
        "驾车约195公里至Wineglass Bay Car Park",
        "本日总驾驶约370公里。",
    ),
    (
        "d8-01",
        "酒杯湾观景台",
        "Wineglass Bay Lookout, Freycinet TAS",
        8,
        2,
        "弧形白沙湾、蓝绿色海水和粉红花岗岩山体。",
        "约1.5—2小时",
        "往返步行约2.6公里Grade 3",
        "不下海滩；需有效parks pass。",
    ),
    (
        "d8-02",
        "图维尔角灯塔步道",
        "Cape Tourville Lighthouse, Freycinet TAS",
        8,
        3,
        "约600米轻量环线；高处看菲欣纳海岸、The Nuggets和外海。",
        "约40分钟",
        "驾车约7公里",
        "白天视野最好。",
    ),
    (
        "d8-03",
        "蜜月湾",
        "Honeymoon Bay, Freycinet TAS",
        8,
        4,
        "海湾短停、休息和拍摄花岗岩海岸。",
        "约35分钟",
        "驾车约6公里",
        "轻量短停。",
    ),
    (
        "d8-05",
        "Centennial Inn on Bathurst（住宿）",
        "Centennial Inn on Bathurst, 120 Bathurst Street, Launceston TAS 7250",
        8,
        5,
        "已确认的朗塞斯顿住宿，为次日塔玛河谷与摇篮山行程休息。",
        "过夜",
        "自科尔斯湾驾车约176公里／2.5—3小时",
        "10月1日入住、10月2日退房。",
    ),
    (
        "d9-01",
        "鸭嘴兽之家",
        "Platypus House, Beauty Point TAS",
        9,
        1,
        "室内／半室内环境白天稳定观察鸭嘴兽和短喙针鼹。",
        "约1小时（10:00导览）",
        "驾车约48公里自朗塞斯顿",
        "预订10:00第一场；成人约AUD29.95/人。",
    ),
    (
        "d9-02",
        "鸽子湖",
        "Dove Lake, Cradle Mountain TAS",
        9,
        2,
        "冰川湖、dolerite山体、pencil pine与高山荒原经典湖景；只走湖东岸短段。",
        "约1小时",
        "shuttle约10公里自游客中心",
        "不走Cradle Summit，不强求完整环湖。",
    ),
    (
        "d9-03",
        "罗尼溪",
        "Ronny Creek, Cradle Mountain TAS",
        9,
        3,
        "草原和木栈道观察野生袋熊的轻量地点；下午后段接近动物活跃窗口。",
        "约1小时",
        "shuttle",
        "若延误可缩短或移到10/3上午。",
    ),
    (
        "d9-04",
        "摇篮山恶魔保护园",
        "Devils at Cradle, Cradle Mountain TAS",
        9,
        4,
        "After Dark Feeding Tour观察袋獾、东袋鼬与斑尾袋鼬；结合面部肿瘤病保育讲解。",
        "约1小时15分（17:30）",
        "驾车约5—8公里",
        "成人AUD40/人须预约。",
    ),
    (
        "d9-05",
        "Discovery Parks – Cradle Mountain（营地）",
        "Discovery Parks Cradle Mountain, 3832 Cradle Mountain Road, Cradle Mountain TAS 7306",
        9,
        5,
        "小屋售罄，改订可搭帐篷的无电营位；营地厨房、卫浴与投币洗衣可用。",
        "过夜（帐篷）",
        "自Devils@Cradle短程驾车",
        "选Unpowered Site 16 Feet；14 Feet gravel营位官方禁止搭帐篷。国家公园区域禁明火。",
    ),
    (
        "d10-01",
        "摇篮山（延长游览）",
        "Cradle Mountain Visitor Centre, TAS",
        10,
        1,
        "航班改到傍晚后可从容用完上午与午后：补罗尼溪／鸽子湖，或走魔法森林步道与铅笔松瀑布短线。",
        "约08:45—13:30",
        "公园内shuttle",
        "赶飞机日不等末班接驳；鸽子湖最迟12:30—13:00开始返程候车。",
    ),
    (
        "d10-02",
        "朗塞斯顿机场",
        "Launceston Airport, Western Junction TAS",
        10,
        2,
        "还车、加满油后搭约20:00航班飞墨尔本，取代原德文波特夜航。",
        "17:30到还车区，约20:00起飞",
        "自摇篮山驾车约147公里／2小时15分",
        "14:30从游客中心出发；Jetstar柜台起飞前120分钟开放。班号与实际时刻以票面为准。",
    ),
    (
        "d10-03",
        "Mantra Melbourne Airport（住宿）",
        "Mantra Melbourne Airport, 2 Trade Park Drive, Tullamarine VIC 3043",
        10,
        3,
        "已确认的墨尔本机场住宿；落地当晚不进CBD，直接休息。",
        "过夜",
        "墨尔本机场约4分钟，有免费按需接送",
        "10月3日入住、10月4日退房。",
    ),
    (
        "d11-01",
        "十二门徒岩",
        "Twelve Apostles, Great Ocean Road VIC",
        11,
        1,
        "抵达后先完成沉船海岸核心主观景台。",
        "约1小时",
        "自墨尔本市区取车后经内陆约220公里",
        "免费无需预约。",
    ),
    (
        "d11-02",
        "吉布森阶梯",
        "Gibson Steps, Great Ocean Road VIC",
        11,
        2,
        "从崖底仰望高崖和岩柱；受落石、潮位和大浪影响。",
        "约40分钟",
        "十二门徒附近",
        "关闭时不进入。",
    ),
    (
        "d11-03",
        "坎贝尔港",
        "Port Campbell, Victoria",
        11,
        3,
        "午餐、加油和恢复体力。",
        "约1小时",
        "驾车约12公里",
        "不安排西向远程景点。",
    ),
    (
        "d11-06",
        "Twelve Apostles Motel & Country Retreat（住宿）",
        "Twelve Apostles Motel & Country Retreat, 314 Booringa Road, Princetown VIC 3269",
        11,
        5,
        "已确认的十二门徒景区附近住宿。",
        "过夜",
        "景区短程驾车",
        "10月4日入住、10月5日退房。",
    ),
    (
        "d12-01",
        "梅茨雨林步道",
        "Maits Rest Rainforest Walk, Great Otway National Park VIC",
        12,
        1,
        "约800米温带雨林轻量环线。",
        "约45分钟",
        "从Princetown向东行驶",
        "关闭或雨势过大时跳过。",
    ),
    (
        "d12-02",
        "阿波罗湾",
        "Apollo Bay, Victoria",
        12,
        2,
        "大洋路海湾小镇，早餐或补给短停。",
        "约30分钟",
        "Maits Rest以东",
        "不安排长时间停留。",
    ),
    (
        "d12-03",
        "肯尼特河",
        "Kennett River, Victoria",
        12,
        3,
        "桉树林中寻找野生考拉与鸟类。",
        "约40分钟",
        "阿波罗湾以东约23公里",
        "不喂食、不进入私人地。",
    ),
    (
        "d12-04",
        "泰迪观景台",
        "Teddy's Lookout, Lorne VIC",
        12,
        4,
        "俯瞰海崖公路、河谷和海湾。",
        "约30分钟",
        "继续沿大洋路东行",
        "延误时可删除。",
    ),
    (
        "d12-09",
        "大洋路纪念拱门",
        "Great Ocean Road Memorial Arch, Eastern View VIC",
        12,
        5,
        "理解大洋路作为战争纪念工程的历史。",
        "约20分钟",
        "正式停车区短停",
        "随后直接前往St Kilda。",
    ),
    (
        "d12-08",
        "圣基尔达企鹅观赏平台",
        "St Kilda Pier Penguin Viewing Platform, Melbourne VIC",
        12,
        6,
        "St Kilda Pier／Breakwater高架平台观看小蓝企鹅归巢。",
        "第一场约19:57起（票面为准）",
        "从大洋路东段直接驶往St Kilda",
        "免费但必须持票；目标第一场。",
    ),
    (
        "d12-07",
        "Brady Hotels Central Melbourne（住宿）",
        "Brady Hotels Central Melbourne, 30 Little La Trobe Street, Melbourne VIC 3000",
        12,
        7,
        "已确认的墨尔本CBD住宿；企鹅观赏后入住。",
        "过夜",
        "St Kilda至酒店约7公里",
        "10月5日入住、10月6日退房。",
    ),
    (
        "d13-01",
        "维多利亚女王市场",
        "Queen Victoria Market, Melbourne VIC",
        13,
        1,
        "1878年延续至今的工作型市场、鲜食大厅、移民饮食和露天棚架；周二07:00—08:00适合早餐并看生鲜摊开市。",
        "约1小时",
        "酒店步行约0.5—2公里",
        "周二06:00—15:00；specialty shopping 09:00才开。当天不去远郊。",
    ),
]

extra_visit = [
    (
        "wv-loch",
        "洛克阿德峡谷",
        "Loch Ard Gorge, Port Campbell VIC",
        11,
        4,
        "沉船海岸经典峡谷；按开放步道游览。",
        "约1小时15分",
        "坎贝尔港附近",
        "10月4日下午完成；提车或路况延误时可缩短。",
    ),
]


def find_wish(keywords):
    for w in wishes:
        if w["_status"] != "visit":
            continue
        blob = w["_name"]
        if any(k.lower() in blob.lower() for k in keywords):
            return w
    return None


enrich_map = {
    "d2-02": ["Caversham"],
    "d2-03": ["Lancelin"],
    "d2-04": ["Pinnacles", "Nambung"],
    "d3-03": ["Hutt"],
    "d4-01": ["Kalbarri"],
    "d4-02": ["Kalbarri"],
    "d7-01": ["Maria"],
    "d8-01": ["Wineglass"],
    "d9-01": ["Platypus"],
    "d9-02": ["Cradle"],
    "d9-04": ["Devils"],
    "d11-01": ["Twelve"],
    "d11-03": ["Port Campbell"],
    "d12-02": ["Apollo"],
    "d12-08": ["St Kilda"],
    "d13-01": ["Queen Victoria"],
    "wv-tower": ["Tower Hill"],
    "wv-warrn": ["Warrnambool"],
    "wv-loch": ["Loch Ard"],
}

places = []
for item in visits + extra_visit:
    pid, name, name_en, day, order, highlights, duration, transport, notes = item
    places.append(
        {
            "id": pid,
            "name": name,
            "name_en": name_en,
            "day": day,
            "date": dstr(day),
            "status": "visit",
            "order_in_day": order,
            "highlights": highlights,
            "weather": day_weather.get(day, ""),
            "duration": duration,
            "transport": transport,
            "notes": notes,
            "lat": None,
            "lng": None,
            "geocode_source": None,
        }
    )

for p in places:
    keys = enrich_map.get(p["id"])
    if not keys:
        continue
    w = find_wish(keys)
    if not w:
        continue
    extra = (
        f"\n\n【愿望清单·景点／自然】\n{w['景点／自然信息']}"
        f"\n\n【愿望清单·人文】\n{w['人文、历史、作品与文化现象']}"
        f"\n\n【愿望清单·本次建议】\n{w['本次建议']}"
    )
    p["notes"] = (p["notes"] or "") + extra

hobart_w = find_wish(["Hobart"])
if hobart_w:
    places.append(
        {
            "id": "d5-hobart",
            "name": "霍巴特（连住三晚基地）",
            "name_en": "Hobart, Tasmania, Australia",
            "day": 5,
            "date": dstr(5),
            "status": "visit",
            "order_in_day": 0,
            "highlights": hobart_w["景点／自然信息"],
            "weather": day_weather.get(5, ""),
            "duration": "9月28日—10月1日",
            "transport": "机场到CBD；两天参加Hobart往返当日团",
            "notes": (
                "Quest Savoy连住三晚；不搬行李，步行前往两个跟团集合区域。"
                "市区活动只作旅行团前后补给，不硬塞远程景点。\n\n【人文】\n"
                + hobart_w["人文、历史、作品与文化现象"]
                + "\n\n【本次建议】\n"
                + hobart_w["本次建议"]
            ),
            "lat": None,
            "lng": None,
            "geocode_source": None,
        }
    )

skips = []
for i, w in enumerate(wishes, 1):
    if w["_status"] != "skip":
        continue
    name = w["_name"]
    m = re.match(r"^([^\u4e00-\u9fff（]+)", name)
    en_guess = m.group(1).strip(" ／/") if m else name
    loc = ""
    for line in w["目的地（州／城市）"].split("\n"):
        if "州：" in line:
            loc = line.replace("州：", "").replace("｜", " ").strip()
    name_en = f"{en_guess}, {loc}" if loc else en_guess + ", Australia"
    culture = w.get("人文、历史、作品与文化现象", "")
    sug = w.get("本次建议", "")
    if "比舍诺" in name or "Bicheno" in name:
        skip_id = "d8-04"
    elif "Tower Hill" in name or "塔山" in name:
        skip_id = "wv-tower"
    elif "Warrnambool" in name or "沃南布尔" in name:
        skip_id = "wv-warrn"
    else:
        skip_id = f"skip-{i:02d}"
    skips.append(
        {
            "id": skip_id,
            "name": name,
            "name_en": name_en,
            "day": None,
            "date": None,
            "status": "skip",
            "order_in_day": None,
            "highlights": w.get("景点／自然信息", ""),
            "weather": "",
            "duration": "",
            "transport": "",
            "notes": f"【人文／文化】\n{culture}\n\n【本次建议】\n{sug}",
            "lat": None,
            "lng": None,
            "geocode_source": None,
        }
    )

skips.extend(
    [
        {
            "id": "d12-05",
            "name": "伦敦桥",
            "name_en": "London Bridge Lookout, Port Campbell VIC",
            "day": None,
            "date": None,
            "status": "skip",
            "order_in_day": None,
            "highlights": "为确保10/5赶上 St Kilda 第一场企鹅归巢，本次取消西向绕行。",
            "weather": "",
            "duration": "",
            "transport": "",
            "notes": "本次不看；十二门徒后最晚14:15—14:30离开沉船海岸，直接驶往 St Kilda。",
            "lat": -38.62,
            "lng": 142.93,
            "geocode_source": "known",
        },
        {
            "id": "d12-06",
            "name": "石窟",
            "name_en": "The Grotto, Port Campbell VIC",
            "day": None,
            "date": None,
            "status": "skip",
            "order_in_day": None,
            "highlights": "为确保10/5赶上 St Kilda 第一场企鹅归巢，本次取消西向绕行。",
            "weather": "",
            "duration": "",
            "transport": "",
            "notes": "本次不看；不再从 Port Campbell 向西延伸。",
            "lat": -38.615,
            "lng": 142.91,
            "geocode_source": "known",
        },
    ]
)

meta = []
for w in wishes:
    if w["_status"] != "visit":
        continue
    n = w["_name"]
    if any(
        x in n
        for x in [
            "Indian Ocean Drive",
            "Tasmania Road Trip",
            "Great Ocean Road（大洋路）",
        ]
    ):
        meta.append(
            {
                "id": f"meta-{len(meta) + 1}",
                "name": n,
                "name_en": None,
                "day": None,
                "date": None,
                "status": "visit",
                "order_in_day": None,
                "highlights": w["景点／自然信息"],
                "weather": "",
                "duration": "",
                "transport": "路线／主题条目",
                "notes": (
                    "路线或主题条目，不单独打点。\n\n【人文】\n"
                    + w["人文、历史、作品与文化现象"]
                    + "\n\n【本次建议】\n"
                    + w["本次建议"]
                ),
                "lat": None,
                "lng": None,
                "geocode_source": "not_a_point",
            }
        )

places = places + skips + meta
for place in places:
    coordinate = existing_coordinates.get(place["id"])
    if coordinate:
        place["lat"], place["lng"], place["geocode_source"] = coordinate

data = {
    "trip": {
        "name": "澳大利亚自驾行程",
        "dates": "2026-09-24 — 2026-10-06",
        "source_doc": "https://guanghe.feishu.cn/docx/TAoHd0QFyoo7lpxGk9DcpN0nnCc",
        "notes": "Day1(9/24)与返程境外转机点不在澳大利亚境内。9/28—9/30在Quest Savoy连住三晚并参加Hobart往返当日团；10/1从Hobart经Wineglass Bay前往Centennial Inn on Bathurst；10/2住Discovery Parks – Cradle Mountain帐篷营位（已核实有位，待下单）；10/3取消塔州精神号夜航，改为延长摇篮山后从Launceston Airport搭约20:00航班飞墨尔本并住Mantra Melbourne Airport；10/4上午在墨尔本市区提车后内陆直达Twelve Apostles并住Twelve Apostles Motel & Country Retreat；10/5沿大洋路东行，经St Kilda企鹅观赏后住Brady Hotels Central Melbourne。",
    },
    "places": places,
}
(out_dir / "itinerary.json").write_text(json.dumps(data, ensure_ascii=False, indent=2))
print(
    f"places={len(places)} visit={sum(1 for p in places if p['status']=='visit')} "
    f"skip={sum(1 for p in places if p['status']=='skip')}"
)
