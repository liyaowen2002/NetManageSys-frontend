<template>
  <div style="display: flex; flex-direction: column">
    <el-page-header style="margin: 15px" @back="backRouter">
      <template #content>
        <span> {{ devicesStore.getDevicesListById().value[deviceId].name }} </span>
      </template>
      <template #title>
        <span>返回</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="openNewTabForTopo">查看拓扑图</el-button>
        <el-button
          type="danger"
          @click="
            removeDeviceDialogRef.openRemoveDialog(
              deviceId,
              devicesStore.getDevicesListById().value[deviceId].name,
            )
          "
          >移除此设备</el-button
        >
      </template>
    </el-page-header>

    <div style="flex: 1; box-sizing: border-box; padding: 0px 15px 15px 15px">
      <el-tabs tab-position="left" type="border-card" style="height: 100%; flex: 1">
        <el-tab-pane label="概况">
          <overviewTab :deviceId="deviceId" />
        </el-tab-pane>
        <el-tab-pane label="硬件">
          <hardwareTab :deviceId="deviceId" />
        </el-tab-pane>
        <el-tab-pane label="接口">
          <interfaceTab :deviceId="deviceId" />
        </el-tab-pane>
        <el-tab-pane label="路由">
          <routeTab :deviceId="deviceId" />
        </el-tab-pane>
        <el-tab-pane label="ARP">
          <arpTab :deviceId="deviceId" />
        </el-tab-pane>
        <!-- 不知道为什么这里用v-auth="'administrator'"不生效 -->
        <el-tab-pane label="SSH" v-if="accoutInfo.role === 'administrator'">
          <sshTab :deviceId="deviceId" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <removeDeviceDialog ref="removeDeviceDialogRef"></removeDeviceDialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import overviewTab from './components/overviewTab.vue'
import interfaceTab from './components/interfaceTab.vue'
import routeTab from './components/routeTab.vue'
import arpTab from './components/arpTab.vue'
import hardwareTab from './components/hardwareTab.vue'
import sshTab from './components/sshTab.vue'
import removeDeviceDialog from './components/removeDeviceDialog.vue'
import { useRouter, useRoute } from 'vue-router'
import { useDevicesStore } from '@/stores/devices'
import { useAccoutStore } from '@/stores/accout'
const accoutInfo = useAccoutStore()
const devicesStore = useDevicesStore()
const router = useRouter()
const route = useRoute()
const removeDeviceDialogRef = ref()
const deviceId = Number(route.query.id)

const backRouter = () => {
  router.back()
}
const openNewTabForTopo = () => {
  const fullPath = window.location.origin + '/topo'
  window.open(fullPath)
}
</script>
<style lang="less" scoped></style>
