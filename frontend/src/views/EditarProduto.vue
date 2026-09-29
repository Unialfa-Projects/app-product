<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  atualizarProduto,
  obterCategorias,
  obterUnidades,
  obterProdutoSelecionado,
  numeroPreco,
  formatarPreco
} from '../data/produtos'
import { obterUsuarioLogado } from '../data/usuarios'

const router = useRouter()

const nome = ref('')
const sku = ref('')
const categoria = ref('')
const unidade = ref('')
const precoVenda = ref('')

const categorias = ref([])
const unidades = ref([])

const produtoOriginal = ref(null)

onMounted(async () => {
  const produto = await obterProdutoSelecionado()

  if (!produto) {
    router.push('/')
    return
  }

  produtoOriginal.value = produto

  nome.value = produto.nome || ''
  sku.value = produto.sku || ''
  categoria.value = produto.categoria_id || ''
  unidade.value = produto.unidade_medida_id || ''
  precoVenda.value = formatarPreco(produto.preco)

  try {
    const [listaCategorias, listaUnidades] = await Promise.all([
      obterCategorias(),
      obterUnidades()
    ])

    categorias.value = listaCategorias.filter(
      item => item.ativo || item.id === produto.categoria_id
    )
    unidades.value = listaUnidades
  } catch (erro) {
    alert(erro.message)
  }
})

function voltarProdutos() {
  router.push('/')
}

function visualizarProduto() {
  router.push('/visualizar-produto')
}

async function salvarProduto() {
  if (!produtoOriginal.value) {
    return
  }

  const dados = {
    nome: nome.value.trim(),
    categoria_id: categoria.value,
    unidade_medida_id: unidade.value
  }

  const preco = numeroPreco(precoVenda.value)

  if (preco !== produtoOriginal.value.preco) {
    dados.preco = preco
    dados.usuario_id = obterUsuarioLogado()?.id ?? null
  }

  try {
    await atualizarProduto(produtoOriginal.value.id, dados)
  } catch (erro) {
    alert(erro.message)
    return
  }

  alert('Produto atualizado com sucesso!')

  router.push('/visualizar-produto')
}
</script>

<template>
  <div class="app">

    <!-- MENU LATERAL -->
    <aside class="sidebar">

      <div class="logo">
        SIGE
      </div>

      <nav class="menu">

        <a
          class="menu-item active"
          @click="voltarProdutos"
        >
          Produtos
        </a>

        <router-link
          class="menu-item"
          to="/categorias"
        >
          Categorias
        </router-link>

        <router-link
          class="menu-item"
          to="/unidades-medida"
        >
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

        <span
          class="clickable"
          @click="visualizarProduto"
        >
          Visualizar produto
        </span>

        /

        <strong>Editar produto</strong>

      </div>

      <!-- CABEÇALHO -->
      <section class="header">

        <div>
          <h1>Editar produto</h1>

          <p>
            Altere os dados cadastrados do produto.
          </p>
        </div>

        <span
          class="status"
          :class="produtoOriginal?.ativo === false ? 'inactive-status' : 'active-status'"
        >
          {{ produtoOriginal?.ativo === false ? 'Inativo' : 'Ativo' }}
        </span>

      </section>

      <!-- FORMULÁRIO -->
      <section class="card">

        <h2>Dados do produto</h2>

        <div class="form-grid">

          <!-- NOME -->
          <div class="field field-full">

            <label>Nome do produto</label>

            <input
              v-model="nome"
              type="text"
              maxlength="60"
            />

          </div>

          <!-- SKU -->
          <div class="field">

            <label>SKU</label>

            <input
              v-model="sku"
              type="text"
              readonly
            />

          </div>

          <!-- CATEGORIA -->
          <div class="field">

            <label>Categoria</label>

            <select v-model="categoria">

              <option
                v-for="item in categorias"
                :key="item.id"
                :value="item.id"
              >
                {{ item.nome }}
              </option>

            </select>

          </div>

          <!-- UNIDADE -->
          <div class="field">

            <label>Unidade de medida</label>

            <select v-model="unidade">

              <option
                v-for="item in unidades"
                :key="item.id"
                :value="item.id"
              >
                {{ item.sigla }} - {{ item.nome }}
              </option>

            </select>

          </div>

          <!-- PREÇO DE VENDA -->
          <div class="field">

            <label>Preço de venda</label>

            <input
              v-model="precoVenda"
              type="text"
            />

          </div>

        </div>

      </section>

      <!-- ESTOQUE -->
      <section class="card">

        <h2>Estoque</h2>

        <div class="stock-info">

          <span>
            Quantidade disponível
          </span>

          <strong>
            {{ produtoOriginal?.estoque ?? 0 }} {{ produtoOriginal?.unidade }}
          </strong>

        </div>

        <p class="stock-message">
          A quantidade em estoque é gerenciada pelo módulo de Estoque.
        </p>

      </section>

      <!-- AÇÕES -->
      <section class="actions-card">

        <button
          class="cancel-button"
          @click="visualizarProduto"
        >
          Cancelar
        </button>

        <button
          class="save-button"
          @click="salvarProduto"
        >
          Salvar alterações
        </button>

      </section>

    </main>

  </div>
</template>

<style scoped>

* {
  box-sizing: border-box;
}

.app {
  display: flex;
  min-height: 100vh;
  width: 100%;
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
  color: white;

  padding: 24px 16px;

  flex-shrink: 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;

  margin-bottom: 40px;
  padding-left: 12px;

  color: white;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-item {
  display: block;

  width: 100%;

  padding: 13px 14px;

  border-radius: 8px;

  color: #cbd3e6;

  text-decoration: none;

  cursor: pointer;

  transition: 0.2s;
}

.menu-item:hover {
  background: #182746;
  color: white;
}

.menu-item.active {
  background: #1769e0;
  color: white;
}

/* =========================================
   CONTEÚDO
========================================= */

.content {
  flex: 1;
  min-width: 0;

  padding: 28px 36px;

  overflow-x: hidden;
}

/* =========================================
   BREADCRUMB
========================================= */

.breadcrumb {
  color: #697386;
  font-size: 14px;

  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.clickable {
  cursor: pointer;
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

  gap: 20px;

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
}

/* =========================================
   STATUS
========================================= */

.status {
  display: inline-block;

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
   CARDS
========================================= */

.card {
  width: 100%;

  background: white;

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
   FORMULÁRIO
========================================= */

.form-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 20px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 7px;

  min-width: 0;
}

.field-full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 13px;

  font-weight: bold;

  color: #4d5668;
}

.field input,
.field select {
  width: 100%;

  height: 42px;

  border: 1px solid #d8deea;

  border-radius: 7px;

  padding: 0 12px;

  background: white;

  font-size: 14px;

  color: #293449;
}

.field input:focus,
.field select:focus {
  outline: none;

  border-color: #1769e0;

  box-shadow: 0 0 0 2px rgba(23, 105, 224, 0.08);
}

.field input[readonly] {
  background: #f5f7fb;

  color: #697386;
}

/* =========================================
   ESTOQUE
========================================= */

.stock-info {
  display: flex;

  justify-content: space-between;
  align-items: center;

  gap: 20px;
}

.stock-info span {
  color: #697386;

  font-size: 14px;
}

.stock-info strong {
  font-size: 20px;

  white-space: nowrap;
}

.stock-message {
  margin: 15px 0 0;

  color: #697386;

  font-size: 13px;
}

/* =========================================
   AÇÕES
========================================= */

.actions-card {
  display: flex;

  justify-content: flex-end;

  gap: 12px;

  margin-top: 20px;
}

.cancel-button,
.save-button {
  min-height: 42px;

  padding: 11px 20px;

  border-radius: 7px;

  font-size: 14px;

  cursor: pointer;

  transition: 0.2s;
}

.cancel-button {
  border: 1px solid #d8deea;

  background: white;

  color: #293449;
}

.cancel-button:hover {
  background: #f5f7fb;
}

.save-button {
  border: none;

  background: #1769e0;

  color: white;

  font-weight: bold;
}

.save-button:hover {
  background: #1258bd;
}

/* =========================================
   NOTEBOOK / TABLET
========================================= */

@media (max-width: 1000px) {

  .sidebar {
    width: 210px;
    min-width: 210px;
  }

  .content {
    padding: 24px;
  }

  .form-grid {
    gap: 16px;
  }

}

/* =========================================
   TABLET
========================================= */

@media (max-width: 800px) {

  .sidebar {
    width: 190px;
    min-width: 190px;

    padding: 22px 12px;
  }

  .logo {
    padding-left: 10px;
  }

  .content {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-full {
    grid-column: auto;
  }

}

/* =========================================
   CELULAR
========================================= */

@media (max-width: 600px) {

  .app {
    display: block;

    min-height: 100vh;
  }

  /* Sidebar vira barra superior */
  .sidebar {
    width: 100%;
    min-width: 100%;
    min-height: auto;

    padding: 14px 16px;

    position: relative;
  }

  .logo {
    margin: 0 0 12px;

    padding-left: 0;

    font-size: 21px;
  }

  .menu {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 6px;
  }

  .menu-item {
    padding: 10px 6px;

    text-align: center;

    font-size: 12px;

    white-space: normal;
  }

  .content {
    width: 100%;

    padding: 16px;

    overflow-x: hidden;
  }

  .breadcrumb {
    font-size: 12px;

    line-height: 1.6;
  }

  .header {
    align-items: flex-start;

    flex-direction: column;

    margin-top: 20px;

    margin-bottom: 18px;
  }

  .header h1 {
    font-size: 25px;
  }

  .header p {
    font-size: 14px;

    line-height: 1.5;
  }

  .status {
    align-self: flex-start;
  }

  .card {
    padding: 18px;

    border-radius: 9px;
  }

  .card h2 {
    font-size: 17px;

    margin-bottom: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;

    gap: 16px;
  }

  .field-full {
    grid-column: auto;
  }

  .stock-info {
    align-items: flex-start;

    flex-direction: column;

    gap: 8px;
  }

  .stock-info strong {
    font-size: 19px;
  }

  .stock-message {
    line-height: 1.5;
  }

  .actions-card {
    flex-direction: column;

    gap: 10px;

    padding-bottom: 10px;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }

}

/* =========================================
   CELULARES PEQUENOS
========================================= */

@media (max-width: 400px) {

  .sidebar {
    padding: 12px;
  }

  .menu {
    grid-template-columns: 1fr;
  }

  .menu-item {
    text-align: left;

    padding: 10px 12px;
  }

  .content {
    padding: 12px;
  }

  .card {
    padding: 15px;
  }

  .header h1 {
    font-size: 23px;
  }

}
</style>