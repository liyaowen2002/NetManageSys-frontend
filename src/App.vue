<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAccoutStore } from './stores/accout'
import { closeWebSocket } from './api/ws/notification'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useDark, useToggle } from '@vueuse/core'

const accoutInfo = useAccoutStore()
const router = useRouter()
const currentRoute = ref(router.currentRoute)

const isDark = useDark()
const toggleDark = () => useToggle(isDark)

function quitAccout() {
  localStorage.removeItem('authToken')
  accoutInfo.$reset()
  closeWebSocket()
  router.replace('/login')
}
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div style="height: 100vh; width: 100vw; display: flex; flex-direction: column">
      <el-menu
        v-if="currentRoute.fullPath !== '/login'"
        mode="horizontal"
        :default-active="$route.name"
        :router="true"
        :ellipsis="false"
        background-color="#F9F9F9"
        active-text-color="#606266"
      >
        <div class="el-menu-item" @click="router.replace('/overview')">
          <span style="font-weight: bold; color: var(--Primary-Text); margin-right: 10px"
            >NetManageSys</span
          >
          <span style="font-weight: bold; color: var(--Regular-Text); letter-spacing: 3px"
            >园区网络设备管理系统</span
          >
        </div>
        <div class="el-menu-item">
          🌙 夜间模式
          <el-switch
            v-model="isDark"
            @change="toggleDark"
            style="height: 100%; width: 30px; margin: 0px 10px"
            inline-prompt
            active-icon="Moon"
            inactive-icon="Sunny"
          />
        </div>
        <!-- <el-menu-item index="accout">🙂 我的账号</el-menu-item> -->
        <el-menu-item index="overview">🏢 园区总览</el-menu-item>
        <el-menu-item index="topo">⛓️ 拓扑管理</el-menu-item>
        <el-menu-item index="devices">🖥️ 设备列表 </el-menu-item>
        <el-menu-item index="notification">📢 通知管理</el-menu-item>
        <el-menu-item @click="quitAccout()">⏏️ 退出系统</el-menu-item>
      </el-menu>

      <transition name="routerViewSlide">
        <RouterView style="flex: 1; overflow: hidden"
      /></transition>

      <!-- <RouterView v-slot="{ Component, route }">
        <Transition name="routerViewSlide">
          <component :is="Component" :key="route.path" style="flex: 1; overflow: hidden">
          </component>
        </Transition>
      </RouterView> -->
    </div>
  </el-config-provider>
</template>
<style lang="less" scoped>
.el-menu--horizontal {
  --el-menu-horizontal-height: var(--menu-height);
}
.el-menu {
  background-color: transparent;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.05);
}
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  color: #606266;
}
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

.routerViewSlide-enter-from {
  transform: scale(0.98); /* 左侧外面 */
  opacity: 0.5;
}
.routerViewSlide-enter-active {
  transition:
    transform 0.35s ease-in-out,
    opacity 0.5s ease-in-out;
}
.routerViewSlide-enter-to {
  transform: scale(1); /* 右侧外面 */
  opacity: 1;
}

// .routerViewSlide-leave-from {
//   transform: scale(1); /* 右侧外面 */
//   opacity: 1;
// }

// .routerViewSlide-leave-active {
//   transition:
//     transform 0.35s ease-in-out,
//     opacity 0.5s ease-in-out;
// }

// .routerViewSlide-leave-to {
//   display: none;
//   transform: scale(0.98); /* 左侧外面 */
//   opacity: 0;
// }
</style>
