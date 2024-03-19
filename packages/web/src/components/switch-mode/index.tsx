import { useStore } from 'vuex'
import IPC from '@/utils/ipc'
import { computed, defineComponent, PropType, inject } from 'vue'

export default defineComponent({
  setup() {
    const store = useStore()

    const modeLabel = computed((): string => {
      const mode = store.state.app
      if (mode == 0) return 'Direct'
      else if (mode == 1) return 'SmartRoute'
      else if (mode == 2) return 'Global'
      else return ''
    })

    const handleChangeMode = (e: any) => {
      IPC.setMode(e.key)
    }

    return (
      <a-dropdown trigger={['click']}>
        <a-menu class="no-drag" slot="overlay" on-click={handleChangeMode}>
          <a-menu-item key={0}>Direct</a-menu-item>
          <a-menu-item key={1}>SmartRoute</a-menu-item>
          <a-menu-item key={2}>Global</a-menu-item>
        </a-menu>
        <a>{modeLabel}</a>
      </a-dropdown>
    )
  },
})
