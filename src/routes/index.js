import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const basePath = '';

const routes = [
  {
    path: `/`,
    name: 'TestComponent1',
    component: () =>
      import('@/pages/Page1.vue').then((e) => {
        return e.default;
      }),
  },
  {
    path: `TestComponent2`,
    name: 'TestComponent2',
    component: () =>
      import('@/pages/Page2.vue').then((e) => {
        return e.default;
      }),
  },
  {
    path: `sns-layer`,
    name: 'SNSLayerTest',
    component: () =>
      import('@/pages/SNSLayerTest.vue').then((e) => {
        return e.default;
      }),
  },

  // {
  //   path: ``,
  //   name: 'layout',
  //   redirect: `${basePath}/main`,
  //   component: () => {
  //     return import('@/pages/Layout.vue').then((e) => {
  //       return e.default;
  //     });
  //   },
  //   children: [
  //     {
  //       path: '/',
  //       name: 'main',
  //       component: () =>
  //         import('@/pages/Main.vue').then((e) => {
  //           return e.default;
  //         }),
  //     },
  //     {
  //       path: 'admin/member',
  //       name: 'adminMember',
  //       component: () =>
  //         import('@/pages/admin/Member.vue').then((e) => {
  //           return e.default;
  //         }),
  //     },
  //   ],
  // },
  {
    path: `*`,
    name: '404',
    component: () =>
      import('@/pages/NotFound.vue').then((e) => {
        return e.default;
      }),
  },
];

for (let i = 0; i < routes.length; i++) {
  routes[i].path = `${basePath}/${routes[i].path}`;
}

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes: routes,
});

export default router;
