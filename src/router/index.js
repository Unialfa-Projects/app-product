import { createRouter, createWebHistory } from 'vue-router'

import Produtos from '../views/Produtos.vue'
import NovoProduto from '../views/NovoProduto.vue'

const routes = [
  {
    path: '/',
    name: 'Produtos',
    component: Produtos
  },
  {
    path: '/novo-produto',
    name: 'NovoProduto',
    component: NovoProduto
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router