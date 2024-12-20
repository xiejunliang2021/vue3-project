import { createApp } from 'vue'
import router from './router/router'
import App from './App.vue'
import { createPinia } from 'pinia';

const app = createApp(App);

const pinia = createPinia()

app.use(router).use(pinia);

app.mount('#app');
