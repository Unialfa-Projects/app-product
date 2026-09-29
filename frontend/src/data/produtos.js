const PRODUTOS_KEY = 'sige_produtos'

const produtosIniciais = [
  {
    id: 1,
    sku: 'PRD001',
    nome: 'Arroz Branco 5kg',
    ean: '7891234567890',
    categoria: 'Alimentos',
    unidade: 'UN',
    precoCusto: '22,00',
    precoVenda: '29,90',
    quantidade: 120,
    ativo: true,
    historicoPrecos: []
  },

  {
    id: 2,
    sku: 'PRD002',
    nome: 'Feijão Carioca 1kg',
    ean: '7891234567891',
    categoria: 'Alimentos',
    unidade: 'UN',
    precoCusto: '6,00',
    precoVenda: '8,50',
    quantidade: 85,
    ativo: true,
    historicoPrecos: []
  },

  {
    id: 3,
    sku: 'PRD003',
    nome: 'Refrigerante 2L',
    ean: '7891234567892',
    categoria: 'Bebidas',
    unidade: 'UN',
    precoCusto: '7,00',
    precoVenda: '9,99',
    quantidade: 42,
    ativo: false,
    historicoPrecos: []
  }
]

export function obterProdutos() {
  const dados = localStorage.getItem(PRODUTOS_KEY)

  if (!dados) {
    localStorage.setItem(
      PRODUTOS_KEY,
      JSON.stringify(produtosIniciais)
    )

    return [...produtosIniciais]
  }

  try {
    return JSON.parse(dados)
  } catch {
    localStorage.setItem(
      PRODUTOS_KEY,
      JSON.stringify(produtosIniciais)
    )

    return [...produtosIniciais]
  }
}

export function salvarProdutos(produtos) {
  localStorage.setItem(
    PRODUTOS_KEY,
    JSON.stringify(produtos)
  )
}

export function obterProdutoPorSku(sku) {
  const produtos = obterProdutos()

  return produtos.find(
    produto => produto.sku === sku
  )
}

export function selecionarProduto(sku) {
  localStorage.setItem(
    'sige_produto_selecionado',
    sku
  )
}

export function obterProdutoSelecionado() {
  const sku = localStorage.getItem(
    'sige_produto_selecionado'
  )

  if (!sku) {
    return null
  }

  return obterProdutoPorSku(sku)
}

export function gerarNovoId(produtos) {
  if (produtos.length === 0) {
    return 1
  }

  return Math.max(
    ...produtos.map(produto => produto.id)
  ) + 1
}

export function gerarNovoSku(produtos) {
  const numero = produtos.length + 1

  return `PRD${String(numero).padStart(3, '0')}`
}