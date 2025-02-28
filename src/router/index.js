import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    // Catch-all route for non-existent pages (404)
    {
      path: '/:pathMatch(.*)*', // Catch-all fallback
      name: 'NotFound',
      component: MapView
    }
  ]
});

export default router
