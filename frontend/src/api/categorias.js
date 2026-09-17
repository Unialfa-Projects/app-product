import { api } from './cliente.js';

export const categoriasApi = {
  listar: (opcoes) => api.get('/api/categorias', { query: opcoes }),
  cadastrar: (dados) => api.post('/api/categorias', dados),
  atualizar: (id, dados) => api.put(`/api/categorias/${id}`, dados),
  inativar: (id) => api.patch(`/api/categorias/${id}/inativar`),
  reativar: (id) => api.patch(`/api/categorias/${id}/reativar`),
};
