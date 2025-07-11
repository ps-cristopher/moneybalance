import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export enum Action {
  NEW = 'new'
}

export default function useOpenModalFromQuery(openModal: () => void) {
  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    if (route.query.action === Action.NEW) {
      openModal()
      router.replace({ query: {} })
    }
  })
}
