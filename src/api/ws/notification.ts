import { ElNotification } from 'element-plus'
import { useDevicesStore } from '@/stores/devices'

// wsService.ts
let socket: WebSocket | null = null // 存储 WebSocket 实例，初始为 null

// 初始化 WebSocket 连接并返回 Promise，确保连接建立后再继续执行后续操作
export const initWebSocket = (): Promise<WebSocket> => {
  const WS_URL = `http://localhost:5200/notification?clientId=${localStorage.getItem('authToken')}` // WebSocket 服务的 URL
  return new Promise((resolve, reject) => {
    // pinina
    const devicesStore = useDevicesStore()

    // 如果 socket 已经存在并且是连接状态，直接返回
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已经连接')
      resolve(socket)
      return
    }

    // 创建新的 WebSocket 连接
    socket = new WebSocket(WS_URL)

    socket.onopen = () => {
      console.log('WebSocket 连接已建立')
      resolve(socket) // WebSocket 建立成功，返回 WebSocket 实例
    }

    socket.onerror = (error: Event) => {
      console.error('WebSocket 错误:', error)
      reject(error) // 如果连接发生错误，返回错误
    }

    socket.onclose = () => {
      console.log('WebSocket 连接已关闭')
    }

    // 接收来自服务器的消息
    socket.onmessage = (event) => {
      // 根据需要解析和处理消息
      const message = JSON.parse(event.data)

      console.log('收到通知:', message)

      ElNotification({
        title: message.msg,
        message: message.data.detail,
        type: message.type,
      })
      devicesStore.updateDevicesList()
    }
  })
}

// 发送消息到 WebSocket 服务
export const sendMessage = (message: object): void => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket 未连接，无法发送消息')
    return
  }
  socket.send(JSON.stringify(message))
}

// 获取 WebSocket 实例
export const getWebSocket = (): WebSocket | null => socket

// 关闭 WebSocket 连接
export const closeWebSocket = (): void => {
  if (socket) {
    socket.close()
    socket = null // 关闭后置为 null，方便重新连接
  }
}
