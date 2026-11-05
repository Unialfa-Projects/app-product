import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import * as usuariosRepo from '../repositorios/usuarios.repo.js';

// RF29, RF31, RN13, RNF13
export async function cadastrar({ nome, email, senha }) {
  const existente = await usuariosRepo.buscarPorEmail(email);
  if (existente) throw new ErroAplicacao('EMAIL_JA_CADASTRADO');

  const hash = await bcrypt.hash(senha, env.BCRYPT_CUSTO);
  return usuariosRepo.inserir({ nome, email, senha: hash }); // RN15: nunca retorna a senha
}

// RF30 — mesma mensagem para e-mail inexistente e senha errada
export async function login({ email, senha }) {
  const usuario = await usuariosRepo.buscarPorEmailComSenha(email);
  const ok = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

  if (!ok) throw new ErroAplicacao('CREDENCIAIS_INVALIDAS');

  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

export async function buscarUsuarioAutenticado(usuarioId) {
  return usuariosRepo.buscarPorId(usuarioId);
}
