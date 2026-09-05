export default [
  {
    path: '/function-search',
    name: 'FunctionSearch',
    component: () => import('@/views/home/functionSearch/index.vue'),
  },
  // 首页-我要查询
  {
    path: '/ineedsearch',
    name: 'INeedSearch',
    component: () => import('@/views/home/homeSearch/index.vue'),
  },
  // 首页-公众服务
  {
    path: '/publicservice',
    name: 'PublicService',
    component: () => import('@/views/home/publicService/index.vue'),
  },
];
