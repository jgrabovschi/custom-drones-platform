import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { io } from "socket.io-client"

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.provide('socket', io("ws://localhost:10000"))
app.provide('janus-ws', "ws://vpn.dboids.pt:8188/janus")
app.mount('#app')
