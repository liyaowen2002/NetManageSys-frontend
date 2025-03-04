import http from '@/utils/axois/request'

export function getUnreadCountByLevel() {
  return http.get('/notification/unreadCountByLevel', { showMsg: false })
}

export function markAsReadByDefalutFilter() {
  return http.post('/notification/markAllAsRead', { filter: { isRead: 'unread' } })
}

export function getSetupTimestamp() {
  return http.get('/getSetupTimestamp', { showMsg: false })
}
