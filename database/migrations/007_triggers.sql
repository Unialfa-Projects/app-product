-- 007_triggers.sql — atualiza atualizado_em automaticamente
CREATE OR REPLACE FUNCTION set_atualizado_em() RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_usuario_atualizado_em ON usuario;
CREATE TRIGGER tg_usuario_atualizado_em BEFORE UPDATE ON usuario
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS tg_categoria_atualizado_em ON categoria;
CREATE TRIGGER tg_categoria_atualizado_em BEFORE UPDATE ON categoria
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS tg_unidade_medida_atualizado_em ON unidade_medida;
CREATE TRIGGER tg_unidade_medida_atualizado_em BEFORE UPDATE ON unidade_medida
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS tg_produto_atualizado_em ON produto;
CREATE TRIGGER tg_produto_atualizado_em BEFORE UPDATE ON produto
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
