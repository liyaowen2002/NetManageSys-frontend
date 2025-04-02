<template>
  <canvas ref="canvasFrame" style="position: absolute; top: 0; z-index: 0"></canvas>
  <div class="logincard">
    <el-card>
      <template #header>
        <div style="font-weight: bold">NetManageSys</div>
      </template>
      <el-form :model="userInfo" :rules="rules" ref="loginForm" :hide-required-asterisk="true">
        <el-form-item label="账号" prop="username">
          <el-input v-model="userInfo.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userInfo.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="submitForm" :loading="isLoading"> 登录 </el-button>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { accoutLogin } from '@/api/http/login'
import { useRouter } from 'vue-router'
import { useAccoutStore } from '@/stores/accout'
import { useDevicesStore } from '@/stores/devices'
import { initWebSocket } from '@/api/ws/notification'
import type { FormInstance, FormRules } from 'element-plus'
const canvasFrame = ref()
const devicesStore = useDevicesStore()
const accoutStore = useAccoutStore()
const router = useRouter()
const loginForm = ref<FormInstance>()
const userInfo = reactive({
  username: 'admin',
  password: 'admin',
})

const isLoading = ref(false)
// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    // { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    // { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
})
const submitForm = async () => {
  if (!loginForm.value) return
  try {
    // 验证表单
    await loginForm.value.validate()

    isLoading.value = true
    const res = await accoutLogin(userInfo)

    // 存储账号信息
    accoutStore.$patch({
      nickname: res.data.nickname,
      username: res.data.username,
      role: res.data.role,
    })
    localStorage.setItem('authToken', res.data.token)

    // 建立 WebSocket 连接
    await initWebSocket()

    // 更新设备列表
    devicesStore.updateDevicesList()

    // 跳转页面
    router.replace('/overview')
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

interface Circle {
  x: number
  y: number
  speed: number
  xDir: number
  yDir: number
  r: number
}

interface Line {
  start: Circle
  end: Circle
  ratio: number
}

class CircleAnimation {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number | null = null
  private arr: Circle[] = []
  private lineArr: Line[] = []
  private dist: number
  private resizeHandler: () => void

  constructor(num: number, canvas: HTMLCanvasElement) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Invalid canvas element provided')
    }

    this.canvas = canvas
    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get 2D rendering context')
    }
    this.ctx = context

    this.dist = 300
    this.resizeHandler = this.handleResize.bind(this)

    this.initCanvasSize()
    this.initCircles(num)
    this.setupEventListeners()
    this.startAnimation()
  }

  private initCanvasSize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  private initCircles(num: number): void {
    this.arr = Array.from(
      { length: num },
      (): Circle => ({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 1.5 + 0.5,
        xDir: Math.random() > 0.5 ? -1 : 1,
        yDir: Math.random() > 0.5 ? -1 : 1,
        r: 2,
      }),
    )
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.resizeHandler)
  }

  private handleResize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  private updateCirclePositions(): void {
    this.arr.forEach((item) => {
      item.x += item.xDir * item.speed
      item.y += item.yDir * item.speed

      // Boundary checks
      if (item.x <= 0) {
        item.x = 0
        item.xDir = 1
      } else if (item.x >= this.canvas.width) {
        item.x = this.canvas.width - 1
        item.xDir = -1
      }

      if (item.y <= 0) {
        item.y = 0
        item.yDir = 1
      } else if (item.y >= this.canvas.height) {
        item.y = this.canvas.height - 1
        item.yDir = -1
      }
    })
  }

  private drawCircles(): void {
    this.ctx.fillStyle = 'rgb(26,52,135)'
    this.arr.forEach((item) => {
      this.ctx.beginPath()
      this.ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI)
      this.ctx.fill()
    })
  }

  private calculateLines(): void {
    this.lineArr = []
    const len = this.arr.length

    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx = this.arr[i].x - this.arr[j].x
        const dy = this.arr[i].y - this.arr[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.dist) {
          this.lineArr.push({
            start: this.arr[i],
            end: this.arr[j],
            ratio: distance / this.dist,
          })
        }
      }
    }
  }

  private drawLines(): void {
    this.lineArr.forEach((item) => {
      const colorValue = Math.floor(255 * item.ratio)
      this.ctx.beginPath()
      this.ctx.strokeStyle = `rgb(${colorValue},${colorValue},${colorValue})`
      this.ctx.moveTo(item.start.x, item.start.y)
      this.ctx.lineTo(item.end.x, item.end.y)
      this.ctx.stroke()
    })
  }

  private animate(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.updateCirclePositions()
    this.drawCircles()
    this.calculateLines()
    this.drawLines()

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  public startAnimation(): void {
    if (!this.animationId) {
      this.animate()
    }
  }

  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public dispose(): void {
    this.stopAnimation()
    window.removeEventListener('resize', this.resizeHandler)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

// 使用示例
let circleAnimation: CircleAnimation | null = null

onMounted(() => {
  if (canvasFrame.value) {
    circleAnimation = new CircleAnimation(25, canvasFrame.value)
  }
})

onUnmounted(() => {
  if (circleAnimation) {
    circleAnimation.dispose()
    circleAnimation = null
  }
})
</script>
<style lang="less" scoped>
.logincard {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>
