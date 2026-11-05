import { defineStore } from 'pinia';

// Estado de UI da listagem de produtos (RF05) — não é dado de servidor.
export const useFiltrosStore = defineStore('filtrosProdutos', {
  state: () => ({
    nome: '',
    categoria_id: '',
    situacao: 'ativo',
    pagina: 1,
    limite: 20,
  }),
  actions: {
    definirFiltro(campos) {
      Object.assign(this, campos);
    },
    limparFiltros() {
      this.nome = '';
      this.categoria_id = '';
      this.situacao = 'ativo';
      this.pagina = 1;
    },
  },
});
