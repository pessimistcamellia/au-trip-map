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
阶段 36（进行中）

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
- [x] 提交并推送 main，更新 gh-pages
- [x] 打开生产 URL 完成最终复验
- **状态：** complete

### 阶段 24：双主题运行态与视觉审计
- [x] 实测线上 `colorScheme: light` 与 `dark`，确认“黑橙”来源
- [x] 通读设计技能、技术栈规范、规划文件与全部颜色使用点
- [x] 确定 light／dark 语义 token 与 WCAG 对比度基线
- **状态：** complete

### 阶段 25：清新双主题视觉实现
- [x] 重做全局 token、卡片层次、阴影、圆角、字重与交互状态
- [x] 收敛地图 marker／路线／控件及静态导出中的硬编码颜色
- [x] 同步 manifest、HTML theme-color、offline 与本地图标
- **状态：** complete

### 阶段 26：自动化与手机双主题验收
- [x] 通过 typecheck、test、build
- [x] 390×844×2 light／dark 覆盖首页、日程地图、四分类、日志汇总、准备页
- [x] 核验无横向溢出、按钮单行、触摸目标、marker 与弹层层级
- **状态：** complete

### 阶段 27：提交、发布与线上复验
- [x] 以中文 Conventional Commit 提交并推送 main
- [x] 更新 gh-pages，不 force push
- [x] 打开生产 URL 双主题复验并记录真实限制
- **状态：** complete

### 阶段 28：地图常显地名标签
- [x] 核验 Google Maps／My Maps 与现有 OSM 自定义标注能力
- [x] 为每个当日 marker 增加不随缩放变小的中文地名标签
- [x] 验证 5／8 点视野、浅深主题、拖动缩放与全览
- [x] 通过 typecheck、test、build
- [x] 发布线上并复验生产构建
- **状态：** complete

### 阶段 29：Puffing Billy 可行性与条件式插入
- [x] 核对仓库现状（愿望清单／itinerary.json／KML 原为「本次不看」）
- [x] 实证官网时刻表、票价、检票规则与 Menzies Creek 博物馆开放时间
- [x] 用 Spirit of Tasmania 排班 API 取得 10/3 夜航实际抵港时刻（07:00，夏令时）
- [x] 用 OSRM 核算码头／Belgrave／大洋路各段车程
- [x] 以「船准点才坐」的可选点写入 doc-content.md、itinerary.json、KML、trip-data.json
- [x] 补测试并通过 typecheck / test / build
- **状态：** complete

### 阶段 30：地名标签矩形定位与自动更新
- [x] 定位「用户看不到地名」双因：旧 SW 缓存 + 贴边标签被容器压成竖条
- [x] 标签改为 JS 计算最终矩形（left/top/width），去掉 transform 横向偏移
- [x] PWA 改 autoUpdate（clientsClaim / skipWaiting）并加 60s 版本轮询
- [x] 更新单测、通过 typecheck / test / build
- [x] 发布并在线上复验 13 天全览 + 缩放极限
- **状态：** complete

### 阶段 31：节奏与目的地卡片合并、POI 类别与美食停车
- [x] 摸清节奏节点与地点对应关系（含无 placeId 的行车／活动节点）
- [x] 下载 Google Material Symbols 官方图标（景点／住宿／机场／码头／车站／餐厅／市场）
- [x] 新增 `placeCategory` 服务与 `PlaceCategory`、`IPlaceFood`、`IPlaceParking` 类型
- [x] 调研 48 个 POI 的真实附近餐厅（103 家，含来源）与停车信息
- [x] 新增 `scripts/enrich_place_data.py` 合并 `data/extras/*.json`，并把日级天气按地名直配／坐标就近拆成逐点
- [x] 将行程节奏与目的地卡片合并为单条编号时间轴（保留车程、做什么、导航、随手记、更多）
- [x] 详情弹层新增「美食」页签，「实用」页签补停车卡片，页签数量动态均分
- [x] 补 9 条单测（类别图标、美食页签、逐点天气、调研数据完整性），typecheck / test / build 全通过
- [x] 390×844 明暗双主题验收：图标 mask、五页签单行、无横向溢出
- [ ] 补齐缺失的餐厅评分（56 家待补）
- [ ] 提交、发布 gh-pages 并线上复验
- **状态：** in-progress

### 阶段 32：企鹅观赏与返程节奏调整
- [x] 核对 10/1、10/2—3、10/5 的文档、地图与前端生成链
- [x] 取消 Bicheno 企鹅并改为 10/1 直接前往 Launceston
- [x] 压缩 10/5 沉船海岸并加入 St Kilda 企鹅第一场
- [x] 同步动物表、愿望清单、JSON、KML、前端数据与测试
- [x] 通过 typecheck、test、build
- **状态：** complete

### 阶段 33：地图与文字同页、双向定位和日程页精简
- [x] 行程卡增加定位按钮，跳到地图并让对应 marker 脉冲后保持异色高亮
- [x] 地图 marker 点击回到文字时间轴对应卡片，并替换上一个高亮点
- [x] 地图在上、文字在下同页展示；悬浮「行程节奏／文字／地图」作为页内快捷锚点
- [x] 日期选择改为默认折叠的紧凑 bar，选日后自动收起
- [x] 日摘要卡压缩为「第几天／起点／终点」三行
- [x] 通过 typecheck、单测、构建和 390×844 移动端双向交互验收
- [x] 从干净工作树验证，确认未带入待确认的 St Kilda／KML 并行改动
- **状态：** complete

### 阶段 34：日期摘要合并、序号双向定位与地图触摸协作
- [x] 删除独立黄色日期 bar，把第几天、日期星期、下拉入口、起终点与时间合并到一张卡
- [x] 文字时间轴序号改为地图定位入口，移除标题后的定位 icon；完成状态移到文字操作区
- [x] 修复地图 marker 点击后未稳定滚到文字卡的问题
- [x] 地图默认允许单指滚动页面，通过明确的地图操作模式区分页面滚动与地图拖动
- [x] 通过 typecheck、测试、构建及 390×844 触控实测
- [x] 提交并发布 GitHub Pages，提供带版本参数的新链接
- **状态：** complete

### 阶段 35：修复 marker 真实触摸失效与卡片底部按钮排版
- [x] 用真实输入事件（而非脚本 click）复现地图 marker 点击无响应
- [x] 定位并修掉根因：全局 `button:active` 的 transform 覆盖 marker 自身 translate
- [x] 删除卡片上的「标记完成」，完成开关移入「更多」弹层底部
- [x] 「随手记」左下、「更多」右下且与导航图标同列，统一基线与触达高度
- [x] 通过 typecheck、测试、构建，并在线上以真实点击复验双向定位
- **状态：** complete

### 阶段 36：吸顶日期摘要、地图外置操作与双指缩放
- [x] 读取 `redesign-existing-projects` 并审计截图、日程结构、地图控件与卡片操作层级
- [ ] 删除「地图／文字」页签，不改变地图与文字同页、双向定位和自动滚动
- [ ] 日期摘要卡吸顶，展开日期选择后仍可选任意一天
- [ ] 把「操作地图／完成」「回到全览」移到地图画布外，改为克制的文字操作
- [ ] 地图操作模式支持真实双指缩放；退出后恢复单指页面滚动且双指不缩放地图
- [ ] 卡片底部改为「更多」左下、「随手记」右下
- [ ] 完成全产品一轮定向视觉优化，通过 typecheck、测试、构建与移动触控验收
- [ ] 提交并发布 GitHub Pages，线上复验
- **状态：** in-progress

## 关键问题
1. Tower Hill / Warrnambool 是否彻底放弃，还是仅作「时间极充裕时的西延可选」？
2. St Kilda 10/5 第一场实际票面时间与余票是否确认？
3. 飞书云文档是否需同步本地更新？
4. Puffing Billy 是否接受「船准点才坐、晚到即弃票」的条件式安排，并尽早在官网下单 10/4 10:00 班次？

## 已做决策
| 决策 | 理由 |
|------|------|
| 以每日主行程七列表为权威 | Codex 末轮与用户确认的塔州／大洋路顺序均已写入主表 |
| Tower Hill／Warrnambool 改「不在本次」 | 与 10/4 东段→Apollo Bay、10/5 沉船→墨尔本方向冲突 |
| Loch Ard 标为可选短停 | 地理上紧挨十二门徒，不破坏主线 |
| Puffing Billy 放 10/4 上午且只取 Menzies Creek 往返 | 10/6 与航班冲突约 4 小时；10/5 周一只开 2h55+ 的 Lakeside 往返；Menzies Creek 往返仅约 2 小时且周五至周日限定，10/4 正好周日 |
| 该点写成可选＋中止条件而非主线 | 船 07:00 抵港与 09:00 应到票房只差 1h45，恰等于车程，没有延误余量 |

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
