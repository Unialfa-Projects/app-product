import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import * as categoriasRepo from '../repositorios/categorias.repo.js';

export async function listar({ formato, situacao }) {
  const categorias = await categoriasRepo.listar({ situacao });

  if (formato === 'arvore') {
    return montarArvore(categorias); // RF33 (proposta)
  }
  return categorias;
}

function montarArvore(categorias) {
  const porId = new Map(categorias.map((c) => [c.id, { ...c, subcategorias: [] }]));
  const raizes = [];

  for (const categoria of porId.values()) {
    if (categoria.categoria_pai_id) {
      const pai = porId.get(categoria.categoria_pai_id);
      if (pai) pai.subcategorias.push(categoria);
      else raizes.push(categoria);
    } else {
      raizes.push(categoria);
    }
  }
  return raizes;
}

export async function buscarPorId(id) {
  const categoria = await categoriasRepo.buscarPorId(id);
  if (!categoria) throw new ErroAplicacao('CATEGORIA_NAO_ENCONTRADA');
  return categoria;
}

// RF15
export async function cadastrar({ nome, categoria_pai_id }) {
  const existente = await categoriasRepo.buscarPorNome(nome);
  if (existente) throw new ErroAplicacao('NOME_CATEGORIA_DUPLICADO');

  if (categoria_pai_id) await buscarPorId(categoria_pai_id); // 404 se pai não existir

  return categoriasRepo.inserir({ nome, categoria_pai_id });
}

// RF16
export async function atualizar(id, campos) {
  await buscarPorId(id);

  if (campos.nome) {
    const existente = await categoriasRepo.buscarPorNome(campos.nome);
    if (existente && existente.id !== id) throw new ErroAplicacao('NOME_CATEGORIA_DUPLICADO');
  }
  if (campos.categoria_pai_id) await buscarPorId(campos.categoria_pai_id);

  return categoriasRepo.atualizar(id, campos);
}

// RF18 / RN07 — não inativa com produto ativo vinculado
export async function inativar(id) {
  await buscarPorId(id);

  const totalAtivos = await categoriasRepo.contarProdutosAtivosVinculados(id);
  if (totalAtivos > 0) {
    throw new ErroAplicacao(
      'CATEGORIA_COM_PRODUTO_ATIVO',
      [],
      `Categoria possui ${totalAtivos} produto(s) ativo(s) vinculado(s)`
    );
  }

  return categoriasRepo.atualizar(id, { ativo: false });
}

export async function reativar(id) {
  await buscarPorId(id);
  return categoriasRepo.atualizar(id, { ativo: true });
}
