<script setup>
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { Boxes } from 'lucide-vue-next';
import { usuarioLoginSchema } from '@shared/schemas/usuario.schema.js';
import { authApi } from '@/api/auth.js';
import { ErroApi } from '@/api/cliente.js';
import { useSessaoStore } from '@/stores/sessao.js';
import Campo from '@/componentes/base/Campo.vue';
import Botao from '@/componentes/base/Botao.vue';

const router = useRouter();
const route = useRoute();
const sessao = useSessaoStore();

const erroGeral = ref(
  route.query.sessaoExpirada ? 'Sua sessão expirou ou não é mais válida. Faça login novamente.' : ''
);
const enviando = ref(false);

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(usuarioLoginSchema),
  initialValues: { email: '', senha: '' },
});

const [email] = defineField('email');
const [senha] = defineField('senha');

const aoEnviar = handleSubmit(async (valores) => {
  erroGeral.value = '';
  enviando.value = true;
  try {
    const usuario = await authApi.login(valores);
    sessao.definirUsuario(usuario);
    const destino = route.query.redirecionarPara || '/produtos';
    router.push(destino);
  } catch (erro) {
    // RF30: mensagem genérica — não revela qual campo errou
    erroGeral.value = erro instanceof ErroApi ? erro.message : 'Não foi possível entrar. Tente novamente.';
  } finally {
    enviando.value = false;
  }
});
</script>

<template>
  <div class="pagina-auth">
    <div class="pagina-auth__card">
      <div class="pagina-auth__marca">
        <span class="pagina-auth__logo" aria-hidden="true"><Boxes :size="20" /></span>
        <span class="pagina-auth__marca-nome">Catálogo</span>
      </div>

      <h1 class="pagina-auth__titulo">Entrar</h1>
      <p class="pagina-auth__subtitulo">Acesse o cadastro central de produtos do SIGE.</p>

      <p v-if="erroGeral" class="pagina-auth__erro" role="alert" aria-live="polite">{{ erroGeral }}</p>

      <form class="pagina-auth__form" novalidate @submit="aoEnviar">
        <Campo id="email" v-model="email" rotulo="E-mail" tipo="email" obrigatorio :erro="errors.email" placeholder="voce@exemplo.com" />
        <Campo id="senha" v-model="senha" rotulo="Senha" tipo="password" obrigatorio :erro="errors.senha" placeholder="••••••••" />

        <Botao tipo="submit" :carregando="enviando" style="width: 100%; margin-top: 8px;">Entrar</Botao>
      </form>

      <p class="pagina-auth__rodape">
        Ainda não tem uma conta?
        <RouterLink to="/cadastro">Cadastre-se</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.pagina-auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-fundo-pagina);
  padding: var(--espaco-4);
}

.pagina-auth__card {
  width: 100%;
  max-width: 400px;
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-card);
  padding: var(--espaco-8) var(--espaco-6);
}

.pagina-auth__marca {
  display: flex;
  align-items: center;
  gap: var(--espaco-2);
  margin-bottom: var(--espaco-6);
}

.pagina-auth__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--cor-primaria);
  color: #fff;
}

.pagina-auth__marca-nome {
  font-weight: 700;
  font-size: 15px;
}

.pagina-auth__titulo {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pagina-auth__subtitulo {
  color: var(--cor-texto-secundario);
  font-size: 13.5px;
  margin-bottom: var(--espaco-5);
}

.pagina-auth__erro {
  background: var(--cor-erro-bg);
  border: 1px solid var(--cor-erro-borda);
  color: var(--cor-erro-texto);
  padding: 10px 12px;
  border-radius: var(--raio-md);
  font-size: 13.5px;
  margin-bottom: var(--espaco-4);
}

.pagina-auth__form {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-4);
}

.pagina-auth__rodape {
  margin-top: var(--espaco-5);
  text-align: center;
  font-size: 13.5px;
  color: var(--cor-texto-secundario);
}

.pagina-auth__rodape a {
  font-weight: 600;
}
</style>
