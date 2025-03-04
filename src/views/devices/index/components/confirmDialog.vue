<template>
  <!-- 弹窗组件 -->
  <el-dialog title="设备信息确认" v-model="dialogVisible" width="500px">
    <el-descriptions border :label-width="100" :column="1">
      <el-descriptions-item label-align="center" label="IP 地址">
        {{ formData.ip }}
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="设备名称">
        {{ formData.name }}
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="设备类型">
        {{ formData.type }}
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="制造商">
        {{ formData.manufacturer }}
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="设备型号">
        {{ formData.model }}
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="设备位置">
        {{ formData.location }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmAdd" :isLoading="isLoading">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDevicesStore } from '@/stores/devices'
import { addConfirm } from '@/api/http/devicesManage'
const devicesStore = useDevicesStore()

const dialogVisible = ref(false)
const isLoading = ref(false)

const formData = reactive({
  ip: null,
  name: null,
  type: null,
  model: null,
  location: null,
  token: null,
  manufacturer: null,
})

defineExpose({
  dialogVisible,
  formData,
})

const confirmAdd = async () => {
  try {
    isLoading.value = true
    await addConfirm({
      ...formData,
    })
    devicesStore.updateDevicesList()
    dialogVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>
