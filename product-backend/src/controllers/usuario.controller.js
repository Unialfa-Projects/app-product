// Controller = a camada que fala com o mundo HTTP: recebe a requisição, chama
// os Repositories para ler/gravar dados, e devolve a resposta. Não escreve SQL.
//
// Autenticação deste módulo: bem simples, como pedido.
// - Cadastro guarda a senha como veio (sem bcrypt).
// - Login confere email e senha e devolve o usuário (com o id), sem token/JWT.
// - Estas duas rotas são independentes das chaves GESTOR_API_KEY/OPERADOR_API_KEY:
//   elas continuam sendo o que libera cadastrar produto, categoria, etc. Ou seja,
//   nenhuma rota existente passa a exigir usuário logado por causa disto.
import { db } from '../database/index.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { ApiError } from '../http.js';
import { criarUsuarioSchema, loginSchema } from '../schemas/usuario.schema.js';

const usuarioRepository = new UsuarioRepository(db);

export async function usuarioController(app) {
  // Cadastro: nome, email e senha. Email precisa ser único (ver init.sql).
  app.post('/api/usuarios', async (request, reply) => {
    const dados = criarUsuarioSchema.parse(request.body);
    const usuario = await usuarioRepository.criar(dados);
    return reply.code(201).send(usuario);
  });

  // Login: confere email e senha; se baterem, devolve o usuário (com o id).
  app.post('/api/usuarios/login', async (request) => {
    const dados = loginSchema.parse(request.body);
    const usuario = await usuarioRepository.buscarPorEmailESenha(dados.email, dados.senha);
    // Mensagem genérica: não revela se foi o email ou a senha que errou.
    if (!usuario) throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'Email ou senha incorretos');
    return usuario;
  });
}
