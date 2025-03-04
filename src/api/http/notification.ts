import http from '@/utils/axois/request'
import type { AxiosResponse } from 'axios'
interface row {
  content: string
  deviceID: string
  deviceName: string
  isRead: string
  level: string
  notificationID: string
  time: string
}
interface notificationsTable {
  notifications: row[]
  total: number
}

export function getNotifications(params): Promise<AxiosResponse<notificationsTable>> {
  return http.post('/notification/getNotifications', params, { showMsg: false })
}

export function markAsRead(params) {
  return http.post('/notification/markAsRead', params)
}

export function markAsReadByFilter(params) {
  return http.post('/notification/markAllAsRead', params)
}
