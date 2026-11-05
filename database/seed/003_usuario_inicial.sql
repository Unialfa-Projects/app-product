-- 003_usuario_inicial.sql — usuário de demonstração (RF29)
-- E-mail: demo@sige.com.br | Senha: demo1234 (hash bcrypt custo 10, pré-gerado)
INSERT INTO usuario (nome, email, senha) VALUES
  ('Adriano Operador', 'demo@sige.com.br', '$2b$10$okusriAklk7mW4kfxbCa3O5xETHWba/3xrBbU1wMmYip.GUdPKfLa')
ON CONFLICT (email) DO NOTHING;
