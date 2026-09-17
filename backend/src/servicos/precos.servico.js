import * as historicoRepo from '../repositorios/historico.repo.js';

// RN09 — registro inicial na criação do produto, dentro da mesma transação
export async function registrarHistoricoInicial(client, { produtoId, precoCusto, precoVenda, usuarioId }) {
  await historicoRepo.inserir(client, {
    produto_id: produtoId,
    tipo_preco: 'venda',
    valor_anterior: null,
    valor_novo: precoVenda,
    motivo: 'Cadastro inicial',
    usuario_id: usuarioId,
  });

  if (precoCusto !== undefined && precoCusto !== null) {
    await historicoRepo.inserir(client, {
      produto_id: produtoId,
      tipo_preco: 'custo',
      valor_anterior: null,
      valor_novo: precoCusto,
      motivo: 'Cadastro inicial',
      usuario_id: usuarioId,
    });
  }
}

// RF13 / RN09 — preserva o valor anterior sempre que preco_custo ou preco_venda mudam
export async function registrarAlteracoesDePreco(client, { produtoAntigo, camposAtualizados, usuarioId, motivo }) {
  if (
    camposAtualizados.preco_venda !== undefined &&
    Number(camposAtualizados.preco_venda) !== Number(produtoAntigo.preco_venda)
  ) {
    await historicoRepo.inserir(client, {
      produto_id: produtoAntigo.id,
      tipo_preco: 'venda',
      valor_anterior: produtoAntigo.preco_venda,
      valor_novo: camposAtualizados.preco_venda,
      motivo: motivo ?? 'Alteração de preço de venda',
      usuario_id: usuarioId,
    });
  }

  if (
    camposAtualizados.preco_custo !== undefined &&
    Number(camposAtualizados.preco_custo) !== Number(produtoAntigo.preco_custo)
  ) {
    await historicoRepo.inserir(client, {
      produto_id: produtoAntigo.id,
      tipo_preco: 'custo',
      valor_anterior: produtoAntigo.preco_custo,
      valor_novo: camposAtualizados.preco_custo,
      motivo: motivo ?? 'Alteração de preço de custo',
      usuario_id: usuarioId,
    });
  }
}

export async function listarHistoricoDoProduto(produtoId) {
  return historicoRepo.listarPorProduto(produtoId);
}
