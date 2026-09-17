<script setup>
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { History } from 'lucide-vue-next';

import { produtosApi } from '@/api/produtos.js';
import EstruturaApp from '@/componentes/EstruturaApp.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Erro from '@/componentes/estado/Erro.vue';
import Vazio from '@/componentes/estado/Vazio.vue';

const props = defineProps({ id: { type: String, required: true } });

const { data: produto } = useQuery({
  queryKey: ['produto', props.id],
  queryFn: () => produtosApi.buscarPorId(props.id),
});

const { data: resposta, isLoading, isError, refetch } = useQuery({
  queryKey: ['produto', props.id, 'precos'],
  queryFn: () => produtosApi.buscarHistorico(props.id),
});
const historico = computed(() => resposta.value?.historico ?? []);

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarDataHora(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

const trilha = computed(() => [
  { texto: 'Início', para: '/produtos' },
  { texto: 'Produtos', para: '/produtos' },
  { texto: produto.value?.nome ?? '...', para: `/produtos/${props.id}` },
  { texto: 'Histórico de preço' },
]);
</script>

<template>
  <EstruturaApp :trilha="trilha">
    <h1 class="pagina__titulo"><History :size="22" /> Histórico de preço</h1>
    <p class="pagina__descricao">{{ produto ? produto.nome : 'Carregando...' }} — ordem cronológica decrescente.</p>

    <section class="cartao">
      <Carregando v-if="isLoading" />
      <Erro v-else-if="isError" mensagem="Não foi possível carregar o histórico." @repetir="refetch" />
      <Vazio v-else-if="historico.length === 0" titulo="Sem alterações registradas" descricao="O histórico aparece assim que o preço deste produto for alterado." />

      <table v-else class="tabela-historico">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Valor anterior</th>
            <th>Valor novo</th>
            <th>Vigência</th>
            <th>Motivo</th>
            <th>Usuário</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in historico" :key="item.id">
            <td class="capitalizar">{{ item.tipo_preco }}</td>
            <td>{{ item.valor_anterior !== null ? formatarMoeda(item.valor_anterior) : '—' }}</td>
            <td class="tabela-historico__novo">{{ formatarMoeda(item.valor_novo) }}</td>
            <td>{{ formatarDataHora(item.vigencia_inicio) }}</td>
            <td>{{ item.motivo ?? '—' }}</td>
            <td>{{ item.usuario?.nome ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </EstruturaApp>
</template>

<style scoped>
.pagina__titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}
.pagina__descricao {
  color: var(--cor-texto-secundario);
  font-size: 14px;
  margin-bottom: var(--espaco-5);
}

.cartao {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-card);
  overflow-x: auto;
}

.tabela-historico {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.tabela-historico thead th {
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--cor-texto-terciario);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: var(--espaco-4);
  border-bottom: 1px solid var(--cor-borda);
}

.tabela-historico tbody td {
  padding: var(--espaco-4);
  border-bottom: 1px solid var(--cor-borda);
  font-size: 13.5px;
}
.tabela-historico tbody tr:last-child td {
  border-bottom: none;
}

.capitalizar {
  text-transform: capitalize;
}

.tabela-historico__novo {
  font-weight: 700;
}
</style>
