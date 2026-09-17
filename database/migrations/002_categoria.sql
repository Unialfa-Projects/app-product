-- 002_categoria.sql (RF15-RF18, RF33/RF34 proposta)
CREATE TABLE IF NOT EXISTS categoria (
  id                SERIAL PRIMARY KEY,
  nome              VARCHAR(60)  NOT NULL,
  categoria_pai_id  INTEGER      NULL,
  ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_categoria_nome        UNIQUE (nome),
  CONSTRAINT fk_categoria_categoria   FOREIGN KEY (categoria_pai_id)
                                      REFERENCES categoria (id) ON DELETE RESTRICT,
  CONSTRAINT ck_categoria_sem_autoref CHECK (categoria_pai_id IS NULL OR categoria_pai_id <> id)
);
