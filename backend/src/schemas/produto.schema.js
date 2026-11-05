// Zod valida o JSON antes que os dados cheguem às consultas SQL.
import { z } from 'zod';

// numeric(10,2): até oito dígitos inteiros e duas casas decimais; preço maior que zero.
const preco = z.number().positive().max(99999999.99).multipleOf(0.01);
// numeric(10,3): até sete dígitos inteiros e três casas decimais; estoque nunca negativo.
const estoque = z.number().nonnegative().max(9999999.999).multipleOf(0.001);
// IDs usados nas relações do banco devem ser números inteiros positivos.
const id = z.number().int().positive();

// Define exatamente quais campos um POST /api/produtos aceita.
export const criarProdutoSchema = z.object({
  // SKU é obrigatório, sem espaços nas pontas, e cabe em varchar(15).
  sku: z.string().trim().min(1).max(15),
  // Nome é obrigatório e cabe em varchar(60).
  nome: z.string().trim().min(1).max(60),
  // Descrição pode faltar ou ser null; no banco ela é do tipo text.
  descricao: z.string().trim().nullable().optional(),
  // A categoria informada precisa ter um ID válido; o controller verifica se ela existe.
  categoria_id: id,
  // A unidade segue a mesma regra de ID e é conferida pelo controller.
  unidade_medida_id: id,
  // O preço usa a regra definida acima.
  preco,
  // Quando o cliente omite estoque, o cadastro começa com zero.
  estoque: estoque.default(0),
  // A relação com usuário no histórico é opcional no diagrama UML.
  usuario_id: id.nullable().optional(),
  // Rejeita campos que não estão previstos no contrato de cadastro.
}).strict();

// Em uma alteração, o SKU fica de fora porque identifica o produto permanentemente.
export const atualizarProdutoSchema = criarProdutoSchema.omit({ sku: true })
  // Os campos restantes passam a ser opcionais: o cliente envia só o que quer mudar.
  .partial()
  // Motivo pertence ao histórico de preço, não à tabela produto.
  .extend({ motivo: z.string().trim().max(200).nullable().optional() })
  // Impede alterações com nomes de campos desconhecidos.
  .strict()
  // Um corpo apenas com motivo ou usuario_id não altera nenhum campo do produto.
  .refine((dados) => Object.keys(dados).some((campo) => !['motivo', 'usuario_id'].includes(campo)),
    'Informe ao menos um campo do produto');

// Converte o ID recebido na URL, que chega como texto, para número inteiro positivo.
export const idSchema = z.coerce.number().int().positive();

// Valida os filtros e os controles de paginação de GET /api/produtos.
export const listaProdutosSchema = z.object({
  // A primeira página é usada quando o cliente não informa outra.
  pagina: z.coerce.number().int().positive().default(1),
  // Cada página traz 20 produtos por padrão e nunca mais que 100.
  limite: z.coerce.number().int().min(1).max(100).default(20),
  // Nome e SKU são buscas opcionais por trecho do texto.
  nome: z.string().trim().min(1).max(60).optional(),
  sku: z.string().trim().min(1).max(15).optional(),
  // Estes filtros selecionam uma categoria ou um dos dois estados possíveis.
  categoria_id: idSchema.optional(),
  situacao: z.enum(['ativo', 'inativo']).optional(),
  // Filtros escritos com outro nome são tratados como erro.
}).strict();

// A consulta em lote exige de 1 a 100 IDs no formato { "ids": [1, 2] }.
export const idsSchema = z.object({ ids: z.array(id).min(1).max(100) }).strict();
