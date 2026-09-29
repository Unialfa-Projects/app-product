<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  obterProdutoSelecionado,
  obterHistoricoPrecos,
  inativarProduto,
  reativarProduto,
  formatarPreco
} from '../data/produtos'

const router = useRouter()

const produto = ref({})
const historico = ref([])
const mostrarHistorico = ref(false)

onMounted(async () => {
  const produtoSalvo = await obterProdutoSelecionado()

  if (!produtoSalvo) {
    router.push('/')
    return
  }

  produto.value = produtoSalvo
})

function voltarProdutos() {
  router.push('/')
}

function editarProduto() {
  router.push('/editar-produto')
}

async function alternarHistorico() {
  mostrarHistorico.value = !mostrarHistorico.value

  if (!mostrarHistorico.value) return

  try {
    historico.value = await obterHistoricoPrecos(produto.value.id)
  } catch (erro) {
    mostrarHistorico.value = false
    alert(erro.message)
  }
}

async function alternarStatus() {
  const acao = produto.value.ativo
    ? 'inativar'
    : 'ativar'

  const confirmado = confirm(
    `Deseja realmente ${acao} o produto "${produto.value.nome}"?`
  )

  if (!confirmado) return

  try {
    produto.value = produto.value.ativo
      ? await inativarProduto(produto.value.id)
      : await reativarProduto(produto.value.id)
  } catch (erro) {
    alert(erro.message)
  }
}

function formatarData(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '—'
}
</script>

<template>
  <div class="app">

    <!-- MENU LATERAL -->
    <aside class="sidebar">

      <div class="logo">
        <span class="logo-icon">S</span>
        <span>SIGE</span>
      </div>

      <nav>

        <a
          class="menu-item active"
          @click="voltarProdutos"
        >
          <span>▦</span>
          Produtos
        </a>

        <router-link
          class="menu-item"
          to="/categorias"
        >
          <span>▤</span>
          Categorias
        </router-link>

        <router-link
          class="menu-item"
          to="/unidades-medida"
        >
          <span>◫</span>
          Unidades de medida
        </router-link>

      </nav>

    </aside>

    <!-- CONTEÚDO -->
    <main class="content">

      <!-- BREADCRUMB -->
      <div class="breadcrumb">

        <span
          class="clickable"
          @click="voltarProdutos"
        >
          Início
        </span>

        /

        <span
          class="clickable"
          @click="voltarProdutos"
        >
          Produtos
        </span>

        /

        <strong>
          Visualizar produto
        </strong>

      </div>

      <!-- CABEÇALHO -->
      <section class="header">

        <div>

          <h1>
            {{ produto.nome }}
          </h1>

          <p>
            Visualização dos dados cadastrados do produto.
          </p>

        </div>

        <div class="header-actions">

          <span
            class="status"
            :class="produto.ativo ? 'active-status' : 'inactive-status'"
          >
            {{ produto.ativo ? 'Ativo' : 'Inativo' }}
          </span>

          <button
            class="edit-button"
            @click="editarProduto"
          >
            Editar produto
          </button>

        </div>

      </section>

      <!-- DADOS DO PRODUTO -->
      <section class="card">

        <h2>
          Dados do produto
        </h2>

        <div class="info-grid">

          <div class="info-item">

            <span>
              Nome do produto
            </span>

            <strong>
              {{ produto.nome }}
            </strong>

          </div>

          <div class="info-item">

            <span>
              SKU
            </span>

            <strong>
              {{ produto.sku }}
            </strong>

          </div>

          <div class="info-item">

            <span>
              Categoria
            </span>

            <strong>
              {{ produto.categoria }}
            </strong>

          </div>

          <div class="info-item">

            <span>
              Unidade de medida
            </span>

            <strong>
              {{ produto.unidade }}
            </strong>

          </div>

          <div class="info-item">

            <span>
              Preço de venda
            </span>

            <strong>
              R$ {{ formatarPreco(produto.preco) }}
            </strong>

          </div>

        </div>

      </section>

      <!-- ESTOQUE -->
      <section class="card">

        <h2>
          Estoque
        </h2>

        <div class="stock">

          <span>
            Quantidade disponível
          </span>

          <strong>
            {{ produto.estoque ?? 0 }} {{ produto.unidade }}
          </strong>

        </div>

      </section>

      <!-- AÇÕES -->
      <section class="card actions-card">

        <h2>
          Ações
        </h2>

        <div class="actions">

          <button
            class="edit-button"
            @click="editarProduto"
          >
            Editar produto
          </button>

          <button
            class="secondary-button"
            @click="alternarHistorico"
          >
            Histórico de preço
          </button>

          <button
            :class="produto.ativo ? 'danger-button' : 'secondary-button'"
            @click="alternarStatus"
          >
            {{ produto.ativo ? 'Inativar produto' : 'Reativar produto' }}
          </button>

        </div>

        <table
          v-if="mostrarHistorico"
          class="history-table"
        >
          <thead>
            <tr>
              <th>Preço</th>
              <th>Início da vigência</th>
              <th>Fim da vigência</th>
              <th>Motivo</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="registro in historico"
              :key="registro.id"
            >
              <td>R$ {{ formatarPreco(registro.preco) }}</td>
              <td>{{ formatarData(registro.vigencia_inicio) }}</td>
              <td>{{ formatarData(registro.vigencia_fim) }}</td>
              <td>{{ registro.motivo || '—' }}</td>
            </tr>
          </tbody>
        </table>

      </section>

    </main>

  </div>
</template>

<style scoped>

* {
  box-sizing: border-box;
}

/* =========================================
   APP
========================================= */

.app {
  display: flex;

  min-height: 100vh;

  background: #f5f7fb;

  color: #172033;

  font-family: Arial, sans-serif;
}

/* =========================================
   SIDEBAR
========================================= */

.sidebar {
  width: 240px;
  min-width: 240px;
  min-height: 100vh;

  background: #101b36;

  color: #ffffff;

  padding: 24px 16px;

  flex-shrink: 0;
}

.logo {
  display: flex;

  align-items: center;

  gap: 10px;

  font-size: 22px;

  font-weight: 700;

  margin-bottom: 42px;

  padding-left: 8px;

  color: #ffffff;
}

.logo-icon {
  width: 34px;
  height: 34px;

  border-radius: 8px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #2563eb;

  color: #ffffff;

  font-size: 18px;
}

nav {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.menu-item {
  display: flex;

  align-items: center;

  gap: 12px;

  padding: 12px 14px;

  border-radius: 8px;

  color: #cbd5e1;

  text-decoration: none;

  font-size: 14px;

  cursor: pointer;

  transition: 0.2s;
}

.menu-item:hover {
  background: #182746;

  color: #ffffff;
}

.menu-item.active {
  background: #2563eb;

  color: #ffffff;
}

.menu-item.active:hover {
  background: #1d4ed8;

  color: #ffffff;
}

/* =========================================
   CONTEÚDO
========================================= */

.content {
  flex: 1;

  min-width: 0;

  padding: 28px 36px;
}

/* =========================================
   BREADCRUMB
========================================= */

.breadcrumb {
  color: #697386;

  font-size: 14px;

  display: flex;

  flex-wrap: wrap;

  gap: 7px;

  align-items: center;
}

.clickable {
  cursor: pointer;

  transition: 0.2s;
}

.clickable:hover {
  color: #1769e0;
}

/* =========================================
   CABEÇALHO
========================================= */

.header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 24px;

  margin-top: 30px;

  margin-bottom: 25px;
}

.header h1 {
  margin: 0 0 8px;

  font-size: 30px;

  color: #172033;
}

.header p {
  margin: 0;

  color: #697386;

  font-size: 14px;
}

.header-actions {
  display: flex;

  align-items: center;

  gap: 12px;

  flex-shrink: 0;
}

/* =========================================
   STATUS
========================================= */

.status {
  display: inline-flex;

  align-items: center;

  padding: 6px 11px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: bold;

  white-space: nowrap;
}

.active-status {
  background: #dff5e7;

  color: #16803c;
}

.inactive-status {
  background: #f1f5f9;

  color: #64748b;
}

/* =========================================
   CARD
========================================= */

.card {
  background: #ffffff;

  border: 1px solid #e2e6ee;

  border-radius: 10px;

  padding: 24px;

  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 22px;

  font-size: 18px;

  color: #172033;
}

/* =========================================
   INFORMAÇÕES
========================================= */

.info-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 24px;
}

.info-item {
  display: flex;

  flex-direction: column;

  gap: 7px;

  min-width: 0;
}

.info-item span {
  font-size: 13px;

  color: #697386;
}

.info-item strong {
  font-size: 15px;

  color: #293449;

  word-break: break-word;
}

/* =========================================
   ESTOQUE
========================================= */

.stock {
  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 20px;
}

.stock span {
  font-size: 13px;

  color: #697386;
}

.stock strong {
  font-size: 20px;

  color: #172033;

  text-align: right;
}

/* =========================================
   BOTÃO EDITAR
========================================= */

.edit-button {
  border: none;

  background: #2563eb;

  color: #ffffff;

  padding: 11px 18px;

  border-radius: 7px;

  font-size: 14px;

  font-weight: bold;

  cursor: pointer;

  transition: 0.2s;

  white-space: nowrap;
}

.edit-button:hover {
  background: #1d4ed8;
}

/* =========================================
   BOTÃO SECUNDÁRIO
========================================= */

.secondary-button {
  padding: 11px 18px;

  border: 1px solid #d8deea;

  background: #ffffff;

  color: #344054;

  border-radius: 7px;

  cursor: pointer;

  font-size: 14px;

  transition: 0.2s;
}

.secondary-button:hover {
  background: #f8fafc;

  border-color: #b8c2d3;
}

/* =========================================
   BOTÃO PERIGO
========================================= */

.danger-button {
  padding: 11px 18px;

  border: 1px solid #e0b5b5;

  background: #fff5f5;

  color: #b42318;

  border-radius: 7px;

  cursor: pointer;

  font-size: 14px;

  transition: 0.2s;
}

.danger-button:hover {
  background: #feecec;

  border-color: #d99a9a;
}

/* =========================================
   AÇÕES
========================================= */

.actions {
  display: flex;

  gap: 12px;

  flex-wrap: wrap;
}

.history-table {
  width: 100%;

  margin-top: 22px;

  border-collapse: collapse;

  font-size: 13px;
}

.history-table th,
.history-table td {
  padding: 10px 12px;

  text-align: left;

  border-bottom: 1px solid #e2e6ee;
}

.history-table th {
  color: #697386;

  font-weight: 600;
}

/* =========================================
   TABLET
========================================= */

@media (max-width: 1100px) {

  .sidebar {
    width: 220px;

    min-width: 220px;
  }

  .content {
    padding: 26px 28px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

}

/* =========================================
   TABLET MENOR
========================================= */

@media (max-width: 900px) {

  .sidebar {
    width: 190px;

    min-width: 190px;

    padding: 22px 12px;
  }

  .content {
    padding: 22px;
  }

  .header {
    align-items: flex-start;

    gap: 20px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);

    gap: 20px;
  }

}

/* =========================================
   CELULAR
========================================= */

@media (max-width: 700px) {

  .app {
    display: block;
  }

  .sidebar {
    width: 100%;

    min-width: 100%;

    min-height: auto;

    padding: 14px 16px;

    border-bottom: 1px solid #1d2a4a;
  }

  .logo {
    margin-bottom: 12px;

    padding-left: 0;
  }

  nav {
    flex-direction: row;

    gap: 6px;

    overflow-x: auto;

    scrollbar-width: none;
  }

  nav::-webkit-scrollbar {
    display: none;
  }

  .menu-item {
    flex: 0 0 auto;

    white-space: nowrap;

    padding: 10px 12px;
  }

  .content {
    width: 100%;

    padding: 20px 16px;
  }

  .breadcrumb {
    font-size: 12px;

    line-height: 1.7;
  }

  .header {
    flex-direction: column;

    align-items: flex-start;

    margin-top: 22px;

    gap: 16px;
  }

  .header h1 {
    font-size: 25px;
  }

  .header-actions {
    width: 100%;

    justify-content: space-between;
  }

  .info-grid {
    grid-template-columns: 1fr;

    gap: 18px;
  }

  .card {
    padding: 20px;

    margin-bottom: 16px;
  }

  .stock {
    align-items: flex-start;

    flex-direction: column;

    gap: 8px;
  }

  .stock strong {
    text-align: left;
  }

  .actions {
    flex-direction: column;

    width: 100%;
  }

  .actions button {
    width: 100%;
  }

}

/* =========================================
   CELULAR PEQUENO
========================================= */

@media (max-width: 430px) {

  .sidebar {
    padding: 12px;
  }

  .logo {
    font-size: 20px;
  }

  .logo-icon {
    width: 32px;

    height: 32px;
  }

  .menu-item {
    font-size: 13px;

    padding: 9px 11px;
  }

  .content {
    padding: 18px 12px;
  }

  .header h1 {
    font-size: 23px;
  }

  .header-actions {
    flex-direction: column;

    align-items: stretch;

    width: 100%;
  }

  .header-actions .edit-button,
  .header-actions .status {
    width: 100%;

    justify-content: center;

    text-align: center;
  }

  .card {
    padding: 17px;
  }

  .card h2 {
    font-size: 17px;
  }

}

/* =========================================
   CELULAR MUITO PEQUENO
========================================= */

@media (max-width: 350px) {

  .content {
    padding: 14px 10px;
  }

  .card {
    padding: 15px;
  }

  .menu-item {
    padding: 8px 10px;

    font-size: 12px;
  }

}

</style>