<script setup>
import { computed, ref } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Plus, Power, Pencil } from 'lucide-vue-next';

import { categoriaCriacaoSchema } from '@shared/schemas/categoria.schema.js';
import { categoriasApi } from '@/api/categorias.js';
import { ErroApi } from '@/api/cliente.js';

import EstruturaApp from '@/componentes/EstruturaApp.vue';
import Botao from '@/componentes/base/Botao.vue';
import Campo from '@/componentes/base/Campo.vue';
import Select from '@/componentes/base/Select.vue';
import Badge from '@/componentes/base/Badge.vue';
import Modal from '@/componentes/base/Modal.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Vazio from '@/componentes/estado/Vazio.vue';
import Erro from '@/componentes/estado/Erro.vue';

const queryClient = useQueryClient();

const { data: categorias, isLoading, isError, refetch } = useQuery({
  queryKey: ['categorias', 'todos-admin'],
  queryFn: () => categoriasApi.listar({ situacao: 'todos' }),
});

// Só as categorias principais são geridas individualmente (editar/inativar).
// Subcategorias (ex.: "Cuidados Diários") são só um agrupamento informativo dentro da principal.
const categoriasPrincipais = computed(() => {
  const lista = categorias.value ?? [];
  const raizes = lista.filter((c) => !c.categoria_pai_id);
  return raizes.map((raiz) => ({
    ...raiz,
    subcategorias: lista.filter((c) => c.categoria_pai_id === raiz.id),
  }));
});

const opcoesCategoriaPai = computed(() => [
  { valor: '', texto: 'Nenhuma (é uma categoria principal)' },
  ...(categorias.value ?? []).filter((c) => !c.categoria_pai_id).map((c) => ({ valor: c.id, texto: c.nome })),
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

// Inativar / reativar (só categorias principais)
const categoriaParaAlternar = ref(null);
const alternando = ref(false);
const erroAlternancia = ref('');

async function confirmarAlternancia() {
  alternando.value = true;
  erroAlternancia.value = '';
  try {
    const categoria = categoriaParaAlternar.value;
    if (categoria.ativo) await categoriasApi.inativar(categoria.id);
    else await categoriasApi.reativar(categoria.id);
    categoriaParaAlternar.value = null;
    await queryClient.invalidateQueries({ queryKey: ['categorias'] });
  } catch (erro) {
    erroAlternancia.value = erro instanceof ErroApi ? erro.message : 'Não foi possível concluir a operação.';
  } finally {
    alternando.value = false;
  }
}
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
      Cada categoria principal organiza o catálogo; as subcategorias abaixo dela são só um agrupamento informativo,
      sem cadastro próprio (RF15–RF18).
    </p>

    <Carregando v-if="isLoading" />
    <Erro v-else-if="isError" mensagem="Não foi possível carregar as categorias." @repetir="refetch" />
    <Vazio
      v-else-if="categoriasPrincipais.length === 0"
      titulo="Nenhuma categoria cadastrada"
      texto-acao="Nova categoria"
      @acao="abrirModalCadastro"
    />

    <div v-else class="lista-categorias">
      <article v-for="categoria in categoriasPrincipais" :key="categoria.id" class="categoria-card">
        <header class="categoria-card__cabecalho">
          <div class="categoria-card__titulo-bloco">
            <p class="categoria-card__rotulo">Categoria principal</p>
            <h2 class="categoria-card__nome">{{ categoria.nome }}</h2>
          </div>
          <div class="categoria-card__direita">
            <Badge :situacao="categoria.ativo ? 'ativo' : 'inativo'" />
            <button class="categoria-card__acao" type="button" aria-label="Editar categoria" @click="abrirModalEdicao(categoria)">
              <Pencil :size="16" />
            </button>
            <button
              class="categoria-card__acao"
              type="button"
              :aria-label="categoria.ativo ? 'Inativar categoria' : 'Reativar categoria'"
              @click="categoriaParaAlternar = categoria"
            >
              <Power :size="16" />
            </button>
          </div>
        </header>

        <div v-if="categoria.subcategorias.length" class="categoria-card__subcategorias">
          <span class="categoria-card__subcategorias-rotulo">Subcategorias:</span>
          <span
            v-for="sub in categoria.subcategorias"
            :key="sub.id"
            class="chip-subcategoria"
            :class="{ 'chip-subcategoria--inativa': !sub.ativo }"
          >
            {{ sub.nome }}<template v-if="!sub.ativo"> (inativa)</template>
          </span>
        </div>
      </article>
    </div>

    <Modal v-if="modalAberto" :titulo="tituloModal" @fechar="modalAberto = false">
      <form id="form-categoria" novalidate @submit="aoEnviar">
        <div class="form-campos">
          <Campo id="nome-categoria" v-model="nome" rotulo="Nome da categoria" obrigatorio :erro="errors.nome" />
          <Select id="categoria-pai" v-model="categoria_pai_id" rotulo="Categoria principal" :erro="errors.categoria_pai_id" :opcoes="opcoesCategoriaPai" />
        </div>
        <p v-if="erroServidor" class="modal-erro" role="alert">{{ erroServidor }}</p>
      </form>
      <template #rodape>
        <Botao variante="secundario" @click="modalAberto = false">Cancelar</Botao>
        <Botao tipo="submit" form="form-categoria" :carregando="enviando" @click="aoEnviar">Salvar</Botao>
      </template>
    </Modal>

    <Modal v-if="categoriaParaAlternar" :titulo="categoriaParaAlternar.ativo ? 'Inativar categoria' : 'Reativar categoria'" @fechar="categoriaParaAlternar = null">
      <p>Tem certeza que deseja {{ categoriaParaAlternar.ativo ? 'inativar' : 'reativar' }} <strong>{{ categoriaParaAlternar.nome }}</strong>?</p>
      <p v-if="erroAlternancia" class="modal-erro" role="alert">{{ erroAlternancia }}</p>
      <template #rodape>
        <Botao variante="secundario" @click="categoriaParaAlternar = null">Cancelar</Botao>
        <Botao :variante="categoriaParaAlternar.ativo ? 'perigo' : 'primario'" :carregando="alternando" @click="confirmarAlternancia">
          {{ categoriaParaAlternar.ativo ? 'Inativar' : 'Reativar' }}
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
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-4);
  flex-wrap: wrap;
}

.categoria-card__rotulo {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cor-texto-terciario);
  margin-bottom: 2px;
}

.categoria-card__nome {
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

.categoria-card__subcategorias {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--espaco-4);
  padding-top: var(--espaco-4);
  border-top: 1px solid var(--cor-borda);
}

.categoria-card__subcategorias-rotulo {
  font-size: 12.5px;
  color: var(--cor-texto-terciario);
  font-weight: 600;
  margin-right: 2px;
}

.chip-subcategoria {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--cor-fundo-pagina);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-principal);
  font-size: 12.5px;
  font-weight: 500;
}

.chip-subcategoria--inativa {
  color: var(--cor-texto-terciario);
  border-style: dashed;
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
