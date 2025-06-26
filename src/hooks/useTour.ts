import { ref, onMounted, Ref } from 'vue'

export interface TourStep {
  message: string
  target?: Ref<HTMLElement | null>
}

export default function useTour(
  steps: TourStep[],
  seenRef: Ref<boolean>,
  markSeen: (value: boolean) => void,
) {
  const isTourOpen = ref(false)
  const tourStep = ref(0)
  const tourStyle = ref<Record<string, string>>({})

  const showStep = (index: number) => {
    tourStep.value = index
    const target = steps[index].target?.value
    if (target) {
      const rect = target.getBoundingClientRect()
      tourStyle.value = {
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 8}px`,
        left: `${rect.left + window.scrollX}px`,
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      tourStyle.value = {}
    }
  }

  const nextTourStep = () => {
    if (tourStep.value < steps.length - 1) {
      showStep(tourStep.value + 1)
    } else {
      isTourOpen.value = false
      markSeen(true)
    }
  }

  onMounted(() => {
    if (!seenRef.value) {
      isTourOpen.value = true
      showStep(0)
    }
  })

  return {
    isTourOpen,
    tourStep,
    tourStyle,
    nextTourStep,
    showStep,
  }
}
