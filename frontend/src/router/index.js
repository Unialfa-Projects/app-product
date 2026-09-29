import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Produtos from '../views/Produtos.vue'
import NovoProduto from '../views/NovoProduto.vue'
import VisualizarProduto from '../views/VisualizarProduto.vue'
import EditarProduto from '../views/EditarProduto.vue'
import Categorias from '../views/Categorias.vue'
import UnidadesMedida from '../views/UnidadesMedida.vue'
import { obterUsuarioLogado } from '../data/usuarios'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { publica: true }
  },
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
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: Categorias
  },
  {
    path: '/unidades-medida',
    name: 'UnidadesMedida',
    component: UnidadesMedida
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(to => {
  if (!to.meta.publica && !obterUsuarioLogado()) {
    return '/login'
  }
})

export default router
