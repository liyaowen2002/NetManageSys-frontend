<template>
  <div style="padding: 20px; box-sizing: border-box">
    <div style="overflow: hidden">
      <el-form :model="filter" class="filter-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="通知内容" prop="content">
              <el-input v-model="filter.content" placeholder="请输入内容" clearable />
            </el-form-item>
            <el-form-item label="通知状态">
              <el-select v-model="filter.isRead" placeholder="请选择状态" clearable>
                <el-option label="全部" value="all" />
                <el-option label="未读" value="unread" />
                <el-option label="已读" value="read" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关联设备" prop="device">
              <el-input v-model="filter.device" placeholder="请输入设备名称" clearable />
            </el-form-item>
            <el-form-item label="通知时间">
              <el-date-picker
                v-model="filter.time"
                type="daterange"
                range-separator="到"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="紧急等级" prop="level">
              <el-select v-model="filter.level" placeholder="请选择等级" clearable>
                <el-option label="错误" value="error" />
                <el-option label="警告" value="warning" />
                <el-option label="成功" value="success" />
                <el-option label="普通" value="normal" />
              </el-select>
            </el-form-item>
            <el-form-item label="关联位置" prop="location">
              <el-select v-model="filter.location" placeholder="请选择位置" clearable>
                <el-option
                  v-for="building in Object.keys(buildingNameENGtoCHN)"
                  :key="building"
                  :value="building"
                  :label="buildingNameENGtoCHN[building]"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="buttonGroup">
      <el-button type="primary" @click="fetchTableData">筛选</el-button>
      <el-button @click="resetFilter">重置</el-button>
      <el-button type="primary" @click="handleMarkAll">全部已读</el-button>
    </div>

    <div style="">
      <el-table :data="tableData" v-loading="loading" size="small" :border="true">
        <el-table-column label="序号" type="index" width="80" align="center" />
        <el-table-column label="时间" prop="time" width="230" align="center" />
        <el-table-column label="操作者" prop="operator" width="120" align="center" />
        <el-table-column label="设备" prop="deviceName" width="120" align="center" />
        <el-table-column label="位置" prop="nameCHN" width="120" align="center" />
        <el-table-column label="内容" prop="content" align="center" />
        <el-table-column label="等级" prop="level" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="
                row.level === 'success'
                  ? 'success'
                  : row.level === 'warning'
                    ? 'warning'
                    : row.level === 'error'
                      ? 'danger'
                      : 'info'
              "
            >
              {{
                row.level === 'success'
                  ? '成功'
                  : row.level === 'warning'
                    ? '警告'
                    : row.level === 'error'
                      ? '错误'
                      : '普通'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已读" prop="isRead" width="80" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.isRead" disabled />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button link @click="handleMarkAsRead(row.notificationID)" :disabled="row.isRead"
              ><el-icon :color="row.isRead ? '#C0C4CC' : '#409EFF'"><Select /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->

    <el-pagination
      class="pagination"
      :page-size="pageSize"
      :current-page="currentPage"
      :total="totalItems"
      @current-change="handlePageChange"
      layout="total, prev, pager, next"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { getNotifications, markAsRead, markAsReadByFilter } from '@/api/http/notification'
import { buildingNameENGtoCHN } from '@/utils/format'

// 表格数据和筛选条件
const filter = reactive({
  content: '',
  level: '',
  device: '',
  time: '',
  startTime: null,
  endTime: null,
  isRead: 'all', // 默认选择全部状态
  location: '',
})

const currentFilter = reactive({ ...filter }) // 当前显示表格的数据筛选条件

const tableData = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 表格加载状态
const loading = ref(false)

// 获取表格数据
const fetchTableData = async () => {
  loading.value = true
  try {
    let startTime = filter.time[0]
    let endTime = filter.time[1]
    if (startTime && endTime) {
      startTime = filter.time[0] + ' 00:00:00'
      endTime = filter.time[1] + ' 23:59:59'
    }
    const response = await getNotifications({
      filter: {
        ...filter,
        startTime,
        endTime,
      },
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    tableData.value = response.data.notifications
    totalItems.value = response.data.total
    Object.assign(currentFilter, filter) // 更新 currentFilter 为最新的 filter
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilter = () => {
  filter.content = ''
  filter.level = ''
  filter.device = ''
  filter.time = ''
  filter.startTime = null
  filter.endTime = null
  filter.isRead = 'all'
  filter.location = '' // 重置状态为全部
  fetchTableData() // 重置后重新获取数据
}

// 分页变更
const handlePageChange = (page) => {
  currentPage.value = page
  fetchTableData()
}

// 标记通知为已读
const handleMarkAsRead = async (notificationID: number) => {
  try {
    const response = await markAsRead({ notificationID })

    if (response.type === 'success') {
      // 更新对应的行状态
      const row = tableData.value.find((item) => item.notificationID === notificationID)
      if (row) {
        row.isRead = true
      }
    } else {
      console.error('标记失败', response.msg)
    }
  } catch (error) {
    console.error('调用失败', error)
  }
}

// 批量标记通知为已读
const handleMarkAll = async () => {
  loading.value = true
  try {
    const response = await markAsReadByFilter({ filter: currentFilter }) // 使用 currentFilter 作为条件

    if (response.type === 'success') {
      // 刷新表格数据
      fetchTableData()
    } else {
      console.error('标记失败', response.msg)
    }
  } catch (error) {
    console.error('调用失败', error)
  } finally {
    loading.value = false
  }
}

// 初始化表格数据
fetchTableData()
</script>

<style scoped>
.filter-form {
  /* margin-bottom: 10px; */
}
.buttonGroup {
  margin-bottom: 18px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
