<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const produto = ref({
  nome: 'Arroz Branco 5kg',
  sku: 'PRD001',
  ean: '7891234567890',
  categoria: 'Alimentos',
  unidade: 'UN',
  precoCusto: '22,00',
  precoVenda: '29,90'
})

onMounted(() => {
  const produtoSalvo = localStorage.getItem('produtoPRD001')

  if (produtoSalvo) {
    produto.value = JSON.parse(produtoSalvo)
  }
})

function voltarProdutos() {
  router.push('/')
}

function editarProduto() {
  router.push('/editar-produto')
}
</script>

<template>
  <div class="app">

    <!-- MENU LATERAL -->
    <aside class="sidebar">

      <div class="logo">
        SIGE
      </div>

      <nav>

        <a class="menu-item active">
          Produtos
        </a>

        <a class="menu-item">
          Categorias
        </a>

        <a class="menu-item">
          Unidades de medida
        </a>

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

          <span class="status active-status">
            Ativo
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
              EAN-13
            </span>

            <strong>
              {{ produto.ean }}
            </strong>

          </div>

          <div class="info-item">

            <span>
              Preço de custo
            </span>

            <strong>
              R$ {{ produto.precoCusto }}
            </strong>

          </div>

          <div class="info-item">

            <span>
              Preço de venda
            </span>

            <strong>
              R$ {{ produto.precoVenda }}
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
            120 unidades
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

          <button class="secondary-button">
            Histórico de preço
          </button>

          <button class="danger-button">
            Inativar produto
          </button>

        </div>

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* INFORMAÇÕES */

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.info-item span {
  font-size: 13px;
  color: #697386;
}

.info-item strong {
  font-size: 15px;
  color: #293449;
}

/* ESTOQUE */

.stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock span {
  font-size: 13px;
  color: #697386;
}

.stock strong {
  font-size: 20px;
}

/* BOTÕES */

.edit-button {
  border: none;
  background: #1769e0;
  color: white;
  padding: 11px 18px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.edit-button:hover {
  background: #1258bd;
}

.secondary-button {
  padding: 11px 18px;
  border: 1px solid #d8deea;
  background: white;
  border-radius: 7px;
  cursor: pointer;
}

.danger-button {
  padding: 11px 18px;
  border: 1px solid #e0b5b5;
  background: #fff5f5;
  color: #b42318;
  border-radius: 7px;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 12px;
}

/* RESPONSIVO */

@media (max-width: 900px) {

  .sidebar {
    width: 190px;
  }

  .content {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header {
    align-items: flex-start;
    gap: 20px;
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
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }

}

</style>