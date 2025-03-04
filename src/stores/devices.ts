import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { getLatestDevicesList } from '@/api/http/devicesManage'
import { buildingNameENGtoCHN } from '@/utils/format'
import type { forEach } from 'lodash'

type deviceByIdType = {
  name: string
  status: string
  model: string
  ip: string
  type: string
  location: string
}
type deviceByLocationType = {
  id: string
  name: string
  status: string
  model: string
  ip: string
  type: string
}
type devicesListByIdType = {
  [key: string]: deviceByIdType
}
type devicesListByLocationType = {
  [key: string]: deviceByLocationType[]
}
type responseType = {
  type: string
  msg: string
  data: {
    devicesList: devicesListByIdType
  }
}
export const useDevicesStore = defineStore('devices', () => {
  // 使用 reactive 创建响应式对象
  const devicesListById = ref<devicesListByIdType>()

  const devicesListByLocation = ref<devicesListByLocationType>({})

  // 更新设备列表的方法
  const updateDevicesList = async () => {
    try {
      const response: responseType = await getLatestDevicesList()
      devicesListById.value = response.data.devicesList

      devicesListByLocation.value = {}
      Object.entries(response.data.devicesList).forEach(([id, device]) => {
        const location = device.location
        // 1.首先判断这个地址在映射里有没有
        if (buildingNameENGtoCHN[location]) {
          // 判断devicesList是否已经有这个分类了
          if (!devicesListByLocation.value[buildingNameENGtoCHN[location]]) {
            devicesListByLocation.value[buildingNameENGtoCHN[location]] = []
          }
          // 如果有的话
          devicesListByLocation.value[buildingNameENGtoCHN[location]].push({
            id,
            name: device.name,
            status: device.status,
            model: device.model,
            ip: device.ip,
            type: device.type,
          })
        } else {
          if (!devicesListByLocation.value['未知建筑']) {
            devicesListByLocation.value['未知建筑'] = []
          }
          // 没有的话
          devicesListByLocation.value['未知建筑'].push({
            id,
            name: device.name,
            status: device.status,
            model: device.model,
            ip: device.ip,
            type: device.type,
          })
        }
        Object.keys(buildingNameENGtoCHN).forEach((key) => {
          if (!devicesListByLocation.value[buildingNameENGtoCHN[key]]) {
            devicesListByLocation.value[buildingNameENGtoCHN[key]] = []
          }
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  // 返回设备列表
  const getDevicesListById = () => {
    return devicesListById
  }
  const getDevicesListByLocation = () => {
    return devicesListByLocation
  }

  return { updateDevicesList, getDevicesListById, getDevicesListByLocation }
})
