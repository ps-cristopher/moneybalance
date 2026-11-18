<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import ToggleSwitch from 'primevue/toggleswitch'
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '@/stores/store'
import { DARK_MODE_STORAGE_KEY } from '@/constants'
import { DATA_TRANSFER_GROUP, useDataTransfer } from '@/hooks/useDataTransfer'

const store = useStore()
const { isDarkMode, userInfo } = storeToRefs(store)
const route = useRoute()
const userName = ref('')
const importInput = ref<HTMLInputElement>()
const { exportToFile, importFromFile } = useDataTransfer()

watch(isDarkMode, (value) => {
  document.documentElement.classList.toggle(DARK_MODE_STORAGE_KEY, value)
}, { immediate: true })

const saveUserName = () => {
  store.setUser({
    name: userName.value
  })
  location.reload()
}

const openImportDialog = () => {
  importInput.value?.click()
}

const onImportFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    importFromFile(file)
  }
}
</script>

<template>
  <div class="h-screen">
    <template v-if="userInfo?.name">
      <div class="grid grid-flow-row lg:grid-cols-[280px_1fr] lg:h-full">
        <header class="relative h-full bg-zinc-900 place-content-center text-white">

          <div class="text-base font-semibold lg:absolute top-5 left-0 w-full grid grid-flow-col place-items-center gap-2 px-4">
            <div class="grid justify-start lg:justify-end items-center w-full h-12">
              <div class="rounded-full bg-sky-950 w-8 h-8 grid items-center justify-center pb-1">
                <i class="pi pi-user"></i>
              </div>
            </div>
            <div class="absolute left-14 lg:static grid justify-start items-center lg:w-full text-lg lg:text-xl h-12 truncate capitalize">
              {{ userInfo?.name }}
            </div>
          </div>

          <div class="absolute top-3 right-2 lg:right-auto lg:top-auto lg:bottom-25 lg:left-24 grid grid-flow-col lg:grid-flow-row lg:mt-5 place-items-center gap-2 lg:gap-3">
            <div class="grid grid-flow-col lg:hidden">
              <Button icon="pi pi-download" size="small" severity="secondary" text rounded aria-label="Exportar datos" @click="exportToFile" />
              <Button icon="pi pi-upload" size="small" severity="secondary" text rounded aria-label="Importar datos" @click="openImportDialog" />
            </div>
            <div class="text-xs font-bold">
              <span class="hidden lg:inline-block">Modo Oscuro </span> <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </div>
            <ToggleSwitch v-model="isDarkMode" />
          </div>

          <nav class="grid h-16 lg:h-auto text-sm lg:text-base lg:px-0 px-4 grid-flow-col lg:grid-flow-row place-items-center gap-3 font-bold">
            <RouterLink to="/">
              <i class="pi pi-chart-line" :style="{fontSize: '14px'}"></i> Resumen
            </RouterLink>
            <RouterLink to="/incomes">
              <i class="pi pi-dollar" :style="{fontSize: '14px'}"></i> Ingresos
            </RouterLink>
            <RouterLink to="/expenses">
              <i class="pi pi-wallet" :style="{fontSize: '14px'}"></i> Gastos
            </RouterLink>
            <RouterLink to="/debts">
              <i class="pi pi-credit-card" :style="{fontSize: '14px'}"></i> Deudas
            </RouterLink>
            <RouterLink to="/future-expenses">
              <i class="pi pi-calendar-clock" :style="{fontSize: '14px'}"></i> Gastos futuros
            </RouterLink>
          </nav>

          <div class="hidden lg:grid mt-8 justify-center gap-2">
            <Button label="Exportar datos" icon="pi pi-download" size="small" severity="secondary" class="w-40" @click="exportToFile" />
            <Button label="Importar datos" icon="pi pi-upload" size="small" severity="secondary" class="w-40" @click="openImportDialog" />
          </div>

          <a href="https://cristopherps.dev/resume/" class="text-xs font-semibold absolute bottom-8 left-26 hidden lg:grid grid-flow-row mt-5 place-items-center gap-1 cursor-pointer">
            Created By <img src="@/assets/logo.png" alt="Money Balance" class="w-20" />
          </a>
        </header>
        <div :class="`h-full overflow-auto ${route.name === 'summary' ? 'pb-5' : 'p-5'}`">
          <RouterView />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="bg-zinc-900 w-full h-full">
        <Dialog visible modal header="Bienvenido!" class="w-lg" :draggable="false" :closable="false">
          <p class="text-surface-500 dark:text-surface-400 mb-4">
            Balancash es tu asistente para controlar tus finanzas. Registra ingresos, gastos y deudas de forma sencilla, organízalos por categorías y revisa gráficas que muestran la evolución de tu dinero. Con un balance siempre actualizado, podrás tomar mejores decisiones y alcanzar tus metas financieras.
          </p>
          <p class="text-surface-500 dark:text-surface-400 mb-4">
            Tus datos están seguros y solo tú puedes verlos. Balancash guarda toda la información directamente en tu dispositivo. No necesitas crear una cuenta ni compartir datos personales. Solo recuerda usar siempre el mismo navegador y dispositivo para acceder a tu información.
          </p>
          <span class="text-surface-500 dark:text-surface-400 block mb-8">Para empezar a usar la app ingresa tu nombre</span>
          <div class="grid grid-flow-col gap-4 mb-4">
            <InputText v-model="userName" id="email" autocomplete="off" @keydown.enter="saveUserName"/>
          </div>
          <Button :disabled="!userName" class="w-full" type="button" label="Aceptar" icon="pi pi-user" @click="saveUserName"></Button>
          <Divider align="center"><span class="text-xs text-surface-500">o</span></Divider>
          <Button class="w-full" type="button" label="Importar datos desde un respaldo" icon="pi pi-upload" severity="secondary" outlined @click="openImportDialog"></Button>
        </Dialog>
      </div>
    </template>
    <input ref="importInput" type="file" accept="application/json,.json" class="hidden" @change="onImportFileSelected" />
    <Toast :group="DATA_TRANSFER_GROUP" />
    <ConfirmDialog :group="DATA_TRANSFER_GROUP" :closable="false" :draggable="false" />
    <div class="bg-zinc-900 w-full text-xs font-semibold fixed p-2 bottom-0 left-0 lg:hidden grid grid-flow-row mt-5 place-items-center gap-1">
      <a href="https://cristopherps.dev/resume/" class="cursor-pointer">
        <img src="@/assets/logo.png" alt="Money Balance" class="w-18" />
      </a>
    </div>
  </div>
</template>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
