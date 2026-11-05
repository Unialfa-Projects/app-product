<script setup>
defineProps({
  titulo: { type: String, required: true },
  descricao: { type: String, default: '' },
  textoAcao: { type: String, default: '' },
});
defineEmits(['acao']);
</script>

<template>
  <div class="vazio">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="vazio__icone">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
    <p class="vazio__titulo">{{ titulo }}</p>
    <p v-if="descricao" class="vazio__descricao">{{ descricao }}</p>
    <button v-if="textoAcao" class="vazio__acao" type="button" @click="$emit('acao')">{{ textoAcao }}</button>
  </div>
</template>

<style scoped>
.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--espaco-2);
  padding: var(--espaco-10) var(--espaco-4);
  color: var(--cor-texto-secundario);
}

.vazio__icone {
  color: var(--cor-texto-terciario);
  margin-bottom: var(--espaco-2);
}

.vazio__titulo {
  font-size: 15px;
  font-weight: 600;
  color: var(--cor-texto-principal);
}

.vazio__descricao {
  font-size: 13.5px;
  max-width: 360px;
}

.vazio__acao {
  margin-top: var(--espaco-2);
  background: none;
  border: none;
  color: var(--cor-primaria);
  font-weight: 600;
  cursor: pointer;
  font-size: 13.5px;
}
</style>
