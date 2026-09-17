-- 006_indices.sql (RNF01, RF05)
CREATE INDEX IF NOT EXISTS ix_produto_categoria  ON produto (categoria_id);
CREATE INDEX IF NOT EXISTS ix_produto_ativo      ON produto (ativo);
CREATE INDEX IF NOT EXISTS ix_produto_nome_lower ON produto (LOWER(nome));
CREATE INDEX IF NOT EXISTS ix_historico_produto  ON produto_preco_historico (produto_id, vigencia_inicio DESC);
