import { checkPermission } from '@/utils/auth'

export default {
  mounted(el, binding) {
    const { value } = binding // 获取指令的值（权限标识）
    if (value && !checkPermission(value)) {
      // 如果没有权限，移除元素
      el.parentNode?.removeChild(el)
    }
  },
}
