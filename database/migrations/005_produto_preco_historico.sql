-- 005_produto_preco_historico.sql (RF13, RF14, RN09, RNF04)
CREATE TABLE IF NOT EXISTS produto_preco_historico (
  id               SERIAL PRIMARY KEY,
  produto_id       INTEGER       NOT NULL,
  tipo_preco       VARCHAR(6)    NOT NULL,      -- 'custo' | 'venda'
  valor_anterior   NUMERIC(10,2) NULL,          -- NULL no registro inicial
  valor_novo       NUMERIC(10,2) NOT NULL,
  vigencia_inicio  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  vigencia_fim     TIMESTAMPTZ   NULL,
  motivo           VARCHAR(200)  NULL,
  usuario_id       INTEGER       NULL,
  criado_em        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_produto_preco_historico_produto FOREIGN KEY (produto_id)
                                                REFERENCES produto (id) ON DELETE RESTRICT,
  CONSTRAINT fk_produto_preco_historico_usuario FOREIGN KEY (usuario_id)
                                                REFERENCES usuario (id) ON DELETE SET NULL,
  CONSTRAINT ck_historico_tipo_preco  CHECK (tipo_preco IN ('custo','venda')),
  CONSTRAINT ck_historico_valor_novo  CHECK (valor_novo >= 0)
);
