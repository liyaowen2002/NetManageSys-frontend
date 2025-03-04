<template>
  <!-- 抽屉组件 -->
  <el-drawer
    title="添加设备"
    v-model="drawerVisible"
    direction="rtl"
    size="30%"
    @close="() => formRef.resetFields()"
  >
    <el-form :model="formData" ref="formRef" :rules="formRules" label-width="auto">
      <el-form-item label="IP 地址" prop="ip">
        <el-input v-model="formData.ip" placeholder="请输入设备 IP 地址" required></el-input>
      </el-form-item>
      <el-form-item label="设备类型" prop="type" required>
        <el-select v-model="formData.type" placeholder="请选择设备类型">
          <el-option label="路由器" value="router" />
          <el-option label="交换机" value="switch" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" :loading="isLoading" @click="handleAddDevice">新增</el-button>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { addDevice } from '@/api/http/devicesManage'

const isLoading = ref(false)
const drawerVisible = ref(false)
const emits = defineEmits(['addDevice_sure'])

const formRules = {
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  type: [{ required: true, message: '设备类型', trigger: 'blur' }],
}
const formRef = ref(null)
const formData = reactive({
  ip: '',
  type: '',
})

defineExpose({
  drawerVisible,
})
const handleAddDevice = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      isLoading.value = true
      const loadingMessage = ElMessage({
        message: '连接设备中...',
        duration: 0,
      })
      try {
        const response = await addDevice({ ip: formData.ip })
        drawerVisible.value = false
        emits('addDevice_sure', { ...response.data, ...formData })
      } catch (error) {
        console.error(error)
      } finally {
        isLoading.value = false
        loadingMessage.close()
      }
    }
  })
}
</script>
