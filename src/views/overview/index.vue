<template>
  <div style="position: relative; height: 100%; width: 100%; overflow: hidden">
    <transition name="infoContainer">
      <infoContainer
        v-show="showInfo"
        :notificationCountByLevel="notificationCountByLevel"
        @updateNotification="getNotificationsCounts"
        :timeCount="timeCount"
      />
    </transition>

    <transition name="slide-fade">
      <buildModal
        v-show="showModal"
        ref="buildModalRef"
        @closeModalAndExitView="closeModalAndExitView"
        :notificationCountByLocation="notificationCountByLocation"
      />
    </transition>

    <threeMap
      ref="threeMapRef"
      @closeModalOnly="closeModalOnly"
      @openModal="openModal"
      @getInfoToUpdate="getInfoToUpdate"
      :notificationCountByLocation="notificationCountByLocation"
    ></threeMap>

    <transition name="topoPreview">
      <topoPreviweModal
        v-show="showTopo"
        ref="topoPreviweModalRef"
        @enterTopoView="enterTopoView"
        @leaveTopoView="leaveTopoView"
        @highLightBuilding="highLightBuilding"
        @quitHighLightBuilding="quitHighLightBuilding"
      ></topoPreviweModal>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, onMounted } from 'vue'
import infoContainer from './components/infoContainer.vue'
import buildModal from './components/buildModal.vue'
import threeMap from './components/threeMap.vue'
import topoPreviweModal from './components/topoPreviweModal.vue'
import { getUnreadCountByLevel, getSetupTimestamp } from '@/api/http/overview'
import { useDevicesStore } from '@/stores/devices'
import { buildingNameENGtoCHN } from '@/utils/format'

const devicesStore = useDevicesStore()
const showModal = ref(false)
const showInfo = ref(true)
const showTopo = ref(true)
const threeMapRef = ref()
const buildModalRef = ref()
const topoPreviweModalRef = ref()
const notificationCountByLevel = ref({
  errorCount: 0,
  warningCount: 0,
  normalCount: 0,
  successCount: 0,
  totalCount: 0,
})

// 计时器相关
const timeCount = ref({
  date: '0000/00/00',
  hours: 0,
  minutes: 0,
  seconds: 0,
})
let setupTimestamp: null | number = null
let timerId: ReturnType<typeof setInterval> | null = null

const notificationCountByLocation = ref({})
const closeModalOnly = () => {
  showModal.value = false
  showInfo.value = true
  showTopo.value = true
}
const closeModalAndExitView = () => {
  showModal.value = false
  showInfo.value = true
  showTopo.value = true
  threeMapRef.value.exitViewBuilding()
}
const openModal = () => {
  showModal.value = true
  showInfo.value = false
  showTopo.value = false
}
const getInfoToUpdate = (buildingName: string) => {
  buildModalRef.value.getInfoToUpdate(buildingName)
}
const enterTopoView = () => {
  showInfo.value = false
  threeMapRef.value.enterTopoView()
}
const leaveTopoView = () => {
  showInfo.value = true
  threeMapRef.value.leaveTopoView()
}
let isIngTopoHighLight = false
const highLightBuilding = (deviceId) => {
  // 先判断拓扑图里的设备有没有对应到系统里的设备
  const deviceInfo = devicesStore.getDevicesListById().value[deviceId]
  if (deviceInfo) {
    // 再判断这个设备的建筑有没有在地图中
    if (buildingNameENGtoCHN[deviceInfo.location]) {
      threeMapRef.value.highLightTopo(deviceInfo.location)
      isIngTopoHighLight = true
    }
  }
}
const quitHighLightBuilding = () => {
  if (isIngTopoHighLight === true) {
    threeMapRef.value.quitHighLightTopo()
    isIngTopoHighLight = false
  }
}
// 获取未读通知数量并按等级统计
const getNotificationsCounts = async () => {
  try {
    const response = await getUnreadCountByLevel() // 假设你需要传递用户ID
    if (response) {
      notificationCountByLevel.value.errorCount = response.data.byLevel.error || 0
      notificationCountByLevel.value.warningCount = response.data.byLevel.warning || 0
      notificationCountByLevel.value.normalCount = response.data.byLevel.normal || 0 // 假设你有信息类型的日志
      notificationCountByLevel.value.successCount = response.data.byLevel.success || 0
      notificationCountByLevel.value.totalCount = response.data.byLevel.total || 0

      notificationCountByLocation.value = response.data.byLocation
      console.log(notificationCountByLocation.value)
    }
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

const getAndSetSetupTimestamp = async () => {
  const response = await getSetupTimestamp()
  if (response.type === 'success') {
    setupTimestamp = response.data.setupTimestamp
    if (setupTimestamp === null) return
    const date = new Date(setupTimestamp) // 转换为日期对象
    timeCount.value.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    updateTimeCount()
    // 每秒更新一次
    timerId = setInterval(updateTimeCount, 1000)
  }
}
const updateTimeCount = () => {
  if (setupTimestamp === null) return
  const currentTimestamp = Date.now() // 获取当前时间
  let elapsedMilliseconds = currentTimestamp - setupTimestamp // 计算时间差（毫秒）
  timeCount.value.hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60))
  elapsedMilliseconds %= 1000 * 60 * 60 // 计算剩余毫秒数

  timeCount.value.minutes = Math.floor(elapsedMilliseconds / (1000 * 60))
  elapsedMilliseconds %= 1000 * 60 // 计算剩余毫秒数

  timeCount.value.seconds = Math.floor(elapsedMilliseconds / 1000)
}

// 在组件挂载时调用一次数据获取方法
const init = () => {
  getNotificationsCounts()
  getAndSetSetupTimestamp()
}

init()

onUnmounted(() => {
  clearInterval(timerId)
})
</script>
<style scoped lang="less">
// /* 弹窗离开时的状态（从右侧外部离开） */
.topoPreview-enter-to,
.topoPreview-leave-from,
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0%); /* 右侧外面 */
}
.topoPreview-enter-active,
.topoPreview-leave-active,
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease-in-out;
}
.topoPreview-enter-from,
.topoPreview-leave-to,
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%); /* 左侧外面 */
}

.infoContainer-enter-to,
.infoContainer-leave-from {
  transform: translateX(0%); /* 右侧外面 */
}
.infoContainer-enter-active,
.infoContainer-leave-active {
  transition: transform 0.3s ease-in-out;
}
.infoContainer-enter-from,
.infoContainer-leave-to {
  transform: translateX(-100%); /* 左侧外面 */
}
</style>
