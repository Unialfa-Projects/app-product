-- 004_produto.sql (RF01-RF12, RF22, RF25, RF26, RF28)
CREATE TABLE IF NOT EXISTS produto (
  id                 SERIAL PRIMARY KEY,
  sku                VARCHAR(15)   NOT NULL,
  nome               VARCHAR(60)   NOT NULL,
  descricao          TEXT          NULL,
  ean13              CHAR(13)      NULL,                -- P-05
  categoria_id       INTEGER       NOT NULL,
  unidade_medida_id  INTEGER       NOT NULL,
  preco_custo        NUMERIC(10,2) NOT NULL DEFAULT 0,  -- P-04
  preco_venda        NUMERIC(10,2) NOT NULL,            -- P-04
  estoque            NUMERIC(10,3) NOT NULL DEFAULT 0,  -- campo informativo, sem movimentação
  ativo              BOOLEAN       NOT NULL DEFAULT TRUE,
  criado_em          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_produto_sku            UNIQUE (sku),                  -- RN03 / RF09
  CONSTRAINT uk_produto_nome_categoria UNIQUE (categoria_id, nome),   -- RN08 / P-09
  CONSTRAINT fk_produto_categoria      FOREIGN KEY (categoria_id)
                                       REFERENCES categoria (id) ON DELETE RESTRICT,
  CONSTRAINT fk_produto_unidade_medida FOREIGN KEY (unidade_medida_id)
                                       REFERENCES unidade_medida (id) ON DELETE RESTRICT,
  CONSTRAINT ck_produto_preco_venda    CHECK (preco_venda > 0),       -- RN01 / RF08
  CONSTRAINT ck_produto_preco_custo    CHECK (preco_custo >= 0),      -- RN02
  CONSTRAINT ck_produto_estoque        CHECK (estoque >= 0),
  CONSTRAINT ck_produto_ean13_formato  CHECK (ean13 IS NULL OR ean13 ~ '^[0-9]{13}$')
);
-- RN04 / RF28: unicidade apenas quando informado
CREATE UNIQUE INDEX IF NOT EXISTS uk_produto_ean13
  ON produto (ean13) WHERE ean13 IS NOT NULL;
