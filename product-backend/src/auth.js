import { ApiError } from './http.js';

export function exigirPerfil(perfis) {
  return async (request) => {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    let perfil = null;

    if (token && token === process.env.GESTOR_API_KEY) perfil = 'gestor';
    else if (token && token === process.env.OPERADOR_API_KEY) perfil = 'operador';

    if (!perfil) throw new ApiError(401, 'NAO_AUTORIZADO', 'Chave de API ausente ou inválida');
    if (!perfis.includes(perfil)) throw new ApiError(403, 'ACESSO_NEGADO', 'Perfil sem permissão');
    request.usuario = perfil;
  };
}
