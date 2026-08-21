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
