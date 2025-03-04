<template>
  <div class="modal">
    <div class="pannel">
      <div class="header p-15">
        <el-icon @click="emits('closeModal')" size="20" class="icon"><Close /></el-icon>
        <div>节点信息</div>
      </div>

      <div class="content">
        <el-collapse v-model="activeItems">
          <el-collapse-item title="节点" name="device">
            <div>
              Consistent with real life: in line with the process and logic of real life, and comply
              with languages and habits that the users are used to;
            </div>
          </el-collapse-item>
          <el-collapse-item title="连接" name="edge">
            <div>
              Consistent with real life: in line with the process and logic of real life, and comply
              with languages and habits that the users are used to;
            </div>
          </el-collapse-item>
          <el-collapse-item title="文本" name="note">
            <div>
              Consistent with real life: in line with the process and logic of real life, and comply
              with languages and habits that the users are used to;
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="footer">
        <el-button type="primary">保存</el-button>
        <el-button>取消</el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const emits = defineEmits(['closeModal'])
const activeItems = ref('1')
</script>
<style lang="less" scoped>
.modal {
  position: absolute;
  z-index: 3; /* 确保弹窗在最上层 */
  top: 0;
  right: 0;
  width: 420px;
  height: 100%;
}

.p-15 {
  padding: 0px 15px;
}

/* 弹窗内容 */
.pannel {
  display: flex;
  flex-direction: column;
  background-color: var(--background-white-transparent-1);
  backdrop-filter: blur(15px);
  height: calc(100% - 40px);
  margin: 20px 25px;
  box-shadow: var(--el-box-shadow);
  border-radius: var(--el-border-radius-base);
  .header {
    padding-top: 15px;
    padding-bottom: 15px;
    display: flex;
    color: var(--el-text-color-primary);

    div {
      font-size: 20px;
      font-weight: lighter;
      padding-left: 10px;
      line-height: 24px;
    }
    .icon {
      height: 25px;
    }
  }

  .content {
    flex: 1;
    background-color: antiquewhite;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 15px;
  }
  .footer {
  }
}
</style>
