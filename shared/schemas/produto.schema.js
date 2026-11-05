import { z } from 'zod';
import { ean13Valido } from '../util/ean13.js';

export const produtoCriacaoSchema = z.object({
  sku: z.string().trim().max(15).regex(/^[A-Z0-9-]+$/, 'Use letras maiúsculas, números e hífen'),
  nome: z.string().trim().min(1, 'Informe o nome do produto').max(60), // RF06
  descricao: z.string().trim().max(2000).optional().nullable(),
  // Campo em branco chega como '' do formulário — sem o preprocess, '' cairia em .length(13)
  // e falharia a validação mesmo sendo opcional (RF22: "deixe em branco se não tiver código").
  ean13: z.preprocess(
    (valor) => (typeof valor === 'string' && valor.trim() === '' ? null : valor),
    z.string().length(13).regex(/^\d{13}$/)
      .refine(ean13Valido, 'Dígito verificador do EAN-13 inválido') // RF22 / RN04
      .nullable().optional()
  ),
  categoria_id: z.coerce.number().int().positive('Selecione a categoria'), // RF07 / RN11
  unidade_medida_id: z.coerce.number().int().positive('Selecione a unidade de medida'),
  preco_custo: z.coerce.number().min(0, 'Preço de custo não pode ser negativo').default(0), // RN02
  preco_venda: z.coerce.number().gt(0, 'Preço de venda deve ser maior que zero'), // RF08 / RN01
  estoque: z.coerce.number().min(0, 'Estoque não pode ser negativo').default(0),
  ativo: z.boolean().default(true),
}).strict();

// RN03: SKU imutável — não aparece no schema de atualização
export const produtoAtualizacaoSchema = produtoCriacaoSchema.omit({ sku: true }).partial().strict()
  .refine((o) => Object.keys(o).length > 0, 'Informe ao menos um campo para alterar');

export const produtoFiltroSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  categoria_id: z.coerce.number().int().positive().optional(),
  situacao: z.enum(['ativo', 'inativo', 'todos']).default('ativo'), // RF05 / RN06
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20), // RNF09
}).strict();
