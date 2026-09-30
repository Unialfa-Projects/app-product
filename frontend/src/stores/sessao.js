import { defineStore } from 'pinia';

// RF32 — sessão simples identificada pelo cliente (x-usuario-id). Ver P-18: não é controle de acesso real.
// Mantida só em memória: nada vai para o localStorage, então recarregar a página exige novo login.
export const useSessaoStore = defineStore('sessao', {
  state: () => ({
    usuario: null,
  }),
  getters: {
    estaAutenticado: (state) => Boolean(state.usuario?.id),
  },
  actions: {
    definirUsuario(usuario) {
      this.usuario = usuario;
    },
    encerrarSessao() {
      this.usuario = null;
    },
  },
});
