<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { Power, Pencil, ClipboardList, History, Copy, ArrowRight } from 'lucide-vue-next';

import { produtosApi } from '@/api/produtos.js';
import { ErroApi } from '@/api/cliente.js';
import EstruturaApp from '@/componentes/EstruturaApp.vue';
import Botao from '@/componentes/base/Botao.vue';
import Badge from '@/componentes/base/Badge.vue';
import Modal from '@/componentes/base/Modal.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Erro from '@/componentes/estado/Erro.vue';
import Vazio from '@/componentes/estado/Vazio.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const { data: produto, isLoading, isError, refetch } = useQuery({
  queryKey: ['produto', props.id],
  queryFn: () => produtosApi.buscarPorId(props.id),
});

const { data: historicoResposta } = useQuery({
  queryKey: ['produto', props.id, 'precos'],
  queryFn: () => produtosApi.buscarHistorico(props.id),
  enabled: computed(() => Boolean(produto.value)),
});
// Card compacto foca no preço de venda (o que o gestor acompanha); histórico de custo fica no detalhe completo.
const historico = computed(() => {
  const todos = historicoResposta.value?.historico ?? [];
  const vendas = todos.filter((item) => item.tipo_preco === 'venda');
  return vendas.length > 0 ? vendas : todos;
});

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarDataHora(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

function copiarSku() {
  navigator.clipboard?.writeText(produto.value.sku).catch(() => {});
}

const confirmandoAlternancia = ref(false);
const alternando = ref(false);
const erroAcao = ref('');

async function confirmarAlternancia() {
  alternando.value = true;
  erroAcao.value = '';
  try {
    if (produto.value.situacao === 'ativo') await produtosApi.inativar(props.id);
    else await produtosApi.reativar(props.id);
    confirmandoAlternancia.value = false;
    await queryClient.invalidateQueries({ queryKey: ['produto', props.id] });
    await queryClient.invalidateQueries({ queryKey: ['produtos'] });
  } catch (erro) {
    erroAcao.value = erro instanceof ErroApi ? erro.message : 'Não foi possível concluir a operação.';
  } finally {
    alternando.value = false;
  }
}

const trilha = computed(() => [
  { texto: 'Início', para: '/produtos' },
  { texto: 'Produtos', para: '/produtos' },
  { texto: produto.value?.nome ?? '...' },
]);
</script>

<template>
  <EstruturaApp :trilha="trilha">
    <template v-if="produto" #acoes-topo>
      <Botao variante="secundario" @click="confirmandoAlternancia = true">
        <template #icone><Power :size="16" /></template>
        {{ produto.situacao === 'ativo' ? 'Inativar' : 'Reativar' }}
      </Botao>
      <Botao @click="router.push(`/produtos/${id}/editar`)">
        <template #icone><Pencil :size="16" /></template>
        Editar
      </Botao>
    </template>

    <Carregando v-if="isLoading" />
    <Erro v-else-if="isError" mensagem="Não foi possível carregar o produto." @repetir="refetch" />

    <template v-else>
      <p v-if="route.query.criado" class="pagina__sucesso" role="status">
        Produto <strong>#{{ produto.id }}</strong> cadastrado com sucesso.
      </p>

      <div class="pagina__cabecalho">
        <h1 class="pagina__titulo">{{ produto.nome }}</h1>
        <Badge :situacao="produto.situacao" />
      </div>
      <p class="pagina__descricao">Visualização consolidada de dados cadastrais, precificação e histórico de alterações.</p>

      <div class="detalhe-grade">
        <section class="cartao">
          <header class="cartao__cabecalho">
            <h2 class="cartao__titulo"><ClipboardList :size="17" /> Dados do produto</h2>
            <span class="cartao__id">ID Cadastral: #{{ String(produto.id).padStart(6, '0') }}</span>
          </header>

          <div class="dados-grade">
            <div>
              <p class="dado__rotulo">SKU</p>
              <p class="dado__valor dado__valor--mono">
                {{ produto.sku }}
                <button class="botao-copiar" type="button" aria-label="Copiar SKU" @click="copiarSku"><Copy :size="14" /></button>
              </p>
            </div>
            <div>
              <p class="dado__rotulo">EAN-13</p>
              <p class="dado__valor dado__valor--mono">{{ produto.ean13 ?? '—' }}</p>
            </div>
            <div>
              <p class="dado__rotulo">Categoria</p>
              <p class="dado__valor">
                <template v-if="produto.categoria.categoria_pai">{{ produto.categoria.categoria_pai.nome }} <ArrowRight :size="12" style="display:inline" /> {{ produto.categoria.nome }}</template>
                <template v-else>{{ produto.categoria.nome }}</template>
              </p>
            </div>
            <div>
              <p class="dado__rotulo">Unidade de medida</p>
              <p class="dado__valor">{{ produto.unidade_medida.nome }} ({{ produto.unidade_medida.sigla }})</p>
            </div>
          </div>

          <div class="precos-grade">
            <div class="preco-caixa">
              <p class="dado__rotulo">Preço de custo</p>
              <p class="preco-caixa__valor">{{ formatarMoeda(produto.preco_custo) }}</p>
            </div>
            <div class="preco-caixa preco-caixa--destaque">
              <p class="dado__rotulo">Preço de venda</p>
              <p class="preco-caixa__valor preco-caixa__valor--destaque">{{ formatarMoeda(produto.preco_venda) }}</p>
            </div>
          </div>

          <div>
            <p class="dado__rotulo">Estoque</p>
            <p class="dado__valor">{{ Number(produto.estoque).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }} {{ produto.unidade_medida.sigla }}</p>
            <p class="dado__ajuda">Quantidade informada no cadastro; não há integração ou movimentação de estoque.</p>
          </div>

          <div class="dados-grade">
            <div>
              <p class="dado__rotulo">Criado em</p>
              <p class="dado__valor">{{ formatarDataHora(produto.criado_em) }}</p>
            </div>
            <div>
              <p class="dado__rotulo">Atualizado em</p>
              <p class="dado__valor">{{ formatarDataHora(produto.atualizado_em) }}</p>
            </div>
          </div>
        </section>

        <section class="cartao">
          <header class="cartao__cabecalho">
            <h2 class="cartao__titulo"><History :size="17" /> Histórico de preço</h2>
            <span class="cartao__id">{{ historico.length }} registro(s)</span>
          </header>

          <Vazio v-if="historico.length === 0" titulo="Sem alterações registradas" descricao="O histórico aparece assim que o preço for alterado." />

          <ol v-else class="linha-tempo">
            <li v-for="(item, indice) in historico.slice(0, 4)" :key="item.id" class="linha-tempo__item">
              <span class="linha-tempo__ponto" :class="{ 'linha-tempo__ponto--atual': indice === 0 }" />
              <div class="linha-tempo__conteudo">
                <div class="linha-tempo__cabecalho">
                  <p class="linha-tempo__titulo">{{ item.valor_anterior === null ? 'Cadastro inicial' : `Preço de ${item.tipo_preco}` }}</p>
                  <span class="linha-tempo__data">{{ formatarDataHora(item.vigencia_inicio) }}</span>
                </div>
                <p v-if="item.valor_anterior !== null" class="linha-tempo__valores">
                  <span class="linha-tempo__valor-antigo">{{ formatarMoeda(item.valor_anterior) }}</span>
                  →
                  <strong>{{ formatarMoeda(item.valor_novo) }}</strong>
                </p>
                <p v-else class="linha-tempo__valores">Preço fixado em <strong>{{ formatarMoeda(item.valor_novo) }}</strong></p>
                <p class="linha-tempo__usuario">Usuário: {{ item.usuario?.nome ?? '—' }}</p>
              </div>
            </li>
          </ol>

          <RouterLink v-if="historico.length > 0" :to="`/produtos/${id}/precos`" class="link-historico">
            Ver histórico completo <ArrowRight :size="14" />
          </RouterLink>
        </section>
      </div>
    </template>

    <Modal v-if="confirmandoAlternancia && produto" :titulo="produto.situacao === 'ativo' ? 'Inativar produto' : 'Reativar produto'" @fechar="confirmandoAlternancia = false">
      <p>Tem certeza que deseja {{ produto.situacao === 'ativo' ? 'inativar' : 'reativar' }} <strong>{{ produto.nome }}</strong>?</p>
      <p v-if="erroAcao" class="modal-erro" role="alert">{{ erroAcao }}</p>
      <template #rodape>
        <Botao variante="secundario" @click="confirmandoAlternancia = false">Cancelar</Botao>
        <Botao :variante="produto.situacao === 'ativo' ? 'perigo' : 'primario'" :carregando="alternando" @click="confirmarAlternancia">
          {{ produto.situacao === 'ativo' ? 'Inativar' : 'Reativar' }}
        </Botao>
      </template>
    </Modal>
  </EstruturaApp>
</template>

<style scoped>
.pagina__sucesso {
  background: var(--cor-sucesso-bg);
  color: var(--cor-sucesso-texto);
  padding: 10px 14px;
  border-radius: var(--raio-md);
  font-size: 13.5px;
  margin-bottom: var(--espaco-4);
}

.pagina__cabecalho {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  margin-bottom: 6px;
}

.pagina__titulo {
  font-size: 24px;
  font-weight: 700;
}

.pagina__descricao {
  color: var(--cor-texto-secundario);
  font-size: 14px;
  margin-bottom: var(--espaco-5);
}

.detalhe-grade {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--espaco-5);
  align-items: start;
}

.cartao {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-card);
  padding: var(--espaco-6);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-5);
}

.cartao__cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-3);
  padding-bottom: var(--espaco-4);
  border-bottom: 1px solid var(--cor-borda);
}

.cartao__titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
}

.cartao__id {
  font-family: var(--fonte-mono);
  font-size: 11.5px;
  color: var(--cor-texto-terciario);
}

.dados-grade {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-4);
}

.dado__rotulo {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--cor-texto-terciario);
  font-weight: 700;
  margin-bottom: 4px;
}

.dado__valor {
  font-size: 14.5px;
  font-weight: 600;
}

.dado__ajuda {
  font-size: 12px;
  color: var(--cor-texto-terciario);
  font-weight: 400;
  margin-top: 3px;
}

.dado__valor--mono {
  font-family: var(--fonte-mono);
  display: flex;
  align-items: center;
  gap: 6px;
}

.botao-copiar {
  background: none;
  border: none;
  color: var(--cor-texto-terciario);
  cursor: pointer;
  padding: 2px;
}
.botao-copiar:hover {
  color: var(--cor-texto-principal);
}

.precos-grade {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-4);
}

.preco-caixa {
  background: var(--cor-fundo-pagina);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  padding: var(--espaco-4);
}

.preco-caixa--destaque {
  background: var(--cor-info-bg);
  border-color: #c7d7fb;
}

.preco-caixa__valor {
  font-size: 18px;
  font-weight: 700;
}

.preco-caixa__valor--destaque {
  color: var(--cor-primaria);
}

.linha-tempo {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-4);
}

.linha-tempo__item {
  display: flex;
  gap: var(--espaco-3);
}

.linha-tempo__ponto {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--cor-borda-forte);
  margin-top: 5px;
  flex-shrink: 0;
}
.linha-tempo__ponto--atual {
  background: var(--cor-primaria);
}

.linha-tempo__cabecalho {
  display: flex;
  justify-content: space-between;
  gap: var(--espaco-2);
}

.linha-tempo__titulo {
  font-weight: 600;
  font-size: 13.5px;
}

.linha-tempo__data {
  font-size: 11.5px;
  color: var(--cor-texto-terciario);
  white-space: nowrap;
}

.linha-tempo__valores {
  font-size: 13.5px;
  margin-top: 2px;
}

.linha-tempo__valor-antigo {
  text-decoration: line-through;
  color: var(--cor-texto-terciario);
}

.linha-tempo__usuario {
  font-size: 12px;
  color: var(--cor-texto-secundario);
  margin-top: 2px;
}

.link-historico {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13.5px;
  padding-top: var(--espaco-3);
  border-top: 1px solid var(--cor-borda);
}

.modal-erro {
  color: var(--cor-erro-texto);
  margin-top: var(--espaco-2);
}

@media (max-width: 1024px) {
  .detalhe-grade {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .cartao {
    padding: var(--espaco-4);
  }
  .dados-grade,
  .precos-grade {
    grid-template-columns: 1fr;
  }
}
</style>
