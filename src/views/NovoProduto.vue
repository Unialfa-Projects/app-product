<template>
  <div class="pagina">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">S</span>
        <span>SIGE</span>
      </div>

      <nav>
        <router-link to="/" class="menu-item">
          <span>▦</span>
          Produtos
        </router-link>

        <a href="#" class="menu-item">
          <span>▤</span>
          Categorias
        </a>

        <a href="#" class="menu-item">
          <span>◫</span>
          Unidades de medida
        </a>
      </nav>
    </aside>

    <main class="conteudo">
      <header class="topo">
        <div>
          <div class="breadcrumb">
            <router-link to="/">Produtos</router-link>
            <span>›</span>
            <span>Novo Produto</span>
          </div>

          <h1>Novo Produto</h1>
          <p>Cadastre um novo produto no catálogo.</p>
        </div>
      </header>

      <section class="card">
        <div class="card-header">
          <h2>Dados do produto</h2>
          <p>Preencha as informações abaixo para cadastrar o produto.</p>
        </div>

        <form @submit.prevent="salvarProduto">
          <div class="form-grid">

            <div class="campo campo-grande">
              <label for="nome">
                Nome do produto <span>*</span>
              </label>

              <input
                id="nome"
                v-model="form.nome"
                type="text"
                placeholder="Digite o nome do produto"
              />

              <small v-if="erros.nome" class="erro">
                {{ erros.nome }}
              </small>
            </div>

            <div class="campo">
              <label for="sku">
                SKU <span>*</span>
              </label>

              <input
                id="sku"
                v-model="form.sku"
                type="text"
                placeholder="Ex.: PRD004"
                @input="form.sku = form.sku.toUpperCase()"
              />

              <small v-if="erros.sku" class="erro">
                {{ erros.sku }}
              </small>
            </div>

            <div class="campo">
              <label for="ean">
                EAN-13
              </label>

              <input
                id="ean"
                v-model="form.ean"
                type="text"
                maxlength="13"
                placeholder="Digite o código EAN-13"
                @input="form.ean = somenteNumeros(form.ean)"
              />

              <small v-if="erros.ean" class="erro">
                {{ erros.ean }}
              </small>
            </div>

            <div class="campo">
              <label for="categoria">
                Categoria <span>*</span>
              </label>

              <select id="categoria" v-model="form.categoria">
                <option value="">Selecione</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Higiene">Higiene</option>
                <option value="Outros">Outros</option>
              </select>

              <small v-if="erros.categoria" class="erro">
                {{ erros.categoria }}
              </small>
            </div>

            <div class="campo">
              <label for="unidade">
                Unidade <span>*</span>
              </label>

              <select id="unidade" v-model="form.unidade">
                <option value="">Selecione</option>
                <option value="UN">UN - Unidade</option>
                <option value="KG">KG - Quilograma</option>
                <option value="G">G - Grama</option>
                <option value="L">L - Litro</option>
                <option value="ML">ML - Mililitro</option>
              </select>

              <small v-if="erros.unidade" class="erro">
                {{ erros.unidade }}
              </small>
            </div>

            <div class="campo">
              <label for="precoCusto">
                Preço de custo <span>*</span>
              </label>

              <div class="input-prefix">
                <span>R$</span>

                <input
                  id="precoCusto"
                  v-model="form.precoCusto"
                  type="text"
                  inputmode="decimal"
                  placeholder="0,00"
                />
              </div>

              <small v-if="erros.precoCusto" class="erro">
                {{ erros.precoCusto }}
              </small>
            </div>

            <div class="campo">
              <label for="precoVenda">
                Preço de venda <span>*</span>
              </label>

              <div class="input-prefix">
                <span>R$</span>

                <input
                  id="precoVenda"
                  v-model="form.precoVenda"
                  type="text"
                  inputmode="decimal"
                  placeholder="0,00"
                />
              </div>

              <small v-if="erros.precoVenda" class="erro">
                {{ erros.precoVenda }}
              </small>
            </div>

          </div>

          <div v-if="erroGeral" class="alerta">
            {{ erroGeral }}
          </div>

          <div class="acoes">
            <router-link to="/" class="btn btn-secundario">
              Cancelar
            </router-link>

            <button
              type="submit"
              class="btn btn-principal"
              :disabled="salvando"
            >
              {{ salvando ? 'Salvando...' : 'Salvar produto' }}
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  obterProdutos,
  salvarProdutos,
  selecionarProduto,
  gerarNovoId
} from '../data/produtos'

const router = useRouter()

const salvando = ref(false)
const erroGeral = ref('')

const form = ref({
  nome: '',
  sku: '',
  ean: '',
  categoria: '',
  unidade: '',
  precoCusto: '',
  precoVenda: ''
})

const erros = ref({
  nome: '',
  sku: '',
  ean: '',
  categoria: '',
  unidade: '',
  precoCusto: '',
  precoVenda: ''
})

function somenteNumeros(valor) {
  return valor.replace(/\D/g, '')
}

function numeroPreco(valor) {
  if (!valor) return 0

  const valorLimpo = String(valor)
    .replace(/\./g, '')
    .replace(',', '.')

  return Number(valorLimpo)
}

function limparErros() {
  erros.value = {
    nome: '',
    sku: '',
    ean: '',
    categoria: '',
    unidade: '',
    precoCusto: '',
    precoVenda: ''
  }

  erroGeral.value = ''
}

function validar() {
  limparErros()

  let valido = true

  const nome = form.value.nome.trim()
  const sku = form.value.sku.trim().toUpperCase()
  const ean = form.value.ean.trim()

  const precoCusto = numeroPreco(form.value.precoCusto)
  const precoVenda = numeroPreco(form.value.precoVenda)

  if (!nome) {
    erros.value.nome = 'Informe o nome do produto.'
    valido = false
  }

  if (!sku) {
    erros.value.sku = 'Informe o SKU.'
    valido = false
  }

  const produtos = obterProdutos()

  const skuExiste = produtos.some(
    produto => produto.sku.toUpperCase() === sku
  )

  if (skuExiste) {
    erros.value.sku = 'Este SKU já está cadastrado.'
    valido = false
  }

  if (ean && ean.length !== 13) {
    erros.value.ean = 'O EAN deve possuir 13 números.'
    valido = false
  }

  if (!form.value.categoria) {
    erros.value.categoria = 'Selecione uma categoria.'
    valido = false
  }

  if (!form.value.unidade) {
    erros.value.unidade = 'Selecione uma unidade.'
    valido = false
  }

  if (precoCusto < 0) {
    erros.value.precoCusto = 'Informe um preço válido.'
    valido = false
  }

  if (precoVenda <= 0) {
    erros.value.precoVenda = 'Informe um preço de venda válido.'
    valido = false
  }

  if (precoCusto > precoVenda) {
    erros.value.precoVenda =
      'O preço de venda deve ser maior ou igual ao preço de custo.'
    valido = false
  }

  return valido
}

function salvarProduto() {
  if (!validar()) {
    return
  }

  salvando.value = true

  try {
    const produtos = obterProdutos()

    const novoProduto = {
      id: gerarNovoId(produtos),
      sku: form.value.sku.trim().toUpperCase(),
      nome: form.value.nome.trim(),
      ean: form.value.ean.trim(),
      categoria: form.value.categoria,
      unidade: form.value.unidade,
      precoCusto: form.value.precoCusto,
      precoVenda: form.value.precoVenda,
      quantidade: 0,
      ativo: true,
      historicoPrecos: []
    }

    produtos.push(novoProduto)

    salvarProdutos(produtos)

    selecionarProduto(novoProduto.sku)

    alert('Produto cadastrado com sucesso!')

    router.push('/visualizar-produto')
  } catch (erro) {
    console.error(erro)

    erroGeral.value =
      'Não foi possível cadastrar o produto. Tente novamente.'

    salvando.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.pagina {
  min-height: 100vh;
  display: flex;
  background: #f8fafc;
  color: #1e293b;
}

/* SIDEBAR */

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 24px 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 42px;
  padding-left: 8px;
  color: #1e293b;
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
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
}

.menu-item:hover {
  background: #eff6ff;
  color: #2563eb;
}

/* CONTEÚDO */

.conteudo {
  flex: 1;
  padding: 38px 46px;
  min-width: 0;
}

.topo {
  margin-bottom: 28px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #94a3b8;
  font-size: 13px;
  margin-bottom: 12px;
}

.breadcrumb a {
  color: #2563eb;
  text-decoration: none;
}

h1 {
  margin: 0 0 6px;
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
}

.topo p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* CARD */

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  max-width: 1100px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.card-header {
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h2 {
  margin: 0 0 6px;
  font-size: 18px;
  color: #0f172a;
}

.card-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

/* FORMULÁRIO */

form {
  padding: 28px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 24px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.campo-grande {
  grid-column: span 2;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

label span {
  color: #dc2626;
}

input,
select {
  width: 100%;
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 0 13px;
  background: #ffffff;
  color: #1e293b;
  font-size: 14px;
  outline: none;
}

input::placeholder {
  color: #94a3b8;
}

input:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

.input-prefix {
  display: flex;
  align-items: center;
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  overflow: hidden;
  background: #ffffff;
}

.input-prefix:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

.input-prefix span {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 13px;
  border-right: 1px solid #e2e8f0;
}

.input-prefix input {
  border: 0;
  box-shadow: none;
  height: 100%;
}

/* ERROS */

.erro {
  color: #dc2626;
  font-size: 12px;
}

.alerta {
  margin-top: 24px;
  padding: 13px 15px;
  border-radius: 7px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 13px;
}

/* BOTÕES */

.acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 34px;
  padding-top: 22px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  min-height: 42px;
  padding: 0 20px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.btn-secundario {
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secundario:hover {
  background: #f8fafc;
}

.btn-principal {
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
}

.btn-principal:hover {
  background: #1d4ed8;
}

.btn-principal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* RESPONSIVO */

@media (max-width: 900px) {
  .sidebar {
    width: 190px;
  }

  .conteudo {
    padding: 28px 24px;
  }
}

@media (max-width: 700px) {
  .pagina {
    display: block;
  }

  .sidebar {
    width: 100%;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid #e2e8f0;
    padding: 14px;
  }

  .logo {
    margin-bottom: 12px;
  }

  nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .menu-item {
    white-space: nowrap;
  }

  .conteudo {
    padding: 22px 16px;
  }

  h1 {
    font-size: 25px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .campo-grande {
    grid-column: span 1;
  }

  .card-header,
  form {
    padding: 20px;
  }

  .acoes {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>