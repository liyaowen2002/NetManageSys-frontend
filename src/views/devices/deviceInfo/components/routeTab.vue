<template>
  <div v-loading="loading">
    <el-table :data="routeTable" border style="width: 100%" max-height="80vh">
      <el-table-column prop="destination" label="目的IP地址" align="center" />
      <el-table-column prop="interfaceIndex" label="接口索引" align="center" />
      <el-table-column prop="nextHop" label="下一跳" />
      <el-table-column prop="type" label="类型" align="center" />
      <el-table-column prop="protocol" label="学习路由协议" align="center" />
      <el-table-column prop="age" label="距上次更新时间" align="center" />
      <el-table-column prop="mask" label="掩码" align="center"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { getDeviceRouteInfo } from '@/api/http/deviceConfig'
import { ref } from 'vue'

const routeTable = ref([])
const loading = ref(false)
const props = defineProps({
  deviceId: {
    type: Number,
    required: true,
  },
})

const init = async () => {
  try {
    loading.value = true
    const res = await getDeviceRouteInfo(props.deviceId)
    routeTable.value = res.data.routeTable
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
init()
</script>
