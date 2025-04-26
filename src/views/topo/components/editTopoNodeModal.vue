<template>
  <el-dialog v-model="isModalVisiable" :title="nodeInfo.label" width="500">
    <el-form :model="nodeInfo" label-width="auto">
      <el-form-item label="绑定建筑" prop="bindDeviceId">
        <el-select v-model="nodeInfo.bindBuilding">
          <el-option
            v-for="building in Object.keys(buildingNameENGtoCHN)"
            :key="building"
            :value="building"
            :label="buildingNameENGtoCHN[building]"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="saveTheNodeInfo" :loading="isSaving"> 保存 </el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { buildingNameENGtoCHN } from '@/utils/format'
import { bindBuilding } from '@/api/http/topo'
const isModalVisiable = ref(false)
const nodeInfo = ref({
  bindBuilding: null,
  id: '',
  label: '',
})
const isSaving = ref(false)

const openModal = (nodeData: object) => {
  console.log(nodeData)
  isModalVisiable.value = true
  if (nodeData) {
    nodeInfo.value.id = nodeData.id
    nodeInfo.value.label = nodeData.label
    nodeInfo.value.bindBuilding = nodeData.bindBuildingNameENG
  }
}
defineExpose({ openModal })
const saveTheNodeInfo = async () => {
  try {
    isSaving.value = true
    await bindBuilding({
      id: nodeInfo.value.id,
      bindBuilding: nodeInfo.value.bindBuilding,
    })
    isModalVisiable.value = false
  } catch (err) {
    console.log(err)
  } finally {
    isSaving.value = false
  }
}
</script>
