<script setup lang="ts">
import { ref } from 'vue'
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
        <div style="font-weight: bold" class="el-menu-item" @click="router.replace('/overview')">
          NetManageSys
        </div>
        <el-switch
          v-model="isDark"
          @change="toggleDark"
          style="height: 100%; margin: 0px 20px"
          inline-prompt
          active-icon="Moon"
          inactive-icon="Sunny"
        />
        <el-menu-item index="overview">园区总览</el-menu-item>
        <el-menu-item index="topo">设备拓扑</el-menu-item>
        <el-menu-item index="devices"> 设备列表 </el-menu-item>
        <el-menu-item index="notification"> 查看通知 </el-menu-item>
        <el-menu-item @click="quitAccout()"> 退出系统 </el-menu-item>
      </el-menu>

      <RouterView style="flex: 1; overflow: hidden" />
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
</style>
