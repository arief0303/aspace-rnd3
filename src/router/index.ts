import { createRouter, createWebHistory } from 'vue-router'
import BabylonScene from '../components/BabylonScene.vue'
import MainMenu from '../components/MainMenu.vue'
import Settings from '../components/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main-menu',
      component: MainMenu
    },
    {
      path: '/play',
      name: 'play',
      component: BabylonScene
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

export default router
