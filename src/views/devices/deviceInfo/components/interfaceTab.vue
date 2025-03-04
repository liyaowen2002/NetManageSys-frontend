<template>
  <div v-loading="loading">
    <el-table :data="interfaceTable" border style="width: 100%" max-height="80vh">
      <el-table-column prop="index" label="接口索引" align="center" width="100" />
      <el-table-column prop="description" label="名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="MTU" label="MTU" align="center" />
      <el-table-column prop="speed" label="速率" align="center" />
      <el-table-column prop="physicalAddress" label="物理地址" align="center" />
      <el-table-column prop="operStatus" label="状态" align="center">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.operStatus === '正常'">{{
            scope.row.operStatus
          }}</el-tag>
          <el-tag type="danger" v-else-if="scope.row.operStatus === '故障'">{{
            scope.row.operStatus
          }}</el-tag>
          <el-tag type="warning" v-else>{{ scope.row.operStatus }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { getDeviceInterfaceInfo } from '@/api/http/deviceConfig'
import { ref } from 'vue'

const interfaceTable = ref([])
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
    const res = await getDeviceInterfaceInfo(props.deviceId)
    interfaceTable.value = res.data.interfaceTable
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
init()
</script>
