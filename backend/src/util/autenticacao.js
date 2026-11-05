import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import * as usuariosRepo from '../repositorios/usuarios.repo.js';

// RF32, RNF03, RNF04, P-18 — identificação simples via header, não é controle de acesso real.
export async function exigirUsuarioAutenticado(request) {
  const usuarioId = Number(request.headers['x-usuario-id']);
  if (!usuarioId || Number.isNaN(usuarioId)) throw new ErroAplicacao('NAO_AUTENTICADO');

  const usuario = await usuariosRepo.buscarPorId(usuarioId);
  if (!usuario) throw new ErroAplicacao('NAO_AUTENTICADO');

  request.usuario = usuario;
  return usuario.id;
}
