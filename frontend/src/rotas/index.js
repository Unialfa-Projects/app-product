import { createRouter, createWebHistory } from 'vue-router';
import { useSessaoStore } from '@/stores/sessao.js';
import { authApi } from '@/api/auth.js';

const rotas = [
  { path: '/', redirect: '/produtos' },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/paginas/Login.vue'),
    meta: { publica: true },
  },
  {
    path: '/cadastro',
    name: 'cadastro-usuario',
    component: () => import('@/paginas/CadastroUsuario.vue'),
    meta: { publica: true },
  },
  {
    path: '/produtos',
    name: 'produtos-lista',
    component: () => import('@/paginas/ListagemProdutos.vue'),
    meta: { requerSessao: true },
  },
  {
    path: '/produtos/novo',
    name: 'produtos-novo',
    component: () => import('@/paginas/CadastroProduto.vue'),
    meta: { requerSessao: true },
  },
  {
    path: '/produtos/:id/editar',
    name: 'produtos-editar',
    component: () => import('@/paginas/EdicaoProduto.vue'),
    meta: { requerSessao: true },
    props: true,
  },
  {
    path: '/produtos/:id/precos',
    name: 'produtos-precos',
    component: () => import('@/paginas/HistoricoPreco.vue'),
    meta: { requerSessao: true },
    props: true,
  },
  {
    path: '/produtos/:id',
    name: 'produtos-detalhe',
    component: () => import('@/paginas/DetalheProduto.vue'),
    meta: { requerSessao: true },
    props: true,
  },
  {
    path: '/categorias',
    name: 'categorias',
    component: () => import('@/paginas/Categorias.vue'),
    meta: { requerSessao: true },
  },
  {
    path: '/unidades-medida',
    name: 'unidades-medida',
    component: () => import('@/paginas/UnidadesMedida.vue'),
    meta: { requerSessao: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/produtos',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: rotas,
});

// RF32 — restringe telas de cadastro e consulta a usuário autenticado.
// Os endpoints de GET da API são públicos por design (só a escrita exige x-usuario-id — RNF03),
// então só confiar no localStorage deixaria toda tela de consulta acessível com um id forjado
// ou desatualizado. O guard confirma no servidor (GET /api/auth/eu) que o usuário existe de fato.
router.beforeEach(async (to) => {
  const sessao = useSessaoStore();

  if (to.meta.requerSessao) {
    if (!sessao.estaAutenticado) {
      return { name: 'login', query: { redirecionarPara: to.fullPath } };
    }

    try {
      await authApi.eu();
    } catch {
      sessao.encerrarSessao();
      return { name: 'login', query: { redirecionarPara: to.fullPath, sessaoExpirada: '1' } };
    }
  }

  if (to.meta.publica && sessao.estaAutenticado) {
    return { name: 'produtos-lista' };
  }

  return true;
});
