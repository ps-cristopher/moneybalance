<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import ToggleSwitch from 'primevue/toggleswitch'
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { onMounted, ref, watch } from 'vue'
import { useStore } from '@/stores/store'
import { DARK_MODE_STORAGE_KEY } from '@/constants'

const { isDarkMode: defaultDarkMode, setDarkMode, userInfo, setUser } = useStore()
const isDarkMode = ref(defaultDarkMode)
const route = useRoute()
const userName = ref('')

const toggleDarkModeClass = () => {
  document.documentElement.classList.toggle(DARK_MODE_STORAGE_KEY)
}

const toggleDarkMode = () =>{
  toggleDarkModeClass()
  setDarkMode(isDarkMode.value)
}

watch(isDarkMode, () => {
  toggleDarkMode()
})

onMounted(() => {
  if (defaultDarkMode) {
    toggleDarkModeClass()
  }
})

const saveUserName = () => {
  setUser({
    name: userName.value
  })
  location.reload()
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
            <div class="text-xs font-bold">
              <span class="hidden lg:inline-block">Modo Oscuro </span> <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </div>
            <ToggleSwitch v-model="isDarkMode" />
          </div>

          <nav class="grid h-16 text-sm lg:text-base lg:px-0 px-4 grid-flow-col lg:grid-flow-row place-items-center gap-3 font-bold">
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
          </nav>

          <div class="text-xs font-semibold absolute bottom-8 left-26 hidden lg:grid grid-flow-row mt-5 place-items-center gap-1">
            created by <img src="@/assets/logo.png" alt="Money Balance" class="w-20" />
          </div>
        </header>
        <div :class="`h-full overflow-auto ${route.name === 'summary' ? 'pb-5' : 'p-5'}`">
          <RouterView />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="bg-zinc-900 w-full h-full">
        <Dialog visible modal header="Bienvenido!" class="w-lg" :draggable="false" :closable="false">
          <span class="text-surface-500 dark:text-surface-400 block mb-8">Para empezar a usar la app ingresa tu nombre</span>
          <div class="grid grid-flow-col gap-4 mb-4">
            <InputText v-model="userName" id="email" autocomplete="off" @keydown.enter="saveUserName"/>
          </div>
          <Button :disabled="!userName" class="w-full" type="button" label="Aceptar" icon="pi pi-user" @click="saveUserName"></Button>
        </Dialog>
      </div>
    </template>
    <div class="bg-zinc-900 w-full text-xs font-semibold fixed p-2 bottom-0 left-0 lg:hidden grid grid-flow-row mt-5 place-items-center gap-1">
      <img src="@/assets/logo.png" alt="Money Balance" class="w-18" />
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