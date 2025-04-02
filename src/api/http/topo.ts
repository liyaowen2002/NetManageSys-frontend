import http from '@/utils/axois/request'

export function updateTopo(params) {
  return http.post('/topoManage/updateTopo', params)
}

export function getTopo() {
  return http.get('/topoManage/getTopo', { showMsg: false })
}

export function bindBuilding(params) {
  return http.post('/topoManage/bindBuilding', params)
}
