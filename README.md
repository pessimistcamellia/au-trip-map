# 澳洲行程路书 PWA

## 待定问题

| # | 待定项 | 当前处理方式 | 需用户确认 |
|---|---|---|---|
| 1 | Tower Hill / Warrnambool 是否彻底放弃 | <span style="background-color:#FFF3CD;color:#856404;">【待定-1】当前放入“本次不看”，不进入每日主线</span> | 是否仍需西延 |
| 2 | Loch Ard Gorge 是否固定保留 | <span style="background-color:#FFF3CD;color:#856404;">【待定-2】当前作为 10 月 5 日可选短停</span> | 固定保留或仅进度提前时前往 |
| 3 | 住宿、交通和门票实际预订状态 | <span style="background-color:#FFF3CD;color:#856404;">【待定-3】保留“必须预约”行动项，不声明已订</span> | 回填订单状态 |
| 4 | 租车合同是否允许车宿 | <span style="background-color:#FFF3CD;color:#856404;">【待定-4】仅展示持牌营地，并要求书面确认</span> | 确认租车合同条款 |

这是面向手机使用的 2026 澳大利亚自驾行程工具。内容来自飞书权威文档和仓库已有 `doc-content.md`、`itinerary.json`、`days-raw.txt`、愿望清单、动物及车宿材料。

## 功能

- 首页按澳洲当地日期选择“今天”，出发前显示倒计时和首日预览
- 13 天日期滑块、逐日路线摘要、地点时间线
- 每日“行程节奏”文字／地图双视图；地点列表与 marker 共用数据层稳定 `sequence`，可选点使用虚线 marker 与“可选”角标
- OSRM 在线匹配实际驾车道路；失败时明确退回直线示意
- 地点标题行提供轻量“导航 / 更多”，更多弹层固定按看点、实用、天气、文化分类，来源链接统一放在底部
- 每个目的地可写“随手记”：正文、最多 10 张压缩照片、IndexedDB 本机保存、历史记录与全局按日期汇总
- 天气明确区分“长年气候参考”和“临近日期预报”；当前远期行程不伪造降雨、湿度、UV 或晴朗度
- 下载不依赖在线资源的单文件 HTML 静态路书；默认不包含随手记，可显式选择包含压缩照片
- 全局搜索、完成勾选、准备清单及暖色 light / dark 主题
- 独立“本次不看”页面，保留 33 条愿望资料
- Google Maps universal HTTPS 导航
- 私人 Google My Maps 入口及真实离线限制说明
- 双主题、safe area、44px 触控区、键盘焦点和 reduced motion
- 安装、离线、缓存、更新、加载、空搜索和数据异常状态

## 开发

本机没有全局 `pnpm` 时，通过 Node.js 自带的 Corepack 运行：

```bash
corepack pnpm install
corepack pnpm dev
```

默认开发地址为 `http://localhost:5173`。

## 测试与构建

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm preview
```

`build` 会先从权威本地材料重新生成 `src/data/trip-data.json` 和暖色本地 PWA 图标。本机验证时：

```bash
corepack pnpm preview --host 127.0.0.1 --port 4173
```

浏览器打开 `http://127.0.0.1:4173/au-trip-map/`。当前 production build 主 JS 约 471 kB、CSS 约 88 kB；Service Worker precache 14 条、合计约 560 KiB（含 app shell、图标、`offline.html` 与 `robots.txt`）。Vant 保持按需引入 `Icon` / `Search` / `Popup`，未引入新的 UI 或存储依赖。

## 数据访问与未来 API

页面不直接导入 JSON，也不直接操作日志存储：

- `src/repositories/tripRepository.ts`：`ITripRepository` 与当前 `StaticTripRepository`。未来替换为 HTTP 实现即可，页面消费的 `ITripData` 不变。
- `src/repositories/journalRepository.ts`：`IJournalRepository`。当前优先 IndexedDB 保存 entry metadata 与图片 Blob；浏览器不支持时回退 localStorage，测试使用内存实现。
- `src/repositories/weatherRepository.ts`：`IWeatherProvider` / `IWeatherRepository`。当前 provider 只返回文档气候参考；未来可在可预报窗口内接入远程 provider。
- `src/services/placeDetails.ts`：目的地四分类和外链去重。
- `src/services/staticTripExport.ts`：离线 HTML 生成、URL 约束与 HTML 转义。

建议未来后端提供：

- `GET /api/trips/:tripId`：返回行程、日期、地点、稳定序号、分类资料和来源链接。
- `GET /api/weather?lat=&lng=&date=`：仅在 provider 支持的预报窗口返回点坐标级预报，并带 `provider`、`issuedAt`、`granularity`。
- `GET/POST/PATCH/DELETE /api/journals` 与 `POST /api/journal-photos`：替换当前本机 repository；上线前需补账号、权限、加密、隐私和容量策略。

当前没有搭建空后端，也没有调用远期天气 API。替换点是 repository/provider，不需要重写页面组件。

## 安装到手机

1. 手机与开发机处于同一局域网时，先 `corepack pnpm build`，再 `corepack pnpm preview --host 0.0.0.0 --port 4173`。
2. 手机浏览器打开 `http://<本机局域网IP>:4173`（开发机可用 `ipconfig getifaddr en0` 查看）。
3. Android Chrome 使用浏览器菜单中的“安装应用”。
4. iPhone Safari 使用分享菜单中的“添加到主屏幕”。
5. 正式 HTTPS 环境才能稳定触发浏览器原生安装提示；`localhost` / `127.0.0.1` 属于浏览器允许的开发例外，局域网 IP 的 HTTP 可能无法出现原生安装横幅，但仍可用“添加到主屏幕”。

## 离线能力与限制

应用会缓存 app shell、全部静态行程数据、CSS、JavaScript、图标和离线回退页。核心页面不依赖 CDN、远程字体或远程图片。

以下能力仍需网络：

- 打开外部官网、帮助链接和私人 Google My Maps 图层
- 从网页跳转 Google Maps App 或网页并计算路线
- 加载 OSM 地图瓦片与通过 OSRM 匹配驾车道路
- 首次尚未完成缓存时访问新页面

网页不会预下载或完整缓存 OSM / Google 地图瓦片。离线切到地图时会显示“地图需联网”和“切回文字”，已缓存的逐日文字节奏始终可用。私人 My Maps 自定义图层也不能离线嵌入。

随手记正文和照片仅保存在当前浏览器：清理站点数据、更换设备或隐私模式结束后可能丢失，不代表已云同步。导出静态路书默认不包含随手记；勾选后会把当前日志与压缩照片内嵌到 HTML，请自行保管。

## Google Maps 离线准备

1. 在 Google Maps App 中打开头像菜单。
2. 进入“离线地图”，分别下载西澳、塔州和维州路线覆盖区域。
3. 出发前在飞行模式下测试地点搜索和驾车路线。
4. 保留纸面或截图版住宿地址、预订号和紧急联系方式。

官方帮助：https://support.google.com/maps/answer/6291838?hl=zh-Hans

## 数据覆盖

- 13 个自然日，日期统一为 2026 年 9 月 24 日至 10 月 6 日
- 83 条地点或主题：50 条 `visit`，33 条 `skip`
- 79 条有坐标，48 条绑定具体日期
- 53 条原始愿望资料
- 飞书源版本 `revision_id=444`，未发现嵌入 Base 或 Sheet

Day 1 是国际航班转场，没有澳洲地图点。首页会显示通用空状态卡片，并从逐日数据展示转场重点、交通、住宿和可展开的完整安排。
