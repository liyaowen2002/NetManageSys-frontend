<template>
  <div v-loading="loading">
    <el-table :data="hardwareTable" border style="width: 100%" max-height="80vh">
      <el-table-column prop="index" label="索引" align="center" width="80" />
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="manufacturer" label="制造商" align="center" width="100" />
      <el-table-column prop="model" label="型号" align="center" />
      <el-table-column prop="class" label="分类" align="center" />
      <el-table-column prop="hardwareRev" label="硬件版本" align="center" />
      <el-table-column prop="firmwareRev" label="固件版本" align="center" />
      <el-table-column prop="softwareRev" label="软件版本" />
      <el-table-column prop="serialNumber" label="序列号" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { getDeviceHardwareInfo } from '@/api/http/deviceConfig'
import { ref } from 'vue'

const hardwareTable = ref([])
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
    const res = await getDeviceHardwareInfo(props.deviceId)
    hardwareTable.value = res.data.hardwareTable
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
init()
</script>
