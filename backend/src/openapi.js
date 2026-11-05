// Contrato da API mostrado em /docs. Os limites espelham o diagrama UML.
const campoId = { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } };
const resposta = (descricao) => ({ description: descricao });
const corpo = (nome) => ({ required: true, content: { 'application/json': {
  schema: { $ref: `#/components/schemas/${nome}` },
} } });
const seguranca = [{ bearerAuth: [] }];

export const openapi = {
  openapi: '3.0.3',
  info: { title: 'API de Produtos', version: '1.0.0', description: 'Entidades conforme o diagrama UML do grupo.' },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
    schemas: {
      ProdutoEntrada: {
        type: 'object', required: ['sku', 'nome', 'categoria_id', 'unidade_medida_id', 'preco'],
        additionalProperties: false,
        properties: {
          sku: { type: 'string', maxLength: 15 }, nome: { type: 'string', maxLength: 60 },
          descricao: { type: 'string', nullable: true }, categoria_id: { type: 'integer' },
          unidade_medida_id: { type: 'integer' }, preco: { type: 'number', exclusiveMinimum: 0 },
          estoque: { type: 'number', minimum: 0, default: 0 }, usuario_id: { type: 'integer', nullable: true },
        },
      },
      ProdutoAlteracao: {
        type: 'object', description: 'Todos os campos são opcionais. SKU não pode ser alterado.',
        properties: {
          nome: { type: 'string', maxLength: 60 }, descricao: { type: 'string', nullable: true },
          categoria_id: { type: 'integer' }, unidade_medida_id: { type: 'integer' },
          preco: { type: 'number' }, estoque: { type: 'number' },
          motivo: { type: 'string', maxLength: 200 }, usuario_id: { type: 'integer', nullable: true },
        },
      },
      Produto: {
        type: 'object', required: ['id', 'sku', 'nome', 'preco', 'estoque', 'ativo', 'situacao'],
        properties: {
          id: { type: 'integer' }, sku: { type: 'string' }, nome: { type: 'string' },
          descricao: { type: 'string', nullable: true }, categoria_id: { type: 'integer' },
          unidade_medida_id: { type: 'integer' }, preco: { type: 'number' }, estoque: { type: 'number' },
          ativo: { type: 'boolean' }, situacao: { type: 'string', enum: ['ativo', 'inativo'] },
          criado_em: { type: 'string', format: 'date-time' }, atualizado_em: { type: 'string', format: 'date-time' },
        },
      },
      CategoriaEntrada: { type: 'object', required: ['nome'], properties: {
        nome: { type: 'string', maxLength: 60 }, categoria_pai_id: { type: 'integer', nullable: true },
      } },
      UnidadeEntrada: { type: 'object', required: ['nome', 'sigla'], properties: {
        nome: { type: 'string', maxLength: 60 }, sigla: { type: 'string', maxLength: 10 },
        descricao: { type: 'string', maxLength: 200, nullable: true }, casas_decimais: { type: 'integer', minimum: 0 },
      } },
      HistoricoPreco: { type: 'object', properties: {
        id: { type: 'integer' }, produto_id: { type: 'integer' }, preco: { type: 'number' },
        vigencia_inicio: { type: 'string', format: 'date-time' }, vigencia_fim: { type: 'string', format: 'date-time', nullable: true },
        motivo: { type: 'string', nullable: true }, usuario_id: { type: 'integer', nullable: true },
      } },
      Erro: { type: 'object', properties: { erro: { type: 'string' }, codigo: { type: 'string' }, detalhes: { type: 'array', items: {} } } },
      UsuarioEntrada: { type: 'object', required: ['nome', 'email', 'senha'], properties: {
        nome: { type: 'string', maxLength: 60 }, email: { type: 'string', format: 'email', maxLength: 100 },
        senha: { type: 'string', minLength: 4, maxLength: 50 },
      } },
      LoginEntrada: { type: 'object', required: ['email', 'senha'], properties: {
        email: { type: 'string', format: 'email', maxLength: 100 }, senha: { type: 'string' },
      } },
      Usuario: { type: 'object', properties: {
        id: { type: 'integer' }, nome: { type: 'string' }, email: { type: 'string' },
        criado_em: { type: 'string', format: 'date' }, atualizado_em: { type: 'string', format: 'date' },
      } },
    },
  },
  paths: {
    '/health': { get: { summary: 'Verificar API e banco', responses: { 200: resposta('Disponível'), 500: resposta('Indisponível') } } },
    '/api/produtos': {
      get: { tags: ['Produtos'], summary: 'Listar e filtrar produtos', parameters: [
        { name: 'pagina', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limite', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        { name: 'nome', in: 'query', schema: { type: 'string' } },
        { name: 'sku', in: 'query', schema: { type: 'string' } },
        { name: 'categoria_id', in: 'query', schema: { type: 'integer' } },
        { name: 'situacao', in: 'query', schema: { type: 'string', enum: ['ativo', 'inativo'] } },
      ], responses: { 200: resposta('Página de produtos'), 422: resposta('Filtro inválido') } },
      post: { tags: ['Produtos'], summary: 'Cadastrar produto', security: seguranca, requestBody: corpo('ProdutoEntrada'),
        responses: { 201: resposta('Produto criado'), 409: resposta('SKU duplicado'), 422: resposta('Dados inválidos') } },
    },
    '/api/produtos/lote': { post: { tags: ['Produtos'], summary: 'Consultar até 100 IDs', requestBody: { required: true,
      content: { 'application/json': { schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'integer' } } } } } } },
      responses: { 200: resposta('Produtos encontrados') } } },
    '/api/produtos/{id}': {
      get: { tags: ['Produtos'], summary: 'Consultar produto', parameters: [campoId], responses: { 200: resposta('Produto'), 404: resposta('Não encontrado') } },
      put: { tags: ['Produtos'], summary: 'Alterar produto', parameters: [campoId], security: seguranca,
        requestBody: corpo('ProdutoAlteracao'), responses: { 200: resposta('Produto alterado'), 403: resposta('Preço exige gestor'), 422: resposta('Dados inválidos') } },
      delete: { tags: ['Produtos'], summary: 'Inativar produto', parameters: [campoId], security: seguranca,
        responses: { 200: resposta('Produto inativado') } },
    },
    '/api/produtos/{id}/reativar': { post: { tags: ['Produtos'], summary: 'Reativar produto', parameters: [campoId], security: seguranca,
      responses: { 200: resposta('Produto reativado') } } },
    '/api/produtos/{id}/historico-precos': { get: { tags: ['Produtos'], summary: 'Consultar vigências de preço', parameters: [campoId], security: seguranca,
      responses: { 200: resposta('Histórico do produto') } } },
    '/api/categorias': {
      get: { tags: ['Categorias'], summary: 'Listar categorias', responses: { 200: resposta('Categorias') } },
      post: { tags: ['Categorias'], summary: 'Cadastrar categoria', security: seguranca, requestBody: corpo('CategoriaEntrada'),
        responses: { 201: resposta('Categoria criada') } },
    },
    '/api/categorias/{id}': {
      put: { tags: ['Categorias'], summary: 'Alterar categoria', parameters: [campoId], security: seguranca,
        requestBody: corpo('CategoriaEntrada'), responses: { 200: resposta('Categoria alterada') } },
      delete: { tags: ['Categorias'], summary: 'Inativar categoria', parameters: [campoId], security: seguranca,
        responses: { 200: resposta('Categoria inativada'), 409: resposta('Categoria em uso') } },
    },
    '/api/unidades-medida': {
      get: { tags: ['Unidades'], summary: 'Listar unidades', responses: { 200: resposta('Unidades') } },
      post: { tags: ['Unidades'], summary: 'Cadastrar unidade', security: seguranca, requestBody: corpo('UnidadeEntrada'),
        responses: { 201: resposta('Unidade criada') } },
    },
    '/api/usuarios': {
      post: { tags: ['Usuários'], summary: 'Cadastrar usuário', description: 'Verificação simples: sem hash de senha e sem token de acesso.',
        requestBody: corpo('UsuarioEntrada'), responses: { 201: resposta('Usuário criado'), 409: resposta('Email duplicado'), 422: resposta('Dados inválidos') } },
    },
    '/api/usuarios/login': {
      post: { tags: ['Usuários'], summary: 'Login simples por email e senha', description: 'Devolve o usuário (com o id) se email e senha baterem. Sem token de acesso.',
        requestBody: corpo('LoginEntrada'), responses: { 200: resposta('Usuário autenticado'), 401: resposta('Email ou senha incorretos') } },
    },
  },
};
