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
