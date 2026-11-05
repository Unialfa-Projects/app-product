<script setup>
import { computed } from 'vue';

const props = defineProps({
  pagina: { type: Number, required: true },
  totalPaginas: { type: Number, required: true },
  total: { type: Number, required: true },
  limite: { type: Number, required: true },
});
const emit = defineEmits(['mudar-pagina', 'mudar-limite']);

const paginasVisiveis = computed(() => {
  const total = props.totalPaginas;
  const atual = props.pagina;
  const paginas = new Set([1, 2, atual - 1, atual, atual + 1, total - 1, total]);
  return [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
});

function irPara(pagina) {
  if (pagina < 1 || pagina > props.totalPaginas || pagina === props.pagina) return;
  emit('mudar-pagina', pagina);
}
</script>

<template>
  <div class="paginacao">
    <p class="paginacao__resumo">
      Exibindo {{ total === 0 ? 0 : (pagina - 1) * limite + 1 }}–{{ Math.min(pagina * limite, total) }}
      de {{ total.toLocaleString('pt-BR') }} produtos
    </p>

    <nav class="paginacao__controles" aria-label="Paginação de produtos">
      <button class="paginacao__botao" :disabled="pagina <= 1" aria-label="Página anterior" @click="irPara(pagina - 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>

      <template v-for="(p, indice) in paginasVisiveis" :key="p">
        <span v-if="indice > 0 && p - paginasVisiveis[indice - 1] > 1" class="paginacao__reticencias">…</span>
        <button
          class="paginacao__botao paginacao__botao--numero"
          :class="{ 'paginacao__botao--ativo': p === pagina }"
          :aria-current="p === pagina ? 'page' : undefined"
          @click="irPara(p)"
        >{{ p }}</button>
      </template>

      <button class="paginacao__botao" :disabled="pagina >= totalPaginas" aria-label="Próxima página" @click="irPara(pagina + 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </nav>

    <label class="paginacao__itens-por-pagina">
      Itens por página:
      <select :value="limite" @change="$emit('mudar-limite', Number($event.target.value))">
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.paginacao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--espaco-3);
  padding: var(--espaco-4);
  border-top: 1px solid var(--cor-borda);
}

.paginacao__resumo {
  font-size: 13px;
  color: var(--cor-texto-secundario);
}

.paginacao__controles {
  display: flex;
  align-items: center;
  gap: 4px;
}

.paginacao__botao {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-sm);
  background: var(--cor-superficie);
  color: var(--cor-texto-principal);
  cursor: pointer;
  font-size: 13px;
}

.paginacao__botao:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.paginacao__botao--ativo {
  background: var(--cor-primaria);
  border-color: var(--cor-primaria);
  color: #fff;
}

.paginacao__reticencias {
  padding: 0 4px;
  color: var(--cor-texto-terciario);
}

.paginacao__itens-por-pagina {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--cor-texto-secundario);
}

.paginacao__itens-por-pagina select {
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-sm);
  padding: 6px 8px;
  background: var(--cor-superficie);
}

@media (max-width: 640px) {
  .paginacao {
    justify-content: center;
  }
  .paginacao__resumo {
    order: 3;
    width: 100%;
    text-align: center;
  }
}
</style>
