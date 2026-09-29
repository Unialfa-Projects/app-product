// Repository = a única camada que sabe escrever SQL para a tabela "categoria".
import { Categoria } from '../models/Categoria.js';

export class CategoriaRepository {
  constructor(banco) {
    this.banco = banco;
  }

  async criar({ nome, categoriaPaiId }, executor = this.banco) {
    const resultado = await executor.query(`INSERT INTO categoria (nome, categoria_pai_id)
      VALUES ($1, $2) RETURNING *`, [nome, categoriaPaiId ?? null]);
    return new Categoria(resultado.rows[0]);
  }

  async listarTodas(executor = this.banco) {
    const resultado = await executor.query('SELECT * FROM categoria ORDER BY nome');
    return resultado.rows.map((linha) => new Categoria(linha));
  }

  // Confere, sem travar a linha, se a categoria existe e está ativa. Usado
  // para validar a categoria pai antes de criar/alterar outra categoria.
  async existeAtiva(id, executor = this.banco) {
    const resultado = await executor.query('SELECT id FROM categoria WHERE id=$1 AND ativo=true', [id]);
    return resultado.rowCount > 0;
  }

  // Mesma checagem acima, mas travando a linha (FOR UPDATE): usada dentro de
  // uma transação, quando um produto está sendo criado ou alterado.
  async bloquearAtivaPorId(id, executor) {
    const resultado = await executor.query('SELECT id FROM categoria WHERE id = $1 AND ativo = true FOR UPDATE', [id]);
    return resultado.rowCount > 0;
  }

  // Verdadeiro se "idPai" está entre os descendentes de "idAtual" — usado
  // para impedir que uma categoria vire pai de um dos seus próprios "netos".
  async ehDescendente(idAtual, idPai, executor = this.banco) {
    const resultado = await executor.query(`WITH RECURSIVE arvore AS (
      SELECT id FROM categoria WHERE id=$1
      UNION ALL
      SELECT c.id FROM categoria c JOIN arvore a ON c.categoria_pai_id=a.id
    ) SELECT id FROM arvore WHERE id=$2`, [idAtual, idPai]);
    return resultado.rowCount > 0;
  }

  async atualizar(id, { nome, categoriaPaiId, categoriaPaiIdInformado }, executor = this.banco) {
    const resultado = await executor.query(`UPDATE categoria SET nome=COALESCE($1, nome),
      categoria_pai_id=CASE WHEN $2::boolean THEN $3 ELSE categoria_pai_id END
      WHERE id=$4 RETURNING *`,
    [nome ?? null, categoriaPaiIdInformado, categoriaPaiId ?? null, id]);
    return resultado.rows[0] ? new Categoria(resultado.rows[0]) : null;
  }

  // Trava a linha da categoria dentro de uma transação de inativação.
  async bloquearPorId(id, executor) {
    const resultado = await executor.query('SELECT id FROM categoria WHERE id=$1 FOR UPDATE', [id]);
    return resultado.rowCount > 0;
  }

  async possuiProdutoAtivo(id, executor) {
    const resultado = await executor.query('SELECT 1 FROM produto WHERE categoria_id=$1 AND ativo=true LIMIT 1', [id]);
    return resultado.rowCount > 0;
  }

  async inativar(id, executor) {
    const resultado = await executor.query('UPDATE categoria SET ativo=false WHERE id=$1 RETURNING *', [id]);
    return resultado.rows[0] ? new Categoria(resultado.rows[0]) : null;
  }
}
