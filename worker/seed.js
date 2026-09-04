import { hashPassword } from './auth.js';

const HOME_ICONS = [
  { title: '我要办税', icon: '/seed/icon-tax.png', sortOrder: '1' },
  { title: '我要查询', icon: '/seed/icon-search.png', sortOrder: '2' },
  { title: '公众服务', icon: '/seed/icon-public.png', sortOrder: '3' },
];

const MY_ICONS = [
  { title: '个人信息', icon: '/seed/icon-user.png', sortOrder: '1' },
  { title: '任职受雇信息', icon: '/seed/icon-company.png', sortOrder: '2' },
  { title: '家庭成员信息', icon: '/seed/icon-family.png', sortOrder: '3' },
  { title: '银行卡', icon: '/seed/icon-card.png', sortOrder: '4' },
  { title: '办税授权', icon: '/seed/icon-auth.png', sortOrder: '5' },
  { title: '消息订阅', icon: '/seed/icon-bell.png', sortOrder: '10' },
];

const TAX_ICONS = [
  {
    type: 2,
    modeClassify: '证明开具',
    list: [
      { title: '纳税记录开具', icon: '/seed/icon-nsjl.png', sortOrder: '1' },
      { title: '完税证明开具', icon: '/seed/icon-wszm.png', sortOrder: '2' },
    ],
  },
  {
    type: 2,
    modeClassify: '税费申报',
    list: [
      { title: '综合所得年度汇算', icon: '/seed/icon-ndhs.png', sortOrder: '1' },
      { title: '专项附加扣除填报', icon: '/seed/icon-zxfj.png', sortOrder: '2' },
    ],
  },
];

const SERVICE_ICONS = [
  {
    type: 3,
    modeClassify: '申报信息查询',
    list: [
      { title: '申报查询', icon: '/seed/icon-sbcx.png', sortOrder: '1' },
      { title: '专项附加扣除信息查询', icon: '/seed/icon-family-grid.png', sortOrder: '2' },
      { title: '收入纳税明细查询', icon: '/seed/icon-srns.png', sortOrder: '3' },
    ],
  },
  {
    type: 3,
    modeClassify: '备案信息查询',
    list: [
      { title: '税收优惠备案查询', icon: '/seed/icon-ssyh.png', sortOrder: '1' },
    ],
  },
  {
    type: 3,
    modeClassify: '其他查询',
    list: [
      { title: '纳税记录申请查询', icon: '/seed/icon-nsjl.png', sortOrder: '1' },
    ],
  },
];

export async function createDefaultStore() {
  const passwordHash = await hashPassword('123456');
  return {
    users: [
      {
        id: 'user-demo',
        username: '19673239497',
        passwordHash,
        realname: '张三',
        phone: '19673239497',
        avatar: '/seed/avatar-demo.png',
        idCard: '110101199001011234',
        birthday: '1990-01-01',
        sex: 1,
        nationality: '中华人民共和国',
        education: 2,
        nation: 1,
        email: 'zhangsan@example.com',
        addrVOList: [
          {
            addrType: '1',
            area: '110105',
            areaName: '北京市朝阳区',
            detailed: '示范路 1 号',
          },
        ],
      },
    ],
    swipers: [
      { id: 'swipe-1', picture: '/seed/banner-1.png' },
      { id: 'swipe-2', picture: '/seed/banner-2.png' },
      { id: 'swipe-3', picture: '/seed/banner-3.png' },
    ],
    icons: [{ type: 1, list: HOME_ICONS }, ...TAX_ICONS, ...SERVICE_ICONS, { type: 4, list: MY_ICONS }],
    businesses: [
      {
        id: 'biz-1',
        title: '综合所得年度汇算',
        description: '办理上一年度综合所得汇算清缴',
        icon: '/seed/icon-ndhs.png',
      },
      {
        id: 'biz-2',
        title: '专项附加扣除填报',
        description: '填报子女教育、住房租金等扣除',
        icon: '/seed/icon-zxfj.png',
      },
      {
        id: 'biz-3',
        title: '收入纳税明细查询',
        description: '查询工资薪金等纳税明细',
        icon: '/seed/icon-srns.png',
      },
      {
        id: 'biz-4',
        title: '纳税记录开具',
        description: '开具个人所得税纳税记录',
        icon: '/seed/icon-nsjl.png',
      },
    ],
    hotIssues: [
      { id: 'hot-1', title: '年度汇算什么时候开始办理？' },
      { id: 'hot-2', title: '专项附加扣除如何修改？' },
      { id: 'hot-3', title: '收入纳税明细里的扣缴义务人是什么？' },
    ],
    images: [{ code: 'A005', image: '/seed/topic.png', title: '年度汇算专题' }],
    areas: [
      {
        code: '110000',
        name: '北京市',
        indexCode: 'B',
        children: [
          {
            code: '110100',
            name: '市辖区',
            indexCode: 'S',
            children: [
              { code: '110101', name: '东城区', indexCode: 'D' },
              { code: '110105', name: '朝阳区', indexCode: 'C' },
            ],
          },
        ],
      },
      {
        code: '310000',
        name: '上海市',
        indexCode: 'S',
        children: [
          {
            code: '310100',
            name: '市辖区',
            indexCode: 'S',
            children: [
              { code: '310101', name: '黄浦区', indexCode: 'H' },
              { code: '310115', name: '浦东新区', indexCode: 'P' },
            ],
          },
        ],
      },
    ],
    dicts: {
      nation: [
        { text: '汉族', value: 1 },
        { text: '回族', value: 2 },
        { text: '满族', value: 3 },
      ],
      education: [
        { text: '高中', value: 1 },
        { text: '本科', value: 2 },
        { text: '硕士', value: 3 },
      ],
    },
    companies: [
      {
        id: 'company-1',
        userId: 'user-demo',
        companyName: '示例科技有限公司',
        creditCode: '91110000MA0000001X',
        post: '软件工程师',
        employmentPeriod: '2021-03-01',
        departureDate: '',
      },
    ],
    taxableYears: ['2022', '2023', '2024', '2025'],
    categories: {
      A02: [
        { title: '工资薪金所得', value: 'wage' },
        { title: '劳务报酬所得', value: 'labor' },
        { title: '稿酬所得', value: 'royalty' },
      ],
    },
    taxableIncomes: [
      {
        id: 'income-1',
        userId: 'user-demo',
        annual: '2022',
        incomeType: '工资薪金所得',
        incomeTypeValue: 'wage',
        incomeCategory: '正常工资薪金',
        obligorName: '示例科技有限公司',
        dutyParagraph: '91110000MA0000001X',
        taxAuthority: '国家税务总局北京市朝阳区税务局',
        declareChannel: '扣缴义务人申报',
        declareDate: '2022-12-08',
        taxationDate: '2022-11',
        credit: '18000.00',
        taxDeclared: '540.00',
        exemptIncome: '0.00',
        deductingExpenses: '5000.00',
        specialDeduction: '1200.00',
        otherDeductions: '0.00',
        grantDeduction: '0.00',
        list: [
          { id: 'sd-1', deductionType: '养老保险', money: '800.00' },
          { id: 'sd-2', deductionType: '医疗保险', money: '400.00' },
        ],
      },
      {
        id: 'income-2',
        userId: 'user-demo',
        annual: '2022',
        incomeType: '劳务报酬所得',
        incomeTypeValue: 'labor',
        incomeCategory: '一般劳务报酬',
        obligorName: '示例咨询工作室',
        dutyParagraph: '91110000MA0000002Y',
        taxAuthority: '国家税务总局北京市东城区税务局',
        declareChannel: '扣缴义务人申报',
        declareDate: '2022-08-10',
        taxationDate: '2022-07',
        credit: '6000.00',
        taxDeclared: '240.00',
        exemptIncome: '0.00',
        deductingExpenses: '1200.00',
        specialDeduction: '0.00',
        otherDeductions: '0.00',
        grantDeduction: '0.00',
        list: [],
      },
    ],
  };
}

export const COLLECTION_KEYS = [
  'users',
  'swipers',
  'icons',
  'businesses',
  'hotIssues',
  'images',
  'areas',
  'dicts',
  'companies',
  'taxableYears',
  'categories',
  'taxableIncomes',
];
