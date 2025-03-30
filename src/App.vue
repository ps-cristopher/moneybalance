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
      <div class="hidden lg:grid grid-cols-[280px_1fr] h-full">
        <header class="relative h-full bg-zinc-900 place-content-center text-white">
          <nav class="grid grid-flow-row place-items-center gap-3 font-bold">
            <RouterLink to="/">
              <i class="pi pi-chart-line"></i> Resumen
            </RouterLink>
            <RouterLink to="/incomes">
              <i class="pi pi-dollar"></i> Ingresos
            </RouterLink>
            <RouterLink to="/expenses">
              <i class="pi pi-wallet"></i> Gastos
            </RouterLink>
            <RouterLink to="/debts">
              <i class="pi pi-credit-card"></i> Deudas
            </RouterLink>
          </nav>
          <div class="absolute bottom-25 left-24 grid grid-flow-row mt-5 place-items-center gap-3">
            <div class="text-xs font-bold">
              Modo Oscuro <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </div>
            <ToggleSwitch v-model="isDarkMode" />
          </div>
          <div class="text-xs font-semibold absolute bottom-8 left-26 grid grid-flow-row mt-5 place-items-center gap-1">
            created by <img src="@/assets/logo.png" alt="Money Balance" class="w-20" />
          </div>
          <div class="text-base font-semibold absolute top-5 left-0 w-full grid grid-flow-col place-items-center gap-2 px-4">
            <div class="grid justify-end items-center w-full h-12">
              <div class="rounded-full bg-sky-950 w-8 h-8 grid items-center justify-center pb-1">
                <i class="pi pi-user"></i>
              </div>
            </div>
            <div class="grid justify-start items-center w-full text-xl h-12 truncate capitalize">
              {{ userInfo?.name }}
            </div>
          </div>
        </header>
        <div :class="`h-full overflow-auto ${route.name === 'summary' ? 'pb-5' : 'p-5'}`">
          <RouterView />
        </div>
      </div>
      <div class="lg:hidden grid h-full bg-zinc-900 text-white sm:text-2xl text-xl p-16 grid-flow-row gap-2 place-content-center font-semibold">
        <div class="grid justify-center grid-flow-col items-center min-h-20 gap-1 text-justify">
          <i class="pi pi-info-circle mr-2 text-sky-900" style="font-size:40px;"></i>
          Para poder usar la app, accede desde un dispositivo desktop o con una resolución mayor a 1024px.
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