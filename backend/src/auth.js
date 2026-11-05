import { ApiError } from './http.js';
import { env } from './config/env.js';

export function exigirPerfil(perfis) {
  return async (request) => {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    let perfil = null;

    if (token && token === env.gestorApiKey) perfil = 'gestor';
    else if (token && token === env.operadorApiKey) perfil = 'operador';

    if (!perfil) throw new ApiError(401, 'NAO_AUTORIZADO', 'Chave de API ausente ou inválida');
    if (!perfis.includes(perfil)) throw new ApiError(403, 'ACESSO_NEGADO', 'Perfil sem permissão');
    request.usuario = perfil;
  };
}
