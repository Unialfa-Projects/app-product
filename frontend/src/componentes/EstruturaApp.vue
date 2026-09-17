<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './Sidebar.vue';
import BottomNav from './BottomNav.vue';
import TopBar from './TopBar.vue';
import ModalPerfil from './ModalPerfil.vue';

defineProps({
  trilha: { type: Array, required: true },
});

const sidebarRecolhida = ref(false);
const modalPerfilAberto = ref(false);

onMounted(() => {
  // Notebook (1024–1439px) começa recolhida por padrão, como no design; o usuário pode alternar.
  const preferencia = localStorage.getItem('sige.sidebarRecolhida');
  if (preferencia !== null) {
    sidebarRecolhida.value = preferencia === 'true';
  } else {
    sidebarRecolhida.value = window.matchMedia('(max-width: 1439px)').matches;
  }
});

function alternarSidebar() {
  sidebarRecolhida.value = !sidebarRecolhida.value;
  localStorage.setItem('sige.sidebarRecolhida', String(sidebarRecolhida.value));
}
</script>

<template>
  <div class="estrutura-app">
    <Sidebar :recolhida="sidebarRecolhida" @alternar="alternarSidebar" @abrir-perfil="modalPerfilAberto = true" />

    <div class="estrutura-app__conteudo">
      <TopBar :trilha="trilha">
        <template #acoes>
          <slot name="acoes-topo" />
        </template>
      </TopBar>

      <main class="estrutura-app__main">
        <slot />
      </main>
    </div>

    <BottomNav @abrir-perfil="modalPerfilAberto = true" />

    <ModalPerfil v-if="modalPerfilAberto" @fechar="modalPerfilAberto = false" />
  </div>
</template>

<style scoped>
.estrutura-app {
  display: flex;
  min-height: 100vh;
  background: var(--cor-fundo-pagina);
}

.estrutura-app__conteudo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.estrutura-app__main {
  flex: 1;
  padding: var(--espaco-6);
  padding-bottom: calc(var(--espaco-6) + var(--altura-bottomnav));
}

@media (min-width: 1024px) {
  .estrutura-app__main {
    padding-bottom: var(--espaco-6);
  }
}

@media (max-width: 640px) {
  .estrutura-app__main {
    padding: var(--espaco-4);
    padding-bottom: calc(var(--espaco-4) + var(--altura-bottomnav));
  }
}
</style>
