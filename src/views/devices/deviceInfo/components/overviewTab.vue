<template>
  <div v-loading="loading">
    <div>
      <levelTitle type="h2" text="基础信息" style="margin-top: 0px"> </levelTitle>

      <el-descriptions border :label-width="100" style="margin-bottom: 14px" :column="2">
        <el-descriptions-item label-align="center" label="IP地址">
          {{ deviceInfo.ip }}
        </el-descriptions-item>
        <el-descriptions-item label-align="center" label="运行时间" min-width="120">
          {{ deviceInfo.uptime[0] }}时 {{ deviceInfo.uptime[1] }}分 {{ deviceInfo.uptime[2] }}秒
        </el-descriptions-item>
        <el-descriptions-item label-align="center" label="设备型号">
          {{ deviceInfo.model }}
        </el-descriptions-item>
        <el-descriptions-item label-align="center" label="制造商">
          {{ deviceInfo.manufacturer }}
        </el-descriptions-item>
        <el-descriptions-item label-align="center" label="设备描述">
          {{ deviceInfo.description }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form :model="deviceInfo" label-width="auto">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name" v-loading="flagVar['name'].isSaving">
              <div style="flex: 1">
                <el-input v-model="deviceInfo.name" :disabled="flagVar['name'].notEditing">
                </el-input>
              </div>
              <div class="formIconGroup" v-auth="'administrator'">
                <el-icon
                  class="editIcon"
                  @click="flagVar['name'].notEditing = false"
                  v-show="flagVar['name'].notEditing"
                  ><Edit
                /></el-icon>
                <el-icon
                  class="editIcon"
                  v-show="!flagVar['name'].notEditing"
                  @click="saveSysInfoEdit('name')"
                  ><Check
                /></el-icon>
                <el-icon
                  class="editIcon"
                  @click="cancelChange('name')"
                  v-show="!flagVar['name'].notEditing"
                  ><Close
                /></el-icon>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备位置" prop="location" v-loading="flagVar['location'].isSaving">
              <div style="flex: 1">
                <el-select v-model="deviceInfo.location" :disabled="flagVar['location'].notEditing">
                  <el-option
                    v-for="building in Object.keys(buildingNameENGtoCHN)"
                    :key="building"
                    :value="building"
                    :label="buildingNameENGtoCHN[building]"
                  ></el-option>
                </el-select>
              </div>
              <div class="formIconGroup" v-auth="'administrator'">
                <el-icon
                  class="editIcon"
                  @click="flagVar['location'].notEditing = false"
                  v-show="flagVar['location'].notEditing"
                  ><Edit
                /></el-icon>
                <el-icon
                  class="editIcon"
                  v-show="!flagVar['location'].notEditing"
                  @click="saveSysInfoEdit('location')"
                  ><Check
                /></el-icon>
                <el-icon
                  class="editIcon"
                  @click="cancelChange('location')"
                  v-show="!flagVar['location'].notEditing"
                  ><Close
                /></el-icon>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="联系信息" prop="contact" v-loading="flagVar['contact'].isSaving">
          <div style="flex: 1">
            <el-input
              v-model="deviceInfo.contact"
              :disabled="flagVar['contact'].notEditing"
            ></el-input>
          </div>
          <div class="formIconGroup" v-auth="'administrator'">
            <el-icon
              class="editIcon"
              @click="flagVar['contact'].notEditing = false"
              v-show="flagVar['contact'].notEditing"
              ><Edit
            /></el-icon>
            <el-icon
              class="editIcon"
              v-show="!flagVar['contact'].notEditing"
              @click="saveSysInfoEdit('contact')"
              ><Check
            /></el-icon>
            <el-icon
              class="editIcon"
              @click="cancelChange('contact')"
              v-show="!flagVar['contact'].notEditing"
              ><Close
            /></el-icon>
          </div>
        </el-form-item>

        <el-form-item label="备注信息" prop="note" v-loading="flagVar['note'].isSaving">
          <div style="flex: 1">
            <el-input v-model="deviceInfo.note" :disabled="flagVar['note'].notEditing"></el-input>
          </div>
          <div class="formIconGroup" v-auth="'administrator'">
            <el-icon
              class="editIcon"
              @click="flagVar['note'].notEditing = false"
              v-show="flagVar['note'].notEditing"
              ><Edit
            /></el-icon>
            <el-icon
              class="editIcon"
              v-show="!flagVar['note'].notEditing"
              @click="saveSysInfoEdit('note')"
              ><Check
            /></el-icon>
            <el-icon
              class="editIcon"
              @click="cancelChange('note')"
              v-show="!flagVar['note'].notEditing"
              ><Close
            /></el-icon>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <!-- <div>
      <levelTitle type="h2" text="硬件使用情况" />
      <el-progress type="dashboard" :percentage="80" class="dashboard" :color="colors">
        <template #default="{ percentage }">
          <div>{{ percentage }}%</div>
          <div class="dashboardText">CPU占用率</div>
        </template>
      </el-progress>
      <el-progress type="dashboard" :percentage="20" class="dashboard" :color="colors">
        <template #default="{ percentage }">
          <div>{{ percentage }}%</div>
          <div class="dashboardText">内存使用率</div>
        </template>
      </el-progress>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import levelTitle from '@/components/levelTitle.vue'
import { formatTimeTicks } from '@/utils/format'
import { ref, onBeforeUnmount, reactive } from 'vue'
import { editSysInfo, getDeviceInfo } from '@/api/http/deviceConfig'
import { Edit, Check, Close } from '@element-plus/icons-vue'
import { useDevicesStore } from '@/stores/devices'
import { buildingNameENGtoCHN } from '@/utils/format'
const devicesStore = useDevicesStore()

const props = defineProps({
  deviceId: {
    type: Number,
    required: true,
  },
})
const rules = {
  name: [
    { required: true, message: '请输入', trigger: 'blur' },
    {
      validator: function (rule, value, callback) {
        if (/^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]*$/.test(value) == true) {
          callback(new Error('请输入英文或数字'))
        } else {
          //校验通过
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  contact: [
    { required: true, message: '请输入', trigger: 'blur' },
    {
      validator: function (rule, value, callback) {
        if (/^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]*$/.test(value) == false) {
          callback(new Error('请输入英文或数字'))
        } else {
          //校验通过
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}
const loading = ref(false)
const deviceInfo = ref({
  name: '',
  status: '',
  ip: '',
  location: '',
  contact: '',
  uptime: [0, 0, 0],
  description: '',
  manufacturer: '',
  model: '',
  note: '',
})
let deviceInfo_backup = {
  name: '',
  status: '',
  ip: '',
  location: '',
  contact: '',
  uptime: [0, 0, 0],
  description: '',
  manufacturer: '',
  model: '',
  note: '',
}

const flagVar = reactive({
  name: {
    notEditing: true,
    isSaving: false,
  },
  location: {
    notEditing: true,
    isSaving: false,
  },
  contact: {
    notEditing: true,
    isSaving: false,
  },
  note: {
    notEditing: true,
    isSaving: false,
  },
})

const intervals: number[] = [] // 存储定时器 ID

const getInfo = async () => {
  try {
    loading.value = true
    const res = await getDeviceInfo(props.deviceId)

    // **先清除定时器，防止重复启动**
    clearTimers()

    // **确保 uptime 被正确赋值**
    deviceInfo.value = {
      ...res.data,
      uptime: formatTimeTicks(res.data.uptime),
    }
    deviceInfo_backup = JSON.parse(JSON.stringify({ ...deviceInfo.value }))

    // **确保 uptime 赋值完成后，启动定时器**
    startTimers()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// **启动定时器**
const startTimers = () => {
  clearTimers() // 确保不会重复创建定时器

  // **每秒 +1**
  intervals.push(
    setInterval(() => {
      deviceInfo.value.uptime[2]++
      if (deviceInfo.value.uptime[2] >= 60) {
        deviceInfo.value.uptime[2] = 0
        deviceInfo.value.uptime[1]++
      }
    }, 1000),
  )

  // **每分钟 +1**
  intervals.push(
    setInterval(() => {
      deviceInfo.value.uptime[1]++
      if (deviceInfo.value.uptime[1] >= 60) {
        deviceInfo.value.uptime[1] = 0
        deviceInfo.value.uptime[0]++
      }
    }, 60000),
  )

  // **每小时 +1**
  intervals.push(
    setInterval(() => {
      deviceInfo.value.uptime[0]++
    }, 3600000),
  )
}

// **清除定时器**
const clearTimers = () => {
  intervals.forEach((id) => clearInterval(id))
  intervals.length = 0
}

// onMounted(() => {
//   getInfo() // **初始化时获取设备信息**
// })

onBeforeUnmount(() => {
  clearTimers() // **组件卸载时清除定时器，防止内存泄漏**
})

getInfo()

const saveSysInfoEdit = async (key: keyof typeof flagVar) => {
  try {
    flagVar[key].isSaving = true
    // console.log(form.value)
    // await form.value.validate(async (valid: boolean) => {
    //   if (valid) {
    await editSysInfo({
      id: props.deviceId,
      key,
      value: deviceInfo.value[key],
    })
    flagVar[key].notEditing = true
    if (key !== 'note') {
      devicesStore.updateDevicesList()
    }

    //   }
    // })
  } catch (error) {
    console.error(error)
    deviceInfo_backup = JSON.parse(JSON.stringify({ ...deviceInfo.value }))
  } finally {
    flagVar[key].isSaving = false
  }
}

const cancelChange = (key: keyof typeof flagVar) => {
  flagVar[key].notEditing = true
  deviceInfo.value[key] = JSON.parse(JSON.stringify(deviceInfo_backup[key]))
}
</script>
<style lang="less" scoped>
.dashboard {
  margin-right: 40px;
}
.dashboardText {
  font-size: 14px;
  margin-top: 5px;
}
.editIcon {
  cursor: pointer;
}
.formIconGroup {
  width: 50px;
  text-align: center;
}
</style>
