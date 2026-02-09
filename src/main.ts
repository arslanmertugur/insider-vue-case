import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './styles/global.scss';
import App from './App.vue';
import ToastPlugin from './plugins/toast';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(ToastPlugin);

app.mount('#app');
