<template>
  <div class="topoPreview" ref="topoPreviewContainer"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Network, DataSet } from 'vis-network/standalone'
import { getTopo } from '@/api/http/topo'
const emits = defineEmits([
  'enterTopoView',
  'leaveTopoView',
  'highLightBuilding',
  'quitHighLightBuilding',
])
const topoPreviewContainer = ref<HTMLDivElement | null>(null)

const network = ref<Network | null>(null)

// 初始化 nodes 和 edges
const nodes = new DataSet([])
const edges = new DataSet([])

type oneTopoData = {
  id: string
  type: string
  label: string
  x: number
  y: number
  from: string
  to: string
  custom_data: object
}
// 获取拓扑数据的函数
const getTopoData = async () => {
  try {
    // 从接口获取数据
    const res = await getTopo() // 假设 getTopo 是一个返回拓扑数据的 API 调用

    // 清空现有的 nodes 和 edges
    nodes.clear()
    edges.clear()

    // 遍历接口返回的数据
    res.data.forEach((item: oneTopoData) => {
      if (item.type === 'node' || item.type === 'note') {
        if (item.type === 'note') {
          nodes.add({
            ...item,
            font: { size: 14 }, // 红色文字
            shape: 'text', // 只显示文本
          })
        } else {
          nodes.add({ ...item })
        }
      } else if (item.type === 'edge') {
        edges.add({ ...item })
      }
    })

    // 数据加载完成后，将图居中显示
    if (network.value) {
      network.value.fit()
    }
  } catch (error) {
    console.error('获取拓扑数据失败:', error)
  }
}

// 调用函数获取数据
getTopoData()

onMounted(() => {
  if (!topoPreviewContainer.value) return

  // 初始化 network
  network.value = new Network(
    topoPreviewContainer.value,
    { nodes, edges },
    {
      autoResize: true,
      layout: { hierarchical: false },
      physics: { enabled: false },
      interaction: { dragNodes: true, zoomView: true, dragView: true, hover: true },
    },
  )

  // 监听鼠标悬停事件
  network.value.on('hoverNode', (params) => {
    const nodeData = nodes.get(params.node) // 获取完整节点数据
    if (nodeData.bindBuildingNameENG !== null)
      emits('highLightBuilding', nodeData.bindBuildingNameENG, 'select', true, true)
  })
  network.value.on('blurNode', () => {
    emits('quitHighLightBuilding')
  })
  // 鼠标悬停时触发
  topoPreviewContainer.value.addEventListener('mouseover', () => {
    emits('enterTopoView')
  })

  // 鼠标离开时触发
  topoPreviewContainer.value.addEventListener('mouseout', () => {
    emits('leaveTopoView')
  })
})
onUnmounted(() => {
  // 鼠标悬停时触发
  topoPreviewContainer.value?.removeEventListener('mouseover', () => {
    emits('enterTopoView')
  })

  // 鼠标离开时触发
  topoPreviewContainer.value?.removeEventListener('mouseout', () => {
    emits('leaveTopoView')
  })
  network.value?.destroy()
})
</script>
<style lang="less" scoped>
.topoPreview {
  position: absolute;
  z-index: 2; /* 确保弹窗在最上层 */
  right: 0;
  top: 0;
  height: 100%;
  height: 120px;
  width: 120px;
  margin: 20px 25px;
  transform-origin: top right; /* 设置变换基点在右上角 */
  overflow: hidden;
  border-radius: 60px;
  background-image: url(topoBG.svg);
  background-color: var(--background-white-transparent-1);
  backdrop-filter: blur(15px);
  box-shadow: var(--el-box-shadow);
  transition:
    width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-radius 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.topoPreview:hover {
  width: 700px;
  height: calc(100% - 40px);
  border-radius: var(--el-border-radius-base);
}
</style>
