<template>
  <div :class="props.type === 'h1' ? 'h1' : props.type === 'h2' ? 'h2' : 'h3'" class="general">
    <div class="mark"></div>
    {{ props.text }}
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  text: String,
  type: String,
})
</script>
<style lang="less" scoped>
.general {
  display: flex;
  font-weight: bold;
  color: var(--el-text-color-regular);
}
.mark {
  background-color: var(--el-color-primary);
  margin-right: 8px;
  border-radius: 20%;
}
.h1 {
  .mark {
    width: calc(var(--el-font-size-large) / 2);
    height: var(--el-font-size-large);
  }
  height: var(--el-font-size-large);
  line-height: var(--el-font-size-large);
  font-size: var(--el-font-size-large);
  margin: 16px 0px;
}
.h2 {
  .mark {
    width: calc(var(--el-font-size-medium) / 2);
    height: var(--el-font-size-medium);
  }
  height: var(--el-font-size-medium);
  line-height: var(--el-font-size-medium);
  font-size: var(--el-font-size-medium);
  margin: 14px 0px;
}
.h3 {
  .mark {
    width: calc(var(--el-font-size-base) / 2);
    height: var(--el-font-size-base);
  }
  height: var(--el-font-size-base);
  line-height: var(--el-font-size-base);
  font-size: var(--el-font-size-base);
  margin: 12px 0px;
}
</style>
