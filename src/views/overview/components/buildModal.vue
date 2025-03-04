<template>
  <div class="modal">
    <div class="pannel">
      <div class="header p-15">
        <el-icon @click="() => emits('closeModalAndExitView')" size="20" class="icon"
          ><Close
        /></el-icon>
        <div>{{ info.nameCHN }}</div>
        <div>{{ info.nameENG }}</div>
      </div>

      <el-scrollbar height="100%">
        <div class="content p-15">
          <el-row class="statistic">
            <el-col :span="8">
              <div class="statistic-number">{{ info.deviceOnlineNum }}</div>
              <div class="statistic-footer">在线</div>
            </el-col>
            <el-col :span="8">
              <div class="statistic-number">{{ info.deviceOfflineNum }}</div>
              <div class="statistic-footer">掉线</div>
            </el-col>
            <el-col :span="8">
              <div class="statistic-number">{{ info.deviceTotalNum }}</div>
              <div class="statistic-footer">总数</div>
            </el-col>
          </el-row>

          <el-alert
            title="该建筑设备正常运作中"
            v-if="info.deviceOfflineNum === 0 && info.deviceOnlineNum !== 0"
            type="success"
            show-icon
            :closable="false"
          />
          <el-alert
            :title="`${info.deviceOfflineNum}台设备掉线中`"
            v-if="info.deviceOfflineNum !== 0"
            type="error"
            show-icon
            :closable="false"
          />

          <el-alert
            :title="`有${props.notificationCountByLocation[info.nameENG].error}条错误通知`"
            v-if="
              props.notificationCountByLocation[info.nameENG] &&
              props.notificationCountByLocation[info.nameENG].error !== 0
            "
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            :title="`有${props.notificationCountByLocation[info.nameENG].normal}条普通通知`"
            v-if="
              props.notificationCountByLocation[info.nameENG] &&
              props.notificationCountByLocation[info.nameENG].normal !== 0
            "
            type="info"
            show-icon
            :closable="false"
          />
          <el-alert
            :title="`有${props.notificationCountByLocation[info.nameENG].success}条成功通知`"
            v-if="
              props.notificationCountByLocation[info.nameENG] &&
              props.notificationCountByLocation[info.nameENG].success !== 0
            "
            type="success"
            show-icon
            :closable="false"
          />
          <el-alert
            :title="`有${props.notificationCountByLocation[info.nameENG].warning}条警告通知`"
            v-if="
              props.notificationCountByLocation[info.nameENG] &&
              props.notificationCountByLocation[info.nameENG].warning !== 0
            "
            type="warning"
            show-icon
            :closable="false"
          />

          <el-empty
            description="暂无设备"
            v-if="devicesUnderThisLocation.length === 0"
            :image-size="100"
          />

          <div class="device" v-for="device in devicesUnderThisLocation" :key="device.id">
            <el-row>
              <el-col :span="16" class="left">
                <div class="name">
                  <div class="text">{{ device.name }}</div>
                  <el-tag :type="device.status === 'online' ? 'success' : 'danger'" size="small">{{
                    device.status === 'online' ? '在线' : '下线'
                  }}</el-tag>
                  <el-tag type="primary" size="small">{{
                    device.type === 'router' ? '路由器' : '交换机'
                  }}</el-tag>
                </div>
                <div class="model">{{ device.model }}</div>
                <div class="address">{{ device.ip }}</div>
              </el-col>
              <el-col :span="8" class="right">
                <el-button
                  type="primary"
                  round
                  size="small"
                  :disabled="device.status === 'offline'"
                  @click="handleManageDevice(device.id)"
                  >查看</el-button
                >
              </el-col>
            </el-row>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { buildingNameENGtoCHN } from '@/utils/format'
import { useDevicesStore } from '@/stores/devices'
import { useRouter } from 'vue-router'
const router = useRouter()
const devicesStore = useDevicesStore()
const props = defineProps({
  notificationCountByLocation: {
    require: true,
    type: Object,
  },
})

const emits = defineEmits(['closeModalAndExitView'])
const info = ref({
  nameCHN: '未知',
  nameENG: 'unkown',
  deviceOnlineNum: 0,
  deviceOfflineNum: 0,
  deviceTotalNum: 0,
  notificaitonErrorNum: 1,
  notificaitonWarningNum: 1,
  notificaitonNormalNum: 1,
  notificaitonSuccessNum: 1,
})
const devicesUnderThisLocation = ref([])

const getInfoToUpdate = (buildingName: string) => {
  // 初始化
  info.value.nameCHN = '未知'
  info.value.nameENG = 'unkown'
  info.value.deviceOnlineNum = 0
  info.value.deviceOfflineNum = 0
  info.value.deviceTotalNum = 0
  info.value.notificaitonErrorNum = 0
  info.value.notificaitonWarningNum = 0
  info.value.notificaitonNormalNum = 0
  info.value.notificaitonSuccessNum = 0
  devicesUnderThisLocation.value = []
  // 赋值
  info.value.nameENG = buildingName
  info.value.nameCHN = buildingNameENGtoCHN[buildingName]
  if (devicesStore.getDevicesListByLocation().value[buildingNameENGtoCHN[buildingName]]) {
    devicesUnderThisLocation.value =
      devicesStore.getDevicesListByLocation().value[buildingNameENGtoCHN[buildingName]]
    info.value.deviceTotalNum = devicesUnderThisLocation.value.length
    devicesUnderThisLocation.value.forEach((device) => {
      if (device.status === 'online') {
        info.value.deviceOnlineNum++
      } else {
        info.value.deviceOfflineNum++
      }
    })
  }
}

const handleManageDevice = (id: string) => {
  router.push({ path: '/deviceInfo', query: { id } })
}
defineExpose({ getInfoToUpdate })
</script>
<style lang="less" scoped>
.modal {
  position: absolute;
  z-index: 3; /* 确保弹窗在最上层 */
  top: 0;
  right: 0;
  width: 420px;
  height: 100%;
}

.p-15 {
  padding: 0px 15px;
}

/* 弹窗内容 */
.pannel {
  display: flex;
  flex-direction: column;
  background-color: var(--background-white-transparent-1);
  backdrop-filter: blur(15px);
  height: calc(100% - 40px);
  margin: 20px 25px;
  box-shadow: var(--el-box-shadow);
  border-radius: var(--el-border-radius-base);
  .header {
    padding-top: 15px;
    padding-bottom: 15px;
    display: flex;
    color: var(--el-text-color-primary);

    div {
      font-size: 20px;
      font-weight: lighter;
      padding-left: 10px;
      line-height: 24px;
    }
    .icon {
      height: 25px;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 15px;

    .statistic {
      padding: 5px 0px;
      &-number {
        font-size: 20px;
      }
      &-footer {
        margin-top: 2px;
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
      .el-col {
        text-align: center;
      }
    }

    .device {
      border-radius: var(--el-border-radius-base);
      background-color: var(--background-white-transparent-2);
      padding: 8px 16px;
      .left {
        display: flex;
        flex-direction: column;
        gap: 3px;
        .name {
          display: flex;
          gap: 6px;
          .text {
            font-weight: normal;
            font-size: 16px;
            margin-top: -1px;
          }
        }
        .model {
          font-weight: lighter;
          font-size: 12px;
        }
        .address {
          font-weight: lighter;
          font-size: 12px;
        }
      }
      .right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;

        .router {
          // height: 50%;
          // width: 50%;
          // background-repeat: no-repeat;
          // background-position: right;
          // background-size: contain;
          // background-image: url(/router.png);
        }
      }
    }
  }
}
</style>
