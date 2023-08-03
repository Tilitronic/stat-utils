import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'summaryMeasures',
        component: () => import('pages/summaryMeasures.vue'),
      },
      {
        path: 'main',
        component: () => import('pages/MainAnalysisPage/MainAnalysisPage.vue'),
      },
      {
        path: 'qvs',
        component: () => import('src/pages/virtualScrollTable.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
