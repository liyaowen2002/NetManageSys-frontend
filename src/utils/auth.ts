import { jwtDecode } from 'jwt-decode'

// 从 JWT 中解析用户权限信息
export function getPermissionsFromToken(token) {
  try {
    const decoded = jwtDecode(token)
    console.log(decoded)
    return decoded.role || [] // 假设权限信息存储在 JWT 的 permissions 字段中
  } catch (error) {
    console.error('解析 JWT 失败:', error)
    return []
  }
}

export function checkPermission(permission) {
  const token = localStorage.getItem('authToken') // 从 localStorage 获取 JWT
  if (!token) return false

  const userRole = getPermissionsFromToken(token)
  // userRole是用户角色，permission是允许的角色
  return userRole === permission
}
