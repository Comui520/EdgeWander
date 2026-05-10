# EdgeWander // 时光机随机跳转

一台挖自废弃硬盘的浏览器。按下按钮，跳进 Internet Archive 某个被遗忘的 1996-2010 年代网页。

- ⏳ **随机穿越**：调用 Wayback Machine CDX API，从一份早期互联网种子域名池里随机抽取一个，返回一个真实存档快照
- 👁 **访客计数**：Upstash Redis `INCR` 支撑真计数，首页顶部跳字显示
- ✎ **青史留名**：弹窗写入一条 `{name, message}`，持久化到 Redis 列表
- ✦ **名人堂**：所有留名以漂浮星云形式展示，信号不稳时名字会短暂 glitch

## 技术栈

- Next.js 14 (App Router, Edge Runtime for API routes)
- Tailwind CSS + 自写的 CRT / scanline / glitch CSS
- Framer Motion（弹窗、解调动画、星云漂浮）
- Upstash Redis (`@upstash/redis`)
- 外部：Internet Archive CDX Server
- 字体：Google Fonts `Press Start 2P` + `VT323`（通过 `next/font` 自托管）

## 本地开发

```bash
npm install
cp .env.example .env.local   # 留空也能跑，会自动回落到内存存储
npm run dev
```

打开 http://localhost:3000

> 没配 Upstash 时，计数器和留名会写入一个**进程内 Map**，重启就没。这只是为了让 `npm run dev` 开箱即用，生产必须配 Upstash。

### 常用命令

| 命令 | 作用 |
| ---- | ---- |
| `npm run dev` | 本地开发，默认 3000 端口 |
| `npm run build` | 生产构建 |
| `npm run start` | 运行 `build` 产物 |
| `npm run lint` | ESLint（next/core-web-vitals 规则） |
| `npx tsc --noEmit` | TypeScript 类型检查 |

## 部署到 Vercel

1. **把代码推到 GitHub**
   ```bash
   git init && git add . && git commit -m "init"
   gh repo create edgewander --public --source=. --push
   ```
   （或者用网页上传）
2. **到 Vercel 导入项目**：https://vercel.com/new → 选 repo → Framework 会自动识别为 Next.js，其他默认即可
3. **配置环境变量**（Project Settings → Environment Variables）：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. 点击 **Deploy**。

## 配置 Upstash Redis

1. 登录 https://console.upstash.com → Create Database
2. 选 **Global** 类型（对 Vercel Edge Runtime 友好），Eviction 关掉
3. 进入 database → 找到 **REST API** 面板，复制 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`
4. 粘贴到 `.env.local`（本地）和 Vercel 的环境变量（生产）
5. 数据结构（自动创建，无需初始化）：
   - `edgewander:visitors` — String，`INCR` 递增
   - `edgewander:names` — List，每个元素是 JSON `{name, message, at}`

## 目录结构（精简版）

```
src/
  app/
    api/{visit,random,names}/route.ts  # 三个 Edge Runtime 接口
    hall/page.tsx                      # 名人堂（服务端预取 + 客户端星云）
    page.tsx                           # 首页
    layout.tsx                         # 全局字体、CRT 叠加层
    globals.css                        # 所有复古特效的核心
  components/
    CrtOverlay.tsx                     # 扫描线 / 噪点 / 暗角
    TimeMachine.tsx                    # 年份区间 + 随机按钮 + 结果卡片
    VisitorCounter.tsx                 # 跳字访客计数
    LeaveNameModal.tsx                 # 「青史留名」弹窗
    NameSky.tsx                        # 漂浮名字星云
  lib/
    redis.ts     # Upstash 客户端 + 内存回落
    wayback.ts   # CDX 查询 + 重试
    seeds.ts     # 预置早期域名池（中 / 英 / 日）
    names.ts     # 输入清洗
```

## 坑 & 说明

- **CDX 偶尔超时或 429**：`randomArchivedPage` 会随机打乱种子域名并最多试 8 个，任一返回快照即结束。全部失败时 API 返回 503，前端会提示「时光机失联，再试一次」
- **Edge Runtime**：所有 API 都用 `runtime = "edge"`。`@upstash/redis` 原生支持 Edge；CDX 用 `fetch`，同样 Edge 友好
- **移动端**：`globals.css` 的媒体查询会在 `max-width: 640px` 时隐藏扫描线、降低噪点强度 —— 像素字体和粗边框仍然保留
- **计数器去重**：用 `sessionStorage.edgewander:counted` 做本标签页内的单次递增；不同标签页仍各记一次，这是有意的
