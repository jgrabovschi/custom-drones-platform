import { createRouter, createWebHistory } from 'vue-router'
import FlightController from '@/components/FlightController.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'flight',
      component: FlightController,
    },
  ],
})

export default router
