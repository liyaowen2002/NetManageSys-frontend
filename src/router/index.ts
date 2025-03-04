import { createRouter, createWebHistory } from 'vue-router'
import overview from '@/views/overview/index.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/overview',
      name: 'overview',
      component: overview,
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
      name: 'tpop',
      component: () => import('@/views/topo/index.vue'),
    },
  ],
})

export default router
