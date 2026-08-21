# 任务计划：完善澳大利亚自驾行程表

## 目标
基于 Codex 线程共识与仓库现有材料，统一并优化行程口径（主表 / 愿望清单 / 动物核对 / 地图数据），标注待确认项。

## 各阶段

### 阶段 1：需求与发现
- [x] 定位并读取 Codex thread `01a00b1d-6bd6-73c0-b41c-10c209ae3ddf`
- [x] 摸清仓库行程相关文件
- [x] 将发现记录到 findings.md
- **状态：** complete

### 阶段 2：规划与结构
- [x] 以每日主行程表为唯一权威口径
- [x] 识别愿望清单 / 动物核对 / itinerary.json / KML 的过时条目
- [x] 确定优化项：文首总览、待定问题、口径对齐、可选点标注
- **状态：** complete

### 阶段 3：实现
- [x] 更新 `doc-content.md`（总览 + 待定 + 纠正矛盾）
- [x] 同步 `animal-section.md`
- [x] 修正 `itinerary.json` 并将过时点改为 skip／optional
- [x] 重建 KML
- **状态：** complete

### 阶段 4：测试与验证
- [x] 交叉核对主表 vs 愿望清单 vs 动物表
- [x] 记录结果到 progress.md
- **状态：** complete

### 阶段 5：交付
- [x] 用中文回报：能否读 deep link、现状摘要、改动点、待确认项
- **状态：** complete

## 当前阶段
阶段 23（手机、离线、线上验收与发布）

### 阶段 6：PWA 需求与数据审计
- [x] 对照飞书最新版与本地全部材料
- [x] 统计日期、地点、skip / optional 与富文本章节
- [x] 确定 typed 静态数据模型与信息架构
- **状态：** complete

### 阶段 7：PWA 工程与产品实现
- [x] 初始化 Vue 3 + Vite + TypeScript + Vant + PWA
- [x] 实现首页、日程、搜索、准备清单与独立「本次不看」页
- [x] 实现地点详情、导航、收藏、完成、备注与主题
- [x] 实现离线、安装、更新及异常状态
- **状态：** complete

### 阶段 8：测试与移动端验收
- [x] 编写数据完整性、导航 URL、搜索与日程选择单测
- [x] 运行 typecheck、test、build 并核验 Service Worker
- [x] 启动预览，完成移动视口、离线与 Lighthouse 验证
- **状态：** complete

### 阶段 9：文档与交付
- [x] 更新中文 README 与真实限制
- [x] 将覆盖统计与验证结果写入 progress.md
- [x] 最终交付，不 commit / push / deploy
- **状态：** complete

### 阶段 10：首页空状态与响应式复验
- [x] 为无点位日补通用富内容空状态及单测
- [x] 修复 390px 三快捷操作文字换行
- [x] 修复 1024px 首页两列栅格归属
- [x] 用干净浏览器上下文排除首次安装更新条误报
- [x] 重跑 typecheck、test、build 并核验 precache
- **状态：** complete

### 阶段 11：GitHub Pages 远程部署
- [x] 确认 gh 登录账号（非 Leo-ai05 则以实际账号为准）
- [x] 为子路径设置 Vite base、router、PWA manifest/offline
- [x] 补 `.gitignore`；提交源码；创建公开仓库并推送
- [x] 将 dist 部署到 `gh-pages` 并开启 GitHub Pages
- [x] 用 Chrome DevTools MCP 在 390×844 复验线上 URL
- **状态：** complete

### 阶段 12：行程节奏地图可行性审计
- [x] 核查 API key、My Maps、KML、每日坐标与现有数据生成链路
- [x] 实证 Google Embed / My Maps / Directions 的分日标注限制
- [x] 确定符合技术栈规范、可上线且可降级的交互地图方案
- **状态：** complete

### 阶段 13：行程节奏双视图实现
- [x] 解析每日节奏节点、时间窗与匹配坐标
- [x] 实现文字 / 地图切换、路线、导航与无坐标提示
- [x] 实现地图联网错误态与一键切回文字
- **状态：** complete

### 阶段 14：测试与移动端验收
- [x] 增补解析顺序、无坐标与导航 URL 单测
- [x] 通过 typecheck、test、build
- [x] 390×844 移动端至少验收两天及离线行为
- **状态：** complete

### 阶段 15：提交、部署与交付
- [x] 提交并推送 main（禁止 force push）
- [x] 更新 gh-pages 并复验线上 URL
- [x] 汇总方案、文件、解析、离线与真实限制
- **状态：** complete

### 阶段 16：地图全览与数据归属重构
- [x] 为地图补边界计算、进入自动 fit、单点限制与全览归位
- [x] 消除常显时间标签重叠，保留编号与按需详情
- [x] 在数据层将预约、注意事项、观赏时段、看点玩法归属到行程点
- [x] 为未归属内容保留日级去处并输出统计
- **状态：** complete

### 阶段 17：逐点移动交互与标题调整
- [x] 天气按真实粒度选择展示位置
- [x] 用 Vant 按需组件实现天气、预约、玩法叠加交互
- [x] 修改折叠区标题并保持信息完整
- **状态：** complete

### 阶段 18：测试、手机验收与发布
- [x] 补 fit 边界与信息归属单测
- [x] 通过 typecheck、test、build
- [x] Chrome MCP 复验 Day 2、Day 12、单点日、Day 1
- [x] 提交并推送 main、更新 gh-pages、线上复验
- **状态：** complete

### 阶段 19：产品级重构审计与缺陷复现
- [x] 通读六张截图、技能、规划、源码、数据生成器与既有测试
- [x] 在当前线上／本地版本复现地图关闭、全览与空入口问题
- [x] 将三个缺陷根因和设计审计结论写入 findings.md
- **状态：** complete

### 阶段 20：数据访问层与稳定序号
- [x] 增加 TripRepository、JournalRepository、WeatherRepository 合约与静态实现
- [x] 从数据生成层提供稳定 sequence、分类信息与天气参考模型
- [x] 保留既有 Pinia 持久化 key，页面不再直接导入 JSON 或操作日志存储
- **状态：** complete

### 阶段 21：目的地交互、随手记与静态导出
- [x] 修复地图卡片关闭和全览反馈，加入 optional marker 语义
- [x] 重构目的地标题行操作与“更多”四分类弹层
- [x] 完成目的地日志、照片压缩／IndexedDB、全局按天汇总
- [x] 完成默认不含日志的单文件离线路书下载
- **状态：** complete

### 阶段 22：暖色视觉与完整测试
- [x] 落实暖色 light／dark 设计、390px、安全区与 reduced motion
- [x] 补稳定序号、分类、地图状态、日志 CRUD、10 图、汇总、天气与导出测试
- [x] 通过 typecheck、test、build
- **状态：** complete

### 阶段 23：手机、离线、线上验收与发布
- [x] Chrome MCP 实测指定日期、Popup、日志、下载、双主题与离线降级
- [ ] 提交并推送 main，更新 gh-pages
- [ ] 打开生产 URL 完成最终复验
- **状态：** in_progress

## 关键问题
1. Tower Hill / Warrnambool 是否彻底放弃，还是仅作「时间极充裕时的西延可选」？
2. Loch Ard Gorge 是否作为 10/5 十二门徒后的顺路可选短停？
3. 飞书云文档是否需同步本地更新？

## 已做决策
| 决策 | 理由 |
|------|------|
| 以每日主行程七列表为权威 | Codex 末轮与用户确认的塔州／大洋路顺序均已写入主表 |
| Tower Hill／Warrnambool 改「不在本次」 | 与 10/4 东段→Apollo Bay、10/5 沉船→墨尔本方向冲突 |
| Loch Ard 标为可选短停 | 地理上紧挨十二门徒，不破坏主线 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| rolldown 无法解析 workbox-window | 1 | 显式安装 workbox-window，保留 virtual:pwa-register/vue |
| 主 chunk 大于 500 kB | 1 | Vant 按需引入 Icon/Search/Popup |
| Vant sun-o / moon-o 无字形 | 1 | 主题按钮改用 replay / eye-o / closed-eye |
| 图标 CSS 含 at.alicdn.com 回退 | 1 | Vite 插件剥离 CDN，仅保留内联 woff2 |
| Chrome MCP 整页截图超时 | 3 | 改用 390x844 a11y 快照与布局脚本 |
| Lighthouse navigation NO_FCP | 1 | 改用 snapshot；MCP 不含 PWA/性能分类 |
| Python 3.9 不支持运行时求值的 `dict | None` | 1 | 增加 `from __future__ import annotations` |

## 备注
- 阶段 11 用户明确要求 GitHub 部署，允许 commit / push / 创建仓库 / 开启 Pages（禁止 force push、禁止改 git config）
- 不新建无关 markdown；规划三文件除外
- 不修改飞书、KML、地图构建数据与 Google My Maps
