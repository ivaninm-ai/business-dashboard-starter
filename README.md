# 业务仪表盘起步项目 · Business Dashboard Starter

一个**不需要任何设置**的小企业仪表盘课堂演示和起步项目。打开就能看到两个虚构企业（BetterSpace）的经营概况、销售、客户、收款、库存、待办、日历和预先准备的示例分析。中文为默认语言，也可以切换成英文。

A **setup-free** classroom demo and starter project for a small-business dashboard. It opens straight into two synthetic businesses (BetterSpace) with overview, sales, customers, payments, stock, tasks, calendar and a prepared example analysis. Chinese by default, English available.

> **所有记录都是虚构的练习数据。** 这是学习用的起步项目，不是正式系统：请不要放入机密或真实的业务数据。
> All records are synthetic training data. This is a learning starter, not a production system for confidential business data.

## 马上开始 · Quick start

| 我想… · I want to… | 做法 · How |
|---|---|
| 在课堂上打开演示 · Open the classroom demo | 双击 `dist/business-dashboard-demo.html`（不需要安装、登录或联网）· Double-click the file — no install, sign-in or internet. See [docs/START_HERE.md](docs/START_HERE.md). |
| 在浏览器里阅读学生指南 · Read the student guide | 打开 [docs/student-guide.html](docs/student-guide.html) |
| 修改和扩展自己的版本 · Change and extend my own copy | 按 [docs/STUDENT_SOP.md](docs/STUDENT_SOP.md) 操作 |
| 让 AI 编程助手帮忙修改 · Ask an AI coding assistant to help | 先让它读 [AGENTS.md](AGENTS.md) |

开发命令（需要 Node.js 22 或更新版本）· Development commands (Node.js 22+):

```bash
npm install
```

```bash
npm run dev
```

然后打开 http://localhost:5173 。其他命令：`npm test`（核对数字与规则）、`npm run build`（生成可双击打开的单一 HTML 文件）、`npm run check`（两者都做）。

Then open http://localhost:5173. Also: `npm test` (checks figures and rules), `npm run build` (makes the single double-clickable HTML file), `npm run check` (both).

## 它做什么，不做什么 · What it does and does not do

**会做 · Does**
- 用内置的 B2C 和 B2B 虚构数据，按固定的报告日期（第 1 天 2026-08-30，第 2 天 2026-08-31）当场计算所有数字。
- 接受、完成、忽略待办，修改行动日期；在日历上加备注；这些操作保存在**这个浏览器**里，B2C 和 B2B 分开保存。
- 从第 1 天前进到第 2 天时，按稳定的待办编号保留你的决定，并标出新增和已由数据解决的建议。
- 显示为每个场景**预先准备**的示例分析，并清楚标明它不是实时 AI。

**不会做 · Does not**
- 不登录、不联网、不需要 API 密钥、不需要服务器；页面的安全策略禁止任何网络请求。
- 不读取任意文件，不做云端备份或多设备同步，没有团队权限。
- 示例分析不会因为你在页面上的操作而重新分析。

## 文件夹 · Folders

```
src/            网页本身（未打包，可直接阅读）· the app, unbundled
  core/         计算、待办规则、日历（纯函数，浏览器和测试共用）· figures, task rules, calendar
  data/         读取内置场景；datasets.generated.js 由 npm run data 生成 · scenario loading
  storage/      浏览器本地保存（localStorage）· browser-local state
  briefs/       预先准备的示例分析和数字核对工具 · prepared briefs and fact check
  i18n/         中文/英文 · translations
  ui/           页面、组件、外框 · pages, components, shell
data/           练习数据：每个业务的 business.json 和第 1、2 天的 CSV · training data
test/           自动测试；test/expected/ 是答案（应用从不读取）· tests and answer keys
scripts/        pack-data（打包数据）、serve（开发服务器）、build（单一文件）
prompts/        以后接入实时 AI 时使用的简报规则 · brief rules for a future live AI
docs/           使用说明 · documentation
```

## 来源 · Provenance

- 计算、待办、日历、字段对应、界面翻译和视觉风格，改编自 Business Dashboard 模板 1.2.0（rc.4/rc.5）的代码；Google 登录、Sheets 存储、后台 worker 和设置向导都已移除。
- 练习数据原样复制自 BetterSpace 虚构培训数据包（`01_B2C_Retail`、`02_B2B_Furniture` 及其 `refresh_day2`），见 [data/README.md](data/README.md)。
- Figures, task rules, calendar, column mapping, translations and styling are adapted from the Business Dashboard template 1.2.0 (rc.4/rc.5); Google sign-in, Sheets storage, background workers and the setup wizard were removed. The training data is copied unchanged from the BetterSpace synthetic pack.
