import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';

import { VueFire, VueFireAuth } from 'vuefire';
import { app as firebaseApp } from './firebase';

import * as bootstrap from 'bootstrap';

import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

import './assets/main.scss';

import { useAuthStore } from '@/stores/authStore';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(router);

app.use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
});

app.use(VCalendar, {});

app.use(Particles, {
    init: async (engine) => {
        await loadSlim(engine);
    },
});

app.use(pinia);

const authStore = useAuthStore();
authStore.initAuthListener();

app.mount('#app');
