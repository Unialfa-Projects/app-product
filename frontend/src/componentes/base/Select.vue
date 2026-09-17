<script setup>
defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, default: '' },
  obrigatorio: { type: Boolean, default: false },
  erro: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  opcoes: { type: Array, required: true }, // [{ valor, texto }]
  semRotuloVisivel: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="campo-select">
    <label :for="id" class="campo-select__rotulo" :class="{ 'somente-leitor': semRotuloVisivel }">
      {{ rotulo }}
      <span v-if="obrigatorio" aria-hidden="true" class="campo-select__obrigatorio">*</span>
    </label>
    <div class="campo-select__wrapper" :class="{ 'campo-select__wrapper--erro': erro }">
      <select
        :id="id"
        class="campo-select__input"
        :value="modelValue"
        :aria-invalid="Boolean(erro)"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-for="opcao in opcoes" :key="opcao.valor" :value="opcao.valor">{{ opcao.texto }}</option>
      </select>
      <svg class="campo-select__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <p v-if="erro" class="campo-select__mensagem" aria-live="polite">{{ erro }}</p>
  </div>
</template>

<style scoped>
.campo-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo-select__rotulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--cor-texto-principal);
}

.campo-select__obrigatorio {
  color: var(--cor-erro-texto);
}

.campo-select__wrapper {
  position: relative;
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-md);
  background: var(--cor-superficie);
}

.campo-select__wrapper:focus-within {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}

.campo-select__wrapper--erro {
  border-color: var(--cor-erro-texto);
}

.campo-select__input {
  width: 100%;
  appearance: none;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  color: var(--cor-texto-principal);
  cursor: pointer;
}

.campo-select__seta {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cor-texto-secundario);
  pointer-events: none;
}

.campo-select__mensagem {
  font-size: 12.5px;
  color: var(--cor-erro-texto);
}
</style>
