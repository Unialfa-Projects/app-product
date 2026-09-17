-- 003_unidade_medida.sql (RF19, RF20)
CREATE TABLE IF NOT EXISTS unidade_medida (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(60)  NOT NULL,
  sigla           VARCHAR(10)  NOT NULL,
  descricao       VARCHAR(200) NULL,
  casas_decimais  SMALLINT     NOT NULL DEFAULT 0,
  ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_unidade_medida_sigla UNIQUE (sigla),
  CONSTRAINT ck_unidade_casas        CHECK (casas_decimais BETWEEN 0 AND 4)
);
