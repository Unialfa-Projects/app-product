<script setup>
defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, required: true },
  obrigatorio: { type: Boolean, default: false },
  erro: { type: String, default: '' },
  ajuda: { type: String, default: '' },
  tipo: { type: String, default: 'text' },
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  desabilitado: { type: Boolean, default: false },
  multilinha: { type: Boolean, default: false },
  prefixo: { type: String, default: '' },
});
defineEmits(['update:modelValue', 'blur']);
</script>

<template>
  <div class="campo">
    <label :for="id" class="campo__rotulo">
      {{ rotulo }}
      <span v-if="obrigatorio" class="campo__obrigatorio" aria-hidden="true">*</span>
    </label>

    <div class="campo__wrapper" :class="{ 'campo__wrapper--erro': erro, 'campo__wrapper--prefixo': prefixo }">
      <span v-if="prefixo" class="campo__prefixo">{{ prefixo }}</span>
      <textarea
        v-if="multilinha"
        :id="id"
        class="campo__input campo__input--textarea"
        :placeholder="placeholder"
        :disabled="desabilitado"
        :value="modelValue"
        :aria-invalid="Boolean(erro)"
        :aria-describedby="erro ? `${id}-erro` : (ajuda ? `${id}-ajuda` : undefined)"
        rows="3"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      />
      <input
        v-else
        :id="id"
        class="campo__input"
        :type="tipo"
        :placeholder="placeholder"
        :disabled="desabilitado"
        :value="modelValue"
        :aria-invalid="Boolean(erro)"
        :aria-describedby="erro ? `${id}-erro` : (ajuda ? `${id}-ajuda` : undefined)"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      />
      <svg v-if="erro" class="campo__icone-erro" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    </div>

    <p v-if="erro" :id="`${id}-erro`" class="campo__mensagem campo__mensagem--erro" aria-live="polite">{{ erro }}</p>
    <p v-else-if="ajuda" :id="`${id}-ajuda`" class="campo__mensagem">{{ ajuda }}</p>
  </div>
</template>

<style scoped>
.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo__rotulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--cor-texto-principal);
}

.campo__obrigatorio {
  color: var(--cor-erro-texto);
}

.campo__wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-md);
  background: var(--cor-superficie);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.campo__wrapper:focus-within {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}

.campo__wrapper--erro {
  border-color: var(--cor-erro-texto);
}
.campo__wrapper--erro:focus-within {
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.12);
}

.campo__prefixo {
  padding-left: 12px;
  color: var(--cor-texto-secundario);
  font-size: 14px;
}

.campo__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--cor-texto-principal);
}

.campo__input--textarea {
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
}

.campo__wrapper--prefixo .campo__input {
  padding-left: 4px;
}

.campo__input::placeholder {
  color: var(--cor-texto-terciario);
}

.campo__icone-erro {
  margin-right: 12px;
  color: var(--cor-erro-texto);
  flex-shrink: 0;
}

.campo__mensagem {
  font-size: 12.5px;
  color: var(--cor-texto-secundario);
}

.campo__mensagem--erro {
  color: var(--cor-erro-texto);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
