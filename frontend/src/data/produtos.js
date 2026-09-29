import { api } from '../services/api'

// Produtos, categorias e unidades agora vêm do banco de dados pela API.
// Apenas o produto selecionado (para visualizar/editar) continua no
// localStorage, como antes.
const PRODUTO_SELECIONADO_KEY = 'sige_produto_selecionado'

// A API pagina em no máximo 100 itens; busca todas as páginas.
export async function obterProdutos() {
  const produtos = []
  let pagina = 1
  let total = 0

  do {
    const resposta = await api.get(`/api/produtos?pagina=${pagina}&limite=100`)

    produtos.push(...resposta.dados)
    total = resposta.total
    pagina++
  } while (produtos.length < total)

  return produtos
}

export function obterProdutoPorId(id) {
  return api.get(`/api/produtos/${id}`)
}

export function criarProduto(dados) {
  return api.post('/api/produtos', dados)
}

export function atualizarProduto(id, dados) {
  return api.put(`/api/produtos/${id}`, dados)
}

export function inativarProduto(id) {
  return api.delete(`/api/produtos/${id}`)
}

export function reativarProduto(id) {
  return api.post(`/api/produtos/${id}/reativar`)
}

export async function obterHistoricoPrecos(id) {
  const resposta = await api.get(`/api/produtos/${id}/historico-precos`)

  return resposta.dados
}

export async function obterCategorias() {
  const resposta = await api.get('/api/categorias')

  return resposta.dados
}

export function criarCategoria(dados) {
  return api.post('/api/categorias', dados)
}

export function inativarCategoria(id) {
  return api.delete(`/api/categorias/${id}`)
}

export async function obterUnidades() {
  const resposta = await api.get('/api/unidades-medida')

  return resposta.dados
}

export function criarUnidade(dados) {
  return api.post('/api/unidades-medida', dados)
}

export function selecionarProduto(id) {
  localStorage.setItem(
    PRODUTO_SELECIONADO_KEY,
    String(id)
  )
}

export function obterProdutoSelecionado() {
  const id = localStorage.getItem(
    PRODUTO_SELECIONADO_KEY
  )

  if (!id) {
    return Promise.resolve(null)
  }

  return obterProdutoPorId(id).catch(() => null)
}

// "1.234,56" -> 1234.56 (mesma regra que já existia em NovoProduto.vue)
export function numeroPreco(valor) {
  if (!valor) return 0

  const valorLimpo = String(valor)
    .replace(/\./g, '')
    .replace(',', '.')

  return Math.round(Number(valorLimpo) * 100) / 100
}

export function formatarPreco(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
