import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Button from "primevue/button"
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import i18n from './i18n'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
    },
  }
});
app.use(ToastService)
app.use(ConfirmationService)
app.component('Button', Button)

app.mount('#app')
