// 引入全局css
import './styles/global.less'
// 解决element的message显示异常
import 'element-plus/dist/index.css'
// 深色模式支持
import 'element-plus/theme-chalk/dark/css-vars.css'
// 自定义深色css文件
import '@/styles/dark.less'

// app
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

// pinina
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)
// 增加sotre的reset支持
pinia.use(({ store }) => {
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$reset = () => {
    store.$patch(initialState)
  }
})
// pinia数据持久化
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
pinia.use(piniaPluginPersistedstate)

// router
import router from './router'
app.use(router)

// 引入icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 根据是否有token跳转到对应页面
import { initWhenBack } from './api/http/login'
import { useDevicesStore } from '@/stores/devices'
import { initWebSocket, sendMessage } from './api/ws/notification'
const devicesStore = useDevicesStore()
// 判断是否已有token，跳转到对应的页面
if (localStorage.getItem('authToken')) {
  try {
    await initWhenBack()
    await initWebSocket()
    await devicesStore.updateDevicesList()
    // router.replace('/overview')
  } catch (error) {
    console.error(error)
  }
} else {
  router.replace('/login')
}

// 注册鉴权指令
import authDirective from '@/directives/auth'
app.directive('auth', authDirective)

// 准备好一切后再挂载
app.mount('#app')
