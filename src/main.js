import { createApp } from 'vue';
import App from './App.vue';
import router from './routes/index';
import store from './store';

createApp(App).use(router).use(store).mount('#app');

// Import our custom CSS
import './scss/styles.scss';

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';

particlesJS.load('particles', '/src/assets/particlesjs-config.json', function () {
    console.log('callback - particles.js config loaded');
});
