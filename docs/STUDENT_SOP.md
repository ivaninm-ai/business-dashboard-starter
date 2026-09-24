# 学生操作指南：建立和扩展你自己的版本 · Student SOP: your own copy

这份指南给课后想自己动手的学生。你会得到一份属于自己的项目，在自己的电脑上运行、修改、测试，最后（如果愿意）发布到自己的账号下。

For students who want to build on the starter after class: get your own copy, run it, change it, test it, and optionally publish it under your own account.

> **先记住三件事 · Three things to remember**
> 1. **浏览器本地保存不是云端备份。** 数据只在那台电脑的那个浏览器里。Local browser saving is not a cloud backup.
> 2. **示例分析是预先准备的，不是实时分析。** Prepared briefs are not live analysis.
> 3. **这是学习用的起步项目，不适合放机密的真实业务数据。** 打包后的文件里任何人都能看到全部记录。This is a learning starter, not a system for confidential business data — anyone with the built file can read every record in it.

---

## 1. 建立你自己的仓库 · Create your own repository

模板在这里：**https://github.com/ivaninm-ai/business-dashboard-starter**

1. 打开上面的模板页面（需要先登录你自己的 GitHub 账号，没有就免费注册一个），按 **Use this template → Create a new repository**。
2. Owner 选你自己的账号，取一个名字（例如 `my-business-dashboard`），按 **Create repository**。
3. 把它下载到电脑：用 **GitHub Desktop**（Code → Open with GitHub Desktop），或在终端运行 `git clone <你的仓库地址>`。

不想用 GitHub？在模板页面按 **Code → Download ZIP**，解压即可（但这样就没有版本记录）。

Template: https://github.com/ivaninm-ai/business-dashboard-starter — sign in to your own GitHub account, press **Use this template → Create a new repository**, then clone it (GitHub Desktop or `git clone`). Or download the ZIP.

## 2. 开发环境 · Development environment

只需要 **Node.js 22 或更新版本**（到 nodejs.org 下载 LTS 版本安装）。装好后在项目文件夹打开终端：

```bash
node --version
```

```bash
npm install
```

```bash
npm run dev
```

打开 **http://localhost:5173**。修改 `src/` 里的文件后，重新载入浏览器就能看到变化。按 Ctrl+C 停止。

| 命令 · Command | 作用 · What it does |
|---|---|
| `npm run dev` | 打包数据，然后在 http://localhost:5173 运行未打包的源代码 · packs data, serves `src/` |
| `npm test` | 核对所有数字、规则、翻译、示例分析和数据边界 · checks figures, rules, translations, briefs, boundaries |
| `npm run build` | 生成 `dist/business-dashboard-demo.html`（可双击打开的单一文件）和 `dist/site/index.html` |
| `npm run check` | 先 build 再 test：分享前运行这个 · build + test; run before sharing |
| `npm run data` | 只重新打包 `data/` · repack `data/` only |

> 用 npm 11 安装时可能看到 esbuild「install-scripts」的提示。这是正常的，打包仍然可以使用。
> npm 11 may warn that esbuild's install script was skipped; the build still works.

为什么开发时要用 `npm run dev`？浏览器不允许从磁盘（file://）直接载入多个 JavaScript 模块。`npm run build` 生成的单一文件没有这个限制，所以它可以双击打开。

## 3. 文件夹和数据流 · Folders and data flow

```
data/<业务>/<第几天>/*.csv + metadata.json      data/<业务>/business.json
            │  npm run data  (scripts/pack-data.js)
            ▼
src/data/datasets.generated.js   ──►  src/data/scenarios.js
                                      读取 CSV、对应列名、检查记录；报告日期 = metadata.as_of_date
            ▼
src/core/metrics.js       数字（订单额、收款、余额、库存……）
src/core/tasks.js         待办建议规则（每条有稳定编号 规则:记录ID）
src/core/scenario-tasks.js  第 1 天 → 第 2 天对照：新增 / 已由数据解决
src/core/calendar.js      日历项目
            ▼                                   ▲
src/ui/view-state.js  当前业务、日期、筛选  ◄──  src/storage/local-state.js
            ▼                                   （待办决定、备注、日期、语言，存在 localStorage）
src/ui/pages/*.js     每一页；文字都经过 tr()/tl()（src/i18n/）
src/briefs/           examples.js 预先准备的分析；brief-input.js 事实清单；brief-facts.js 数字核对
```

- `src/core/` 里的函数不碰网页（DOM），浏览器和测试都用同一份代码。
- 页面每次有变化就整页重画（数据很小，不需要框架）。
- 所有显示给用户的文字都要写成 `tr('English')`（普通文字）或 `tl('English')`（菜单、按钮），并在 `src/i18n/zh.js` 加上中文。`npm test` 会找出漏掉的翻译。

## 4. 动手扩展 · Recipes

每个练习完成后都运行 `npm test`，并在浏览器里看一遍。

### 4.1 新增一个 KPI · Add a KPI tile

例子：B2B 想看「本期服务类订单额」（安装、咨询）。

1. **计算**：在 `src/core/metrics.js` 的 `computeMetrics()` 返回值里加一个字段：
   ```js
   service_order_value: inPeriod.filter(s => s.offering_type === 'service').reduce((a, s) => a + s.amount, 0),
   ```
2. **显示**：在 `src/ui/pages/overview.js` 的 tiles 里加：
   ```js
   add(tiles, tile({ label: tr('Service order value'), value: money(m.service_order_value), foot: tr('installation and consultation in the period') }));
   ```
3. **翻译**：在 `src/i18n/zh.js` 加上 `'Service order value': '服务类订单额'` 和第二句的中文。
4. **测试**：在 `test/metrics.test.js` 加一个测试。正确答案要**自己从数据算出来**，不能从应用里抄：B2B 第 1 天 8 月有 5 笔服务订单，合计 **RM 3,400**（可以在「订单与项目」页搜索 installation 和 consultation 核对）。
   ```js
   test('b2b day1: service order value in August', () => {
     const s = loadScenario('betterspace-b2b', 'day1');
     const m = computeMetrics(s.records, s.reportingDate, { historyStart: s.historyStart });
     assert.equal(m.service_order_value, 340000); // cents
   });
   ```

### 4.2 新增一个图表 · Add a chart

`src/ui/components.js` 里有 `trendChart()`（柱状图）和 `hbars()`（横条）。例子：在概览加「按产品的订单额」：

1. 在页面里按 `description` 汇总本期订单额（或像 4.1 一样加到 `computeMetrics()` 的 `by_item`）。
2. `add(grid, h('div', { class: 'card' }, t('h2', tr('Order value by product')), hbars(items)))`，`items` 是 `[{ label, value }]`（value 以「分」为单位）。
3. 颜色只用 `src/style.css` 里的变量（`--accent`、`--series-2`、`--series-3`），它们检查过对比度和色盲可辨识度。

### 4.3 新增一条待办规则 · Add a task rule

例子：B2C「感谢回头客」——本月下单 2 次以上的客户。

1. `src/core/model.js` 的 `TASK_RULES` 加一项：`thank_repeat_customer: { title: 'Thank a repeat customer', needs: ['customers', 'sales'], params: {}, doc: '...' }`。
2. `src/core/tasks.js` 的 `generateSuggestions()` 加一个 `case 'thank_repeat_customer':`，对 `metrics.repeat_customer_ids` 逐一 `push({ rule, record_type: 'customers', record_id: id, title: tr(...), reason: tr(...), evidence: {...}, recorded_deadline: '', suggested_date: reportingDate, suggested_owner: '' })`。
   **编号必须稳定**：`task_key` 自动是 `规则:记录ID`，第 1 天和第 2 天才对得上。不要把日期或序号放进编号。
3. 在 `data/betterspace-b2c/business.json` 的 `policies.tasks` 加 `{ "rule": "thank_repeat_customer", "enabled": true }`，然后 `npm run data`。
4. 翻译规则名称和文字；在 `test/` 加测试（例如第 1 天应产生 22 条，因为有 22 位回头客）。
5. 注意：`test/state.test.js` 里写死了 B2B 第 1 天有 45 条建议——只改 B2C 就不会影响它。

### 4.4 新增一个页面 · Add a page

1. 复制 `src/ui/pages/stock.js` 为 `src/ui/pages/products.js`，改成 `export function renderProducts() { ... }`，返回一个 DOM 元素。
2. 在 `src/main.js` 加 `import { renderProducts } from './ui/pages/products.js';` 和 `registerPage('products', guarded(renderProducts));`。
3. 在 `src/ui/shell.js` 的 `NAV` 加 `['products', () => tl('Products')]`。
4. 翻译新文字，`npm test`，然后在浏览器打开 `#products`。

## 5. 换成你自己的数据 · Replace the sample data deliberately

目前只支持这种数据结构：**客户、销售（一行一个订单）、收款（对应到订单）、库存快照**。其他业务模式需要改 `src/core/model.js` 和计算规则。

1. 复制 `data/betterspace-b2c/` 成新文件夹，例如 `data/my-shop/`。`business.json` 里的 `"id"` 必须和文件夹名一样；`"order"` 决定它在业务选择里的位置。
2. 四个 CSV 文件（Customers、Sales、Payments、Stock）：列名要和 `business.json` 的 `tables[].fields[].header` 一致——改 CSV 列名或改对应都可以。日期用 `2026-08-30` 格式，金额用数字（例如 `300` 或 `299.90`）。
3. `status_map` 写明哪些状态文字表示「未完成 pending」「已完成 done」「不计入 excluded」。
4. 每一天的 `metadata.json` 写 `as_of_date`（报告日期）和 `history_start`。第 2 天是完整快照，不是新增的几行。
5. `npm run data`。如果记录没通过检查（例如缺列、日期格式错、收款对应不到订单），页面会列出问题而不显示数字。
6. **更新测试**：
   - `test/metrics.test.js` 目前核对两家 BetterSpace 企业。为你的数据写 `test/expected/<id>/<day>/expected_metrics.json`——数字要自己在试算表里算出来，**不能从应用里抄**，否则测试就没有意义。
   - `src/briefs/examples.js`：数据变了，原来的示例分析就不对了。为每个新场景重写（`npm test` 会逐一核对数字），或者有意识地删掉 `test/briefs.test.js` 里「每个场景都要有」的要求。
7. 只放虚构或已匿名化的数据。`npm run build` 会把全部记录放进那个 HTML 文件里。

## 6. 以后接入实时 AI · Adding live AI later

现在没有任何实时 AI：示例分析是预先写好的，页面的安全策略（CSP）禁止一切网络请求。要接入实时 AI：

1. **API 密钥只能放在服务器上**——例如 Cloudflare Workers、Netlify/Vercel Functions 或你自己的后端，存成那里的 secret。**绝对不要把密钥写进 `src/` 或打包文件**，任何打开网页的人都能看到它。
2. 服务器端：用 `src/briefs/brief-input.js` 的 `buildBriefInput()` 产生事实清单，加上 `prompts/daily_brief.md` 作为指示，调用 AI 服务，要求返回 `headline / summary / priorities / watch_items / data_caveats` 的 JSON。
3. 显示之前用 `src/briefs/brief-facts.js` 的 `unsupportedTokens()` 核对数字，并确认每个 `task_key` 都是真实的待办。不合格就不显示。
4. 浏览器端：新增一个模块（例如 `src/briefs/live-brief.js`）去请求**你的**服务器；把 CSP 的 `connect-src` 从 `'none'` 改成只允许那个网址（`src/index.html` 和 `scripts/build.js` 两处），并有意识地修改 `test/boundaries.test.js`，只允许这一个模块联网。
5. 界面上照实标明：哪个模型、什么时间、根据哪个场景生成；加载时不要假装「正在思考」。
6. 真实企业数据交给 AI 服务就是数据外流：先确认企业的规定和隐私法（例如马来西亚 PDPA）；免费方案可能会用你的数据训练模型；每次调用都要付费，要限制次数。

## 7. 以后接入真正的存储 · Adding real storage later

所有保存都经过 `src/storage/local-state.js` 的 `createStateStore()`：`prefs / setPrefs / business / day / setDay / decisions / saveDecision / notes / saveNote / deleteNote / resetBusiness / resetAll`。要改成云端（例如 Supabase、Firebase 或自己的 API）：

- 用同样的函数名实现一个新的 store；网络请求是异步的，页面里调用的地方要改成 `await`，并处理失败。
- 需要登录、权限（谁能看、谁能改）、备份、两个人同时修改的冲突处理。
- 真实数据要遵守隐私法。这些都超出这个起步项目的范围。

## 8. 发布你自己的版本（可选）· Publish your own copy (optional)

**只发布虚构数据。** 发布后任何有链接的人都能看到文件里的全部记录。

- **GitHub Pages**（你自己的仓库）：Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。然后 Actions → **Publish site** → **Run workflow**。完成后网址是 `https://<你的用户名>.github.io/<仓库名>/`。
- **其他静态网站服务**：运行 `npm run build`，把 `dist/site/index.html` 上传到你自己账号下的静态网站服务（例如 Netlify Drop、Cloudflare Pages）。

网站上的保存状态和双击打开的文件是分开的（不同的来源）。

## 9. 让 AI 编程助手帮忙 · Working with an AI coding assistant

先让助手读 **`AGENTS.md`**（Claude Code 会通过 `CLAUDE.md` 自动读取）。里面写着哪些东西不能改坏：数字规则、固定的报告日期、数据边界、翻译、示例分析的诚实原则。可以这样说：

> 请先读 AGENTS.md。在 B2B 概览加一个「本期服务类订单额」KPI，加上中文翻译和测试，然后运行 npm run check，告诉我结果。

完成后自己在浏览器里看一遍，并确认 `npm run check` 全部通过，再分享。
