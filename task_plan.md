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
阶段 54（已完成）

### 阶段 54：Iron Creek Bay Estate 双酒店保留同步
- [x] 核准 Iron Creek Bay Estate 地址、坐标及当前行程日期口径
- [x] 更新本地权威行程、KML 与 PWA 数据：Iron Creek 为当前住宿，Quest Savoy 保留为已订备选
- [x] 原地更新飞书云文档相关总览、逐日行程、必订清单与待定问题
- [x] 在私人 Google My Maps 的 D5–6 图层新增 Iron Creek，Quest Savoy 不删除，并统一住宿图标
- [x] 通过 typecheck、测试、构建及地图／飞书复验
- [x] 发布线上路书并完成生产环境复验
- **状态：** completed

### 阶段 53：修复线上路书未更新与地图长地名裁切
- [x] 定位「刷新无效」根因：上轮 `pnpm run build` 输出被 `head -8` 截断，`sw.js` / `404.html` 未生成，旧 Service Worker 继续供旧缓存
- [x] 完整重建并重新发布 gh-pages（`5c9e021`），线上恢复 SW 注册与 10/3 新行程
- [x] 修复地图标签把「Mantra Melbourne Airport（住宿）」裁成半行：改为 JS 侧统一去括号并按两行预算截断
- [x] 发布标签修复并在移动端视口线上验收（gh-pages `eb46189`，三条标签均无裁切）
- [ ] 待用户确认后再同步飞书云文档与 My Maps 的 10/2 营地、10/3 改飞
- **状态：** in-progress

### 阶段 52：9/25 改订「能洗热水澡」的营地
- [x] 核实 Sandy Cape 是否有淋浴（官方页确认 no showers，旧写法有误）
- [x] 复核 RAC Cervantes 单晚房态，纠正「3 晚起订」误判
- [x] 实测 Jurien Bay Tourist Park 与 Green Head 的 9/25 价格与预订方式
- [x] 按有热水淋浴重排首选／备选／兜底并回写飞书与本地
- **状态：** complete

### 阶段 51：10/2 Discovery Parks 带电营位回写飞书
- [x] 定位飞书文档 10/2 住宿、总览、必订清单、待定问题第 3 项
- [x] 按已确认 powered 营位原地更新，并同步 `doc-content.md`
- **状态：** complete

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
- [x] 删除「地图／文字」页签，不改变地图与文字同页、双向定位和自动滚动
- [x] 日期摘要卡吸顶，展开日期选择后仍可选任意一天
- [x] 把「操作地图／完成」「回到全览」移到地图画布外，改为克制的文字操作
- [x] 地图操作模式支持真实双指缩放；退出后恢复单指页面滚动且双指不缩放地图
- [x] 卡片底部改为「更多」左下、「随手记」右下
- [x] 完成全产品一轮定向视觉优化，通过 typecheck、测试、构建与移动触控验收
- [x] 提交并发布 GitHub Pages，线上复验
- **状态：** complete

### 阶段 37：删除「行程节奏」段落标题
- [x] 移除日程页「按当天时间顺序／行程节奏」标题块与其专属样式
- [x] 清理页签时代遗留文案（空状态按钮、无坐标节奏提示）
- [x] 通过 typecheck、测试、构建与 390×844 移动端复验
- [x] 提交并发布 GitHub Pages
- **状态：** complete

### 阶段 38：霍巴特跟团集合点与住宿调研
- [x] 打开 Booking 与 Airbnb 登录页
- [x] 等待用户在浏览器中完成登录
- [x] 核查 9/29 塔斯曼岛、9/30 玛利亚岛 Klook／GetYourGuide 团型与集合／接送点
- [x] 基于两个集合点确定霍巴特推荐住宿区域与通勤方案
- [x] 检索 9/28 入住、10/1 退房的 Booking／Airbnb 房源（自助入住、厨房、约 ¥600–900／晚、高评分）
- [x] 输出集合信息、区域建议和可预订房源
- **状态：** complete

### 阶段 39：集合点附近可取消住宿并标到 My Maps
- [x] 确认两集合点坐标与图层（Franklin Wharf / 20 Davey St）
- [x] 在 Booking、Airbnb、携程检索 9/28–10/1、两人独享、≤¥900/晚、可取消、水壶+微波炉、步行10分钟或 Uber10分钟、近超市
- [x] 选定推荐房源并记录预订链接与坐标
- [x] 在 Google My Maps 加入 Quest Savoy 标记（默认进了 D2 图层；洋红色房屋图标需用户在侧栏改一次样式，或把点拖到 D5–6）
- [x] 把同样点位写入本地 `layers/集合点_霍巴特跟团.kml`
- **状态：** complete

### 阶段 40：同步 10/1、10/5 新行程与移动底栏滚动显隐
- [x] 读取指定会话 `a25175a5-7da0-48fa-bb57-b2f5a240d04d`，确认 A 方案为唯一权威口径
- [x] 读取并核验最新飞书云文档 `TAoHd0QFyoo7lpxGk9DcpN0nnCc`（revision 506）
- [x] 对照本地路书：取消 Bicheno 企鹅，10/5 加入 St Kilda 市区企鹅
- [x] 将同一口径同步到在线 Google My Maps（D8、D11、D12–13、本次不看 四层用 KML 重新导入替换）
- [x] 同步路书数据、生成产物、文档与测试
- [x] 调研移动端底栏滚动显隐模式，按现有视觉体系实现
- [x] 完成 typecheck、测试、构建与移动端交互复验
- **状态：** complete

### 阶段 41：摇篮山 10/2 过夜调研
- [x] 确认国家公园自驾／接驳规则
- [x] 比较住宿区域（看点、银河、极光）
- [x] 在 Booking／Airbnb／携程检索 10/2–10/3、免费停车、独立卫浴、≤¥900
- **状态：** complete

### 阶段 42：珀斯机场 9/27 过夜
- [x] 确认 9/28 VA594／还车时间对住宿距离的约束
- [x] Booking／Airbnb／携程检索机场附近最便宜且评分可靠的公寓／民宿
- [x] 核对停车、独立卫浴、到 T1 车程
- **状态：** complete

### 阶段 43：阿波罗湾 10/4 过夜
- [x] Booking／Airbnb／携程检索免费停车、整套、独立卫浴、微波炉+水壶、≤¥800
- [x] 核对评分与位置（镇内便于 10/5 早出发）
- **状态：** complete

## 当前阶段
阶段 47（已完成）

### 阶段 44：同步已确认住宿到云文档、My Maps 与路书
- [x] 核对 6 家住宿的准确英文名、地址、坐标及是否已在地图中；Discovery Parks 日期订错，按用户确认保留为待重新预订
- [x] 原地更新飞书云文档各日住宿信息
- [x] 将 5 个已确认住宿点去重后加入对应 My Maps 图层，并统一为黑底白床图标
- [x] 更新本地权威行程、KML 与路书静态数据
- [x] 完成 typecheck、测试、构建及地图／文档／路书交叉核验
- **状态：** complete

### 阶段 45：剩余需提前预约项目核查
- [x] 以当前权威主行程筛出容量受限的团、场次与预约项目
- [x] 核查 Platypus House、Devils@Cradle、St Kilda 与国家公园官方规则
- [x] 实测 10/2 Platypus House 与 Devils@Cradle 当前库存
- **状态：** complete

### 阶段 46：Freycinet／Cradle／Caversham 官方购票链接
- [x] 核对 Parks Pass、Cradle shuttle／Icon、Caversham Roller 官网入口
- **状态：** complete

### 阶段 47：10/2 摇篮山营地与 10/3 飞墨尔本改线
- [x] 按用户确认的 20:00 起飞时间计算建议到场时间；航班号与实际到达时间待票面确认
- [x] 核查 Discovery Parks - Cradle Mountain 2026-10-02 营位实时库存及官方预订直链
- [x] 比较 10/3 延长国家公园游览、Sheffield 短停与 Tasmania Zoo 三套方案，核算车程与机场余量
- [x] 形成 10/3 推荐行程、天气备选、动物园备选与硬性离场时间
- [x] 本轮用户未要求正式同步云文档、My Maps 与路书；待航班／10/3 墨尔本住宿确认后再统一写入，避免形成半确认版本
- **状态：** complete

### 阶段 48：9/25—9/26 西澳合法车宿与营地
- [x] 按两日路线核实免费／无需订房车宿点的合法性与距离
- [x] 核实 Cervantes、Kalbarri 附近营地是否接受普通轿车／SUV 内睡眠
- [x] 实测 2026-09-25、09-26 单晚营位库存、最低价格与预订限制
- [x] 比较路线便利、设施、口碑与晚到风险并给出主备方案
- **状态：** complete

### 阶段 49：9/29 亚瑟港交通与 Maria Island 团／船对比
- [x] 核对 Tasman Island Cruises 自驾版真实签到时间、地点与 Hobart 发车时刻
- [x] 核查公共巴士、Pennicott 普通接驳、同团早班车、私人转运与租车的时间／预算可行性
- [x] 对比 Tours Tasmania 跟团与 Encounter Maria Island 自购船票的包含项
- **状态：** complete

### 阶段 50：车宿与营地方案回写飞书云文档
- [x] 定位 9/25、9/26 住宿建议单元格与总览、必订清单、待定问题对应 block
- [x] 原地替换首选／备选／兜底／排除方案（未新建文档）
- [x] 同步本地 `doc-content.md` 并复核飞书更新结果
- **状态：** complete

### 阶段 51：9/30 Maria Island 跟团被取消后的补救
- [x] 实测 Encounter Maria Island 官方系统 9/30 逐班次余位（含相邻日期对照）
- [x] 实测 Hobart—Triabunna 官方接驳 9/30 是否运营与时刻
- [x] 排查替代跟团（Tours Tasmania、East Coast Cruises 两条巡游线）9/30 是否有位
- [x] 核对 Encounter 退改规则、候补口径与联系方式
- [x] 用户改为自驾解决两日交通，不再等待接驳方案
- **状态：** complete

### 阶段 52：塔斯曼／玛丽亚岛双早班的中间住宿
- [x] 核对两个实际登船／签到地点及官方停车安排
- [x] 以两地车程、超市、可逛性和霍巴特机场 Uber 可达性筛选住宿区域
- [x] 实测 2026-09-28—10-01 住宿价格与可订性，筛选每晚人民币 900 元以内的备选
- [x] 给出主选、备选和风险提示
- **状态：** complete

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
| 手写 `git apply --cached` 测试补丁损坏 | 2 | 修正第二个 hunk 的旧／新行数，只暂存本轮新增测试，未带入并行行程改动 |
| 首次干净构建命令仍在主工作区执行 | 1 | 改用 `/tmp/au-redesign-build` 作为 Shell working directory 后重新完整验证 |

## 备注
- 阶段 11 用户明确要求 GitHub 部署，允许 commit / push / 创建仓库 / 开启 Pages（禁止 force push、禁止改 git config）
- 不新建无关 markdown；规划三文件除外
- 不修改飞书、KML、地图构建数据与 Google My Maps
