<script setup>
defineProps({
  linhas: { type: Number, default: 6 },
});
</script>

<template>
  <div class="skeleton" role="status" aria-live="polite">
    <span class="somente-leitor">Carregando conteúdo…</span>
    <div v-for="linha in linhas" :key="linha" class="skeleton__linha">
      <span class="skeleton__bloco skeleton__bloco--curto" />
      <span class="skeleton__bloco skeleton__bloco--medio" />
      <span class="skeleton__bloco skeleton__bloco--curto" />
      <span class="skeleton__bloco skeleton__bloco--curto" />
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-3);
  padding: var(--espaco-4);
}

.skeleton__linha {
  display: flex;
  gap: var(--espaco-4);
  align-items: center;
}

.skeleton__bloco {
  height: 14px;
  border-radius: var(--raio-sm);
  background: linear-gradient(90deg, #ececf1 25%, #f5f5f8 37%, #ececf1 63%);
  background-size: 400% 100%;
  animation: brilho 1.4s ease infinite;
}

.skeleton__bloco--curto { flex: 1; max-width: 90px; }
.skeleton__bloco--medio { flex: 3; }

@keyframes brilho {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton__bloco { animation: none; }
}
</style>
