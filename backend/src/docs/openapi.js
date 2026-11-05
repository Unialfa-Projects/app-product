import { zodToJsonSchema } from 'zod-to-json-schema';

// Schemas OpenAPI usados só para documentar as rotas no Swagger (/api/docs).
// A validação continua sendo feita pelos schemas Zod de shared/ dentro de cada rota —
// o server.js desliga a validação/serialização do Fastify para não haver duas fontes de regra.

export function deZod(schemaZod) {
  const { $schema, ...jsonSchema } = zodToJsonSchema(schemaZod, { target: 'openApi3', $refStrategy: 'none' });
  return jsonSchema;
}

export const SEGURANCA_USUARIO = [{ usuarioId: [] }];

export const paramId = {
  type: 'object',
  properties: { id: { type: 'integer', minimum: 1, description: 'Identificador do registro' } },
  required: ['id'],
};

const erro = {
  type: 'object',
  properties: {
    erro: { type: 'string' },
    codigo: { type: 'string' },
    detalhes: {
      type: 'array',
      items: { type: 'object', properties: { campo: { type: 'string' }, mensagem: { type: 'string' } } },
    },
  },
};

export const respostasErro = {
  400: { description: 'Requisição malformada', ...erro },
  401: { description: 'Usuário não identificado (header x-usuario-id ausente ou inválido)', ...erro },
  404: { description: 'Registro não encontrado', ...erro },
  409: { description: 'Conflito com regra de negócio', ...erro },
  422: { description: 'Dados inválidos', ...erro },
};

export const usuario = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    nome: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};

export const categoria = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    nome: { type: 'string' },
    categoria_pai_id: { type: 'integer', nullable: true },
    categoria_pai_nome: { type: 'string', nullable: true },
    ativo: { type: 'boolean' },
  },
};

export const unidadeMedida = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    nome: { type: 'string' },
    sigla: { type: 'string' },
    descricao: { type: 'string', nullable: true },
    casas_decimais: { type: 'integer' },
    ativo: { type: 'boolean' },
  },
};

export const produto = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    sku: { type: 'string' },
    nome: { type: 'string' },
    descricao: { type: 'string', nullable: true },
    ean13: { type: 'string', nullable: true },
    categoria: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        nome: { type: 'string' },
        categoria_pai: {
          type: 'object',
          nullable: true,
          properties: { id: { type: 'integer' }, nome: { type: 'string' } },
        },
      },
    },
    unidade_medida: {
      type: 'object',
      properties: { id: { type: 'integer' }, nome: { type: 'string' }, sigla: { type: 'string' } },
    },
    preco_custo: { type: 'number' },
    preco_venda: { type: 'number' },
    estoque: { type: 'number' },
    situacao: { type: 'string', enum: ['ativo', 'inativo'] },
    criado_em: { type: 'string', format: 'date-time' },
    atualizado_em: { type: 'string', format: 'date-time' },
  },
};

export const paginacao = {
  type: 'object',
  properties: {
    pagina: { type: 'integer' },
    limite: { type: 'integer' },
    total: { type: 'integer' },
    total_paginas: { type: 'integer' },
  },
};

export const historicoPreco = {
  type: 'object',
  properties: {
    produto_id: { type: 'integer' },
    historico: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          tipo_preco: { type: 'string' },
          valor_anterior: { type: 'number', nullable: true },
          valor_novo: { type: 'number' },
          vigencia_inicio: { type: 'string', format: 'date-time' },
          motivo: { type: 'string', nullable: true },
          usuario: {
            type: 'object',
            nullable: true,
            properties: { id: { type: 'integer' }, nome: { type: 'string' } },
          },
        },
      },
    },
  },
};

export const situacaoConsulta = {
  type: 'string',
  enum: ['ativo', 'inativo', 'todos'],
  default: 'todos',
};
