# 进度日志

## 2026-08-19
- 定位 Codex session JSONL，确认可完整读取。
- 提取 38 条用户指令与末轮塔州／大洋路共识。
- 对照 `doc-content.md` / `itinerary.json` / KML，列出过时口径。
- 已更新：
  - `doc-content.md`：文首待定问题＋总览＋必订清单；纠正动物核对与愿望清单过时条目；10/5 加入 Loch Ard 可选短停
  - `animal-section.md`：与主表对齐
  - `itinerary.json`：Tower Hill／Warrnambool→skip；Loch Ard→10/5 可选；霍巴特市区→skip 过境
  - `au-trip-map.kml` 与 `layers/*`：已用 `build_kml.py` 重建
  - `task_plan.md` / `findings.md` / `progress.md`：规划续作
- 未做：飞书云文档原位同步（待用户确认【待定-5】）；未 commit

## 2026-08-19 PWA 实现阶段
- 已读取并续接原规划三文件，新增阶段 6-9。
- 已读取前端设计、技术栈、工程规范与飞书只读规范。
- 已通过 `lark-cli docs +fetch` 对照最新版飞书文档：`revision_id=444`，未发现嵌入 Base / Sheet。
- 数据基线：83 条地点（50 visit / 33 skip）、79 条有坐标、48 条有日期、53 条愿望清单、181 个正文外链。
- 设计基线：移动端旅行产品，海蓝单强调色，双主题，统一圆角；`DESIGN_VARIANCE 5 / MOTION_INTENSITY 4 / VISUAL_DENSITY 7`。

## 2026-08-19 PWA 收尾
- 构建成功：`corepack pnpm build`；typecheck 通过；vitest 6/6 通过。
- 修复：显式依赖 `workbox-window`；Vant 按需引入；去掉图标 CDN 回退；主题图标改用字库内名称；补 `meta description` 与 `public/robots.txt`。
- 预览：`corepack pnpm preview --host 127.0.0.1 --port 4173`；curl `/`、`/manifest.webmanifest`、`/sw.js` 均为 200。
- 未 commit / push / deploy；未改 KML、飞书或 Google My Maps。

## 2026-08-19 首页复验修复
- 修改 `src/utils/trip.ts`：新增无点位日富内容摘要分支。
- 修改 `src/App.vue`：首页无点位时渲染空状态卡片，并将标题与列表包进同一桌面列。
- 修改 `src/styles.css`：快捷操作禁止换行，窄屏收紧字号与间距，新增空状态样式并修正桌面 Grid。
- 修改 `tests/trip.test.ts`：新增 Day 1 空状态与 Day 2 非空分支测试；共 7/7 通过。
- 修改 `README.md`：更新 Day 1 表现及实际构建体积。
- 验证通过：typecheck、test、build；precache 14 条 / 452.37 KiB。
- Chrome MCP：390×844×2 三按钮均单行且高 54 px，无横向溢出；1024px 标题与列表同列；干净首次安装上下文无更新条。

## 2026-08-20 GitHub Pages 部署
- gh 登录账号为 `pessimistcamellia`（非 skill 参考名 Leo-ai05），无已有 `au-trip-map` 仓库。
- 本地 git 无 remote、尚无 commit；补 `.gitignore`。
- Vite `base` 设为 `/au-trip-map/`；router 使用 `import.meta.env.BASE_URL`；manifest `start_url`/`scope` 同步；图标改为相对路径；`offline.html` 首页链接改为 `./`；`index.html` apple-touch-icon 使用 `%BASE_URL%`。
- 构建产物复制 `404.html` 并写入 `.nojekyll`，以支持 GitHub Pages history 路由。
- 线上 URL：`https://pessimistcamellia.github.io/au-trip-map/`（仓库 `https://github.com/pessimistcamellia/au-trip-map`，`gh-pages` 分支）。
- Chrome MCP 390×844×2：标题与 Day1 空状态可见，底栏「今天/日程/搜索/准备」贴底（top 776 / bottom 844），快捷按钮单行高 54 px、`nowrap`，`scrollWidth===clientWidth===390`，非白屏。

## 2026-08-20 行程节奏双视图
- 已读取并续接上下文规划、现有页面改造、前端技术栈规范及规划三文件。
- 已查看用户截图，确认其仅为 Day 2 行程节奏排版示例；实现范围为全部 13 天。
- 正在实证 Google 地图方案限制，并审计仓库数据与现有 UI。
- 可行性完成：无 Google API key；Embed 需 key 且无自定义时间 marker；My Maps iframe 不能可靠按天过滤或由父页面叠 marker。
- 实现原生 OSM 交互地图，无新增依赖；支持拖动、缩放、逐日序号＋时间 marker、Google 单点导航、OSRM 驾车路线与直线降级。
- 数据生成器按每日 `schedule` 时间段解析节奏，按中英文别名匹配当日 `visit` 点坐标；未匹配节点保留在文字视图并显示计数。
- 单测 9/9 通过；typecheck、build 通过；precache 14 条 / 490.84 KiB。
- Chrome MCP 390×844×2：Day 1 无坐标地图空态正确；Day 2 显示 5 个顺序 marker 且 OSRM 返回实际驾车道路；Day 12 显示 8 个 marker；页面宽 390/390 无横向溢出，地图 328×430，底栏 bottom=844。
- 离线模拟：状态栏提示外部地图不可用，地图显示“地图需联网”，一键切回文字后节奏列表继续可读。
- 已提交 `aac1300 feat(itinerary): 增加行程节奏双视图` 并推送 `main`；`gh-pages` 构建 `b018ef3` 状态为 built。
- 线上 390×844×2 干净上下文复验：Day 2 文字 6 条、地图 5 个 marker，OSRM 返回实际驾车道路，Google 单点导航链接正确。

## 2026-08-20 地图全览与逐点信息重构
- 地图改为可单测的 Web Mercator `calculateMapViewport`：多点按 72px 双向 padding 自动 fit，单点固定 zoom 13；新增 44px 高“回到全览”按钮。
- 时间标签改为点击／聚焦／悬停编号后才显示；密集编号使用自动错位与虚线引导，保留真实路线坐标。
- `generate_app_data.py` 新增日级信息切块、地点别名匹配、逐点 `dayInfo` 与日级 `unassigned`；未改飞书、KML 或 `itinerary.json`。
- 折叠区标题改为“住宿与其他信息”；点上新增天气 icon、“预约与注意”、“看点与玩法”，统一复用 Vant bottom Popup。
- 数据统计：未归属文本 52 条（预约 28、看点 16、天气 8），未归属链接 38 条；全部仍留在日级折叠区。
- 验证通过：typecheck；Vitest 12/12；build；PWA precache 14 条 / 533.97 KiB。
- Chrome MCP 390×844×2：Day 2 五点、Day 12 八点、Day 13 单点 zoom 13、Day 1 无点离线空态均通过；Day 12 最小 marker 中心距 42.1px，页面 `scrollWidth=clientWidth=390`。
- 已推送 `main`：`4774a51` 功能提交、`164e756` 文档提交；`gh-pages` 构建提交 `33e3a88` 状态为 built。
- 线上 `https://pessimistcamellia.github.io/au-trip-map/` 干净 PWA 缓存复验通过：Day 2 自动全览显示 5 个可读编号、“回到全览”可用、OSRM 实际驾车路线返回成功。
