// Este é o ÚNICO lugar do projeto que deveria ler "process.env" diretamente.
// Todo o resto do código pede as configurações para este arquivo (import { env }).
// Assim, nenhuma senha, chave ou endereço de banco fica escrito direto no código-fonte:
// tudo vem do arquivo ".env" (que nunca é enviado ao Git; veja ".env.example").
import 'dotenv/config';

// Cada propriedade usa "get" para ler o process.env na hora em que é usada,
// e não apenas uma vez quando o servidor liga. Isso é importante para os
// testes automatizados, que trocam variáveis de ambiente antes de cada caso.
export const env = {
  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  },
  get port() {
    return Number(process.env.PORT || 3000);
  },
  // Lista de origens (sites) que podem chamar esta API pelo navegador.
  get corsOrigin() {
    return process.env.CORS_ORIGIN?.split(',') ?? false;
  },
  // Chaves de API usadas em auth.js para liberar rotas de escrita.
  get gestorApiKey() {
    return process.env.GESTOR_API_KEY;
  },
  get operadorApiKey() {
    return process.env.OPERADOR_API_KEY;
  },
  // Tudo que o banco de dados precisa para conectar. Fica separado em um
  // objeto próprio porque só a camada de banco de dados (src/database) usa isso.
  database: {
    // Se DATABASE_URL existir, ela tem prioridade sobre os campos individuais.
    get url() {
      return process.env.DATABASE_URL;
    },
    get host() {
      return process.env.PGHOST;
    },
    get porta() {
      return Number(process.env.PGPORT || 5432);
    },
    get nome() {
      return process.env.PGDATABASE;
    },
    get usuario() {
      return process.env.PGUSER;
    },
    get senha() {
      return process.env.PGPASSWORD;
    },
  },
};
