import { idSchema } from './schemas/produto.schema.js';

export class ApiError extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

export function idDaRota(request) {
  const resultado = idSchema.safeParse(request.params.id);
  if (!resultado.success) throw new ApiError(400, 'ID_INVALIDO', 'Identificador inválido');
  return resultado.data;
}
