<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { Plus, Search, RotateCcw, Pencil, Eye, Power } from 'lucide-vue-next';

import { produtosApi } from '@/api/produtos.js';
import { categoriasApi } from '@/api/categorias.js';
import { ErroApi } from '@/api/cliente.js';
import { useFiltrosStore } from '@/stores/filtros.js';

import EstruturaApp from '@/componentes/EstruturaApp.vue';
import Botao from '@/componentes/base/Botao.vue';
import Select from '@/componentes/base/Select.vue';
import Badge from '@/componentes/base/Badge.vue';
import Paginacao from '@/componentes/base/Paginacao.vue';
import Modal from '@/componentes/base/Modal.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Vazio from '@/componentes/estado/Vazio.vue';
import Erro from '@/componentes/estado/Erro.vue';

const router = useRouter();
const filtros = useFiltrosStore();
const queryClient = useQueryClient();

const termoBusca = ref(filtros.nome);
let debounceId;
watch(termoBusca, (valor) => {
  clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    filtros.definirFiltro({ nome: valor, pagina: 1 });
  }, 350);
});

const { data: categorias } = useQuery({
  queryKey: ['categorias', 'ativo'],
  queryFn: () => categoriasApi.listar({ situacao: 'ativo' }),
  staleTime: 60_000,
});

const opcoesCategoria = computed(() => [
  { valor: '', texto: 'Todas' },
  ...(categorias.value ?? []).map((c) => ({
    valor: c.id,
    texto: c.categoria_pai_nome ? `${c.categoria_pai_nome} > ${c.nome}` : c.nome,
  })),
]);

const opcoesSituacao = [
  { valor: 'ativo', texto: 'Ativos' },
  { valor: 'inativo', texto: 'Inativos' },
  { valor: 'todos', texto: 'Todas' },
];

const filtroAtivo = computed(() => ({
  nome: filtros.nome || undefined,
  categoria_id: filtros.categoria_id || undefined,
  situacao: filtros.situacao,
  pagina: filtros.pagina,
  limite: filtros.limite,
}));

const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['produtos', filtroAtivo],
  queryFn: () => produtosApi.listar(filtroAtivo.value),
  placeholderData: (dadosAnteriores) => dadosAnteriores,
});

const produtos = computed(() => data.value?.dados ?? []);
const paginacao = computed(() => data.value?.paginacao ?? { pagina: 1, limite: 20, total: 0, total_paginas: 0 });
const semFiltroAplicado = computed(() => !filtros.nome && !filtros.categoria_id && filtros.situacao === 'ativo');

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarQuantidade(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

function limparFiltros() {
  termoBusca.value = '';
  filtros.limparFiltros();
}

// Confirmação de inativar/reativar (RF10, RF11)
const produtoParaAlternar = ref(null);
const alternandoSituacao = ref(false);
const erroAcao = ref('');

function abrirConfirmacao(produto) {
  erroAcao.value = '';
  produtoParaAlternar.value = produto;
}

async function confirmarAlternancia() {
  if (!produtoParaAlternar.value) return;
  alternandoSituacao.value = true;
  erroAcao.value = '';
  try {
    const produto = produtoParaAlternar.value;
    if (produto.situacao === 'ativo') await produtosApi.inativar(produto.id);
    else await produtosApi.reativar(produto.id);
    produtoParaAlternar.value = null;
    await queryClient.invalidateQueries({ queryKey: ['produtos'] });
  } catch (erro) {
    erroAcao.value = erro instanceof ErroApi ? erro.message : 'Não foi possível concluir a operação.';
  } finally {
    alternandoSituacao.value = false;
  }
}
</script>

<template>
  <EstruturaApp :trilha="[{ texto: 'Início', para: '/produtos' }, { texto: 'Produtos' }]">
    <template #acoes-topo>
      <Botao @click="router.push('/produtos/novo')">
        <template #icone><Plus :size="18" /></template>
        Novo produto
      </Botao>
    </template>

    <h1 class="pagina__titulo">Produtos</h1>
    <p class="pagina__descricao">Visualização, precificação e gerenciamento de status de catálogo geral da operação.</p>

    <section class="cartao filtros">
      <div class="filtros__campo">
        <label class="filtros__rotulo" for="busca-produto">Buscar produto</label>
        <div class="filtros__busca">
          <Search :size="16" class="filtros__busca-icone" aria-hidden="true" />
          <input id="busca-produto" v-model="termoBusca" type="search" placeholder="Buscar por nome ou SKU" />
        </div>
      </div>

      <Select
        id="filtro-categoria"
        rotulo="Categoria"
        :model-value="filtros.categoria_id"
        :opcoes="opcoesCategoria"
        @update:model-value="filtros.definirFiltro({ categoria_id: $event, pagina: 1 })"
      />

      <Select
        id="filtro-situacao"
        rotulo="Situação"
        :model-value="filtros.situacao"
        :opcoes="opcoesSituacao"
        @update:model-value="filtros.definirFiltro({ situacao: $event, pagina: 1 })"
      />

      <button class="filtros__limpar" type="button" :disabled="semFiltroAplicado" @click="limparFiltros">
        <RotateCcw :size="14" /> Limpar filtros
      </button>
    </section>

    <section class="cartao tabela-secao">
      <Carregando v-if="isLoading" />

      <Erro v-else-if="isError" mensagem="Não foi possível carregar os produtos." @repetir="refetch" />

      <Vazio
        v-else-if="produtos.length === 0 && semFiltroAplicado"
        titulo="Nenhum produto cadastrado"
        descricao="Comece cadastrando o primeiro produto do catálogo."
        texto-acao="Cadastrar produto"
        @acao="router.push('/produtos/novo')"
      />

      <Vazio
        v-else-if="produtos.length === 0"
        titulo="Nenhum resultado para o filtro aplicado"
        descricao="Tente ajustar os termos de busca ou limpar os filtros."
        texto-acao="Limpar filtros"
        @acao="limparFiltros"
      />

      <template v-else>
        <div class="tabela-wrapper">
          <table class="tabela">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Unidade</th>
                <th>Quantidade</th>
                <th>Valor</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="produto in produtos" :key="produto.id">
                <td class="tabela__sku">{{ produto.sku }}</td>
                <td class="tabela__produto">
                  <RouterLink :to="`/produtos/${produto.id}`" class="tabela__produto-nome">{{ produto.nome }}</RouterLink>
                  <span class="tabela__produto-sub">{{ produto.categoria.categoria_pai ? produto.categoria.nome : '—' }}</span>
                </td>
                <td>{{ produto.categoria.categoria_pai?.nome ?? produto.categoria.nome }}</td>
                <td>{{ produto.unidade_medida.sigla }}</td>
                <td>{{ formatarQuantidade(produto.estoque) }}</td>
                <td class="tabela__valor">{{ formatarMoeda(produto.preco_venda) }}</td>
                <td><Badge :situacao="produto.situacao" /></td>
                <td>
                  <div class="tabela__acoes">
                    <RouterLink :to="`/produtos/${produto.id}/editar`" class="tabela__acao" aria-label="Editar produto">
                      <Pencil :size="16" />
                    </RouterLink>
                    <RouterLink :to="`/produtos/${produto.id}`" class="tabela__acao" aria-label="Ver produto">
                      <Eye :size="16" />
                    </RouterLink>
                    <button class="tabela__acao" type="button" :aria-label="produto.situacao === 'ativo' ? 'Inativar produto' : 'Reativar produto'" @click="abrirConfirmacao(produto)">
                      <Power :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Paginacao
          :pagina="paginacao.pagina"
          :total-paginas="paginacao.total_paginas"
          :total="paginacao.total"
          :limite="paginacao.limite"
          @mudar-pagina="filtros.definirFiltro({ pagina: $event })"
          @mudar-limite="filtros.definirFiltro({ limite: $event, pagina: 1 })"
        />
      </template>
    </section>

    <Modal
      v-if="produtoParaAlternar"
      :titulo="produtoParaAlternar.situacao === 'ativo' ? 'Inativar produto' : 'Reativar produto'"
      @fechar="produtoParaAlternar = null"
    >
      <p>
        Tem certeza que deseja {{ produtoParaAlternar.situacao === 'ativo' ? 'inativar' : 'reativar' }}
        <strong>{{ produtoParaAlternar.nome }}</strong>?
        <template v-if="produtoParaAlternar.situacao === 'ativo'"> Produtos inativos não aparecem na listagem padrão do catálogo.</template>
      </p>
      <p v-if="erroAcao" class="modal-erro" role="alert">{{ erroAcao }}</p>
      <template #rodape>
        <Botao variante="secundario" @click="produtoParaAlternar = null">Cancelar</Botao>
        <Botao :variante="produtoParaAlternar.situacao === 'ativo' ? 'perigo' : 'primario'" :carregando="alternandoSituacao" @click="confirmarAlternancia">
          {{ produtoParaAlternar.situacao === 'ativo' ? 'Inativar' : 'Reativar' }}
        </Botao>
      </template>
    </Modal>
  </EstruturaApp>
</template>

<style scoped>
.pagina__titulo {
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
}

.filtros {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: var(--espaco-4);
  align-items: end;
  padding: var(--espaco-5);
  margin-bottom: var(--espaco-5);
}

.filtros__campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filtros__rotulo {
  font-size: 13px;
  font-weight: 500;
}

.filtros__busca {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-md);
  padding: 0 12px;
  background: var(--cor-superficie);
}
.filtros__busca:focus-within {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}
.filtros__busca-icone {
  color: var(--cor-texto-terciario);
  flex-shrink: 0;
}
.filtros__busca input {
  border: none;
  outline: none;
  padding: 10px 0;
  width: 100%;
  font-size: 14px;
  background: transparent;
}

.filtros__limpar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--cor-texto-secundario);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  height: 42px;
  white-space: nowrap;
}
.filtros__limpar:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.filtros__limpar:not(:disabled):hover {
  color: var(--cor-texto-principal);
}

.tabela-wrapper {
  overflow-x: auto;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.tabela thead th {
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--cor-texto-terciario);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: var(--espaco-4);
  border-bottom: 1px solid var(--cor-borda);
  white-space: nowrap;
}

.tabela tbody td {
  padding: var(--espaco-4);
  border-bottom: 1px solid var(--cor-borda);
  font-size: 13.5px;
  vertical-align: middle;
}

.tabela tbody tr:last-child td {
  border-bottom: none;
}

.tabela__sku {
  color: var(--cor-texto-secundario);
  font-family: var(--fonte-mono);
  font-size: 12.5px;
  white-space: nowrap;
}

.tabela__produto {
  min-width: 220px;
}

.tabela__produto-nome {
  display: block;
  font-weight: 600;
  color: var(--cor-texto-principal);
}
.tabela__produto-nome:hover {
  color: var(--cor-texto-link);
}

.tabela__produto-sub {
  display: block;
  color: var(--cor-texto-terciario);
  font-size: 12.5px;
  margin-top: 2px;
}

.tabela__valor {
  font-weight: 600;
  white-space: nowrap;
}

.tabela__acoes {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tabela__acao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--raio-sm);
  color: var(--cor-texto-secundario);
  background: transparent;
  border: none;
  cursor: pointer;
}
.tabela__acao:hover {
  background: var(--cor-fundo-pagina);
  color: var(--cor-texto-principal);
}

.modal-erro {
  color: var(--cor-erro-texto);
  margin-top: var(--espaco-2);
}

@media (max-width: 900px) {
  .filtros {
    grid-template-columns: 1fr 1fr;
  }
  .filtros__campo {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .filtros {
    grid-template-columns: 1fr;
    padding: var(--espaco-4);
  }
  .filtros__limpar {
    justify-content: center;
    border: 1px dashed var(--cor-borda-forte);
    border-radius: var(--raio-md);
  }
}
</style>
