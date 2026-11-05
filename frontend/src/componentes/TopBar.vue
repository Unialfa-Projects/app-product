<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  trilha: { type: Array, required: true }, // [{ texto, para? }]
});
</script>

<template>
  <header class="topbar">
    <nav class="topbar__trilha" aria-label="Navegação estrutural (breadcrumb)">
      <template v-for="(item, indice) in trilha" :key="indice">
        <RouterLink v-if="item.para" :to="item.para" class="topbar__trilha-link">{{ item.texto }}</RouterLink>
        <span v-else class="topbar__trilha-atual" :aria-current="indice === trilha.length - 1 ? 'page' : undefined">{{ item.texto }}</span>
        <span v-if="indice < trilha.length - 1" class="topbar__trilha-separador" aria-hidden="true">/</span>
      </template>
    </nav>
    <div class="topbar__acoes">
      <slot name="acoes" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-4);
  padding: var(--espaco-4) var(--espaco-6);
  background: var(--cor-fundo-topo);
  border-bottom: 1px solid var(--cor-borda);
  min-height: var(--altura-topbar);
}

.topbar__trilha {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--cor-texto-secundario);
  min-width: 0;
  flex-wrap: wrap;
}

.topbar__trilha-link {
  color: var(--cor-texto-secundario);
}
.topbar__trilha-link:hover {
  color: var(--cor-texto-link);
}

.topbar__trilha-atual {
  color: var(--cor-texto-principal);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar__acoes {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .topbar {
    padding: var(--espaco-3) var(--espaco-4);
  }
}
</style>
