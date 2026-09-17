<script setup>
defineProps({
  titulo: { type: String, required: true },
});
const emit = defineEmits(['fechar']);
</script>

<template>
  <Teleport to="body">
    <div class="modal-sobreposicao" role="presentation" @click.self="emit('fechar')">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="titulo">
        <header class="modal__cabecalho">
          <h2 class="modal__titulo">{{ titulo }}</h2>
          <button class="modal__fechar" type="button" aria-label="Fechar" @click="emit('fechar')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </header>
        <div class="modal__corpo">
          <slot />
        </div>
        <footer class="modal__rodape">
          <slot name="rodape" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-sobreposicao {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaco-4);
  z-index: 100;
}

.modal {
  background: var(--cor-superficie);
  border-radius: var(--raio-lg);
  width: 100%;
  max-width: 440px;
  box-shadow: var(--sombra-flutuante);
}

.modal__cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--espaco-5) var(--espaco-5) 0;
}

.modal__titulo {
  font-size: 17px;
  font-weight: 700;
}

.modal__fechar {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cor-texto-secundario);
  padding: 4px;
  border-radius: var(--raio-sm);
}
.modal__fechar:hover {
  background: var(--cor-fundo-pagina);
}

.modal__corpo {
  padding: var(--espaco-4) var(--espaco-5);
  color: var(--cor-texto-secundario);
  font-size: 14px;
}

.modal__rodape {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaco-3);
  padding: 0 var(--espaco-5) var(--espaco-5);
}
</style>
