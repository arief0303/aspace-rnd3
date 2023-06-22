import { createRouter, createWebHistory } from 'vue-router'
import BabylonSceneView from '../views/BabylonSceneView.vue'
import MainMenuView from '../views/MainMenuView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main-menu',
      component: MainMenuView
    },
    {
      path: '/play',
      name: 'play',
      component: BabylonSceneView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router
