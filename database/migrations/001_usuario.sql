-- 001_usuario.sql (RF29, RF30, RNF13, RN13)
CREATE TABLE IF NOT EXISTS usuario (
  id             SERIAL PRIMARY KEY,
  nome           VARCHAR(60)  NOT NULL,
  email          VARCHAR(100) NOT NULL,
  senha          VARCHAR(60)  NOT NULL,   -- hash bcrypt; jamais texto puro (RNF13) — P-19
  criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_usuario_email  UNIQUE (email),
  CONSTRAINT ck_usuario_email  CHECK (POSITION('@' IN email) > 1)
);
COMMENT ON COLUMN usuario.senha IS 'Hash bcrypt (custo 10). Nunca retornado pela API (RN15).';
