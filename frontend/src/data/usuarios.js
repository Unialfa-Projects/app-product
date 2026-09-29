import { api } from '../services/api'

const USUARIO_KEY = 'sige_usuario'

export function cadastrarUsuario(dados) {
  return api.post('/api/usuarios', dados)
}

export async function entrar(email, senha) {
  const usuario = await api.post('/api/usuarios/login', { email, senha })

  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))

  return usuario
}

export function obterUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem(USUARIO_KEY))
  } catch {
    return null
  }
}
