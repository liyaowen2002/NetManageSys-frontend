import http from '@/utils/axois/request'

export function getDeviceInfo(params) {
  return http.get('/deviceConfig/staticInfo?id=' + params, { showMsg: false })
}

export function getDeviceInterfaceInfo(params) {
  return http.get('/deviceConfig/interface?id=' + params, { showMsg: false })
}

export function getDeviceRouteInfo(params) {
  return http.get('/deviceConfig/route?id=' + params, { showMsg: false })
}

export function getDeviceArpInfo(params) {
  return http.get('/deviceConfig/arp?id=' + params, { showMsg: false })
}

export function getDeviceHardwareInfo(params) {
  return http.get('/deviceConfig/hardware?id=' + params, { showMsg: false })
}

export function editSysInfo(params) {
  return http.post('/deviceConfig/editSysInfo', params)
}
