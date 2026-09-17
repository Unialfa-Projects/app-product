<script setup>
import { computed, ref } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Plus, Pencil } from 'lucide-vue-next';

import { unidadeMedidaCriacaoSchema } from '@shared/schemas/unidade-medida.schema.js';
import { unidadesApi } from '@/api/unidades.js';
import { ErroApi } from '@/api/cliente.js';

import EstruturaApp from '@/componentes/EstruturaApp.vue';
import Botao from '@/componentes/base/Botao.vue';
import Campo from '@/componentes/base/Campo.vue';
import Badge from '@/componentes/base/Badge.vue';
import Modal from '@/componentes/base/Modal.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Vazio from '@/componentes/estado/Vazio.vue';
import Erro from '@/componentes/estado/Erro.vue';

const queryClient = useQueryClient();

const { data: unidades, isLoading, isError, refetch } = useQuery({
  queryKey: ['unidades-medida', 'todos-admin'],
  queryFn: () => unidadesApi.listar({ situacao: 'todos' }),
});

const modalAberto = ref(false);
const unidadeEmEdicao = ref(null); // null = cadastro; preenchida = edição
const enviando = ref(false);
const erroServidor = ref('');

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(unidadeMedidaCriacaoSchema),
  initialValues: { nome: '', sigla: '', descricao: '', casas_decimais: 0 },
});
const [nome] = defineField('nome');
const [sigla] = defineField('sigla');
const [descricao] = defineField('descricao');
const [casas_decimais] = defineField('casas_decimais');

const tituloModal = computed(() => (unidadeEmEdicao.value ? 'Editar unidade de medida' : 'Nova unidade de medida'));

function abrirModalCadastro() {
  unidadeEmEdicao.value = null;
  resetForm({ values: { nome: '', sigla: '', descricao: '', casas_decimais: 0 } });
  erroServidor.value = '';
  modalAberto.value = true;
}

function abrirModalEdicao(unidade) {
  unidadeEmEdicao.value = unidade;
  resetForm({
    values: {
      nome: unidade.nome,
      sigla: unidade.sigla,
      descricao: unidade.descricao ?? '',
      casas_decimais: unidade.casas_decimais,
    },
  });
  erroServidor.value = '';
  modalAberto.value = true;
}

const aoEnviar = handleSubmit(async (valores) => {
  enviando.value = true;
  erroServidor.value = '';
  try {
    if (unidadeEmEdicao.value) {
      await unidadesApi.atualizar(unidadeEmEdicao.value.id, valores);
    } else {
      await unidadesApi.cadastrar(valores);
    }
    modalAberto.value = false;
    await queryClient.invalidateQueries({ queryKey: ['unidades-medida'] });
  } catch (erro) {
    erroServidor.value = erro instanceof ErroApi ? erro.message : 'Não foi possível salvar a unidade de medida.';
  } finally {
    enviando.value = false;
  }
});
</script>

<template>
  <EstruturaApp :trilha="[{ texto: 'Início', para: '/produtos' }, { texto: 'Unidades de medida' }]">
    <template #acoes-topo>
      <Botao @click="abrirModalCadastro">
        <template #icone><Plus :size="18" /></template>
        Nova unidade
      </Botao>
    </template>

    <h1 class="pagina__titulo">Unidades de medida</h1>
    <p class="pagina__descricao">Unidades utilizadas para quantificar os produtos do catálogo (RF19, RF20).</p>

    <section class="cartao">
      <Carregando v-if="isLoading" />
      <Erro v-else-if="isError" mensagem="Não foi possível carregar as unidades de medida." @repetir="refetch" />
      <Vazio v-else-if="(unidades ?? []).length === 0" titulo="Nenhuma unidade cadastrada" texto-acao="Nova unidade" @acao="abrirModalCadastro" />

      <div v-else class="tabela-wrapper">
        <table class="tabela">
          <thead>
            <tr>
              <th>Sigla</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Casas decimais</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unidade in unidades" :key="unidade.id">
              <td class="tabela__sigla">{{ unidade.sigla }}</td>
              <td>{{ unidade.nome }}</td>
              <td>{{ unidade.descricao ?? '—' }}</td>
              <td>{{ unidade.casas_decimais }}</td>
              <td><Badge :situacao="unidade.ativo ? 'ativo' : 'inativo'" /></td>
              <td>
                <button class="tabela__acao" type="button" aria-label="Editar unidade" @click="abrirModalEdicao(unidade)">
                  <Pencil :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Modal v-if="modalAberto" :titulo="tituloModal" @fechar="modalAberto = false">
      <form id="form-unidade" novalidate @submit="aoEnviar">
        <div class="form-campos">
          <Campo id="nome-unidade" v-model="nome" rotulo="Nome" obrigatorio :erro="errors.nome" placeholder="Ex.: Quilograma" />
          <Campo id="sigla-unidade" v-model="sigla" rotulo="Sigla" obrigatorio :erro="errors.sigla" placeholder="Ex.: KG" />
          <Campo id="descricao-unidade" v-model="descricao" rotulo="Descrição" :erro="errors.descricao" placeholder="Opcional" />
          <Campo
            id="casas-decimais-unidade"
            v-model="casas_decimais"
            tipo="number"
            rotulo="Casas decimais"
            :erro="errors.casas_decimais"
            ajuda="Ex.: 3 para quilograma (1,250 kg), 0 para unidade (1 un)."
          />
        </div>
        <p v-if="erroServidor" class="modal-erro" role="alert">{{ erroServidor }}</p>
      </form>
      <template #rodape>
        <Botao variante="secundario" @click="modalAberto = false">Cancelar</Botao>
        <Botao tipo="submit" form="form-unidade" :carregando="enviando" @click="aoEnviar">Salvar</Botao>
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

.tabela-wrapper {
  overflow-x: auto;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
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
}

.tabela tbody td {
  padding: var(--espaco-4);
  border-bottom: 1px solid var(--cor-borda);
  font-size: 13.5px;
}
.tabela tbody tr:last-child td {
  border-bottom: none;
}

.tabela__sigla {
  font-family: var(--fonte-mono);
  font-weight: 700;
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

.form-campos {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-4);
}

.modal-erro {
  color: var(--cor-erro-texto);
  margin-top: var(--espaco-3);
}
</style>
