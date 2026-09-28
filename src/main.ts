import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Button from "primevue/button"
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import SelectButton from 'primevue/selectbutton';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
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
// PrimeVue's component name intentionally matches the native element name used throughout templates.
// eslint-disable-next-line vue/multi-word-component-names, vue/no-reserved-component-names
app.component('Button', Button)
app.component('SelectButton', SelectButton)

app.mount('#app')
