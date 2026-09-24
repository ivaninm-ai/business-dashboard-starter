// Prepared example analyses, one per training scenario, in Chinese and English.
//
// Honesty rules (see docs/STUDENT_SOP.md):
//   - These were written in advance. The app never calls an AI service and must not
//     pretend to (no "generate" button, no fake loading or typing effect).
//   - Each one describes its scenario as supplied: no task decisions, no notes.
//   - test/briefs.test.js checks every amount, date, count, percentage and record ID
//     below against the figures the app calculates for that scenario, and checks that
//     each priority names a real open task. If you change the data, rewrite the briefs.
//
// Shape follows the original template's AI brief (worker/ai.mjs OUTPUT_SCHEMA):
// headline, summary, priorities[{task_key, why, suggested_action}], watch_items, data_caveats.

import { normaliseLocale } from '../i18n/i18n.js';

export const PROVENANCE = {
  prepared_on: '2026-09-24',
  prepared_by: 'Claude (AI coding assistant used to build this starter)',
  method: 'Written from the scenario facts produced by src/briefs/brief-input.js, following prompts/daily_brief.md; numbers checked by test/briefs.test.js.',
  review: 'Automated number check passes. Instructor read-through recommended before class.',
};

const BRIEFS = {
  'betterspace-b2c/day1': {
    reporting_date: '2026-08-30',
    'zh-CN': {
      headline: '8 笔已付款订单超过承诺完成日期，另有 3 笔今天到期；Monitor stand（R003）已没有可用库存。',
      summary: '本月至今（8月1–30日）共接单 RM 25,650，104 笔，比 7 月同期（RM 29,145）低 12.0%。本期收款同样是 RM 25,650，未收余额为 RM 0，所以今天的重点不是收钱，而是交付承诺：24 笔待完成订单中有 8 笔已超过承诺完成日期，另有 3 笔（RS-002、RS-229、RS-238）承诺今天完成。库存有 3 项偏低：Monitor stand（R003）可用 0 件，Ergonomic chair（R001）可用 2 件，Desk organiser（R005）可用 5 件。本月接单金额中，Shopee 为 RM 14,110，Lazada 为 RM 6,100，门市为 RM 5,440。',
      priorities: [
        { task_key: 'completion_overdue:RS-001', why: '承诺 8月29日完成，状态仍是 In Progress，而这笔订单已经付清。它是 8 笔逾期交付之一。', suggested_action: '请负责出货的同事确认 RS-001 是否已发出；如果还没有，给买家一个实际可行的送达日期。其余逾期订单用同样方法处理。' },
        { task_key: 'completion_due_soon:RS-002', why: '承诺今天（8月30日）完成；今天没有送出，明天就会变成逾期。', suggested_action: '今天优先安排 RS-002、RS-229 和 RS-238 出货。' },
        { task_key: 'review_replenishment:R003', why: '可用 0 件（在库 8 件，全部 8 件已预留），低于补货门槛 10 件。', suggested_action: '决定是否补货 Monitor stand。记录里没有供应商交期，承诺新到货日期前请先向供应商确认。' },
      ],
      watch_items: [
        '另有 3 笔订单（RS-009、RS-136、RS-263）承诺 9月1日完成。',
        'Ergonomic chair（R001）可用 2 件、Desk organiser（R005）可用 5 件，都已达到或低于补货门槛（10 件和 5 件）。',
        '本月有 22 位客户下单 2 次或以上（回头客）。',
      ],
      data_caveats: [
        '接单金额是不含税的订单金额，不是利润；电商平台的结账金额也不等于平台最终付给卖家的款项。',
        '这份分析只有本月各渠道的接单金额，无法判断哪个渠道比 7 月增长。可以在「概览」把期间改成「上个月」来对比。',
        '库存是 8月30日的一次盘点快照，没有供应商交期；预留数量是产品总数，不是分配到某张订单。',
      ],
    },
    en: {
      headline: '8 paid orders are past their promised completion date and 3 more are due today; the Monitor stand (R003) has no available units.',
      summary: 'Month to date (1–30 Aug) the shop booked RM 25,650 across 104 orders, 12.0% below the same days of July (RM 29,145). Cash collected is also RM 25,650 and nothing is outstanding (RM 0), so money is not the issue today — delivery promises are. 8 of the 24 pending orders are past their promised completion date and 3 more (RS-002, RS-229, RS-238) are promised for today. 3 products are low: the Monitor stand (R003) has 0 available units, the Ergonomic chair (R001) 2 and the Desk organiser (R005) 5. Of this month\'s order value, Shopee brought RM 14,110, Lazada RM 6,100 and the showroom RM 5,440.',
      priorities: [
        { task_key: 'completion_overdue:RS-001', why: 'Promised for 29 Aug and still In Progress, although the order is fully paid. It is one of 8 late deliveries.', suggested_action: 'Ask whoever handles dispatch whether RS-001 has shipped; if not, give the buyer a realistic delivery date. Work through the other late orders the same way.' },
        { task_key: 'completion_due_soon:RS-002', why: 'Promised for today (30 Aug); if it does not go out today it becomes overdue tomorrow.', suggested_action: 'Put RS-002, RS-229 and RS-238 first in today\'s dispatch.' },
        { task_key: 'review_replenishment:R003', why: '0 available units (8 on hand, all 8 reserved), below the reorder threshold of 10.', suggested_action: 'Decide whether to reorder the Monitor stand. The records hold no supplier lead times, so confirm them with the supplier before promising new stock.' },
      ],
      watch_items: [
        '3 more orders (RS-009, RS-136, RS-263) are promised for 1 Sep.',
        'The Ergonomic chair (R001) has 2 available units and the Desk organiser (R005) 5, both at or below their reorder thresholds (10 and 5).',
        '22 customers ordered 2 or more times this month (repeat customers).',
      ],
      data_caveats: [
        'Order value is booked value excluding tax, not profit; marketplace checkout money is not the same as the seller\'s payout.',
        'This analysis only has this month\'s order value by channel, so it cannot say which channel grew compared with July. Set the period to Previous month on the Overview to compare.',
        'Stock is one count dated 30 Aug with no supplier lead times; reservations are product totals, not allocations to particular orders.',
      ],
    },
  },

  'betterspace-b2c/day2': {
    reporting_date: '2026-08-31',
    'zh-CN': {
      headline: 'RS-001 已完成、Monitor stand 不再低库存，但逾期交付从 8 笔增加到 10 笔：原定 8月30日完成的 3 笔订单（RS-002、RS-229、RS-238）没有按时完成。',
      summary: '本月至今（8月1–31日）共接单 RM 25,735，105 笔，比 7 月同期（RM 29,640）低 13.2%。和昨天相比，门市接单金额从 RM 5,440 增加到 RM 5,525；本期收款同样是 RM 25,735，未收余额仍为 RM 0。RS-001 已完成，不再列为逾期；Monitor stand（R003）也不在低库存名单上了。压力仍在交付：23 笔待完成订单中有 10 笔超过承诺完成日期，另有 5 笔承诺今天完成。',
      priorities: [
        { task_key: 'completion_overdue:RS-002', why: '原定 8月30日完成，现在仍未完成；昨天它还是「今天到期」。', suggested_action: '确认 RS-002 是否已出货，并主动告诉买家新的送达日期。RS-229 和 RS-238 同样处理。' },
        { task_key: 'completion_overdue:RS-062', why: '承诺 8月28日完成，和 RS-133、RS-200 一样，是目前等待最久的订单。', suggested_action: '先跟进这 3 笔等待最久的订单。' },
        { task_key: 'completion_due_soon:RS-254', why: '一笔 Ergonomic chair 订单，承诺今天（8月31日）完成。', suggested_action: '今天安排出货；Ergonomic chair（R001）只剩 2 件可用。' },
        { task_key: 'review_replenishment:R001', why: '可用 2 件（在库 11 件，预留 9 件），低于补货门槛 10 件。', suggested_action: '决定是否补货；记录里没有供应商交期和采购价格。' },
      ],
      watch_items: [
        '3 笔订单（RS-010、RS-045、RS-210）承诺 9月2日完成。',
        'Desk organiser（R005）可用 5 件，正好等于补货门槛 5 件。',
        '本月回头客（下单 2 次或以上）有 23 位。',
      ],
      data_caveats: [
        'RS-001 原定 8月29日完成，现在记录显示已完成；这只说明订单状态，不代表买家满意。',
        '接单金额不含税，不是利润；电商平台结账金额不等于卖家实际收到的款项。',
        '这份分析没有各渠道的 7 月数据，无法判断哪个渠道比上月增长。',
      ],
    },
    en: {
      headline: 'RS-001 is complete and the Monitor stand is no longer low on stock, but late deliveries rose from 8 to 10: the 3 orders promised for 30 Aug (RS-002, RS-229, RS-238) did not complete.',
      summary: 'Month to date (1–31 Aug) the shop booked RM 25,735 across 105 orders, 13.2% below the same days of July (RM 29,640). Since yesterday the showroom\'s order value rose from RM 5,440 to RM 5,525; cash collected is also RM 25,735 and the outstanding balance is still RM 0. RS-001 is now complete and no longer overdue, and the Monitor stand (R003) has left the low-stock list. Delivery is still the pressure point: 10 of the 23 pending orders are past their promised completion date and 5 more are promised for today.',
      priorities: [
        { task_key: 'completion_overdue:RS-002', why: 'Promised for 30 Aug and still not complete; yesterday it was "due today".', suggested_action: 'Check whether RS-002 has shipped and tell the buyer the new delivery date. Do the same for RS-229 and RS-238.' },
        { task_key: 'completion_overdue:RS-062', why: 'Promised for 28 Aug — with RS-133 and RS-200, the orders that have waited longest.', suggested_action: 'Chase these 3 longest-waiting orders first.' },
        { task_key: 'completion_due_soon:RS-254', why: 'An Ergonomic chair order promised for today (31 Aug).', suggested_action: 'Dispatch it today; the Ergonomic chair (R001) has only 2 available units.' },
        { task_key: 'review_replenishment:R001', why: '2 available units (11 on hand, 9 reserved), below the reorder threshold of 10.', suggested_action: 'Decide whether to reorder; the records hold no supplier lead times or purchase prices.' },
      ],
      watch_items: [
        '3 orders (RS-010, RS-045, RS-210) are promised for 2 Sep.',
        'The Desk organiser (R005) has 5 available units, exactly its reorder threshold of 5.',
        '23 customers ordered 2 or more times this month (repeat customers).',
      ],
      data_caveats: [
        'RS-001 was promised for 29 Aug and is now recorded as complete; that is its status, not proof the buyer was satisfied.',
        'Order value excludes tax and is not profit; marketplace checkout money is not the seller\'s payout.',
        'This analysis has no July figures by channel, so it cannot say which channel grew against last month.',
      ],
    },
  },

  'betterspace-b2b/day1': {
    reporting_date: '2026-08-30',
    'zh-CN': {
      headline: '15 笔订单共 RM 30,515 已逾期未收；单笔最大的是 BS-022 的 RM 5,400，BS-001 的 RM 4,500 尾款也在 8月29日到期未付。',
      summary: '本月至今（8月1–30日）共接单 RM 231,060，32 笔，比 7 月同期（RM 218,030）高 6.0%；本期实际收款 RM 193,765。客户仍欠 RM 91,090，其中 RM 30,515（15 笔）已过付款期限。另有 5 个记录的跟进已逾期，2 个今天到期。BS-003 承诺今天完成。库存方面，Ergonomic office chair（T001）可用 0 件，还有 8 件待交付数量没有被预留覆盖；Meeting table（T003）在库 0 件。',
      priorities: [
        { task_key: 'payment_follow_up:BS-022', why: '最大的一笔逾期余额：RM 10,800 中还欠 RM 5,400，付款期限是 8月11日。', suggested_action: '由 Sarah 联系 Demo Cedar Company 008，约定 RM 5,400 的付款日期。' },
        { task_key: 'payment_follow_up:BS-001', why: 'RM 9,000 订单的另一半 RM 4,500 在 8月29日到期，仍未收到。', suggested_action: '由 Mei 提醒 ABC Workspace Demo Co. 支付 RM 4,500 余款。' },
        { task_key: 'payment_follow_up:BS-084', why: 'RM 4,500 自 7月24日起逾期。', suggested_action: '由 Mei 跟进 Demo North Company 025。' },
        { task_key: 'follow_up_due:BC-045', why: '记录的跟进日期是 8月25日，是逾期最久的跟进。', suggested_action: '由 Mei 今天联系，并在记录里更新下一次跟进日期。' },
        { task_key: 'review_replenishment:T001', why: '可用 0 件（在库 22 件全部预留），另有 8 件待交付数量没有预留覆盖。', suggested_action: '和团队确认补货安排；记录里没有供应商交期，先不要向客户承诺到货日期。' },
      ],
      watch_items: [
        '逾期最久的 2 笔是 BS-085（RM 1,400）和 BS-088（RM 900），付款期限都是 6月30日。',
        '下一笔大额余款是 BS-019 的 RM 15,300，9月2日到期。',
        '今天到期的跟进：BC-040（Mei）和 BC-043（Amir）。',
        'Visitor chair（T005）可用 5 件，正好等于补货门槛。',
      ],
      data_caveats: [
        '跟进日期已过只表示记录的下一步行动逾期，不能证明没有人联系过客户。',
        '记录里没有供应商交期或采购价，所以这里不建议补货数量。',
        '接单金额不含税，不是利润。',
      ],
    },
    en: {
      headline: 'RM 30,515 is overdue across 15 orders; the largest single amount is RM 5,400 on BS-022, and the RM 4,500 final payment on BS-001 was due on 29 Aug.',
      summary: 'Month to date (1–30 Aug) BetterSpace Office Solutions booked RM 231,060 across 32 orders, 6.0% above the same days of July (RM 218,030), and collected RM 193,765 in cash. Customers still owe RM 91,090, of which RM 30,515 on 15 orders is past its due date. 5 recorded follow-ups are overdue and 2 are due today. BS-003 is promised for completion today. The Ergonomic office chair (T001) has 0 available units and 8 pending units not covered by reservations; the Meeting table (T003) has 0 on hand.',
      priorities: [
        { task_key: 'payment_follow_up:BS-022', why: 'The largest overdue balance: RM 5,400 of RM 10,800, due on 11 Aug.', suggested_action: 'Sarah to call Demo Cedar Company 008 and agree a payment date for the RM 5,400.' },
        { task_key: 'payment_follow_up:BS-001', why: 'The second half (RM 4,500) of the RM 9,000 order was due on 29 Aug and has not arrived.', suggested_action: 'Mei to remind ABC Workspace Demo Co. about the RM 4,500 balance.' },
        { task_key: 'payment_follow_up:BS-084', why: 'RM 4,500 has been overdue since 24 Jul.', suggested_action: 'Mei to follow up with Demo North Company 025.' },
        { task_key: 'follow_up_due:BC-045', why: 'Recorded follow-up date 25 Aug — the oldest overdue follow-up.', suggested_action: 'Mei to make contact today and record the next follow-up date.' },
        { task_key: 'review_replenishment:T001', why: '0 available units (all 22 on hand are reserved) and 8 pending units not covered by reservations.', suggested_action: 'Agree a replenishment plan with the team; the records hold no supplier lead times, so do not promise arrival dates to customers yet.' },
      ],
      watch_items: [
        'The 2 oldest overdue balances, BS-085 (RM 1,400) and BS-088 (RM 900), were due on 30 Jun.',
        'The next large balance to fall due is BS-019: RM 15,300 on 2 Sep.',
        'Follow-ups due today: BC-040 (Mei) and BC-043 (Amir).',
        'The Visitor chair (T005) has 5 available units, exactly its reorder threshold.',
      ],
      data_caveats: [
        'A past follow-up date is an overdue recorded action; it does not prove nobody contacted the customer.',
        'The records hold no supplier lead times or purchase prices, so no reorder quantities are suggested.',
        'Booked order value excludes tax and is not profit.',
      ],
    },
  },

  'betterspace-b2b/day2': {
    reporting_date: '2026-08-31',
    'zh-CN': {
      headline: 'BS-001 已付清，逾期余额从 RM 30,515 降到 RM 26,015；但 BS-003 变成逾期未完成，新的潜在客户 BC-046 还没有负责人。',
      summary: '接单金额没有变化（RM 231,060，32 笔）——新增的是一笔收款，不是新订单。本月收款从 RM 193,765 增加到 RM 198,265，未收余额降到 RM 86,590，仍有 14 笔订单逾期未付。BS-003 原定 8月30日完成，目前仍未完成。T001 在库从 22 件增加到 30 件，但 30 件全部预留，可用仍是 0 件。逾期跟进从 5 个增加到 6 个；BC-036 已有新的跟进日期 9月4日。',
      priorities: [
        { task_key: 'completion_overdue:BS-003', why: '承诺 8月30日完成，目前仍未完成。', suggested_action: '由 Mei 与送货团队确认 BS-003 是否已交付；如果没有，告诉 Demo Vista Company 003 新的完成日期。' },
        { task_key: 'unassigned_prospect:BC-046', why: '新的潜在客户，没有负责人，记录的跟进日期是 9月1日。', suggested_action: '今天决定由谁负责 Demo New Office Co.，确保 9月1日的跟进有人做。' },
        { task_key: 'payment_follow_up:BS-022', why: '仍是最大的一笔逾期余额：RM 5,400，8月11日到期。', suggested_action: '由 Sarah 继续跟进付款日期。' },
        { task_key: 'follow_up_due:BC-045', why: '跟进日期是 8月25日，逾期最久。', suggested_action: '由 Mei 联系，并更新下一次跟进日期。' },
      ],
      watch_items: [
        'BS-019 的 RM 15,300 在 9月2日到期。',
        'Meeting table（T003）在库仍为 0 件；Visitor chair（T005）可用 5 件，等于补货门槛 5 件。',
        '今天到期的跟进：BC-039（Sarah）。',
      ],
      data_caveats: [
        'BC-046 是潜在客户，不是订单，不影响接单金额。',
        '跟进日期已过只表示记录的行动逾期，不能证明没有人联系过客户。',
        '记录里没有供应商交期；T001 新增的库存已全部预留，目前没有可再承诺给其他订单的数量。',
      ],
    },
    en: {
      headline: 'BS-001 is paid in full, bringing the overdue balance down from RM 30,515 to RM 26,015 — but BS-003 is now an overdue completion and the new prospect BC-046 has no owner.',
      summary: 'Order value did not change (RM 231,060 across 32 orders): the new money was a receipt, not a sale. Cash collected this month rose from RM 193,765 to RM 198,265 and the outstanding balance fell to RM 86,590; 14 orders are still overdue for payment. BS-003 was promised for 30 Aug and is not yet complete. T001 now has 30 on hand instead of 22, but all 30 are reserved, so 0 are available. Overdue follow-ups went from 5 to 6; BC-036 now has a new follow-up date of 4 Sep.',
      priorities: [
        { task_key: 'completion_overdue:BS-003', why: 'Promised for 30 Aug and still not complete.', suggested_action: 'Mei to check with the delivery team whether BS-003 has been delivered and, if not, give Demo Vista Company 003 a new completion date.' },
        { task_key: 'unassigned_prospect:BC-046', why: 'A new prospect with no owner and a follow-up recorded for 1 Sep.', suggested_action: 'Decide today who owns Demo New Office Co. so the 1 Sep follow-up happens.' },
        { task_key: 'payment_follow_up:BS-022', why: 'Still the largest overdue balance: RM 5,400, due on 11 Aug.', suggested_action: 'Sarah to keep pursuing a payment date.' },
        { task_key: 'follow_up_due:BC-045', why: 'Follow-up date 25 Aug — the oldest overdue follow-up.', suggested_action: 'Mei to make contact and record the next follow-up date.' },
      ],
      watch_items: [
        'BS-019 (RM 15,300) falls due on 2 Sep.',
        'The Meeting table (T003) still has 0 on hand; the Visitor chair (T005) has 5 available units against a threshold of 5.',
        'Follow-up due today: BC-039 (Sarah).',
      ],
      data_caveats: [
        'BC-046 is a prospect, not a sale; it does not change order value.',
        'A past follow-up date is an overdue recorded action; it does not prove nobody made contact.',
        'The records hold no supplier lead times; the new T001 stock is fully reserved, so none can be promised to other orders.',
      ],
    },
  },
};

export function exampleBriefKeys() { return Object.keys(BRIEFS); }

// The prepared brief for a scenario in the requested language, or null.
export function exampleBrief(businessId, day, locale) {
  const entry = BRIEFS[`${businessId}/${day}`];
  if (!entry) return null;
  const lang = normaliseLocale(locale) === 'zh-CN' ? 'zh-CN' : 'en';
  return { scenario: `${businessId}/${day}`, reporting_date: entry.reporting_date, language: lang, ...entry[lang] };
}
