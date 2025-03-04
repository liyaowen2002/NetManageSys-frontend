<template>
  <!-- 拓扑预览 Dialog -->
  <el-dialog v-model="dialogVisible" title="拓扑预览" fullscreen>
    <div ref="previewContainer" class="network-preview"></div>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" :loading="isSaving" @click="saveTopology">
        {{ isSaving ? '保存中...' : '保存' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Network } from 'vis-network'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid' // 引入 uuid 库

const previewContainer = ref<HTMLDivElement | null>(null)
const dialogVisible = ref(false) // 控制 el-dialog 显示
const isSaving = ref(false) // 控制保存按钮的 loading 状态

const previewNetwork = ref<Network | null>(null)
const topologyData = ref<{ nodes: any[]; edges: any[]; notes: any[] }>({
  nodes: [],
  edges: [],
  notes: [],
}) // 存储解析出的拓扑数据

// 解析 .net 文件
const parseTopologyData = (text: string) => {
  const nodes: any[] = []
  const edges: any[] = []
  const notes: any[] = []
  const labelToId: Record<string, string> = {} // 改为使用 string 类型的 id

  const lines = text.split('\n')
  let currentNode: any = null
  let nodeType: string | null = null

  lines.forEach((line) => {
    line = line.trim()
    if (line.startsWith('[Non-vBox-DATA]')) {
      if (nodeType === 'device') {
        nodes.push(currentNode)
        labelToId[currentNode.label] = currentNode.id
      } else if (nodeType === 'NOTE') {
        notes.push(currentNode)
      }
      currentNode = null
      return
    }

    if (line.startsWith('[[') && line.endsWith(']]')) {
      if (currentNode) {
        if (nodeType === 'device') {
          nodes.push(currentNode)
          labelToId[currentNode.label] = currentNode.id
        } else if (nodeType === 'NOTE') {
          notes.push(currentNode)
        }
        currentNode = null
      }

      currentNode = {
        id: uuidv4(), // 使用 uuid 生成唯一 id
        label:
          line
            .slice(2, line.length - 2)
            .trim()
            .split(' ')[1] || 'unknown',
        x: null,
        y: null,
      }
    }

    if (line.includes('=') && currentNode) {
      const match = line.match(/(\S+) = (.+)/)
      if (match) {
        const key = match[1]
        const val = match[2]
        if (key === 'x') {
          currentNode.x = parseFloat(val)
        } else if (key === 'y') {
          currentNode.y = parseFloat(val)
        } else if (key === 'text') {
          currentNode.label = val.slice(1, -1)
          nodeType = 'NOTE'
        } else if (
          key === 'device_id' ||
          key === 'bridge_mac' ||
          key === 'slot0' ||
          key === 'symbol' ||
          key === 'font' ||
          key === 'z'
        ) {
          return
        } else {
          nodeType = 'device'
          const match_2 = val.match(/(\S+) (\S+)/)
          if (match_2) {
            const sourceInterface = key
            const targetDeviceLabel = match_2[1]
            const targetInterface = match_2[2]
            const targetDeviceId = labelToId[targetDeviceLabel]
            if (targetDeviceId) {
              edges.push({
                from: currentNode.id,
                to: targetDeviceId,
                label: `${sourceInterface} - ${targetInterface}`,
              })
            }
          }
        }
      }
    }
  })

  if (currentNode) {
    if (nodeType === 'device') {
      nodes.push(currentNode)
      labelToId[currentNode.label] = currentNode.id
    } else if (nodeType === 'NOTE') {
      notes.push(currentNode)
    }
  }

  return { nodes, edges, notes }
}

// 处理文件上传
const beforeUpload = (file: File) => {
  if (!file.name.endsWith('.net')) {
    ElMessage.error('仅支持 .net 文件！')
    return false
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const fileContent = e.target?.result as string
    topologyData.value = parseTopologyData(fileContent)
    console.log(topologyData.value)

    // 显示 dialog
    dialogVisible.value = true

    // 让 Vue 先渲染 dialog，再初始化网络图
    await nextTick()
    if (previewContainer.value) {
      if (previewNetwork.value) {
        previewNetwork.value.destroy()
        previewNetwork.value = null
      }

      // 将 notes 转换为节点数据
      const noteNodes = topologyData.value.notes.map((note) => ({
        id: note.id, // 使用 note.text 作为唯一标识
        label: note.label,
        x: note.x,
        y: note.y,
        font: { size: 14 },
        color: '#ff0000', // 红色文字
        shape: 'text', // 只显示文本，不显示圆形
      }))

      // 合并 nodes 和 noteNodes
      const data = {
        nodes: [...topologyData.value.nodes, ...noteNodes], // 将普通节点和 note 节点合并
        edges: topologyData.value.edges,
      }

      // 初始化 Network
      previewNetwork.value = new Network(previewContainer.value, data, {
        autoResize: true,
        nodes: { shape: 'dot', size: 20 },
        edges: { width: 2 },
        physics: { enabled: false },
        interaction: { dragNodes: true, zoomView: true, dragView: true },
      })
    }
  }
  reader.readAsText(file)
  return false // 阻止默认上传行为
}

// 保存拓扑
const saveTopology = async () => {
  isSaving.value = true

  try {
    console.log('当前拓扑数据:', topologyData.value) // 打印 Vis 网络数据
    ElMessage.success('拓扑数据保存成功！')
    dialogVisible.value = false // 关闭弹窗
  } catch {
    ElMessage.error('保存失败，请重试！')
  } finally {
    isSaving.value = false
  }
}

// 关闭 dialog
const closeDialog = () => {
  dialogVisible.value = false
}

defineExpose({ beforeUpload })
</script>

<style lang="less" scoped>
.network-preview {
  width: 100%;
  height: 80vh;
}
</style>
