/**
 * useScriptData.js
 * 口播分镜数据配置中枢 — 智能视频导演技能 (intelligent-video-director)
 * 每个 scriptId 对应一套完整的分镜时序、节点布局与连线配置。
 */

// 通用节点颜色常量
export const COLORS = {
  CYAN:   0x00ffcc,
  GOLD:   0xffd700,
  GREEN:  0x39ff14,
  BLUE:   0x00b3ff,
  PURPLE: 0xaa00ff,
  RED:    0xff3366,
  ORANGE: 0xff9900,
  GRAY:   0x666666,
  WHITE:  0xffffff,
  DARK:   0x0b0d16,
}

/**
 * 分镜配置格式:
 * scenes: [
 *   {
 *     id: 'scene-1',
 *     duration: 3.8,         // 本幕持续时间(秒)
 *     subtitle: '...',       // 顶部提词文字
 *     // 本幕存活 (active) 的节点 id 列表
 *     activeNodes: ['redbook','hardcore'],
 *     // 本幕存活的连线 id 列表
 *     activeLinks: [],
 *     // 本幕新出现的节点 (首次进场动作)
 *     enterNodes: ['redbook','hardcore'],
 *     // 本幕退场的节点
 *     exitNodes: [],
 *     // 特殊动效指令
 *     fx: []
 *   },
 *   ...
 * ]
 * nodes: [
 *   {
 *     id: 'redbook',
 *     label: '小红书文案',
 *     subLabel: '(赚几十块)',
 *     x: 180, y: 520,        // 画布坐标 (900×640 基准)
 *     color: COLORS.GRAY,
 *     radius: 45,
 *     ease: 'power4.out',    // 进场缓动
 *     blendMode: 'normal',   // PIXI BlendMode
 *   },
 *   ...
 * ]
 * links: [
 *   { id: 'lnk-rb', from: 'redbook', to: 'hardcore', color: COLORS.GRAY, dash: true },
 * ]
 */

export const AI_AUDIT_SCRIPT = {
  id: 'ai_audit_workflow',
  title: 'AI审计商业降维打击 · 19岁狂赚32万美金',
  bgColor: 0x060913,

  nodes: [
    { id: 'redbook',          label: '小红书文案',       subLabel: '(赚几十块)',       x: 180, y: 490, color: COLORS.GRAY,   radius: 42,  ease: 'power4.out'    },
    { id: 'hardcore',         label: '商业降维打击',      subLabel: '【硬核项目】',     x: 450, y: 195, color: COLORS.GOLD,   radius: 65,  ease: 'back.out(1.5)' },
    { id: 'teens',            label: '19岁高中生',       subLabel: '(零代码背景)',     x: 210, y: 500, color: COLORS.CYAN,   radius: 50,  ease: 'power4.out'    },
    { id: 'ai-audit-svc',    label: '企业 AI Audit',    subLabel: '审计服务',         x: 690, y: 500, color: COLORS.BLUE,   radius: 50,  ease: 'power4.out'    },
    { id: 'profit',           label: '$320,000',         subLabel: '狂赚200万+ RMB',  x: 450, y: 330, color: COLORS.GOLD,   radius: 80,  ease: 'elastic.out(1,0.5)' },
    { id: 'math-model',       label: '"帮老板算账"',      subLabel: '思维模型',        x: 450, y: 295, color: COLORS.PURPLE, radius: 62,  ease: 'back.out(1.5)', poly: true },
    { id: 'ai-advisor',       label: '★ AI咨询顾问',     subLabel: '商业闭环之路',    x: 450, y: 490, color: COLORS.GOLD,   radius: 48,  ease: 'elastic.out(1,0.6)' },
    { id: 'entrepreneur',     label: '传统AI创业者',      subLabel: '(盲目推销大系统)', x: 145, y: 315, color: COLORS.RED,    radius: 42,  ease: 'power4.out'    },
    { id: 'huge-system',      label: '$100,000',         subLabel: '庞大AI系统',      x: 335, y: 315, color: COLORS.RED,    radius: 55,  ease: 'back.out(1.5)' },
    { id: 'boss',             label: '企业老板',         subLabel: '(极度焦虑/避险)', x: 720, y: 315, color: COLORS.ORANGE, radius: 55,  ease: 'power4.out'    },
    { id: 'audit-report',    label: 'AI Audit 诊断报告', subLabel: '$1,500-$5,000',  x: 450, y: 355, color: COLORS.GREEN,  radius: 65,  ease: 'elastic.out(1,0.5)' },
    { id: 'big-deal',        label: '$100,000+ 高价大单', subLabel: '后续开发全归你', x: 450, y: 160, color: COLORS.GOLD,   radius: 0,   ease: 'back.out(1.5)', isRect: true, rw: 230, rh: 70 },
  ],

  links: [
    { id: 'lnk-rb-hc',     from: 'redbook',      to: 'hardcore',    color: COLORS.GRAY,   dash: true  },
    { id: 'lnk-teens-svc',  from: 'teens',        to: 'ai-audit-svc', color: COLORS.CYAN,  dash: true  },
    { id: 'lnk-math-adv',  from: 'math-model',   to: 'ai-advisor',  color: COLORS.PURPLE, dash: true  },
    { id: 'lnk-ent-sys',   from: 'entrepreneur', to: 'huge-system', color: COLORS.RED,    dash: false },
    { id: 'lnk-rep-boss',  from: 'audit-report', to: 'boss',        color: COLORS.GREEN,  dash: true  },
    { id: 'lnk-deal-all',  from: 'big-deal',     to: 'boss',        color: COLORS.GOLD,   dash: false, width: 3 },
  ],

  scenes: [
    {
      id: 'scene-1', duration: 3.8,
      subtitle: '别再天天盯着怎么帮人写小红书文案赚几十块钱了。今天，我带你拆解一个真正实现商业降维打击的硬核项目。',
      enterNodes: ['redbook', 'hardcore'],
      activeNodes: ['redbook', 'hardcore'],
      activeLinks: ['lnk-rb-hc'],
      exitNodes:   [],
      fx: [{ type: 'shatter', target: 'redbook', at: 2.4 }]
    },
    {
      id: 'scene-2', duration: 4.2,
      subtitle: '两个完全不懂代码、没有技术背景的19岁外国高中生，在短短6个月的时间里，靠着给企业提供"AI审计"服务，狂赚了32万美金！折合人民币200多万。',
      enterNodes: ['teens', 'ai-audit-svc', 'profit'],
      activeNodes: ['teens', 'ai-audit-svc', 'profit'],
      activeLinks: ['lnk-teens-svc'],
      exitNodes:   ['redbook', 'hardcore'],
      fx: [{ type: 'pulse', target: 'profit', at: 1.5 }]
    },
    {
      id: 'scene-3', duration: 4.0,
      subtitle: '最牛的是，他们根本不用开发系统，全靠一套"帮老板算账"的思维模型。普通人只要学会三成，就能立刻开启你的AI咨询顾问之路。',
      enterNodes: ['math-model', 'ai-advisor'],
      activeNodes: ['math-model', 'ai-advisor'],
      activeLinks: ['lnk-math-adv'],
      exitNodes:   ['teens', 'ai-audit-svc', 'profit'],
      fx: []
    },
    {
      id: 'scene-4', duration: 4.2,
      subtitle: '很多AI创业者一上来就找企业老板推销："老板，我们给你开发一个10万美金的AI系统吧！"结果往往被保安轰出来。因为项目太大、决策太慢、风险太高。',
      enterNodes: ['entrepreneur', 'huge-system', 'boss'],
      activeNodes: ['entrepreneur', 'huge-system', 'boss'],
      activeLinks: ['lnk-ent-sys'],
      exitNodes:   ['math-model', 'ai-advisor'],
      fx: [{ type: 'barrier', at: 1.4 }, { type: 'blast', target: 'huge-system', at: 2.4 }, { type: 'flyout', target: 'entrepreneur', at: 2.6 }]
    },
    {
      id: 'scene-5', duration: 4.0,
      subtitle: '而这两个19岁的少年，却一眼看穿了企业老板最底层的心理障碍："闪光物综合征"。老板们虽然都想上AI，但其实内心极度焦虑，不知道AI怎么和现有部门结合。',
      enterNodes: ['teens'],
      activeNodes: ['boss', 'teens'],
      activeLinks: [],
      exitNodes:   ['entrepreneur', 'huge-system'],
      fx: [{ type: 'shiny-syndrome', target: 'boss', at: 0.5 }, { type: 'insight-ray', from: 'teens', to: 'boss', at: 1.8 }]
    },
    {
      id: 'scene-6', duration: 4.3,
      subtitle: '于是，这俩高中生只卖一个门槛极低的产品："AI审计报告（AI Audit）"。一单收费只要1500到5000美金。这就像医院做手术前，必须先让你做一个全身核磁共振检查。',
      enterNodes: ['audit-report'],
      activeNodes: ['boss', 'audit-report'],
      activeLinks: ['lnk-rep-boss'],
      exitNodes:   ['teens'],
      fx: [{ type: 'radar-scan', target: 'audit-report', at: 0.8 }]
    },
    {
      id: 'scene-7', duration: 5.0,
      subtitle: '当老板以极低门槛买下这份诊断后，后面的高价开发大单，其实就已经非他们莫属了。',
      enterNodes: ['big-deal'],
      activeNodes: ['boss', 'audit-report', 'big-deal'],
      activeLinks: ['lnk-rep-boss', 'lnk-deal-all'],
      exitNodes:   [],
      fx: [{ type: 'neural-pulse', at: 1.5 }, { type: 'gold-rain', at: 2.0 }]
    },
  ]
}

export const AI_AUDIT_SOP_SCRIPT = {
  id: 'ai_audit_sop_workflow',
  title: 'AI审计傻瓜式SOP与低效成本测算',
  bgColor: 0x060913,

  nodes: [
    { id: 'sop-core',            label: 'AI 审计傻瓜 SOP', subLabel: '三大闭环步骤',     relX: 0, relY: -20, color: COLORS.PURPLE, radius: 65, ease: 'back.out(1.5)', poly: true },
    { id: 'management',          label: '高层管理',         subLabel: '(拒绝空谈听汇报)', relX: 0, relY: -140, color: COLORS.RED,    radius: 45, ease: 'power4.out' },
    { id: 'frontline',           label: '一线客服/前台/销售', subLabel: '(真实现场采访)', relX: 0, relY: 120, color: COLORS.CYAN,   radius: 55, ease: 'power4.out' },
    { id: 'core-question',       label: '核心问号?',        subLabel: '最恶心无脑的重复工作?', relX: 0, relY: -20, color: COLORS.ORANGE, radius: 65, ease: 'elastic.out(1,0.5)' },
    { id: 'invoice-doc',         label: '大量发票数据',     subLabel: '(10个部门/每天2h)', relX: -250, relY: 0, color: COLORS.CYAN,   radius: 50, ease: 'power4.out' },
    { id: 'salesforce',          label: 'Salesforce 系统', subLabel: '手动重复复制',     relX: 250, relY: 0, color: COLORS.BLUE,   radius: 0,  ease: 'power4.out', isRect: true, rw: 180, rh: 60 },
    { id: 'inefficient-formula', label: '⚡ 低效成本计算公式', subLabel: '帮你帮老板算清账', relX: 0, relY: -150, color: COLORS.GOLD,   radius: 0,  ease: 'back.out(1.5)', isRect: true, rw: 280, rh: 60 },
    { id: 'waste-detail',        label: '10部门 × 2h/天 × $35/h × 250天', subLabel: '隐形成本精确测算', relX: 0, relY: -10, color: COLORS.PURPLE, radius: 0, ease: 'power4.out', isRect: true, rw: 360, rh: 60 },
    { id: 'cost-14',             label: '$140,000 /年',     subLabel: '无脑录入白白蒸发', relX: -180, relY: 150, color: COLORS.RED,    radius: 60, ease: 'elastic.out(1,0.5)' },
    { id: 'cost-16',             label: '$166,000 /年',     subLabel: '含潜在人工出错损失!', relX: 180, relY: 150, color: COLORS.RED, radius: 70, ease: 'elastic.out(1,0.5)' },
    { id: 'boss-alarm',          label: '企业老板 坐不住了!', subLabel: '看完数字瞬间买单', relX: 0, relY: 0, color: COLORS.ORANGE, radius: 72, ease: 'elastic.out(1,0.5)' },
  ],

  links: [
    { id: 'lnk-sop-mgmt',  from: 'sop-core',            to: 'management',          color: COLORS.RED,    dash: true },
    { id: 'lnk-sop-front', from: 'sop-core',            to: 'frontline',           color: COLORS.CYAN,   dash: true },
    { id: 'lnk-inv-sf',    from: 'invoice-doc',         to: 'salesforce',          color: COLORS.RED,    dash: true, width: 2.5 },
    { id: 'lnk-fml-waste', from: 'inefficient-formula', to: 'waste-detail',        color: COLORS.GOLD,   dash: false },
    { id: 'lnk-waste-14',  from: 'waste-detail',        to: 'cost-14',             color: COLORS.RED,    dash: true },
    { id: 'lnk-waste-16',  from: 'waste-detail',        to: 'cost-16',             color: COLORS.RED,    dash: false, width: 3 },
    { id: 'lnk-16-boss',   from: 'cost-16',             to: 'boss-alarm',          color: COLORS.GOLD,   dash: false, width: 3 },
  ],

  scenes: [
    {
      id: 'scene-1', duration: 3.8,
      subtitle: '那么，这个“AI审计”到底在审什么？难度很高吗？其实他们有一套傻瓜式的SOP：',
      enterNodes: ['sop-core'],
      activeNodes: ['sop-core'],
      activeLinks: [],
      exitNodes:   [],
      fx: [{ type: 'pulse', target: 'sop-core', at: 1.0 }]
    },
    {
      id: 'scene-2', duration: 4.4,
      subtitle: '第一步，他们绝不和管理层瞎聊，而是直接采访前线一线的客服、前台和销售员：',
      enterNodes: ['management', 'frontline'],
      activeNodes: ['management', 'frontline'],
      activeLinks: ['lnk-sop-mgmt', 'lnk-sop-front'],
      exitNodes:   ['sop-core'],
      fx: [{ type: 'shatter', target: 'management', at: 1.8 }]
    },
    {
      id: 'scene-3', duration: 4.3,
      subtitle: '只问一个核心问题：“你每天花时间最多、觉得最恶心、最无脑的重复工作是什么？”',
      enterNodes: ['core-question'],
      activeNodes: ['core-question'],
      activeLinks: [],
      exitNodes:   ['frontline'],
      fx: [{ type: 'radar-scan', target: 'core-question', at: 0.8 }]
    },
    {
      id: 'scene-4', duration: 5.0,
      subtitle: '比如，在审计大型保险经纪公司时，发现十个部门员工每天花2小时，手动把大量发票信息复制到Salesforce里：',
      enterNodes: ['invoice-doc', 'salesforce'],
      activeNodes: ['invoice-doc', 'salesforce'],
      activeLinks: ['lnk-inv-sf'],
      exitNodes:   ['core-question'],
      fx: [{ type: 'neural-pulse', at: 1.5 }]
    },
    {
      id: 'scene-5', duration: 4.5,
      subtitle: '紧接着，这群少年甩出了一套神级公式，直接帮老板算清了“低效成本”：',
      enterNodes: ['inefficient-formula', 'waste-detail'],
      activeNodes: ['inefficient-formula', 'waste-detail'],
      activeLinks: ['lnk-fml-waste'],
      exitNodes:   ['invoice-doc', 'salesforce'],
      fx: [{ type: 'pulse', target: 'inefficient-formula', at: 1.0 }]
    },
    {
      id: 'scene-6', duration: 5.5,
      subtitle: '10部门 × 2小时 × $35/h × 250天 = 白白蒸发 14万美金！加上潜在出错损失，一年高达 16.6万美金！',
      enterNodes: ['cost-14', 'cost-16'],
      activeNodes: ['inefficient-formula', 'waste-detail', 'cost-14', 'cost-16'],
      activeLinks: ['lnk-fml-waste', 'lnk-waste-14', 'lnk-waste-16'],
      exitNodes:   [],
      fx: [{ type: 'gold-rain', at: 1.5 }, { type: 'pulse', target: 'cost-16', at: 2.5 }]
    },
    {
      id: 'scene-7', duration: 5.0,
      subtitle: '这就是低效成本公式。老板看到这个数字，瞬间就坐不住了。',
      enterNodes: ['boss-alarm'],
      activeNodes: ['cost-16', 'boss-alarm'],
      activeLinks: ['lnk-16-boss'],
      exitNodes:   ['inefficient-formula', 'waste-detail', 'cost-14'],
      fx: [{ type: 'neural-pulse', at: 1.0 }, { type: 'pulse', target: 'boss-alarm', at: 1.8 }]
    },
  ]
}

// 以后新增的稿件在这里配置
export const AGENT_OBSIDIAN_SCRIPT = {
  id: 'agent_obsidian_workflow',
  title: 'AI Agent 与 Obsidian 无缝自动化工作流',
  bgColor: 0x060913,
  nodes: [],
  links: [],
  scenes: []
}

export const DONT_SCRAPE_SCRIPT = {
  id: 'dont_scrape_workflow',
  title: '别再让 AI Agent 硬爬视频了 · 真正的数据解耦流',
  bgColor: 0x060913,

  nodes: [
    { id: 'youtube-logo',     label: 'YouTube 链接',     subLabel: '(抓取对标源)',    x: 450, y: 320, color: COLORS.RED,    radius: 60, ease: 'back.out(1.5)' },
    { id: 'warning-card',     label: '⚠️ 登录验证失败',   subLabel: 'Request Timeout', x: 450, y: 320, color: COLORS.RED,    radius: 0,  ease: 'elastic.out(1,0.5)', isRect: true, rw: 240, rh: 100 },
    { id: 'ai-brain',         label: 'AI Agent 大脑',    subLabel: '(负责逻辑与编排)', x: 250, y: 320, color: COLORS.CYAN,   radius: 65, ease: 'back.out(1.5)' },
    { id: 'spider-wall',      label: '防爬虫防火墙',      subLabel: '【反爬机制】',     x: 650, y: 320, color: COLORS.RED,    radius: 65, ease: 'power4.out' },
    { id: 'server-ip',        label: '普通数据中心 IP',   subLabel: '(死循环/封禁)',    x: 120, y: 320, color: COLORS.BLUE,   radius: 40, ease: 'power4.out' },
    { id: 'cpu-whisper',      label: '本地 Whisper CPU', subLabel: '(满载瘫痪半小时)', x: 450, y: 480, color: COLORS.ORANGE, radius: 50, ease: 'power4.out' },
    { id: 'hermes-brain',     label: '★ Hermes 大脑',    subLabel: '【只做调度决策】', x: 250, y: 280, color: COLORS.CYAN,   radius: 70, ease: 'elastic.out(1,0.5)', poly: true },
    { id: 'supdata-api',      label: 'Supdata API',      subLabel: '【数据通道】',     x: 650, y: 280, color: COLORS.GOLD,   radius: 70, ease: 'elastic.out(1,0.5)' },
    { id: 'step-1',           label: '1. 元数据聚类',    subLabel: '(轻量筛选)',       x: 200, y: 480, color: COLORS.BLUE,   radius: 45, ease: 'power4.out' },
    { id: 'step-2',           label: '2. 人工确认',      subLabel: '(精确锁定)',       x: 450, y: 480, color: COLORS.ORANGE, radius: 45, ease: 'power4.out' },
    { id: 'step-3',           label: '3. API 提字稿',    subLabel: '(秒级吐出)',       x: 700, y: 480, color: COLORS.GOLD,   radius: 45, ease: 'power4.out' },
    { id: 'obsidian-vault',   label: 'Obsidian 笔记库',  subLabel: '(双链与爆点提炼)', x: 450, y: 150, color: COLORS.PURPLE, radius: 60, ease: 'back.out(1.5)' },
    { id: 'token-usage',      label: '⚡ Token 消耗 -80%', subLabel: '服务器平稳运行',   x: 450, y: 340, color: COLORS.GREEN,  radius: 0,  ease: 'elastic.out(1,0.5)', isRect: true, rw: 240, rh: 65 },
  ],

  links: [
    { id: 'lnk-ip-brain',     from: 'server-ip',        to: 'ai-brain',     color: COLORS.CYAN,   dash: true },
    { id: 'lnk-brain-wall',   from: 'ai-brain',         to: 'spider-wall',  color: COLORS.RED,    dash: false },
    { id: 'lnk-brain-whsp',   from: 'ai-brain',         to: 'cpu-whisper',  color: COLORS.ORANGE, dash: true },
    { id: 'lnk-hermes-sup',   from: 'hermes-brain',     to: 'supdata-api',  color: COLORS.GOLD,   dash: false, width: 3 },
    { id: 'lnk-sup-step1',    from: 'supdata-api',      to: 'step-1',       color: COLORS.CYAN,   dash: true },
    { id: 'lnk-step1-step2',  from: 'step-1',           to: 'step-2',       color: COLORS.BLUE,   dash: false },
    { id: 'lnk-step2-step3',  from: 'step-2',           to: 'step-3',       color: COLORS.GOLD,   dash: false },
    { id: 'lnk-hermes-obs',   from: 'hermes-brain',     to: 'obsidian-vault', color: COLORS.PURPLE, dash: false, width: 2.5 },
    { id: 'lnk-obs-token',    from: 'obsidian-vault',   to: 'token-usage',  color: COLORS.GREEN,  dash: true },
  ],

  scenes: [
    {
      id: 'scene-1', duration: 4.0,
      subtitle: '你有没有遇到过这种情况？',
      enterNodes: ['youtube-logo'],
      activeNodes: ['youtube-logo'],
      activeLinks: [],
      exitNodes:   [],
      fx: []
    },
    {
      id: 'scene-2', duration: 4.0,
      subtitle: '兴冲冲地把一个 YouTube 链接丢给 AI Agent，指望它能一键吐出逐字稿，再帮我们改成中文口播。',
      enterNodes: [],
      activeNodes: ['youtube-logo'],
      activeLinks: [],
      exitNodes:   [],
      fx: []
    },
    {
      id: 'scene-3', duration: 5.0,
      subtitle: '结果等了半个多小时，页面还在转圈，最后直接报错弹出一句：登录验证失败、请求超时，或者干脆卡死！',
      enterNodes: ['warning-card'],
      activeNodes: ['youtube-logo', 'warning-card'],
      activeLinks: [],
      exitNodes:   [],
      fx: [{ type: 'shatter', target: 'youtube-logo', at: 2.0 }, { type: 'pulse', target: 'warning-card', at: 3.5 }]
    },
    {
      id: 'scene-4', duration: 6.0,
      subtitle: '为什么会这样？很多人以为是 Agent 脑子不够用，或者提示词写得不够好。',
      enterNodes: ['ai-brain'],
      activeNodes: ['ai-brain'],
      activeLinks: [],
      exitNodes:   ['youtube-logo', 'warning-card'],
      fx: []
    },
    {
      id: 'scene-5', duration: 8.0,
      subtitle: '但我们踩完坑才发现，真正的问题是：我们让一个负责思考和编排任务的大脑，去硬刚一个专门防自动化爬虫的平台。',
      enterNodes: ['spider-wall'],
      activeNodes: ['ai-brain', 'spider-wall'],
      activeLinks: ['lnk-brain-wall'],
      exitNodes:   [],
      fx: [{ type: 'barrier', at: 1.5 }, { type: 'shake', target: 'ai-brain', at: 3.0 }]
    },
    {
      id: 'scene-6', duration: 9.0,
      subtitle: '我们用普通的云服务器 IP 去硬爬，没有真实登录态，结果就是 Agent 不断在换代理、验证码和死循环里打转，Token 疯狂燃烧，服务器直接卡死！',
      enterNodes: ['server-ip'],
      activeNodes: ['server-ip', 'ai-brain', 'spider-wall'],
      activeLinks: ['lnk-ip-brain', 'lnk-brain-wall'],
      exitNodes:   [],
      fx: [{ type: 'pulse', target: 'server-ip', at: 1.5 }]
    },
    {
      id: 'scene-7', duration: 5.0,
      subtitle: '最离谱的一次，是一个没有公开字幕的九分钟视频。',
      enterNodes: ['cpu-whisper'],
      activeNodes: ['ai-brain', 'cpu-whisper'],
      activeLinks: ['lnk-brain-whsp'],
      exitNodes:   ['server-ip', 'spider-wall'],
      fx: []
    },
    {
      id: 'scene-8', duration: 5.0,
      subtitle: 'Agent 为了拿到逐字稿，竟然默默地把整个音频下到我们本地，然后调用本地 Whisper 用 CPU 硬转！',
      enterNodes: [],
      activeNodes: ['ai-brain', 'cpu-whisper'],
      activeLinks: ['lnk-brain-whsp'],
      exitNodes:   [],
      fx: []
    },
    {
      id: 'scene-9', duration: 8.0,
      subtitle: '虽然最后转出来了，但整台服务器满载直接瘫痪了半小时。这直接验证了那一句话：方向不对，努力白费。',
      enterNodes: [],
      activeNodes: ['ai-brain', 'cpu-whisper'],
      activeLinks: ['lnk-brain-whsp'],
      exitNodes:   [],
      fx: [{ type: 'shatter', target: 'cpu-whisper', at: 2.5 }]
    },
    {
      id: 'scene-10', duration: 8.0,
      subtitle: '我们把“获取数据”和“理解数据”混成了一件事，这根本行不通！真正的解决方案是：把这两件事彻底解耦。',
      enterNodes: ['hermes-brain', 'supdata-api'],
      activeNodes: ['hermes-brain', 'supdata-api'],
      activeLinks: [],
      exitNodes:   ['ai-brain', 'cpu-whisper'],
      fx: []
    },
    {
      id: 'scene-11', duration: 8.0,
      subtitle: 'Agent 应该只负责“理解、筛选、加工”，而把“抓取、绕过反爬”这个最脏最累的活，交出去。',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'supdata-api'],
      activeLinks: [],
      exitNodes:   [],
      fx: []
    },
    {
      id: 'scene-12', duration: 11.0,
      subtitle: '所以我们把流水线重构了：让 Hermes 做大脑，让 Supdata API 负责数据入口。不让 Agent 去模拟浏览器，而是直接调度专门的 API。',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'supdata-api'],
      activeLinks: ['lnk-hermes-sup'],
      exitNodes:   [],
      fx: [{ type: 'neural-pulse', at: 2.0 }]
    },
    {
      id: 'scene-13', duration: 6.0,
      subtitle: '逻辑非常简单，一共分三步：',
      enterNodes: ['step-1', 'step-2', 'step-3'],
      activeNodes: ['hermes-brain', 'supdata-api', 'step-1', 'step-2', 'step-3'],
      activeLinks: ['lnk-hermes-sup', 'lnk-sup-step1', 'lnk-step1-step2', 'lnk-step2-step3'],
      exitNodes:   [],
      fx: []
    },
    {
      id: 'scene-14', duration: 8.0,
      subtitle: '第一步，别一上来就抓逐字稿。先让 Hermes 做轻量的元数据检索，拉取标题、播放量、点赞，按主题做个聚类。',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'supdata-api', 'step-1', 'step-2', 'step-3'],
      activeLinks: ['lnk-hermes-sup', 'lnk-sup-step1', 'lnk-step1-step2', 'lnk-step2-step3'],
      exitNodes:   [],
      fx: [{ type: 'pulse', target: 'step-1', at: 1.5 }]
    },
    {
      id: 'scene-15', duration: 7.0,
      subtitle: '第二步，我们在聚类结果里挑出数据最好、最值得做的 3 到 5 个视频。',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'supdata-api', 'step-1', 'step-2', 'step-3'],
      activeLinks: ['lnk-hermes-sup', 'lnk-sup-step1', 'lnk-step1-step2', 'lnk-step2-step3'],
      exitNodes:   [],
      fx: [{ type: 'pulse', target: 'step-2', at: 1.5 }]
    },
    {
      id: 'scene-16', duration: 10.0,
      subtitle: '第三步，把链接打包，直接调用 Supdata API。它会自动绕过反爬，秒级吐出中英对照的干净逐字稿。',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'supdata-api', 'step-1', 'step-2', 'step-3'],
      activeLinks: ['lnk-hermes-sup', 'lnk-sup-step1', 'lnk-step1-step2', 'lnk-step2-step3'],
      exitNodes:   [],
      fx: [{ type: 'pulse', target: 'step-3', at: 1.5 }]
    },
    {
      id: 'scene-17', duration: 8.0,
      subtitle: '最后，Hermes 重新接手，做翻译、结构拆解、提炼爆点，一键生成口播稿并写入我们的 Obsidian。',
      enterNodes: ['obsidian-vault'],
      activeNodes: ['hermes-brain', 'obsidian-vault'],
      activeLinks: ['lnk-hermes-obs'],
      exitNodes:   ['supdata-api', 'step-1', 'step-2', 'step-3'],
      fx: []
    },
    {
      id: 'scene-18', duration: 11.0,
      subtitle: '这样一拆，原来要卡死半小时的流程，现在 3 分钟内全部跑通，而且 Token 消耗降低了 80%，服务器平稳运行。',
      enterNodes: ['token-usage'],
      activeNodes: ['hermes-brain', 'obsidian-vault', 'token-usage'],
      activeLinks: ['lnk-hermes-obs', 'lnk-obs-token'],
      exitNodes:   [],
      fx: [{ type: 'gold-rain', at: 3.0 }]
    },
    {
      id: 'scene-19', duration: 7.0,
      subtitle: '记住一句话：不要让 Agent 硬爬，让 Agent 调度。',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'obsidian-vault'],
      activeLinks: ['lnk-hermes-obs'],
      exitNodes:   ['token-usage'],
      fx: [{ type: 'pulse', target: 'hermes-brain', at: 1.5 }]
    },
    {
      id: 'scene-20', duration: 11.0,
      subtitle: '如果我们也想把自媒体流水线做成自动化，避开这些爬虫深坑，评论区打“逐字稿”，我们把这套完整的 Hermes 指令和 Supdata 配置文件发给你！',
      enterNodes: [],
      activeNodes: ['hermes-brain', 'obsidian-vault'],
      activeLinks: ['lnk-hermes-obs'],
      exitNodes:   [],
      fx: [{ type: 'pulse', target: 'hermes-brain', at: 1.5 }]
    }
  ]
}

export const HERMES_EVOLVE_SCRIPT = {
  id: 'hermes_evolve_workflow',
  title: '你的AI助手正在悄悄进化',
  bgColor: 0x0b0d16,

  nodes: [
    // 场景 1
    { id: 'traditional-ai',   label: '传统 AI 工具',     subLabel: '(原地踏步/无记忆)', relX: -260, relY: -60, color: COLORS.GRAY,   radius: 55, ease: 'power4.out' },
    { id: 'user-evolution',   label: '你在进化',         subLabel: '(需求与认知提升)',  relX: -100, relY: 140, color: COLORS.RED,    radius: 45, ease: 'power4.out' },
    { id: 'hermes-discovery',  label: '★ Hermes Agent',  subLabel: '【改变AI认知】',    relX: 200,  relY: 40,  color: COLORS.GOLD,   radius: 70, ease: 'elastic.out(1,0.5)' },

    // 场景 2
    { id: 'daily-waste',       label: '每日 1 小时',       subLabel: '(重复劳动与损耗)',  relX: 0,    relY: -100, color: COLORS.RED,   radius: 65, ease: 'back.out(1.5)' },
    { id: 'tech-news',         label: '看科技新闻/邮件',   subLabel: '(无脑搜集)',        relX: -200, relY: 100,  color: COLORS.ORANGE, radius: 45, ease: 'power4.out' },
    { id: 'todo-spy',          label: '整理待办与竞品',    subLabel: '(手动跟踪)',        relX: 200,  relY: 100,  color: COLORS.ORANGE, radius: 45, ease: 'power4.out' },

    // 场景 3 & 4
    { id: 'search-box',        label: '传统对话框',       subLabel: '(用完即忘/零积累)', relX: -240, relY: 0,    color: COLORS.GRAY,   radius: 45, ease: 'power4.out' },
    { id: 'hermes-core',       label: 'Hermes 核心大脑',  subLabel: '【它在学你】',      relX: 100,  relY: 0,    color: COLORS.CYAN,   radius: 75, ease: 'elastic.out(1,0.6)', poly: true },
    { id: 'pillar-mem',        label: '持久记忆 Memory',  subLabel: '用户偏好与背景',    relX: 300,  relY: -140, color: COLORS.PURPLE, radius: 45, ease: 'power4.out' },
    { id: 'pillar-skill',      label: '自我进化 Skills',  subLabel: '工作流自动固化',    relX: 340,  relY: 0,    color: COLORS.GOLD,   radius: 45, ease: 'power4.out' },
    { id: 'pillar-cron',       label: '定时任务 Cron',    subLabel: '自动静默航行',      relX: 300,  relY: 140,  color: COLORS.GREEN,  radius: 45, ease: 'power4.out' },

    // 场景 4 细化展示
    { id: 'memory-system',     label: '1. 持久记忆',       subLabel: '(存背景免重复)',    relX: -240, relY: -80,  color: COLORS.PURPLE, radius: 55, ease: 'power4.out' },
    { id: 'skill-curator',     label: '2. Curator 进化',  subLabel: '(自动固化新技能)',  relX: 0,    relY: 100,  color: COLORS.GOLD,   radius: 60, ease: 'elastic.out(1,0.5)' },
    { id: 'cron-telegram',     label: '3. 自动巡航',       subLabel: '(早7:00定时推送)',  relX: 240,  relY: -80,  color: COLORS.GREEN,  radius: 55, ease: 'power4.out' },

    // 场景 5
    { id: 'obsidian-vault',    label: 'Obsidian 笔记库',  subLabel: '(双链与归档整理)',  relX: -240, relY: 40,   color: COLORS.PURPLE, radius: 65, ease: 'power4.out' },
    { id: 'hermes-bot',        label: 'Hermes 自动机',    subLabel: '(晚22:00自动构建)',  relX: 0,    relY: -80,  color: COLORS.CYAN,   radius: 60, ease: 'back.out(1.5)' },
    { id: 'result-board',      label: '自动化工作流成果',  subLabel: '睡觉干活 / 起床收成果', relX: 240, relY: 40,  color: COLORS.GOLD,   radius: 0,  ease: 'elastic.out(1,0.5)', isRect: true, rw: 240, rh: 65 },

    // 场景 6
    { id: 'open-source',       label: '100% 开源私有',    subLabel: '(数据本地掌控)',    relX: -240, relY: -60,  color: COLORS.GREEN,  radius: 52, ease: 'power4.out' },
    { id: 'multi-model',       label: '全模型无缝对接',    subLabel: '(本地/云端按需配置)', relX: 0,    relY: 100,  color: COLORS.CYAN,   radius: 60, ease: 'power4.out' },
    { id: 'zero-cost',         label: '零额外订阅费',      subLabel: '(把成本降到最低)',  relX: 240,  relY: -60,  color: COLORS.GOLD,   radius: 55, ease: 'elastic.out(1,0.5)' },

    // 场景 7
    { id: 'future-now',        label: 'Hermes Agent',     subLabel: '【它在学你 · 也是现在】', relX: 0,  relY: 0,   color: COLORS.GOLD,   radius: 80, ease: 'elastic.out(1,0.6)', poly: true }
  ],

  links: [
    { id: 'lnk-trad-user',   from: 'traditional-ai',   to: 'user-evolution',   color: COLORS.GRAY,   dash: true },
    { id: 'lnk-waste-news',  from: 'daily-waste',       to: 'tech-news',        color: COLORS.RED,    dash: true },
    { id: 'lnk-waste-spy',   from: 'daily-waste',       to: 'todo-spy',         color: COLORS.RED,    dash: true },
    { id: 'lnk-core-mem',    from: 'hermes-core',       to: 'pillar-mem',       color: COLORS.PURPLE, dash: true },
    { id: 'lnk-core-skill',  from: 'hermes-core',       to: 'pillar-skill',     color: COLORS.GOLD,   dash: true },
    { id: 'lnk-core-cron',   from: 'hermes-core',       to: 'pillar-cron',      color: COLORS.GREEN,  dash: true },
    { id: 'lnk-mem-curator', from: 'memory-system',     to: 'skill-curator',    color: COLORS.GOLD,   dash: true },
    { id: 'lnk-cur-cron',    from: 'skill-curator',     to: 'cron-telegram',    color: COLORS.GREEN,  dash: true },
    { id: 'lnk-obs-bot',     from: 'obsidian-vault',    to: 'hermes-bot',       color: COLORS.PURPLE, dash: true },
    { id: 'lnk-bot-res',     from: 'hermes-bot',        to: 'result-board',     color: COLORS.GOLD,   dash: false, width: 3 },
    { id: 'lnk-os-model',    from: 'open-source',       to: 'multi-model',      color: COLORS.CYAN,   dash: true },
    { id: 'lnk-model-cost',  from: 'multi-model',       to: 'zero-cost',        color: COLORS.GOLD,   dash: false, width: 3 }
  ],

  scenes: [
    {
      id: 'scene-1', duration: 6.8,
      subtitle: '你有没有用过一个AI工具，用了半年之后，它还是那个样子——不认识你，不记得你的习惯，每次都要重新解释？大多数AI工具就是这样。你在进化，它原地踏步。但我最近发现了一个东西，彻底改变了我对AI助手的认知。',
      enterNodes: ['traditional-ai', 'user-evolution', 'hermes-discovery'],
      activeNodes: ['traditional-ai', 'user-evolution', 'hermes-discovery'],
      activeLinks: ['lnk-trad-user'],
      exitNodes:   [],
      fx: [{ type: 'shatter', target: 'traditional-ai', at: 4.5 }, { type: 'pulse', target: 'hermes-discovery', at: 5.5 }]
    },
    {
      id: 'scene-2', duration: 6.2,
      subtitle: '我们来聊聊一个真实场景。早上起来，我们要花一个小时：看科技新闻、刷邮件、整理待办事项、盯着竞品更新——全是手动的，全是重复的，全在消耗我们最宝贵的注意力。你有没有想过，这些事情本来就不应该由人来做？',
      enterNodes: ['daily-waste', 'tech-news', 'todo-spy'],
      activeNodes: ['daily-waste', 'tech-news', 'todo-spy'],
      activeLinks: ['lnk-waste-news', 'lnk-waste-spy'],
      exitNodes:   ['user-evolution', 'hermes-discovery'],
      fx: [{ type: 'radar-scan', target: 'daily-waste', at: 2.0 }]
    },
    {
      id: 'scene-3', duration: 7.2,
      subtitle: '这里有个大坑。我们以为的AI助手，其实只是一个聪明的搜索框。你问它，它答你，然后它就忘了。但 Hermes Agent 不是这样工作的。它有三样东西是大多数AI工具都没有的：持久记忆、自我进化的技能库，还有定时自动执行的任务机器人。 简单说，你用它越多，它越懂你。不是你去学它——是它在学你。',
      enterNodes: ['search-box', 'hermes-core', 'pillar-mem', 'pillar-skill', 'pillar-cron'],
      activeNodes: ['search-box', 'hermes-core', 'pillar-mem', 'pillar-skill', 'pillar-cron'],
      activeLinks: ['lnk-core-mem', 'lnk-core-skill', 'lnk-core-cron'],
      exitNodes:   ['daily-waste', 'tech-news', 'todo-spy'],
      fx: [{ type: 'blast', target: 'search-box', at: 2.5 }, { type: 'neural-pulse', at: 4.0 }]
    },
    {
      id: 'scene-4', duration: 7.8,
      subtitle: '我们拿最核心的三个能力来说。第一，记忆系统。 它会把我们告诉它的偏好、工作风格、常用工具，全部存到记忆库里。下次对话不用重复背景，直接开干。第二，技能进化。 当我们反复做同一类任务，它会自动把这个流程固化成一个「技能」，下次一键调用，省掉所有重复操作。这个机制的名字叫 Curator，它在后台静默运行，不需要我们手动触发。第三，定时任务。 我们可以设置它每天早上七点，自动抓取AI新闻摘要，处理好了直接推送到 Telegram，我们起床就能看到——不花一分钱，用本地模型就能跑。',
      enterNodes: ['memory-system', 'skill-curator', 'cron-telegram'],
      activeNodes: ['memory-system', 'skill-curator', 'cron-telegram'],
      activeLinks: ['lnk-mem-curator', 'lnk-cur-cron'],
      exitNodes:   ['hermes-core', 'pillar-mem', 'pillar-skill', 'pillar-cron'],
      fx: [{ type: 'pulse', target: 'skill-curator', at: 3.5 }]
    },
    {
      id: 'scene-5', duration: 7.0,
      subtitle: '我自己是怎么用的？我把 Hermes 接了 Obsidian，它帮我整理每天的碎片笔记、归档口播素材，还会把行动任务自动推到任务看板。我设置了一个定时任务：每天晚上10点，它自动整理今天的新增笔记，分类存好，同步推送。我睡觉它在干活，我起床它汇报结果。这才是我们理解的那种"AI工作流"——不是锦上添花，是真的替我们省时间。',
      enterNodes: ['obsidian-vault', 'hermes-bot', 'result-board'],
      activeNodes: ['obsidian-vault', 'hermes-bot', 'result-board'],
      activeLinks: ['lnk-obs-bot', 'lnk-bot-res'],
      exitNodes:   ['memory-system', 'skill-curator', 'cron-telegram'],
      fx: [{ type: 'gold-rain', at: 3.5 }]
    },
    {
      id: 'scene-6', duration: 6.8,
      subtitle: '对比一下就很清楚了。普通AI工具：你问一次，它答一次，下次你还得重头解释。Hermes：你用一次，它学一次，下次比你更清楚你要什么。而且它是完全开源的，能接本地模型，能接 OpenAI、Claude、Gemini，你有多少预算，就配多少算力。最低成本，零订阅费，用自己的机器跑，数据完全在自己手里。',
      enterNodes: ['open-source', 'multi-model', 'zero-cost'],
      activeNodes: ['open-source', 'multi-model', 'zero-cost'],
      activeLinks: ['lnk-os-model', 'lnk-model-cost'],
      exitNodes:   ['obsidian-vault', 'hermes-bot', 'result-board'],
      fx: [{ type: 'neural-pulse', at: 3.0 }]
    },
    {
      id: 'scene-7', duration: 6.0,
      subtitle: '如果你现在还在用那种"问一次忘一次"的AI工具，我们建议你认真看一眼 Hermes。它不是未来，它就是现在。有一句话我觉得说得很准：大多数AI工具，你在学它。Hermes，是它在学你。',
      enterNodes: ['future-now'],
      activeNodes: ['future-now'],
      activeLinks: [],
      exitNodes:   ['open-source', 'multi-model', 'zero-cost'],
      fx: [{ type: 'pulse', target: 'future-now', at: 2.0 }]
    }
  ]
}

// 脚本 ID → 数据 Map
export const SCRIPT_MAP = {
  ai_audit_workflow:      AI_AUDIT_SCRIPT,
  ai_audit_sop_workflow:  AI_AUDIT_SOP_SCRIPT,
  agent_obsidian_workflow: AGENT_OBSIDIAN_SCRIPT,
  hermes_evolve_workflow:  HERMES_EVOLVE_SCRIPT,
  dont_scrape_workflow:    DONT_SCRAPE_SCRIPT,
}
