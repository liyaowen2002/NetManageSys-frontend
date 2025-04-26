import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 开发环境配置
// 通过hcl模拟网络
const baseURL = 'http://10.1.25.100:5200'
// 直连本地服务
// const baseURL = 'http://localhost:5200'
declare module 'axios' {
  interface AxiosResponse<T = any> {
    type: string
    msg: string
    data: T
    // 这里追加你的参数
  }
  export function create(config?: AxiosRequestConfig): AxiosInstance
}

// 创建axios实例
const http = axios.create({
  baseURL: baseURL,
  // timeout: 10000, // 超时时间，这里注释掉了，就表示会一直等
})

// 设置默认请求数据格式
http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'

// 请求拦截
http.interceptors.request.use(
  (request) => {
    // 每个请求带上token
    const token = localStorage.getItem('authToken')
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return request
  },
  (error) => {
    return error
  },
)

// 正常通信全是200，通过type来传递信息类型
// 如果是涉及到卡流程的需要抛异常的再通过http状态码来抛错
// 抛错msg放提示信息，data里err放错误具体信息
http.interceptors.response.use(
  (response) => {
    const { config } = response // 获取响应数据和配置项
    const { showMsg = true } = config // 默认显示消息，如果配置为 false，则不显示

    if (showMsg) {
      switch (response.data.type) {
        case 'success':
          ElMessage.success(response.data.msg)
          break
        case 'error':
          ElMessage.error(response.data.msg)
          break
        case 'warning':
          ElMessage.warning(response.data.msg)
          break
        default:
          ElMessage(response.data.msg)
          break
      }
    }

    return response.data
  },
  (error) => {
    // 判断是否超时
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('服务器响应超时')
      throw new Error('服务器响应超时') // 抛出超时错误
    }

    // 处理其他错误
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          ElMessage.error(data.msg || '口令过期')
          break
        case 401:
          ElMessage.error(data.msg || '登录已过期，请重新登录')
          router.replace('/login')
          break
        case 500:
          ElMessage.error(data.msg || '服务器内部错误')
          break
        default:
          ElMessage.error(data.msg || `请求错误：${status}`)
      }
    } else {
      ElMessage.error(error.message || '网络错误，请检查连接')
    }

    // 抛出错误以便调用方捕获
    throw error
  },
)

export default http
