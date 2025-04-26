import { createRouter, createWebHistory } from 'vue-router'
import overview from '@/views/overview/index.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/overview',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/overview',
      name: 'overview',
      component: overview,
      meta: {
        keepAlive: true,
      },
    },
    {
      path: '/devices',
      name: 'devices',
      component: () => import('@/views/devices/index/index.vue'),
    },
    {
      path: '/deviceInfo',
      name: 'deviceInfo',
      component: () => import('@/views/devices/deviceInfo/index.vue'),
    },
    {
      path: '/notification',
      name: 'notification',
      component: () => import('@/views/notification/index.vue'),
    },
    {
      path: '/topo',
      name: 'topo',
      component: () => import('@/views/topo/index.vue'),
    },
    // {
    //   path: '/accout',
    //   name: 'accout',
    //   component: () => import('@/views/accout/index.vue'),
    // },
  ],
})

export default router
