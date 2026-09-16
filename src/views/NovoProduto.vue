<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function voltarProdutos() {
  router.push('/')
}
</script>

<template>
  <div class="page">
    <!-- CABEÇALHO -->
    <div class="breadcrumb">
  <span class="inicio" @click="voltarProdutos">Início</span> /
  <span class="inicio" @click="voltarProdutos">Produtos</span> /
  <strong>Novo produto</strong>
    </div>

    <div class="header">
      <div>
        <h1>Novo produto</h1>
        <p>Cadastre um novo produto no catálogo.</p>
      </div>

      <div class="buttons">
        <button class="cancel-button" @click="voltarProdutos">
        Cancelar
        </button>
        <button class="save-button" @click="salvarProduto">
  Salvar produto
</button>
      </div>
    </div>

    <!-- FORMULÁRIO -->
    <section class="card">
      <h2>Informações do produto</h2>

      <div class="form-grid">
        <div class="field full">
          <label>Nome do produto *</label>
          <input
            type="text"
            placeholder="Digite o nome do produto"
          />
        </div>

        <div class="field">
          <label>SKU *</label>
          <input
            type="text"
            placeholder="Ex.: PRD001"
          />
        </div>

        <div class="field">
          <label>EAN-13</label>
          <input
            type="text"
            placeholder="Digite o código EAN-13"
          />
        </div>

        <div class="field">
          <label>Categoria *</label>
          <select>
            <option value="">Selecione uma categoria</option>
            <option>Alimentos</option>
            <option>Bebidas</option>
            <option>Limpeza</option>
          </select>
        </div>

        <div class="field">
          <label>Unidade *</label>
          <select>
            <option value="">Selecione uma unidade</option>
            <option>UN</option>
            <option>KG</option>
            <option>LT</option>
            <option>MT</option>
          </select>
        </div>
      </div>
    </section>

    <!-- PREÇOS -->
    <section class="card">
      <h2>Precificação</h2>

      <div class="form-grid">
        <div class="field">
          <label>Preço de custo *</label>

          <div class="input-money">
            <span>R$</span>
            <input
              type="number"
              placeholder="0,00"
            />
          </div>
        </div>

        <div class="field">
          <label>Preço de venda *</label>

          <div class="input-money">
            <span>R$</span>
            <input
              type="number"
              placeholder="0,00"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 30px 40px;
  color: #172033;
}

/* BREADCRUMB */

.breadcrumb {
  font-size: 14px;
  color: #697386;
  margin-bottom: 28px;
}

/* CABEÇALHO */

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* BOTÕES */

.buttons {
  display: flex;
  gap: 10px;
}

.cancel-button,
.save-button {
  height: 42px;
  padding: 0 18px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid #d8deea;
  background: white;
  color: #4d5668;
}

.save-button {
  border: none;
  background: #1769e0;
  color: white;
}

.save-button:hover {
  background: #1258bd;
}

/* CARDS */

.card {
  background: white;
  border: 1px solid #e2e6ee;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 25px;
  font-size: 18px;
}

/* FORMULÁRIO */

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full {
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
  color: #172033;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #1769e0;
}

/* DINHEIRO */

.input-money {
  display: flex;
  align-items: center;
  height: 42px;
  border: 1px solid #d8deea;
  border-radius: 7px;
  overflow: hidden;
}

.input-money span {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #f5f7fb;
  color: #697386;
  font-size: 14px;
}

.input-money input {
  border: none;
  border-radius: 0;
  height: 100%;
}

.input-money input:focus {
  border: none;
}

/* RESPONSIVO */

@media (max-width: 800px) {
  .page {
    padding: 20px;
  }

  .header {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }
}
</style>