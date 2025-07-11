import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export enum Actions {
  NEW = 'new'
}

export default function useOpenModalFromQuery(openModal: () => void) {
  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    if (route.query.action === Actions.NEW) {
      openModal()
      router.replace({ query: {} })
    }
  })
}
