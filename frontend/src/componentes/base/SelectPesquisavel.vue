<script setup>
import { computed, nextTick, ref } from 'vue';
import { normalizarTexto } from '@/util/categorias.js';

const props = defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, default: '' },
  obrigatorio: { type: Boolean, default: false },
  erro: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  opcoes: { type: Array, required: true }, // [{ valor, texto, nivel?, rotuloCurto? }]
  placeholder: { type: String, default: 'Selecione' },
  textoSemResultado: { type: String, default: 'Nenhum resultado' },
});
const emit = defineEmits(['update:modelValue']);

const aberto = ref(false);
const termo = ref('');
const indiceAtivo = ref(-1);
const entrada = ref(null);
const lista = ref(null);

const idLista = computed(() => `${props.id}-lista`);

const opcaoSelecionada = computed(() =>
  props.opcoes.find((o) => String(o.valor) === String(props.modelValue)) ?? null
);

const opcoesFiltradas = computed(() => {
  const busca = normalizarTexto(termo.value.trim());
  if (!busca) return props.opcoes;
  return props.opcoes.filter((o) => normalizarTexto(o.texto).includes(busca));
});

const valorExibido = computed(() => (aberto.value ? termo.value : opcaoSelecionada.value?.texto ?? ''));

function abrir() {
  if (aberto.value) return;
  aberto.value = true;
  termo.value = '';
  const indiceSelecionado = props.opcoes.findIndex((o) => String(o.valor) === String(props.modelValue));
  indiceAtivo.value = indiceSelecionado;
  nextTick(rolarParaAtivo);
}

function fechar() {
  aberto.value = false;
  termo.value = '';
  indiceAtivo.value = -1;
}

function selecionar(opcao) {
  emit('update:modelValue', opcao.valor);
  fechar();
}

function aoDigitar(evento) {
  termo.value = evento.target.value;
  aberto.value = true;
  indiceAtivo.value = opcoesFiltradas.value.length ? 0 : -1;
}

function mover(passo) {
  if (!aberto.value) return abrir();
  const total = opcoesFiltradas.value.length;
  if (!total) return;
  indiceAtivo.value = (indiceAtivo.value + passo + total) % total;
  nextTick(rolarParaAtivo);
}

function confirmar() {
  if (!aberto.value) return abrir();
  const opcao = opcoesFiltradas.value[indiceAtivo.value];
  if (opcao) selecionar(opcao);
}

function rolarParaAtivo() {
  lista.value?.querySelector('[data-ativo="true"]')?.scrollIntoView({ block: 'nearest' });
}

function alternar() {
  if (aberto.value) fechar();
  else {
    entrada.value?.focus();
    abrir();
  }
}
</script>

<template>
  <div class="select-pesquisavel">
    <label :for="id" class="select-pesquisavel__rotulo">
      {{ rotulo }}
      <span v-if="obrigatorio" aria-hidden="true" class="select-pesquisavel__obrigatorio">*</span>
    </label>

    <div
      class="select-pesquisavel__wrapper"
      :class="{ 'select-pesquisavel__wrapper--erro': erro, 'select-pesquisavel__wrapper--aberto': aberto }"
    >
      <input
        :id="id"
        ref="entrada"
        class="select-pesquisavel__input"
        type="text"
        role="combobox"
        autocomplete="off"
        :value="valorExibido"
        :placeholder="aberto ? (opcaoSelecionada?.texto ?? 'Digite para pesquisar') : placeholder"
        :aria-expanded="aberto"
        :aria-controls="idLista"
        :aria-activedescendant="aberto && indiceAtivo >= 0 ? `${id}-opcao-${indiceAtivo}` : undefined"
        :aria-invalid="Boolean(erro)"
        @focus="abrir"
        @click="abrir"
        @input="aoDigitar"
        @blur="fechar"
        @keydown.down.prevent="mover(1)"
        @keydown.up.prevent="mover(-1)"
        @keydown.enter.prevent="confirmar"
        @keydown.esc="fechar"
      />
      <button
        type="button"
        class="select-pesquisavel__seta"
        tabindex="-1"
        :aria-label="aberto ? 'Fechar lista' : 'Abrir lista'"
        @mousedown.prevent="alternar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <ul v-if="aberto" :id="idLista" ref="lista" class="select-pesquisavel__lista" role="listbox">
        <li
          v-for="(opcao, indice) in opcoesFiltradas"
          :id="`${id}-opcao-${indice}`"
          :key="opcao.valor"
          role="option"
          class="select-pesquisavel__opcao"
          :class="{
            'select-pesquisavel__opcao--sub': opcao.nivel === 1 && !termo,
            'select-pesquisavel__opcao--ativa': indice === indiceAtivo,
            'select-pesquisavel__opcao--selecionada': String(opcao.valor) === String(modelValue),
          }"
          :data-ativo="indice === indiceAtivo"
          :aria-selected="String(opcao.valor) === String(modelValue)"
          @mousedown.prevent="selecionar(opcao)"
          @mousemove="indiceAtivo = indice"
        >
          {{ opcao.nivel === 1 && !termo && opcao.rotuloCurto ? opcao.rotuloCurto : opcao.texto }}
        </li>
        <li v-if="opcoesFiltradas.length === 0" class="select-pesquisavel__vazio">{{ textoSemResultado }}</li>
      </ul>
    </div>

    <p v-if="erro" class="select-pesquisavel__mensagem" aria-live="polite">{{ erro }}</p>
  </div>
</template>

<style scoped>
.select-pesquisavel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.select-pesquisavel__rotulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--cor-texto-principal);
}

.select-pesquisavel__obrigatorio {
  color: var(--cor-erro-texto);
}

.select-pesquisavel__wrapper {
  position: relative;
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-md);
  background: var(--cor-superficie);
}

.select-pesquisavel__wrapper:focus-within {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}

.select-pesquisavel__wrapper--erro {
  border-color: var(--cor-erro-texto);
}

.select-pesquisavel__input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  color: var(--cor-texto-principal);
  text-overflow: ellipsis;
}

.select-pesquisavel__seta {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  padding: 6px;
  background: none;
  border: none;
  color: var(--cor-texto-secundario);
  cursor: pointer;
}
.select-pesquisavel__wrapper--aberto .select-pesquisavel__seta svg {
  transform: rotate(180deg);
}

.select-pesquisavel__lista {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  box-shadow: var(--sombra-flutuante);
}

.select-pesquisavel__opcao {
  padding: 8px 10px;
  border-radius: var(--raio-sm);
  font-size: 14px;
  color: var(--cor-texto-principal);
  cursor: pointer;
}

.select-pesquisavel__opcao--sub {
  padding-left: 26px;
  color: var(--cor-texto-secundario);
}

.select-pesquisavel__opcao--ativa {
  background: var(--cor-fundo-pagina);
}

.select-pesquisavel__opcao--selecionada {
  font-weight: 600;
  color: var(--cor-primaria);
}

.select-pesquisavel__vazio {
  padding: 8px 10px;
  font-size: 13.5px;
  color: var(--cor-texto-terciario);
}

.select-pesquisavel__mensagem {
  font-size: 12.5px;
  color: var(--cor-erro-texto);
}
</style>
