import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import * as unidadesRepo from '../repositorios/unidades.repo.js';

export async function listar({ situacao }) {
  return unidadesRepo.listar({ situacao });
}

export async function buscarPorId(id) {
  const unidade = await unidadesRepo.buscarPorId(id);
  if (!unidade) throw new ErroAplicacao('UNIDADE_NAO_ENCONTRADA');
  return unidade;
}

// RF19
export async function cadastrar({ nome, sigla, descricao, casas_decimais }) {
  const existente = await unidadesRepo.buscarPorSigla(sigla);
  if (existente) throw new ErroAplicacao('SIGLA_UNIDADE_DUPLICADA');

  return unidadesRepo.inserir({ nome, sigla, descricao, casas_decimais });
}

// Edição — mesmas regras do cadastro (RF19), reaplicadas sobre o registro existente
export async function atualizar(id, campos) {
  await buscarPorId(id);

  if (campos.sigla) {
    const existente = await unidadesRepo.buscarPorSigla(campos.sigla, id);
    if (existente) throw new ErroAplicacao('SIGLA_UNIDADE_DUPLICADA');
  }

  return unidadesRepo.atualizar(id, campos);
}
