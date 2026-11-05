<script setup>
defineProps({
  mensagem: { type: String, default: 'Não foi possível carregar as informações. Tente novamente.' },
});
defineEmits(['repetir']);
</script>

<template>
  <div class="erro" role="alert" aria-live="polite">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="erro__icone">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
      <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
    <p class="erro__mensagem">{{ mensagem }}</p>
    <button class="erro__acao" type="button" @click="$emit('repetir')">Tentar novamente</button>
  </div>
</template>

<style scoped>
.erro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--espaco-2);
  padding: var(--espaco-10) var(--espaco-4);
  color: var(--cor-erro-texto);
}

.erro__icone {
  margin-bottom: var(--espaco-1);
}

.erro__mensagem {
  font-size: 14px;
  color: var(--cor-texto-principal);
  max-width: 360px;
}

.erro__acao {
  margin-top: var(--espaco-2);
  background: var(--cor-erro-bg);
  border: 1px solid var(--cor-erro-borda);
  color: var(--cor-erro-texto);
  font-weight: 600;
  cursor: pointer;
  font-size: 13.5px;
  padding: 8px 16px;
  border-radius: var(--raio-md);
}
</style>
