import { defineStore } from 'pinia';

const CHAVE_LOCALSTORAGE = 'sige.sessao';

function carregarSessaoSalva() {
  try {
    const bruto = localStorage.getItem(CHAVE_LOCALSTORAGE);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// RF32 — sessão simples identificada pelo cliente (x-usuario-id). Ver P-18: não é controle de acesso real.
export const useSessaoStore = defineStore('sessao', {
  state: () => ({
    usuario: carregarSessaoSalva(),
  }),
  getters: {
    estaAutenticado: (state) => Boolean(state.usuario?.id),
  },
  actions: {
    definirUsuario(usuario) {
      this.usuario = usuario;
      localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(usuario));
    },
    encerrarSessao() {
      this.usuario = null;
      localStorage.removeItem(CHAVE_LOCALSTORAGE);
    },
  },
});
