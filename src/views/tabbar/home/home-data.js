/* 最新版首页静态文案与占位资源。
 * 路径以 /seed/home-v2/ 开头的文件目前是 SVG 占位图，
 * 可用官方 PNG/JPG 按同名替换（改后缀时同步改这里）。
 */
export const HOME_ASSETS = {
  scan: '/seed/home-v2/icon-scan.svg',
  fire: '/seed/home-v2/icon-fire.svg',
  hero: '/seed/home-v2/hero-annual.svg',
  oldYoung: '/seed/home-v2/banner-old-young.svg',
  taxMemory: '/seed/home-v2/banner-tax-memory.svg',
  avatarA: '/seed/avatar-demo.png',
  avatarB: '/seed/library/avatar/woman.png',
};

export const NOTICE_TEXT = '国家税务总局关于《个人所得税综合所得汇算清缴管理办法》的公告';

export const QUICK_CARDS = [
  {
    id: 'annual',
    title: '综合所得年度汇算',
    desc: '申报与查询综合所得年度汇算',
    action: '去申报',
    tone: 'blue',
    icon: '/seed/home-v2/icon-card-calc.svg',
    routeName: 'EmptyPage',
  },
  {
    id: 'income',
    title: '收入纳税明细',
    desc: '查看个人所得税纳税明细',
    action: '去查询',
    tone: 'purple',
    icon: '/seed/home-v2/icon-card-wallet.svg',
    routeName: 'TaxDeatilsSearch',
  },
  {
    id: 'record',
    title: '纳税记录开具',
    desc: '生成或查看纳税记录',
    action: '去开具',
    tone: 'teal',
    icon: '/seed/home-v2/icon-card-record.svg',
    routeName: 'HtRecordsOpener',
  },
  {
    id: 'more',
    title: '更多功能',
    desc: '设置在首页显示的常用功能',
    action: '去设置',
    tone: 'blue',
    icon: '/seed/home-v2/icon-card-more.svg',
    routeName: 'HandleTax',
  },
];

export const NEWS_TABS = [
  { key: 'warning', label: '警示案例' },
  { key: 'notice', label: '通知公告' },
  { key: 'hot', label: '热点问题' },
  { key: 'policy', label: '政策解读' },
];

export const NEWS_MAP = {
  warning: [
    {
      id: 'w1',
      title: '办理汇算想便捷 APP密码要记牢',
      date: '2025-02-28',
      image: '/seed/home-v2/news-warning-1.svg',
      side: 'right',
    },
    {
      id: 'w2',
      title: '获取退税想及时 准确卡号必须有',
      date: '2025-02-28',
      image: '/seed/home-v2/news-warning-2.svg',
      side: 'right',
    },
    {
      id: 'w3',
      title: '未依法办理个人所得税综合所得汇算清缴案件',
      date: '2025-02-20',
      image: '/seed/home-v2/news-warning-3.svg',
      side: 'left',
    },
  ],
  notice: [
    {
      id: 'n1',
      title: '国家税务总局关于办理2025年度个人所得税综合所得汇算清缴事项的公告',
      date: '2025-02-21',
      image: '/seed/library/public/notice-card-1.png',
      side: 'right',
    },
    {
      id: 'n2',
      title: '关于《个人所得税综合所得汇算清缴管理办法》的解读',
      date: '2025-02-26',
      image: '/seed/library/public/notice.png',
      side: 'right',
    },
  ],
  hot: [
    {
      id: 'h1',
      title: '年度汇算什么时候开始办理？',
      date: '2025-03-01',
      image: '/seed/library/public/hot-card-1.png',
      side: 'right',
    },
    {
      id: 'h2',
      title: '专项附加扣除如何修改？',
      date: '2025-03-01',
      image: '/seed/library/public/hot-card-1.png',
      side: 'right',
    },
  ],
  policy: [
    {
      id: 'p1',
      title: '一老一小三项专项附加扣除标准提高政策解读',
      date: '2025-01-15',
      image: '/seed/library/public/policy-card-1.png',
      side: 'right',
    },
    {
      id: 'p2',
      title: '综合所得年度汇算政策要点速览',
      date: '2025-02-21',
      image: '/seed/library/public/policy.png',
      side: 'right',
    },
  ],
};

export const SEARCH_FUNCTIONS = [
  { title: '综合所得年度汇算', routeName: 'EmptyPage' },
  { title: '专项附加扣除填报', routeName: 'EmptyPage' },
  { title: '收入纳税明细', routeName: 'TaxDeatilsSearch' },
  { title: '纳税记录开具', routeName: 'HtRecordsOpener' },
  { title: '申报查询', routeName: 'DeclarationQuery' },
  { title: '我要办税', routeName: 'HandleTax' },
  { title: '我要查询', routeName: 'INeedSearch' },
  { title: '公众服务', routeName: 'PublicService' },
];
