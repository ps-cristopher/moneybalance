import { ViewDefaultActions } from '@/types'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

type ViewDefaultActionHandlers = Partial<Record<ViewDefaultActions, () => void>>

export default function useDefaultViewAction(defaultActions: ViewDefaultActionHandlers) {
  const route = useRoute()

  onMounted(() => {
    Object.entries(defaultActions).forEach(([action, handler]) => {
      if (route.query[action] === 'true') {
        handler?.()
      }
    })
  })
}
