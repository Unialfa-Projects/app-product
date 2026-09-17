import { api } from './cliente.js';

export const unidadesApi = {
  listar: (opcoes) => api.get('/api/unidades-medida', { query: opcoes }),
  cadastrar: (dados) => api.post('/api/unidades-medida', dados),
  atualizar: (id, dados) => api.put(`/api/unidades-medida/${id}`, dados),
};
