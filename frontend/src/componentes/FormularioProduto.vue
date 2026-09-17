<script setup>
import { computed, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useQuery } from '@tanstack/vue-query';
import { Info } from 'lucide-vue-next';

import { produtoCriacaoSchema, produtoAtualizacaoSchema } from '@shared/schemas/produto.schema.js';
import { categoriasApi } from '@/api/categorias.js';
import { unidadesApi } from '@/api/unidades.js';
import { ErroApi } from '@/api/cliente.js';

import Campo from '@/componentes/base/Campo.vue';
import Select from '@/componentes/base/Select.vue';
import Interruptor from '@/componentes/base/Interruptor.vue';
import Botao from '@/componentes/base/Botao.vue';

const props = defineProps({
  produto: { type: Object, default: null }, // null = cadastro (RF01); preenchido = edição (RF02)
  enviando: { type: Boolean, default: false },
  erroServidor: { type: Object, default: null }, // ErroApi
});
const emit = defineEmits(['enviar', 'cancelar']);

const modoEdicao = computed(() => Boolean(props.produto));

const { data: categorias } = useQuery({
  queryKey: ['categorias', 'ativo'],
  queryFn: () => categoriasApi.listar({ situacao: 'ativo' }),
});
const { data: unidades } = useQuery({
  queryKey: ['unidades-medida', 'ativo'],
  queryFn: () => unidadesApi.listar({ situacao: 'ativo' }),
});

const opcoesCategoria = computed(() => [
  { valor: '', texto: 'Selecione' },
  ...(categorias.value ?? []).map((c) => ({
    valor: c.id,
    texto: c.categoria_pai_nome ? `${c.categoria_pai_nome} > ${c.nome}` : c.nome,
  })),
]);
const opcoesUnidade = computed(() => [
  { valor: '', texto: 'Selecione' },
  ...(unidades.value ?? []).map((u) => ({ valor: u.id, texto: `${u.nome} (${u.sigla})` })),
]);

const valoresIniciais = props.produto
  ? {
      nome: props.produto.nome,
      descricao: props.produto.descricao ?? '',
      ean13: props.produto.ean13 ?? '',
      categoria_id: props.produto.categoria.id,
      unidade_medida_id: props.produto.unidade_medida.id,
      preco_custo: props.produto.preco_custo,
      preco_venda: props.produto.preco_venda,
      estoque: props.produto.estoque,
      ativo: props.produto.situacao === 'ativo',
    }
  : {
      nome: '', descricao: '', sku: '', ean13: '',
      categoria_id: '', unidade_medida_id: '',
      preco_custo: 0, preco_venda: '', estoque: 0, ativo: true,
    };

const schema = modoEdicao.value ? produtoAtualizacaoSchema : produtoCriacaoSchema;

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: valoresIniciais,
});

const [sku] = modoEdicao.value ? [ref(props.produto.sku)] : defineField('sku');
const [nome] = defineField('nome');
const [descricao] = defineField('descricao');
const [ean13] = defineField('ean13');
const [categoria_id] = defineField('categoria_id');
const [unidade_medida_id] = defineField('unidade_medida_id');
const [preco_custo] = defineField('preco_custo');
const [preco_venda] = defineField('preco_venda');
const [estoque] = defineField('estoque');
const [ativo] = defineField('ativo');

const aoEnviar = handleSubmit((valores) => {
  emit('enviar', valores);
});

const mensagemErroSku = computed(() => {
  if (!props.erroServidor) return '';
  return props.erroServidor.codigo === 'SKU_DUPLICADO' ? props.erroServidor.message : '';
});
</script>

<template>
  <form class="form-produto" novalidate @submit="aoEnviar">
    <section class="cartao secao">
      <h2 class="secao__titulo">Identificação</h2>

      <Campo id="nome" v-model="nome" rotulo="Nome do produto" obrigatorio :erro="errors.nome" placeholder="Ex.: Fone de Ouvido Bluetooth TWS Wave 100" />

      <Campo id="descricao" v-model="descricao" rotulo="Descrição do produto" multilinha :erro="errors.descricao" placeholder="Descreva as principais características do produto" />

      <div class="secao__grade-2">
        <Campo
          id="sku"
          v-model="sku"
          rotulo="SKU"
          :obrigatorio="!modoEdicao"
          :desabilitado="modoEdicao"
          :erro="errors.sku || mensagemErroSku"
          placeholder="Ex.: FON-88310"
          :ajuda="modoEdicao ? 'Código interno único. Não pode ser alterado depois de salvo.' : 'Código interno único. Não pode ser alterado depois de salvo.'"
        />
        <Campo id="ean13" v-model="ean13" rotulo="Código EAN-13" :erro="errors.ean13" placeholder="7891234567890" ajuda="13 dígitos. Deixe em branco se o produto não tiver código de barras." />
      </div>
    </section>

    <section class="cartao secao">
      <h2 class="secao__titulo">Classificação</h2>
      <div class="secao__grade-2">
        <Select id="categoria_id" v-model="categoria_id" rotulo="Categoria" obrigatorio :erro="errors.categoria_id" :opcoes="opcoesCategoria" />
        <Select id="unidade_medida_id" v-model="unidade_medida_id" rotulo="Unidade de medida" obrigatorio :erro="errors.unidade_medida_id" :opcoes="opcoesUnidade" />
      </div>
    </section>

    <section class="cartao secao">
      <h2 class="secao__titulo">Precificação</h2>
      <div class="secao__grade-2">
        <Campo id="preco_custo" v-model="preco_custo" tipo="number" prefixo="R$" rotulo="Preço de custo (R$)" :erro="errors.preco_custo" placeholder="0,00" />
        <Campo id="preco_venda" v-model="preco_venda" tipo="number" prefixo="R$" rotulo="Preço de venda (R$)" obrigatorio :erro="errors.preco_venda" placeholder="0,00" />
      </div>
      <div class="secao__grade-2">
        <Campo id="estoque" v-model="estoque" tipo="number" rotulo="Estoque" :erro="errors.estoque" ajuda="Quantidade informativa do cadastro; não há movimentação de estoque." />
      </div>
      <p class="aviso-info"><Info :size="16" /> Toda alteração de preço é registrada no histórico do produto.</p>
    </section>

    <section class="cartao secao">
      <h2 class="secao__titulo">Situação</h2>
      <Interruptor id="ativo" v-model="ativo" rotulo="Produto ativo" descricao="Produtos inativos não aparecem na listagem padrão do catálogo." />
    </section>

    <div class="cartao form-produto__rodape">
      <Botao variante="secundario" tipo="button" @click="$emit('cancelar')">Cancelar</Botao>
      <Botao tipo="submit" :carregando="enviando">{{ modoEdicao ? 'Salvar alterações' : 'Salvar produto' }}</Botao>
    </div>
  </form>
</template>

<style scoped>
.form-produto {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-5);
  max-width: 880px;
}

.cartao {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-card);
}

.secao {
  padding: var(--espaco-6);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-4);
}

.secao__titulo {
  font-size: 16px;
  font-weight: 700;
  padding-bottom: var(--espaco-3);
  border-bottom: 1px solid var(--cor-borda);
}

.secao__grade-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-4);
}

.aviso-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--cor-info-bg);
  color: var(--cor-info-texto);
  padding: 10px 14px;
  border-radius: var(--raio-md);
  font-size: 13px;
}

.form-produto__rodape {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaco-3);
  padding: var(--espaco-5);
}

@media (max-width: 640px) {
  .secao {
    padding: var(--espaco-4);
  }
  .secao__grade-2 {
    grid-template-columns: 1fr;
  }
  .form-produto__rodape {
    flex-direction: column-reverse;
  }
  .form-produto__rodape > * {
    width: 100%;
  }
}
</style>
