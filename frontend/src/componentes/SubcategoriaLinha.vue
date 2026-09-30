<script setup>
import { computed, ref, watch } from 'vue';
import { Check, RotateCcw } from 'lucide-vue-next';
import { useQueryClient } from '@tanstack/vue-query';

import { categoriasApi } from '@/api/categorias.js';
import { ErroApi } from '@/api/cliente.js';
import SelectPesquisavel from '@/componentes/base/SelectPesquisavel.vue';

// RF16 — edição em linha de uma subcategoria: nome e categoria principal à qual pertence.
const props = defineProps({
  subcategoria: { type: Object, required: true },
  opcoesPrincipais: { type: Array, required: true }, // [{ valor, texto }]
});

const queryClient = useQueryClient();

const nome = ref(props.subcategoria.nome);
const categoriaPaiId = ref(props.subcategoria.categoria_pai_id);
const salvando = ref(false);
const erro = ref('');

// Quando a lista é recarregada do servidor, reflete o valor salvo.
watch(
  () => [props.subcategoria.nome, props.subcategoria.categoria_pai_id],
  ([novoNome, novoPai]) => {
    nome.value = novoNome;
    categoriaPaiId.value = novoPai;
  }
);

const camposAlterados = computed(() => {
  const campos = {};
  if (nome.value.trim() !== props.subcategoria.nome) campos.nome = nome.value.trim();
  if (Number(categoriaPaiId.value) !== props.subcategoria.categoria_pai_id) campos.categoria_pai_id = Number(categoriaPaiId.value);
  return campos;
});
const alterado = computed(() => Object.keys(camposAlterados.value).length > 0);

function descartar() {
  nome.value = props.subcategoria.nome;
  categoriaPaiId.value = props.subcategoria.categoria_pai_id;
  erro.value = '';
}

async function salvar() {
  if (!alterado.value || salvando.value) return;
  if (!nome.value.trim()) {
    erro.value = 'Informe o nome da subcategoria';
    return;
  }
  if (nome.value.trim().length > 60) {
    erro.value = 'O nome deve ter no máximo 60 caracteres';
    return;
  }

  salvando.value = true;
  erro.value = '';
  try {
    await categoriasApi.atualizar(props.subcategoria.id, camposAlterados.value);
    await queryClient.invalidateQueries({ queryKey: ['categorias'] });
  } catch (e) {
    erro.value = e instanceof ErroApi ? e.message : 'Não foi possível salvar a subcategoria.';
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <li class="sub-linha">
    <form class="sub-linha__form" novalidate @submit.prevent="salvar">
      <div class="sub-linha__campo sub-linha__campo--nome">
        <label :for="`sub-nome-${subcategoria.id}`" class="sub-linha__rotulo">Nome</label>
        <input
          :id="`sub-nome-${subcategoria.id}`"
          v-model="nome"
          class="sub-linha__input"
          :class="{ 'sub-linha__input--erro': erro }"
          type="text"
          maxlength="60"
          @keydown.esc="descartar"
        />
      </div>

      <SelectPesquisavel
        :id="`sub-pai-${subcategoria.id}`"
        v-model="categoriaPaiId"
        class="sub-linha__pai"
        rotulo="Categoria principal"
        texto-sem-resultado="Nenhuma categoria principal encontrada"
        :opcoes="opcoesPrincipais"
      />

      <div class="sub-linha__acoes">
        <template v-if="alterado">
          <button class="sub-linha__botao sub-linha__botao--salvar" type="submit" :disabled="salvando">
            <Check :size="15" /> {{ salvando ? 'Salvando…' : 'Salvar' }}
          </button>
          <button class="sub-linha__botao" type="button" aria-label="Descartar alterações" title="Descartar alterações" @click="descartar">
            <RotateCcw :size="15" />
          </button>
        </template>
      </div>
    </form>
    <p v-if="erro" class="sub-linha__erro" role="alert">{{ erro }}</p>
  </li>
</template>

<style scoped>
.sub-linha {
  padding: var(--espaco-3) 0;
  border-bottom: 1px solid var(--cor-borda);
}
.sub-linha:last-child {
  border-bottom: none;
}

.sub-linha__form {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.5fr) auto;
  gap: var(--espaco-3);
  align-items: end;
}

.sub-linha__campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.sub-linha__rotulo {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--cor-texto-terciario);
}

.sub-linha__input {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  color: var(--cor-texto-principal);
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda-forte);
  border-radius: var(--raio-sm);
  outline: none;
}
.sub-linha__input:focus {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(47, 95, 224, 0.15);
}
.sub-linha__input--erro {
  border-color: var(--cor-erro-texto);
}

.sub-linha__acoes {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
}

.sub-linha__botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--raio-sm);
  background: transparent;
  border: none;
  color: var(--cor-texto-secundario);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.sub-linha__botao:hover {
  background: var(--cor-fundo-pagina);
  color: var(--cor-texto-principal);
}
.sub-linha__botao--salvar {
  background: var(--cor-primaria);
  color: var(--cor-primaria-texto);
}
.sub-linha__botao--salvar:hover {
  background: var(--cor-primaria-hover);
  color: var(--cor-primaria-texto);
}
.sub-linha__botao:disabled {
  opacity: 0.6;
  cursor: wait;
}

.sub-linha__pai :deep(.select-pesquisavel__rotulo) {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--cor-texto-terciario);
}
.sub-linha__pai :deep(.select-pesquisavel__wrapper) {
  border-radius: var(--raio-sm);
}
.sub-linha__pai :deep(.select-pesquisavel__input) {
  padding-top: 8px;
  padding-bottom: 8px;
}
.sub-linha__pai {
  gap: 4px;
}

.sub-linha__erro {
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--cor-erro-texto);
}

@media (max-width: 640px) {
  .sub-linha__form {
    grid-template-columns: 1fr;
  }
}
</style>
