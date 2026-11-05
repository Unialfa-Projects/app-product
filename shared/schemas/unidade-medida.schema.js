import { z } from 'zod';

export const unidadeMedidaCriacaoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da unidade').max(60),
  sigla: z.string().trim().min(1, 'Informe a sigla').max(10),
  descricao: z.string().trim().max(200).optional().nullable(),
  casas_decimais: z.coerce.number().int().min(0).max(4).default(0),
}).strict();

export const unidadeMedidaAtualizacaoSchema = unidadeMedidaCriacaoSchema.partial().strict()
  .refine((o) => Object.keys(o).length > 0, 'Informe ao menos um campo para alterar');
