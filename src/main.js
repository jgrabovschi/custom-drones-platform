import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { io } from "socket.io-client"

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.provide('socket', io("http://localhost:12345"))
app.provide('janus-ws', new WebSocket("ws://192.168.1.188:8188/janus", "janus-protocol"))
app.mount('#app')
