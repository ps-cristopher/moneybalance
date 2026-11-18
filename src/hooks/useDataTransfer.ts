import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useStore } from '@/stores/store'
import { ImportError, parseExportFile } from '@/dataTransfer'

// Own group so these messages don't show up in the views' Toast/ConfirmDialog.
export const DATA_TRANSFER_GROUP = 'data-transfer'

const TOAST_LIFE = 5000

export const useDataTransfer = () => {
  const store = useStore()
  const toast = useToast()
  const confirm = useConfirm()

  const exportToFile = () => {
    const content = JSON.stringify(store.exportData(), null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `balancash-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    toast.add({
      group: DATA_TRANSFER_GROUP,
      severity: 'success',
      summary: 'Datos exportados',
      detail: 'El respaldo se descargó correctamente.',
      life: TOAST_LIFE,
    })
  }

  const importFromFile = async (file: File) => {
    let data
    try {
      data = parseExportFile(await file.text())
    } catch (error) {
      toast.add({
        group: DATA_TRANSFER_GROUP,
        severity: 'error',
        summary: 'No se pudo importar',
        detail: error instanceof ImportError ? error.message : 'Ocurrió un error al leer el archivo.',
        life: TOAST_LIFE,
      })
      return
    }

    confirm.require({
      group: DATA_TRANSFER_GROUP,
      header: 'Importar datos',
      message: `Se importarán los datos de "${file.name}". Los elementos existentes con el mismo identificador se actualizarán y los nuevos se agregarán. ¿Deseas continuar?`,
      icon: 'pi pi-upload',
      rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptProps: { label: 'Importar' },
      accept: () => {
        const { created, updated, unchanged } = store.importData(data)
        toast.add({
          group: DATA_TRANSFER_GROUP,
          severity: 'success',
          summary: 'Datos importados',
          detail: `${created} creados, ${updated} actualizados, ${unchanged} sin cambios.`,
          life: TOAST_LIFE,
        })
      },
    })
  }

  return { exportToFile, importFromFile }
}
