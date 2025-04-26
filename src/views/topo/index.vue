<template>
  <div class="topology-container" v-loading="isLoading">
    <div ref="networkContainer" class="network"></div>
    <div class="bottom-bar" v-auth="'administrator'">
      <input
        type="file"
        ref="fileInput"
        @change="openDecodeTopoFileModal"
        accept=".net"
        style="display: none"
      />
      <el-button v-if="!isEditingTopo" type="primary" @click="selectFile"
        >从拓扑文件中解析</el-button
      >

      <el-button v-if="isEditingTopo" :disabled="isLineing" @click="handleNewNode"
        >添加节点</el-button
      >
      <el-button v-if="isEditingTopo" :disabled="isLineing" @click="handleNewNote"
        >添加文本</el-button
      >
      <el-button v-if="isEditingTopo" :disabled="isLineing" @click="handleNewEdge"
        >添加连线</el-button
      >
      <el-button v-if="isEditingTopo" :disabled="isLineing" @click="handleSaveEdit" type="primary"
        >保存修改</el-button
      >
      <el-button v-if="isEditingTopo" :disabled="isLineing" @click="handleQuitEdit" type="danger"
        >放弃修改</el-button
      >
      <el-button v-if="!isEditingTopo" @click="isEditingTopo = true">修改拓扑图</el-button>
    </div>

    <decodeTopoFileModal
      ref="decodeTopoFileModalRef"
      :rawTopoData="rawTopoData"
      @handleUpdateTopoData="getTopoData"
    ></decodeTopoFileModal>

    <editTopoNodeModal ref="editTopoNodeModalRef"></editTopoNodeModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Network, DataSet } from 'vis-network/standalone'
import decodeTopoFileModal from './components/decodeTopoFileModal.vue'
import editTopoNodeModal from './components/editTopoNodeModal.vue'
import { getTopo } from '@/api/http/topo'
import { v4 as uuidv4 } from 'uuid' // 引入 uuid 库
import { updateTopo } from '@/api/http/topo'
import { ElMessage } from 'element-plus'

const isLoading = ref(false)
const isEditingTopo = ref(false)
// 定义 ref 的类型
const decodeTopoFileModalRef = ref<InstanceType<typeof decodeTopoFileModal>>()
const editTopoNodeModalRef = ref<InstanceType<typeof editTopoNodeModal>>()
const networkContainer = ref<HTMLDivElement | null>(null)
const network = ref<Network | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// 初始化 nodes 和 edges
const rawTopoData = ref<oneTopoData[]>([])
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

const initFromRawTopoData = () => {
  // 清空现有的 nodes 和 edges
  nodes.clear()
  edges.clear()

  // 遍历接口返回的数据
  rawTopoData.value.data.forEach((item: oneTopoData) => {
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
  if (network.value) {
    network.value.fit()
  }
}
// 获取拓扑数据的函数
const getTopoData = async () => {
  try {
    // 从接口获取数据
    rawTopoData.value = await getTopo() // 假设 getTopo 是一个返回拓扑数据的 API 调用
    initFromRawTopoData()
  } catch (error) {
    console.error('获取拓扑数据失败:', error)
  }
}
const init = async () => {
  try {
    isLoading.value = true
    await getTopoData()
  } catch (err) {
    console.log(err)
  } finally {
    isLoading.value = false
  }
}
// 调用函数获取数据
init()

const openDecodeTopoFileModal = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  decodeTopoFileModalRef.value?.beforeUpload(file)
}

const selectFile = () => {
  if (isEditingTopo.value) return
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click() // 触发文件选择窗口
  }
}

const handleNewNode = () => {
  if (!isEditingTopo.value) return
  const label = prompt('请输入节点名称:')
  if (label) {
    if (label.length > 10) {
      ElMessage({
        message: '节点名称超过字数限制',
        type: 'error',
      })
      return
    }
    const center = network.value?.getViewPosition() // 获取当前视图中心点
    if (center) {
      const newNode = {
        id: uuidv4(), // 生成唯一 ID
        label,
        x: center.x,
        y: center.y,
        type: 'node',
      }
      nodes.add(newNode)
    }
  } else {
    ElMessage({
      message: '节点名称不能为空',
      type: 'error',
    })
  }
}

const handleNewNote = () => {
  if (!isEditingTopo.value) return
  const label = prompt('请输入文本内容:')
  if (label) {
    if (label.length > 20) {
      ElMessage({
        message: '文本内容超过字数限制',
        type: 'error',
      })
      return
    }
    const center = network.value?.getViewPosition() // 获取当前视图中心点
    if (center) {
      const newNote = {
        id: uuidv4(), // 生成唯一 ID
        label,
        x: center.x,
        y: center.y,
        type: 'note',
        font: { size: 14 },
        shape: 'text',
      }
      nodes.add(newNote)
    }
  } else {
    ElMessage({
      message: '文本内容不能为空',
      type: 'error',
    })
  }
}

let firstNodeId: string | null = null // 记录第一个点击的节点 ID
const isLineing = ref(false)
const handleNewEdge = () => {
  if (!isEditingTopo.value) return
  if (network.value) {
    isLineing.value = true
    // 进入连线模式
    network.value.on('click', handleEdgeClick)
    ElMessage({
      message: '请依次点击两个节点以创建连线',
      type: 'info',
    })
  }
}

const handleEdgeClick = (params: any) => {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0]
    const nodeData = nodes.get(nodeId)

    // 检查节点类型，不能是 note
    if (nodeData.type === 'note') {
      ElMessage({
        message: '不能连接文本节点',
        type: 'error',
      })
      return
    }

    if (!firstNodeId) {
      // 记录第一个节点
      firstNodeId = nodeId
      ElMessage({
        message: `已选择第一个节点: ${nodeData.label}`,
        type: 'info',
      })
      // alert(`已选择第一个节点: ${nodeData.label}`)
    } else {
      // 选择第二个节点
      const label = prompt('请输入连线标签:')
      if (label) {
        if (label.length > 10) {
          ElMessage({
            message: '连线超过字数限制',
            type: 'error',
          })
        } else {
          const newEdge = {
            id: uuidv4(), // 生成唯一 ID
            from: firstNodeId,
            to: nodeId,
            label,
            type: 'edge',
          }
          edges.add(newEdge)
        }
      } else {
        const newEdge = {
          id: uuidv4(), // 生成唯一 ID
          from: firstNodeId,
          to: nodeId,
          type: 'edge',
        }
        edges.add(newEdge)
      }
      // 无论是否成功创建连线，都重置状态
      isLineing.value = false
      firstNodeId = null
      network.value?.off('click', handleEdgeClick) // 退出连线模式
      return
    }
  }
}

const handleSaveEdit = async () => {
  if (!isEditingTopo.value) return
  try {
    isLoading.value = true
    isEditingTopo.value = false

    // 获取所有节点和边数据
    const allNodes = nodes.get()
    const allEdges = edges.get()

    // 处理节点数据，移除 note 类型的 font 和 shape 属性
    const processedNodes = allNodes.map((node) => {
      if (node.type === 'note') {
        // 如果是 note 类型，移除 font 和 shape 属性
        const { font, shape, ...rest } = node
        return rest
      }
      return node
    })
    const res = await updateTopo([...processedNodes, ...allEdges]) // 调用 API 进行保存
    if (res.type === 'success') {
      await getTopoData()
    }
  } catch (err) {
    console.log(err)
  } finally {
    isLoading.value = false
  }
}

const handleQuitEdit = () => {
  if (!isEditingTopo.value) return
  isEditingTopo.value = false
  firstNodeId = null // 重置 firstNodeId
  initFromRawTopoData()
}

const openEditModal = (nodeId: string) => {
  const nodeData = nodes.get(nodeId)
  if (nodeData) {
    editTopoNodeModalRef.value.openModal(nodeData)
  }
}

onMounted(() => {
  if (!networkContainer.value) return

  // 初始化 network
  network.value = new Network(
    networkContainer.value,
    { nodes, edges },
    {
      autoResize: true,
      layout: { hierarchical: false },
      physics: { enabled: false },
      interaction: { dragNodes: true, zoomView: true, dragView: true, hover: true },
    },
  )

  // 监听右键点击事件
  network.value.on('oncontext', (params) => {
    if (!isEditingTopo.value || isLineing.value) return
    params.event.preventDefault() // 阻止默认右键菜单

    // 获取右键点击的节点
    const nodeId = network.value?.getNodeAt({
      x: params.pointer.DOM.x,
      y: params.pointer.DOM.y,
    })

    // 获取右键点击的边
    const edgeId = network.value?.getEdgeAt({
      x: params.pointer.DOM.x,
      y: params.pointer.DOM.y,
    })

    if (nodeId) {
      // 右键点击节点
      if (confirm('确定删除该节点吗？')) {
        nodes.remove(nodeId)
        // 删除与该节点相关的边
        edges.get().forEach((edge) => {
          if (edge.from === nodeId || edge.to === nodeId) {
            edges.remove(edge.id)
          }
        })
      }
    } else if (edgeId) {
      // 右键点击边
      if (confirm('确定删除该连线吗？')) {
        edges.remove(edgeId)
      }
    } else {
      // 右键点击空白区域
      console.log('右键点击空白区域')
    }
  })

  // 监听双击事件
  network.value.on('doubleClick', (params) => {
    if (isEditingTopo.value) return
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      const nodeData = nodes.get(nodeId)
      if (nodeData.type === 'node') {
        // 只有 node 类型可以触发编辑
        openEditModal(nodeId)
      }
    }
  })
})
onUnmounted(() => {
  if (network.value) {
    network.value.off('oncontext')
    network.value.off('doubleClick')
  }
})
</script>

<style scoped>
.topology-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.network {
  width: 100%;
  height: 100%;
  /* background-image: linear-gradient(var(--Base-Border) 1px, transparent 1px),
    linear-gradient(90deg, var(--Base-Border) 1px, transparent 1px);
  background-size: 25px 25px; */
  background-image: url(topoBG.svg);
}

.bottom-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--background-white-transparent-1);
  backdrop-filter: blur(15px);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  /* gap: 10px; */
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0%);
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
}
</style>
