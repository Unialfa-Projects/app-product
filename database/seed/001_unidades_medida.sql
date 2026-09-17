-- 001_unidades_medida.sql (RF19, RF20)
INSERT INTO unidade_medida (nome, sigla, descricao, casas_decimais) VALUES
  ('Unidade', 'UN', 'Item vendido individualmente', 0),
  ('Par',     'PC', 'Peça ou par de vestuário/calçado', 0),
  ('Caixa',   'CX', 'Conjunto embalado em caixa', 0),
  ('Quilograma', 'KG', 'Vendido por peso', 3),
  ('Metro',   'MT', 'Vendido por comprimento', 2),
  ('Litro',   'LT', 'Vendido por volume', 2),
  ('Frasco',  'FR', 'Item acondicionado em frasco', 0)
ON CONFLICT (sigla) DO NOTHING;
