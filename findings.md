# 发现记录

## Codex 线程可读性
- **能完整读取。**
- 路径：`~/.codex/sessions/2026/08/16/rollout-2026-08-16T23-07-52-01a00b1d-6bd6-73c0-b41c-10c209ae3ddf.jsonl`
- 约 4765 行 / 63MB；含 38 条用户消息与完整 agent 往返。

## 线程内已达成共识（摘要）
- 行程：2026-09-24 → 10-06；两人；天津→新加坡→珀斯进，墨尔本→香港→北京出。
- 西澳：Caversham → Lancelin → Pinnacles → Cervantes → Hutt Lagoon → Kalbarri → 9/27 回珀斯机场附近车宿。
- 塔州最终顺序（用户确认后落地）：
  - 9/28 霍巴特落地直驱 Port Arthur 住宿
  - 9/29 Tasman Island Cruise + 半岛短停 → 住 Triabunna
  - 9/30 Maria Island 全天 → 晚间开到 Coles Bay
  - 10/1 Wineglass 白天 + Bicheno 企鹅 → 夜驾住 Launceston
  - 10/2 Platypus House → Cradle（Dove Lake / Ronny / Devils@Cradle）
  - 10/3 摇篮山缓冲 → Devonport 18:45 Spirit of Tasmania
- 大洋路（按用户截图）：
  - 10/4 Geelong → Anglesea → Split Point → Memorial Arch → Teddy’s → Kennett River → Apollo Bay
  - 10/5 Maits Rest → Gibson Steps → Twelve Apostles → Port Campbell → London Bridge → The Grotto → Melbourne
- 签证用一页英文 DATE/ITINERARY `.doc` 已上传飞书并按塔州新序覆盖。
- 飞书详细行程：https://guanghe.feishu.cn/docx/TAoHd0QFyoo7lpxGk9DcpN0nnCc

## 仓库材料
| 文件 | 作用 |
|------|------|
| `doc-content.md` | 飞书行程主文档导出（权威详细表） |
| `days-raw.txt` | 按日拆分原文 |
| `animal-section.md` / `carstay-section.md` | 动物核对 / 车宿标准 |
| `itinerary.json` + `layers/*.kml` | 地图点位 |
| `wishlist-raw.json` | 愿望清单源数据 |

## 口径冲突（需修）
1. 愿望清单仍写 Hobart「9/28—9/29连住」、Rosny Hill——与主表「直驱亚瑟港」矛盾。
2. 动物表仍写 Maria Island Circumnavigation Cruise——主表仅为客运渡轮上岛步行。
3. 愿望清单 / itinerary.json 仍把 Tower Hill、Warrnambool 标为 10/4 已纳入——主表已改为东段到 Apollo Bay。
4. Loch Ard 愿望清单写 10/4 已纳入；主表未列；地理上更适合作 10/5 可选。
5. Twelve Apostles / Port Campbell / Apollo Bay 愿望清单「本次建议」仍是旧大洋路版本。
6. Bruny 条目仍提 Tasmanian Devil Unzoo——已改 Devils@Cradle。

## 2026-08-19 PWA 阶段发现
- 飞书最新版只读获取成功，`revision_id=444`，与仓库 `doc-raw.json` 记录一致；正文未发现 `<bitable>`、`<sheet>` 或对应 `cite`，无需 Base 下钻。
- `doc-content.md` 约 7.4 万字符、181 个显式链接，含 13 日主表、待定问题、总览、必订清单、车宿标准、动物覆盖与 53 条愿望清单，是应用富内容权威源。
- `itinerary.json` 共 83 条：`visit=50`、`skip=33`、有日期 48 条、有坐标 79 条；按日点位覆盖 Day 2-13，Day 1 为国际航班转场且无澳洲地图点。
- 现有仓库尚无 `package.json` 或前端工程；所有文件当前均为 Git 未跟踪状态，后续不修改 KML 与地图构建数据。
- 飞书内容中的不确定项继续保留：Tower Hill / Warrnambool、Loch Ard、预订状态与车宿合同许可。

## 2026-08-19 PWA 收尾验证
- `corepack pnpm add workbox-window` 后 `vite-plugin-pwa` generateSW 构建成功，未删除离线能力。
- 数据生成脚本输出稳定：`days=13 places=83 links=131`；JSON 内 visit/skip=50/33、坐标 79、wishlistCount=53。抽查地点 Markdown `**` 与 `[text](url)` 已清除，外链进入 `links`。
- Vant 全量 CSS/JS 是体积主因；按需引入后 precache 从 13 条 / 764.81 KiB 降到 14 条 / 450.41 KiB（多了 `robots.txt`）。
- 核心 CSS 无 `http(s)` 资源请求；图标字体为 data URI。JS 中的 https 均为用户可点的官网、My Maps、导航与帮助链接。
- `sw.js` 使用 `NavigationRoute` 回退 `/index.html`，precache 含 JS/CSS/HTML/图标/manifest/offline.html。
- Chrome DevTools MCP 可用：390×844 移动视口走通首页、日程（含 10/5）、地点抽屉、搜索「袋熊」、准备页、`/skip`。整页截图因 MCP 超时未能写入仓库。
- Lighthouse MCP navigation 因 NO_FCP 失败；snapshot：Accessibility 100、Best Practices 100、SEO 60（已补 meta description 与 robots.txt）、Agentic 50（无 llms.txt，不作为产品要求）。无独立 PWA/性能分数。

## 2026-08-19 首页复验修复
- Day 1 的 `getPlacesForDay` 返回空数组，原首页只渲染空 `region`。现通过 `getEmptyDaySummary` 通用返回逐日富内容，首页展示重点、交通、住宿和可展开的完整安排。
- 390×844×2 下三快捷操作均为 114×54 px，文案 `white-space: nowrap` 且文本各 1 行；页面宽 390 px，无横向溢出。
- 原 700px 以上栅格分别定位标题与列表，CSS Grid 自动行导致两者错位。现用 `today-places` 包裹并整体放入右列；1024px 下标题与列表同为 x=573、宽 305 px。
- 干净 isolated context 首次注册 SW 时无更新条。已有 context 在连续构建后出现更新条，符合 `vite-plugin-pwa` 仅在 waiting/update 时设置 `needRefresh` 的逻辑，不是首次安装误报。
- 最终构建 precache 14 条 / 452.37 KiB；Vant 仍按需引入，CSS 无 `alicdn.com`。

## 部署账号与托管
- `gh auth status` 实际登录：`pessimistcamellia`。skill 参考用户名 `Leo-ai05` 本次不使用。
- 已有仓库含 `prototypes`（Cloudflare 降级备选），无 `au-trip-map`。
- 优先方案：新建公开仓库 `pessimistcamellia/au-trip-map`，`main` 放源码，`gh-pages` 放 `dist`，Pages 子路径 `/au-trip-map/`。

## 2026-08-20 行程节奏地图可行性
- 仓库仅有私人 My Maps `mid=10eTWDmGzd0nwA4sFuDWaxVEcO5QP0_4`，没有 Google Maps API key、Maps Embed URL 或环境变量；`itinerary.json` / `src/data/trip-data.json` 已有逐日坐标，KML 只读保留。
- Google 官方文档实证：Maps Embed API 的 `place/view/directions/search` 均需 API key；`directions` 可带最多 20 个 waypoints，但不提供每个 waypoint 的自定义“序号＋时间”HTML 标注。
- Google Maps JavaScript API 可用 Advanced Marker 做 HTML/CSS 标注，但每次请求必须携带 API key，生产使用还需启用 billing 与来源限制；当前仓库无法真实接入。
- My Maps iframe 没有官方按 URL 指定“只显示某一天图层”的参数，图例／图层控制也不暴露给父页面；跨域同源策略阻止父页面在 iframe 内叠加或操纵 marker。整张私人地图不能满足逐日切换。
- 无 key 的 Google Maps URLs 可打开多点路线，但它是外部跳转，不能作为页面内底图，也不能给点写自定义时间标签。
- `Leaflet` / `MapLibre` 未列入团队技术栈允许清单；本次不新增依赖。选用原生 Vue/CSS 的 OSM 瓦片交互视图，支持拖动、按钮／滚轮缩放与 HTML marker；用公开 OSRM route service 请求驾车 GeoJSON，失败时退回直线并明确标注。
- OSM 瓦片与 OSRM 均需联网，PWA 不承诺离线地图；离线时地图区域显示“地图需联网”并提供一键切回文字，静态文字节奏始终来自 precache 数据。

## 2026-08-20 地图全览与逐点信息重构
- 原地图虽有边界估算，但 padding 与常显时间标签共同造成视觉拥挤；密集坐标即使移除文字气泡，编号圆点仍可能互相遮挡。
- 现用 Web Mercator 投影计算当天所有坐标的边界，按容器尺寸选择最高可容纳 zoom；单点固定为 zoom 13，避免无限放大。
- 密集编号增加屏幕坐标错位与虚线引导，Day 12 的 8 个点在 390px 下最小中心距 42.1px，全部留在地图容器内。
- 日级信息按换行、句号、分号切块，再以地点中英文名称与去除“国家公园／观景台／住宿”等后缀的别名匹配；连续句继承同一行最近命中的地点。
- 最终归属到点上的引用次数：预约 90、看点 69、天气 70、链接 45。未能可靠归属的原文片段共 52 条（预约 28、看点 16、天气 8），另有通用或住宿类链接 38 条，均保留在“住宿与其他信息”。
- 天气仍是原文的长年气候参考，不是逐日预报；命中地点时显示对应原文片段，未命中时点上弹层回退展示原始当日气候文本，不伪造地点差异。

## 2026-08-21 产品级重构审计
- 六张截图表达的是交互与信息架构意图，不是像素照抄：文字地点需要与地图使用同一稳定序号；地点操作应收敛为标题行轻量入口；“更多”和“随手记”是不同任务；日志采用“上方写、下方按时间查看”的移动结构。
- 当前 `App.vue` 直接导入 `trip-data.json`，地点详情、分类拼装和浏览器存储均混在页面层；未来换 HTTP 会牵动页面。重构需把静态数据、天气与日志分别放进 repository。
- 当前文字节奏 `IRhythmNode.order` 包含无坐标交通节点，而地图编号按过滤后的 `points` 数组 index 重新计算；目的地列表又按 `order_in_day` 单独排序，三套顺序并不具备一致性契约。
- 当前 optional 只在时间线显示“可选”文字，地图 marker 没有任何可选语义；无坐标节点在文字节奏中有序号，但地图过滤后重排，用户无法解释编号跳转。
- 当前三个方块来自 `.point-information` 固定 `44px + 两列` 布局。天气按钮只在有数据时渲染，但 CSS 规则 `.point-information button:not(.point-weather):first-child` 依赖 DOM 顺序；截图中的空方块是 Vant `cloud-o` 字形未正常显示而按钮容器仍存在。根治方式是移除这组三栏按钮，并只在有任何分类内容时渲染“更多”。
- 当前详情 Popup 有六个 tab，链接在每个 tab 下重复出现，备注混在资料分类内；收藏、坐标、地点名操作与用户最新要求冲突。
- 当前天气全部是文档中的长年气候文字，不是 2026-09/10 逐小时预报。未来 provider 只能在 API 可预报窗口内请求；当前版本必须明确“气候参考／暂无临近预报”，并保留点坐标粒度。
- 现有用户状态 key 为 `au-trip-map:user-state:v1`，重构必须兼容收藏、完成、notes、checklist、theme，不能迁移时丢失。
- 视觉审计：当前海蓝／青绿贯穿 light、dark、PWA manifest 与图标，且使用网格背景、较多等大圆角卡片。新方向为奶油鹅黄底、琥珀主色、陶土状态色与暖深棕暗色；保留高信息密度但减少三等分按钮和套盒。
- 地图卡片关闭与“回到全览”的共同根因已确认：两个按钮都在 `.rhythm-map` 内，`pointerdown` 冒泡到地图后执行 `setPointerCapture`，后续 `pointerup/click` 被重定向到地图容器，子按钮的 click 不稳定或完全不触发；不是 Vue ref 本身失效。marker 之所以能点，是原实现只有 marker 写了 `@pointerdown.stop`。修复为地图容器先排除 `button/a`，并给关闭、全览、缩放控件统一阻止 pointerdown/click 冒泡；关闭后保持 `selectedPoint=null`，重新点 marker 才打开，切日／切视图由 `resetMap` 清空。
- “回到全览”原先还有第二个体验问题：即使 click 成功，`fitPoints()` 计算结果与当前状态相同也不会有视觉变化。新实现统一调用 reset、重载路线，并显示 1.6 秒“已回到当日全览”；因此已在全览时也有明确反馈。

## 2026-08-21 清新视觉重做审计
- 主题逻辑为 `store.theme === system` 时读取 `prefers-color-scheme: dark`，因此深色系统会明确进入 `[data-theme="dark"]`；旧 dark 使用 `#211a14`、`#2b2119`、`#e09a55`，用户感知为“黑橙”符合运行逻辑。
- 旧 light 的 `#fbf4df` 是整页背景，卡片 `#fffaf0`、强调 `#c56a24`，即使未进入 dark 也仍是高覆盖奶油黄加陶土橙，视觉偏厚重。
- `styles.css` 中地图路线、marker、控件、弹层仍有约 30 处暖褐／陶土硬编码；`staticTripExport.ts`、`index.html`、`vite.config.ts`、`public/offline.html` 也各自保留旧色，必须统一收敛。
- 新方向保留现有 Vue 3、Vant 按需、Pinia、PWA 与原生 CSS；不新增依赖，不改变四分类、随手记、稳定序号、下载或 repository。
- 线上 390×844×2 实测：`colorScheme: light` 得到 `data-theme=light`、页面背景 `rgb(251,244,223)`、Hero `rgb(197,106,36)`；`colorScheme: dark` 得到 `data-theme=dark`、页面背景 `rgb(33,26,20)`、Hero `rgb(224,154,85)`。两种模式均无横向溢出，且用户所说“黑橙”与 dark 的实测画面完全一致。
- 新 light 基线为白灰 `#FAFAF7` 主底、白卡 `#FFFFFF`、金盏黄 `#F4CB4F`；新 dark 为中性炭灰 `#191B1C`、卡片 `#232627`、同一金盏黄强调，彻底移除黑褐与陶土橙。
- 关键对比度计算：light 主文／背景 12.37:1、次文／背景 5.52:1、链接／背景 6.35:1、强调按钮文字／黄底 9.55:1；dark 主文／背景 15.63:1、次文／背景 9.05:1、链接／背景 12.09:1、强调按钮文字／黄底 9.80:1；marker 数字／黄底 9.80:1。

## 2026-08-22 地图常显地名能力判断
- Google Maps JavaScript API 的 Advanced Marker 可渲染自定义 HTML 地名标签，但需要 Google Maps Platform API key、启用计费，并自行处理标签碰撞；当前仓库没有 key。
- 私人 My Maps 的 viewer／iframe 可以显示地图自身配置的名称，但父页面无法按当前 zoom 强制每个地点常显、控制中文字号或实现应用级碰撞避让。
- 当前地图底层虽使用 OSM 瓦片，但路线、编号与覆盖物都是 Vue 自己渲染，因此无需新依赖即可让 3／5／8 个点常显中文地名，并保持字号不受 zoom 影响。
- 单纯把地名放在 marker 旁会在西澳纵向密集路线中互压；最终采用标签与编号联合避让，常规空间不足时把标签移到地图边缘并用虚线指回对应编号。

## 2026-08-22 Puffing Billy 可行性核查（实证来源）
- 仓库原状：`doc-content.md` 愿望清单与 `itinerary.json`（`skip-51`）均为「不在本次行程中」，KML 位于「本次不看」图层；主表 10/6 明确写「当天不去 Puffing Billy」。
- 官网时刻表（`puffingbilly.com.au/timetable/`，2026-04-01—2027-03-31 票价、2026-07-20—12-21 班表，覆盖本次日期）：
  - 周五至周日：Belgrave→Lakeside 10:00／11:00／12:30／14:15；**Belgrave→Menzies Creek 往返仅此段 10:00 发车、11:55 回到 Belgrave**；Belgrave→Gembrook 11:00 出发、16:50 返回。
  - 周一至周四：**只有 Belgrave→Lakeside**（10:00→13:20、11:00→15:10、14:15→17:10），Menzies Creek 与 Gembrook 均不开。
  - 例外日只列 8/20、9/12—13、11/2—3、11/29，**2026-10-04／10-05 无特殊时刻表**（仍需下单时复核）。
- 票价：Menzies Creek 往返成人 A$43.50、Lakeside 往返 A$66、Gembrook 往返 A$84.50；必须官网预约，不售现场票，热门班次提前售罄。
- 检票：官方要求发车前 **60 分钟**到票房，**发车前 30 分钟硬截止**，列车不等人；Belgrave 车站所在 Old Monbulk Road 不能停车，须停 Belgrave Metro Station Car Park（640 车位）。
- Menzies Creek Museum：免费，**周五至周日 10:30—12:00**，含 Little Toot Café；该段官方明确提供「坐在车厢窗台」体验。
- Spirit of Tasmania 官方排班 API（`/wp-json/sot/v1/sailings?route=devonport-to-geelong&days=60`）：**10/3 18:45 开船 → 10/4 07:00 抵吉朗**，check-in 16:15—18:00。相邻各日均为 06:00 抵达，10/4 为 07:00 系因当夜进入夏令时。
- 夏令时：2026-10-04 02:00→03:00 转 AEDT（RBA／timeanddate 一致）；墨尔本当日日落 19:04，因此 10/4 傍晚仍有充足光线，肯尼特河考拉窗口反而更好；代价是船上实际睡眠少 1 小时。
- 维州学校假期：春假 9/19—10/4，10/5 开学。10/4（周日）是假期最后一天，售罄风险最高；10/5（周一）人少但只有 3—4 小时的 Lakeside 往返可选。
- 车程（OSRM 自由流，已按 +15% 估算实际）：吉朗码头→Belgrave 107 km／93 min（实际约 1h45）；Belgrave→小红帽灯塔 164 km／145 min（约 2h45）；Belgrave→阿波罗湾 237 km／203 min；十二门徒→Belgrave 266 km／236 min（约 4h30）；十二门徒→墨尔本 225 km／198 min；Belgrave→墨尔本 CBD 43 km／43 min；墨尔本 CBD→机场 24 km／26 min。
- 结论：10/6（13:00 HX036，需 10:00 到机场）与 10/5（周一最短往返 2h55、需 09:00 前离开十二门徒）都不可行或代价过大；**唯一可行窗口是 10/4 上午的 10:00 Belgrave→Menzies Creek 往返**，但船 07:00 抵港与 09:00 应到票房之间只有 1h45，恰等于车程，零富余，因此只能作为「船准点才坐」的条件式可选点。

## 2026-08-22 地图地名标签修复结论
- CSS `transform` 只改变最终绘制位置，不参与浏览器按 `left` 计算元素可用宽度；贴近容器右边缘时，标签会先被剩余宽度压缩，再整体平移，最终形成竖条。地图标签必须在 JS 中直接计算并夹紧最终 `left / top / width / height` 矩形。
- `registerType: 'prompt'` 会让已安装用户长期停留在旧 Service Worker 缓存，进而把旧 bundle 没有地名标签误判为新功能缺失。现已改为 `autoUpdate`，配合 `skipWaiting`、`clientsClaim` 与每 60 秒主动检查版本。
- 字体真实字宽可能让理论单行的五字标签换成两行；碰撞算法必须按 47px 两行高度预留，并在常规候选无空位时遍历容器空位，不能直接采用可能碰撞的夹紧矩形。

## 2026-08-22 企鹅观赏与路线调整
- 用户对塔北路线的理解正确：Beauty Point位于北岸，Cradle位于西南高地；10/2从Launceston先到Platypus House再进山、10/3从Cradle直达Devonport，可把港口日控制在约84公里。若10/3再从Cradle折返Platypus House后去码头，约138+70=208公里，比直接下山多约124公里。
- 10/1已取消Bicheno企鹅与夜驾：Coles Bay约13:00出发，约176公里／预留2.5小时，15:20—15:40抵Launceston；住宿城市不变。
- 10/5要赶St Kilda第一场，必须14:15—14:30前离开沉船海岸且不能先回酒店；保留Twelve Apostles，Loch Ard仅约20分钟可选，Port Campbell改外带午餐，London Bridge与The Grotto转为skip。
- St Kilda免费票每周二10:00开放未来一周，热门易满；2026-10-05日落约19:27 AEDT，第一场暂估19:57、第二场约20:57，均以实际票面为准。停车有限，平台入口在码头内约450米。

## 2026-08-22 日程页地图／文字联动与视觉审计
- 旧结构用 `v-if / v-else` 在地图和文字间二选一，导致两者不能构成同页空间关系；地图 marker 又把点击定义为打开含 Google 导航的卡片，无法回到对应文字卡。
- 新结构应把地图作为当天节奏的第一段、文字时间轴作为第二段；「地图／文字」只承担 sticky 页内锚点，不再控制内容显隐。这样既满足默认先看地图，也保留长页面快速跳转。
- 双向定位以 `placeId` 为唯一契约：文字卡定位按钮更新 `focusedPlaceId`、保持现有 zoom 只改地图 center；地图 marker 点击写回同一 ID，再滚到带 `data-place-id` 的时间轴卡。新 ID 会自然取消旧 marker 高亮。
- 旧日期区 13 个日期按钮持续占据首屏；改为默认折叠的单行 bar，展示「第几天／日期星期／起终点」，展开后选日并自动折叠。
- 旧日摘要同时展示 `region` 与完整 `route`，与下方节奏重复。路线字符串以 `→` 拆分、递归去掉中英文括号说明后，只保留「第几天／起点／终点」。
- 390×844 初步运行态：页面宽 390/390；日期选日后自动收起；日摘要高 72px；地图和文字同时存在。文字点 2 定位后 marker 2 立即蓝色脉冲、随后保持蓝色且仅一个 selected；地图点 4 点击后文字点 4 滚到视口中部，marker 4 替换点 2 高亮；sticky 节奏栏停在 viewport top 0。

## 2026-08-22 日期摘要二次合并与地图触摸策略
- 用户截图确认独立日期 bar 与下方日摘要仍重复；最终只保留一张 `day-summary`。左侧是可点击的「第几天／日期星期／下拉箭头」，右侧两行分别显示起点、终点和右对齐时间。
- 起点时间取当天首条 rhythm 的时间段左端，终点时间取末条 rhythm 的右端；例如 D2 为 `04:20` 与 `日落后`，D1 可保留 `次日04:20`。
- 文字序号原先承担“完成”状态，和地图序号的语义不一致。现统一为定位按钮；完成状态移到卡片底部文字操作，不丢功能。
- 嵌入地图若设置 `touch-action:none`，单指上下滑会被地图拖动截走。采用明确协作模式：默认 `touch-action:pan-y`，单指滚动页面、滚轮也不截获；点击「操作地图」后切到 `touch-action:none`，允许拖动与滚轮缩放，`+/-` 始终可缩放，点「完成」退出地图操作。
- marker 回跳增加三层稳定性：marker `click.stop.prevent` 调独立函数；父组件 `nextTick + requestAnimationFrame` 后寻找 `data-place-id`；目标卡先 `focus({preventScroll:true})` 再 `scrollIntoView(block:start)`。390×844 实测点 4 回跳后卡片 top≈189px、sticky 页签变为「文字」。

## 2026-08-22 marker 点击失效根因：全局 `:active` transform 覆盖定位 transform
- 之前几轮验收都用 `element.click()` 脚本触发，脚本点击不经过 pointer 序列，所以一直是「通过」；用真实输入事件（Chrome DevTools 真实点击）复现后立刻失败：`scrollY` 保持 0、无 `li.focused`。
- 事件插桩结果：`pointerdown` 命中 `.map-marker > b`，但 `pointerup` 与 `click` 的 target 都变成了容器 `.rhythm-map`。浏览器只有在 down / up 命中同一元素时才派发 `click`，因此 `click` 永远不落在 marker 上。
- 逐帧读 computed transform 给出结论：`pointerdown` 时 marker 的 transform 是 `matrix(0.98,0,0,0.98,0,0)`，`pointerup` 时才是 `matrix(1,0,0,1,-22,-44)`。即按下瞬间 marker 自身的 `translate(-50%,-100%)` 被丢掉，元素整体向右下位移 22×44px，手指位置已经不在它身上。
- 根因是 `styles.css` 的全局 `button:active { transform: scale(0.98) }`：`transform` 是单一属性，会整体覆盖 `.map-marker` 用于定位的 `transform: translate(-50%,-100%)`。所有依赖 transform 定位的按钮都会中这个雷。
- 修法：全局按压反馈改用独立的 `scale` 属性（`button:active { scale: 0.98 }`）。`scale` / `translate` / `rotate` 是各自独立的变换属性，不会互相覆盖，marker 定位保持不变。
- 顺带把 `.rhythm-map` 的 `overflow: hidden` 改为 `overflow: clip`：`hidden` 会让容器成为可滚动盒，聚焦内部 marker 时浏览器可能把它滚进视野，同样会让 down / up 命中不同元素。`clip` 不产生滚动盒。
- 排版：卡片底部改成一行 `justify-content: space-between` 的 footer，`随手记` 在左下、`更多` 在右下并与右上角导航图标同列；两个按钮统一 `min-height: 40px`、`line-height: 1`、图标 15px，`journal-link` 原先多出的 `margin-top: 5px` 是截图里三个按钮高低不齐的直接原因。
- `标记完成` 从卡片移除，改放在「更多」弹层底部 footer，首页「已完成 N/47」计数因此仍可推进；`.place-detail` 改为 flex 列并让 `.detail-body` 占满剩余高度，footer 贴底。

## 2026-08-23 日程页第二轮 Redesign 审计
- 截图一的「地图／文字」分段按钮已失去信息架构价值：地图与文字现在始终同页展示，页签只做锚点跳转，却占据吸顶区域近一半宽度。删除它不会影响 `placeId` 驱动的双向定位；相关滚动应由编号点击直接完成。
- 真正需要吸顶的是 `.date-picker`／`.day-summary`：这是用户浏览长时间轴时唯一需要随时调用的跨日导航。吸顶应设置明确层级、半透明同色表面与轻量边界，并为被定位的地图／文字卡保留对应 `scroll-margin-top`，避免被日期卡遮挡。
- 地图内左上两个实心矩形控件与标签共用有限画布，属于高优先级操作压住高优先级内容。应在地图标题行外置为两条文字操作：「操作地图／完成」与「回到全览」，地图内只保留缩放 `+/-`、署名和极弱状态提示。
- 现有地图只维护单个 `drag` 指针，`touch-action:none` 仅允许单指平移，并没有双指距离基线与缩放中心，所以“操作地图”模式名实不副。正确实现需维护所有 active touch pointers；两指时按距离比跨整数阈值更新 zoom，并围绕两指中点保持地理坐标稳定；退出模式立即清空 pointer／pinch 状态。
- 默认模式继续使用 `touch-action:pan-y`，不捕获 touch pointer，让单指上下滚动页面；只有进入操作模式后切到 `touch-action:none` 并启用单指平移、双指缩放。桌面鼠标拖动与滚轮缩放规则保持现状。
- 卡片 footer 的信息优先级应为「更多」先于「随手记」。按用户阅读方向放置「更多」左下、「随手记」右下；两者保持同一基线、同一触达高度，不增加新容器或强调色。
- 全产品审计结论：当前清新鹅黄／白与暗色中性炭灰已一致，不应再改色或重写信息架构。本轮高收益优化聚焦移除冗余页签、减少地图画布遮挡、校正 sticky 层级与卡片行动顺序；保留现有字体、圆角、导航、弹层、空状态和离线状态。
