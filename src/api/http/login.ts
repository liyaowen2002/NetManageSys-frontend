import http from '@/utils/axois/request'

export function accoutLogin(params) {
  return http.post('/login', params)
}

export function initWhenBack() {
  return http.get('/initWhenBack')
}
