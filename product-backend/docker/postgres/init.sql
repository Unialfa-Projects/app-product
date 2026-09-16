-- As cinco tabelas abaixo seguem os nomes e campos do diagrama UML.

CREATE TABLE categoria (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome varchar(60) NOT NULL UNIQUE,
  categoria_pai_id integer REFERENCES categoria(id),
  ativo boolean NOT NULL DEFAULT true,
  CONSTRAINT categoria_pai_diferente CHECK (categoria_pai_id IS NULL OR categoria_pai_id <> id)
);

CREATE TABLE unidade_medida (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome varchar(60) NOT NULL,
  sigla varchar(10) NOT NULL UNIQUE,
  descricao varchar(200),
  casas_decimais integer NOT NULL DEFAULT 0
);

CREATE TABLE produto (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku varchar(15) NOT NULL UNIQUE,
  nome varchar(60) NOT NULL,
  descricao text,
  categoria_id integer NOT NULL REFERENCES categoria(id),
  unidade_medida_id integer NOT NULL REFERENCES unidade_medida(id),
  preco numeric(10,2) NOT NULL CHECK (preco > 0),
  estoque numeric(10,3) NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usuario (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome varchar(60) NOT NULL,
  email varchar(100) NOT NULL,
  senha varchar(50) NOT NULL,
  criado_em date NOT NULL DEFAULT current_date,
  atualizado_em date NOT NULL DEFAULT current_date
);

CREATE TABLE produto_preco_historico (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  produto_id integer NOT NULL REFERENCES produto(id),
  preco numeric(10,2) NOT NULL CHECK (preco > 0),
  vigencia_inicio timestamptz NOT NULL DEFAULT now(),
  vigencia_fim timestamptz,
  motivo varchar(200),
  usuario_id integer REFERENCES usuario(id),
  CONSTRAINT vigencia_valida CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);

CREATE INDEX produto_categoria_idx ON produto(categoria_id);
CREATE INDEX historico_produto_idx ON produto_preco_historico(produto_id, vigencia_inicio DESC);
CREATE UNIQUE INDEX historico_vigente_unico ON produto_preco_historico(produto_id) WHERE vigencia_fim IS NULL;
