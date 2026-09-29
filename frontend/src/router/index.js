import { createRouter, createWebHistory } from 'vue-router'
import Produtos from '../views/Produtos.vue'
import NovoProduto from '../views/NovoProduto.vue'
import VisualizarProduto from '../views/VisualizarProduto.vue'
import EditarProduto from '../views/EditarProduto.vue'

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
  },
  {
    path: '/visualizar-produto',
    name: 'VisualizarProduto',
    component: VisualizarProduto
  },
  {
    path: '/editar-produto',
    name: 'EditarProduto',
    component: EditarProduto
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router