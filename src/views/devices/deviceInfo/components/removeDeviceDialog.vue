<template>
  <el-dialog
    title="移除设备"
    v-model="isRemoveDialogVisiable"
    width="500px"
    :before-close="setRemoveNull"
  >
    确认要移除设备{{ removeDeviceName }}吗？此操作将无法撤回！
    <template #footer>
      <el-button @click="isRemoveDialogVisiable = false">取消</el-button>
      <el-button type="danger" @click="confirmRemoveDevice" :isLoading="isLoading">确定</el-button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { removeDevice } from '@/api/http/devicesManage'
import { useDevicesStore } from '@/stores/devices'
import { useRouter } from 'vue-router'
const isRemoveDialogVisiable = ref(false)
const removeDeviceID = ref<null | string>(null)
const removeDeviceName = ref<null | string>(null)
const isLoading = ref(false)
const devicesStore = useDevicesStore()
const router = useRouter()
const openRemoveDialog = (deviceID: string, deviceName: string) => {
  isRemoveDialogVisiable.value = true
  removeDeviceID.value = deviceID
  removeDeviceName.value = deviceName
}
defineExpose({ openRemoveDialog })
const confirmRemoveDevice = async () => {
  if (removeDeviceID.value === null) return
  try {
    isLoading.value = true
    await removeDevice(removeDeviceID.value)
    devicesStore.updateDevicesList()
    isRemoveDialogVisiable.value = false
    router.back()
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}
const setRemoveNull = () => {
  console.log('1')
  removeDeviceID.value = null
  removeDeviceName.value = null
}
</script>
