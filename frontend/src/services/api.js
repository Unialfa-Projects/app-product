// Ponto único de comunicação com a API do backend.
//
// VITE_API_URL: endereço da API. Vazio = mesma origem do site (no Docker o
// nginx repassa /api para o backend; no "npm run dev" o Vite faz o mesmo).
// VITE_API_KEY: chave enviada em "Authorization: Bearer ..." nas rotas de
// escrita (veja GESTOR_API_KEY / OPERADOR_API_KEY no backend).
const API_URL = import.meta.env.VITE_API_URL ?? ''
const API_KEY = import.meta.env.VITE_API_KEY ?? ''

export class ApiErro extends Error {
  constructor(status, codigo, mensagem, detalhes = []) {
    super(mensagem)
    this.status = status
    this.codigo = codigo
    this.detalhes = detalhes
  }
}

export async function requisitar(metodo, caminho, corpo) {
  const headers = {}

  if (corpo !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`
  }

  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined
    })
  } catch {
    throw new ApiErro(0, 'SEM_CONEXAO', 'Não foi possível conectar à API.')
  }

  const texto = await resposta.text()
  const dados = texto ? JSON.parse(texto) : null

  if (!resposta.ok) {
    throw new ApiErro(
      resposta.status,
      dados?.codigo ?? 'ERRO',
      dados?.erro ?? 'Erro ao comunicar com a API.',
      dados?.detalhes ?? []
    )
  }

  return dados
}

export const api = {
  get: caminho => requisitar('GET', caminho),
  post: (caminho, corpo) => requisitar('POST', caminho, corpo),
  put: (caminho, corpo) => requisitar('PUT', caminho, corpo),
  delete: caminho => requisitar('DELETE', caminho)
}
