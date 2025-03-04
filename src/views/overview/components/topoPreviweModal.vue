<template>
  <div class="topoPreview" ref="topoPreviewContainer"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Network, DataSet } from 'vis-network/standalone'
const emits = defineEmits([
  'enterTopoView',
  'leaveTopoView',
  'highLightBuilding',
  'quitHighLightBuilding',
])
const topoPreviewContainer = ref<HTMLDivElement | null>(null)

const network = ref<Network | null>(null)

// 节点数据
const nodes = new DataSet([
  // { id: 1, label: 'Core', customData: { ip: '192.168.1.1', role: '核心交换机' } },
  // { id: 2, label: 'ACC1', customData: { ip: '192.168.1.2', role: '接入交换机' } },
  // { id: 3, label: 'ACC2', customData: { ip: '192.168.1.3', role: '接入交换机' } },
  // { id: 4, label: 'Router', customData: { ip: '192.168.1.254', role: '路由器' } },
  // { id: 5, label: 'PC1', customData: { ip: '192.168.1.100', role: '终端设备' } },

  {
    id: 1,
    label: 'router',
    x: -410.33333333333337,
    y: -552.3333333333336,
    customData: { bindDeviceId: 63 },
  },
  {
    id: 2,
    label: 'core',
    x: -416.0476190476191,
    y: -180.90476190476193,
    customData: { bindDeviceId: null },
  },
  {
    id: 3,
    label: 'S6850_3',
    x: -591.857142857143,
    y: 8.904761904761884,
    customData: { bindDeviceId: null },
  },
  {
    id: 4,
    label: 'PC_4',
    x: -590.666666666667,
    y: 250.00000000000006,
    customData: { bindDeviceId: null },
  },
  {
    id: 5,
    label: 'S6850_5',
    x: -192.0000000000001,
    y: 0.3333333333333215,
    customData: { bindDeviceId: null },
  },
  {
    id: 6,
    label: 'PC_6',
    x: -193.66666666666669,
    y: 253.33333333333337,
    customData: { bindDeviceId: null },
  },
  {
    id: 7,
    label: 'S6850_7',
    x: -775.0000000000001,
    y: -182.3333333333334,
    customData: { bindDeviceId: null },
  },
  {
    id: 8,
    label: 'Host_1',
    x: -1066.3333333333333,
    y: -182.3333333333334,
    customData: { bindDeviceId: null },
  },
])

// 边数据
const edges = new DataSet([
  { from: 2, to: 1, label: 'GE_0/1 - GE_0/0', id: '256aa3d6-5405-4174-ad20-3714af07d000' },
  { from: 3, to: 2, label: 'GE_0/1 - GE_0/2', id: '1cc82d95-f4d8-4e5c-923a-06fc176a5f56' },
  { from: 4, to: 3, label: 'GE_0/1 - GE_0/2', id: 'f8525481-18dc-46b1-adb8-23dc1f769fa1' },
  { from: 5, to: 2, label: 'GE_0/1 - GE_0/3', id: 'ffa408ec-ae02-426d-92c4-9c98748f45e8' },
  { from: 6, to: 5, label: 'GE_0/1 - GE_0/2', id: 'bbcb91ea-0450-4da1-b209-bcf13a7d2c04' },
  { from: 7, to: 2, label: 'GE_0/1 - GE_0/4', id: 'b3db6db1-40e4-4915-8c87-b30f7a29ae71' },
  { from: 8, to: 7, label: '环回适配器_0 - GE_0/2', id: 'c62a1325-0c4f-402c-9f9d-473bb32893f5' },
])

const note = new DataSet([
  { id: 9, label: '1', x: -790.6666666666667, y: -234.66666666666669, text: '10.10.100.6' },
  { id: 10, label: '2', x: -1105.666666666667, y: -234.66666666666677, text: '10.10.100.5' },
  { id: 11, label: '3', x: -202.0000000000001, y: -46.33333333333335, text: '10.10.100.4' },
  { id: 12, label: '4', x: -691.6190476190479, y: -29.904761904761926, text: '10.10.100.3' },
  { id: 13, label: '5', x: -452, y: -703.8333333333335, text: '192.168.66.100' },
  { id: 14, label: '6', x: -457, y: -592.833333333333, text: '192.168.66.200' },
  { id: 15, label: '7', x: -445.33333333333337, y: -457.8333333333333, text: '10.10.100.2' },
  { id: 16, label: '8', x: -436, y: -250.5, text: '10.10.100.1' },
])

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
    emits('highLightBuilding', nodeData.customData.bindDeviceId)
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
  background-image: linear-gradient(var(--Base-Border) 1px, transparent 1px),
    linear-gradient(90deg, var(--Base-Border) 1px, transparent 1px);
  background-size: 25px 25px;
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
