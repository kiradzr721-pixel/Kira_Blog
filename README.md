# 项目现状说明书 — Kira Blog (astroflare-og-public)

> **生成日期**: 2026-06-18
> **生成方式**: 全量代码审查，基于实际文件内容
> **目的**: 供 AI 实例无缝接手，无需再次探索代码库

---

## 1. 技术栈总览

### 1.1 核心框架与运行时

| 类别 | 包名 | 版本 | 说明 |
|------|------|------|------|
| 框架 | `astro` | ^6.1.8 | Astro v6，构建模式为纯静态 SSG |
| UI 框架 | 无 | — | 未引入 React/Vue/Svelte，纯 Astro 组件 |
| CSS 框架 | `tailwindcss` | ^4.2.3 | TailwindCSS v4，通过 `@tailwindcss/vite` 插件集成 |
| CSS 工具 | `clsx` | ^2.1.1 | 条件类名拼接 |
| CSS 工具 | `tailwind-merge` | ^3.5.0 | 智能合并 Tailwind 类名 |
| 内容 | `@astrojs/mdx` | ^5.0.3 | MDX 支持 |
| SEO | `@astrojs/sitemap` | ^3.7.2 | 自动生成 sitemap |
| 部署 | `@astrojs/cloudflare` | ^13.1.10 | Cloudflare 适配器 |
| OG 图片 | `cf-workers-og` | ^3.0.1 | 基于 satori + resvg 的 OG 图片生成 |
| 部署 CLI | `wrangler` | ^4.84.0 | Cloudflare Workers/Pages CLI |

### 1.2 开发工具链

| 类别 | 包名 | 版本 | 说明 |
|------|------|------|------|
| 类型检查 | `typescript` | ^5.9.3 | TS 编译器 |
| 类型检查 | `@astrojs/check` | ^0.9.8 | Astro 专用类型检查 |
| Lint/格式化 | `@biomejs/biome` | 2.4.12 | JS/TS/CSS/JSON 的 lint 与格式化 |
| 格式化 | `prettier` | 3.8.3 | 仅用于 `.astro` 文件格式化 |
| 格式化 | `prettier-plugin-astro` | 0.14.1 | Prettier 的 Astro 插件 |

### 1.3 运行时要求

- **Node.js**: `>=v24.14.0`（`package.json` 的 `engines` 字段）
- **包管理器**: `pnpm@10.33.0`（`package.json` 的 `packageManager` 字段）
- **无 `.nvmrc` 文件**，Node 版本约束仅在 `engines` 中声明

### 1.4 构建配置 (`astro.config.ts`)

```typescript
// 关键配置项：
output: 'static',              // 纯静态 SSG，非 SSR
build: { format: 'directory' }, // 输出 /page/index.html 格式
trailingSlash: 'ignore',       // 忽略尾部斜杠
base: '/',                     // 根路径部署
```

- **站点 URL 解析逻辑**:
  1. 若 `CF_PAGES_URL` 存在 → `https://${CF_PAGES_URL}`
  2. 否则若 `SITE_URL` 存在 → `SITE_URL`
  3. 否则 → `http://localhost:4321`

- **i18n**: 单语言 `en`，`prefixDefaultLocale: false`
- **图片服务**: 使用 `astro/assets/services/noop`（无操作服务），因为部署到 Cloudflare 不需要 Astro 的图片优化
- **字体**: 通过 Astro Font Provider API 加载 Fontsource 的 Atkinson Hyperlegible Next（正文）和 Atkinson Hyperlegible Mono（等宽）
- **安全**: CSP 显式设为 `false`（因为与 shiki 语法高亮不兼容）
- **Markdown**: shiki 双主题（github-light / github-dark-dimmed），`wrap: false`
- **Rehype 插件**: 自定义 `rehypeWrapTables`（将 `<table>` 包裹在 `<div class="table-wrapper">` 中以支持横向滚动）

---

## 2. 目录结构与文件职责

### 2.1 完整目录树

```
astroflare-og-public/
├── astro.config.ts          # Astro 构建配置
├── biome.jsonc              # Biome lint/格式化配置
├── prettier.config.ts       # Prettier 配置（用于 .astro 文件）
├── tsconfig.json            # TypeScript 配置（继承 astro/tsconfigs/strictest）
├── package.json             # 依赖与脚本
├── pnpm-lock.yaml           # 锁文件
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── wrangler.example.jsonc   # Cloudflare Wrangler 配置模板（真实 wrangler.jsonc 被 gitignore）
├── README.md                # 项目文档
│
├── plugins/
│   └── rehype/
│       └── rehype-wrap-tables.ts  # rehype 插件：将 table 包裹在滚动容器中
│
├── public/
│   ├── favicon.ico           # ICO 格式 favicon
│   ├── favicon.svg           # SVG 格式 favicon
│   └── fonts/
│       ├── atkinson-bold.woff    # OG 图片生成用（satori 不支持 woff2）
│       └── atkinson-regular.woff # OG 图片生成用
│
├── src/
│   ├── env.d.ts             # 声明 .astro 模块类型
│   ├── constants.ts         # 全局常量（站点元数据、导航链接等）
│   ├── content.config.ts    # Astro 内容集合定义（blog）
│   ├── seo.types.ts         # SEO 元数据类型定义
│   │
│   ├── assets/
│   │   └── placeholder.png  # 占位图片
│   │
│   ├── components/
│   │   ├── FormattedDate.astro   # 格式化日期展示组件
│   │   ├── HeadSeoMeta.astro     # <head> 内的 SEO / OG / Twitter 元标签
│   │   ├── HomeFeatures.astro    # 首页特性卡片网格
│   │   ├── HomeIntro.astro       # 首页个人简介
│   │   ├── Logo.astro            # SVG Logo 组件
│   │   └── PostCard.astro        # 博客文章卡片
│   │
│   ├── content/
│   │   └── blog/
│   │       ├── 2026-04-12-post-with-a-much-longer-title.mdx
│   │       ├── 2026-04-16-hello-world.mdx
│   │       ├── 2026-04-17-another-post.mdx
│   │       ├── 2026-04-17-using-mdx.mdx
│   │       ├── 2026-04-20-markdown-style-guide.mdx
│   │       └── 2026-06-18-线性代数.mdx    # 中文内容，以 Death Note 同人方式讲解线性代数
│   │
│   ├── layouts/
│   │   ├── Layout.astro          # 标准页面布局（SEO、字体、HTML 骨架）
│   │   └── SpatialLayout.astro   # 空间导航布局（三面板滑动切换）
│   │
│   ├── lib/
│   │   ├── dates.ts          # 日期格式化工具
│   │   ├── ensure.ts         # 断言工具（invariant, ensureValue）
│   │   ├── html.ts           # HTML 转义工具
│   │   ├── slashes.ts        # URL 斜杠处理工具集
│   │   ├── spatial-data.ts   # 空间布局的共享数据加载器
│   │   ├── style.ts          # 类名工具（cx, cn = clsx + tailwind-merge）
│   │   └── og/
│   │       ├── fonts.ts          # OG 图片字体加载（从 Cloudflare ASSETS binding）
│   │       ├── og-logo-svg.ts    # OG 图片中的 SVG Logo 生成
│   │       ├── post-template.ts  # 博客文章 OG 图片 HTML 模板
│   │       └── site-template.ts  # 站点 OG 图片 HTML 模板
│   │
│   ├── pages/
│   │   ├── index.astro           # 首页（使用 SpatialLayout，initialIndex=0）
│   │   ├── docs.astro            # 文档页（使用 SpatialLayout，initialIndex=2）
│   │   ├── 404.astro             # 404 页面（使用标准 Layout）
│   │   ├── robots.txt.ts         # 动态生成 robots.txt
│   │   └── blog/
│   │       ├── index.astro           # 博客列表页（使用 SpatialLayout，initialIndex=1）
│   │       └── [slug]/index.astro    # 博客详情页（使用标准 Layout，脱离空间导航）
│   │
│   └── styles/
│       ├── global.css         # TailwindCSS 入口 + 全局样式 + 组件样式
│       ├── palette.css        # 语义化设计令牌（颜色系统）
│       └── typography.css     # 自定义 prose 工具类 + 标题尺寸定义
│
└── dist/                  # 构建输出目录（SSG 产物，直接部署到 Cloudflare Pages）
    ├── index.html
    ├── 404.html
    ├── robots.txt
    ├── sitemap-index.xml
    ├── sitemap-0.xml
    ├── favicon.ico / favicon.svg
    ├── fonts/
    ├── blog/
    │   ├── index.html
    │   ├── hello-world/index.html
    │   └── ... (每篇文章一个目录)
    ├── docs/index.html
    └── _astro/             # Astro 生成的静态资源（JS/CSS bundles）
```

### 2.2 关键文件职责详解

#### `src/layouts/Layout.astro`
- **被谁引用**: `src/pages/blog/[slug]/index.astro`（博客详情页）、`src/pages/404.astro`
- **职责**: 提供标准页面的 HTML 骨架。包含 `<head>` SEO 元标签、字体预加载、`<ClientRouter />`（Astro SPA 客户端路由）、favicon、canonical URL、sitemap 链接、页脚版权信息
- **Props**: `variant`（'page' | 'post' | 'layout' | 'full'）、`meta`（SEO 元数据）、`mainClass`、`containerClass`
- **variant 行为**:
  - `'post'`: 包裹 `<article class="prose ...">`
  - `'page'`: 包裹 `<div class="max-w-prose ...">`
  - `'layout'`: 包裹 `<div class="max-w-(--layout-max-width) ...">`
  - `'full'`: 无包裹，直接渲染 slot

#### `src/layouts/SpatialLayout.astro`
- **被谁引用**: `src/pages/index.astro`、`src/pages/blog/index.astro`、`src/pages/docs.astro`
- **职责**: 空间导航系统的核心。详见第 3 节。
- **Props**: `initialIndex`（number，0/1/2）、`meta`（SEO 元数据）

#### `src/pages/index.astro`
- 使用 `SpatialLayout initialIndex={0}`，在三个 `<slot>` 中渲染完整的首页、博客列表、文档内容
- 这是 **所有三个面板内容的预渲染**——每次访问 `/`、`/blog/`、`/docs/` 都会生成包含全部三个面板的完整 HTML

#### `src/pages/blog/[slug]/index.astro`
- 使用标准 `Layout`（非 SpatialLayout），**脱离空间导航**
- 包含一个 `back-button` 返回 `/blog/`
- 通过 `getStaticPaths()` 在构建时预渲染所有非草稿、已发布的文章
- 使用 `render(post)` 渲染 MDX 内容为 `<Content />` 组件

#### `src/constants.ts`
- 导出所有全局常量：`SITE_URL`、`META_TITLE`（'Kira'）、`META_DESCRIPTION`、`LAYOUT_NAV_LINKS`、`OG_TAGLINE`、Twitter 账号等
- `LAYOUT_NAV_LINKS` 目前为 `[{ label: 'Blog', href: '/blog/' }, { label: 'Docs', href: '/docs/' }]`
- `OG_TWITTER_CREATOR_HANDLE` 和 `OG_TWITTER_SITE_HANDLE` 均为 `undefined`
- `PROJECT_REPO_URL` 指向原始 starter 仓库 `https://github.com/firxworx/astroflare-og-public`

#### `src/content.config.ts`
- 定义 `blog` 内容集合，使用 glob loader 从 `./src/content/blog` 加载 `**/*.{md,mdx}`
- `generateId`: 从文件名中去除 ISO 日期前缀 (`YYYY-MM-DD[-_.]?`) 和扩展名，slugify 后作为 `id`
- Schema: `title`(required), `description`(optional), `publishedAt`(Date), `updatedAt`(optional), `pinned`(default false), `draft`(default false)

#### `src/styles/global.css`
- TailwindCSS v4 入口文件（`@import "tailwindcss"`）
- 导入 `palette.css` (layer base) 和 `typography.css`
- 定义全局 CSS 变量（`--layout-max-width`、`--layout-header-height` 等）
- 定义 `.nav-bar`、`.nav-indicator`、`.nav-item`、`.back-button` 样式
- 定义 `.spatial-viewport`、`.spatial-track`、`.spatial-panel` 样式
- 包含 View Transition 动画关键帧（`vt-slide-out-left` 等）
- 包含 `card-shadow`、`card-shadow-hover` 工具类
- 包含 `scroll-fade-x` 动画工具类

#### `src/styles/palette.css`
- 使用 `@theme inline` 定义所有语义化颜色令牌（`P-` 前缀约定）
- Apple 暖灰系统：`--color-P-bg` (near-white #f5f5f7)、`--color-P-fg` (near-black #1d1d1f)
- 未实现暗色模式（注释中提到可在 `[data-theme="dark"]` 选择器下覆盖）

---

## 3. 核心功能实现解析：空间导航系统

### 3.1 架构概述

空间导航系统允许在三个"面板"（Home、Blog、Docs）之间横向滑动切换，模拟原生应用的页面切换体验。它通过 **CSS `transform: translateX()`** 实现，配合 **History API** 管理浏览器历史记录，并使用 **Astro ClientRouter** 实现 SPA 风格的客户端导航。

### 3.2 DOM 结构

```
<body class="overflow-x-hidden">
  <header style="position:fixed; top:0;">
    <nav class="nav-bar" id="nav-bar">
      <div class="nav-indicator" id="nav-indicator"></div>  <!-- 胶囊指示器 -->
      <a class="nav-item" data-nav-index="0" href="/">Kira</a>
      <a class="nav-item" data-nav-index="1" href="/blog/">Blog</a>
      <a class="nav-item" data-nav-index="2" href="/docs/">Docs</a>
    </nav>
  </header>

  <div class="spatial-viewport">         <!-- overflow:hidden; width:100vw -->
    <div class="spatial-track"            <!-- width: calc(3 * 100vw); display:flex -->
         id="spatial-track"
         style="transform: translateX(-{initialIndex * 100}vw)">
      <section class="spatial-panel" data-panel="0">  <!-- width:100vw; flex-shrink:0 -->
        <slot name="home" />
      </section>
      <section class="spatial-panel" data-panel="1">
        <slot name="blog" />
      </section>
      <section class="spatial-panel" data-panel="2">
        <slot name="docs" />
      </section>
    </div>
  </div>
</body>
```

### 3.3 横向滑动机制

- **CSS 属性**: `transform: translateX(-${index * 100}vw)`
- **动画曲线**: `cubic-bezier(0.35, 0, 0.15, 1)` — 类似 ease-in-out 的自定义曲线
- **动画时长**: `700ms`
- **track 宽度**: `calc(3 * 100vw)` — 三个面板并排
- **viewport**: `overflow: hidden; width: 100vw` — 裁剪可见区域
- **初始加载**: 使用 `spatial-track--instant` 类禁用过渡动画，在 `requestAnimationFrame` 回调中移除该类以启用动画

### 3.4 胶囊指示器（Indicator）定位逻辑

```javascript
function positionIndicator(index: number): void {
  const target = navBar.querySelector(`[data-nav-index="${index}"]`)
  if (!target) return
  const navRect = navBar.getBoundingClientRect()
  const itemRect = target.getBoundingClientRect()
  const left = itemRect.left - navRect.left    // 相对于 nav-bar 的偏移
  const width = itemRect.width
  indicator.style.transform = `translateX(${left}px)`
  indicator.style.width = `${width}px`
}
```

- **定位方式**: 通过 `getBoundingClientRect()` 计算目标 nav-item 相对于 nav-bar 的位置
- **CSS 基础样式**: `.nav-indicator` 使用 `position: absolute; top: 0.5rem; left: 0; height: calc(100% - 1rem)`，然后通过 JS 动态设置 `transform: translateX()` 和 `width`
- **CSS 过渡**: `transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1), width 500ms cubic-bezier(0.22, 1, 0.36, 1)` — 略快于面板滑动（500ms vs 700ms）
- **初始定位**: 在 script 中先禁用 indicator 的 transition，调用 `positionIndicator(currentIndex)`，然后在 `requestAnimationFrame` 中恢复 transition

### 3.5 浏览器历史记录同步

```
初始化:
  currentIndex = PAGE_ORDER.findIndex(match pathname)
  if (history.state?.spatialIndex === undefined)
    history.replaceState({ spatialIndex: currentIndex }, '', PAGE_ORDER[currentIndex])

导航点击:
  navigateToPanel(targetIndex) →
    slideTo(targetIndex)           // CSS translateX 动画
    updateActiveNav(targetIndex)   // 更新 data-active + indicator 位置
    history.pushState({ spatialIndex: targetIndex }, '', PAGE_ORDER[targetIndex])

浏览器前进/后退:
  window.addEventListener('popstate', (e) => {
    slideTo(e.state.spatialIndex)
    updateActiveNav(e.state.spatialIndex)
  })

ClientRouter 返回后同步:
  document.addEventListener('astro:page-load', () => {
    // 根据当前 URL 重新计算 index，如果与 currentIndex 不一致则同步
    // 使用 transition:none 做即时跳转，然后在 rAF 中恢复动画
  })
```

### 3.6 文章详情页如何脱离空间导航

`src/pages/blog/[slug]/index.astro` **不使用 SpatialLayout**，而是使用标准 `Layout`。它包含一个绝对定位的 **back-button**：

```html
<button type="button" class="back-button"
        onclick="window.location.replace('/blog/')">
  &lt;
</button>
```

- 使用 `window.location.replace()`（非 `pushState`），意味着从文章返回博客列表时**不会在浏览器历史中留下文章页记录**
- 返回后 `astro:page-load` 事件触发，SpatialLayout 的 script 会根据 URL 重新同步面板位置

### 3.7 硬编码的页面顺序

```javascript
const PAGE_ORDER: string[] = ['/', '/blog/', '/docs/']
```

- **PAGE_ORDER** 在 `SpatialLayout.astro` 的内联 `<script>` 中硬编码
- `LAYOUT_NAV_LINKS` 在 `src/constants.ts` 中定义，与 PAGE_ORDER 需要保持对应关系（index = i + 1）
- **修改时需注意**: 如果增加或减少面板，必须同时更新：
  1. `PAGE_ORDER` 数组（SpatialLayout.astro 脚本）
  2. `LAYOUT_NAV_LINKS`（constants.ts）
  3. `SpatialLayout.astro` 模板中的 `<section class="spatial-panel">` 数量
  4. `spatial-track` 的 CSS `width: calc(N * 100vw)`（global.css 中当前硬编码为 `calc(3 * 100vw)`）
  5. 各页面中的 `<slot name="...">` 内容

---

## 4. 样式系统详解

### 4.1 颜色系统 (`palette.css`)

采用 **语义化设计令牌** 模式，所有颜色以 `P-` 为前缀（表示 "Palette"）。在 TailwindCSS v4 中通过 `@theme inline` 注册，可直接作为工具类使用（如 `bg-P-bg`、`text-P-subtle`）。

```
背景层级:
  --color-P-bg:       oklch(96.5% 0.002 90)    // warm near-white  #f5f5f7
  --color-P-surface:  oklch(100% 0 0)           // pure white for cards

前景层级:
  --color-P-fg:       oklch(17% 0.003 90)       // near-black  #1d1d1f
  --color-P-subtle:   oklch(48% 0.004 280)      // apple gray  #6e6e73
  --color-P-muted:    oklch(72% 0.003 280)      // faint gray  #aeaeb2

强调色:
  --color-P-accent:       oklch(17% 0.003 90)   // default link = near-black
  --color-P-accent-hover: var(--color-sky-700)  // hover 时变蓝

选择:
  --color-P-selection:     oklch(82% 0.06 250)  // soft apple blue
  --color-P-selection-fg:  oklch(17% 0.003 90)

导航玻璃:
  --color-P-nav-bg: oklch(96.5% 0.002 90 / 0.72)

链接颜色:
  --color-P-link:       oklch(17% 0.003 90)
  --color-P-link-hover: oklch(54.4% 0.146 242.36)  // sky-700

代码块:
  --color-P-code:    oklch(0% 0 0 / 0.04)
  --color-P-code-fg: oklch(17% 0.003 90)
```

- **无暗色模式**：代码注释中提到可在 `[data-theme="dark"]` 下覆盖，但当前未实现

### 4.2 全局样式 (`global.css`)

**层级结构**:
1. `@import "tailwindcss"` — TailwindCSS v4 引擎
2. `@import "./palette.css" layer(base)` — 颜色令牌
3. `@import "./typography.css"` — 排版工具类

**全局重置**（`@layer base`）:
- `*`: 自定义滚动条颜色、边框颜色、outline 颜色
- `html`: `scroll-smooth`、`scroll-pt-28`、滚动条沟槽稳定
- `body`: `antialiased`、`selection:bg-P-selection`

**导航栏样式** (`.nav-bar`):
```css
background: oklch(100% 0 0 / 0.12);       /* 半透明白色 */
border: 1px solid oklch(100% 0 0 / 0.15);
box-shadow: 0 8px 32px oklch(0% 0 0 / 0.08);
backdrop-filter: saturate(180%) blur(28px); /* 毛玻璃效果 */
border-radius: 9999px;                      /* 胶囊形状 */
```

**胶囊指示器** (`.nav-indicator`):
```css
background: oklch(100% 0 0 / 0.5);
box-shadow: inset 0 0 0 1px oklch(100% 0 0 / 0.2),
            0 4px 16px oklch(0% 0 0 / 0.06);
transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            width 500ms cubic-bezier(0.22, 1, 0.36, 1);
```

**返回按钮** (`.back-button`):
```css
background: oklch(100% 0 0 / 0.5);
backdrop-filter: saturate(180%) blur(28px);
border: 1px solid oklch(100% 0 0 / 0.2);
/* hover 时背景变为 oklch(100% 0 0 / 0.65) */
/* active 时 scale(0.96) */
```

**View Transition 动画**（CSS 中已定义但**当前未激活使用**）:
- `vt-slide-out-left` / `vt-slide-in-from-right`（前进方向）
- `vt-slide-out-right` / `vt-slide-in-from-left`（后退方向）
- 通过 `html[data-nav-direction="forward"]` / `html[data-nav-direction="backward"]` 选择器触发
- 但在 JavaScript 代码中**未找到设置 `data-nav-direction` 属性的逻辑**，因此这些动画目前是死代码

### 4.3 排版系统 (`typography.css`)

**自定义标题尺寸**（`@theme` 注册）:
- `text-h1`: clamp(2rem, 1.25rem + 3.75vw, 3rem)，weight 600
- `text-h2`: clamp(1.375rem, 1.1rem + 1.4vw, 1.75rem)，weight 600
- `text-h3`: 1.25rem，weight 600
- `text-h4`: 1.0625rem，weight 600
- `text-h5`: 0.875rem，weight 700，uppercase
- `text-h6`: 0.8125rem，weight 700，uppercase
- `text-lead`: clamp(1.0625rem, 0.9125rem + 0.75vw, 1.25rem)
- `text-tiny`: 0.625rem，uppercase letter-spacing

**自定义 `prose` 工具类**:
- 使用 `@utility prose` 定义，所有子选择器使用 `:where()` 包裹（零特异性）
- 通过 `.not-prose` 类可逃脱 prose 样式
- 覆盖元素：p, h1-h6, a, blockquote, ul/ol/li, code, pre, hr, img/video, figure/figcaption, strong, mark, abbr, kbd, del, sup/sub, table/th/td

### 4.4 TailwindCSS 配置

- **无 `tailwind.config.js`**：TailwindCSS v4 使用 CSS-based 配置，所有配置在 `global.css` 的 `@theme` 块中
- `@source "../**/*.{ts,tsx,astro}"` — 类名扫描路径
- `cn()` 函数中注册了自定义 text 类名到 tailwind-merge：`['tiny', 'lead', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']`

### 4.5 响应式设计策略

- **无显式断点自定义**：使用 TailwindCSS v4 默认断点（sm: 640px, md: 768px, lg: 1024px）
- **空间导航系统**在移动端同样使用 `100vw` 滑动——每个面板宽度为 `100vw`
- **导航栏**：`max-width: var(--container-lg)`（约 1024px），在窄屏幕上自然收缩
- **首页文章卡片网格**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **prose 最大宽度**: `65ch`
- **正文排版使用 `clamp()` 函数**实现流体字号（h1, h2, lead）
- **代码块和表格**: 通过 `scroll-fade-x` 工具类 + `overflow-x-auto` 实现横向滚动

---

## 5. 构建与部署链路

### 5.1 构建输出

- **命令**: `pnpm build` → 执行 `astro build`
- **输出目录**: `dist/`（**不是** `dist/client/`）
- **输出格式**: `build.format: 'directory'` → `/page/index.html`
- **构建产物结构**（已验证）:
  ```
  dist/
  ├── index.html              # 首页
  ├── 404.html                # 404 页面
  ├── robots.txt              # robots.txt
  ├── sitemap-index.xml       # sitemap 索引
  ├── sitemap-0.xml           # sitemap 内容
  ├── favicon.ico / favicon.svg
  ├── fonts/                  # 复制自 public/fonts/
  ├── blog/
  │   ├── index.html          # 博客列表
  │   ├── hello-world/index.html
  │   └── ... (每篇文章)
  ├── docs/index.html         # 文档页
  └── _astro/                 # JS/CSS 资源 bundles
  ```

### 5.2 部署模式

- **`output: 'static'`** — 纯静态 SSG，**不需要 Serverless Functions**
- 虽然 `@astrojs/cloudflare` 适配器和 `wrangler` 已安装，但当前配置输出为 static，因此 Cloudflare 适配器实际上只用于本地开发模拟和类型支持
- 部署目标：**Cloudflare Pages**（静态站点托管）
- `wrangler.example.jsonc` 中的 `assets.directory: "./dist"` 指向静态输出目录

### 5.3 环境变量

| 变量 | 用途 | 使用位置 |
|------|------|----------|
| `CF_PAGES_URL` | Cloudflare Pages 自动注入的域名 | `astro.config.ts` — 构建 `site` URL |
| `SITE_URL` | 自定义站点 URL 覆盖 | `astro.config.ts` — 备选 `site` URL |
| `ENVIRONMENT` | 环境标识 (`production` / `preview`) | `wrangler.example.jsonc` vars |
| `VALUE_FROM_CLOUDFLARE` | 示例环境变量 | `wrangler.example.jsonc` vars |
| `FLAG_ROBOTS_TXT` | 控制 robots.txt 是否允许爬虫 | `wrangler.example.jsonc` vars |

### 5.4 Cloudflare Pages 部署注意事项

1. **输出目录**: 需在 Cloudflare Pages 设置中指定为 `dist/`（不是 `dist/client/`）
2. **构建命令**: `pnpm build`
3. **构建环境变量**: 可能需要设置 `SITE_URL` 为实际生产域名（如果 `CF_PAGES_URL` 不可用）
4. **wrangler.jsonc 被 gitignore**：需要从 `wrangler.example.jsonc` 复制并配置真实的 `wrangler.jsonc`
5. **Astro 图片服务已禁用**：使用 `noop` 服务，Cloudflare 不会处理 Astro 图片优化

---

## 6. 注意事项与潜在问题

### 6.1 调试代码残留（严重）

**`SpatialLayout.astro` 的内联 `<script>` 中包含大量 `console.log` 调试语句**（至少 15 处），包括：
- DOM 审计日志（检查元素是否存在、是否有重复 ID）
- `slideTo` 函数被包装以打印前后 transform 值
- `positionIndicator` 中打印 computed styles 和 active nav
- `navigateToPanel` 和 `astro:page-load` 中打印索引信息

**建议**: 在生产构建前清理所有 `console.log`，或使用条件编译（`import.meta.env.DEV` 判断）。

### 6.2 移动端指示器计算依赖布局时序

`positionIndicator()` 函数依赖 `getBoundingClientRect()`，在以下场景可能计算不准确：
- 字体尚未加载完成（Atkinson Hyperlegible 是 web font）
- 移动端浏览器地址栏显示/隐藏导致视口变化
- iOS Safari 的弹性滚动（rubber-banding）

当前代码使用 `requestAnimationFrame` 延迟 indicator 的初始定位，但对字体加载没有监听。

### 6.3 硬编码值分散

以下值在多个文件中硬编码，修改时容易遗漏：

| 硬编码值 | 位置 |
|----------|------|
| `PAGE_ORDER = ['/', '/blog/', '/docs/']` | `SpatialLayout.astro` 脚本 |
| `LAYOUT_NAV_LINKS` | `src/constants.ts` |
| `width: calc(3 * 100vw)` | `global.css` `.spatial-track` |
| 3 个 `<section class="spatial-panel">` | `SpatialLayout.astro` 模板 |
| 3 个 `<slot name="...">` 内容块 | `index.astro`、`blog/index.astro`、`docs.astro` |

### 6.4 博客详情页返回按钮使用硬导航

```javascript
onclick="window.location.replace('/blog/')"
```

这是**硬页面导航**而非 SPA 客户端路由，会导致完整的页面重载。同时 `replace()` 会替换当前历史记录，用户无法通过浏览器"前进"按钮回到文章页。

### 6.5 View Transition 动画是死代码

`global.css` 中定义了 `vt-slide-out-left` 等关键帧和 `html[data-nav-direction]` 选择器，但 **JavaScript 代码中从未设置 `data-nav-direction` 属性**。这些 CSS 规则目前不会被触发。

### 6.6 favicon 的未提交更改

根据 `git diff`，`Layout.astro` 中有一个**未提交的更改**：将 favicon 从 SVG+ICO 双格式改为单一的 PNG 格式 `<link rel="icon" type="image/png" href="/favicon.png" />`，但 `public/` 目录中**没有 `favicon.png` 文件**（只有 `favicon.ico` 和 `favicon.svg`）。这会导致 favicon 404。

### 6.7 OG_TAGLINE 的未提交更改

`src/constants.ts` 中的 `OG_TAGLINE` 从 `'新世界的卡密'` 改为 `'Software Engineering Student. Learning, Building, Thinking.'`，但 `OG_TAGLINE` 常量在代码中**未被任何组件引用**（仅在 `constants.ts` 中定义并导出，但未在 `HeadSeoMeta.astro` 或 OG 模板中使用）。它被声明为 "Short tagline for site OG image" 但实际 OG 模板（`site-template.ts`）接受 `tagline` 作为参数而非读取此常量。

### 6.8 robots.txt 的环境依赖

`robots.txt.ts` 使用 `IS_PRODUCTION` 判断是允许还是禁止爬虫。`IS_PRODUCTION = import.meta.env.PROD`，在 `astro build` 时自动为 `true`。这意味着**本地 `astro build` 也会生成允许爬虫的 robots.txt**。

### 6.9 空导入语句

`src/components/HeadSeoMeta.astro` 第 2-3 行有重复的空导入：
```astro
import {} from '@/constants'
import {} from '@/constants'
```
这是一个无害的代码异味，应是之前重构留下的。

### 6.10 spatial-data.ts 的类型推断

```typescript
export function partitionPosts(posts: ReturnType<typeof getSortedPosts> extends Promise<infer T> ? T : never) {
```

这个类型写法复杂但正确——它从 `getSortedPosts` 的返回类型中推断 Promise 内层类型。但如果 `getSortedPosts` 的返回类型发生变化，此处编译错误信息可能不直观。

### 6.11 暗色模式未实现

`palette.css` 注释中提到 "To add dark mode later, override these under a `[data-theme="dark"]` selector"，但当前完全没有暗色模式的 CSS 或 JS 逻辑。所有颜色均为浅色主题。

### 6.12 biome.jsonc 中的注释警告

`biome.jsonc` 中多处注释提到已知问题（Astro 支持 buggy、`organizeImports` 会破坏 astro 文件），这些是上游工具的已知限制，非本项目的问题。

---

## 附录 A：npm scripts 速查

| 命令 | 功能 |
|------|------|
| `pnpm dev` | 启动 Astro 开发服务器 (localhost:4321) |
| `pnpm build` | 生产构建到 `dist/` |
| `pnpm preview` | 预览构建产物 |
| `pnpm typegen` | 从 wrangler.jsonc 生成 TypeScript 类型 |
| `pnpm typecheck` | 运行 typegen + tsc + astro check |
| `pnpm check` | 运行 biome + prettier + astro check |
| `pnpm check:fix` | 自动修复 lint/格式化问题 |
| `pnpm preflight` | typecheck + build 全流程验证 |
| `pnpm deploy:worker` | build + wrangler deploy |

## 附录 B：关键依赖关系图

```
SpatialLayout.astro
  ├── 被 index.astro, blog/index.astro, docs.astro 使用
  ├── 导入 global.css, ClientRouter, Font, HeadSeoMeta
  ├── 内联 <script> 实现空间导航
  └── 通过 <slot name="home|blog|docs"> 接收内容

Layout.astro
  ├── 被 blog/[slug]/index.astro, 404.astro 使用
  ├── 导入 global.css, ClientRouter, Font, HeadSeoMeta
  └── 提供标准页面骨架

HeadSeoMeta.astro
  ├── 被 Layout.astro, SpatialLayout.astro 使用
  └── 渲染 <title>, <meta>, OG, Twitter Card 标签

index.astro / blog/index.astro / docs.astro
  ├── 都使用 SpatialLayout（不同 initialIndex）
  ├── 都调用 getSortedPosts() + partitionPosts()
  └── 都在三个 <slot> 中预渲染全部面板内容

blog/[slug]/index.astro
  ├── 使用 Layout（脱离空间导航）
  └── getStaticPaths() 预渲染所有已发布文章
```

## 附录 C：文件修改时需要同步的位置

当需要**增加/删除导航面板**时，必须修改以下所有位置：

1. `src/constants.ts` — `LAYOUT_NAV_LINKS` 数组
2. `src/layouts/SpatialLayout.astro`：
   - `<nav>` 中的 `<a>` 标签（`LAYOUT_NAV_LINKS.map()` 自动生成，但首页链接是手写的）
   - `<div class="spatial-track">` 中的 `<section>` 数量
   - `<script>` 中的 `PAGE_ORDER` 数组
3. `src/styles/global.css` — `.spatial-track` 的 `width: calc(N * 100vw)`
4. `src/pages/index.astro` — `<slot>` 内容块
5. `src/pages/blog/index.astro` — `<slot>` 内容块
6. `src/pages/docs.astro` — `<slot>` 内容块

当需要**修改站点元数据**时：
- 只需修改 `src/constants.ts` 中的 `META_TITLE`、`META_DESCRIPTION`、`OG_TAGLINE` 等

当需要**添加新博客文章**时：
- 在 `src/content/blog/` 下创建 `YYYY-MM-DD-slug.mdx` 文件
- Frontmatter 需要：`title`, `publishedAt`（必填），`description`, `updatedAt`, `pinned`, `draft`（可选）
