<script setup>
defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, required: true },
  rotulo: { type: String, required: true },
  descricao: { type: String, default: '' },
});
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="interruptor-linha">
    <div>
      <label :for="id" class="interruptor-linha__rotulo">{{ rotulo }}</label>
      <p v-if="descricao" class="interruptor-linha__descricao">{{ descricao }}</p>
    </div>
    <button
      :id="id"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="interruptor"
      :class="{ 'interruptor--ativo': modelValue }"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="interruptor__bolinha" />
    </button>
  </div>
</template>

<style scoped>
.interruptor-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-4);
}

.interruptor-linha__rotulo {
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.interruptor-linha__descricao {
  color: var(--cor-texto-secundario);
  font-size: 13px;
  margin-top: 2px;
}

.interruptor {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: var(--cor-borda-forte);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.interruptor--ativo {
  background: var(--cor-primaria);
}

.interruptor__bolinha {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.interruptor--ativo .interruptor__bolinha {
  transform: translateX(20px);
}
</style>
