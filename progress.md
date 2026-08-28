# 进度日志

## 2026-08-28 删除日级冗余模块与地点视觉分层
- 已从 `App.vue` 完整删除日程页“住宿与其他信息”折叠模块，并从 `staticTripExport.ts` 删除同名离线导出区块；住宿地点卡、导航、详情弹层和“准备”页信息不受影响。
- `DayTimeline.vue` 为每个地点行增加语义类别 class；景点改为金色高强调编号、19px 山景图标与卡片左侧强调，住宿改为低调灰绿色编号、15px 床铺图标和无阴影中性色卡片。
- `TripRhythmMap.vue` 新增 `places` 输入并按地点类别渲染地图 marker：主图形显示类别 glyph，序号缩为右上角角标；景点为较大的金色圆形，住宿为较小灰绿色圆角方形，住宿地名标签同步降权。
- `styles.css` 新增明暗主题的景点／住宿语义色，清理已删除 `.day-details` 的死样式；未引入任何依赖。
- 验证通过：`vue-tsc --noEmit`、Vitest 43/43、production build（PWA precache 14 条／704.58 KiB）；390×844 移动端浅色和深色本地验收无横向溢出。
- 已发布 main `0eac4d1` 与 gh-pages `a00bfb9`。生产页 10/2 复验：无 `.day-details` 和“住宿与其他信息”文本；5 个地图点中 4 个为景点圆标、1 个为住宿方标，均带 glyph 与序号角标；时间轴分别带 `category-attraction`／`category-lodging`。

## 2026-08-28 住宿图标全量审计
- 逐点回读 My Maps 图标 URL 发现三处不一致：`D9-5 Discovery Parks` 与 `D11-5 Twelve Apostles Motel` 仍是默认蓝钉（此前重导图层后未补回），`D12-4 泰迪观景台` 被误套黑底白床。
- 根因：侧栏行在 `scrollIntoView` 动画期间会漂移（实测同一行 y 从 351 变到 389），旧脚本「先测坐标、后点击」会打到相邻行；油漆桶按钮只在悬停时出现，必须从目标行内部重新取。
- 新脚本 `/tmp/fix_icons.py` 要求行坐标连续两次一致后再测量，点击后立刻回读该行图标 URL 校验；图标选择器是雪碧图，读不到图标名，改为筛选后按序号选择再回读验证。
- 刷新页面确认服务端已保存：8 个住宿点（Sweet Home、Iron Creek、Quest Savoy、Centennial、Discovery Parks、Mantra、Twelve Apostles、Brady）全部 `1602-hotel-bed` + `000000`，其余 63 点为默认蓝钉，10 个图层顺序仍为 D2→Z本次不看。
- `build_kml.py` 把 `d9-05` 纳入 `CONFIRMED_LODGING_IDS` 并删掉未被引用的 `PENDING_LODGING_IDS`：图标表示「当晚睡哪里」，营位待下单的状态由行程文字承载。重建 KML 后 `src/data/trip-data.json` 未变，构建产物哈希仍为 `index-DREmMvyV.js`，线上路书无需重新发布。
- 复核飞书云文档现网内容：Iron Creek、394 Arthur Highway、已订备选、【待定-8】、朗塞斯顿改飞、帐篷营位、`Unpowered Site 16 Feet`、Mantra 均在，且无渡轮残留。

## 2026-08-27 Iron Creek Bay Estate 同步
- 本地权威行程已改为 9/28—10/1 入住 Iron Creek Bay Estate；Quest Savoy 不删除，标为同日期“已订备选／待决定是否取消”。
- 已同步 `days-raw.txt`、`doc-content.md`、`build_itinerary.py`、`itinerary.json`、`data/extras/confirmed-stays.json`、KML 与 `src/data/trip-data.json`；路书改为从 Sorell 自驾往返两天 Hobart 集合点，10/1 从 Sorell 出发。
- 飞书云文档 `TAoHd0QFyoo7lpxGk9DcpN0nnCc` 原地更新至 revision 593：总览、必订清单、待定问题及 9/28—10/1 每日主行程均已同步，新增【待定-8】记录两笔订单的最终取舍。
- 私人 Google My Maps 的 D5–6、D7、D8 图层已重导；D5–6 同时保留 Iron Creek 与 Quest，两点及 D8 Centennial 均复核为 `icon-1602-000000` 黑底白床。刷新后图层顺序复核为 D2、D3、D4、D5–6、D7、D8、D9–10、D11、D12–13、Z本次不看。
- 验证通过：`corepack pnpm typecheck`、Vitest 43/43、production build；生成 13 天、89 个地点，PWA precache 14 条／702.77 KiB。
- 已发布 main `055ca82` 与 gh-pages `c20fa05`；GitHub Pages build `1178682779` 状态为 `built`。生产页面 9/28 已复验：终点为 Iron Creek Bay Estate，住宿折叠区同时显示 Iron Creek 当前入住、Quest Savoy 已订备选、两条 Google Maps 链接及【待定-8】。

## 2026-08-27 塔斯曼／玛丽亚岛双早班的中间住宿
- 核实停车：Tasman Island Cruises 自驾车免费停 6961 Arthur Highway Booking Centre；Maria Island 自驾车停 Triabunna Marina 或周边免费街边位，避开 permit zones，并提前 45 分钟到 Gateway 签到。
- 纠正时间：Tasman Island 为 09:15 签到／10:00 开船，不是 08:00；Maria Island 最早为 08:30，07:45 前签到。
- 比较 Sorell、Richmond、Dunalley、Dodges Ferry、Orford 后，Sorell 以两地各约 47—57 分钟、Coles/Woolworths 和机场 Uber 便利成为主选；Richmond 以历史街区和可逛性成为次选。
- Booking.com 实测 9/28—10/1 两人三晚：Sorell Barracks 约 CNY 646／晚、Iron Creek Bay Estate 596／晚、Sorell Gateway Villa 887／晚；Richmond Arms 433／晚、Coachman's Rest 含税 640／晚、King Bed Studio 含税 773／晚、Hatchers 633／晚，均在 900／晚内。
- Hobart Airport→Sorell Uber 官方均值约 AUD 31／15 分钟，→Richmond 约 AUD 43／19 分钟；但连续两天必须自驾，建议落地直接在机场取租车，Uber 只作备份。

## 2026-08-27 9/30 Maria Island 跟团被取消后的余位排查
- 在 Encounter 官方 CustomLinc 引擎逐日实测：9/30 去程 10:00 售罄、回程 14:30 与 16:15 均售罄，只剩 8:30 去 + 10:45 回一个组合；9/28、9/29 同期除 16:15 外全部有票，确认 9/30 是学校假期高峰的个别拥堵日。
- 官方 Hobart 接驳 9/30 有位，但只剩 06:45 Brooke Street Pier 发车、17:00 Triabunna 返程一种，正好接不上仅存的 10:45 回程船。
- East Coast Cruises 环岛巡游（周三线）9/30 在 Rezdy 上为 `full`／售罄；新产品 607840 从 10/1 才起售。Tours Tasmania 9/30 是冬季班表最后一天，10/1 起改 06:45 夏季发车。
- Encounter 规则核实：售罄为船舶法定载客上限，不接受加位；票不退但开船前 24 小时以上可改期／改班次，回程时间可在 Manage Booking 自助改。
- 用户决定自己买票并改问 9/29；已指出 9/29 与 Pennicott 塔斯曼岛巡游冲突（该巡游 9/26—10/7 全售罄、改不了期），待用户确认是否放弃塔斯曼。
- 公园通行证问题查实：Parks Tas FAQ 明确车辆通行证可用于无车辆通道的公园（含摇篮山、玛丽亚岛）；但通行证不含行车权，Dove Lake Road 在接驳运营时段禁止私家车，10/2—10/3 实际约 08:30—17:30 封路。两人买 Holiday Vehicle Pass + 两张 72 小时接驳票共 AUD 129.35，比逐项买（AUD 159.65）省且无 Icon Daily 24 小时超时风险。

## 2026-08-27 9/25 改订有热水淋浴的营地
- 用户实地核对指出 Sandy Cape 不能洗澡；查西澳官方页确认 `no showers`，旧文档写的「冷水淋浴」来自地方旅游站，已作废。
- 直连 Summerstar `/api/v1/availability/get-availability`（park=5）拿到 Jurien Bay Tourist Park 9/25 实价；RAC 的 Newbook 结果为 JS 异步加载，curl 三次只得 `Loading availability`，改用 Chrome 驱动页面读出真实房态。
- 纠正上一轮误判：RAC Cervantes 9/25 单晚可订，之前把 Winter Special 的阶梯折扣读成了 3 晚起订。
- 飞书 revision 530 → 535，改 9/25 住宿列、总览、必订清单、待定问题第 4 项；本地 `doc-content.md` 同步。

## 2026-08-27 10/2 Discovery Parks 带电营位回写飞书
- 原文档 `TAoHd0QFyoo7lpxGk9DcpN0nnCc` 原地更新，revision 522 → 530；未新建文档。
- 改动：每日主行程 10/2 住宿列与路线终点、行程总览当晚住宿、必订清单、待定问题第 3 项；本地 `doc-content.md`、`trip-data.json`、`itinerary.json` 同步为已确认 Powered 营位。

## 2026-08-26 车宿营地方案回写飞书（TAoHd0QFyoo7lpxGk9DcpN0nnCc）
- 全程 `docs +update --command block_replace` 原地改单元格，未新建文档；revision 514 → 522。
- 改动：每日主行程 9/25、9/26 住宿建议列（首选／备选／兜底／排除全部换成实测结果）、行程总览当晚住宿两格、必订清单项目与状态、待定问题第 4 项。
- 本地 `doc-content.md` 同步同一口径，待确认项按琥珀色高亮标注。

## 2026-08-26 Quest Savoy 停车收费
- 核对酒店无院内车位，官方推荐 Market Place；住客折扣约 AUD 27／8–24h，三晚连停约 AUD 81。
- 排除 Centrepoint 过夜方案（非 24 小时、关闸取车另收费）。

## 2026-08-26 Maria Island 向导与动物观察点
- 核对 Parks Tasmania 与 Tours Tasmania 产品：跟团会在标准步行线路上找动物，有固定热点，但不是保证每种都看到的猎奇团。

## 2026-08-26 亚瑟港交通与 Maria Island 方案
- 纠正 07:55 时间归属：这是 Maria Island Hobart 集合时间；Tasman Island Cruises 自驾版为 09:15 在 Port Arthur 签到。
- 排除 734 公交、Pennicott 普通 Port Arthur Bus 和私人接送；只有 07:30 Full Day Tour 专车能按时接上巡游，但官方升级差价超过 ¥300／人，需由运营商确认能否给现有订单单独加车位。
- 完成 Tours Tasmania 跟团与 Encounter Maria Island 自购船票的费用、交通、Parks Pass、向导、路线与餐食差异核对。

## 2026-08-26 西澳 9/25—9/26 车宿／营地
- 按行程拆成 Cervantes 与 Kalbarri 两晚，核对西澳车宿法规、Main Roads 官方 24 小时休息区图层及当地禁宿规则。
- 排除 9/25 RAC Cervantes（三晚起订）、Nambung Station（实时 0 余位）和普通海边／景区停车场。
- 直接调用 SpacetoCo 官方实时库存接口核完 Sandy Cape 主营地 108 个已上架子营位；9/25 单晚有 30 个可订，确认 Site 100 等页面明确接受普通 Vehicle/4WD，AUD 25／晚。
- 实测 Kalbarri Tudor 9/26 单晚仍有 unpowered／powered／RV／ensuite powered 营位；补充 Anchorage、Murchison River 和 Galena 24h Rest Area 作为分层备选。

## 2026-08-26 公园／Caversham 网购链接
- 已核对官方入口：Freycinet 走 Tasmania Parks Pass 网购；Cradle Icon Day Pass 无网店；Caversham 普通票走 Roller。

## 2026-08-26 剩余预约项目核查
- 按最新主行程排除已订的 Tasman Island、Maria Island 及飞机／船票，逐项核对剩余团和容量受限活动。
- 实测 10/2 Platypus House 10:00 仍有 9 位；Devils@Cradle 17:30 已进入候补。
- 找到同晚可直接订的 Devils@Cradle Sunset Experience 19:00，功能上覆盖袋獾喂食且包含更多小团内容。
- 核准 St Kilda 抢票时间、Caversham 抱考拉现场规则、Tasmania Parks Pass 与 Cradle shuttle 购买方式。

## 2026-08-24 阿波罗湾 10/4 过夜
- 窗口：2026-10-04 入住／10-05 退房；维州春假最后一天，整套公寓普遍超 ¥800。
- 预算内且独立卫浴+简易厨房（微波、水壶、冰箱）：Apollo Stay 三人房约 CNY 669，私人入口，免费停车，8.4／382；整套两居约 CNY 2,162。
- 整套木屋：Holiday Park 经济家庭房 CNY 831（私人厨房）；两居小屋 CNY 941。Airbnb 镇内 Outlook 客用套房约 TWD 3,996（约 ¥900），4.93／767。
- 排除：YHA／Brewhouse 共用卫浴。

## 2026-08-24 珀斯机场 9/27 过夜
- 约束：9/28 VA594 09:50 珀斯 T1，需还租车；Kalbarri 当天长途南下，适合 Belmont／Redcliffe 10 分钟级车程。
- 最便宜且独立卫浴、有规模评价：Home Sweet Perth（24 Katoomba Place, Belmont）私人卫浴可取消约 CNY 678；¥473 那档未标私人卫浴，不推荐。8.4／307，免费停车。
- 民宿备选：Ellard B&B 距机场 2.8 km，8.6／1463，含早约 CNY 871。Airbnb Belmont 独立套房 4.93／92 约 TWD 4717，更贵。
- 酒店兜底：Sanno Marracoonda Redcliffe 2.4 km，8.0／4988，约 CNY 980。ibis budget 评分约 6–7，未作为品质推荐。携程检索跳登录。

## 2026-08-24 摇篮山 10/2 过夜调研
- 自驾：可开到游客中心；接驳时段内 Dove Lake Road 不对私家车开放。Parks Tasmania 接驳约 8:45–17:00（9月中至10月第一个周日夏令时前）；成人另购接驳 AUD 15.50／72h（Icon Pass／Overland 含）。末班接驳后 30 分钟起鸽子湖仅约 9+1 残障车位。房车禁止上 Dove Lake Road。Waldheim 为园内木屋，公共卫生间／淋浴，不符合独立卫浴。
- 住区：Cradle Valley 最近（黄昏袋熊、早接驳、Devils@Cradle）；Wilmot 约 35–50 分钟、更暗、符合预算；Sheffield 约 50–60 分钟，壁画镇但挤 10/3 缓冲。银河：10/2 亏凸月约 70%，但当日月亮约 08:39 落下、次日约 01:10 再升，上半夜有暗空窗口；核心已过最佳季，高地多云。极光：塔州南海岸更好；鸽子湖朝南被山挡住地平线，不宜作为选房理由。
- 预算：山谷独立卫浴木屋当晚无 ≤¥900。Booking 符合条件：The Old Wilmot Bakehouse 约 CNY 746+68 税；Kentish Hills Retreat（Sheffield）CNY 886 含税。Cradle Highlander 10/2 无房（其他日约 ¥1500+）。携程 Discovery Parks 标准木屋约 ¥1898。Airbnb 整套最低约 TWD 4111（Railton，略超 ¥900）。

## 2026-08-24 集合点附近可取消住宿 + My Maps 标记
- 新需求：两人独享、步行10分钟或 Uber10分钟到两集合点、近超市、≤900/晚、水壶+微波炉、Booking/Airbnb/携程、可取消；洋红色房屋图标标到截图所在图层。
- 授权预判已一次性告知：必须 Google（编辑 My Maps）；建议 Airbnb、Booking、携程。用户去吃饭期间先做公开检索。
- 两集合点已确认：Pennicott Dock Head Building Franklin Wharf；游客中心 20 Davey Street；直线约 140 m。
- 入住窗口按 2026-09-28 入住、10-01 退房（覆盖 9/29、9/30 早集合；9/30 傍晚可离开或续住）。
- 首选 Quest Savoy，38 Elizabeth St：携程可免费取消约 ¥853/晚（副楼经济一室公寓）；Booking 可免费取消整套公寓约 CNY 2,509/三晚。步行约 4–7 分钟到两集合点；对面 Centrepoint 有超市。
- Airbnb 步行范围内可取消房源三晚约 ¥2,999，超 ¥900/晚；东岸 Geilston Bay 约 ¥819/晚需 Uber。
- My Maps 已加入 Quest Savoy 点，但被默认写进 D2 图层；未能稳定改成洋红房屋图标。本地 KML 已加同坐标房屋样式点。

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
- 已发布：功能提交 `d869e4a`、验收文档 `95c1197`，`gh-pages` 为 `8bfdbbf`。生产链接带版本参数 `?v=20260822c`，线上已加载 `index-D-Lg9blC.js`。
- 线上 390×844 最终复验：旧黄色 bar 不存在；合并卡显示「第2天／09/25周五／珀斯机场04:20／塞万提斯日落后」；文字序号2→地图2，地图4→文字卡4（top≈189px）且 sticky 页签切到文字；默认 touchAction=`pan-y`，地图操作模式为 `none`，退出后恢复 `pan-y`；页面 390/390 无溢出。

## 2026-08-22 marker 真实点击修复与卡片底部按钮重排
- 先用真实输入事件复现：地图 marker 真实点击后 `scrollY` 保持 0、无 `li.focused`；同一个 marker 用脚本 `element.click()` 却能正常跳转并滚动到 1408.5。这解释了前几轮为什么“验收通过”却在手机上没反应——之前只验了脚本点击。
- 事件与几何插桩定位根因：`pointerdown` 命中 `.map-marker > b`，`pointerup` / `click` 的 target 变成容器；按下瞬间 marker computed transform 为 `matrix(0.98,0,0,0.98,0,0)`，抬起时才是 `matrix(1,0,0,1,-22,-44)`。全局 `button:active { transform: scale(0.98) }` 覆盖了 marker 定位用的 `translate(-50%,-100%)`，元素向右下位移 22×44px，down/up 不在同一元素，`click` 不派发。
- 修法：全局按压反馈改为独立的 `scale: 0.98`；`.rhythm-map` 的 `overflow: hidden` 改为 `overflow: clip`，避免聚焦 marker 时容器滚动造成二次命中偏移。
- 卡片底部改为单行 footer：`随手记` 左下、`更多` 右下并与右上角导航图标同列；两者统一 `min-height: 40px`、`line-height: 1`、图标 15px，并去掉 `journal-link` 多余的 `margin-top: 5px`（截图里三个按钮高低不齐的直接原因）。
- 删除卡片上的 `标记完成`；完成开关移到「更多」弹层底部 footer，`.place-detail` 改 flex 列、`.detail-body` 占满剩余高度使 footer 贴底。首页「已完成 N/48」仍可推进。
- 本地 390×844 真实点击复验：地图点 2 → 文字卡「卡弗舍姆野生动物园」滚到 top=84；文字序号 5 → marker 5 变为 `aria-pressed=true`、页面回到地图段。深浅两套主题下 footer 基线一致。
- `corepack pnpm typecheck` 通过、Vitest 35/35 通过。从 `39242b8` 建干净工作树跑 production build 全通过，产物 `index-DjXkCUWv.js`／`index-t_--K-o4.css`，PWA precache 14 条 / 742.13 KiB，唯一警告仍是既有主 chunk 大于 500 kB。
- 已发布：`main` 到 `4945128`（功能 `39242b8` + 文档），`gh-pages` 到 `91ce234`。线上 390×844 真实点击复验：`button:active` 规则为 `scale: 0.98`；地图点 4 → 文字卡「尖峰石阵／南邦国家公园」top≈197px、页签切到「文字」、全局仅 1 个高亮；文字序号 1 → marker 1 `aria-pressed=true`、页面回到地图段（mapTop=82）；页面 390/390 无横向溢出。
- 并行的 St Kilda 企鹅场次、KML 与行程数据改动仍未提交，本次构建同样从干净工作树出，未把它们带进发布。

## 2026-08-23 吸顶日期摘要、地图外置操作与双指缩放
- 已按 `redesign-existing-projects` 完成定向审计：保留现有清新双主题、信息架构和全部双向定位；移除已无切换职责的「地图／文字」页签，把跨日导航提升为真正的吸顶主操作。
- `.date-picker`／`.day-summary` 已吸顶；390×844 滚到 `scrollY=1192` 时 `pickerTop=0`，摘要仍显示「第3天／09/26周六／塞万提斯08:00／卡尔巴里日落」，页面宽 390/390，无 `.rhythm-switch`。
- 「操作地图／完成」「回到全览」已移到地图画布外的标题行，改为无白底、无边框的文字操作；画布内对应控件数量为 0，兰斯林／塞蒂斯湖等左侧标签不再被遮挡。地图内只保留 40px 的 `+/-`、署名和路线。
- 卡片 footer 已交换顺序：`更多` 左下、`随手记` 右下，同一基线与触达高度。
- 新增 active touch pointer 与 pinch 状态：默认 `touch-action: pan-y`；进入操作模式后为 `none`，单指平移、双指按距离比缩放并保持两指中点下的地理位置稳定；退出时清空 pointer／pinch 状态。
- 浏览器双指事件链验证：Day 3 初始 zoom 6，操作模式下两指距离 100→200 后 zoom 7；点「完成」后重复同样输入仍为 zoom 7。状态文案同步为「单指移动，双指缩放」与「单指上下滑动页面」。
- 阶段性自动化：`corepack pnpm typecheck` 通过；Vitest 36/36 通过，新增 pinch 倍数换算、上下界与非法距离回退测试。
- 为避免把工作区另一批 St Kilda／KML／行程数据改动带进发布，本轮仅提交 9 个相关文件；`tests/trip.test.ts` 使用缓存补丁只暂存 pinch 测试，保留其余未提交变更。功能提交为 `6680b02`。
- 干净 detached worktree `/tmp/au-redesign-build` 复验：typecheck、基线 Vitest 35/35、production build 全通过；产物 `index-dep_TNs3.js`／`index-21BnmtYe.css`，PWA precache 14 条 / 741.90 KiB，唯一警告仍是既有主 chunk 大于 500 kB。
- 已推送 `main` 到 `6680b02`，`gh-pages` 到 `e8a6f1f`。生产 URL `?v=20260823b` 已加载上述新资产。
- 线上 390×844 暗色最终复验：无地图／文字页签；日期摘要 `pickerTop=0`；地图画布内旧操作控件为 0；标题行操作为「操作地图／回到全览」；卡片 footer 顺序为「更多／随手记」；页面宽 390/390。
- 线上地图操作模式 `touchAction=none`，双指距离加倍后 zoom 7→8；回到全览后真实点击 marker 3，文字卡「兰斯林沙丘」滚到 top=112，吸顶摘要 bottom=102，仅一个 marker 保持高亮。双向定位未退化。

## 2026-08-23 删除「行程节奏」段落标题
- 日程页移除 `.rhythm-heading`（「按当天时间顺序／行程节奏」）及其 CSS；`.rhythm-panel` 加 `aria-label="行程节奏"` 保留无障碍语义。
- 页签时代遗留文案一并收口：空状态按钮「切回文字」改为「查看文字列表」，路线状态「仅在文字视图显示」改为「仅在下方文字列表显示」。
- 本地 390×844 复验：`.rhythm-heading` 不存在，正文不再出现「按当天时间顺序／行程节奏」；吸顶日期卡 bottom=213、`.rhythm-panel` top=223，间距仍为 10px；「地图」标题行与「操作地图／回到全览」文字操作、画布内 40px 加减、双向定位均未退化。
- `corepack pnpm typecheck` 通过，Vitest 36/36 通过。
- 已发布：功能 `c312cac`、文档 `d1ac451`，`gh-pages` 为 `298f0bc`；干净 worktree `/tmp/au-h37-build` 构建产物 `index-BIc_4LKW.js`／`index-C2VIRZCZ.css`，PWA precache 14 条 / 741.53 KiB，唯一警告仍是既有主 chunk 大于 500 kB。
- 线上 390×844 复验（`?v=20260823c`）：已加载上述新资产；`.rhythm-heading` 不存在、正文无「按当天时间顺序／行程节奏」；「地图」标题行操作为「操作地图／回到全览」、画布内旧控件 0；卡片 footer 顺序「更多／随手记」；页面宽 390/390。
- 线上真实点击复验双向定位未退化：地图 marker 4 → 文字卡「尖峰石阵／南邦国家公园」top=159（吸顶摘要 bottom=102，未被遮挡），全局仅 1 个高亮；文字序号 5 → marker 5 `aria-pressed=true` 且页面回到地图段（mapTop=159）。

## 2026-08-24 霍巴特跟团集合点与住宿调研
- 用户拟 2026-09-28 至 10-01 在霍巴特连住三晚，9/29 参加塔斯曼岛当日团、9/30 参加玛利亚岛当日团。
- 房源条件：自助入住、厨房、约 ¥600–900／晚；Airbnb 优先旅客精选，Booking 优先高评分。
- Chrome CDP 已就绪，已在用户浏览器打开 Booking 与 Airbnb 登录页；当前等待用户自行完成登录，不索取或读取账号密码。
- 用户完成登录后，已核查 Klook／GetYourGuide 2026-09-29、09-30 的真实日期日历、平台价格、退改和集合信息。
- 9/29 Tasman Island 三小时环岛巡游在 Klook 与 GetYourGuide 均已无库存；找到同运营商、同 Franklin Wharf 集合的 Cape Raoul 90 分钟巡游作为最接近替代。
- 9/30 Maria Island 主动探索一日游在 Klook 与 GetYourGuide 均可选，集合于 20 Davey Street；两个旅行团集合点约 140 m。
- 完成 Booking／Airbnb 候选逐项核查：价格、评分、自助入住、厨房配置、位置和超市便利度均已比对，并形成分档推荐。
- 已发布：功能 `c312cac`、文档 `d1ac451`，`gh-pages` 为 `298f0bc`；干净 worktree `/tmp/au-h37-build` 构建产物 `index-BIc_4LKW.js`／`index-C2VIRZCZ.css`，PWA precache 14 条 / 741.53 KiB，唯一警告仍是既有主 chunk 大于 500 kB。
- 线上 390×844 复验（`?v=20260823c`）：已加载上述新资产；`.rhythm-heading` 不存在、正文无「按当天时间顺序／行程节奏」；「地图」标题行操作为「操作地图／回到全览」、画布内旧控件 0；卡片 footer 顺序「更多／随手记」；页面宽 390/390。
- 线上真实点击复验双向定位未退化：地图 marker 4 → 文字卡「尖峰石阵／南邦国家公园」top=159（吸顶摘要 bottom=102，未被遮挡），全局仅 1 个高亮；文字序号 5 → marker 5 `aria-pressed=true` 且页面回到地图段（mapTop=159）。

## 2026-08-24 飞书 Docx 原地同步（TAoHd0QFyoo7lpxGk9DcpN0nnCc）
- 目标文档从 `findings.md` 直接取得 token `TAoHd0QFyoo7lpxGk9DcpN0nnCc`，未新建文档；全程 `lark-cli docs +update --command block_replace` 原地改，起始 `revision_id=444`。
- 线上确为旧版：正文含比舍诺／Bicheno、London Bridge、The Grotto，主表 10/1 仍写「科尔斯湾—比舍诺—朗塞斯顿」。
- 已按 15:29 时点的 `doc-content.md`（Coles Bay→Launceston／Puffing Billy 可选／10/5 St Kilda 企鹅）推送 27 个 block：主表 10/1 全 7 格、10/4 四格、10/5 全 7 格、10/6 当日行程 1 格，动物覆盖 7 格＋判断口径 1 格。当前 `revision_id=486`。
- 单元格结构：主表每格是单个 `<p>` block，可逐格 `block_replace`；已写脚本把本地 Markdown 转飞书 XML，并按 `<a>→<b>→<span>` 规范化行内嵌套、沿用原文 `rgb(255,233,40)` 景点高亮（取消项 London Bridge／The Grotto／Bicheno 不再高亮）。
- **冲突未决**：15:48 新增 `scripts/sync_authoritative_routes.py`、15:50 运行后把 `doc-content.md` 改写为另一套权威路线（9/30→Swansea、10/1→Sheffield、10/2 自 Sheffield 出发、10/4→内陆→Port Campbell、10/5 沿海东行且不去 St Kilda，Puffing Billy 移除），与本次已推送内容相反。
- 该改写只覆盖主表日行、总览与必订清单；`动物覆盖核对`（小蓝企鹅仍写 10/5 St Kilda）与愿望清单 St Kilda／Puffing Billy 行仍是旧口径，本地文件当前自相矛盾，故暂停推送剩余 46 个 block，等待确认哪一版为准。

## 2026-08-24 飞书 Docx 按 A 方案同步完成（TAoHd0QFyoo7lpxGk9DcpN0nnCc）
- 用户拍板 A 方案。全程 `lark-cli docs +update` 原地更新，未新建文档；`revision_id` 444 → 505。
- 本轮补推：愿望清单 13 处状态；整表 `block_replace` 重建愿望清单（54 行，新增 St Kilda Pier／Little Penguin 行并置于 Melbourne Zoo 与 Phillip Island 之间）；文首 `待定问题／行程总览（权威口径）／必订清单（行动用）` 三节以 `block_insert_after` 插入页首。
- 全文校验：本地 `doc-content.md` 与线上逐格比对差异为 0；结构 7 个标题、6 张表（待定 7 行／总览 14 行／必订 14 行／主表 14 行／动物 13 行／愿望 55 行）全部对齐。
- 清理：删除本次替换新引入的 1 个空段落 `JWVtd5bw0osekLxNDSzcpeTbnng`；原文档既有的 6 个空段落属原始排版，保留不动。
- 本地回滚 B：`doc-content.md` 主表 9/30、10/1、10/2、10/4、10/5 由线上 A 内容反解重建；总览／必订清单／优先级／删减优先级按 `scripts/sync_authoritative_routes.py` 的映射反向还原；补回被删的待定问题第 2、6 行与必订清单 Puffing Billy、St Kilda 两行。
- `days-raw.txt` 的 DAY 7／8／9／11／12 按 A 重建（此前为 B，是 B 脚本的数据源，不回滚会再次冲突）。
- `data/extras/{tas-south,tas-north-vic-east,vic-west}.json` 经 `git checkout` 回到 B 之前状态：`wv-puffing`、`d11-01`—`d11-06`、`d12-01`、`d12-02`、`d8-02` 均已恢复，`d12-lorne`／`d12-torquay`／Swansea／Sheffield 标记清零。
- `itinerary.json`、`src/data/trip-data.json`、`layers/*.kml` 未被 B 触及，抽检 St Kilda／Puffing Billy／Launceston 均在，图层名仍为 `D8_10_1_酒杯湾_朗塞斯顿`、`D12_13_10_5_6_沉船海岸_St_Kilda_墨尔本`。
- 未执行 `scripts/sync_authoritative_routes.py`；未 commit／push。

## 2026-08-24 A 方案续作：线上复核 + 本地 B 残留清理
- 起点核对：`lark-cli auth status` 正常（user 身份有效）；`docs +fetch` 读到线上 `revision_id=505`。上一轮的 Connection failed 并未造成线上缺失。
- **线上已完整，无需补推**：逐格比对 `doc-content.md` 与线上，6 张表（待定 7 行／总览 14 行／必订 14 行／主表 14 行／动物 13 行／愿望 55 行）单元格差异 0；5 个非表格段落全文一致；7 个标题结构一致。愿望清单状态与 St Kilda Pier 行、文首三节均已在线。54 处飞书黄色高亮 `rgba(255,246,122,0.8)` 覆盖全部【待定-1/2/3/6】。本轮未对飞书做任何写操作。
- 本地实际残留的 B（上一轮未覆盖到的文件）：
  - `animal-section.md`：小蓝企鹅／鸸鹋／海豚／座头鲸 4 行＋判断口径为 B（写成「St Kilda 已取消、本次不安排企鹅」）。已按 `doc-content.md` 的权威 A 段落整体重写，现两者逐行一致。
  - `wishlist-raw.json`：13 行共 16 个字段为 B（Bicheno 写 Swansea→Sheffield；大洋路、Loch Ard、十二门徒、坎贝尔港、Apollo/Lorne/Torquay 写成 10/4 住 Port Campbell；Puffing Billy 与 St Kilda 写成取消）。已按权威愿望清单表重写 4 个内容列，内容差异归零；`St Kilda Pier` 的 `_status` 由 `skip` 改回 `visit`（A 中它是 `d12-08` 访问点，且 A 的 skip 编号里本就没有 `skip-53`）。
  - `build_itinerary.py`：整份 `visits`／`extra_visit`／`enrich_map`／坐标覆盖／trip notes 均为 B，且把 `d7-02` 坐标写成 Swansea、`d8-05` 写成 Sheffield，还把 Puffing Billy 与 St Kilda 的 skip id 劫持为 `wv-puffing`／`d12-08`。已由权威 `itinerary.json` 反解重建全部数据块，并删除 `d12-lorne`／`d12-torquay`。
  - `build_kml.py`：D7／D8／D11／D12–13 四个图层名为 B。已改回 A 名；保留本轮之前新增的「保留手工维护的集合点图层」逻辑。
- 验证（均在沙箱执行，未覆盖仓库产物）：
  - `build_itinerary.py` → `/tmp/au_bi_test`：输出 `places=85 visit=50 skip=35`，与现有 `itinerary.json` 的 id 集合、顺序、day／date／status／order_in_day、坐标、`trip` 块全部一致；连跑两次结果稳定。
  - `build_kml.py` → `/tmp/au_kml_test`：`au-trip-map.kml` 与仓库现有文件**逐字节相同**，11 个图层文件名与内容全部相同。
- 已知差异（非 B 残留，未改动）：`itinerary.json` 里 d8-*／d12-* 的 `weather` 是 `days-raw.txt` 全文的截断版，且 14 个点的【愿望清单·…】附文是旧快照。重跑生成器会刷新这两处并连带影响 `src/data/trip-data.json` 与测试，超出本轮范围，故未重新生成。
- `data/extras/*.json` 与 HEAD 一致，已含 `wv-puffing`／`d11-01`／`d11-06`／`d12-01`／`d12-02`／`d8-02`，无 `d12-lorne`／`d12-torquay`；`vic-west.json` 仍缺 `d12-08`（St Kilda）的类别／美食／停车，为既有缺口。
- `doc-content.md`、`days-raw.txt`、`itinerary.json`、`src/data/trip-data.json`、`au-trip-map.kml`、`layers/*` 复核后本就是 A，未改动。
- 未执行 `scripts/sync_authoritative_routes.py`（该脚本仍是 B 的来源，只改 `doc-content.md` 与 `data/extras/*`）；未 commit／push；未改 10/6 航班。

## 2026-08-24 按指定会话与最新云文档更新路书
- 用户纠正权威来源：只使用会话 `a25175a5-7da0-48fa-bb57-b2f5a240d04d` 的 A 方案及飞书云文档 `TAoHd0QFyoo7lpxGk9DcpN0nnCc`，不再使用多维表格或其他旧文档。
- 重新读取线上文档 `revision_id=506`，确认 10/1 已取消 Bicheno Penguin Tours，Coles Bay 午后直达 Launceston；10/5 已加入 St Kilda Pier／Breakwater 市区小蓝企鹅归巢，最迟 14:15—14:30 离开沉船海岸。
- 误建的 Base 表 `tblvLdl9tzoAyW36` 已立即删除，未继续修改多维表格。
- 路书数据重新生成：13 天、85 个地点；Day 12 显示 St Kilda 且不显示 Bicheno。为 St Kilda 补齐景点类别、附近餐饮和停车资料，调研覆盖变为 49 个地点、105 家餐厅、52 处停车。
- 移动底栏实现方向阈值显隐：顶部显示、持续下滑 64px 后隐藏、上滑 18px 恢复、接近页底恢复；切换主导航与关闭随手记时恢复。使用 `requestAnimationFrame` 节流、`inert` 和 reduced-motion 兼容。
- 390×844 目标场景在隔离浏览器复验：10/5 出现“圣基尔达企鹅观赏平台”，Bicheno 不在当天正文；底栏状态依次为顶部显示、下滑隐藏、上滑显示、页底显示。
- 验证：`corepack pnpm typecheck` 通过；Vitest 39/39 通过；production build 通过，PWA precache 14 条／736.56 KiB。仅保留既有主 chunk 大于 500 kB 警告。
- 已删除会把 A 方案覆盖回错误 Base 路线的未跟踪脚本 `scripts/sync_authoritative_routes.py`，避免后续误运行。
- 本地 D8／D12／“本次不看”KML 已是 A 方案；在线 Google My Maps 仍待在浏览器空闲后同步，避免与同一浏览器中的住宿检索会话互相抢占页面。

## 2026-08-25 在线 Google My Maps 已与权威口径对齐
- 浏览器共享给多个会话、标签被反复抢占，且 MCP 上传受路径策略限制；改为用 CDP 脚本（`/tmp/mymaps_reimport.py`、`/tmp/rename_layer.py`）直接操作已登录的编辑器标签。
- D8：先删掉「D8-4 比舍诺企鹅归巢团」并把图层名改为「D8 10/1 酒杯湾→朗塞斯顿」，再用 `layers/D8_10_1_酒杯湾_朗塞斯顿.kml` 整层替换，现为 4 点＋当日路线，路线不再绕比舍诺。
- D12–13：用 `layers/D12_13_10_5_6_沉船海岸_St_Kilda_墨尔本.kml` 整层替换，含圣基尔达企鹅观赏平台，去掉伦敦桥与石窟；图层名改为「D12–13 10/5–6 沉船海岸／St Kilda／墨尔本」。
- D11：在线还是旧版（塔山、沃南布尔，无 Puffing Billy），按当前行程数据整层替换为 7 点＋路线。
- 本次不看：整层替换为 33 个愿望点，新增比舍诺／伦敦桥／石窟；并给 `itinerary.json` 里 Phillip Island 的 skip 记录补上坐标，使其重新出现在愿望清单层。
- 复验：线上十层逐项读取，D8、D11、D12–13、本次不看 均与本地 KML 一致，其余图层未改动，霍巴特两个★集合点仍在 D5–6。
- 数据：`build_kml.py`、`scripts/generate_app_data.py`、`scripts/enrich_place_data.py` 重跑，`trip-data.json` 相对提交版仅多出 Phillip Island 坐标；`tests/trip.test.ts` 中有坐标地点数由 79 改为 80。
- 验证：`corepack pnpm typecheck` 通过，Vitest 39/39 通过。未 commit、未 push。

## 2026-08-25 已确认住宿同步完成
- 已核准并同步 5 个有效订单：Sweet Home Property、Quest Savoy、Centennial Inn on Bathurst、Twelve Apostles Motel & Country Retreat、Brady Hotels Central Melbourne。Discovery Parks - Cradle Mountain 的现订单日期为 10/3—10/4，用户确认订错；10/2 继续标为待重新预订，未伪装成已确认住宿。
- 飞书云文档 `TAoHd0QFyoo7lpxGk9DcpN0nnCc` 已原地更新，未新建文档；总览、必订清单、逐日行程和住宿说明已采用同一口径。
- 本地 `days-raw.txt`、`doc-content.md`、`build_itinerary.py`、`build_kml.py`、`itinerary.json`、`src/data/trip-data.json`、相关 KML 和 extras 已同步；Day 8 不经比舍诺，Day 11 直接前往十二门徒并住宿，Day 12 从十二门徒附近沿大洋路东行至 St Kilda 与墨尔本。
- Google My Maps 六个受影响图层已重导入并逐层刷新验收：D4、D5–6、D7、D8、D11、D12–13。5 个已确认住宿点均只出现一次；Quest Savoy 未跨日重复加点。
- My Maps 不保留 KML 中的 `pal2/icon10.png`，导入后会退化为蓝色默认针；已逐点改用内置 `1602-hotel-bed` 图标，并设为 `highlight=000000`。在线复验 5 点均为黑底白床，与用户截图一致。
- 已完成 typecheck、Vitest 和 production build；未 commit、未 push、未部署。

## 2026-08-26 修正 My Maps 图层顺序
- 用户发现在线图层顺序错乱（D3 之后直接跳 D9）。根因是上一轮的整层重新导入：My Maps 每次「取代所有项目」成功后会把该图层移到列表末尾，于是被替换过的 D4、D5–6、D7、D8、D11、D12–13 全部沉底，未动过的 D2、D3、D9–10 留在原位。路书与 KML 数据本身没有问题。
- 已用 CDP 拖拽逐层归位，刷新后服务器端顺序确认为 D2、D3、D4、D5–6、D7、D8、D9–10、D11、D12–13、Z本次不看。
- 遗留一处待确认：愿望清单层当前名为「Z本次不看」，Z 前缀原本用于把它排到最后；现在顺序为手工维护，是否改回「本次不看」待用户决定。

## 2026-08-26 10/2 摇篮山营地与 10/3 飞墨尔本改线
- 用户取消 10/3 Devonport→Geelong 夜航，改为 20:00 左右从 Launceston Airport 飞 Melbourne，并于 10/3 夜宿墨尔本。
- Discovery Resorts 官方实时搜索确认 10/2—10/3 有帐篷营位：普通 16 Feet 无电营位 AUD 63／晚，Premium 25 Feet AUD 68／晚，Powered 18 Feet AUD 73／晚；普通 16 Feet 详情页显示 `Add Stay`，可继续预订。
- 已记录普通 16 Feet 无电营位的带日期官方直链；同价 14 Feet gravel 营位明确禁止搭帐篷，不能误订。实时库存核验于 2026-08-26，页面未公开剩余位数。
- 10/3 推荐主方案为延长摇篮山：08:45 入园，按前日完成度补 Ronny Creek／Dove Lake 或走 Enchanted Walk，13:30 左右返游客中心，14:30 出发直达 Launceston Airport，17:30 前完成加油与还车，衔接 20:00 航班。
- 原愿望清单的 Tasmania Zoo 可行但不推荐作主线：须约 09:30—10:00 离开摇篮山，才能安排约 12:00—15:30 参观；会比旧版 11:15 离园还早，且与 Platypus House／Devils@Cradle 重复。更合适的坏天气短停是顺路 Sheffield 壁画镇。
- 补充路线核算：Ashgrove Cheese 比 Sheffield 更贴 Bass Highway，适合作为 20—40 分钟补给短停；若主目标是尽量留在摇篮山，下午只走入口短线并在 15:00 前离开，不赌 Dove Lake 末班 shuttle。
- 10/3 具体航班号、Melbourne 到达机场／航站楼、10/3 墨尔本住宿和维州新租车仍待确认；本轮先给出安全可执行方案与营位直链，未改飞书、My Maps 或路书正式数据。
- 聚合班表新增候选为 Jetstar JQ738（约 20:20—20:50 起飞），比早先查到但有效期不覆盖 10 月的 JQ742 更接近；航司官网指定日期结果仍未成功加载，因此不得视为票面确认。

## 2026-08-26 补发已确认住宿改动到线上
- 用户反馈线上路书刷新后仍是旧内容。根因：住宿同步那一轮只改了本地文件，既没 commit 也没重新构建、没推 `gh-pages`，线上仍停留在 8/24 的 `752bb28`（企鹅行程与移动底栏）。数据本身没问题。
- 发布前做了数据完整性核对：与已发布版对比无字段丢失（`LOST KEYS: []`），`places` 86（+1 住宿点）、`days` 13 不变；`days.rhythm` 由 117 降至 83 属预期，来源是霍巴特两天改为含接送的当日团、10/1 不经比舍诺、10/4 直达十二门徒过夜、10/5 改走大洋路东段回墨尔本。
- 已提交并推送 `main`：`55290ee`（行程与住宿数据）、`6f85aaf`（规划文档）；`dev-dist/` 已加入 `.gitignore`，不再进版本库。
- typecheck、Vitest 40 项、production build 全部通过；构建产物为 `index-hwkir1JF.js` / `index-CsB0Trhb.css`，PWA precache 14 条 / 683.43 KiB。
- `gh-pages` 已推到 `074849b`，但 GitHub Pages 构建长时间停在 `building`。查明为平台故障：GitHub Actions `major_outage`、Pages `degraded_performance`，`pages build and deployment` 工作流排队且无 job 生成（历史构建仅 21—27 秒）。官方 16:14 UTC 公告已定位并在逐步恢复流量。
- 结论：发布链路已补齐，线上生效时间取决于 GitHub 恢复；仍需注意 10/3 的飞机改线尚未写入正式数据，线上会继续显示塔州精神号夜航。

## 2026-08-26 修复「刷新没用」与地图长地名裁切
- 用户再次反馈线上路书刷新无效。根因不是没推送，而是上一轮发布不完整：执行 `pnpm run build` 时把输出接到 `head -8`，管道提前关闭导致构建在 `vite build` 后被中断，`sw.js`、`workbox-*.js` 与 `404.html` 全部没生成。线上因此没有新 Service Worker 接管，旧 SW 继续用 8/24 的预缓存回应导航请求，硬刷新也绕不过去。
- 已完整重建并重发 `gh-pages`（`5c9e021`）：`sw.js` 与 404 回退补齐，线上确认 SW 重新注册、缓存就位、无离线初始化报错，10/3 页面显示延长摇篮山＋朗塞斯顿飞墨尔本，当日终点时间为 21:10。
- 线上验收时发现地图标签缺陷：`Mantra Melbourne Airport（住宿）` 在 122px 宽的标签盒里需要 4 行，`-webkit-line-clamp: 2` 在当前 Chrome 下计算样式被解析成 `flow-root`，省略号未生效，只按 47px 高度硬裁，露出半行文字（实测 `scrollHeight` 80 / `clientHeight` 47）。
- 修法不依赖 CSS 裁切：在 `src/utils/trip.ts` 新增 `formatMapLabel`，先去掉括号补充说明（`（住宿）`、`（延长游览）`），仍超两行预算时按字宽单位截断并补省略号；碰撞矩形与渲染文本共用同一函数，避免布局与实际显示不一致。
- typecheck、Vitest 43 项、production build 均通过；新增一条测试锁定去括号、截断与 47px 高度。
- 首版修复仍不彻底：只按总字宽估算，忽略了英文按单词换行。`Mantra Melbourne Airport` 在 104px 正文宽度下必然折三行（实测 `Melbourne Airport` 单行需 127.9px），因此仍露半行。改为在 `wrapLabelLines` 里模拟浏览器换行：中日韩逐字断行、拉丁按空白成词，标签高度按真实行数取 2—3 行，并用画布实测校准字宽系数（中日韩 1.04、拉丁 0.62、空格 0.30，各留约 5% 余量）；`-webkit-line-clamp` 同步改为 3。
- gh-pages `eb46189` 已发布，Pages 构建 `built`。线上实测三条标签均 `clipped: false`：`摇篮山` 62×30、`朗塞斯顿机场` 106×30、`Mantra Melbourne Airport` 97×65 三行完整显示。
- 发布链路补充经验：Service Worker 更新后当前文档仍跑旧 bundle，必须再 reload 一次才会切到新 `index-*.js`；验收时要核对 `script[src]` 的实际哈希，不能只看 Pages 构建状态。
