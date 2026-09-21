<template>
  <div class="pagina">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">S</span>
        <span>SIGE</span>
      </div>

      <nav>
        <router-link to="/" class="menu-item ativo">
          <span>▦</span>
          Produtos
        </router-link>

        <a href="#" class="menu-item" @click.prevent>
          <span>▤</span>
          Categorias
        </a>

        <a href="#" class="menu-item" @click.prevent>
          <span>◫</span>
          Unidades de medida
        </a>
      </nav>
    </aside>

    <main class="conteudo">
      <header class="topo">
        <div>
          <div class="breadcrumb">
            <span>Produtos</span>
          </div>

          <h1>Produtos</h1>
          <p>Gerencie os produtos cadastrados no sistema.</p>
        </div>

        <router-link to="/novo-produto" class="btn-novo">
          <span>+</span>
          Novo produto
        </router-link>
      </header>

      <section class="card">
        <div class="filtros">
          <div class="campo busca">
            <label for="busca">Nome ou SKU</label>

            <div class="input-icon">
              <span>⌕</span>

              <input
                id="busca"
                v-model="busca"
                type="text"
                placeholder="Pesquisar produto ou SKU..."
              />
            </div>
          </div>

          <div class="campo">
            <label for="categoria">Categoria</label>

            <select id="categoria" v-model="categoriaFiltro">
              <option value="">Todas</option>

              <option
                v-for="categoria in categorias"
                :key="categoria"
                :value="categoria"
              >
                {{ categoria }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label for="situacao">Situação</label>

            <select id="situacao" v-model="situacaoFiltro">
              <option value="">Todas</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <button class="btn-limpar" @click="limparFiltros">
            Limpar filtros
          </button>
        </div>

        <div class="resultado-info">
          <span>
            {{ produtosFiltrados.length }}
            {{ produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados' }}
          </span>
        </div>

        <div class="tabela-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Unidade</th>
                <th>Quantidade</th>
                <th>Valor</th>
                <th>Situação</th>
                <th class="th-acoes">Ações</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="produtosFiltrados.length === 0">
                <td colspan="8" class="sem-resultados">
                  <div class="vazio">
                    <div class="icone-vazio">⌕</div>
                    <strong>Nenhum produto encontrado</strong>
                    <span>
                      Tente alterar os filtros ou cadastrar um novo produto.
                    </span>
                  </div>
                </td>
              </tr>

              <tr
                v-for="produto in produtosFiltrados"
                :key="produto.id"
              >
                <td>
                  <span class="sku">{{ produto.sku }}</span>
                </td>

                <td>
                  <div class="produto-nome">
                    {{ produto.nome }}
                  </div>
                </td>

                <td>
                  {{ produto.categoria }}
                </td>

                <td>
                  {{ produto.unidade }}
                </td>

                <td>
                  {{ produto.quantidade ?? 0 }}
                </td>

                <td>
                  <strong>
                    R$ {{ produto.precoVenda }}
                  </strong>
                </td>

                <td>
                  <span
                    class="status"
                    :class="produto.ativo ? 'status-ativo' : 'status-inativo'"
                  >
                    <span class="bolinha"></span>
                    {{ produto.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>

                <td>
                  <div class="acoes">
                    <button
                      class="acao"
                      title="Visualizar"
                      @click="visualizarProduto(produto.sku)"
                    >
                      👁
                    </button>

                    <button
                      class="acao"
                      title="Editar"
                      @click="editarProduto(produto.sku)"
                    >
                      ✎
                    </button>

                    <button
                      class="acao"
                      :title="produto.ativo ? 'Inativar' : 'Ativar'"
                      @click="alternarStatus(produto.sku)"
                    >
                      {{ produto.ativo ? '⊘' : '✓' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="rodape">
          <span>
            Exibindo {{ produtosFiltrados.length }} produto(s)
          </span>

          <span>
            Total cadastrado: {{ produtos.length }}
          </span>
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  obterProdutos,
  salvarProdutos,
  selecionarProduto
} from '../data/produtos'

const router = useRouter()

const produtos = ref([])

const busca = ref('')
const categoriaFiltro = ref('')
const situacaoFiltro = ref('')

onMounted(() => {
  carregarProdutos()
})

function carregarProdutos() {
  produtos.value = obterProdutos()
}

const categorias = computed(() => {
  const lista = produtos.value.map(produto => produto.categoria)

  return [...new Set(lista)]
    .filter(Boolean)
    .sort()
})

const produtosFiltrados = computed(() => {
  const texto = busca.value.trim().toLowerCase()

  return produtos.value.filter(produto => {
    const correspondeBusca =
      !texto ||
      produto.nome.toLowerCase().includes(texto) ||
      produto.sku.toLowerCase().includes(texto)

    const correspondeCategoria =
      !categoriaFiltro.value ||
      produto.categoria === categoriaFiltro.value

    const correspondeSituacao =
      !situacaoFiltro.value ||
      (situacaoFiltro.value === 'ativo' && produto.ativo) ||
      (situacaoFiltro.value === 'inativo' && !produto.ativo)

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeSituacao
    )
  })
})

function limparFiltros() {
  busca.value = ''
  categoriaFiltro.value = ''
  situacaoFiltro.value = ''
}

function visualizarProduto(sku) {
  selecionarProduto(sku)
  router.push('/visualizar-produto')
}

function editarProduto(sku) {
  selecionarProduto(sku)
  router.push('/editar-produto')
}

function alternarStatus(sku) {
  const produto = produtos.value.find(
    item => item.sku === sku
  )

  if (!produto) return

  const acao = produto.ativo ? 'inativar' : 'ativar'

  const confirmado = confirm(
    `Deseja realmente ${acao} o produto "${produto.nome}"?`
  )

  if (!confirmado) return

  produto.ativo = !produto.ativo

  salvarProdutos(produtos.value)

  carregarProdutos()
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

.menu-item:hover,
.menu-item.ativo {
  background: #eff6ff;
  color: #2563eb;
}

/* CONTEÚDO */

.conteudo {
  flex: 1;
  min-width: 0;
  padding: 38px 46px;
}

.topo {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.breadcrumb {
  color: #2563eb;
  font-size: 13px;
  margin-bottom: 12px;
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

/* BOTÃO NOVO */

.btn-novo {
  height: 42px;
  padding: 0 18px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.btn-novo:hover {
  background: #1d4ed8;
}

.btn-novo span {
  font-size: 20px;
  line-height: 1;
}

/* CARD */

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

/* FILTROS */

.filtros {
  display: grid;
  grid-template-columns: minmax(280px, 1.5fr) minmax(180px, 1fr) minmax(160px, 0.8fr) auto;
  gap: 16px;
  align-items: end;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

input,
select {
  width: 100%;
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 0 12px;
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
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-icon {
  position: relative;
}

.input-icon span {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 20px;
  pointer-events: none;
}

.input-icon input {
  padding-left: 38px;
}

.btn-limpar {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-limpar:hover {
  background: #f8fafc;
  color: #2563eb;
}

/* RESULTADO */

.resultado-info {
  padding: 17px 24px;
  color: #64748b;
  font-size: 13px;
}

/* TABELA */

.tabela-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 950px;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  height: 48px;
  padding: 0 18px;
  text-align: left;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #475569;
  white-space: nowrap;
}

tbody tr:hover {
  background: #f8fbff;
}

.sku {
  color: #2563eb;
  font-weight: 600;
}

.produto-nome {
  color: #1e293b;
  font-weight: 600;
}

th:last-child,
td:last-child {
  text-align: center;
}

.th-acoes {
  width: 130px;
}

/* STATUS */

.status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.bolinha {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-ativo {
  color: #15803d;
  background: #f0fdf4;
}

.status-ativo .bolinha {
  background: #22c55e;
}

.status-inativo {
  color: #64748b;
  background: #f1f5f9;
}

.status-inativo .bolinha {
  background: #94a3b8;
}

/* AÇÕES */

.acoes {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.acao {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
}

.acao:hover {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

/* VAZIO */

.sem-resultados {
  height: 260px;
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #64748b;
}

.icone-vazio {
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
}

.vazio strong {
  color: #334155;
  font-size: 14px;
}

.vazio span {
  font-size: 12px;
}

/* RODAPÉ */

.rodape {
  display: flex;
  justify-content: space-between;
  padding: 18px 24px;
  color: #64748b;
  font-size: 12px;
}

/* RESPONSIVO */

@media (max-width: 1100px) {
  .filtros {
    grid-template-columns: 1fr 1fr;
  }

  .btn-limpar {
    width: fit-content;
  }
}

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
    padding: 14px;
    border-right: 0;
    border-bottom: 1px solid #e2e8f0;
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

  .topo {
    align-items: flex-start;
    flex-direction: column;
  }

  .btn-novo {
    width: 100%;
    justify-content: center;
  }

  h1 {
    font-size: 25px;
  }

  .filtros {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .btn-limpar {
    width: 100%;
  }

  .resultado-info {
    padding: 15px 18px;
  }

  .rodape {
    gap: 10px;
    flex-direction: column;
    padding: 16px 18px;
  }
}
</style>