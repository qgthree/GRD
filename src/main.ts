import './assets/styles/main.css'
import './assets/styles/shared.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// App-wide plugins are registered here so feature files can stay focused on
// their own state and rendering behavior.
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
