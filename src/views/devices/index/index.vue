<template>
  <div style="display: flex; flex-direction: column; overflow: hidden">
    <el-scrollbar height="100%">
      <div class="cardErea" v-for="location in Object.keys(devicesList)" :key="location">
        <div class="text-level-1">{{ location }}</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap">
          <div v-if="devicesList[location].length === 0" class="emptyText">暂无设备</div>
          <el-card
            v-for="device in devicesList[location]"
            :key="device.id"
            class="card"
            :class="selectedDevices.includes(device.id) ? 'card-selected' : ''"
            :body-style="{ padding: '10px', paddingTop: '0', width: '150px' }"
            shadow="hover"
            @click="
              isRemoving
                ? selectedDevices.includes(device.id)
                  ? outRemoveList(device.id)
                  : addRemoveList(device.id)
                : device.status === 'online'
                  ? handleManageDevice(device.id)
                  : ElMessage.error('设备离线，无法管理')
            "
          >
            <el-badge
              is-dot
              :offset="[-8, 18]"
              class="img"
              :type="device.status === 'online' ? 'success' : 'danger'"
            >
              <div class="router" v-if="device.type === 'router'"></div>
              <div class="switch" v-if="device.type === 'switch'"></div>
            </el-badge>
            <div class="text">
              <div class="sysnickname">{{ device.name }}</div>
              <div class="sysmodel">{{ device.model }}</div>
            </div>
          </el-card>
        </div>
      </div>
      <el-empty description="暂无设备" v-if="Object.keys(devicesList).length === 0" />
    </el-scrollbar>
  </div>
  <AddDeviceDrawer ref="addDeviceDrawer" @addDevice_sure="addDevice_sure"></AddDeviceDrawer>
  <ConfirmDialog ref="confirmDialog"></ConfirmDialog>

  <!-- 刷新 -->
  <!-- <el-backtop
    :right="180"
    :bottom="100"
    :visibility-height="0"
    @click="syncInfo"
    v-show="isRemoving === false"
  >
    <el-icon :size="20"><Refresh /></el-icon>
  </el-backtop> -->

  <!-- 新增设备 -->
  <div v-auth="'administrator'">
    <el-backtop
      :right="120"
      :bottom="100"
      :visibility-height="0"
      @click="() => (addDeviceDrawer.drawerVisible = true)"
      v-show="isRemoving === false"
    >
      <el-icon :size="20"><Plus /></el-icon>
    </el-backtop>

    <!-- 移除设备 -->
    <el-backtop
      :right="60"
      :bottom="100"
      :visibility-height="0"
      @click="() => (isRemoving = true)"
      v-show="isRemoving === false"
    >
      <el-icon :size="20" color="#F56C6C"><Delete /></el-icon>
    </el-backtop>

    <!-- 确认移除 -->
    <el-backtop
      :right="60"
      :bottom="100"
      :visibility-height="0"
      v-show="isRemoving === true"
      @click="removeDevices()"
    >
      <el-icon :size="20" color="#F56C6C"><Check /></el-icon>
    </el-backtop>

    <!-- 取消移除 -->
    <el-backtop
      :right="120"
      :bottom="100"
      :visibility-height="0"
      v-show="isRemoving === true"
      @click="quitRemoving()"
    >
      <el-icon :size="20" color="#F56C6C"><Close /></el-icon>
    </el-backtop>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDevicesStore } from '@/stores/devices'
import AddDeviceDrawer from './components/addDeviceDrawer.vue'
import ConfirmDialog from './components/confirmDialog.vue'
import { removeDevice, removeDeviceBatch, syncDeviceInfo } from '@/api/http/devicesManage'
import { ElMessage } from 'element-plus'
const router = useRouter()

const devicesStore = useDevicesStore()
const devicesList = devicesStore.getDevicesListByLocation()

const addDeviceDrawer = ref()
const confirmDialog = ref()

const isRemoving = ref(false) // 控制按钮文案
const selectedDevices = ref<string[]>([]) // 存储选中的设备 ID

// 新增设备按钮点击处理，抽屉中转到弹窗
const addDevice_sure = (deviceInfo) => {
  Object.assign(confirmDialog.value.formData, deviceInfo)
  confirmDialog.value.dialogVisible = true
}

// 管理设备跳转
const handleManageDevice = (id: string) => {
  router.push({ path: '/deviceInfo', query: { id } })
}

// 取消删除
const quitRemoving = () => {
  isRemoving.value = !isRemoving.value
  selectedDevices.value = []
}

// 移除设备的操作
const removeDevices = async () => {
  // 可以在这里处理选中的设备，执行删除操作
  console.log('移除的设备 ID:', selectedDevices.value)
  try {
    await removeDeviceBatch(selectedDevices.value.toString())
    devicesStore.updateDevicesList()
  } catch (error) {
    console.error(error)
  } finally {
    isRemoving.value = false
  }
}

// 移出选中列表
const outRemoveList = (removeID: string) => {
  selectedDevices.value = selectedDevices.value.filter((item) => item != removeID)
}

// 添加到选中列表
const addRemoveList = (removeID: string) => {
  selectedDevices.value.push(removeID)
}

// 同步设备信息
// const syncInfo = async () => {
//   try {
//     const msg = ElMessage({
//       message: '设备信息同步中',
//       duration: 0,
//     })
//     await syncDeviceInfo()
//     msg.close()
//   } catch (err) {
//     console.error(err)
//   }
// }
</script>

<style lang="less" scoped>
.emptyText {
  width: 100%;
  height: 35px;
  line-height: 35px;
  color: var(--Regular-Text);
  letter-spacing: 5px;
  text-align: center;
  background-color: var(--background-grey-2);
  border-radius: var(--el-border-radius-base);
}
.cardErea {
  padding: 10px 20px 10px 20px;
}

.text-level-1 {
  font-size: 24px;
  font-weight: lighter;
  margin-bottom: 8px;
}
.card-selected {
  border: 1px solid rgba(155, 0, 0, 0.5);
  scale: 1.03;
}
.card {
  cursor: pointer;
  .img {
    width: 100%;
    div {
      position: relative;
      width: 100%;
      height: 60px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: right;
      z-index: 1;
      top: 10px;
    }
    .router {
      background-image: url(/router.png);
    }
    .switch {
      background-image: url(/switch.png);
    }
  }
  .text {
    position: relative;
    z-index: 2;
    .sysnickname {
      font-weight: bold;
    }
    .sysmodel {
      font-weight: lighter;
      font-size: small;
    }
  }
}
</style>
