<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function novoProduto() {
  router.push('/novo-produto')
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
      <!-- TOPO -->
      <div class="topbar">
        <div class="breadcrumb">
          Início / <strong>Produtos</strong>
        </div>

        <button class="new-button" @click="novoProduto">
        + Novo produto
        </button>
      </div>

      <!-- TÍTULO -->
      <section class="header">
        <h1>Produtos</h1>
        <p>
          Visualização, precificação e gerenciamento de status
          de catálogo geral da operação.
        </p>
      </section>

      <!-- FILTROS -->
      <section class="filters">
        <div class="field search">
          <label>Produto</label>
          <input
            type="text"
            placeholder="Pesquisar produto..."
          />
        </div>

        <div class="field">
          <label>Categoria</label>
          <select>
            <option>Todos</option>
          </select>
        </div>

        <div class="field">
          <label>Situação</label>
          <select>
            <option>Todas</option>
          </select>
        </div>

        <button class="clear-button">
          Limpar filtros
        </button>
      </section>

      <!-- TABELA -->
      <section class="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>PRODUTO</th>
              <th>CATEGORIA</th>
              <th>UNIDADE</th>
              <th>QUANTIDADE</th>
              <th>VALOR</th>
              <th>SITUAÇÃO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>PRD001</td>
              <td>Arroz Branco 5kg</td>
              <td>Alimentos</td>
              <td>UN</td>
              <td>120</td>
              <td>R$ 29,90</td>
              <td>
                <span class="status active-status">
                  Ativo
                </span>
              </td>
              <td class="actions">
                ✏️ 👁️ ⏻
              </td>
            </tr>

            <tr>
              <td>PRD002</td>
              <td>Feijão Carioca 1kg</td>
              <td>Alimentos</td>
              <td>UN</td>
              <td>85</td>
              <td>R$ 8,50</td>
              <td>
                <span class="status active-status">
                  Ativo
                </span>
              </td>
              <td class="actions">
                ✏️ 👁️ ⏻
              </td>
            </tr>

            <tr>
              <td>PRD003</td>
              <td>Refrigerante 2L</td>
              <td>Bebidas</td>
              <td>UN</td>
              <td>42</td>
              <td>R$ 9,99</td>
              <td>
                <span class="status inactive-status">
                  Inativo
                </span>
              </td>
              <td class="actions">
                ✏️ 👁️ ⏻
              </td>
            </tr>
          </tbody>
        </table>

        <!-- RODAPÉ -->
        <div class="table-footer">
          <span>Exibindo 1–20 de 4.812 produtos</span>

          <div class="pagination">
            <button>‹</button>
            <button class="page-active">1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>›</button>
          </div>

          <span>Itens por página: 20</span>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f7fb;
  color: #172033;
}

.app {
  display: flex;
  min-height: 100vh;
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
  cursor: pointer;
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

/* TOPO */

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  color: #697386;
  font-size: 14px;
}

.new-button {
  border: none;
  background: #1769e0;
  color: white;
  padding: 11px 18px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.new-button:hover {
  background: #1258bd;
}

/* TÍTULO */

.header {
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

/* FILTROS */

.filters {
  display: flex;
  align-items: end;
  gap: 16px;
  background: white;
  border: 1px solid #e2e6ee;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 190px;
}

.field.search {
  flex: 1;
}

.field label {
  font-size: 13px;
  font-weight: bold;
  color: #4d5668;
}

.field input,
.field select {
  height: 40px;
  border: 1px solid #d8deea;
  border-radius: 7px;
  padding: 0 12px;
  background: white;
  font-size: 14px;
}

.clear-button {
  height: 40px;
  padding: 0 15px;
  border: 1px solid #d8deea;
  background: white;
  border-radius: 7px;
  cursor: pointer;
}

/* TABELA */

.table-container {
  background: white;
  border: 1px solid #e2e6ee;
  border-radius: 10px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 16px;
  text-align: left;
  border-bottom: 1px solid #edf0f5;
  font-size: 14px;
}

th {
  color: #697386;
  font-size: 12px;
  font-weight: bold;
  background: #fafbfc;
}

td {
  color: #293449;
}

.status {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.active-status {
  background: #dff5e7;
  color: #16803c;
}

.inactive-status {
  background: #e7e9ed;
  color: #687080;
}

.actions {
  white-space: nowrap;
  cursor: pointer;
}

/* RODAPÉ */

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  color: #697386;
  font-size: 13px;
}

.pagination {
  display: flex;
  gap: 5px;
}

.pagination button {
  width: 32px;
  height: 32px;
  border: 1px solid #d8deea;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination .page-active {
  background: #1769e0;
  color: white;
  border-color: #1769e0;
}

/* RESPONSIVO */

@media (max-width: 900px) {
  .sidebar {
    width: 190px;
  }

  .filters {
    flex-wrap: wrap;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 1000px;
  }
}
</style>