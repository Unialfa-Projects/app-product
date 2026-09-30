<script setup>
import { computed, ref } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Plus, Pencil, ChevronDown, Search } from 'lucide-vue-next';

import { categoriaCriacaoSchema } from '@shared/schemas/categoria.schema.js';
import { categoriasApi } from '@/api/categorias.js';
import { ErroApi } from '@/api/cliente.js';
import { normalizarTexto } from '@/util/categorias.js';

import EstruturaApp from '@/componentes/EstruturaApp.vue';
import Botao from '@/componentes/base/Botao.vue';
import Campo from '@/componentes/base/Campo.vue';
import SelectPesquisavel from '@/componentes/base/SelectPesquisavel.vue';
import Modal from '@/componentes/base/Modal.vue';
import SubcategoriaLinha from '@/componentes/SubcategoriaLinha.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Vazio from '@/componentes/estado/Vazio.vue';
import Erro from '@/componentes/estado/Erro.vue';

const queryClient = useQueryClient();

const { data: categorias, isLoading, isError, refetch } = useQuery({
  queryKey: ['categorias', 'todos-admin'],
  queryFn: () => categoriasApi.listar({ situacao: 'todos' }),
});

// Cada categoria principal abre (sanfona) a lista das suas subcategorias, editáveis em linha.
const todasPrincipais = computed(() => {
  const lista = categorias.value ?? [];
  const raizes = lista.filter((c) => !c.categoria_pai_id);
  return raizes.map((raiz) => ({
    ...raiz,
    subcategorias: lista.filter((c) => c.categoria_pai_id === raiz.id),
  }));
});

const termoBusca = ref('');
const buscando = computed(() => termoBusca.value.trim() !== '');

// Na busca, a principal aparece se o nome dela ou de alguma subcategoria bater;
// se só subcategorias baterem, mostra apenas elas.
const categoriasPrincipais = computed(() => {
  const busca = normalizarTexto(termoBusca.value.trim());
  if (!busca) return todasPrincipais.value;

  return todasPrincipais.value
    .map((principal) => {
      if (normalizarTexto(principal.nome).includes(busca)) return principal;
      const subs = principal.subcategorias.filter((sub) => normalizarTexto(sub.nome).includes(busca));
      return subs.length ? { ...principal, subcategorias: subs } : null;
    })
    .filter(Boolean);
});

const opcoesPrincipais = computed(() => todasPrincipais.value.map((c) => ({ valor: c.id, texto: c.nome })));

const expandidas = ref({});
function estaExpandida(categoria) {
  return buscando.value || Boolean(expandidas.value[categoria.id]);
}
function alternarExpansao(categoria) {
  expandidas.value = { ...expandidas.value, [categoria.id]: !expandidas.value[categoria.id] };
}

// Cadastro rápido de subcategoria dentro da principal aberta
const novasSubcategorias = ref({}); // { [principalId]: nome }
const erroNovaSubcategoria = ref({});
const adicionandoEm = ref(null);

async function adicionarSubcategoria(principal) {
  const nomeNovo = (novasSubcategorias.value[principal.id] ?? '').trim();
  if (!nomeNovo) {
    erroNovaSubcategoria.value = { ...erroNovaSubcategoria.value, [principal.id]: 'Informe o nome da subcategoria' };
    return;
  }
  adicionandoEm.value = principal.id;
  erroNovaSubcategoria.value = { ...erroNovaSubcategoria.value, [principal.id]: '' };
  try {
    await categoriasApi.cadastrar({ nome: nomeNovo, categoria_pai_id: principal.id });
    novasSubcategorias.value = { ...novasSubcategorias.value, [principal.id]: '' };
    await queryClient.invalidateQueries({ queryKey: ['categorias'] });
  } catch (erro) {
    erroNovaSubcategoria.value = {
      ...erroNovaSubcategoria.value,
      [principal.id]: erro instanceof ErroApi ? erro.message : 'Não foi possível adicionar a subcategoria.',
    };
  } finally {
    adicionandoEm.value = null;
  }
}

const opcoesCategoriaPai = computed(() => [
  { valor: '', texto: 'Nenhuma (é uma categoria principal)' },
  // Na edição, a própria categoria não pode ser escolhida como principal dela mesma.
  ...(categorias.value ?? [])
    .filter((c) => !c.categoria_pai_id && c.id !== categoriaEmEdicao.value?.id)
    .map((c) => ({ valor: c.id, texto: c.nome })),
]);

// Modal de cadastro/edição
const modalAberto = ref(false);
const categoriaEmEdicao = ref(null); // null = cadastro; preenchida = edição
const enviando = ref(false);
const erroServidor = ref('');

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(categoriaCriacaoSchema),
  initialValues: { nome: '', categoria_pai_id: '' },
});
const [nome] = defineField('nome');
const [categoria_pai_id] = defineField('categoria_pai_id');

const tituloModal = computed(() => (categoriaEmEdicao.value ? 'Editar categoria' : 'Nova categoria'));

function abrirModalCadastro() {
  categoriaEmEdicao.value = null;
  resetForm({ values: { nome: '', categoria_pai_id: '' } });
  erroServidor.value = '';
  modalAberto.value = true;
}

function abrirModalEdicao(categoria) {
  categoriaEmEdicao.value = categoria;
  resetForm({ values: { nome: categoria.nome, categoria_pai_id: categoria.categoria_pai_id ?? '' } });
  erroServidor.value = '';
  modalAberto.value = true;
}

const aoEnviar = handleSubmit(async (valores) => {
  enviando.value = true;
  erroServidor.value = '';
  try {
    if (categoriaEmEdicao.value) {
      await categoriasApi.atualizar(categoriaEmEdicao.value.id, valores);
    } else {
      await categoriasApi.cadastrar(valores);
    }
    modalAberto.value = false;
    await queryClient.invalidateQueries({ queryKey: ['categorias'] });
  } catch (erro) {
    erroServidor.value = erro instanceof ErroApi ? erro.message : 'Não foi possível salvar a categoria.';
  } finally {
    enviando.value = false;
  }
});

</script>

<template>
  <EstruturaApp :trilha="[{ texto: 'Início', para: '/produtos' }, { texto: 'Categorias' }]">
    <template #acoes-topo>
      <Botao @click="abrirModalCadastro">
        <template #icone><Plus :size="18" /></template>
        Nova categoria
      </Botao>
    </template>

    <h1 class="pagina__titulo">Categorias</h1>
    <p class="pagina__descricao">
      Clique em uma categoria principal para abrir as subcategorias dela e editar o nome ou trocar a categoria
      principal de cada uma (RF15–RF17).
    </p>

    <div v-if="!isLoading && !isError && todasPrincipais.length" class="busca-categorias">
      <Search :size="16" class="busca-categorias__icone" aria-hidden="true" />
      <input
        v-model="termoBusca"
        type="search"
        aria-label="Pesquisar categoria ou subcategoria"
        placeholder="Pesquisar categoria ou subcategoria"
      />
    </div>

    <Carregando v-if="isLoading" />
    <Erro v-else-if="isError" mensagem="Não foi possível carregar as categorias." @repetir="refetch" />
    <Vazio
      v-else-if="todasPrincipais.length === 0"
      titulo="Nenhuma categoria cadastrada"
      texto-acao="Nova categoria"
      @acao="abrirModalCadastro"
    />
    <p v-else-if="categoriasPrincipais.length === 0" class="sem-resultado">
      Nenhuma categoria encontrada para "{{ termoBusca }}".
    </p>

    <div v-else class="lista-categorias">
      <article
        v-for="categoria in categoriasPrincipais"
        :key="categoria.id"
        class="categoria-card"
        :class="{ 'categoria-card--aberta': estaExpandida(categoria) }"
      >
        <header class="categoria-card__cabecalho">
          <button
            type="button"
            class="categoria-card__alternar"
            :aria-expanded="estaExpandida(categoria)"
            :aria-controls="`subcategorias-${categoria.id}`"
            @click="alternarExpansao(categoria)"
          >
            <ChevronDown :size="18" class="categoria-card__chevron" aria-hidden="true" />
            <span class="categoria-card__titulo-bloco">
              <span class="categoria-card__rotulo">Categoria principal</span>
              <span class="categoria-card__nome">{{ categoria.nome }}</span>
              <span class="categoria-card__contagem">
                {{ categoria.subcategorias.length === 0 ? 'Nenhuma subcategoria'
                  : categoria.subcategorias.length === 1 ? '1 subcategoria'
                  : `${categoria.subcategorias.length} subcategorias` }}
              </span>
            </span>
          </button>
          <div class="categoria-card__direita">
            <button class="categoria-card__acao" type="button" aria-label="Editar categoria" title="Editar categoria" @click="abrirModalEdicao(categoria)">
              <Pencil :size="16" />
            </button>
          </div>
        </header>

        <div v-if="estaExpandida(categoria)" :id="`subcategorias-${categoria.id}`" class="categoria-card__corpo">
          <ul v-if="categoria.subcategorias.length" class="lista-subcategorias">
            <SubcategoriaLinha
              v-for="sub in categoria.subcategorias"
              :key="sub.id"
              :subcategoria="sub"
              :opcoes-principais="opcoesPrincipais"
            />
          </ul>
          <p v-else class="categoria-card__sem-sub">Esta categoria ainda não tem subcategorias.</p>

          <form v-if="!buscando" class="nova-sub" novalidate @submit.prevent="adicionarSubcategoria(categoria)">
            <label :for="`nova-sub-${categoria.id}`" class="somente-leitor">Nova subcategoria em {{ categoria.nome }}</label>
            <input
              :id="`nova-sub-${categoria.id}`"
              v-model="novasSubcategorias[categoria.id]"
              class="nova-sub__input"
              type="text"
              maxlength="60"
              placeholder="Nome da nova subcategoria"
            />
            <Botao tipo="submit" variante="secundario" :carregando="adicionandoEm === categoria.id">
              <template #icone><Plus :size="16" /></template>
              Adicionar
            </Botao>
          </form>
          <p v-if="erroNovaSubcategoria[categoria.id]" class="modal-erro" role="alert">{{ erroNovaSubcategoria[categoria.id] }}</p>
        </div>
      </article>
    </div>

    <Modal v-if="modalAberto" :titulo="tituloModal" @fechar="modalAberto = false">
      <form id="form-categoria" novalidate @submit="aoEnviar">
        <div class="form-campos">
          <Campo id="nome-categoria" v-model="nome" rotulo="Nome da categoria" obrigatorio :erro="errors.nome" />
          <SelectPesquisavel
            id="categoria-pai"
            v-model="categoria_pai_id"
            rotulo="Categoria principal"
            placeholder="Nenhuma (é uma categoria principal)"
            texto-sem-resultado="Nenhuma categoria principal encontrada"
            :erro="errors.categoria_pai_id"
            :opcoes="opcoesCategoriaPai"
          />
        </div>
        <p v-if="erroServidor" class="modal-erro" role="alert">{{ erroServidor }}</p>
      </form>
      <template #rodape>
        <Botao variante="secundario" @click="modalAberto = false">Cancelar</Botao>
        <Botao tipo="submit" form="form-categoria" :carregando="enviando" @click="aoEnviar">Salvar</Botao>
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
  max-width: 640px;
}

.lista-categorias {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-4);
}

.categoria-card {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-card);
  padding: var(--espaco-5);
}

.categoria-card__cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-4);
  flex-wrap: wrap;
}

.categoria-card__rotulo {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cor-texto-terciario);
  margin-bottom: 2px;
}

.categoria-card__nome {
  display: block;
  font-size: 17px;
  font-weight: 700;
  color: var(--cor-texto-principal);
}

.categoria-card__direita {
  display: flex;
  align-items: center;
  gap: var(--espaco-2);
  flex-shrink: 0;
}

.categoria-card__acao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--raio-sm);
  background: transparent;
  border: none;
  color: var(--cor-texto-secundario);
  cursor: pointer;
}
.categoria-card__acao:hover {
  background: var(--cor-fundo-pagina);
  color: var(--cor-texto-principal);
}

.categoria-card__alternar {
  display: flex;
  align-items: center;
  gap: var(--espaco-3);
  flex: 1;
  min-width: 0;
  padding: 0;
  background: none;
  border: none;
  text-align: left;
  color: inherit;
  cursor: pointer;
}

.categoria-card__chevron {
  flex-shrink: 0;
  color: var(--cor-texto-secundario);
  transition: transform 0.15s ease;
  transform: rotate(-90deg);
}
.categoria-card--aberta .categoria-card__chevron {
  transform: rotate(0deg);
}

.categoria-card__titulo-bloco {
  min-width: 0;
}

.categoria-card__contagem {
  display: block;
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--cor-texto-secundario);
}

.categoria-card__alternar:hover .categoria-card__nome {
  color: var(--cor-texto-link);
}

.categoria-card__corpo {
  margin-top: var(--espaco-4);
  padding-top: var(--espaco-2);
  border-top: 1px solid var(--cor-borda);
}

.lista-subcategorias {
  list-style: none;
  margin: 0;
  padding: 0;
}

.categoria-card__sem-sub {
  padding: var(--espaco-3) 0;
  font-size: 13.5px;
  color: var(--cor-texto-terciario);
}

.nova-sub {
  display: flex;
  gap: var(--espaco-3);
  margin-top: var(--espaco-3);
}

.nova-sub__input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  font-size: 14px;
  color: var(--cor-texto-principal);
  background: var(--cor-superficie);
  border: 1px dashed var(--cor-borda-forte);
  border-radius: var(--raio-sm);
  outline: none;
}
.nova-sub__input:focus {
  border-style: solid;
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}

.busca-categorias {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 420px;
  margin-bottom: var(--espaco-4);
  padding: 0 12px;
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-md);
}
.busca-categorias:focus-within {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}
.busca-categorias__icone {
  flex-shrink: 0;
  color: var(--cor-texto-terciario);
}
.busca-categorias input {
  width: 100%;
  padding: 10px 0;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
}

.sem-resultado {
  padding: var(--espaco-5) 0;
  color: var(--cor-texto-secundario);
}

.form-campos {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-4);
}

.modal-erro {
  color: var(--cor-erro-texto);
  margin-top: var(--espaco-3);
}

@media (max-width: 560px) {
  .categoria-card {
    padding: var(--espaco-4);
  }
}
</style>
