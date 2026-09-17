<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { produtosApi } from '@/api/produtos.js';
import { ErroApi } from '@/api/cliente.js';
import EstruturaApp from '@/componentes/EstruturaApp.vue';
import FormularioProduto from '@/componentes/FormularioProduto.vue';
import Carregando from '@/componentes/estado/Carregando.vue';
import Erro from '@/componentes/estado/Erro.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const queryClient = useQueryClient();

const { data: produto, isLoading, isError, refetch } = useQuery({
  queryKey: ['produto', props.id],
  queryFn: () => produtosApi.buscarPorId(props.id),
});

const enviando = ref(false);
const erroServidor = ref(null);

async function aoEnviar(valores) {
  enviando.value = true;
  erroServidor.value = null;
  try {
    await produtosApi.atualizar(props.id, valores);
    await queryClient.invalidateQueries({ queryKey: ['produtos'] });
    await queryClient.invalidateQueries({ queryKey: ['produto', props.id] });
    router.push(`/produtos/${props.id}`);
  } catch (erro) {
    erroServidor.value = erro instanceof ErroApi ? erro : new ErroApi({ erro: 'Não foi possível salvar as alterações.', codigo: 'ERRO_INTERNO' });
  } finally {
    enviando.value = false;
  }
}

const trilha = computed(() => [
  { texto: 'Início', para: '/produtos' },
  { texto: 'Produtos', para: '/produtos' },
  { texto: produto.value?.nome ?? 'Editar produto' },
]);
</script>

<template>
  <EstruturaApp :trilha="trilha">
    <Carregando v-if="isLoading" />
    <Erro v-else-if="isError" mensagem="Não foi possível carregar o produto." @repetir="refetch" />

    <template v-else>
      <h1 class="pagina__titulo">Editar produto</h1>
      <p class="pagina__descricao">Atualize as informações cadastrais. Alterações de preço geram novo registro no histórico.</p>

      <p v-if="erroServidor" class="pagina__erro" role="alert">{{ erroServidor.message }}</p>

      <FormularioProduto :produto="produto" :enviando="enviando" :erro-servidor="erroServidor" @enviar="aoEnviar" @cancelar="router.push(`/produtos/${id}`)" />
    </template>
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
.pagina__erro {
  background: var(--cor-erro-bg);
  border: 1px solid var(--cor-erro-borda);
  color: var(--cor-erro-texto);
  padding: 10px 14px;
  border-radius: var(--raio-md);
  font-size: 13.5px;
  margin-bottom: var(--espaco-4);
  max-width: 880px;
}
</style>
