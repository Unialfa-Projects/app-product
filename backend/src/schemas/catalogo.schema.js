// Zod confere os campos de categoria e unidade antes de gravar no PostgreSQL.
import { z } from 'zod';

// Corpo usado para criar uma categoria.
export const criarCategoriaSchema = z.object({
  // Nome é obrigatório, sem espaços nas pontas, e cabe em varchar(60).
  nome: z.string().trim().min(1).max(60),
  // Uma categoria pode não ter pai; quando informado, o ID deve ser positivo.
  categoria_pai_id: z.number().int().positive().nullable().optional(),
  // Impede campos que não existem na tabela categoria.
}).strict();

// Na edição, qualquer campo conhecido pode ser enviado isoladamente.
export const atualizarCategoriaSchema = criarCategoriaSchema.partial().strict()
  // Evita uma requisição vazia, que não produziria nenhuma alteração.
  .refine((dados) => Object.keys(dados).length > 0, 'Informe ao menos um campo');

// Corpo usado para criar uma unidade de medida.
export const criarUnidadeSchema = z.object({
  // Nome e sigla têm os mesmos tamanhos definidos no diagrama UML.
  nome: z.string().trim().min(1).max(60),
  sigla: z.string().trim().min(1).max(10),
  // A descrição pode faltar ou ser null.
  descricao: z.string().trim().max(200).nullable().optional(),
  // Por padrão a unidade não tem casas decimais; números negativos são recusados.
  casas_decimais: z.number().int().nonnegative().default(0),
  // Campos extras não são aceitos.
}).strict();
