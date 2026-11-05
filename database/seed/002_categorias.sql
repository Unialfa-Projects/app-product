-- 002_categorias.sql (RF15-RF18) — árvore de categorias do nicho (e-commerce de variedades)
INSERT INTO categoria (nome) VALUES
  ('Eletrônicos'),
  ('Casa e Decoração'),
  ('Moda e Acessórios'),
  ('Papelaria'),
  ('Beleza e Perfumaria'),
  ('Utilidades'),
  ('Lazer')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO categoria (nome, categoria_pai_id) VALUES
  ('Acessórios Mobile',   (SELECT id FROM categoria WHERE nome = 'Eletrônicos')),
  ('Áudio e Som',         (SELECT id FROM categoria WHERE nome = 'Eletrônicos')),
  ('Cozinha e Casa',      (SELECT id FROM categoria WHERE nome = 'Casa e Decoração')),
  ('Iluminação',          (SELECT id FROM categoria WHERE nome = 'Casa e Decoração')),
  ('Vestuário Básico',    (SELECT id FROM categoria WHERE nome = 'Moda e Acessórios')),
  ('Calçados',            (SELECT id FROM categoria WHERE nome = 'Moda e Acessórios')),
  ('Escolar e Escritório',(SELECT id FROM categoria WHERE nome = 'Papelaria')),
  ('Escrita',             (SELECT id FROM categoria WHERE nome = 'Papelaria')),
  ('Cuidados Diários',    (SELECT id FROM categoria WHERE nome = 'Beleza e Perfumaria')),
  ('Maquiagem',           (SELECT id FROM categoria WHERE nome = 'Beleza e Perfumaria')),
  ('Organização',         (SELECT id FROM categoria WHERE nome = 'Utilidades')),
  ('Jogos e Brinquedos',  (SELECT id FROM categoria WHERE nome = 'Lazer'))
ON CONFLICT (nome) DO NOTHING;
