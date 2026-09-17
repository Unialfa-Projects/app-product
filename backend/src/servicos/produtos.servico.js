import { env } from '../config/env.js';
import { executarEmTransacao } from '../config/db.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import * as produtosRepo from '../repositorios/produtos.repo.js';
import * as categoriasRepo from '../repositorios/categorias.repo.js';
import * as unidadesRepo from '../repositorios/unidades.repo.js';
import * as historicoRepo from '../repositorios/historico.repo.js';
import * as precosServico from './precos.servico.js';

export async function listar(filtro) {
  const { dados, total } = await produtosRepo.listar(filtro);
  return { dados, total };
}

export async function buscarPorId(id) {
  const produto = await produtosRepo.buscarPorId(id);
  if (!produto) throw new ErroAplicacao('PRODUTO_NAO_ENCONTRADO');
  return produto;
}

async function validarCategoriaEUnidade(categoriaId, unidadeMedidaId) {
  const categoria = await categoriasRepo.buscarPorId(categoriaId);
  if (!categoria) throw new ErroAplicacao('CATEGORIA_NAO_ENCONTRADA');

  const unidade = await unidadesRepo.buscarPorId(unidadeMedidaId);
  if (!unidade) throw new ErroAplicacao('UNIDADE_NAO_ENCONTRADA');
}

// RF01, RF06-RF09, RF22, RF28, RN01, RN02, RN03, RN04, RN08, RN09, RN11
export async function cadastrar(dados, usuarioId) {
  await validarCategoriaEUnidade(dados.categoria_id, dados.unidade_medida_id);

  const skuExistente = await produtosRepo.buscarPorSku(dados.sku);
  if (skuExistente) throw new ErroAplicacao('SKU_DUPLICADO');

  if (dados.ean13) {
    const ean13Existente = await produtosRepo.buscarPorEan13(dados.ean13);
    if (ean13Existente) throw new ErroAplicacao('EAN13_DUPLICADO');
  }

  const nomeDuplicado = await produtosRepo.buscarPorNomeCategoria(dados.nome, dados.categoria_id);
  if (nomeDuplicado) throw new ErroAplicacao('NOME_DUPLICADO_NA_CATEGORIA');

  return executarEmTransacao(async (client) => {
    const { id } = await produtosRepo.inserir(client, dados);

    await precosServico.registrarHistoricoInicial(client, {
      produtoId: id,
      precoCusto: dados.preco_custo,
      precoVenda: dados.preco_venda,
      usuarioId,
    });

    return produtosRepo.buscarPorId(id, client);
  });
}

// RF02, RF13, RN03 (SKU imutável), RN08, RN09
export async function atualizar(id, campos, usuarioId) {
  const produtoAtual = await buscarPorId(id);

  if ('sku' in campos) throw new ErroAplicacao('SKU_IMUTAVEL');

  if (campos.categoria_id || campos.unidade_medida_id) {
    await validarCategoriaEUnidade(
      campos.categoria_id ?? produtoAtual.categoria.id,
      campos.unidade_medida_id ?? produtoAtual.unidade_medida.id
    );
  }

  if (campos.ean13 && campos.ean13 !== produtoAtual.ean13) {
    const ean13Existente = await produtosRepo.buscarPorEan13(campos.ean13);
    if (ean13Existente) throw new ErroAplicacao('EAN13_DUPLICADO');
  }

  if (campos.nome) {
    const categoriaAlvo = campos.categoria_id ?? produtoAtual.categoria.id;
    const nomeDuplicado = await produtosRepo.buscarPorNomeCategoria(campos.nome, categoriaAlvo, id);
    if (nomeDuplicado) throw new ErroAplicacao('NOME_DUPLICADO_NA_CATEGORIA');
  }

  return executarEmTransacao(async (client) => {
    await precosServico.registrarAlteracoesDePreco(client, {
      produtoAntigo: {
        id: produtoAtual.id,
        preco_custo: produtoAtual.preco_custo,
        preco_venda: produtoAtual.preco_venda,
      },
      camposAtualizados: campos,
      usuarioId,
    });

    return produtosRepo.atualizar(client, id, campos);
  });
}

// RF10
export async function inativar(id) {
  const produto = await buscarPorId(id);
  if (!produto.situacao || produto.situacao === 'inativo') throw new ErroAplicacao('PRODUTO_JA_INATIVO');
  return produtosRepo.alterarSituacao(id, false);
}

// RF11
export async function reativar(id) {
  const produto = await buscarPorId(id);
  if (produto.situacao === 'ativo') throw new ErroAplicacao('PRODUTO_JA_ATIVO');
  return produtosRepo.alterarSituacao(id, true);
}

// RF12, RN05, P-07
export async function excluir(id) {
  await buscarPorId(id);

  const possuiHistorico = await historicoRepo.existeHistoricoParaProduto(id);
  if (possuiHistorico) {
    if (!env.PERMITIR_EXCLUSAO_FISICA) throw new ErroAplicacao('EXCLUSAO_NAO_PERMITIDA');
    throw new ErroAplicacao('PRODUTO_COM_HISTORICO');
  }

  if (!env.PERMITIR_EXCLUSAO_FISICA) throw new ErroAplicacao('EXCLUSAO_NAO_PERMITIDA');

  await produtosRepo.excluirFisicamente(id);
}

// RF14
export async function listarHistoricoDePreco(id) {
  await buscarPorId(id);
  return precosServico.listarHistoricoDoProduto(id);
}
