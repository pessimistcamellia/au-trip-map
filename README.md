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
- 地点详情按实用、看点、天气、文化、预约、备注分区
- 全局搜索、收藏、完成勾选、个人备注和准备清单
- 独立“本次不看”页面，保留 33 条愿望资料
- Google Maps universal HTTPS 导航、复制坐标与地点名
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

`build` 会先从权威本地材料重新生成 `src/data/trip-data.json` 和本地 PWA 图标。本机验证时：

```bash
corepack pnpm preview --host 127.0.0.1 --port 4173
```

浏览器打开 `http://127.0.0.1:4173`。当前生产包主 JS 约 370 kB、CSS 约 77 kB；Service Worker precache 14 条、合计约 452 KiB（含 app shell、图标、`offline.html` 与 `robots.txt`）。Vant 按需引入 `Icon` / `Search` / `Popup`，未再触发 500 kB chunk 告警。

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
- 首次尚未完成缓存时访问新页面

网页不会下载或缓存 Google 地图瓦片。私人 My Maps 自定义图层也不能离线嵌入。

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
