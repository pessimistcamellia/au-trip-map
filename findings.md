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
