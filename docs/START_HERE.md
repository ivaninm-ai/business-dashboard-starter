# 从这里开始：打开和使用课堂演示 · Start here: the classroom demo

> 所有记录都是虚构的 BetterSpace 练习数据。不需要账号、登录、API 密钥或网络。
> All records are synthetic. No account, sign-in, API key or internet connection is needed.

## 1. 打开演示 · Open the demo

1. 下载文件 **`business-dashboard-demo.html`**：在 https://github.com/ivaninm-ai/business-dashboard-starter/releases/latest 的 Assets 里点它（或用老师发给你的文件，或自己 `npm run build` 后在 `dist/` 里找到）。
2. **双击**，用 Chrome 或 Edge 打开。页面会直接显示「BetterSpace 家居生活馆」第 1 天的概览。
3. 看到页面最上方的深红色横条：「教学演示 · 所有记录都是虚构的练习数据」，就说明打开成功。

Download `business-dashboard-demo.html` from the Assets of https://github.com/ivaninm-ai/business-dashboard-starter/releases/latest (or use your teacher's copy, or `dist/` after `npm run build`), then double-click it. It opens in Chrome or Edge straight into the B2C Day 1 overview. The dark-red ribbon at the top confirms it is the training demo.

**已测试 · Tested:** Windows 上的 Microsoft Edge 和 Google Chrome，直接从磁盘打开（file://）。Firefox 和 Safari 应该可以使用，但还没有测试过。
Tested in Edge and Chrome on Windows, opened from disk. Firefox and Safari should work but have not been tested.

> 如果页面是空白的：确认浏览器开启了 JavaScript，并且是较新的版本。If the page is blank, check that JavaScript is on and the browser is up to date.

## 2. 选择业务和场景 · Choose a business and a day

页面上方的场景栏 · The scenario bar:

| 控件 · Control | 作用 · What it does |
|---|---|
| **业务**：B2C 家居零售 / B2B 办公家具 | 两家虚构企业，各自的数据和保存状态完全分开。Two businesses; their data and saved state are separate. |
| **场景**：第 1 天 · 2026年8月30日 / 第 2 天 · 2026年8月31日 | 两份完整的数据快照。第 2 天取代第 1 天，不是加上去。Two full snapshots; Day 2 replaces Day 1. |
| **前进到第 2 天** | 课堂上的主要动作：换成第 2 天的数据，保留你的待办决定。Switches to Day 2 and keeps your task decisions. |
| **报告日期固定为…** | 数字按这个日期计算，不会随电脑今天的日期改变。Figures use this fixed date, not today's date. |
| **重置演示…** | 回到第 1 天，清除待办决定和备注。Back to Day 1, no decisions, no notes. |
| **语言 · Language** | 中文 / English，会记住你的选择。Remembered. |

## 3. 看数字和示例分析 · Explore the figures and the example analysis

- **概览 Overview**：期间订单额、已收款、未收款、逾期、待完成、低库存；每个数字下面都写着它的范围。
- **订单 / 客户 / 收款 / 库存**：点表格中的一行，就能看到数字背后的那条记录（来源行也会显示）。
- **示例分析 Example analysis**：为同一天**预先写好**的分析，页面会清楚写着「预先准备 · 不是实时 AI」。它不会因为你在页面上的操作而改变。可以展开「查看它依据的事实」，看到分析只用了哪些数字。

Click any row to open the record behind a figure. The example analysis is written in advance for the same day and is labelled "Prepared in advance · not live AI"; expand "Show the facts it was written from" to see its only inputs.

## 4. 接受一个待办，看它出现在日历上 · Accept a task and see it on the calendar

1. 打开 **待办 Tasks**。每条建议都写着理由、记录中的截止日期和「依据」（点一下会打开那条记录）。
2. 按 **接受（Accept）**。建议的日期和负责人会变成正式的行动日期。
3. 按 **编辑（Edit）**，把行动日期改成另一天，加一条备注，**保存**。
4. 打开 **日历 Calendar**：这条待办会出现在你选的日期上（蓝色）。
5. 在日历上按 **+ 新增备注（Add note）**，加一条你自己的备注（虚线）。

Only accepted tasks appear on the calendar. Recorded deadlines from the data (gold) and overdue ones (⚠, orange-red) are shown too; they can't be edited here.

## 5. 前进到第 2 天 · Advance to Day 2

按 **前进到第 2 天（Advance to Day 2）**。记录会换成 8 月 31 日的快照：

- 数字全部按新数据重新计算。
- 你在第 1 天做的决定仍然在（按同一个待办编号保留），会标着「第 1 天已决定」。
- 第 2 天才出现的建议标着「第 2 天新增」。
- 新数据已经不支持的建议移到「已由数据解决」。

值得在课堂上指出的变化 · Changes worth pointing out:

| 业务 | 第 1 天 → 第 2 天 |
|---|---|
| B2B | **BS-001** 的尾款 RM 4,500 付清：逾期余额 RM 30,515 → RM 26,015，订单额不变（收款不是新订单）。 |
| B2B | **T001** 到货 8 张椅子但全部被预留：在库 22 → 30，可用仍是 0（补货不等于可卖）。 |
| B2B | **BS-003** 原定 8 月 30 日完成：第 1 天「今天到期」，第 2 天变成逾期。 |
| B2B | **BC-036** 有了新的跟进日期（9 月 4 日），不再逾期；新的潜在客户 **BC-046** 没有负责人。 |
| B2C | **RS-001** 完成了（虽然晚了），逾期提醒消失；但 **RS-002、RS-229、RS-238** 在 8 月 30 日没完成，逾期交付从 8 笔变成 10 笔。 |
| B2C | **R003** 补货后不再低库存；门市新增一笔订单 **RS-321**，已全额付款。 |

## 6. 重置演示 · Reset the demo

按 **重置演示…（Reset demo）**，选择「只重置这个业务」或「重置两个业务」。重置后回到第 1 天，没有待办决定、没有日历备注；语言选择会保留。内置的记录永远不会被修改。

Reset returns to Day 1 with no decisions or notes; the language choice is kept. The bundled records never change.

## 7. 用你自己的 Excel（可选）· Your own Excel (optional)

1. 在业务里选 **我的 Excel**。页面会说明需要的格式，并提供两个范例下载（BetterSpace_B2C.xlsx / BetterSpace_B2B.xlsx）。
2. 按 **选择 Excel 文件（Choose an Excel file）**，选一个和范例格式相同的 `.xlsx`：四个工作表 Customers、Sales、Payments、Stock，第一行是列名。
3. 文件**只在这台电脑上读取，不会上传**。所有数字、待办和日历都按同样的规则计算；报告日期是文件里最新的日期。
4. Excel 改过之后，保存，再按 **重新读取 Excel**。不用时按 **忘记这个文件**（连同它的待办决定和备注一起删除；你的 Excel 文件本身不会被改动）。
5. 文件有问题时（缺工作表、列名不对、状态写法不对），页面会列出是哪个工作表、哪一行、哪一列。

Choose **我的 Excel**, then **Choose an Excel file** laid out like the template. It is read on this computer only and remembered in this browser until you choose **Forget this file**. There is no prepared example analysis for your own data.

> 课堂上请用虚构数据示范。不要在共用电脑上打开机密的真实数据。

## 保存说明 · About saving

- 你的操作只保存在**这台电脑的这个浏览器**里。这**不是备份**，不会同步到别的设备，也不会给别人看到。
- 换浏览器、换电脑、清除浏览器数据，都会从头开始。无痕/隐私窗口关闭后也会清空。
- 在 Chrome 和 Edge 中，同一台电脑上所有从磁盘打开的演示文件**共用同一份保存状态**（浏览器把本地文件视为同一个来源）。两个学生共用一台电脑时，请先按「重置演示」。
- 如果浏览器不允许保存，页面上方会显示黄色提示，演示仍然可以使用，但重新载入后更改会消失。

Saving is per browser on this computer — not a backup, not shared, not synchronised. In Chrome and Edge every copy of the demo file opened from this computer shares the same saved state; reset between students on a shared computer. If the browser blocks saving, a yellow notice appears and the demo still works for the visit.

## 数字核对表 · Headline checks

这些数字由自动测试与培训包的答案核对过。These figures are checked against the pack's answer keys by the automated tests.

| | B2C 第 1 天 | B2C 第 2 天 | B2B 第 1 天 | B2B 第 2 天 |
|---|---:|---:|---:|---:|
| 8 月订单额 · August order value (RM) | 25,650 | 25,735 | 231,060 | 231,060 |
| 8 月订单数 · August orders | 104 | 105 | 32 | 32 |
| 8 月已收款 · August cash (RM) | 25,650 | 25,735 | 193,765 | 198,265 |
| 未收款余额 · Outstanding (RM) | 0 | 0 | 91,090 | 86,590 |
| 逾期未收款 · Overdue (RM) | 0 | 0 | 30,515 | 26,015 |
| 低库存商品 · Low-stock items | 3 | 2 | 3 | 3 |
| 逾期未完成 · Overdue completions | 8 | 10 | 0 | 1 |
