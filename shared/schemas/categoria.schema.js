import { z } from 'zod';

export const categoriaCriacaoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da categoria').max(60),
  // Selects HTML representam "nenhuma opção" como string vazia; sem o preprocess,
  // z.coerce.number() converte '' em 0, que falha em .positive() de forma silenciosa no front.
  categoria_pai_id: z.preprocess(
    (valor) => (valor === '' || valor === undefined ? null : valor),
    z.coerce.number().int().positive().nullable()
  ),
}).strict();

export const categoriaAtualizacaoSchema = categoriaCriacaoSchema.partial().strict()
  .refine((o) => Object.keys(o).length > 0, 'Informe ao menos um campo para alterar');
