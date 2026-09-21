<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nome = ref('Arroz Branco 5kg')
const sku = ref('PRD001')
const ean = ref('7891234567890')
const categoria = ref('Alimentos')
const unidade = ref('UN')
const precoCusto = ref('22,00')
const precoVenda = ref('29,90')

onMounted(() => {
  const produtoSalvo = localStorage.getItem('produtoPRD001')

  if (produtoSalvo) {
    const produto = JSON.parse(produtoSalvo)

    nome.value = produto.nome
    sku.value = produto.sku
    ean.value = produto.ean
    categoria.value = produto.categoria
    unidade.value = produto.unidade
    precoCusto.value = produto.precoCusto
    precoVenda.value = produto.precoVenda
  }
})

function voltarProdutos() {
  router.push('/')
}

function visualizarProduto() {
  router.push('/visualizar-produto')
}

function salvarProduto() {
  const produto = {
    nome: nome.value,
    sku: sku.value,
    ean: ean.value,
    categoria: categoria.value,
    unidade: unidade.value,
    precoCusto: precoCusto.value,
    precoVenda: precoVenda.value
  }

  localStorage.setItem('produtoPRD001', JSON.stringify(produto))

  alert('Produto atualizado com sucesso!')

  router.push('/visualizar-produto')
}
</script>

<template>
  <div class="app">

    <!-- MENU LATERAL -->
    <aside class="sidebar">
      <div class="logo">SIGE</div>

      <nav>
        <a class="menu-item active">Produtos</a>
        <a class="menu-item">Categorias</a>
        <a class="menu-item">Unidades de medida</a>
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

        <span class="status active-status">
          Ativo
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

          <!-- EAN -->
          <div class="field">

            <label>EAN-13</label>

            <input
              v-model="ean"
              type="text"
            />

          </div>

          <!-- CATEGORIA -->
          <div class="field">

            <label>Categoria</label>

            <select v-model="categoria">

              <option>Alimentos</option>
              <option>Bebidas</option>

            </select>

          </div>

          <!-- UNIDADE -->
          <div class="field">

            <label>Unidade de medida</label>

            <select v-model="unidade">

              <option>UN</option>
              <option>KG</option>
              <option>L</option>

            </select>

          </div>

          <!-- PREÇO DE CUSTO -->
          <div class="field">

            <label>Preço de custo</label>

            <input
              v-model="precoCusto"
              type="text"
            />

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

          <span>Quantidade disponível</span>

          <strong>120 unidades</strong>

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
  background: #f5f7fb;
  color: #172033;
  font-family: Arial, sans-serif;
}

/* SIDEBAR */

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #101b36;
  color: white;
  padding: 24px 16px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  padding-left: 12px;
}

.menu-item {
  display: block;
  padding: 13px 14px;
  margin-bottom: 6px;
  border-radius: 8px;
  color: #cbd3e6;
  text-decoration: none;
}

.menu-item.active {
  background: #1769e0;
  color: white;
}

/* CONTEÚDO */

.content {
  flex: 1;
  padding: 28px 36px;
}

/* BREADCRUMB */

.breadcrumb {
  color: #697386;
  font-size: 14px;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  color: #1769e0;
}

/* CABEÇALHO */

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 25px;
}

.header h1 {
  margin: 0 0 8px;
  font-size: 30px;
}

.header p {
  margin: 0;
  color: #697386;
}

/* STATUS */

.status {
  display: inline-block;
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.active-status {
  background: #dff5e7;
  color: #16803c;
}

/* CARD */

.card {
  background: white;
  border: 1px solid #e2e6ee;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 22px;
  font-size: 18px;
}

/* FORMULÁRIO */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
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
}

.field input[readonly] {
  background: #f5f7fb;
  color: #697386;
}

/* ESTOQUE */

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-info span {
  color: #697386;
  font-size: 14px;
}

.stock-info strong {
  font-size: 20px;
}

.stock-message {
  margin: 15px 0 0;
  color: #697386;
  font-size: 13px;
}

/* AÇÕES */

.actions-card {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-button {
  padding: 11px 20px;
  border: 1px solid #d8deea;
  background: white;
  color: #293449;
  border-radius: 7px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-button:hover {
  background: #f5f7fb;
}

.save-button {
  padding: 11px 20px;
  border: none;
  background: #1769e0;
  color: white;
  border-radius: 7px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.save-button:hover {
  background: #1258bd;
}

/* RESPONSIVO */

@media (max-width: 900px) {

  .sidebar {
    width: 190px;
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

@media (max-width: 600px) {

  .sidebar {
    display: none;
  }

  .content {
    padding: 16px;
  }

  .header {
    align-items: flex-start;
    gap: 15px;
  }

  .actions-card {
    flex-direction: column;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }

}

</style>