import http from '@/utils/axois/request'

export function addDevice(params) {
  return http.post('/devicesManage/addDevice', params)
}

export function addConfirm(params) {
  return http.post('/devicesManage/addConfirm', params)
}

export function getLatestDevicesList() {
  return http.get('/devicesManage/getLatestDevicesList', { showMsg: false })
}

export function removeDevice(params) {
  return http.delete('/devicesManage/removeDevice?id=' + params)
}

export function removeDeviceBatch(params) {
  return http.delete('/devicesManage/removeDeviceBatch?ids=' + params)
}

// export function syncDeviceInfo() {
//   return http.get('/devicesManage/syncInfo')
// }
