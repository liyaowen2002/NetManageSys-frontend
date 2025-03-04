<template>
  <el-button @click="wsOpenStatus ? closeSSHConnection() : buildSSHConnection()">{{
    wsOpenStatus ? '关闭连接' : '建立连接'
  }}</el-button>
  <div class="bg-main">
    <div
      ref="terminal"
      v-loading="loading"
      class="terminal"
      element-loading-text="拼命连接中"
    ></div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  deviceId: {
    type: Number,
    required: true,
  },
})
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { debounce } from 'lodash'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

const terminal = ref(null)
const fitAddon = new FitAddon()

const first = ref(true)
const loading = ref(false)
const terminalSocket = ref<WebSocket | null>(null)
const term = ref<Terminal | null>(null)
// 这个wsOpen和isWsOpen是两个概念,wsOpenStatus是ws连接状态仅在ws的open和close事件更改,isWsOpen是获取ws连接状态
const wsOpenStatus = ref(false)

// 建立连接
const buildSSHConnection = () => {
  loading.value = true
  initWS()
  initTerm()
  onTerminalResize()
}

// 初始化WS
const initWS = () => {
  if (!terminalSocket.value) {
    createWS()
  }
  if (terminalSocket.value && terminalSocket.value.readyState > 1) {
    terminalSocket.value.close()
    createWS()
  }
}

// 创建WS
const createWS = () => {
  terminalSocket.value = new WebSocket(`http://localhost:5200/ssh?id=${props.deviceId}`)
  terminalSocket.value.onopen = runRealTerminal //WebSocket 连接已建立
  terminalSocket.value.onmessage = onWSReceive //收到服务器消息
  terminalSocket.value.onclose = closeRealTerminal //WebSocket 连接已关闭
  terminalSocket.value.onerror = errorRealTerminal //WebSocket 连接出错
}

//WebSocket 连接已建立
const runRealTerminal = () => {
  loading.value = false
  wsOpenStatus.value = true
  console.log('ssh模块的ws连接成功')
}

//WebSocket收到服务器消息
const onWSReceive = (message: MessageEvent) => {
  // 首次接收消息,发送给后端，进行同步适配尺寸
  if (first.value === true) {
    first.value = false
    resizeRemoteTerminal()
  }
  const data = JSON.parse(message.data)
  const base64Content = atob(data.data) // 解码base64
  term.value?.write(base64Content)
  term.value?.element && term.value.focus()
}

//WebSocket 连接出错
const errorRealTerminal = (ex: any) => {
  let message = ex.message
  if (!message) message = 'disconnected'
  term.value?.write(`\x1b[31m${message}\x1b[m\r\n`)
  console.log('ssh模块的ws连接出错')
  wsOpenStatus.value = false
}

//WebSocket 连接已关闭
const closeRealTerminal = () => {
  wsOpenStatus.value = false
  console.log('ssh模块的ws连接关闭')
}

//////////////////////////////////////////////////////////////////////////////////////////

// 初始化Terminal
const initTerm = () => {
  term.value = new Terminal({
    // lineHeight: 1.2,
    fontSize: 14,
    fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
    theme: {
      background: '#181d28',
    },
    // 光标闪烁
    cursorBlink: true,
    cursorStyle: 'underline',
    // scrollback: 100,
    // tabStopWidth: 4,
  })
  term.value.open(terminal.value) //挂载dom窗口
  // term.value.loadAddon(fitAddon) //自适应尺寸
  fitAddon.activate(term.value)
  // 不能初始化的时候fit,需要等terminal准备就绪,可以设置延时操作
  setTimeout(() => {
    fitAddon.fit()
  }, 5)

  // 绑定终端事件
  // 输入与粘贴的情况,onData不能重复绑定,不然会发送多次
  term.value.onData((data) => {
    if (isWsOpen()) {
      terminalSocket.value.send(
        JSON.stringify({
          type: 'terminal',
          data: {
            base64: btoa(data),
          },
        }),
      )
    }
  })
  // 终端尺寸变化触发
  term.value.onResize(() => {
    console.log('1s')
    resizeRemoteTerminal()
  })
}

//尺寸同步 发送给后端,调整后端终端大小,和前端保持一致,不然前端只是范围变大了,命令还是会换行
const resizeRemoteTerminal = () => {
  const { cols, rows } = term.value
  if (isWsOpen()) {
    terminalSocket.value.send(
      JSON.stringify({
        type: 'resize',
        data: {
          rows: rows,
          cols: cols,
        },
      }),
    )
  }
}

// 是否连接中0 1 2 3 状态
const isWsOpen = () => {
  const readyState = terminalSocket.value && terminalSocket.value.readyState
  return readyState === 1
}

// 适应浏览器尺寸变化
const fitTerm = () => {
  fitAddon.fit()
}
const onResize = debounce(() => fitTerm(), 500)
const onTerminalResize = () => {
  window.addEventListener('resize', onResize)
}
const removeResizeListener = () => {
  window.removeEventListener('resize', onResize)
}

const closeSSHConnection = () => {
  removeResizeListener()
  terminalSocket.value && terminalSocket.value.close()
  //移除dom窗口
  term.value?.dispose()
}

onBeforeUnmount(() => {
  closeSSHConnection()
})
</script>
<style lang="less" scoped>
.terminal {
  width: 100%;
  height: calc(100% - 62px);
}
</style>
