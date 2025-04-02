<template>
  <div class="infoContainer">
    <div class="greeting">{{ greeting }}，{{ accoutInfo.nickname }}。</div>
    <div>
      <el-button type="primary" round icon="BrushFilled" @click="handleMarkAllAsRead"
        >通知：{{
          props.notificationCountByLevel.totalCount === 0 ? '暂无更多通知' : '一键已读所有通知'
        }}</el-button
      >
    </div>
    <div>
      <el-row :gutter="10">
        <el-col :span="12">
          <div style="display: flex; flex-direction: column; gap: 10px">
            <div class="notificationCard warning">
              <el-icon class="icon" size="50" color="#ffffff33"><WarningFilled /></el-icon>
              <div class="text">
                <div class="title">警告</div>
                <div class="count">{{ props.notificationCountByLevel.warningCount }}</div>
              </div>
            </div>
            <div class="notificationCard success">
              <el-icon class="icon" size="50" color="#ffffff33"><SuccessFilled /></el-icon>
              <div class="text">
                <div class="title">成功</div>
                <div class="count">{{ props.notificationCountByLevel.successCount }}</div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div style="display: flex; flex-direction: column; gap: 10px">
            <div class="notificationCard error">
              <el-icon class="icon" size="50" color="#ffffff33"><CircleCloseFilled /></el-icon>
              <div class="text">
                <div class="title">错误</div>
                <div class="count">{{ props.notificationCountByLevel.errorCount }}</div>
              </div>
            </div>
            <div class="notificationCard normal">
              <el-icon class="icon" size="50" color="#ffffff33"><InfoFilled /></el-icon>
              <div class="text">
                <div class="title">普通</div>
                <div class="count">{{ props.notificationCountByLevel.normalCount }}</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="notificationCard default">
      <el-icon class="icon" size="60"><OfficeBuilding /></el-icon>
      <div class="text">
        <div class="title">园区建筑数量：</div>
        <div class="count">{{ Object.keys(onlineDevicesCount).length }}</div>
      </div>
    </div>
    <div class="card">
      <levelTitle type="h3" text="在线设备" style="margin-top: 0px"> </levelTitle>

      <el-row v-for="location in Object.keys(onlineDevicesCount)" class="onlineCountByLocation">
        <el-col :span="5">
          <div class="locationName">{{ location }}</div>
        </el-col>
        <el-col :span="19">
          <el-progress
            :text-inside="true"
            :stroke-width="12"
            :percentage="onlineDevicesCount[location].percentage"
            class="progress"
          >
            <span
              >{{ onlineDevicesCount[location].online }} /
              {{ onlineDevicesCount[location].total }}</span
            >
          </el-progress>
        </el-col>
      </el-row>
    </div>
    <div class="card runningTimeCount">
      <levelTitle type="h3" text="服务时间" style="margin-top: 0px" />
      <el-row>
        <el-col :span="24">
          <div class="text" style="text-align: center">
            自{{ timeCount.date }}启动以来，服务已运行
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <div class="timeCard">
            <div class="timeNum">{{ timeCount.hours }}</div>
            <div class="timeUnit">时</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="timeCard">
            <div class="timeNum">{{ timeCount.minutes }}</div>
            <div class="timeUnit">分</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="timeCard">
            <div class="timeNum">{{ timeCount.seconds }}</div>
            <div class="timeUnit">秒</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import levelTitle from '@/components/levelTitle.vue'
import { markAsReadByDefalutFilter } from '@/api/http/overview'
import { useRouter } from 'vue-router'
import { useDevicesStore } from '@/stores/devices'
import { useAccoutStore } from '@/stores/accout'
const devicesStore = useDevicesStore()

const emits = defineEmits(['updateNotification'])
const accoutInfo = useAccoutStore()
const router = useRouter()
// 获取当前时间的小时数，确定是早上、下午、晚上
const currentHour = new Date().getHours()
const props = defineProps({
  notificationCountByLevel: {
    require: true,
    type: Object,
  },
  timeCount: {
    require: true,
    type: Object,
  },
})
// 计算问候语
const greeting = computed(() => {
  if (currentHour < 6) {
    return '凌晨好'
  } else if (currentHour < 12) {
    return '早上好'
  } else if (currentHour < 18) {
    return '下午好'
  } else {
    return '晚上好'
  }
})

// 定义数量变量

const onlineDevicesCount = ref<
  Record<string, { online: number; total: number; percentage: number }>
>({})

// 处理一键已读
const handleMarkAllAsRead = async () => {
  try {
    if (props.notificationCountByLevel.totalCount === 0) return
    const response = await markAsReadByDefalutFilter() // 调用API来标记为已读
    if (response.type === 'success') {
      emits('updateNotification')
    } else {
      console.error('标记失败', response.msg)
    }
  } catch (error) {
    console.error('调用失败', error)
  }
}

watch(
  devicesStore.getDevicesListByLocation,
  (newVal) => {
    console.log(newVal.value)

    const result: Record<string, { online: number; total: number; percentage: number }> = {}

    for (const key in newVal.value) {
      const devices = newVal.value[key]
      const total = devices.length
      const online = devices.reduce(
        (count, device) => count + (device.status === 'online' ? 1 : 0),
        0,
      )

      result[key] = {
        total,
        online,
        percentage: total > 0 ? Math.min(Math.max((online / total) * 100, 0), 100) : 0, // 限制在 0-100
      }
    }

    onlineDevicesCount.value = result // 存储最终计算的结构
  },
  { immediate: true, deep: true },
)
</script>
<style lang="less" scoped>
.infoContainer {
  position: absolute;
  z-index: 2; /* 确保弹窗在最上层 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  width: 320px;
  .greeting {
    font-size: 30px;
    font-weight: lighter;
  }

  .notificationCard {
    position: relative;
    background-color: var(--background-white-transparent-1);
    border-radius: var(--el-border-radius-base);
    overflow: hidden;
    .icon {
      position: absolute;
      left: -10px;
      bottom: -18px;
    }
    .text {
      height: 50px;
      display: flex;
      justify-content: space-between;
      padding: 8px;
      color: rgb(255, 255, 255);
      .title {
        font-weight: bolder;
        margin-left: 3px;
        letter-spacing: 5px;
      }
      .count {
        font-weight: bolder;
        font-size: 40px;
        text-align: right;
      }
    }
  }
  .notificationCard.warning {
    background-color: rgb(230, 162, 60);
    box-shadow:
      rgba(230, 162, 60, 0.2) 0px 12px 32px 4px,
      rgba(230, 162, 60, 0.3) 0px 8px 20px 0px;
  }
  .notificationCard.success {
    background-color: rgb(103, 194, 58);
    box-shadow:
      rgba(103, 194, 58, 0.2) 0px 12px 32px 4px,
      rgba(103, 194, 58, 0.3) 0px 8px 20px 0px;
  }
  .notificationCard.normal {
    background-color: rgb(144, 147, 153);
    box-shadow:
      rgba(144, 147, 153, 0.2) 0px 12px 32px 4px,
      rgba(144, 147, 153, 0.3) 0px 8px 20px 0px;
  }
  .notificationCard.error {
    background-color: rgb(245, 108, 108);
    box-shadow:
      rgba(245, 108, 108, 0.2) 0px 12px 32px 4px,
      rgba(245, 108, 108, 0.3) 0px 8px 20px 0px;
  }
  .notificationCard.default {
    background-color: var(--background-white-transparent-1);
    box-shadow: var(--el-box-shadow);
    backdrop-filter: blur(15px);
    .text {
      color: var(--Secondary-Text);
      .title {
        line-height: 50px;
        font-size: 20px;
        margin-left: 20px;
      }
      .count {
        margin-right: 13px;
      }
    }
    .icon {
      color: var(--Darker-Fill);
      z-index: -1;
      left: 0px;
      bottom: -8px;
    }
  }
  .card {
    background-color: var(--background-white-transparent-1);
    backdrop-filter: blur(15px);
    box-shadow: var(--el-box-shadow);
    border-radius: var(--el-border-radius-base);
    padding: 10px;
  }
  .onlineCountByLocation {
    margin-bottom: 8px;
    .locationName {
      font-size: 11px;
      line-height: 13px;
      color: var(--Regular-Text);
      text-align: center;
    }
    .progress {
      position: relative;
      span {
        position: absolute;
        font-size: 10px;
        top: 1px;
        right: 8px;
      }
    }
  }
  .onlineCountByLocation:last-of-type {
    margin-bottom: 0px;
  }
  .runningTimeCount {
    .text {
      font-size: 13px;
      letter-spacing: 2px;
      color: var(--Regular-Text);
    }
    .timeCard {
      position: relative;
      background-color: var(--Dark-Fill);
      border-radius: var(--el-border-radius-base);
      margin: 10px;
      height: 80px;
    }
    .timeUnit {
      position: absolute;
      z-index: 2;
      right: 6px;
      bottom: 6px;
      font-size: 12px;
      font-weight: bolder;
      color: var(--Secondary-Text);
    }
    .timeNum {
      font-weight: bolder;
      font-size: 30px;
      line-height: 80px;
      text-align: center;
      width: 100%;
      height: 100%;
      color: var(--Regular-Text);
    }
  }
}
</style>
