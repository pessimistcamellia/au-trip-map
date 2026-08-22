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

## 2026-08-21 产品级 redesign
- 已通读 image-to-code、redesign、上下文规划、技术栈、工程规范，续接原有规划三文件。
- 已逐张读取六张用户截图，并通读 `App.vue`、地图组件、store、类型、工具、样式、数据生成器、测试与生成数据结构。
- 已确认主要结构问题：页面直连 JSON、三套独立序号、optional 地图语义缺失、详情分类／链接／备注耦合、三栏方块操作、天气仅有气候文字且未建 provider。
- 已新增阶段 19-23；下一步先完成三个交互缺陷的运行态复现，再进入 repository、日志、导出和视觉重构。
- 中断恢复检查：工作树保留 16 个已修改文件及 `JournalView`、repositories、services 新文件，无他人并发修改迹象；未覆盖现有成果。
- 已确认地图关闭／全览共同根因是父地图 `setPointerCapture` 抢占子控件事件；已为所有地图控件阻止冒泡并增加全览完成反馈。
- 已完成稳定 `sequence`、optional marker、四分类、WeatherRepository、IndexedDB／local fallback 日志、照片压缩、10 张约束、按天汇总与单文件 HTML 导出主体实现。
- 已切换暖色 light／dark、PWA manifest 与本地图标；保留原 `au-trip-map:user-state:v1`。
- 阶段性验证：`vue-tsc` 通过；Vitest 19/19 通过；production build 通过，precache 14 条 / 560.42 KiB。
- 最终验证：`corepack pnpm typecheck`、19/19 tests、`corepack pnpm build` 全过；主 JS 470.94 kB、CSS 87.87 kB，precache 14 条 / 560.85 KiB。
- Chrome DevTools `390x844x2,mobile,touch`：页面 390/390 无溢出且可见交互目标均不小于 44px；Day 2 列表／地图同为 1-5，兰斯林 optional marker 可见；Day 12 为 8 个 marker（2 个 optional），Day 13 单点 zoom 13，Day 1 无点空态。
- 地图实测：marker 卡片可关闭；放大从 zoom 13 到 14 后“回到全览”恢复到 13，并显示“已回到当日全览”。
- 更多弹层实测四分类、底部延伸阅读、Escape 关闭；日志实测文本＋压缩照片写入 `au-trip-map-journal` IndexedDB、10/10 截止、历史记录与全局按日期汇总。
- 静态路书实测：默认 HTML 74,333 字符、13 天完整、无外部 script/link、未含日志；显式勾选后 75,537 字符，包含日志文本与 `data:image/jpeg` 内嵌照片。
- 暖色 light 为 `#fbf4df / #c56a24`，dark 为 `#211a14 / #e09a55`；离线 reload 后 app shell 与文字可读，地图明确显示“地图需联网”。
- 已发布：main `8332989`，gh-pages `9f0b422`；生产 URL 已加载新资产 `index-Dc9eQfl0.js` 并完成 Day 2、Popup、日志入口、390px 与离线降级复验。

## 2026-08-21 线上独立复验
- 独立实例在生产 URL 复核：部署产物 `index-Dc9eQfl0.js` 与本地 `dist` 同名一致；Pages 构建 `9f0b422` 状态 `built`。
- 地图 Day 2：列表与 marker 同为 1-5，1 个 optional marker；marker 卡片打开后点 × 立即关闭；连续放大三级后“回到全览”把五个 marker 像素坐标精确还原为 `204,291 204,240 146,192 130,149 122,93`，并提示“已回到当日全览”。
- 目的地操作区：每个点仅 `导航` + `更多`（各 48×44px）加独立 `随手记`；`.timeline` 内无空文案控件；`scrollWidth = clientWidth = 390`。
- 更多弹层：四分类顺序为看点／实用／天气／文化，`延伸阅读` 为 `.detail-body` 最后一个子节点（该点 5 条外链）；天气显示地点级气候参考并明确标注降雨、湿度／UV／晴朗程度为“暂无临近预报”。
- 随手记：保存后立即进入时间轴，reload 后仍在（IndexedDB 持久化通过），全局“旅途日志”按 `2026-09-25` 分组并标注所属地点。
- 静态导出：点击生成 blob 下载 `澳洲行程路书-2026-09-24.html`，默认提示“未包含随手记”。
- 暗色实测 `#211a14 / #f7ead5`；Day 13 单点日 zoom 13 街道级可读。
- 复验限制：CDP `Offline` 不会改写 `navigator.onLine`，因此离线分支通过派发 `offline` 事件验证，结果为状态栏“当前离线，外部地图与链接不可用”、地图“地图需联网／切回文字”、五条导航链接 `aria-disabled=true`；OSRM 在断网下确实回落“直线示意”。
- 遗留观察：部分点的“看点”同时保留地点自身描述与带地点名前缀的日级描述，语义重复但不丢信息，`uniqueText` 仅去重完全相同文本。

## 2026-08-21 清新视觉重做
- 已读取 `redesign-existing-projects`、`frontend-design-quality`、上下文规划与前端技术栈规范，续接阶段 24-27。
- 设计判断：移动端高信息密度旅行工具，保留功能与信息架构；`VARIANCE 5 / MOTION 3 / DENSITY 7`，采用原生 CSS 语义 token，不引入依赖。
- 代码审计确认系统主题会把站点切到 `#211a14` 暖褐底与 `#e09a55` 橙色强调；light 也以 `#fbf4df` 饱和奶油色铺满页面，并存在地图、导出、offline 与 PWA 元数据的旧色硬编码。
- 正在用 Chrome DevTools 对线上 light／dark 取运行态实证，之后统一重做双主题与地图配色。
- 线上基线实证：light 为 `#fbf4df / #c56a24`，dark 为 `#211a14 / #e09a55`；dark 截图即明显“黑橙”，light 也因全屏奶油黄与陶土 Hero 偏重。
- 已完成清新双主题：light `#FAFAF7 / #FFFFFF / #F4CB4F`，dark `#191B1C / #232627 / #F4CB4F`；地图、静态导出、offline、manifest、启动 theme-color 与 PWA 图标同步。
- 自动化通过：`corepack pnpm typecheck`、Vitest 19/19、`corepack pnpm build`；主 JS 471.29 kB、CSS 89.79 kB，precache 14 条 / 564.08 KiB。
- Chrome DevTools 390×844×2 light／dark 均覆盖首页、Day 2 多点地图、marker、回到全览、四分类 Popup、旅途日志汇总与准备页；页面宽始终 390/390，按钮文案无换行，有效触摸目标最小 44px。
- 地图实测：light 路线 `#9A7000`，dark 路线 `#F4CB4F`；marker 均为 `#F4CB4F` 配 `#29260D` 数字与 3px 白边，数字对比度 9.80:1，OSM 底图上清楚可读。
- 已提交并推送 main：`e3f43a4 style(theme): 重做清新鹅黄双主题视觉`；gh-pages 构建提交 `b835264`，Pages 状态 `built`。
- 生产 URL 最终复验加载新资产 `index-BBn-oepo.js`／`index-CA6WLbD0.css`；light 与 dark 启动时 `theme-color` 分别为 `#FAFAF7`／`#191B1C`，无横向溢出。线上 dark Day 2 为 5 个清晰 marker、地图 328×430、路线 `#F4CB4F`。
- 真实限制：PWA manifest 的 `background_color` 只能配置单值，采用 light 主底 `#FAFAF7`；dark 首屏由 head 内同步主题引导脚本和动态 `theme-color` 消除旧黑褐闪屏。

## 2026-08-22 地图常显地名
- 能力判断：Google Maps JavaScript API 可用 Advanced Marker 自定义地名，但需要 API key 与计费；私人 My Maps iframe 不能由本应用按缩放级别可靠控制标签。现有 OSM 地图的 marker 与覆盖层均由本应用渲染，适合直接实现。
- 地名标签采用固定 14px 字号，不随地图 zoom 缩小；最多两行，点在地图左半区时向右展开、右半区时向左展开，避免被容器边缘裁切。
- marker 最小避让距离调到 72px；标签按地图从上到下布局，并在常规相邻位置不足时放到地图边缘，以虚线指回编号点。
- Chrome MCP 390×844×2：Day 2 五个标签和 Day 12 八个标签均无标签互压、无标签遮挡其他编号，页面宽 390/390；连续放大后字体仍为 14px，“回到全览”可恢复初始视野。
- 浅色标签为白色表面，深色标签为 `rgba(35, 38, 39, 0.96)` 配 `rgb(244, 214, 110)`，两套均可读。
- 自动化通过：typecheck、Vitest 22/22、build；precache 14 条 / 568.72 KiB。
- 已发布 main `d0dfa43` 与 gh-pages；生产 URL 加载 `index-BYrCZxs6.js`，线上 Day 2 实测五个中文地名、14px 字号、两条密集点引导线、页面宽 390/390。

## 2026-08-22 Puffing Billy 可行性与条件式插入
- 已读 `task_plan.md` / `progress.md` / `findings.md` 续作；确认蒸汽小火车原为「本次不看」。
- 已用官网时刻表、Spirit of Tasmania 排班 API、维州学期表与 OSRM 车程完成三个时间窗核算（详见 findings.md）。
- 结论：10/6 不可行（首班 10:00 vs 13:00 起飞、10:00 须到机场）；10/5 周一只有 2h55+ 的 Lakeside 往返且须 09:00 前离开十二门徒，代价过大；10/4 上午 10:00 Belgrave→Menzies Creek 往返（11:55 返回）可行但零富余。
- 已改文件：
  - `doc-content.md`：新增【待定-6】；总览 10/3 补夏令时、10/4 补可选火车与 09:30 硬截止；删减优先级把火车列为最先删除；必订清单新增车票行；10/4 主行程拆为「方案A 坐火车／方案B 原方案」并写中止条件；10/4 重点体验与预约注意补火车段；10/6 补「为什么不可行」的算式；愿望清单该行由「不在本次行程中」改为「可选纳入本次行程（10/4）」。
  - `itinerary.json`：`skip-51` → `wv-puffing`，day 11 / 2026-10-04 / status visit / order 1，坐标改为 Belgrave 车站；`d11-01`—`d11-06` 顺序后移为 2—7；`trip.notes` 补本次修订。
  - `build_itinerary.py`：同步 `extra_visit` 与 `enrich_map`，并同步 d11 顺序，避免重建时丢失。
  - `au-trip-map.kml` / `layers/*`：`build_kml.py` 重建，D11 图层 6→7 点，「本次不看」32→31 点。
  - `src/data/trip-data.json`：`scripts/generate_app_data.py` 重建；10/4 节奏已把火车段匹配到序号 1。
  - `tests/trip.test.ts`：visit 50→51、skip 33→32，新增「10/4 以可选 Puffing Billy 开头」用例。
- 验证：`corepack pnpm typecheck` 通过；Vitest 23/23 通过；`corepack pnpm build` 通过，precache 14 条 / 579.90 KiB。
- 未做：未 commit / push；未同步飞书云文档（仍待【待定-5】确认）；10/5 大洋路主线未删减（火车放在 10/4 后不需要为它砍点）。

## 2026-08-22 地图地名标签修复、验证与部署
- `tests/trip.test.ts` 已改用 `left / top / width / height / align / anchored` 结构，覆盖容器边界、标签互斥、marker 互斥、八点坐标塌陷和 10/5 八点密集实测坐标；保留 `getMapLabelSide` 左右边缘语义。
- 线上首轮复验发现碰撞回退仍可能直接采用重叠矩形；补充容器空位遍历。第二轮发现浏览器字体真实字宽会把理论 30px 单行标签换成 47px 两行；最终统一按两行高度预留碰撞空间。
- 最终本地验证：`corepack pnpm typecheck` 通过；Vitest 25/25 通过；`corepack pnpm build` 通过，PWA precache 14 条 / 580.31 KiB。
- 最终部署：仅提交并推送 `gh-pages`，提交 `f9037c9`，GitHub Pages 状态 `built`；线上加载 `index-qEts-Hf6.js`。
- 390×844 线上 13 天全览：逐日标签／marker 数为 `0/0、5/5、4/4、2/2、2/2、4/4、2/2、5/5、4/4、2/2、7/7、8/8、1/1`；共 46/46，越界、宽度小于 50px、标签重叠、marker 重叠均为 0，最小宽度 54px。
- 缩放复验：10/5（8 点）与 10/1（5 点）均连续缩小 5 次到 zoom 3，再放大 3 次到 zoom 6；四个场景的越界、挤压、标签重叠、marker 重叠均为 0，最小宽度分别为 54px、60px。
- 10/1 实际标签：酒杯湾观景台、图维尔角灯塔步道、蜜月湾、比舍诺企鹅归巢团、朗塞斯顿（住宿）；五个标签均未截断。
- 线上 `sw.js` 同时包含 `skipWaiting`、`clientsClaim`，并预缓存最终 bundle。

## 2026-08-22 节奏与卡片合并、类别图标、美食与停车
- 摸清结构：每日节奏共 46 个带 `placeId` 的行程点，其余为行车／活动节点；旧版「行程节奏」文字列表与下方「当日地点」卡片确实在重复表达同一批点。
- 合并为 `src/components/DayTimeline.vue`：单条竖线编号时间轴，行程点渲染成卡片（类别图标＋类别名、时间、地名＋导航图标、节奏原文的车程与预计到达、看点玩法、更多、随手记、完成勾选、可选角标），非行程点用小圆点＋时间＋文字串在同一条线上。节奏原文与看点玩法去标点后互相包含时只留一条，避免同一句读两遍。
- 类别图标取 Google Material Symbols Rounded 官方 SVG（`src/assets/poi/`）：景点 landscape、住宿 hotel、机场 flight、码头 directions_boat、车站 train、餐厅 restaurant、市场 storefront。最初用内联 `style` 绑定 `mask-image` 失败——Vite 把小 SVG 内联成含引号的 data URI，未加引号的 `url()` 整条声明被浏览器丢弃、`maskImage` 计算值为 `none`，只剩一个纯色方块；改为在 `styles.css` 里按类名写 `mask-image`，交给 Vite 处理资源路径后正常。
- 调研数据：4 个并行子代理产出 `data/extras/{wa,tas-south,tas-north-vic-east,vic-west}.json`，覆盖 48 个点、103 家餐厅与全部停车信息，坐标来自 OSM Overpass／Nominatim，评分与推荐菜均带来源 URL。查不到 Google 评分的 56 家保持 `rating: null`，界面显示「暂无可核实评分」，另起一个子代理按可核对来源补齐。
- 天气拆点：`scripts/enrich_place_data.py` 把「A／B／C 约 10-21°C；D 约 12-25°C」按分句拆成温度分段，先按中英地名直配（27 个），配不上的用 haversine 就近归属到最近分段（24 个），并保留分段间的补充说明与当日共同提示。界面上机场只显示机场那一段，`nearby` 会标出「采用最近的 XX 作为参考」。
- 详情弹层：页签改为按资料动态生成（看点／实用／天气／文化／美食），空分类不占位；`--tab-count` 让页签始终单行均分（390px 下 5 个各 68px）。美食页签显示评分、评价数、距离、人均、推荐菜与逐店导航；实用页签追加停车卡片（免费／收费口径、车位、路面、房车提示）＋官方停车规则＋来源。
- 关闭状态如实进入界面：Maits Rest 步道、Loch Ard Gorge 沙滩阶梯、Tasman Arch／Devils Kitchen 施工等均写在对应「实用」页签，并要求出发前复查官方页面。
- 自动化：`corepack pnpm typecheck` 通过；Vitest 34/34 通过（新增类别图标、名称兜底、调研数据完整性、评分来源、收费口径、美食页签、逐点天气 9 条）；`corepack pnpm build` 通过，主 JS 635 kB、CSS 92 kB，precache 14 条 / 732 KiB。
- Chrome MCP 390×844×2 实测：D2 机场为 flight 图标／「机场」，D10 码头为 boat／「码头」，D13 女王市场为 storefront／「市场」；十二门徒五页签单行、停车卡片与 Parks Victoria 规则齐全；酒杯湾天气显示 7-17°C 并标注「采用最近的科尔斯湾（Coles Bay）作为参考」；浅深主题均无横向溢出。

## 2026-08-22 企鹅观赏与返程节奏调整
- `doc-content.md`／`days-raw.txt`：10/1改为Coles Bay午后直达Launceston；10/5保留十二门徒、Loch Ard仅短停、取消London Bridge／The Grotto并直达St Kilda，观赏后才回酒店。
- `animal-section.md`／愿望清单：Bicheno改为本次不看，小蓝企鹅改由St Kilda覆盖；新增St Kilda票务待定项。
- `build_itinerary.py`／`itinerary.json`：新增`d12-08` St Kilda；`d8-04`、`d12-05`、`d12-06`改skip；保持10/2 Platypus House→Cradle过夜、10/3 Cradle→Devonport。
- `build_kml.py`／KML：D8改名“酒杯湾→朗塞斯顿”，D12–13图层加入St Kilda；本次不看层包含Bicheno、London Bridge、The Grotto。
- `src/data/trip-data.json`／测试：地点85条（visit 50／skip 35）、愿望清单54条；新增10/1与10/5断言，节奏解析覆盖St Kilda。
- 验证通过：`corepack pnpm typecheck`、Vitest 35/35、`corepack pnpm build`；仅保留既有主chunk大于500 kB警告。
- 未commit、未push；10/6未改。
- 发布：`main` 推到 `3fd34f6`（功能、文档、带评分的数据重建三条提交），`gh-pages` 推到 `71986c5`，线上加载 `index-B6LMl6Rc.js`。
- 线上 390×844 验收：9/25 时间轴 1 机场／2-4 景点／5 住宿图标与类别正确，车程节点以小圆点串在同一条竖线上；机场弹层页签为「看点／实用／天气／美食」各 86.5px 均分；天气只显示「珀斯机场 10-21°C」并把同日提示单独放在「当日共同提示」；美食页签 Da Corner 4.4（57 条）等 4 家均带导航与来源；实用页签给出 Perth Airport 首小时免费范围、驶入价与接送区限时。
- 评分补齐结果：103 家餐厅中 93 家取到评分（Google 地图转引 55、Tripadvisor 32、其它聚合站 6），10 家仍无可核实评分，保持「暂无可核实评分」。
- 遗留冲突：工作区出现另一路并行改动（St Kilda 企鹅场次、Platypus House 订票、`build_itinerary.py`／KML 重建），把带 `placeId` 的行程点由 46 改成 41、地点总数改成 85，导致两条计数断言失败，且新点「霍巴特（过境，不硬塞市区）」缺类别／美食／停车。该批改动未提交，等确认后再决定是否并入。

## 2026-08-22 地图／文字同页与双向定位
- 已按 `redesign-existing-projects` 审计日程页：保留现有 Vue 3、Vant 与原生 OSM，不加依赖；重点减少重复标题、套盒与长期占屏日期按钮。
- `App.vue` 已改为地图在上、文字在下同时渲染；sticky「按当天时间顺序／行程节奏／地图／文字」只做页内平滑跳转。
- 日期选择改为默认折叠 bar，选日后自动收起；日摘要由约 190px 的区域＋完整路线压到 72px，只显示第几天、起点、终点。
- `DayTimeline.vue` 在 Google 导航图标前新增蓝色定位图标，并以 `data-place-id` 暴露文字锚点；当前地图选中的文字卡同步蓝色描边。
- `TripRhythmMap.vue` 移除 marker 点击后的 Google 导航卡；marker 改为直接回到对应文字卡。文字定位只平移 center、不改变 zoom，marker 蓝色脉冲约 1.1 秒后保持异色。
- 阶段检查：`corepack pnpm typecheck` 通过；390×844 本地运行态验证点 2 文字→地图与点 4 地图→文字均成功，旧高亮均被新点替换，页面无横向溢出。
- 补充滚动联动：手动滚到文字段时 sticky 页签自动切为「文字」，回到地图段切为「地图」；不是只有点击页签时才更新。
- 深色 390×844 复验：日期展开可用、选日后收起，sticky top=0，页面 390/390 无横向溢出；选中 marker 使用 `#78A6FF`，浅色使用 `#2F6FED`。
- 第二轮自动化：`corepack pnpm typecheck`、当前工作树 Vitest 35/35 通过。
- 为排除待确认行程改动干扰，从 `02a24fd` 建 detached 干净工作树，仅应用本次四个前端文件：typecheck、基线 Vitest 34/34、production build 全通过；输出 JS 635.75 kB、CSS 106.29 kB，PWA precache 14 条 / 740.80 KiB。唯一警告仍是既有主 chunk 大于 500 kB。
- 数据契约复核：基线 46 个可地图化节奏点全部有 `placeId`，因此每个 marker 都能可靠回到文字锚点，不存在可点但无响应的编号。
- 本轮未提交、未推送、未发布；用户未明确要求 Git 操作，且工作区仍保留此前选择「先留本地」的 St Kilda／KML 并行改动。

## 2026-08-22 日期摘要合并、序号定位与地图触摸协作
- 删除独立黄色日期 bar；`day-summary` 合并日期选择与路线摘要，左侧「第 N 天／MM/DD 周X／箭头」可展开 13 天选项，选日后自动收起，右侧显示起点／终点及右对齐时间。
- D2 390×844 实测合并卡高 94px，正文为「第2天／09/25周五／珀斯机场 04:20／塞万提斯 日落后」，页面 390/390 无横向溢出。
- 移除地点标题后的蓝色定位 icon；左侧数字序号直接定位地图并触发蓝色脉冲。原完成开关移动到「更多／随手记」同行，序号不再混用完成语义。
- 地图 marker 点击改为稳定的 `click.stop.prevent`，父组件经 animation frame 聚焦并滚到文字锚点。实测点 2 文字→地图后 marker 2 脉冲；地图点 4→文字后卡片 4 位于视口上部、页签为「文字」、全局仅 1 个高亮。
- 地图默认 `touch-action:pan-y` 并显示「单指上下滑动页面」；点「操作地图」后切为 `none`，点「完成」恢复。实测 computed touchAction 为 `pan-y → none → pan-y`。
- 当前工作树 `corepack pnpm typecheck` 与 Vitest 35/35 通过。
- 从 `9522c96` 建 detached 干净工作树，仅应用本轮四个前端文件：typecheck、基线 Vitest 34/34、production build 全通过；产物 `index-D-Lg9blC.js`／`index-Bsrv490v.css`，PWA precache 14 条 / 741.44 KiB。唯一警告仍是既有主 chunk 大于 500 kB。
