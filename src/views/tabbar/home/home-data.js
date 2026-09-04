/* 最新版首页静态文案与官方设计资源（从 library/origin 精选并裁切到 /seed/home-v2/）。 */
export const HOME_ASSETS = {
  scan: '/seed/home-v2/icon-scan.svg',
  fire: '/seed/home-v2/icon-fire.svg',
  hero: '/seed/home-v2/hero-annual.png',
  heroEnter: '/seed/home-v2/hero-enter.png',
  deductBg: '/seed/home-v2/deduct-bg.png',
  oldYoung: '/seed/home-v2/banner-old-young.png',
  taxMemory: '/seed/home-v2/banner-tax-memory.png',
  avatarA: '/seed/home-v2/avatar-a.png',
  avatarB: '/seed/home-v2/avatar-b.png',
};

export const NOTICE_TEXT = '国家税务总局关于《个人所得税综合所得汇算清缴管理办法》的公告';

export const QUICK_CARDS = [
  {
    id: 'annual',
    title: '综合所得年度汇算',
    desc: '申报与查询综合所得年度汇算',
    action: '去申报',
    tone: 'blue',
    icon: '/seed/home-v2/icon-card-calc.png',
    routeName: 'EmptyPage',
  },
  {
    id: 'income',
    title: '收入纳税明细',
    desc: '查看个人所得税纳税明细',
    action: '去查询',
    tone: 'purple',
    icon: '/seed/home-v2/icon-card-wallet.png',
    routeName: 'TaxDeatilsSearch',
  },
  {
    id: 'record',
    title: '纳税记录开具',
    desc: '生成或查看纳税记录',
    action: '去开具',
    tone: 'teal',
    icon: '/seed/home-v2/icon-card-record.png',
    routeName: 'HtRecordsOpener',
  },
  {
    id: 'more',
    title: '更多功能',
    desc: '设置在首页显示的常用功能',
    action: '去设置',
    tone: 'blue',
    icon: '/seed/home-v2/icon-card-more.png',
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
      image: '/seed/home-v2/news-warning-1.png',
      side: 'right',
    },
    {
      id: 'w2',
      title: '获取退税想及时 准确卡号必须有',
      date: '2025-02-28',
      image: '/seed/home-v2/news-warning-2.png',
      side: 'right',
    },
    {
      id: 'w3',
      title: '未依法办理个人所得税综合所得汇算清缴案件',
      date: '2025-02-20',
      image: '/seed/home-v2/news-warning-3.png',
      side: 'left',
    },
  ],
  notice: [
    {
      id: 'n1',
      title: '国家税务总局关于办理2025年度个人所得税综合所得汇算清缴事项的公告',
      date: '2025-02-21',
      image: '/seed/home-v2/news-notice-1.png',
      side: 'right',
    },
    {
      id: 'n2',
      title: '关于《个人所得税综合所得汇算清缴管理办法》的解读',
      date: '2025-02-26',
      image: '/seed/home-v2/news-notice-2.png',
      side: 'right',
    },
  ],
  hot: [
    {
      id: 'h1',
      title: '年度汇算什么时候开始办理？',
      date: '2025-03-01',
      image: '/seed/home-v2/news-hot-1.png',
      side: 'right',
    },
    {
      id: 'h2',
      title: '专项附加扣除如何修改？',
      date: '2025-03-01',
      image: '/seed/home-v2/news-hot-2.png',
      side: 'right',
    },
  ],
  policy: [
    {
      id: 'p1',
      title: '一老一小三项专项附加扣除标准提高政策解读',
      date: '2025-01-15',
      image: '/seed/home-v2/news-policy-1.png',
      side: 'right',
    },
    {
      id: 'p2',
      title: '综合所得年度汇算政策要点速览',
      date: '2025-02-21',
      image: '/seed/home-v2/news-policy-2.png',
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
