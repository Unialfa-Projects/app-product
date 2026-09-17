import { api } from './cliente.js';

export const authApi = {
  cadastrar: (dados) => api.post('/api/auth/cadastro', dados),
  login: (dados) => api.post('/api/auth/login', dados),
  eu: () => api.get('/api/auth/eu', { autenticado: true }),
};
