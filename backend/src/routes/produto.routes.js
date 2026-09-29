// Importa as rotas que cuidam das operações com produtos.
import { produtoController } from '../controllers/produto.controller.js';
// Importa as rotas de categorias e unidades de medida.
import { catalogoController } from '../controllers/catalogo.controller.js';
// Importa as rotas de cadastro e login de usuário.
import { usuarioController } from '../controllers/usuario.controller.js';

// O Fastify chama esta função durante a montagem da aplicação.
export async function produtoRoutes(app) {
  // Registra todos os endpoints definidos no controller de produtos.
  await app.register(produtoController);
  // Registra os endpoints que dão suporte ao cadastro de produtos.
  await app.register(catalogoController);
  // Registra o cadastro e o login de usuário.
  await app.register(usuarioController);
}
