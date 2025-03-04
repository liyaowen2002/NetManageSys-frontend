import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAccoutStore = defineStore(
  'accout',
  () => {
    const nickname = ref(null)
    const username = ref(null)
    const role = ref(null)
    return { nickname, username, role }
  },
  {
    persist: true,
  },
)
