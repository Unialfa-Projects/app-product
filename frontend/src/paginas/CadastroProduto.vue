<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import { produtosApi } from '@/api/produtos.js';
import { ErroApi } from '@/api/cliente.js';
import EstruturaApp from '@/componentes/EstruturaApp.vue';
import FormularioProduto from '@/componentes/FormularioProduto.vue';

const router = useRouter();
const queryClient = useQueryClient();

const enviando = ref(false);
const erroServidor = ref(null);

async function aoEnviar(valores) {
  enviando.value = true;
  erroServidor.value = null;
  try {
    const produto = await produtosApi.cadastrar(valores);
    await queryClient.invalidateQueries({ queryKey: ['produtos'] });
    router.push({ path: `/produtos/${produto.id}`, query: { criado: '1' } }); // RF01: confirmação com o identificador gerado
  } catch (erro) {
    erroServidor.value = erro instanceof ErroApi ? erro : new ErroApi({ erro: 'Não foi possível salvar o produto.', codigo: 'ERRO_INTERNO' });
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <EstruturaApp :trilha="[{ texto: 'Início', para: '/produtos' }, { texto: 'Produtos', para: '/produtos' }, { texto: 'Novo produto' }]">
    <h1 class="pagina__titulo">Novo produto</h1>
    <p class="pagina__descricao">Cadastre as informações comerciais e fiscais básicas para disponibilizar no catálogo interno.</p>

    <p v-if="erroServidor && erroServidor.codigo !== 'SKU_DUPLICADO'" class="pagina__erro" role="alert">{{ erroServidor.message }}</p>

    <FormularioProduto :enviando="enviando" :erro-servidor="erroServidor" @enviar="aoEnviar" @cancelar="router.push('/produtos')" />
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
