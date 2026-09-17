<script setup>
defineProps({
  situacao: { type: String, required: true }, // ativo | inativo
});
</script>

<template>
  <span class="badge" :class="`badge--${situacao}`">
    <span class="badge__ponto" aria-hidden="true" />
    {{ situacao === 'ativo' ? 'Ativo' : 'Inativo' }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}

.badge__ponto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge--ativo {
  background: var(--cor-sucesso-bg);
  color: var(--cor-sucesso-texto);
}
.badge--ativo .badge__ponto {
  background: var(--cor-sucesso-ponto);
}

.badge--inativo {
  background: var(--cor-inativo-bg);
  color: var(--cor-inativo-texto);
}
.badge--inativo .badge__ponto {
  background: var(--cor-inativo-ponto);
}
</style>
