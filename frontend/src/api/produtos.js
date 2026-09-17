import { api } from './cliente.js';

export const produtosApi = {
  listar: (filtro) => api.get('/api/produtos', { query: filtro }),
  buscarPorId: (id) => api.get(`/api/produtos/${id}`),
  buscarHistorico: (id) => api.get(`/api/produtos/${id}/precos`),
  cadastrar: (dados) => api.post('/api/produtos', dados),
  atualizar: (id, dados) => api.put(`/api/produtos/${id}`, dados),
  inativar: (id) => api.patch(`/api/produtos/${id}/inativar`),
  reativar: (id) => api.patch(`/api/produtos/${id}/reativar`),
  excluir: (id) => api.delete(`/api/produtos/${id}`),
};
