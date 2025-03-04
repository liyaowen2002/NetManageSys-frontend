<template>
  <div v-loading="loading">
    <el-table :data="arpTable" border style="width: 100%" max-height="80vh">
      <el-table-column prop="interfaceIndex" label="接口索引" align="center" width="100" />
      <el-table-column prop="physicalAddress" label="MAC地址" align="center" />
      <el-table-column prop="netAddress" label="IP地址" align="center" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { getDeviceArpInfo } from '@/api/http/deviceConfig'
import { ref } from 'vue'

const arpTable = ref([])
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
    const res = await getDeviceArpInfo(props.deviceId)
    arpTable.value = res.data.arpTable
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
init()
</script>
