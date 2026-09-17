<script setup>
defineProps({
  variante: { type: String, default: 'primario' }, // primario | secundario | perigo | fantasma
  tipo: { type: String, default: 'button' },
  desabilitado: { type: Boolean, default: false },
  carregando: { type: Boolean, default: false },
});
defineEmits(['click']);
</script>

<template>
  <button
    :type="tipo"
    class="botao"
    :class="[`botao--${variante}`, { 'botao--carregando': carregando }]"
    :disabled="desabilitado || carregando"
    @click="$emit('click', $event)"
  >
    <span v-if="carregando" class="botao__spinner" aria-hidden="true" />
    <slot name="icone" />
    <span><slot /></span>
  </button>
</template>

<style scoped>
.botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-2);
  padding: 10px 18px;
  border-radius: var(--raio-md);
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
}

.botao:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.botao--primario {
  background: var(--cor-primaria);
  color: var(--cor-primaria-texto);
}
.botao--primario:hover:not(:disabled) {
  background: var(--cor-primaria-hover);
}

.botao--secundario {
  background: var(--cor-superficie);
  color: var(--cor-texto-principal);
  border-color: var(--cor-borda-forte);
}
.botao--secundario:hover:not(:disabled) {
  background: var(--cor-fundo-pagina);
}

.botao--perigo {
  background: var(--cor-erro-texto);
  color: #fff;
}
.botao--perigo:hover:not(:disabled) {
  opacity: 0.9;
}

.botao--fantasma {
  background: transparent;
  color: var(--cor-texto-secundario);
}
.botao--fantasma:hover:not(:disabled) {
  background: var(--cor-fundo-pagina);
}

.botao__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  animation: girar 0.6s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
</style>
