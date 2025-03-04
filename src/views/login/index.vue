<template>
  <div class="logincard">
    <el-card>
      <template #header>
        <p>请登录</p>
      </template>
      <el-form>
        <el-form-item label="账号">
          <el-input v-model="userInfo.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userInfo.password" />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="login" :loading="isLoading">登录</el-button>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { accoutLogin } from '@/api/http/login'
import { useRouter } from 'vue-router'
import { useAccoutStore } from '@/stores/accout'
import { useDevicesStore } from '@/stores/devices'
import { initWebSocket } from '@/api/ws/notification'
const devicesStore = useDevicesStore()
const accoutStore = useAccoutStore()
const router = useRouter()
const userInfo = reactive({
  username: 'admin',
  password: 'admin',
})

const isLoading = ref(false)

const login = async () => {
  try {
    isLoading.value = true
    await accoutLogin(userInfo).then(async (res) => {
      // 存储账号信息
      accoutStore.$patch({
        nickname: res.data.nickname,
        username: res.data.username,
        role: res.data.role,
      })
      localStorage.setItem('authToken', res.data.token)
      // 请求成功后，建立 WebSocket 连接，并等待连接建立成功
      await initWebSocket() // 等待 WebSocket 连接完成
      router.replace('/overview')
    })
    devicesStore.updateDevicesList()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>
<style lang="less" scoped>
.logincard {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
